/**
 * React UI component.
 */
import { useState } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LoginRegisterProps {
  onLogin: () => void;
  onRegister: () => void;
}

/** React component for Login Register. */
export function LoginRegister({ onLogin, onRegister }: LoginRegisterProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      onLogin();
    } else {
      onRegister();
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col justify-center min-h-full px-6 pt-6 pb-6">
        {/* Logo and Header */}
        <div className="text-center mb-12">
          <img 
            src="https://images.unsplash.com/photo-1695634621644-a1abcdf60bc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" 
            alt="Alooola Logo"
            className="w-20 h-20 mx-auto mb-6 rounded-3xl object-cover shadow-lg"
          />
          <h1 className="text-4xl font-light mb-3">Alooola Mini</h1>
          <p className="text-sm text-gray-600">
            AI-Powered Wealth Building for Professionals
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-8 bg-white rounded-full p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 rounded-full text-sm font-medium transition-all ${
              isLogin
                ? 'bg-black text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 rounded-full text-sm font-medium transition-all ${
              !isLogin
                ? 'bg-black text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 flex-shrink-0">
          {!isLogin && (
            <>
              <div className="bg-white rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 p-4">
                  <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 outline-none text-sm bg-transparent"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="bg-white rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 p-4">
              <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 outline-none text-sm bg-transparent"
                required
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 p-4">
              <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 outline-none text-sm bg-transparent"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg mt-6"
          >
            {isLogin ? 'Log In' : 'Get Started'}
          </button>
        </form>

        {/* Additional Links */}
        <div className="text-center mt-6 flex-shrink-0">
          {isLogin && (
            <button className="text-sm text-gray-600 hover:text-gray-900">
              Forgot password?
            </button>
          )}
        </div>

        {/* Features */}
        {!isLogin && (
          <div className="mt-8 space-y-3 flex-shrink-0">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
              <span>AI-powered investment insights</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              <span>Personalized wealth strategies</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              <span>Earn rewards on every transaction</span>
            </div>
          </div>
        )}

        {/* Terms */}
        <p className="text-xs text-gray-400 text-center mt-8 flex-shrink-0">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}