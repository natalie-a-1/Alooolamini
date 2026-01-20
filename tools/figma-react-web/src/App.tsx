/**
 * Project source file.
 */
import { useState } from 'react';
import { Home } from './components/Home';
import { Available } from './components/Available';
import { Spending } from './components/Spending';
import { Profile } from './components/Profile';
import { Navigation } from './components/Navigation';
import { LoginRegister } from './components/LoginRegister';
import { Onboarding } from './components/Onboarding';
import { Discover } from './components/Discover';

/** React component for App. */
export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleRegister = () => {
    setIsNewUser(true);
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setIsAuthenticated(true);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center p-4">
      {/* iPhone Frame */}
      <div className="relative w-full max-w-[390px] h-[844px] bg-black rounded-[60px] shadow-2xl p-3">
        {/* Screen Area */}
        <div className="w-full h-full bg-[#f5f5f0] rounded-[48px] overflow-hidden relative flex flex-col">
          {/* Dynamic Island - Fixed at top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[37px] bg-black rounded-full z-50" />
          
          {/* Safe Area Top Spacer */}
          <div className="h-[50px] flex-shrink-0 bg-[#f5f5f0]" />
          
          {/* Content Area */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {!isAuthenticated && !showOnboarding && (
                <LoginRegister onLogin={handleLogin} onRegister={handleRegister} />
              )}
              {showOnboarding && (
                <Onboarding onComplete={handleOnboardingComplete} />
              )}
              {isAuthenticated && !showOnboarding && (
                <>
                  {activeTab === 'home' && <Home />}
                  {activeTab === 'search' && <Discover />}
                  {activeTab === 'available' && <Available />}
                  {activeTab === 'spending' && <Spending />}
                  {activeTab === 'profile' && <Profile />}
                </>
              )}
            </div>
            
            {/* Bottom Navigation - Only show when authenticated and not onboarding */}
            {isAuthenticated && !showOnboarding && (
              <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
            )}
          </div>
          
          {/* Safe Area Bottom Spacer */}
          <div className="h-[20px] flex-shrink-0 bg-[#f5f5f0]" />
        </div>
      </div>
    </div>
  );
}