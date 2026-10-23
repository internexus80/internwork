'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardNavbar } from '@/components/layout/DashboardNavbar';
import { ArrowLeft, ArrowRight, CreditCard, IndianRupee, Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase/client';

interface CashfreeOrderResponse {
  orderId: string;
  paymentSessionId: string;
}

interface CashfreeCheckout {
  checkout(options: {
    paymentSessionId: string;
    redirectTarget: '_modal';
  }): Promise<unknown>;
}

declare global {
  interface Window {
    Cashfree?: (options: { mode: 'sandbox' }) => CashfreeCheckout;
  }
}

function loadCashfreeCheckout() {
  if (window.Cashfree) return Promise.resolve(true);

  return new Promise<boolean>((resolve) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-cashfree-checkout]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(Boolean(window.Cashfree)), { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.dataset.cashfreeCheckout = 'true';
    script.onload = () => resolve(Boolean(window.Cashfree));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function verifyPayment(orderId: string, accessToken: string) {
  const response = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderId }),
  });
  const result = await response.json() as { error?: string };
  if (!response.ok) throw new Error(result.error || 'Cashfree has not confirmed payment yet.');
}

export default function PaymentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const returnVerificationStarted = useRef(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const orderId = new URLSearchParams(window.location.search).get('order_id');
    if (!orderId || returnVerificationStarted.current) return;
    returnVerificationStarted.current = true;

    const verifyReturnedOrder = async () => {
      setProcessing(true);
      setError('');
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) throw new Error('Please sign in again to confirm your payment.');
        await verifyPayment(orderId, session.access_token);
        setMessage('Payment confirmed. Checking your certificate eligibility...');
        router.replace('/dashboard/certifications');
        router.refresh();
      } catch (verificationError) {
        setError(verificationError instanceof Error ? verificationError.message : 'Could not confirm payment.');
      } finally {
        setProcessing(false);
      }
    };

    void verifyReturnedOrder();
  }, [router]);

  const startPayment = async () => {
    setProcessing(true);
    setError('');
    setMessage('');

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error('Please sign in again to continue.');

      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const order = await orderResponse.json() as CashfreeOrderResponse & { error?: string };
      if (!orderResponse.ok) throw new Error(order.error || 'Could not start payment.');

      const scriptLoaded = await loadCashfreeCheckout();
      if (!scriptLoaded || !window.Cashfree) {
        throw new Error('Payment checkout could not be loaded. Please try again.');
      }

      const cashfree = window.Cashfree({ mode: 'sandbox' });
      await cashfree.checkout({
        paymentSessionId: order.paymentSessionId,
        redirectTarget: '_modal',
      });

      await verifyPayment(order.orderId, session.access_token);

      setMessage('Payment confirmed. Checking your certificate eligibility...');
      router.replace('/dashboard/certifications');
      router.refresh();
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : 'Could not confirm payment.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-900 font-sans flex flex-col antialiased">
      <DashboardNavbar />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="max-w-3xl space-y-6">
          <Link href="/dashboard/certifications" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to certificate</span>
          </Link>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900">Certificate payment</h1>
                  <p className="text-sm text-slate-500">Secure sandbox checkout powered by Cashfree</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <p className="text-sm font-bold text-slate-900">Internship completion certificate</p>
                  <p className="mt-1 text-xs text-slate-500">One-time certificate processing fee</p>
                </div>
                <p className="flex shrink-0 items-center text-2xl font-extrabold text-slate-900">
                  <IndianRupee className="h-5 w-5" />199
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">Preview and download become available after server verification of payment and all required internship tasks.</p>
              </div>
              <p className="text-xs leading-5 text-slate-500">
                By continuing, you acknowledge our <Link href="/terms-and-conditions" className="font-semibold text-indigo-600 hover:underline">Terms & Conditions</Link> and <Link href="/refund-policy" className="font-semibold text-indigo-600 hover:underline">Refund Policy</Link>. Read our <Link href="/privacy-policy" className="font-semibold text-indigo-600 hover:underline">Privacy Policy</Link>.
              </p>

              {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
              {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{message}</p>}

              <button
                type="button"
                onClick={startPayment}
                disabled={processing}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
              >
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <IndianRupee className="h-4 w-4" />}
                <span>{processing ? 'Processing...' : `Pay ₹199${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}</span>
                {!processing && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
