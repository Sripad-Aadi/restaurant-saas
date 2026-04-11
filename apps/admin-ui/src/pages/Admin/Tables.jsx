import React, { useState } from 'react';
import { Plus, Printer, Download, Eye, Trash2, QrCode } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

const Tables = () => {
  const [tables] = useState([
    { id: 1, number: '1', status: 'Free' },
    { id: 2, number: '2', status: 'Occupied' },
    { id: 3, number: '3', status: 'Occupied' },
    { id: 4, number: '4', status: 'Free' },
    { id: 5, number: '5', status: 'Occupied' },
    { id: 6, number: '6', status: 'Free' },
    { id: 7, number: '7', status: 'Free' },
    { id: 8, number: '8', status: 'Occupied' },
  ]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Tables & QR Codes</h2>
          <p className="text-sm text-text-secondary mt-1">Manage dining tables and corresponding QR codes</p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Tables
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tables.map(table => (
          <div key={table.id} className="bg-card-white border border-border-light rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-full h-1 ${table.status === 'Occupied' ? 'bg-warning' : 'bg-success'}`}></div>
            
            <div className="p-6 flex flex-col items-center">
              <div className="flex justify-between w-full mb-2">
                <StatusBadge status={table.status} />
                <button className="text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="my-6 text-center">
                <span className="text-sm text-text-muted font-medium uppercase tracking-widest">Table</span>
                <h3 className="text-6xl font-black text-text-primary font-mono">{table.number}</h3>
              </div>
              
              <div className="w-24 h-24 bg-light-bg rounded-lg border border-border-light flex items-center justify-center mb-4">
                <QrCode className="w-16 h-16 text-text-secondary opacity-50" />
              </div>
            </div>
            
            <div className="bg-light-bg border-t border-border-light p-3 flex justify-evenly text-text-secondary mt-auto">
              <button className="flex flex-col items-center gap-1 hover:text-primary transition-colors text-xs font-medium">
                <Eye className="w-4 h-4" /> View
              </button>
              <div className="w-px h-full bg-border-light"></div>
              <button className="flex flex-col items-center gap-1 hover:text-primary transition-colors text-xs font-medium">
                <Download className="w-4 h-4" /> Download
              </button>
              <div className="w-px h-full bg-border-light"></div>
              <button className="flex flex-col items-center gap-1 hover:text-primary transition-colors text-xs font-medium">
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tables;
