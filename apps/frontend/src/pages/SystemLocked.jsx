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
          onUnlock(data.token, data.user);
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

  const handleMockInject = async () => {
     try {
        await fetch('http://localhost:3000/api/license/inject-mock', { method: 'POST' });
     } catch (e) {
        console.error(e);
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
            onClick={() => setShowModal(true)}
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
        
        {/* MOCK DEV BUTTON */}
        <button onClick={handleMockInject} className="mt-8 text-xs text-slate-600 hover:text-slate-400 underline">
           [DEV] Inject Mock License
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-slate-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6 border border-slate-700">
              <div>
                <h3 className="text-lg leading-6 font-medium text-white" id="modal-title">
                  Activation Request
                </h3>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-300">Requested Expiry Date</label>
                  <input 
                    type="date" 
                    className="mt-1 p-2 w-full bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none" 
                    value={requestedDate}
                    onChange={(e) => setRequestedDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  disabled={!requestedDate}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  onClick={handleRequestActivation}
                >
                  Submit
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-600 shadow-sm px-4 py-2 bg-slate-700 text-base font-medium text-slate-300 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
