import React from 'react';

const DiningReceipt = ({ receiptData, hotelSettings }) => {
  if (!receiptData) return null;

  return (
    <div className="print-receipt font-mono text-black w-[80mm] mx-auto bg-white p-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold uppercase mb-1">{hotelSettings?.name || 'Grand Plaza Hotel'}</h1>
        <p className="text-xs mb-1">{hotelSettings?.address || '123 Elite Avenue'}</p>
        <p className="text-xs">GST: {hotelSettings?.gst_no || '27XXXXX1234X1Z5'} | Ph: {hotelSettings?.contact_no || '+91 98765 43210'}</p>
        <div className="border-b border-dashed border-black my-2"></div>
        <h2 className="text-lg font-bold">RESTAURANT RECEIPT</h2>
        <div className="border-b border-dashed border-black my-2"></div>
      </div>

      {/* Bill Meta */}
      <div className="text-xs mb-4">
        <p className="flex justify-between"><span>Date:</span> <span>{new Date(receiptData.created_at || Date.now()).toLocaleDateString()} {new Date(receiptData.created_at || Date.now()).toLocaleTimeString()}</span></p>
        <p className="flex justify-between"><span>Table:</span> <span className="font-bold">{receiptData.table_number || receiptData.table || 'N/A'}</span></p>
        {receiptData.id && <p className="flex justify-between"><span>Bill No:</span> <span>{String(receiptData.id).split('-')[0].toUpperCase()}</span></p>}
      </div>

      <div className="border-b border-black my-2"></div>

      {/* Items */}
      <table className="w-full text-xs mb-4">
        <thead>
          <tr className="border-b border-black">
            <th className="text-left font-bold py-1">Item</th>
            <th className="text-center font-bold py-1">Qty</th>
            <th className="text-right font-bold py-1">Amt</th>
          </tr>
        </thead>
        <tbody>
          {(receiptData.items || []).map((item, idx) => (
            <tr key={idx}>
              <td className="py-1 pr-1">{item.item || item.name}</td>
              <td className="py-1 text-center">{item.qty}</td>
              <td className="py-1 text-right">{((item.price || 0) * (item.qty || 1)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-black my-2"></div>

      {/* Totals */}
      <div className="text-xs space-y-1">
        <p className="flex justify-between"><span>Subtotal:</span> <span>{Number(receiptData.subtotal || receiptData.total_amount || 0).toFixed(2)}</span></p>
        {receiptData.discount > 0 && (
           <p className="flex justify-between"><span>Discount:</span> <span>-{Number(receiptData.discount).toFixed(2)}</span></p>
        )}
        {receiptData.tax > 0 && (
           <p className="flex justify-between"><span>Tax:</span> <span>{Number(receiptData.tax).toFixed(2)}</span></p>
        )}
        <div className="border-t border-dashed border-black my-1"></div>
        <p className="flex justify-between font-bold text-sm">
          <span>TOTAL:</span>
          <span>₹{Number(receiptData.total_amount || receiptData.total || 0).toFixed(2)}</span>
        </p>
      </div>

      <div className="border-b border-dashed border-black my-4"></div>

      {/* Footer */}
      <div className="text-center text-xs">
        <p className="font-bold mb-1">Thank You! Visit Again.</p>
        <p>Software by Techhansa IT</p>
      </div>
    </div>
  );
};

export default DiningReceipt;
