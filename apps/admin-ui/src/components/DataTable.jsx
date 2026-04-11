import React from 'react';

const DataTable = ({ columns, data, onRowClick }) => {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-border-light shadow-sm bg-card-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-light-bg border-b border-border-light text-text-secondary text-sm">
              <th className="px-4 py-3 w-8">
                <input type="checkbox" className="rounded border-border-light text-primary focus:ring-primary h-4 w-4" />
              </th>
              {columns.map((col, i) => (
                <th key={i} className="px-4 py-3 font-semibold">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className={`border-b border-border-light last:border-0 hover:bg-light-bg/50 transition-colors cursor-pointer ${rowIndex % 2 !== 0 ? 'bg-light-bg/30' : 'bg-card-white'}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" className="rounded border-border-light text-primary focus:ring-primary h-4 w-4" />
                  </td>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-4 py-3 text-sm text-text-primary">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-12 text-center text-text-muted">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-border-light bg-light-bg flex justify-between items-center text-sm text-text-secondary">
        <div>Showing {data.length} entries</div>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-card-white border border-border-light rounded hover:bg-light-bg disabled:opacity-50" disabled>Previous</button>
          <button className="px-3 py-1 bg-card-white border border-border-light rounded hover:bg-light-bg disabled:opacity-50" disabled>Next</button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
