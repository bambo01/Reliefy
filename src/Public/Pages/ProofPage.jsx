// src/public/ProofPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RELIEFTRACER_API) ||
  'https://relieftracer.up.railway.app/api';

const Badge = ({ status, verified }) => {
  // normalize status
  const s = String(status || '').toLowerCase();
  const isVerified =
    verified === true || s.includes('verified') || s.includes('✅');

  const map = {
    verified: { text: 'Verified', cls: 'bg-green-100 text-green-700 border-green-200' },
    pending: { text: 'Pending', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    mismatch: { text: 'Mismatch', cls: 'bg-red-100 text-red-700 border-red-200' },
  };

  const key = isVerified ? 'verified' : s.includes('mismatch') ? 'mismatch' : 'pending';
  const m = map[key];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${m.cls}`}
    >
      {m.text}
    </span>
  );
};

const ProofPage = () => {
  const { distributionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [dists, setDists] = useState([]);

  useEffect(() => {
    const fetchDistributions = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/distributions`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setDists(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to fetch distributions:', e);
        setErr('Failed to load distribution.');
      } finally {
        setLoading(false);
      }
    };
    fetchDistributions();
  }, []);

  const record = useMemo(() => {
    if (!distributionId) return undefined;
    return dists.find((d) => d._id === distributionId) || undefined;
  }, [dists, distributionId]);

  const totalItems = useMemo(() => {
    if (!record?.items || !Array.isArray(record.items)) return 0;
    return record.items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
  }, [record]);

  const dateStr = useMemo(() => {
    if (!record?.timestamp && !record?.date) return '—';
    const iso = record.timestamp || record.date;
    const dt = new Date(iso);
    return isNaN(dt.getTime()) ? String(iso) : dt.toLocaleString();
  }, [record]);

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-gray-600">Loading…</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
          {err}
        </div>
        <div className="mt-4">
          <Link to="/public" className="text-blue-600 hover:underline text-sm">
            ← Back to Explorer
          </Link>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="p-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Proof of Distribution</h1>
        <p className="text-gray-600 mt-2">
          We couldn’t find a distribution with ID:
          <code className="ml-1 px-1 py-0.5 bg-gray-100 rounded">{distributionId}</code>
        </p>
        <div className="mt-4">
          <Link to="/public" className="text-blue-600 hover:underline text-sm">
            ← Back to Explorer
          </Link>
        </div>
      </div>
    );
  }

  const items = Array.isArray(record.items) ? record.items : [];
  const safeText = (v) => (v ?? '—');

  // Prefer fields if present
  const batchId = record.batchId || record.batchCode || record.batch?._id || '—';
  const status = record.status || (record.verified ? 'verified' : 'pending');
  const barangay = record.barangay || record.location || '—';
  const zone = record.zone || record.purok || '—';

  // Optional proof fields (render buttons only if present)
  const baseScanUrl = record.baseScanUrl || record.blockchainUrl || '';
  const ipfsUrl = record.ipfsUrl || record.ipfs || '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Proof of Distribution</h1>
          <p className="text-gray-600">This page confirms a specific household pickup.</p>
        </div>
        <Badge status={status} verified={record.verified} />
      </div>

      {/* Summary card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left */}
          <div>
            <h2 className="text-lg font-semibold">Summary</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <span className="text-gray-500">Batch:</span>{' '}
                <strong>{safeText(batchId)}</strong>
              </li>
              <li>
                <span className="text-gray-500">Household:</span>{' '}
                <strong>{safeText(record.familyCode)}</strong>
              </li>
              <li>
                <span className="text-gray-500">Location:</span>{' '}
                {safeText(barangay)} — {safeText(zone)}
              </li>
              <li>
                <span className="text-gray-500">Date &amp; Time:</span> {dateStr}
              </li>
            </ul>

            <div className="mt-4 text-sm">
              <p className="text-gray-700">
                The record is <strong>{String(status).toUpperCase()}</strong>. “Verified”
                means the on-chain proof matches this record.
              </p>
            </div>

            {/* Proof links */}
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              {baseScanUrl ? (
                <a
                  href={baseScanUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm text-center hover:bg-blue-700"
                  title="View transaction on BaseScan"
                >
                  View Blockchain Proof
                </a>
              ) : null}

              {ipfsUrl ? (
                <a
                  href={ipfsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-center hover:bg-gray-50"
                  title="View JSON on IPFS"
                >
                  View JSON (IPFS)
                </a>
              ) : null}
            </div>
          </div>

          {/* Right: Items */}
          <div>
            <h2 className="text-lg font-semibold">Items Received</h2>
            <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
              {items.length ? (
                <>
                  <ul className="space-y-1 text-sm">
                    {items.map((it, i) => (
                      <li key={i} className="flex justify-between">
                        <span>
                          {it.label || it.name || it.itemCode || 'Item'}
                          {it.unit ? ` (${it.unit})` : ''}
                        </span>
                        <span className="font-medium">x {it.qty ?? 0}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 text-right text-sm text-gray-600">
                    Total items: <strong>{totalItems}</strong>
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500">No items recorded.</div>
              )}
            </div>
          </div>
        </div>

        {/* Technical details (collapsible) */}
        <TechDetails record={record} />

        {/* Back link */}
        <div className="mt-6">
          <Link to="/public" className="text-blue-600 hover:underline text-sm">
            ← Back to Explorer
          </Link>
        </div>
      </div>
    </div>
  );
};

const TechDetails = ({ record }) => {
  const [open, setOpen] = useState(false);
  const fields = [
    ['Distribution ID', record._id],
    ['Data Hash', record.dataHash],
    ['IPFS CID', record.cid],
    ['Base Tx Hash', record.txHash],
  ].filter(([, v]) => v);

  if (!fields.length) {
    return (
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-sm text-blue-600 hover:underline"
        >
          {open ? 'Hide technical details' : 'Show technical details'}
        </button>
        {open && (
          <div className="mt-3 text-xs text-gray-500">
            No technical fields available for this record.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-sm text-blue-600 hover:underline"
      >
        {open ? 'Hide technical details' : 'Show technical details'}
      </button>

      {open && (
        <div className="mt-3 grid gap-3 text-xs bg-gray-50 border border-gray-200 rounded-lg p-3">
          {fields.map(([label, value]) => (
            <div key={label}>
              <div className="text-gray-500">{label}</div>
              <code className="break-all">{String(value)}</code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProofPage;
