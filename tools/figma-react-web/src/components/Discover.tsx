/**
 * React UI component.
 */
import { MessageCircle, ChevronRight, Calendar, Send } from 'lucide-react';
import { useState } from 'react';
import { OpportunityDetail } from './OpportunityDetail';

/** React component for Discover. */
export function Discover() {
  const [showAIChat, setShowAIChat] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);

  // Curated opportunities for medical professionals
  const opportunities = [
    {
      id: 1,
      name: 'Healthcare REIT Portfolio',
      ticker: 'MPW, WELL, DOC',
      return: '+12.4%',
      risk: 'Moderate'
    },
    {
      id: 2,
      name: 'Biotech Innovation Fund',
      ticker: 'XBI',
      return: '+18.7%',
      risk: 'Aggressive'
    },
    {
      id: 3,
      name: 'Medical Technology',
      ticker: 'MDT, ABT, SYK',
      return: '+10.2%',
      risk: 'Conservative'
    },
    {
      id: 4,
      name: 'Healthcare Leaders',
      ticker: 'UNH, JNJ, CVS',
      return: '+8.3%',
      risk: 'Conservative'
    }
  ];

  if (showAIChat) {
    return <AIChat onClose={() => setShowAIChat(false)} />;
  }

  if (selectedOpportunity) {
    return <OpportunityDetail opportunity={selectedOpportunity} onBack={() => setSelectedOpportunity(null)} />;
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-6 pt-6 pb-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light mb-2">Discover</h1>
          <p className="text-sm text-gray-600">
            Investment opportunities for medical professionals
          </p>
        </div>

        {/* AI Chat Button */}
        <button
          onClick={() => setShowAIChat(true)}
          className="w-full bg-gray-900 text-white rounded-3xl p-6 mb-8 text-left shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="w-5 h-5 flex-shrink-0" />
            <h3 className="font-medium">Ask AI</h3>
          </div>
          <p className="text-sm text-white/70">
            Get insights on portfolio options or schedule with an advisor
          </p>
        </button>

        {/* Curated Portfolios */}
        <div className="mb-6">
          <h2 className="text-xl font-light mb-4">Curated Portfolios</h2>
          
          <div className="space-y-3">
            {opportunities.map((opportunity, index) => {
              const borderColors = ['border-l-slate-400', 'border-l-zinc-500', 'border-l-gray-500', 'border-l-stone-500'];
              
              return (
                <button
                  key={opportunity.id}
                  onClick={() => setSelectedOpportunity(opportunity)}
                  className={`w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border-l-4 ${borderColors[index % borderColors.length]} text-left`}
                >
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium mb-1">{opportunity.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{opportunity.ticker}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-xs text-gray-500">1Y Return</div>
                      <div className="text-sm font-medium text-emerald-600">{opportunity.return}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Risk</div>
                      <div className="text-sm font-medium">{opportunity.risk}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// AI Chat Component
function AIChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: "Hi Dr. Morgan! How can I help you today?",
      time: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);

  const quickActions = [
    'Portfolio recommendations',
    'Tax strategies',
    'Schedule with advisor'
  ];

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputText,
      time: 'Just now'
    };

    setMessages([...messages, newMessage]);
    
    // Check if asking to schedule
    if (inputText.toLowerCase().includes('schedule') || inputText.toLowerCase().includes('advisor')) {
      setTimeout(() => {
        const aiResponse = {
          id: messages.length + 2,
          type: 'ai',
          text: "I can help you schedule a session with one of our certified financial advisors. Would you like to see available times?",
          time: 'Just now',
          showScheduleButton: true
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    } else {
      setTimeout(() => {
        const aiResponse = {
          id: messages.length + 2,
          type: 'ai',
          text: "Based on your profile as a cardiologist with moderate risk tolerance, I'd recommend diversifying into healthcare REITs and biotech ETFs. These align with your sector knowledge.",
          time: 'Just now'
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
    
    setInputText('');
  };

  const handleQuickAction = (action: string) => {
    if (action === 'Schedule with advisor') {
      setShowSchedule(true);
    } else {
      setInputText(action);
    }
  };

  if (showSchedule) {
    return <ScheduleAdvisor onBack={() => setShowSchedule(false)} onClose={onClose} />;
  }

  return (
    <div className="h-full flex flex-col px-6 pt-16 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-medium">AI Assistant</h2>
          <p className="text-xs text-gray-500">Ask anything</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message: any) => (
          <div key={message.id}>
            <div
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-3xl p-4 ${
                  message.type === 'user'
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-900 shadow-sm'
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
            
            {message.showScheduleButton && (
              <div className="flex justify-start mt-3">
                <button
                  onClick={() => setShowSchedule(true)}
                  className="px-4 py-2 bg-white rounded-full text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  View Available Times
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action)}
                className="px-4 py-2 bg-white rounded-full text-xs hover:bg-gray-100 transition-colors shadow-sm"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white rounded-3xl shadow-sm p-3 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about investments..."
          className="flex-1 outline-none text-sm px-2"
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            inputText.trim()
              ? 'bg-black text-white hover:bg-gray-800'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Schedule Advisor Component
function ScheduleAdvisor({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const availableDates = [
    'Mon, Jan 20',
    'Tue, Jan 21',
    'Wed, Jan 22',
    'Thu, Jan 23',
    'Fri, Jan 24'
  ];

  const availableTimes = [
    '9:00 AM',
    '10:30 AM',
    '2:00 PM',
    '3:30 PM',
    '5:00 PM'
  ];

  const handleConfirm = () => {
    // Handle scheduling logic
    onClose();
  };

  return (
    <div className="h-full flex flex-col px-6 pt-16 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-medium">Schedule Session</h2>
          <p className="text-xs text-gray-500">30-minute consultation</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Select Date */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Select Date</h3>
          <div className="space-y-2">
            {availableDates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`w-full p-4 rounded-2xl text-left transition-all ${
                  selectedDate === date
                    ? 'bg-black text-white'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <span className="text-sm">{date}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Select Time */}
        {selectedDate && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Select Time</h3>
            <div className="grid grid-cols-2 gap-2">
              {availableTimes.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-3 rounded-2xl text-sm transition-all ${
                    selectedTime === time
                      ? 'bg-black text-white'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirm Button */}
      {selectedDate && selectedTime && (
        <button
          onClick={handleConfirm}
          className="w-full py-4 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg"
        >
          Confirm Session
        </button>
      )}
    </div>
  );
}