'use client';

import { motion } from 'motion/react';

type PhoneMockupVariant = 'menu' | 'qr' | 'order';

interface PhoneMockupProps {
  variant?: PhoneMockupVariant;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Menu screen content                                                */
/* ------------------------------------------------------------------ */
function MenuScreen() {
  const items = [
    { name: 'Smash Burger', price: '$12.90', color: 'bg-orange-400' },
    { name: 'Truffle Fries', price: '$8.50', color: 'bg-amber-400' },
    { name: 'Iced Matcha', price: '$6.00', color: 'bg-emerald-400' },
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-b-[2rem] overflow-hidden">
      {/* Venue header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 pt-3 pb-4">
        <p className="text-[10px] text-orange-100 font-medium">Downtown</p>
        <p className="text-sm font-bold text-white tracking-tight">
          The Rustic Kitchen
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 px-3 py-2 border-b border-gray-100">
        <span className="text-[9px] font-semibold text-orange-600 bg-orange-50 rounded-full px-2.5 py-0.5">
          Mains
        </span>
        <span className="text-[9px] font-medium text-gray-400 px-2.5 py-0.5">
          Sides
        </span>
        <span className="text-[9px] font-medium text-gray-400 px-2.5 py-0.5">
          Drinks
        </span>
      </div>

      {/* Items */}
      <div className="flex-1 px-3 py-2 space-y-2.5 overflow-hidden">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-2.5 p-2 rounded-xl border border-gray-100 bg-gray-50/50"
          >
            <div
              className={`w-10 h-10 rounded-lg ${item.color} flex-shrink-0 flex items-center justify-center`}
            >
              <div className="w-5 h-5 rounded-full bg-white/30" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-gray-800 truncate">
                {item.name}
              </p>
              <p className="text-[9px] text-gray-400">{item.price}</p>
            </div>
            <button className="bg-orange-500 text-white text-[8px] font-bold rounded-lg px-2 py-1 flex-shrink-0">
              ADD
            </button>
          </div>
        ))}
      </div>

      {/* Cart bar */}
      <div className="mx-3 mb-3 bg-orange-500 rounded-xl px-3 py-2 flex items-center justify-between">
        <div>
          <p className="text-[9px] text-orange-100">2 items</p>
          <p className="text-xs font-bold text-white">$21.40</p>
        </div>
        <span className="text-[9px] font-bold text-white bg-white/20 rounded-lg px-2.5 py-1">
          View Cart
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  QR screen content                                                  */
/* ------------------------------------------------------------------ */
function QrScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-950 rounded-b-[2rem] relative overflow-hidden">
      {/* Camera viewfinder grid lines */}
      <div className="absolute inset-8 border border-white/10 rounded-2xl" />

      {/* Scan frame corners */}
      <div className="relative w-32 h-32">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-orange-500 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-orange-500 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-orange-500 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-orange-500 rounded-br-lg" />

        {/* QR code pattern */}
        <div className="absolute inset-4 grid grid-cols-5 grid-rows-5 gap-1 p-2">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-sm ${
                [0, 1, 2, 5, 6, 10, 12, 14, 18, 19, 20, 22, 23, 24].includes(
                  i
                )
                  ? 'bg-white'
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Scanning line */}
        <motion.div
          className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent"
          animate={{ top: ['10%', '90%', '10%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <p className="text-white/70 text-[10px] font-medium mt-6">
        Point camera at QR code
      </p>
      <div className="flex items-center gap-1.5 mt-2">
        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
        <p className="text-orange-400 text-[9px] font-semibold">Scanning...</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Order confirmation screen                                          */
/* ------------------------------------------------------------------ */
function OrderScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white rounded-b-[2rem] px-5">
      {/* Success checkmark */}
      <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-emerald-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
        Order Confirmed
      </p>
      <p className="text-lg font-bold text-gray-900 mb-4">ORDR-7X4K</p>

      {/* Item summary */}
      <div className="w-full space-y-1.5 mb-4">
        <div className="flex justify-between text-[10px]">
          <span className="text-gray-600">1x Smash Burger</span>
          <span className="font-medium text-gray-800">$12.90</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-gray-600">1x Truffle Fries</span>
          <span className="font-medium text-gray-800">$8.50</span>
        </div>
        <div className="h-px bg-gray-100 my-1" />
        <div className="flex justify-between text-[11px] font-bold">
          <span className="text-gray-800">Total</span>
          <span className="text-orange-600">$21.40</span>
        </div>
      </div>

      {/* Status badge */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 text-center">
        <p className="text-[9px] text-orange-500 font-medium mb-0.5">
          Estimated wait
        </p>
        <p className="text-sm font-bold text-orange-600">8-12 min</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Phone frame                                                        */
/* ------------------------------------------------------------------ */
export function PhoneMockup({
  variant = 'menu',
  className = '',
}: PhoneMockupProps) {
  return (
    <div
      className={`relative w-64 h-[500px] ${className}`}
      aria-hidden="true"
    >
      {/* Glow effect */}
      <div className="absolute -inset-4 rounded-[3rem] bg-orange-500/10 blur-2xl pointer-events-none" />

      {/* Phone bezel */}
      <div className="relative w-full h-full rounded-[2.5rem] bg-gray-900 p-2.5 shadow-2xl shadow-gray-900/30 border border-gray-700/50">
        {/* Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-900 rounded-b-2xl z-20 flex items-center justify-center">
          <div className="w-12 h-3 bg-gray-800 rounded-full" />
        </div>

        {/* Screen area */}
        <div className="w-full h-full rounded-[2rem] overflow-hidden bg-white pt-5">
          {variant === 'menu' && <MenuScreen />}
          {variant === 'qr' && <QrScreen />}
          {variant === 'order' && <OrderScreen />}
        </div>
      </div>

      {/* Bottom home indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-28 h-1 bg-gray-600 rounded-full" />
    </div>
  );
}
