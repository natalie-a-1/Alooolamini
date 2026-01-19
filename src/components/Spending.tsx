import { TrendingDown, TrendingUp, DollarSign, Stethoscope, BookOpen, Briefcase, UtensilsCrossed, Car, Package } from 'lucide-react';
import { useState } from 'react';

export function Spending() {
  const [timeframe, setTimeframe] = useState('This Month');
  const timeframes = ['This Week', 'This Month', 'This Year'];

  const totalSpent = 4235.80;
  const monthlyBudget = 6000.00;
  const percentUsed = (totalSpent / monthlyBudget) * 100;

  // Spending categories
  const categories = [
    {
      id: 1,
      name: 'Medical Equipment',
      icon: Stethoscope,
      amount: 1250.00,
      percent: 29.5,
      color: 'bg-slate-100',
      textColor: 'text-slate-600',
      iconColor: 'text-slate-600'
    },
    {
      id: 2,
      name: 'Continuing Education',
      icon: BookOpen,
      amount: 890.00,
      percent: 21.0,
      color: 'bg-zinc-100',
      textColor: 'text-zinc-600',
      iconColor: 'text-zinc-600'
    },
    {
      id: 3,
      name: 'Professional Dues',
      icon: Briefcase,
      amount: 650.00,
      percent: 15.3,
      color: 'bg-stone-100',
      textColor: 'text-stone-600',
      iconColor: 'text-stone-600'
    },
    {
      id: 4,
      name: 'Dining',
      icon: UtensilsCrossed,
      amount: 485.50,
      percent: 11.5,
      color: 'bg-neutral-100',
      textColor: 'text-neutral-600',
      iconColor: 'text-neutral-600'
    },
    {
      id: 5,
      name: 'Transportation',
      icon: Car,
      amount: 420.30,
      percent: 9.9,
      color: 'bg-gray-100',
      textColor: 'text-gray-600',
      iconColor: 'text-gray-600'
    },
    {
      id: 6,
      name: 'Other',
      icon: Package,
      amount: 540.00,
      percent: 12.8,
      color: 'bg-gray-100',
      textColor: 'text-gray-600',
      iconColor: 'text-gray-600'
    }
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-6 pt-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-light">Spending</h1>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-1 px-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                timeframe === tf
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Total Spent Card */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-4 h-4 text-rose-500" />
            </div>
            <span className="text-sm text-gray-600">Total Spent</span>
          </div>
          <div className="text-3xl sm:text-4xl font-light mb-4 break-words">
            ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          
          {/* Budget Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Budget Used</span>
              <span className="text-right">{percentUsed.toFixed(1)}% of ${monthlyBudget.toLocaleString()}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all"
                style={{ width: `${Math.min(percentUsed, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <h2 className="text-xl font-light mb-4">Categories</h2>
          
          <div className="space-y-3">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.id}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${category.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm mb-1">{category.name}</div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${category.color} rounded-full transition-all`}
                          style={{ width: `${category.percent}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-medium">
                        ${category.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className={`text-xs ${category.textColor}`}>
                        {category.percent.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-3xl p-6 shadow-sm mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium mb-2">Spending Insight</h3>
              <p className="text-sm text-gray-600">
                Your professional development spending is 21% of your budget. Great investment in your career growth!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}