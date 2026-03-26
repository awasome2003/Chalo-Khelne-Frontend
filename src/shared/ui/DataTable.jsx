/**
 * Standardized data table with header styling.
 *
 * columns: [{ key, label, align, render }]
 * data: array of row objects
 * onRowClick: (row) => void
 */
export default function DataTable({ columns, data, onRowClick, emptyText = "No data", className = "" }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-gray-400">{emptyText}</div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider ${
                  col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row._id || row.id || idx}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-gray-50 ${
                onRowClick ? "cursor-pointer hover:bg-gray-50 transition" : ""
              }`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`py-3.5 px-4 text-sm ${
                    col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
