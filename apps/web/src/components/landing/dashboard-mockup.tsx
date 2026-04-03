'use client';

interface DashboardMockupProps {
  className?: string;
}

export function DashboardMockup({ className = '' }: DashboardMockupProps) {
  const orders = [
    { id: '#7X4K', status: 'Ready', statusColor: 'bg-emerald-500', items: 3 },
    {
      id: '#8M2P',
      status: 'Preparing',
      statusColor: 'bg-orange-500',
      items: 2,
    },
    { id: '#9N1Q', status: 'New', statusColor: 'bg-gray-400', items: 1 },
  ];

  const chartBars = [40, 65, 55, 80, 70, 90, 60];

  return (
    <div
      className={`w-full max-w-lg aspect-video ${className}`}
      aria-hidden="true"
    >
      {/* Browser chrome */}
      <div className="bg-gray-100 rounded-t-xl border border-gray-200 px-4 py-2.5 flex items-center gap-3">
        {/* Traffic lights */}
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>
        {/* URL bar */}
        <div className="flex-1 bg-white rounded-md px-3 py-1 text-[9px] text-gray-400 font-mono border border-gray-200">
          bitebyte.app/dashboard
        </div>
      </div>

      {/* Dashboard content */}
      <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-16 bg-gray-50 border-r border-gray-100 py-3 px-2 space-y-2.5 hidden sm:block">
          <div className="w-full h-2 bg-orange-500 rounded-full" />
          <div className="w-3/4 h-2 bg-gray-200 rounded-full" />
          <div className="w-full h-2 bg-gray-200 rounded-full" />
          <div className="w-2/3 h-2 bg-gray-200 rounded-full" />
          <div className="mt-4 w-full h-2 bg-gray-200 rounded-full" />
        </div>

        {/* Main area */}
        <div className="flex-1 p-3 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold text-gray-800">Orders</p>
            <div className="flex gap-1">
              <span className="text-[8px] font-semibold text-orange-600 bg-orange-50 rounded-full px-2 py-0.5">
                Live
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            {/* Order cards */}
            <div className="flex-1 space-y-1.5">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-2 p-1.5 rounded-lg border border-gray-100 bg-gray-50/50"
                >
                  <div
                    className={`w-1.5 h-6 rounded-full ${order.statusColor}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-gray-700">
                      {order.id}
                    </p>
                    <p className="text-[8px] text-gray-400">
                      {order.items} items
                    </p>
                  </div>
                  <span
                    className={`text-[7px] font-bold text-white px-1.5 py-0.5 rounded-md ${order.statusColor}`}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Mini chart */}
            <div className="w-24 hidden sm:flex flex-col">
              <p className="text-[8px] font-semibold text-gray-500 mb-1.5">
                Today
              </p>
              <div className="flex-1 flex items-end gap-1">
                {chartBars.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-orange-500 to-orange-300"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <p className="text-[9px] font-bold text-gray-800 mt-1">$1,247</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
