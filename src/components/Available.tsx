import { Gift } from 'lucide-react';

export function Available() {
  const availableBalance = 32547.00;
  const totalRewards = 1542.00;
  const rewardRate = 2;

  // Mock activity data
  const activities = [
    {
      id: 1,
      name: 'Logan Stein',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      description: 'Here is some cash :)',
      amount: 80.00,
      type: 'received',
      date: '10/26/2023'
    },
    {
      id: 2,
      name: 'Anisa Pearson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      description: 'For concert shopping',
      amount: -50.00,
      type: 'sent',
      date: '10/25/2023'
    },
    {
      id: 3,
      name: 'Professional Conference',
      avatar: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&h=100&fit=crop',
      description: 'Registration fee',
      amount: -450.00,
      type: 'spent',
      date: '10/24/2023'
    },
    {
      id: 4,
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      description: 'Referral bonus',
      amount: 200.00,
      type: 'received',
      date: '10/23/2023'
    }
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-6 pt-6 pb-6">
        {/* Available Balance */}
        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-2">Available</div>
          <div className="text-4xl sm:text-5xl font-light mb-8 break-words">
            ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Rewards Card */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">Total earned rewards</div>
            <Gift className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>
          <div className="text-3xl sm:text-4xl font-light mb-2 break-words">
            ${totalRewards.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-500">
            earning {rewardRate}% in stock
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <button className="flex-1 py-4 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
            Add Funds
          </button>
          <button className="flex-1 py-4 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-200">
            Move Funds
          </button>
        </div>

        {/* Activity Section */}
        <div className="mb-6">
          <h2 className="text-xl font-light mb-4">Activity</h2>
          
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={activity.avatar}
                  alt={activity.name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{activity.name}</div>
                  <div className="text-xs text-gray-500 truncate">{activity.description}</div>
                  <div className="text-xs text-gray-400 mt-1">{activity.date}</div>
                </div>
                <div className={`text-sm font-medium flex-shrink-0 ${
                  activity.amount > 0 ? 'text-green-600' : 'text-gray-900'
                }`}>
                  {activity.amount > 0 ? '+' : ''}${Math.abs(activity.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}