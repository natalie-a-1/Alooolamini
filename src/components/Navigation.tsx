import { Home, Search, Wallet, CreditCard, Grid3x3 } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'available', icon: Wallet, label: 'Available' },
    { id: 'spending', icon: CreditCard, label: 'Spending' },
    { id: 'profile', icon: Grid3x3, label: 'Profile' },
  ];

  return (
    <div className="flex-shrink-0 bg-[#f5f5f0] border-t border-gray-200">
      <div className="flex items-center justify-around px-4 py-2 safe-bottom">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center w-11 h-11 rounded-full transition-all ${
                isActive ? 'bg-black' : 'hover:bg-gray-200'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-700'}`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}