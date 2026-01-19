import { ChevronRight, TrendingUp, AlertCircle, Info, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

interface Opportunity {
  id: number;
  name: string;
  ticker: string;
  return: string;
  risk: string;
}

interface OpportunityDetailProps {
  opportunity: Opportunity;
  onBack: () => void;
}

export function OpportunityDetail({ opportunity, onBack }: OpportunityDetailProps) {
  const [amount, setAmount] = useState('');

  // Mock performance data
  const performanceData = [
    { period: '1W', return: '+2.1%' },
    { period: '1M', return: '+5.3%' },
    { period: '3M', return: '+8.7%' },
    { period: '1Y', return: opportunity.return },
    { period: 'ALL', return: '+24.5%' }
  ];

  const keyMetrics = [
    { label: 'Market Cap', value: '$12.4B' },
    { label: 'P/E Ratio', value: '18.5' },
    { label: 'Dividend Yield', value: '3.2%' },
    { label: 'Expense Ratio', value: '0.45%' }
  ];

  const riskFactors = [
    'Healthcare sector volatility',
    'Regulatory changes',
    'Market concentration risk',
    'Interest rate sensitivity'
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-6 pt-6 pb-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-medium truncate">{opportunity.name}</h2>
            <p className="text-xs text-gray-500 truncate">{opportunity.ticker}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6">
        {/* Performance Card */}
        <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <h3 className="font-medium">Performance</h3>
          </div>
          
          <div className="grid grid-cols-5 gap-2 mb-4">
            {performanceData.map((perf) => (
              <div key={perf.period} className="text-center">
                <div className="text-xs text-gray-500 mb-1">{perf.period}</div>
                <div className="text-xs sm:text-sm font-medium text-emerald-600 break-words">{perf.return}</div>
              </div>
            ))}
          </div>

          {/* Simple chart representation */}
          <div className="h-32 bg-gray-50 rounded-2xl flex items-end justify-around p-4">
            {[40, 55, 48, 65, 58, 72, 68, 80, 75, 85].map((height, i) => (
              <div
                key={i}
                className="w-6 bg-gradient-to-t from-gray-300 to-gray-400 rounded-t"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <h3 className="font-medium">Key Metrics</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {keyMetrics.map((metric) => (
              <div key={metric.label}>
                <div className="text-xs text-gray-500 mb-1">{metric.label}</div>
                <div className="text-lg font-medium break-words">{metric.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0" />
            <h3 className="font-medium">Risk Factors</h3>
          </div>
          
          <div className="space-y-2">
            {riskFactors.map((factor, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">{factor}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Risk Level</span>
              <span className="text-sm font-medium">{opportunity.risk}</span>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm">
          <h3 className="font-medium mb-3">About</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            This investment focuses on healthcare sector opportunities, providing exposure to medical 
            properties, innovation, and industry leaders. Designed for investors who understand 
            sector dynamics and long-term growth potential.
          </p>
        </div>

        {/* Why This Works */}
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-3xl p-6 mb-4">
          <h3 className="font-medium mb-3">Key Benefits</h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <ArrowUpRight className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600">Leverage sector knowledge and expertise</span>
            </div>
            <div className="flex items-start gap-2">
              <ArrowUpRight className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600">Align investments with professional background</span>
            </div>
            <div className="flex items-start gap-2">
              <ArrowUpRight className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600">Long-term sector growth potential</span>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Input - Fixed at bottom */}
      <div className="flex-shrink-0 mt-4 px-6 pb-6 space-y-3">
        <div className="bg-white rounded-3xl shadow-sm p-4">
          <label className="text-xs text-gray-500 mb-2 block">Investment Amount</label>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-light flex-shrink-0">$</span>
            <input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 text-2xl font-light outline-none bg-transparent min-w-0"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 py-4 bg-white text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-200">
            Add to Watchlist
          </button>
          <button 
            className="flex-1 py-4 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={!amount}
          >
            Invest Now
          </button>
        </div>
      </div>
    </div>
  );
}