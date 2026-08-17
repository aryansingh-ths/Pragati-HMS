import React from 'react';

const GuestFolioInvoice = ({ invoiceData, hotelSettings }) => {
  if (!invoiceData) return null;

  return (
    <div className="hidden print:block print-receipt font-sans text-black max-w-4xl mx-auto bg-white p-8">
      {/* Hotel Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-300 pb-4 mb-6">
        <div>
          {hotelSettings?.logo_url && (
            <img src={hotelSettings.logo_url} alt="Hotel Logo" className="h-16 mb-2" />
          )}
          <h1 className="text-2xl font-bold uppercase">{hotelSettings?.name || 'Grand Plaza Hotel'}</h1>
          <p className="text-sm">{hotelSettings?.address || '123 Elite Avenue, City Center'}</p>
          <p className="text-sm">GST No: {hotelSettings?.gst_no || '27XXXXX1234X1Z5'} | Contact: {hotelSettings?.contact_no || '+91 98765 43210'}</p>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold text-gray-700 uppercase tracking-widest">Tax Invoice</h2>
          <p className="text-sm mt-2"><strong>Invoice No:</strong> {invoiceData.booking_id || invoiceData.id || 'INV-1001'}</p>
          <p className="text-sm"><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Guest Details */}
      <div className="flex justify-between mb-6">
        <div>
          <h3 className="font-bold text-lg mb-1">Bill To:</h3>
          <p className="text-sm font-semibold">{invoiceData.guest_name}</p>
          {invoiceData.guest_email && <p className="text-sm">{invoiceData.guest_email}</p>}
          {invoiceData.guest_phone && <p className="text-sm">{invoiceData.guest_phone}</p>}
        </div>
        <div className="text-right">
          <p className="text-sm"><strong>Room No:</strong> {invoiceData.room_number || 'N/A'}</p>
          <p className="text-sm"><strong>Check-In:</strong> {invoiceData.check_in_date ? new Date(invoiceData.check_in_date).toLocaleDateString() : 'N/A'}</p>
          <p className="text-sm"><strong>Check-Out:</strong> {invoiceData.check_out_date ? new Date(invoiceData.check_out_date).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>

      {/* Itemized Charges */}
      <table className="w-full text-left border-collapse mb-6">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300">
            <th className="py-2 px-4 text-sm font-bold uppercase">Description</th>
            <th className="py-2 px-4 text-sm font-bold uppercase text-right">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="py-3 px-4 text-sm">Room Charges ({invoiceData.room_type || 'Room'}) {invoiceData.actual_days ? `x ${invoiceData.actual_days} Day(s)` : ''}</td>
            <td className="py-3 px-4 text-sm text-right">
              {invoiceData.base_total 
                ? Number(invoiceData.base_total).toLocaleString('en-IN', { maximumFractionDigits: 2 }) 
                : Number(invoiceData.total_price || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </td>
          </tr>
          {invoiceData.gst_amount !== undefined && (
            <tr className="border-b border-gray-200">
              <td className="py-3 px-4 text-sm">GST (18%)</td>
              <td className="py-3 px-4 text-sm text-right">{Number(invoiceData.gst_amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
            </tr>
          )}
          {invoiceData.service_charge !== undefined && (
            <tr className="border-b border-gray-200">
              <td className="py-3 px-4 text-sm">Service Charge (10%)</td>
              <td className="py-3 px-4 text-sm text-right">{Number(invoiceData.service_charge).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-1/2">
          <div className="flex justify-between py-1 border-t-2 border-gray-800 font-bold text-lg">
            <span>Grand Total:</span>
            <span>₹{
              invoiceData.final_total 
                ? Number(invoiceData.final_total).toLocaleString('en-IN', { maximumFractionDigits: 2 })
                : Number(invoiceData.total_price || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })
            }</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
        <p className="font-bold mb-1">Thank you for staying with us!</p>
        <p>Software by Techhansa IT</p>
      </div>
    </div>
  );
};

export default GuestFolioInvoice;
