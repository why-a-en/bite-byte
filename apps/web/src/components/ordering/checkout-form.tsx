'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { fetchPublicApi } from '@/lib/api-public';
import { toast } from 'sonner';
import { StripePaymentForm } from './stripe-payment-form';

type PaymentChoice = 'STRIPE' | 'PAY_AT_COUNTER';

interface Props {
  venue: {
    id: string;
    name: string;
    slug: string;
    paymentMode: 'PREPAY_REQUIRED' | 'PAY_AT_COUNTER' | 'BOTH';
  };
}

interface OrderResponse {
  id: string;
  referenceCode: string;
  status: string;
  totalAmount: string;
}

interface PaymentIntentResponse {
  clientSecret: string;
}

function defaultPaymentChoice(
  paymentMode: Props['venue']['paymentMode'],
): PaymentChoice {
  if (paymentMode === 'PAY_AT_COUNTER') return 'PAY_AT_COUNTER';
  return 'STRIPE'; // PREPAY_REQUIRED or BOTH defaults to STRIPE
}

export function CheckoutForm({ venue }: Props) {
  const router = useRouter();
  const { items, clearCart, total, hydrated } = useCart(venue.slug);

  const [customerName, setCustomerName] = useState('');
  const [paymentChoice, setPaymentChoice] = useState<PaymentChoice>(
    defaultPaymentChoice(venue.paymentMode),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Phase A — create order (both payment methods use this)
  async function handleCreateOrder(): Promise<OrderResponse> {
    if (!customerName.trim()) {
      throw new Error('Please enter your name');
    }
    if (items.length === 0) {
      throw new Error('Your cart is empty');
    }

    const order: OrderResponse = await fetchPublicApi(
      `/public/venues/${venue.slug}/orders`,
      {
        method: 'POST',
        body: JSON.stringify({
          customerName: customerName.trim(),
          paymentMethod: paymentChoice,
          items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
        }),
      },
    );

    // Persist order ID to localStorage so customer can return to status page (ORDR-10)
    try {
      localStorage.setItem(
        `lastOrder:${venue.slug}`,
        JSON.stringify({ orderId: order.id, referenceCode: order.referenceCode }),
      );
    } catch {
      // localStorage full or disabled — non-fatal
    }

    return order;
  }

  // Phase B (PAC) — create order then navigate directly
  async function handlePACSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const order = await handleCreateOrder();
      clearCart();
      router.push(`/menu/${venue.slug}/order/${order.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to place order';
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  }

  // Phase B (Stripe) — create order then fetch clientSecret to show Payment Element
  async function handleStripeInitiate(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // CRITICAL ORDER SEQUENCE (INFR-02 + Pitfall 1):
      // 1. Create Order in PENDING_PAYMENT state first
      // 2. Then create PaymentIntent with orderId in metadata
      // NEVER create order after payment confirms
      const order = await handleCreateOrder();
      setOrderId(order.id);

      const pi: PaymentIntentResponse = await fetchPublicApi(
        `/public/venues/${venue.slug}/orders/${order.id}/payment-intent`,
        { method: 'POST' },
      );
      setClientSecret(pi.clientSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initiate payment';
      setError(message);
      toast.error(message);
      setLoading(false);
    }
    // Note: loading stays true until Stripe form renders — intentional
  }

  function handlePaymentSuccess(_paymentIntentId: string) {
    clearCart();
    router.push(`/menu/${venue.slug}/order/${orderId}`);
  }

  function handlePaymentError(message: string) {
    setError(message);
    setLoading(false);
  }

  // Show loading skeleton until cart is hydrated from localStorage
  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  // If clientSecret is set, show Stripe Payment Element instead of the initiate button
  if (clientSecret && orderId) {
    const returnUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/menu/${venue.slug}/order/${orderId}`;
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Paying for order from <strong>{venue.name}</strong></p>
          <p className="text-lg font-semibold mt-1">Total: £{total.toFixed(2)}</p>
        </div>
        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}
        <StripePaymentForm
          clientSecret={clientSecret}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          returnUrl={returnUrl}
        />
      </div>
    );
  }

  const isPACFlow = paymentChoice === 'PAY_AT_COUNTER';

  return (
    <form
      onSubmit={isPACFlow ? handlePACSubmit : handleStripeInitiate}
      className="space-y-6"
    >
      {/* Customer name */}
      <div>
        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
          Your name <span className="text-red-500">*</span>
        </label>
        <input
          id="customerName"
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Enter your name"
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Payment method choice — only shown for BOTH venues */}
      {venue.paymentMode === 'BOTH' && (
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-2">Payment method</p>
          <div className="space-y-3">
            <label
              className={`flex items-center gap-3 cursor-pointer border rounded-xl p-4 transition-colors ${
                paymentChoice === 'STRIPE'
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="paymentChoice"
                value="STRIPE"
                checked={paymentChoice === 'STRIPE'}
                onChange={() => setPaymentChoice('STRIPE')}
                className="w-4 h-4"
              />
              <span className="text-base">Pay now (card / Apple Pay / Google Pay)</span>
            </label>
            <label
              className={`flex items-center gap-3 cursor-pointer border rounded-xl p-4 transition-colors ${
                paymentChoice === 'PAY_AT_COUNTER'
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="paymentChoice"
                value="PAY_AT_COUNTER"
                checked={paymentChoice === 'PAY_AT_COUNTER'}
                onChange={() => setPaymentChoice('PAY_AT_COUNTER')}
                className="w-4 h-4"
              />
              <span className="text-base">Pay at counter</span>
            </label>
          </div>
        </div>
      )}

      {/* Cart summary (read-only) */}
      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Your cart is empty.</p>
          <a href={`/menu/${venue.slug}`} className="text-black underline text-sm mt-2 inline-block">
            Go back to menu
          </a>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-sm text-gray-700">Order Summary</h2>
          </div>
          <ul className="divide-y divide-gray-100">
            {items.map((item) => (
              <li key={item.menuItemId} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm">
                  {item.name}
                  <span className="text-gray-500 ml-1">x{item.quantity}</span>
                </span>
                <span className="text-sm font-medium">
                  £{(parseFloat(item.price) * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
            <span className="font-semibold">Total</span>
            <span className="font-bold">£{total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* PAC instructions */}
      {isPACFlow && items.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-4">
          <p className="text-sm font-medium text-blue-900">Pay when you collect your order</p>
          <p className="text-sm text-blue-700 mt-1">
            Place your order now and pay at the counter when your order is ready.
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {/* Submit button */}
      {items.length > 0 && (
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-4 text-lg rounded-xl font-semibold disabled:opacity-50 cursor-pointer"
        >
          {loading
            ? 'Processing...'
            : isPACFlow
              ? 'Place Order'
              : 'Proceed to Payment'}
        </button>
      )}
    </form>
  );
}
