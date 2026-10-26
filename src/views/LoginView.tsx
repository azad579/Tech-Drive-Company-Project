import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('alehsantradinglimited@gmail.com');
  const [password, setPassword] = useState('123456789');
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successForgot, setSuccessForgot] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = login(email, password);
    if (!success) {
      setErrorMsg('Invalid email or password. Please try again.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setSuccessForgot(`Reset instructions sent to ${forgotEmail}`);
    setTimeout(() => {
      setSuccessForgot('');
      setShowForgot(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#002b49]">
      <div className="w-full max-w-[360px] flex flex-col items-center">
        {/* Tech Drive Logo matching image_80c741c5.png */}
        <div className="text-center mb-6">
          <div className="relative w-28 h-20 mx-auto flex items-center justify-center">
            <svg viewBox="0 0 100 85" className="w-full h-full drop-shadow">
              {/* Gold outer circle arc */}
              <circle
                cx="50"
                cy="42"
                r="34"
                fill="none"
                stroke="#f39c12"
                strokeWidth="6"
                strokeDasharray="210"
                strokeDashoffset="25"
              />
              {/* Blue Laptop frame */}
              <rect
                x="28"
                y="26"
                width="44"
                height="26"
                rx="2"
                fill="#002b49"
                stroke="#0084bf"
                strokeWidth="3.5"
              />
              {/* Laptop base */}
              <path
                d="M 20 54 L 80 54"
                stroke="#0084bf"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Circuit tech traces inside laptop screen */}
              <path
                d="M 34 38 L 42 38 L 48 32 M 37 44 L 47 44"
                stroke="#0084bf"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              />
              {/* Gold 'T' */}
              <path
                d="M 48 22 L 74 22 M 61 22 L 61 52"
                stroke="#f39c12"
                strokeWidth="6.5"
                strokeLinecap="square"
              />
              {/* Blue 'D' */}
              <path
                d="M 66 24 L 76 24 C 86 24 86 52 76 52 L 66 52 Z"
                fill="#0084bf"
              />
            </svg>
          </div>
          <div className="text-2xl font-black tracking-tight leading-none text-white mt-1">
            <span className="text-[#0084bf]">TECH </span>
            <span className="text-[#f39c12]">DRIVE</span>
          </div>
        </div>

        {/* Login Card matching image_80c741c5.png 1:1 */}
        <div className="w-full bg-white rounded-none shadow-lg overflow-hidden">
          <div className="p-6">
            <p className="text-center text-xs text-gray-600 mb-5 font-normal">
              Sign in to start your session
            </p>

            {errorMsg && (
              <div className="mb-4 p-2.5 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="Email"
                    className="w-full pl-3 pr-9 py-2 text-xs bg-[#e8f0fe] border border-gray-300 rounded-none text-gray-800 focus:bg-white focus:border-[#0084bf] focus:outline-none"
                  />
                  <span className="fa fa-envelope absolute right-3 top-2.5 text-gray-500 text-xs"></span>
                </div>
              </div>

              <div>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Password"
                    className="w-full pl-3 pr-9 py-2 text-xs bg-[#e8f0fe] border border-gray-300 rounded-none text-gray-800 focus:bg-white focus:border-[#0084bf] focus:outline-none"
                  />
                  <span className="fa fa-lock absolute right-3 top-2.5 text-gray-500 text-xs"></span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded-none text-[#0084bf] border-gray-300 focus:ring-0"
                  />
                  <span className="text-[12px] text-gray-700">Remember Me.</span>
                </label>

                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0084bf] hover:bg-[#0073a8] rounded-none transition uppercase tracking-wider shadow-xs"
                >
                  SIGN IN
                </button>
              </div>
            </form>

            {/* Forgot password */}
            <div className="mt-5 text-right">
              <button
                type="button"
                onClick={() => setShowForgot(!showForgot)}
                className="text-xs text-[#0073b7] hover:underline"
              >
                Forgot password ?
              </button>

              {showForgot && (
                <form onSubmit={handleForgotSubmit} className="mt-3 text-left p-3 bg-gray-50 border border-gray-200">
                  <label className="block text-[11px] text-gray-600 mb-1">Enter Your Email</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    required
                    placeholder="user@example.com"
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-none mb-2 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-[#0084bf] text-white text-xs font-bold rounded-none hover:bg-[#0073a8]"
                  >
                    Submit
                  </button>
                  {successForgot && (
                    <p className="text-[11px] text-emerald-600 mt-1 font-medium">{successForgot}</p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
