import { createHmac, timingSafeEqual } from 'node:crypto';

const CASHFREE_API_BASE_URL = 'https://sandbox.cashfree.com/pg';
const CASHFREE_API_VERSION = '2023-08-01';

export const CERTIFICATE_FEE_RUPEES = 199;

export interface CashfreeOrder {
  order_id: string;
  order_amount: number;
  order_currency: string;
  order_status: string;
}

export interface CashfreePayment {
  cf_payment_id: string | number;
  order_id: string;
  payment_status: string;
  payment_amount: number;
  payment_currency: string;
}

export interface CashfreeCredentials {
  clientId: string;
  clientSecret: string;
}

export function getCashfreeCredentials(): CashfreeCredentials {
  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Cashfree sandbox credentials are not configured.');
  }

  return { clientId, clientSecret };
}

async function cashfreeRequest<T>(path: string): Promise<T> {
  const { clientId, clientSecret } = getCashfreeCredentials();
  const response = await fetch(`${CASHFREE_API_BASE_URL}${path}`, {
    headers: {
      'x-api-version': CASHFREE_API_VERSION,
      'x-client-id': clientId,
      'x-client-secret': clientSecret,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Cashfree API request failed with status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

export function createCashfreeOrder(
  orderId: string,
  customer: { id: string; name: string; email: string; phone: string },
  returnUrl: string
) {
  const { clientId, clientSecret } = getCashfreeCredentials();

  return fetch(`${CASHFREE_API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'x-api-version': CASHFREE_API_VERSION,
      'x-client-id': clientId,
      'x-client-secret': clientSecret,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      order_id: orderId,
      order_amount: CERTIFICATE_FEE_RUPEES,
      order_currency: 'INR',
      customer_details: {
        customer_id: customer.id,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
      },
      order_meta: { return_url: returnUrl },
      order_note: 'Internship completion certificate fee',
    }),
    cache: 'no-store',
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Cashfree order creation failed with status ${response.status}.`);
    }
    return response.json() as Promise<{ order_id: string; payment_session_id: string }>;
  });
}

export function fetchCashfreeOrder(orderId: string) {
  return cashfreeRequest<CashfreeOrder>(`/orders/${encodeURIComponent(orderId)}`);
}

export function fetchCashfreeOrderPayments(orderId: string) {
  return cashfreeRequest<CashfreePayment[]>(`/orders/${encodeURIComponent(orderId)}/payments`);
}

export function isValidCashfreeWebhookSignature(
  rawBody: string,
  timestamp: string,
  signature: string,
  secret: string
) {
  if (!timestamp || !signature || !secret) return false;

  const expected = createHmac('sha256', secret)
    .update(`${timestamp}${rawBody}`)
    .digest();
  const supplied = Buffer.from(signature, 'base64');

  return (
    supplied.length === expected.length &&
    supplied.toString('base64') === signature &&
    timingSafeEqual(supplied, expected)
  );
}

export function isValidCashfreeOrder(order: CashfreeOrder, expectedOrderId: string) {
  return (
    order.order_id === expectedOrderId &&
    order.order_amount === CERTIFICATE_FEE_RUPEES &&
    order.order_currency === 'INR'
  );
}

export function findSuccessfulCashfreePayment(
  order: CashfreeOrder,
  payments: CashfreePayment[],
  expectedOrderId: string
) {
  if (order.order_status !== 'PAID' || !isValidCashfreeOrder(order, expectedOrderId)) {
    return null;
  }

  return payments.find((payment) => (
    String(payment.cf_payment_id).length > 0 &&
    payment.order_id === expectedOrderId &&
    payment.payment_status === 'SUCCESS' &&
    payment.payment_amount === CERTIFICATE_FEE_RUPEES &&
    payment.payment_currency === 'INR'
  )) || null;
}

export function findFailedCashfreePayment(
  order: CashfreeOrder,
  payments: CashfreePayment[],
  expectedOrderId: string,
  paymentId: string
) {
  if (!isValidCashfreeOrder(order, expectedOrderId)) return null;

  return payments.find((payment) => (
    String(payment.cf_payment_id) === paymentId &&
    payment.order_id === expectedOrderId &&
    ['FAILED', 'USER_DROPPED'].includes(payment.payment_status) &&
    payment.payment_amount === CERTIFICATE_FEE_RUPEES &&
    payment.payment_currency === 'INR'
  )) || null;
}

export function getPaymentCompletionAction(
  currentStatus: string,
  currentPaymentId: string | null,
  verifiedPaymentId: string
): 'complete' | 'already-completed' | 'conflict' {
  if (currentStatus === 'Refunded') return 'conflict';
  if (currentStatus !== 'Completed') return 'complete';
  return currentPaymentId === verifiedPaymentId ? 'already-completed' : 'conflict';
}
