import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { CERTIFICATE_FEE_RUPEES, createCashfreeOrder } from '@/lib/payments/cashfree';

export const runtime = 'nodejs';

function getAccessToken(request: Request) {
  const authorization = request.headers.get('authorization');
  return authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
}

function normalizeIndianPhone(phone: string | null | undefined) {
  let digits = phone?.replace(/\D/g, '') || '';
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return /^\d{10}$/.test(digits) ? digits : null;
}

export async function POST(request: Request) {
  const accessToken = getAccessToken(request);
  if (!accessToken) {
    return NextResponse.json({ error: 'Please sign in before paying.' }, { status: 401 });
  }

  if (
    !process.env.CASHFREE_CLIENT_ID ||
    !process.env.CASHFREE_CLIENT_SECRET ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !process.env.NEXT_PUBLIC_SITE_URL
  ) {
    return NextResponse.json({ error: 'Sandbox payment processing is not configured.' }, { status: 503 });
  }

  try {
    const supabase = createServerSupabaseClient(accessToken);
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({ error: 'Your session has expired. Please sign in again.' }, { status: 401 });
    }
    if (!user.email) {
      return NextResponse.json({ error: 'A verified email is required to start payment.' }, { status: 400 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, phone, role')
      .eq('id', user.id)
      .maybeSingle();
    if (profileError) throw profileError;
    if (profile?.role !== 'student') {
      return NextResponse.json({ error: 'Only authenticated students can pay the certificate fee.' }, { status: 403 });
    }

    const phone = normalizeIndianPhone(profile?.phone);
    if (!phone) {
      return NextResponse.json(
        { error: 'Add a valid 10-digit phone number to your profile before paying.' },
        { status: 400 }
      );
    }

    const serviceSupabase = createServiceRoleSupabaseClient();
    const { data: completedPayments, error: paymentLookupError } = await serviceSupabase
      .from('payments')
      .select('id')
      .eq('student_id', user.id)
      .eq('purpose', 'Certificate fee')
      .in('provider', ['cashfree', 'razorpay'])
      .eq('status', 'Completed')
      .not('provider_payment_id', 'is', null)
      .limit(1);
    if (paymentLookupError) throw paymentLookupError;
    if (completedPayments?.length) {
      return NextResponse.json({ error: 'The certificate fee has already been paid.' }, { status: 409 });
    }

    const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL);
    if (!['http:', 'https:'].includes(siteUrl.protocol)) {
      return NextResponse.json({ error: 'The site URL is not configured correctly.' }, { status: 503 });
    }

    const orderId = `IJ-${randomUUID().replace(/-/g, '')}`;
    const returnUrl = `${new URL('/dashboard/payments', siteUrl).toString()}?order_id={order_id}`;

    const order = await createCashfreeOrder(orderId, {
      id: user.id.replace(/-/g, ''),
      name: profile?.full_name || user.user_metadata?.full_name || 'InternJourneys student',
      email: user.email,
      phone,
    }, returnUrl);

    if (order.order_id !== orderId || !order.payment_session_id) {
      throw new Error('Cashfree returned an invalid order response.');
    }

    const { error: insertError } = await serviceSupabase.from('payments').insert({
      student_id: user.id,
      amount: CERTIFICATE_FEE_RUPEES,
      currency: 'INR',
      purpose: 'Certificate fee',
      provider: 'cashfree',
      provider_order_id: orderId,
      status: 'Pending',
    });
    if (insertError) throw insertError;

    return NextResponse.json({
      orderId,
      paymentSessionId: order.payment_session_id,
    });
  } catch (error) {
    console.error('Could not create Cashfree certificate payment order:', error);
    return NextResponse.json({ error: 'Could not start payment. Please try again.' }, { status: 500 });
  }
}
