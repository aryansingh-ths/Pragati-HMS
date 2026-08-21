import React, { useState, useEffect } from 'react';

export default function LicenseWarningBanner({ expiresAt }) {
  const [remainingDays, setRemainingDays] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!expiresAt) return;

    const calculateRemaining = () => {
      const now = new Date().getTime();
      const diff = expiresAt - now;
      if (diff > 0) {
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        setRemainingDays(days);
      } else {
        setRemainingDays(0);
      }
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000 * 60 * 60); // check every hour
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (remainingDays === null || remainingDays > 30 || !isVisible) {
    return null;
  }

  return (
    <div className="bg-red-600/90 backdrop-blur-sm text-white px-4 py-3 flex items-center justify-between shadow-md z-50 relative">
      <div className="flex items-center gap-3">
        <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <span className="font-bold">License Expiry Warning: </span>
          <span className="opacity-90">
            Your system license will expire in <strong className="text-xl mx-1">{remainingDays}</strong> day{remainingDays !== 1 ? 's' : ''}. Please renew to prevent system lockdown.
          </span>
        </div>
      </div>
      <button 
        onClick={() => setIsVisible(false)} 
        className="p-1 hover:bg-white/20 rounded-full transition-colors"
        aria-label="Close"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
