import React, { useState, useEffect } from 'react';

export default function SystemLocked({ onUnlock }) {
  const [showModal, setShowModal] = useState(false);
  const [requestedDate, setRequestedDate] = useState('');
  const [requestStatus, setRequestStatus] = useState('idle'); // idle, requesting, pending
  const [hardwareId, setHardwareId] = useState('');

  // Polling logic
  useEffect(() => {
    const pollTimer = setInterval(async () => {
      try {
        const res = await fetch('http://localhost:3000/api/license/status');
        const data = await res.json();
        if (data.status === 'active' && data.token) {
          clearInterval(pollTimer);
          onUnlock(data.token, data.user, data.expiresAt);
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 10000); // 10 second polling loop

    return () => clearInterval(pollTimer);
  }, [onUnlock]);

  const handleRequestActivation = async () => {
    setRequestStatus('requesting');
    try {
      const res = await fetch('http://localhost:3000/api/license/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestedExpiryDate: requestedDate })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setHardwareId(data.hardwareId);
        setRequestStatus('pending');
        setShowModal(false);
      } else {
        setRequestStatus('idle');
        alert("Failed to send request");
      }
    } catch (err) {
      setRequestStatus('idle');
      alert("Network error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl max-w-lg w-full text-center border border-red-500/30">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h2 className="text-3xl font-extrabold text-white mb-2">System Locked</h2>
        <p className="text-slate-400 mb-8">
          This installation does not have a valid license or the license has expired. 
          Please request activation from Mission Control to restore access.
        </p>

        {requestStatus === 'idle' ? (
          <button 
            onClick={handleRequestActivation}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition-colors"
          >
            Request Activation
          </button>
        ) : (
          <div className="bg-slate-700/50 p-4 rounded text-left border border-slate-600">
            <p className="text-emerald-400 font-semibold flex items-center gap-2 mb-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Awaiting Approval
            </p>
            <p className="text-sm text-slate-300">Your request has been sent to Mission Control.</p>
            {hardwareId && <p className="text-xs text-slate-500 mt-2 font-mono">HWID: {hardwareId}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
