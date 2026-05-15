import { useState } from "react";

/**
 * NoteView — shown in the main content area when a note is selected.
 * Props: note
 */
export default function NoteView({ note }) {
  const [checkedItems, setCheckedItems] = useState({});

  const toggleItem = (idx) =>
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));

  const date = new Date(note.createdAt).toLocaleString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fade-up space-y-6 max-w-2xl mx-auto w-full">
      {/* Date heading */}
      <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">{date}</p>

      {/* ── Transcript ── */}
      <section aria-labelledby="transcript-heading">
        <div className="flex items-center gap-2 mb-3">
          {/* Document icon */}
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100">
            <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z" />
            </svg>
          </span>
          <h2 id="transcript-heading" className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Transcript
          </h2>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-5">
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
            {note.transcript || "No transcript available."}
          </p>
        </div>
      </section>

      {/* ── AI Summary ── */}
      <section aria-labelledby="summary-heading">
        <div className="flex items-center gap-2 mb-3">
          {/* Sparkle icon */}
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100">
            <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.09 6.26L20 10l-6.26 2.09L12 22l-2.09-6.26L4 14l6.26-2.09L12 2z" />
            </svg>
          </span>
          <h2 id="summary-heading" className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
            AI Summary
          </h2>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 sm:p-5">
          <p className="text-slate-700 text-sm leading-relaxed">
            {note.summary || "No summary available."}
          </p>
        </div>
      </section>

      {/* ── Action Items ── */}
      {note.actionItems?.length > 0 && (
        <section aria-labelledby="actions-heading">
          <div className="flex items-center gap-2 mb-3">
            {/* Checklist icon */}
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-green-100">
              <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <h2 id="actions-heading" className="text-sm font-semibold text-green-700 uppercase tracking-wide">
              Action Items
            </h2>
            <span className="ml-auto text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {note.actionItems.length}
            </span>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl shadow-sm divide-y divide-slate-50">
            {note.actionItems.map((item, idx) => (
              <label
                key={idx}
                className="flex items-start gap-3 px-4 sm:px-5 py-3 sm:py-3.5 cursor-pointer hover:bg-slate-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                <input
                  type="checkbox"
                  className="action-check mt-0.5 shrink-0"
                  checked={!!checkedItems[idx]}
                  onChange={() => toggleItem(idx)}
                />
                <span
                  className={`text-sm leading-snug transition-all duration-200 ${
                    checkedItems[idx] ? "line-through text-slate-400" : "text-slate-700"
                  }`}
                >
                  {item}
                </span>
                {checkedItems[idx] && (
                  <svg className="ml-auto shrink-0 w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.2l-3.5-3.5-1.4 1.4L9 19 20 8l-1.4-1.4L9 16.2z" />
                  </svg>
                )}
              </label>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
