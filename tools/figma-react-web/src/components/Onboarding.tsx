/**
 * React UI component.
 */
import { useState } from 'react';
import { ChevronRight, Target, TrendingUp, Shield, Gift, Users, CheckCircle2, GraduationCap, Home, Crosshair } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

/** React component for Onboarding. */
export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [riskTolerance, setRiskTolerance] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');

  const goals = [
    { id: 'retirement', label: 'Retirement Planning', icon: Target },
    { id: 'wealth', label: 'Wealth Building', icon: TrendingUp },
    { id: 'education', label: 'Education Fund', icon: GraduationCap },
    { id: 'property', label: 'Property Investment', icon: Home },
    { id: 'emergency', label: 'Emergency Fund', icon: Shield },
    { id: 'other', label: 'Other Goals', icon: Crosshair },
  ];

  const riskLevels = [
    { 
      id: 'conservative', 
      label: 'Conservative', 
      description: 'Lower risk, steady growth',
      color: 'from-green-400 to-green-600'
    },
    { 
      id: 'moderate', 
      label: 'Moderate', 
      description: 'Balanced risk and reward',
      color: 'from-blue-400 to-blue-600'
    },
    { 
      id: 'aggressive', 
      label: 'Aggressive', 
      description: 'Higher risk, maximum growth',
      color: 'from-purple-400 to-purple-600'
    },
  ];

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const canProceed = () => {
    if (step === 0) return selectedGoals.length > 0;
    if (step === 1) return riskTolerance !== '';
    if (step === 2) return investmentAmount !== '';
    return true;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-6 pt-6 pb-4">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex gap-2 mb-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex-1 h-1 rounded-full transition-all ${
                  i <= step ? 'bg-black' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500">Step {step + 1} of 4</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto px-6">
        {/* Step 0: Goals */}
        {step === 0 && (
          <div className="pb-6">
            <h2 className="text-2xl font-light mb-2">What are your financial goals?</h2>
            <p className="text-xs text-gray-600 mb-6">
              Select all that apply. We'll tailor your experience accordingly.
            </p>

            <div className="space-y-2">
              {goals.map((goal) => {
                const isSelected = selectedGoals.includes(goal.id);
                const IconComponent = typeof goal.icon === 'string' ? null : goal.icon;
                
                return (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'bg-gray-100 border-2 border-gray-900 shadow-sm'
                        : 'bg-white border-2 border-transparent hover:shadow-md'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-gray-900' : 'bg-gray-100'
                    }`}>
                      {IconComponent ? (
                        <IconComponent className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-700'}`} />
                      ) : (
                        <span className="text-xl">{goal.icon}</span>
                      )}
                    </div>
                    <span className="text-sm font-medium flex-1 text-left text-gray-900">{goal.label}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-gray-900" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 1: Risk Tolerance */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-light mb-2">What's your risk tolerance?</h2>
            <p className="text-xs text-gray-600 mb-6">
              This helps us recommend the right investment strategy for you.
            </p>

            <div className="space-y-2">
              {riskLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setRiskTolerance(level.id)}
                  className={`w-full p-3 rounded-xl transition-all ${
                    riskTolerance === level.id
                      ? 'bg-gray-100 border-2 border-gray-900 shadow-sm'
                      : 'bg-white border-2 border-transparent hover:shadow-md'
                  }`}
                >
                  <div className="text-gray-900">
                    <h3 className="text-sm font-medium mb-1">{level.label}</h3>
                    <p className="text-xs text-gray-600">
                      {level.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-xl">
              <p className="text-xs text-gray-600">
                💡 <strong>Tip:</strong> Professionals with stable income often choose moderate to aggressive strategies for long-term wealth building.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Initial Investment */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-light mb-2">How much would you like to start with?</h2>
            <p className="text-xs text-gray-600 mb-6">
              You can always add more funds later.
            </p>

            <div className="space-y-2 mb-4">
              {['1000', '5000', '10000', '25000', '50000'].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setInvestmentAmount(amount)}
                  className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${
                    investmentAmount === amount
                      ? 'bg-gray-100 border-2 border-gray-900 shadow-sm'
                      : 'bg-white border-2 border-transparent hover:shadow-md'
                  }`}
                >
                  <span className="text-base font-medium text-gray-900">
                    ${parseInt(amount).toLocaleString()}
                  </span>
                  {investmentAmount === amount && (
                    <CheckCircle2 className="w-4 h-4 text-gray-900" />
                  )}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-xl p-3 border-2 border-gray-200">
              <label className="text-xs text-gray-600 mb-1 block">Custom Amount</label>
              <div className="flex items-center gap-2">
                <span className="text-xl font-light">$</span>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={investmentAmount && !['1000', '5000', '10000', '25000', '50000'].includes(investmentAmount) ? investmentAmount : ''}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  className="flex-1 text-xl font-light outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-xl">
              <p className="text-xs text-gray-600">
                ✓ Your funds are FDIC insured and protected with bank-level security
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Perks & Features */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-light mb-2">You're all set!</h2>
            <p className="text-xs text-gray-600 mb-6">
              Here's what you get with Alooola Mini:
            </p>

            <div className="space-y-3">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">AI-Powered Insights</h3>
                    <p className="text-xs text-gray-600">
                      Personalized investment recommendations tailored to your goals and expertise
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Gift className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">2% Rewards on Everything</h3>
                    <p className="text-xs text-gray-600">
                      Earn stock rewards on all your spending and transactions
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Joint Accounts</h3>
                    <p className="text-xs text-gray-600">
                      Share and manage wealth with your partner or family
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Refer & Earn $200</h3>
                    <p className="text-xs text-gray-600">
                      Invite friends and colleagues and earn $200 for each successful referral
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-3 flex gap-3 px-6 pb-6">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="px-6 py-4 bg-white text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className={`flex-1 py-4 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            canProceed()
              ? 'bg-black text-white hover:bg-gray-800 shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {step === 3 ? 'Get Started' : 'Continue'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}