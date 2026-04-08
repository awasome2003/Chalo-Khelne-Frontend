/**
 * Horizontal action bar for page-level or section-level controls.
 * Use at the top of a page for filters, search, or bulk actions.
 *
 * Props:
 * - left: content for left side (e.g. filter tabs, search)
 * - right: content for right side (e.g. buttons, export)
 * - sticky: make it stick to top of scroll container
 */
export default function ActionBar({ left, right, sticky = false, className = "" }) {
  return (
    <div
      className={`
        flex items-center justify-between gap-4 flex-wrap
        bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 px-4 py-3
        ${sticky ? "sticky top-0 z-10 shadow-sm" : ""}
        ${className}
      `}
    >
      {left && <div className="flex items-center gap-2 flex-wrap">{left}</div>}
      {right && <div className="flex items-center gap-2 flex-wrap ml-auto">{right}</div>}
    </div>
  );
}
