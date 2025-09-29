// src/public/Explorer.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RELIEFTRACER_API) ||
  'https://relieftracer.up.railway.app/api';

// --- Date Helpers ---
function normalizeDateValue(v) {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v === 'string' || typeof v === 'number') {
    const d = new Date(v);
    return isNaN(d) ? null : d;
  }
  if (typeof v === 'object' && '$date' in v) {
    const d = new Date(v.$date);
    return isNaN(d) ? null : d;
  }
  return null;
}

function formatLocal(v, locale = undefined, opts = {}) {
  const d = normalizeDateValue(v);
  return d ? d.toLocaleString(locale, opts) : '—';
}

const Explorer = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [batchLoading, setBatchLoading] = useState(true);
  const [batchError, setBatchError] = useState('');

  const [dists, setDists] = useState([]);
  const [distsLoading, setDistsLoading] = useState(true);
  const [distsError, setDistsError] = useState('');

  // ---- Fetch batches ----
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setBatchLoading(true);
        const res = await fetch(`${API_URL}/batches`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setBatches(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length) {
          setSelectedBatchId(data[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch batches:', err);
        setBatchError('Failed to load batches.');
      } finally {
        setBatchLoading(false);
      }
    };
    fetchBatches();
  }, []);

  // ---- Fetch distributions ----
  useEffect(() => {
    const fetchDistributions = async () => {
      try {
        setDistsLoading(true);
        const res = await fetch(`${API_URL}/distributions`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setDists(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch distributions:', err);
        setDistsError('Failed to load distributions.');
      } finally {
        setDistsLoading(false);
      }
    };
    fetchDistributions();
  }, []);

  const selectedBatch = useMemo(
    () => batches.find((b) => b._id === selectedBatchId),
    [batches, selectedBatchId]
  );

  // Families served = static from batch
  const families =
    selectedBatch?.families ??
    selectedBatch?.totals?.families ??
    selectedBatch?.meta?.families ??
    0;

  // Helper: is verified?
  const isVerified = (dist) => {
    if (dist?.verified === true) return true;
    const s = String(dist?.status || '').toLowerCase();
    return s.includes('verified') || s.includes('✅');
  };

  // Filter: by selected batch & verified only
  const verifiedDistributions = useMemo(() => {
    const batchKey = selectedBatch?._id || selectedBatch?.batchId;
    if (!batchKey) return [];
    return dists.filter((d) => {
      const matchesBatch =
        d.batchId === selectedBatch?.batchId ||
        d.batch === selectedBatch?._id ||
        d.batch?._id === selectedBatch?._id ||
        d.batchCode === selectedBatch?.batchId;
      return matchesBatch && isVerified(d);
    });
  }, [dists, selectedBatch]);

  // Loading & error states
  if (batchLoading || distsLoading) {
    return (
      <div className="p-4">
        <p className="text-gray-600">Loading…</p>
      </div>
    );
  }

  if (batchError || distsError) {
    return (
      <div className="p-4 space-y-3">
        {batchError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
            {batchError}
          </div>
        )}
        {distsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
            {distsError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Public Explorer</h1>
        <p className="text-gray-600">
          Browse relief distribution records by batch, barangay, or household.
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.batchId}
              </option>
            ))}
          </select>
        </div>
        <div className="text-xs text-gray-500">
          {batches.length} batch{batches.length === 1 ? '' : 'es'} loaded •{' '}
          {verifiedDistributions.length} verified record
          {verifiedDistributions.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Totals card */}
      {selectedBatch && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-3">Batch Totals</h2>
          <p className="text-sm text-gray-600 mb-4">
            {selectedBatch.batchId} → {selectedBatch.barangay ?? '—'} •{' '}
            <span className="italic text-gray-500">
              {selectedBatch?.remarks || selectedBatch?.status || ''}
            </span>
          </p>

          {/* Families Served */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-6">
            <div className="border border-gray-200 h-30 flex flex-col rounded-lg justify-center items-center">
              <p className="text-4xl font-semibold text-blue-600">{verifiedDistributions.length}</p>
              <p className="text-gray-600 text-sm font-medium">Families Served</p>
            </div>
          </div>

          {/* Default items */}
          <div>
            <h3 className="text-md font-semibold mb-2">Default Relief Package</h3>
            {selectedBatch.defaultItems?.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-center">
                {selectedBatch.defaultItems.map((item, idx) => (
                  <div
                    key={`${item.itemCode || item.label || idx}-${idx}`}
                    className="border border-gray-200 h-30 flex flex-col rounded-lg justify-center items-center px-2 py-4"
                  >
                    <p className="text-3xl font-semibold text-blue-600">
                      {item.qty ?? 0}
                    </p>
                    <p className="text-gray-600 text-sm font-medium">
                      {item.label || item.itemCode || 'Item'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No default items defined.</p>
            )}
          </div>
        </div>
      )}

      {/* Household distributions table */}
      {selectedBatch && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Verified Household Distributions</h2>
            <span className="text-xs text-gray-500">
              {verifiedDistributions.length} verified
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Family Code</th>
                  <th className="px-3 py-2 text-left">Zone</th>
                  <th className="px-3 py-2 text-left">Items</th>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Proof</th>
                </tr>
              </thead>
              <tbody>
                {verifiedDistributions.length ? (
                  verifiedDistributions.map((d, idx) => (
                    <tr key={d._id || idx} className="border-t border-gray-200">
                      <td className="px-3 py-2 font-medium">{d.familyCode || '—'}</td>
                      <td className="px-3 py-2">{d.zone || '—'}</td>
                      <td className="px-3 py-2">
                        {Array.isArray(d.items) && d.items.length
                          ? d.items
                              .map(
                                (it) =>
                                  `${it.qty ?? 0} ${it.name ?? it.label ?? (it.itemCode || 'Item')} ${
                                    it.unit ? it.unit : ''
                                  }`.trim()
                              )
                              .join(', ')
                          : typeof d.items === 'string'
                          ? d.items
                          : '—'}
                      </td>
                      <td className="px-3 py-2">
                        {formatLocal(d.createdAt || d.date || d.timestamp)}
                      </td>
                      <td className="px-3 py-2">{d.status || 'Verified'}</td>
                      <td className="px-3 py-2">
                        {d._id ? (
                          <Link
                            to={`/public/proof/${d._id}`}
                            className="text-blue-600 hover:underline"
                          >
                            View Proof
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-3 py-6 text-center text-gray-500" colSpan={6}>
                      No verified distributions for this batch yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explorer;
