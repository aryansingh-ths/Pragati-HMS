import React, { useState } from 'react';

export default function SetupWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    hotelName: '',
    contactNumber: '',
    address: '',
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/setup/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.status === 'success') {
        onComplete();
      } else {
        setError(data.error || 'Setup failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          System Initialization
        </h2>
        <p className="mt-2 text-center text-sm text-slate-300">
          Step {step} of 2
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="text-red-400 text-sm text-center">{error}</div>}
            
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300">Hotel Name</label>
                  <input required type="text" className="mt-1 p-2 w-full bg-slate-700 text-white rounded" 
                    value={formData.hotelName} onChange={e => setFormData({...formData, hotelName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">Contact Number</label>
                  <input required type="text" className="mt-1 p-2 w-full bg-slate-700 text-white rounded" 
                    value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">Address</label>
                  <textarea required className="mt-1 p-2 w-full bg-slate-700 text-white rounded" 
                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300">Admin Name</label>
                  <input required type="text" className="mt-1 p-2 w-full bg-slate-700 text-white rounded" 
                    value={formData.adminName} onChange={e => setFormData({...formData, adminName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">Admin Email</label>
                  <input required type="email" className="mt-1 p-2 w-full bg-slate-700 text-white rounded" 
                    value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">Admin Password</label>
                  <input required type="password" className="mt-1 p-2 w-full bg-slate-700 text-white rounded" 
                    value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})} />
                </div>
              </>
            )}

            <div>
              <button disabled={loading} type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                {step === 1 ? 'Next Step' : (loading ? 'Saving...' : 'Complete Setup')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
