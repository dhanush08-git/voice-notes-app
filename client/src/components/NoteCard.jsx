/**
 * NoteCard — shown in the left sidebar.
 * Props: note, isSelected, onClick
 */
export default function NoteCard({ note, isSelected, onClick }) {
  const date = new Date(note.createdAt);
  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });

  const previewText = note.transcript?.slice(0, 80) || "No transcript";
  const actionCount = note.actionItems?.length ?? 0;

  const badgeColor =
    actionCount === 0
      ? "bg-slate-100 text-slate-500"
      : actionCount <= 2
      ? "bg-blue-100 text-blue-700"
      : "bg-amber-100 text-amber-700";

  return (
    <button
      id={`note-card-${note._id}`}
      onClick={onClick}
      className={`
        w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 group
        ${isSelected
          ? "bg-blue-600 border-blue-600 shadow-md shadow-blue-200"
          : "bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm hover:bg-slate-50"
        }
      `}
    >
      {/* Top row: date + action-items badge */}
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-xs font-medium ${isSelected ? "text-blue-200" : "text-slate-400"}`}>
          {dateStr} · {timeStr}
        </span>
        {actionCount > 0 && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
              isSelected ? "bg-white/20 text-white" : badgeColor
            }`}
          >
            {actionCount} {actionCount === 1 ? "task" : "tasks"}
          </span>
        )}
      </div>

      {/* Preview text */}
      <p
        className={`text-sm leading-snug line-clamp-2 ${
          isSelected ? "text-white" : "text-slate-600"
        }`}
      >
        {previewText}{previewText.length >= 80 ? "…" : ""}
      </p>
    </button>
  );
}
