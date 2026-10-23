import { NextResponse } from 'next/server';
import { createServiceRoleSupabaseClient, createServerSupabaseClient } from '@/lib/supabase/server';
import {
  fetchCashfreeOrder,
  fetchCashfreeOrderPayments,
  findSuccessfulCashfreePayment,
  getPaymentCompletionAction,
} from '@/lib/payments/cashfree';

export const runtime = 'nodejs';

function getAccessToken(request: Request) {
  const authorization = request.headers.get('authorization');
  return authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
}

export async function POST(request: Request) {
  const accessToken = getAccessToken(request);
  if (!accessToken) {
    return NextResponse.json({ error: 'Please sign in before verifying payment.' }, { status: 401 });
  }

  if (
    !process.env.CASHFREE_CLIENT_ID ||
    !process.env.CASHFREE_CLIENT_SECRET ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json({ error: 'Sandbox payment processing is not configured.' }, { status: 503 });
  }

  try {
    const body = await request.json() as { orderId?: unknown };
    if (typeof body.orderId !== 'string' || !body.orderId) {
      return NextResponse.json({ error: 'A Cashfree order ID is required.' }, { status: 400 });
    }

    const userClient = createServerSupabaseClient(accessToken);
    const { data: { user }, error: authError } = await userClient.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({ error: 'Your session has expired. Please sign in again.' }, { status: 401 });
    }

    const serviceClient = createServiceRoleSupabaseClient();
    const { data: paymentRecord, error: paymentError } = await serviceClient
      .from('payments')
      .select('id, amount, currency, purpose, provider, provider_order_id, provider_payment_id, status')
      .eq('student_id', user.id)
      .eq('provider', 'cashfree')
      .eq('provider_order_id', body.orderId)
      .maybeSingle();
    if (paymentError) throw paymentError;
    if (!paymentRecord) {
      return NextResponse.json({ error: 'Payment order not found.' }, { status: 404 });
    }
    if (
      paymentRecord.amount !== 199 ||
      paymentRecord.currency !== 'INR' ||
      paymentRecord.purpose !== 'Certificate fee'
    ) {
      return NextResponse.json({ error: 'This order is not eligible for certificate payment.' }, { status: 400 });
    }
    if (paymentRecord.status === 'Refunded') {
      return NextResponse.json({ error: 'This payment order has been refunded.' }, { status: 409 });
    }

    const [order, cashfreePayments] = await Promise.all([
      fetchCashfreeOrder(body.orderId),
      fetchCashfreeOrderPayments(body.orderId),
    ]);
    const verifiedPayment = findSuccessfulCashfreePayment(order, cashfreePayments, body.orderId);
    if (!verifiedPayment) {
      return NextResponse.json({ error: 'Cashfree has not confirmed a successful ₹199 payment yet.' }, { status: 409 });
    }

    const paymentId = String(verifiedPayment.cf_payment_id);
    const completionAction = getPaymentCompletionAction(
      paymentRecord.status,
      paymentRecord.provider_payment_id,
      paymentId
    );
    if (completionAction === 'conflict') {
      return NextResponse.json({ error: 'This order is already linked to another payment.' }, { status: 409 });
    }
    if (completionAction === 'already-completed') {
      return NextResponse.json({ success: true });
    }

    const { error: completionError } = await serviceClient.rpc('complete_certificate_payment', {
      p_order_id: body.orderId,
      p_payment_id: paymentId,
    });
    if (completionError) throw completionError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Could not verify Cashfree certificate payment:', error);
    return NextResponse.json({ error: 'Could not confirm payment. Please contact support if you were charged.' }, { status: 500 });
  }
}
