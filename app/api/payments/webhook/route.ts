import { NextResponse } from 'next/server';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import {
  fetchCashfreeOrder,
  fetchCashfreeOrderPayments,
  findFailedCashfreePayment,
  findSuccessfulCashfreePayment,
  getPaymentCompletionAction,
  isValidCashfreeOrder,
  isValidCashfreeWebhookSignature,
} from '@/lib/payments/cashfree';

export const runtime = 'nodejs';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  const secret = process.env.CASHFREE_WEBHOOK_SECRET;
  if (!secret || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Payment webhook is not configured.' }, { status: 503 });
  }

  const rawBody = await request.text();
  const timestamp = request.headers.get('x-webhook-timestamp') || '';
  const signature = request.headers.get('x-webhook-signature') || '';
  if (!isValidCashfreeWebhookSignature(rawBody, timestamp, signature, secret)) {
    return NextResponse.json({ error: 'Invalid Cashfree webhook signature.' }, { status: 401 });
  }

  let event: unknown;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 });
  }
  if (!isRecord(event) || typeof event.type !== 'string' || !isRecord(event.data)) {
    return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 });
  }

  if (!event.type.startsWith('PAYMENT_')) return NextResponse.json({ received: true });

  const order = event.data.order;
  const payment = event.data.payment;
  if (
    !isRecord(order) ||
    !isRecord(payment) ||
    typeof order.order_id !== 'string' ||
    (typeof payment.cf_payment_id !== 'string' && typeof payment.cf_payment_id !== 'number')
  ) {
    return NextResponse.json({ error: 'Invalid payment webhook payload.' }, { status: 400 });
  }

  const orderId = order.order_id;
  const paymentId = String(payment.cf_payment_id);

  try {
    const serviceClient = createServiceRoleSupabaseClient();
    const { data: paymentRecord, error: lookupError } = await serviceClient
      .from('payments')
      .select('id, amount, currency, purpose, provider, provider_order_id, provider_payment_id, status')
      .eq('provider', 'cashfree')
      .eq('provider_order_id', orderId)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (!paymentRecord) return NextResponse.json({ received: true });
    if (
      paymentRecord.amount !== 199 ||
      paymentRecord.currency !== 'INR' ||
      paymentRecord.purpose !== 'Certificate fee'
    ) {
      return NextResponse.json({ error: 'Payment record does not match the certificate fee.' }, { status: 400 });
    }
    if (paymentRecord.status === 'Refunded') return NextResponse.json({ received: true });

    const [cashfreeOrder, cashfreePayments] = await Promise.all([
      fetchCashfreeOrder(orderId),
      fetchCashfreeOrderPayments(orderId),
    ]);

    if (event.type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const verifiedPayment = findSuccessfulCashfreePayment(cashfreeOrder, cashfreePayments, orderId);
      if (!verifiedPayment || String(verifiedPayment.cf_payment_id) !== paymentId) {
        return NextResponse.json({ error: 'Cashfree has not confirmed this successful payment.' }, { status: 409 });
      }

      const action = getPaymentCompletionAction(
        paymentRecord.status,
        paymentRecord.provider_payment_id,
        paymentId
      );
      if (action === 'conflict') {
        return NextResponse.json({ error: 'This order is already linked to another payment.' }, { status: 409 });
      }
      if (action === 'already-completed') return NextResponse.json({ received: true });

      const { error: completionError } = await serviceClient.rpc('complete_certificate_payment', {
        p_order_id: orderId,
        p_payment_id: paymentId,
      });
      if (completionError) throw completionError;
      return NextResponse.json({ received: true });
    }

    if (event.type === 'PAYMENT_FAILED_WEBHOOK' || event.type === 'PAYMENT_USER_DROPPED_WEBHOOK') {
      if (
        !isValidCashfreeOrder(cashfreeOrder, orderId) ||
        !findFailedCashfreePayment(cashfreeOrder, cashfreePayments, orderId, paymentId)
      ) {
        return NextResponse.json({ error: 'Cashfree has not confirmed this failed payment.' }, { status: 409 });
      }

      const { error: failureError } = await serviceClient.rpc('mark_certificate_payment_failed', {
        p_order_id: orderId,
        p_payment_id: paymentId,
      });
      if (failureError) throw failureError;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Could not process Cashfree payment webhook:', error);
    return NextResponse.json({ error: 'Could not process payment webhook. Cashfree may retry.' }, { status: 500 });
  }
}
