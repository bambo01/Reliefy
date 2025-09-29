// src/admin/AdminDistributions.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  useAccount,
  useChainId,
  usePublicClient,
  useSwitchChain,
  useWriteContract,
} from 'wagmi';
import { keccak256, stringToHex, toHex } from 'viem';

// ⬇️ NEW: pull ABI + address helpers from your contract module
import {
  RELIEFTRACE_ABI,
  getContractAddress,
  CHAIN,
} from '../../../contract';

// -------------------- Config --------------------
const TARGET_CHAIN_ID = Number(
  import.meta.env.VITE_TARGET_CHAIN_ID || CHAIN.BASE_SEPOLIA
);

// Debug flag
const DEBUG = true;

// -------------------- Helpers --------------------
const parseJSON = async (res) => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
};

// Extract a unit from labels like "Rice 25kg", "Water 1L", "Canned goods 6 pcs"
function splitNameUnit(label = '') {
  const m = label.match(/^(.*?)[\s-]*([\d.,]+\s?(?:kg|g|l|ml|pcs|cans|bottles))$/i);
  if (m) return { name: m[1].trim(), unit: m[2].trim() };
  return { name: label.trim(), unit: undefined };
}

// Convert UI items -> backend manifest items: { name, qty, unit? }
function toManifestItems(items = []) {
  return items.map(({ label, qty }) => {
    const { name, unit } = splitNameUnit(label);
    return unit ? { name, qty, unit } : { name, qty };
  });
}

// -------------------- Component --------------------
const AdminDistributions = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  // Batches
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [batchesError, setBatchesError] = useState('');

  // Form
  const [formData, setFormData] = useState({
    batchId: '',
    barangay: '',
    familyCode: '',
    zone: '',
    items: [],
  });

  // UX state
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(''); // 'pin' | 'anchor' | 'save'
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');

  // Load batches with graceful fallback
  useEffect(() => {
    let abort = false;

    const load = async () => {
      setLoadingBatches(true);
      setBatchesError('');
      try {
        // Try your hosted API first
        let res = await fetch('https://relieftracer.up.railway.app/api/batches', {
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) {
          if (res.status !== 404) {
            const data = await parseJSON(res);
            throw new Error(data?.message || data?.error || `Failed (${res.status})`);
          }
          // Fallback to local proxy if you have one
          res = await fetch('/api/batches', { headers: { Accept: 'application/json' } });
          if (!res.ok) {
            const data = await parseJSON(res);
            throw new Error(data?.message || data?.error || `Failed fallback (${res.status})`);
          }
        }
        const data = await parseJSON(res);
        const arr = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        if (!abort) setBatches(arr || []);
      } catch (err) {
        if (!abort) setBatchesError(String(err?.message || err));
        console.error('Load batches error:', err);
      } finally {
        if (!abort) setLoadingBatches(false);
      }
    };

    load();
    return () => {
      abort = true;
    };
  }, []);

  // Fast lookup
  const batchMap = useMemo(
    () => Object.fromEntries((batches || []).map((b) => [b.batchId, b])),
    [batches]
  );

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBatchChange = async (e) => {
    const selectedId = e.target.value;
    const batch = batchMap[selectedId];

    // Reset if none
    if (!batch) {
      setFormData((prev) => ({ ...prev, batchId: '', barangay: '', items: [] }));
      return;
    }

    const setFromBatch = (b) => {
      const itemsCopy = Array.isArray(b?.defaultItems) ? b.defaultItems.map((it) => ({ ...it })) : [];
      setFormData((prev) => ({
        ...prev,
        batchId: b.batchId,
        barangay: b.barangay || '',
        items: itemsCopy,
      }));
    };

    if (Array.isArray(batch.defaultItems)) {
      setFromBatch(batch);
      return;
    }

    // Fetch full details if options list didn't include defaultItems
    try {
      const res = await fetch(`/api/batches/${encodeURIComponent(selectedId)}`, {
        headers: { Accept: 'application/json' },
      });
      const data = await parseJSON(res);
      if (!res.ok) {
        console.error('GET batch detail failed', res.status, data);
        setFromBatch(batch);
        return;
      }
      const full = data?.data || data || {};
      setFromBatch(full);
    } catch (err) {
      console.error('GET batch detail error', err);
      setFromBatch(batch);
    }
  };

  const handleQtyChange = (index, value) => {
    const qtyNum = Math.max(0, Number(value) || 0);
    setFormData((prev) => {
      const next = [...prev.items];
      next[index] = { ...next[index], qty: qtyNum };
      return { ...prev, items: next };
    });
  };

  // -------------------- Submit (full flow) --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');
    setStep('');

    if (DEBUG) console.group('AdminDistributions.handleSubmit');
    console.time('submit-total');

    // Validate
    if (!formData.batchId || !formData.familyCode) {
      const msg = 'Please select a batch and enter a family code.';
      if (DEBUG) console.warn('[validate] fail:', { formData });
      setApiError(msg);
      if (DEBUG) console.groupEnd();
      return;
    }
    if (!formData.items?.length) {
      const msg = 'No items to distribute. Select a batch first.';
      if (DEBUG) console.warn('[validate] no items:', { formData });
      setApiError(msg);
      if (DEBUG) console.groupEnd();
      return;
    }

    const selectedBatch = batchMap[formData.batchId];
    const createdBy = address || '0xOfficerAddr';
    const timestamp = new Date().toISOString();

    try {
      setSubmitting(true);

      // 1) Build raw manifest (exact shape backend expects)
      const manifest = {
        version: 'relieftrace/1.0',
        kind: 'distribution',
        batchId: formData.batchId,
        familyCode: formData.familyCode,
        barangay: formData.barangay,
        zone: formData.zone,
        batchRemarks: selectedBatch?.remarks || '',
        items: toManifestItems(formData.items), // [{ name, qty, unit? }]
        meta: { createdBy, timestamp },
      };
      if (DEBUG) console.log('[manifest]', manifest);

      // 2) Pin to IPFS via backend (raw manifest in body)
      setStep('pin');
      if (DEBUG) console.log('POST /api/ipfs/pin (raw manifest)');
      const pinRes = await fetch('https://relieftracer.up.railway.app/api/ipfs/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(manifest),
      });
      const pinText = await pinRes.text();
      let pinData;
      try {
        pinData = pinText ? JSON.parse(pinText) : {};
      } catch {
        pinData = { raw: pinText };
      }
      if (DEBUG) console.log('[pin response]', { status: pinRes.status, pinData });
      if (!pinRes.ok || !pinData?.cid) {
        const msg = pinData?.message || pinData?.error || `Pin failed (${pinRes.status})`;
        throw new Error(msg);
      }
      const cid = pinData.cid;
      const dataHashFromServer = pinData.dataHash; // backend returns it
      if (DEBUG) console.log('✅ CID:', cid, '✅ dataHash:', dataHashFromServer);

      // 3) Compute remaining hashes locally for contract
      const familyCodeHash = keccak256(stringToHex(formData.familyCode));
      const itemsHash = keccak256(toHex(JSON.stringify(manifest.items)));
      if (DEBUG) console.table({ familyCodeHash, itemsHash });

      // 4) Ensure correct chain & call contract
      if (chainId !== TARGET_CHAIN_ID) {
        if (DEBUG) console.log('Switching chain…', { from: chainId, to: TARGET_CHAIN_ID });
        await switchChainAsync({ chainId: TARGET_CHAIN_ID });
      }

      const contractAddress = getContractAddress(TARGET_CHAIN_ID);
      if (!contractAddress) {
        throw new Error('Contract address not set. Update .env or contracts/contract.js');
      }

      setStep('anchor');
      if (DEBUG)
        console.log('recordDistribution args:', [
          formData.batchId,
          familyCodeHash,
          itemsHash,
          dataHashFromServer,
        ]);
     // pause before contract write
      const txHash = await writeContractAsync({
        abi: RELIEFTRACE_ABI,
        address: contractAddress,
        functionName: 'recordDistribution',
        args: [formData.batchId, familyCodeHash, itemsHash, dataHashFromServer],
        chainId: TARGET_CHAIN_ID,
      });
      if (DEBUG) console.log('txHash:', txHash);

      await publicClient.waitForTransactionReceipt({ hash: txHash });

      // 5) Save to DB
      setStep('save');
      const doc = {
        _id: `dist_${formData.batchId}_${formData.familyCode}`,
        batchId: formData.batchId,
        familyCode: formData.familyCode,
        barangay: formData.barangay,
        zone: formData.zone,
        items: formData.items, // keep original UI items for officer view
        remarks: selectedBatch?.remarks ?? '',
        cid,
        dataHash: dataHashFromServer,
        txHash,
        status: 'verified',
        meta: { createdBy, timestamp },
      };
      if (DEBUG) console.log('POST /api/distributions', doc);

      const saveRes = await fetch('https://relieftracer.up.railway.app/api/distributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(doc),
      });
      const saveText = await saveRes.text();
      let saveData;
      try {
        saveData = saveText ? JSON.parse(saveText) : {};
      } catch {
        saveData = { raw: saveText };
      }
      if (DEBUG) console.log('[save response]', { status: saveRes.status, saveData });
      if (!saveRes.ok) {
        throw new Error(saveData?.message || saveData?.error || `Save failed (${saveRes.status})`);
      }

      setApiSuccess('Distribution recorded successfully.');
      setFormData({ batchId: '', barangay: '', familyCode: '', zone: '', items: [] });

      console.timeEnd('submit-total');
      console.groupEnd();
    } catch (err) {
      console.error('[handleSubmit] Error:', err);
      setApiError(String(err?.message || err));
      console.groupEnd?.();
    } finally {
      setSubmitting(false);
      setStep('');
    }
  };

  // -------------------- UI --------------------
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold">Add Family Distribution</h2>
          <p className="text-sm text-gray-500 mt-1">
            Select a batch to auto-fill its default items; adjust quantities as needed.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-6 space-y-6">
          {/* Batch + barangay */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Batch</label>
              <select
                name="batchId"
                value={formData.batchId}
                onChange={handleBatchChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
                disabled={loadingBatches}
              >
                <option value="">
                  {loadingBatches ? 'Loading batches…' : 'Select a batch…'}
                </option>
                {batches.map((b) => (
                  <option key={b._id || b.batchId} value={b.batchId}>
                    {b.batchId}
                    {b.barangay ? ` — ${b.barangay}` : ''}
                  </option>
                ))}
              </select>
              {batchesError && <p className="text-xs text-red-600 mt-1">{batchesError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Barangay</label>
              <input
                type="text"
                name="barangay"
                value={formData.barangay}
                readOnly
                className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50"
                placeholder="Auto-filled from batch"
              />
              {formData.batchId && (
                <p className="text-xs text-gray-600 mt-2">
                  <span className="font-medium">Batch Remarks:</span>{' '}
                  {batchMap[formData.batchId]?.remarks || '—'}
                </p>
              )}
            </div>
          </div>

          {/* Family + zone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Family Code</label>
              <input
                type="text"
                name="familyCode"
                value={formData.familyCode}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
                placeholder="e.g., HH-002"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Zone</label>
              <input
                type="text"
                name="zone"
                value={formData.zone}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
                placeholder="e.g., Purok 5"
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-base font-semibold mb-3">Items from Batch</h3>
            <div className="mt-2 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="border border-gray-200">
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Item Code</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Label</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.length === 0 ? (
                    <tr>
                      <td className="px-3 py-3 text-gray-500" colSpan={3}>
                        Select a batch to load its default items.
                      </td>
                    </tr>
                  ) : (
                    formData.items.map((item, idx) => (
                      <tr key={`${item.itemCode}-${idx}`} className="border-t border-gray-200">
                        <td className="px-3 py-2">{item.itemCode}</td>
                        <td className="px-3 py-2">{item.label}</td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="0"
                            value={item.qty}
                            onChange={(e) => handleQtyChange(idx, e.target.value)}
                            className="w-24 border border-gray-200 rounded-lg px-2 py-1"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * Quantities can be adjusted per household; items are derived from the selected batch.
            </p>
          </div>

          {/* Status / Errors */}
          {(apiError || apiSuccess || submitting) && (
            <div className="text-sm">
              {submitting && (
                <p className="text-gray-600">
                  {step === 'pin' && 'Pinning manifest to IPFS…'}
                  {step === 'anchor' && 'Anchoring record on Base…'}
                  {step === 'save' && 'Saving distribution to database…'}
                  {!step && 'Processing…'}
                </p>
              )}
              {apiError && <p className="text-red-600">{apiError}</p>}
              {apiSuccess && <p className="text-green-600">{apiSuccess}</p>}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={() =>
                setFormData({ batchId: '', barangay: '', familyCode: '', zone: '', items: [] })
              }
              disabled={submitting}
              className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-60"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg text-white ${
                submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {submitting ? 'Saving…' : 'Save Distribution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDistributions;
