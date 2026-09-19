import React, { useState } from 'react';
import { ShieldCheck, Check, X, FileText, Phone, Mail, Award } from 'lucide-react';

export default function ProviderApprovals() {
  const [providers, setProviders] = useState([
    {
      id: 'prov_app_01',
      business_name: 'Apex Performance Motors',
      owner_name: 'Dominic Torelli',
      email: 'contact@apexperformance.com',
      phone: '+1 (555) 234-5678',
      license_number: 'GAR-2024-8891',
      category: 'Full Service Auto Garage',
      submitted_at: '6 hours ago',
      documents: ['Business License.pdf', 'ASE Certification.pdf', 'Liability Insurance.pdf'],
    },
    {
      id: 'prov_app_02',
      business_name: 'Precision Mobile Diagnostics',
      owner_name: 'Samantha Ray',
      email: 'sam@precisiondiagnostics.net',
      phone: '+1 (555) 876-5432',
      license_number: 'MEC-2024-1102',
      category: 'Mobile Field Mechanic',
      submitted_at: 'Yesterday',
      documents: ['Master Tech Certificate.pdf', 'Identity Verification.pdf'],
    },
  ]);

  const [feedback, setFeedback] = useState('');

  const handleApprove = (id) => {
    setProviders(providers.filter(p => p.id !== id));
    setFeedback(`Provider application ${id} approved successfully.`);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleReject = (id) => {
    setProviders(providers.filter(p => p.id !== id));
    setFeedback(`Provider application ${id} rejected.`);
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Provider Approvals</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Review business credentials, ASE technician licenses, and liability insurance before granting platform mechanic status.
        </p>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm font-semibold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          {feedback}
        </div>
      )}

      {providers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Clear!</h3>
          <p className="text-sm text-slate-500">There are no pending service provider applications to review right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {providers.map((p) => (
            <div
              key={p.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{p.business_name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                      {p.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Submitted {p.submitted_at} • ID: {p.id}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleReject(p.id)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 transition-colors flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(p.id)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Approve License
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-400 block mb-1">Owner / Primary Contact</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{p.owner_name}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-400 block mb-1">License & Registration</span>
                  <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">{p.license_number}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-400 block mb-1">Contact Info</span>
                  <span className="text-slate-800 dark:text-slate-200">{p.phone}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">
                  Attached Verification Documents
                </span>
                <div className="flex flex-wrap gap-2">
                  {p.documents.map((doc, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      <FileText className="w-3.5 h-3.5 text-brand-500" />
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
