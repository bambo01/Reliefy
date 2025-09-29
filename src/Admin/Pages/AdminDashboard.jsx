import React from 'react';

const AdminDashboard = () => {
  const stats = [
    { label: 'Total Batches', value: 3 },
    { label: 'Total Distributions', value: 15 },
    { label: 'Active Barangays', value: 3 },
  ];

  const recentBatches = [
    { id: 'TY-2025-09-A', barangay: 'San Isidro', families: 120, createdAt: '2025-09-29' },
    { id: 'TY-2025-09-B', barangay: 'San Roque', families: 85, createdAt: '2025-09-29' },
    { id: 'FIRE-2025-09-01', barangay: 'Mabini', families: 45, createdAt: '2025-09-28' },
  ];

  const householdDistributions = [
    { familyCode: 'HH-001', batchId: 'TY-2025-09-A', zone: 'Purok 1', items: '1 Rice 25kg, 6 Cans, 10 Water', date: '2025-09-29' },
    { familyCode: 'HH-002', batchId: 'TY-2025-09-A', zone: 'Purok 5', items: '1 Rice 25kg, 6 Cans, 10 Water', date: '2025-09-29' },
    { familyCode: 'HH-010', batchId: 'TY-2025-09-B', zone: 'Purok 3', items: '2 Rice 10kg, 12 Noodles, 6 Water', date: '2025-09-29' },
    { familyCode: 'HH-015', batchId: 'FIRE-2025-09-01', zone: 'Block 2', items: '2 Blankets, 1 Hygiene Kit, 12 Water', date: '2025-09-28' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Page title */}
      <div >
        <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of batches and household distributions</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl p-4 text-center border border-gray-200 "
          >
            <p className="text-2xl font-bold text-blue-600">{s.value}</p>
            <p className="text-gray-600">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Batches */}
      <div className="bg-white rounded-xl border border-gray-200 ">
        <div className="px-4 sm:px-6 py-4 ">
          <h2 className="text-lg font-semibold">Recent Batches</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className='border-t border-gray-200'>
                <th className="px-3 py-2 text-left">Batch ID</th>
                <th className="px-3 py-2 text-left">Barangay</th>
                <th className="px-3 py-2 text-left">Families Served</th>
                <th className="px-3 py-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {recentBatches.map((b) => (
                <tr key={b.id} className="border-t border-gray-200">
                  <td className="px-3 py-2 font-medium">{b.id}</td>
                  <td className="px-3 py-2">{b.barangay}</td>
                  <td className="px-3 py-2">{b.families}</td>
                  <td className="px-3 py-2">{b.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Household Distributions */}
      <div className="bg-white rounded-xl border border-gray-200 ">
        <div className="px-4 sm:px-6 py-4">
          <h2 className="text-lg font-semibold">Household Distributions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className='border-t border-gray-200'>
                <th className="px-3 py-2 text-left">Family Code</th>
                <th className="px-3 py-2 text-left">Batch ID</th>
                <th className="px-3 py-2 text-left">Zone</th>
                <th className="px-3 py-2 text-left">Items</th>
                <th className="px-3 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {householdDistributions.map((h, idx) => (
                <tr key={idx} className="border-t border-gray-200">
                  <td className="px-3 py-2 font-medium">{h.familyCode}</td>
                  <td className="px-3 py-2">{h.batchId}</td>
                  <td className="px-3 py-2">{h.zone}</td>
                  <td className="px-3 py-2">{h.items}</td>
                  <td className="px-3 py-2">{h.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
