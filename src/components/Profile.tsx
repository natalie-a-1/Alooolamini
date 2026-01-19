import { Users, Gift, Settings, ChevronRight, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function Profile() {
  const [copiedCode, setCopiedCode] = useState(false);
  const [jointAccountEnabled, setJointAccountEnabled] = useState(false);

  const referralCode = 'ALOOLA2024';
  const referralCount = 3;
  const referralReward = 200;

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-6 pt-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-light">Profile</h1>
          <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop"
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-medium">Alex Morgan</h2>
              <p className="text-sm text-gray-500">Professional Member</p>
              <p className="text-xs text-gray-400 mt-1">Member since Jan 2024</p>
            </div>
          </div>
        </div>

        {/* Joint Account Section */}
        <div className="mb-6">
          <h2 className="text-xl font-light mb-4">Account Settings</h2>
          
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">Joint Account</div>
                  <div className="text-xs text-gray-500">Share with partner or family</div>
                </div>
              </div>
              <button
                onClick={() => setJointAccountEnabled(!jointAccountEnabled)}
                className={`w-12 h-7 rounded-full transition-all flex-shrink-0 ${
                  jointAccountEnabled ? 'bg-black' : 'bg-gray-200'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  jointAccountEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {jointAccountEnabled && (
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop"
                    alt="Joint account member"
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">Dr. Jamie Morgan</div>
                    <div className="text-xs text-gray-500">Co-owner</div>
                  </div>
                  <button className="text-xs text-red-500 hover:underline flex-shrink-0">Remove</button>
                </div>
                <button className="w-full py-3 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
                  + Add Another Member
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Referral Section */}
        <div className="mb-6">
          <h2 className="text-xl font-light mb-4">Referrals</h2>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 shadow-sm mb-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium mb-1">Earn ${referralReward} per referral</h3>
                <p className="text-sm text-gray-600">
                  Invite friends and colleagues and you'll both receive ${referralReward} when they fund their account.
                </p>
              </div>
            </div>

            {/* Referral Code */}
            <div className="bg-white rounded-2xl p-4 mb-3">
              <div className="text-xs text-gray-500 mb-2">Your Referral Code</div>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-xl sm:text-2xl font-mono font-bold tracking-wider break-all">{referralCode}</div>
                <button
                  onClick={handleCopyReferralCode}
                  className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 flex-shrink-0"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Referral Stats */}
            <div className="bg-white rounded-2xl p-4">
              <div className="flex justify-between items-center gap-4">
                <div className="flex-1">
                  <div className="text-sm text-gray-600">Successful Referrals</div>
                  <div className="text-2xl font-light mt-1">{referralCount}</div>
                </div>
                <div className="text-right flex-1">
                  <div className="text-sm text-gray-600">Total Earned</div>
                  <div className="text-2xl font-light text-green-600 mt-1">
                    ${(referralCount * referralReward).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Share Button */}
          <button className="w-full py-4 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
            Share Referral Code
          </button>
        </div>

        {/* Menu Items */}
        <div className="space-y-2 mb-6">
          {[
            { label: 'Account Details', icon: Settings },
            { label: 'Security', icon: Settings },
            { label: 'Notifications', icon: Settings },
            { label: 'Help & Support', icon: Settings },
          ].map((item) => (
            <button
              key={item.label}
              className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <item.icon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}