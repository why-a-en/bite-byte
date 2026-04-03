'use client';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { motion } from 'motion/react';

// Module level — called once, never inside a component (Pitfall 4 prevention)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripePaymentFormProps {
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (message: string) => void;
  returnUrl: string; // Used as return_url for redirect-based payment methods
}

export function StripePaymentForm({
  clientSecret,
  onSuccess,
  onError,
  returnUrl,
}: StripePaymentFormProps) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm onSuccess={onSuccess} onError={onError} returnUrl={returnUrl} />
    </Elements>
  );
}

interface PaymentFormProps {
  onSuccess: (id: string) => void;
  onError: (msg: string) => void;
  returnUrl: string;
}

function PaymentForm({ onSuccess, onError, returnUrl }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: 'if_required', // Cards confirm in-place; wallets may redirect
    });

    if (error) {
      onError(error.message ?? 'Payment failed. Please try again.');
      setLoading(false);
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id);
      // setLoading left as true — parent navigates away
    } else {
      // Unexpected state (e.g. requires_action handled by Stripe)
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <motion.button
        type="submit"
        disabled={loading || !stripe || !elements}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-primary text-white py-3 rounded-2xl font-semibold disabled:opacity-50 cursor-pointer transition-colors hover:bg-primary/90"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </motion.button>
    </form>
  );
}
