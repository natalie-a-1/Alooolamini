/**
 * React UI component.
 */
import { Bell, TrendingUp } from 'lucide-react';
import { useState } from 'react';

/** React component for Home. */
export function Home() {
  const [timeframe, setTimeframe] = useState('1M');
  const timeframes = ['1M', '3M', '6M', '1Y', 'ALL'];

  // Mock portfolio data
  const portfolioValue = 134420.50;
  const gain = 2945.75;
  const gainPercent = 2.15;

  // Mock chart data points
  const chartData = [
    50, 45, 55, 52, 60, 58, 65, 62, 70, 68, 75, 72, 80, 78, 85, 82, 88, 86, 90, 88, 92
  ];

  const maxValue = Math.max(...chartData);
  const minValue = Math.min(...chartData);
  const range = maxValue - minValue;

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-6 pt-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-light">Invest</h1>
          <button className="w-10 h-10 rounded-full border-2 border-gray-800 flex items-center justify-center hover:bg-gray-100 flex-shrink-0">
            <Bell className="w-5 h-5" />
          </button>
        </div>

        {/* Portfolio Value */}
        <div className="mb-6">
          <div className="text-4xl sm:text-5xl font-light mb-3 break-words">
            ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-3 h-3 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">
              ${gain.toFixed(2)} · all time
            </span>
          </div>
        </div>

        {/* Portfolio Card */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 mb-1">$2,945 · all time</div>
              <div className="text-sm font-medium mb-1">Portfolio value</div>
              <div className="text-2xl font-light break-words">${portfolioValue.toFixed(2)}</div>
            </div>
            <div className="text-right text-xs text-gray-400 flex-shrink-0 ml-4">
              <div>$150,000</div>
              <div className="mt-8">$100,000</div>
              <div className="mt-8">$50,000</div>
            </div>
          </div>

          {/* Simple Line Chart */}
          <div className="relative h-32 w-full">
            <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="#000"
                strokeWidth="1.5"
                points={chartData
                  .map((value, index) => {
                    const x = (index / (chartData.length - 1)) * 300;
                    const y = 100 - ((value - minValue) / range) * 100;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
              {/* Vertical line at midpoint */}
              <line
                x1="150"
                y1="0"
                x2="150"
                y2="100"
                stroke="#ddd"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            </svg>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-1 px-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`flex-1 min-w-[60px] py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                timeframe === tf
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* See More */}
        <button className="w-full py-4 text-left text-lg font-light hover:opacity-70">
          See More
        </button>

        {/* AI Insights Card */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
              AI
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium mb-2">Personalized Insight</h3>
              <p className="text-sm text-gray-600">
                Based on your portfolio, consider diversifying into healthcare sector investments for sector-aligned growth potential.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}