import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import {
  findFailedCashfreePayment,
  findSuccessfulCashfreePayment,
  getPaymentCompletionAction,
  isValidCashfreeWebhookSignature,
  type CashfreeOrder,
  type CashfreePayment,
} from '../lib/payments/cashfree';

const paidOrder: CashfreeOrder = {
  order_id: 'IJ-test-order',
  order_amount: 199,
  order_currency: 'INR',
  order_status: 'PAID',
};

const successfulPayment: CashfreePayment = {
  cf_payment_id: 'cf-payment-123',
  order_id: paidOrder.order_id,
  payment_status: 'SUCCESS',
  payment_amount: 199,
  payment_currency: 'INR',
};

test('does not accept a forged browser success response as provider confirmation', () => {
  const forgedBrowserResponse = {
    success: true,
    payment_status: 'SUCCESS',
    razorpay_payment_id: 'forged-payment-id',
  };

  assert.equal(
    findSuccessfulCashfreePayment(
      forgedBrowserResponse as unknown as CashfreeOrder,
      [],
      paidOrder.order_id
    ),
    null
  );
});

test('rejects Cashfree orders or payments with an incorrect amount', () => {
  assert.equal(
    findSuccessfulCashfreePayment(
      { ...paidOrder, order_amount: 198 },
      [successfulPayment],
      paidOrder.order_id
    ),
    null
  );
  assert.equal(
    findSuccessfulCashfreePayment(
      paidOrder,
      [{ ...successfulPayment, payment_amount: 198 }],
      paidOrder.order_id
    ),
    null
  );
});

test('verifies webhook signatures against the exact raw body and timestamp', () => {
  const rawBody = '{"type":"PAYMENT_SUCCESS_WEBHOOK"}';
  const timestamp = '1780000000';
  const secret = 'sandbox-webhook-secret';
  const signature = createHmac('sha256', secret).update(`${timestamp}${rawBody}`).digest('base64');

  assert.equal(isValidCashfreeWebhookSignature(rawBody, timestamp, signature, secret), true);
  assert.equal(isValidCashfreeWebhookSignature(rawBody, timestamp, 'invalid-signature', secret), false);
  assert.equal(isValidCashfreeWebhookSignature(`${rawBody} `, timestamp, signature, secret), false);
});

test('treats duplicate successful webhook events as idempotent', () => {
  assert.equal(
    getPaymentCompletionAction('Completed', 'cf-payment-123', 'cf-payment-123'),
    'already-completed'
  );
  assert.equal(
    getPaymentCompletionAction('Completed', 'cf-payment-123', 'another-payment'),
    'conflict'
  );
  assert.equal(
    getPaymentCompletionAction('Failed', null, 'cf-payment-123'),
    'complete'
  );
  assert.equal(
    getPaymentCompletionAction('Refunded', 'cf-payment-123', 'cf-payment-123'),
    'conflict'
  );
});

test('does not accept a failed payment as successful and recognizes verified failures', () => {
  const failedOrder = { ...paidOrder, order_status: 'ACTIVE' };
  const failedPayment: CashfreePayment = {
    ...successfulPayment,
    payment_status: 'FAILED',
  };

  assert.equal(findSuccessfulCashfreePayment(failedOrder, [failedPayment], paidOrder.order_id), null);
  assert.equal(
    findFailedCashfreePayment(failedOrder, [failedPayment], paidOrder.order_id, 'cf-payment-123'),
    failedPayment
  );
});
