import React, { useState } from 'react';

const AdminBatches = () => {
  const [formData, setFormData] = useState({
    batchId: '',
    barangay: '',
    remarks: '',
    defaultItems: [],
  });

  const [newItem, setNewItem] = useState({
    itemCode: '',
    label: '',
    qty: 1,
  });

  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({
      ...prev,
      [name]: name === 'qty' ? Number(value) : value,
    }));
  };

  const handleAddItem = () => {
    if (!newItem.itemCode.trim() || !newItem.label.trim()) return;
    setFormData((prev) => ({
      ...prev,
      defaultItems: [...prev.defaultItems, newItem],
    }));
    setNewItem({ itemCode: '', label: '', qty: 1 });
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => {
      const next = [...prev.defaultItems];
      next.splice(index, 1);
      return { ...prev, defaultItems: next };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');

    // simple client-side validation
    if (!formData.batchId.trim() || !formData.barangay.trim()) {
      setApiError('Please fill in Batch ID and Barangay.');
      return;
    }
    if (formData.defaultItems.length === 0) {
      setApiError('Please add at least one default item.');
      return;
    }

    const batchDoc = {
      _id: `batch_${formData.batchId}`,
      batchId: formData.batchId,
      barangay: formData.barangay,
      defaultItems: formData.defaultItems,
      remarks: formData.remarks,
      meta: {
        createdBy: '0xOfficerAddr', // replace with wallet address later if needed
        createdAt: new Date().toISOString(),
      },
      status: 'open',
    };

    try {
      setSubmitting(true);
      console.log("BatchDoc: ", batchDoc);
      const res = await fetch('https://relieftracer.up.railway.app/api/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(batchDoc),
      });

      // Try to parse JSON either way to capture server messages
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data?.message || data?.error || `Request failed (${res.status})`;
        setApiError(msg);
        console.error('Batch create error:', msg, data);
        return;
      }

      console.log('Submitted Batch Document (server response):', data);
      setApiSuccess('Batch created successfully.');
      // optionally reset form
      setFormData({ batchId: '', barangay: '', remarks: '', defaultItems: [] });
      setNewItem({ itemCode: '', label: '', qty: 1 });
    } catch (err) {
      console.error('Network/Unexpected error:', err);
      setApiError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold">Create Batch</h2>
          <p className="text-sm text-gray-500 mt-1">
            Define the batch details and add default items.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-6 space-y-6">
          {/* Top fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Batch ID</label>
              <input
                type="text"
                name="batchId"
                value={formData.batchId}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
                placeholder="TY-2025-09-A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Barangay</label>
              <input
                type="text"
                name="barangay"
                value={formData.barangay}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
                placeholder="Barangay San Isidro"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
                placeholder="Typhoon A first-wave relief"
                rows={3}
              />
            </div>
          </div>

          {/* Add Item */}
          <div className="pt-2">
            <h3 className="text-base font-semibold mb-3">Default Items</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <input
                type="text"
                name="itemCode"
                value={newItem.itemCode}
                onChange={handleNewItemChange}
                placeholder="Item Code (e.g. RICE_25KG)"
                className="border border-gray-200 rounded-lg px-3 py-2"
              />
              <input
                type="text"
                name="label"
                value={newItem.label}
                onChange={handleNewItemChange}
                placeholder="Label (e.g. Rice 25kg)"
                className="border border-gray-200 rounded-lg px-3 py-2"
              />
              <input
                type="number"
                name="qty"
                min="1"
                value={newItem.qty}
                onChange={handleNewItemChange}
                className="border border-gray-200 rounded-lg px-3 py-2"
                placeholder="Qty"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddItem}
                className="w-full md:w-auto px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                Add Item
              </button>
            </div>

            {/* Items table */}
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="border border-gray-200">
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Item Code</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Label</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Qty</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {formData.defaultItems.length === 0 ? (
                    <tr>
                      <td className="px-3 py-3 text-gray-500" colSpan={4}>
                        No items added yet.
                      </td>
                    </tr>
                  ) : (
                    formData.defaultItems.map((item, idx) => (
                      <tr key={`${item.itemCode}-${idx}`} className="border-t border-gray-200">
                        <td className="px-3 py-2">{item.itemCode}</td>
                        <td className="px-3 py-2">{item.label}</td>
                        <td className="px-3 py-2">x {item.qty}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-100"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* API messages */}
          {(apiError || apiSuccess) && (
            <div className="text-sm">
              {apiError && <p className="text-red-600">{apiError}</p>}
              {apiSuccess && <p className="text-green-600">{apiSuccess}</p>}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setFormData({ batchId: '', barangay: '', remarks: '', defaultItems: [] });
                setNewItem({ itemCode: '', label: '', qty: 1 });
                setApiError('');
                setApiSuccess('');
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg text-white ${submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {submitting ? 'Saving…' : 'Save Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminBatches;
