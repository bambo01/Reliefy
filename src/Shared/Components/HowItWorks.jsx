// src/landing/HowItWorks.jsx
import React from 'react';

const IconPencil = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      d="M16.862 3.487a1.75 1.75 0 0 1 2.475 2.475L8.75 16.55l-4 1 1-4L16.862 3.487zM15 5l4 4" />
  </svg>
);

const IconStamp = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      d="M9 12a3 3 0 1 1 6 0v1h2a1 1 0 0 1 1 1v3H6v-3a1 1 0 0 1 1-1h2v-1z" />
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      d="M5 19h14" />
  </svg>
);

const IconDashboard = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth="2"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth="2"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth="2"/>
    <path strokeWidth="2" strokeLinecap="round" d="M14 17h7M14 21h7" />
  </svg>
);

const steps = [
  {
    title: 'Create a Batch',
    desc:
      'Officers set up a relief batch with default items like rice, canned goods, and water, ready for distribution.',
    Icon: IconPencil,
  },
  {
    title: 'Record Family Distribution',
    desc:
      'Each family is logged with a unique code and zone. Items are auto-filled from the batch, adjusted if needed, and securely saved as a tamper-proof record.',
    Icon: IconStamp,
  },
  {
    title: 'View Public Dashboard',
    desc:
      'Residents and NGOs can view totals by batch, barangay, or zone through a public dashboard. Each record links to a proof page with a verified badge and Base transaction details.',
    Icon: IconDashboard,
  },
];

export default function HowItWorks({ className = '' }) {
  return (
    <section id="how" className={`py-16 sm:py-20 ${className}`}>
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-center">How It Works</h2>

        <p className="mt-3 text-center text-gray-600">
          ReliefTrace makes relief distribution transparent and accountable
        </p>
        <p className="text-center text-gray-600">
          by recording every batch and family served, then publishing trusted reports that anyone can verify.
        </p>

        <div className="mt-12 grid gap-10 sm:gap-12 grid-cols-1 md:grid-cols-3">
          {steps.map(({ title, desc, Icon }) => (
            <div key={title} className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                <Icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
