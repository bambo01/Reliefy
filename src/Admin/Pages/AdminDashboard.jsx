// src/AdminDashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";

const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_RELIEFTRACER_API) ||
  "https://relieftracer.up.railway.app/api";

const AdminDashboard = () => {
  const [batches, setBatches] = useState([]);
  const [dists, setDists] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Fetch batches & distributions ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [batchesRes, distsRes] = await Promise.all([
          fetch(`${API_URL}/batches`),
          fetch(`${API_URL}/distributions`),
        ]);

        if (!batchesRes.ok) throw new Error("Failed to fetch batches");
        if (!distsRes.ok) throw new Error("Failed to fetch distributions");

        const batchesData = await batchesRes.json();
        const distsData = await distsRes.json();

        setBatches(Array.isArray(batchesData) ? batchesData : []);
        setDists(Array.isArray(distsData) ? distsData : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Helpers ---
  const isVerified = (dist) => {
    if (dist?.verified === true) return true;
    const s = String(dist?.status || "").toLowerCase();
    return s.includes("verified") || s.includes("✅");
  };

  const verifiedDistributions = useMemo(
    () => dists.filter((d) => isVerified(d)),
    [dists]
  );

  // --- Stats ---
  const stats = [
    { label: "Total Batches", value: batches.length },
    { label: "Total Distributions", value: verifiedDistributions.length },
    {
      label: "Active Barangays",
      value: new Set(batches.map((b) => b.barangay || "—")).size,
    },
  ];

  // --- Recent batches (latest 5) ---
  const recentBatches = [...batches]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // --- UI ---
  if (loading) {
    return (
      <div className="p-4">
        <p className="text-gray-600">Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">
          Overview of batches and household distributions
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl p-4 text-center border border-gray-200"
          >
            <p className="text-2xl font-bold text-blue-600">{s.value}</p>
            <p className="text-gray-600">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Batches */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 sm:px-6 py-4">
          <h2 className="text-lg font-semibold">Recent Batches</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="border-t border-gray-200">
                <th className="px-3 py-2 text-left">Batch ID</th>
                <th className="px-3 py-2 text-left">Barangay</th>
                <th className="px-3 py-2 text-left">Families Served</th>
                <th className="px-3 py-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {recentBatches.map((b) => {
                const familiesServed = verifiedDistributions.filter(
                  (d) =>
                    d.batchId === b.batchId ||
                    d.batch?._id === b._id ||
                    d.batch === b._id
                ).length;

                return (
                  <tr key={b._id} className="border-t border-gray-200">
                    <td className="px-3 py-2 font-medium">{b.batchId}</td>
                    <td className="px-3 py-2">{b.barangay || "—"}</td>
                    <td className="px-3 py-2">{familiesServed}</td>
                    <td className="px-3 py-2">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Household Distributions */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 sm:px-6 py-4">
          <h2 className="text-lg font-semibold">Verified Household Distributions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="border-t border-gray-200">
                <th className="px-3 py-2 text-left">Family Code</th>
                <th className="px-3 py-2 text-left">Batch ID</th>
                <th className="px-3 py-2 text-left">Zone</th>
                <th className="px-3 py-2 text-left">Items</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Proof</th>
              </tr>
            </thead>
            <tbody>
              {verifiedDistributions.map((h, idx) => (
                <tr key={h._id || idx} className="border-t border-gray-200">
                  <td className="px-3 py-2 font-medium">{h.familyCode || "—"}</td>
                  <td className="px-3 py-2">{h.batchId || "—"}</td>
                  <td className="px-3 py-2">{h.zone || "—"}</td>
                  <td className="px-3 py-2">
                    {Array.isArray(h.items)
                      ? h.items.map((it) => `${it.qty} ${it.label}`).join(", ")
                      : typeof h.items === "string"
                      ? h.items
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {new Date(h.createdAt || h.date).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2">
                    {h._id ? (
                      <Link
                        to={`/public/proof/${h._id}`}
                        className="text-blue-600 hover:underline"
                      >
                        View Proof
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
              {!verifiedDistributions.length && (
                <tr>
                  <td
                    className="px-3 py-6 text-center text-gray-500"
                    colSpan={6}
                  >
                    No verified distributions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
