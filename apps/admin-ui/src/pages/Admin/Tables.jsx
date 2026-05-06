import React, { useState, useEffect, useRef } from 'react';
import { Plus, Download, Edit2, Trash2, QrCode, Loader2 } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import TableDrawer from './components/TableDrawer';
import QRModal from './components/QRModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import api from '../../api';
import { createSocketConnection } from '../../socket';
import { SOCKET_EVENTS } from '@restaurant-saas/shared';

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [qrModalConfig, setQrModalConfig] = useState({ isOpen: false, table: null });
  const [error, setError] = useState('');
  const [modalConfig, setModalConfig] = useState({ isOpen: false, tableId: null });

  const socketRef = useRef(null);

  useEffect(() => {
    fetchTables();
    
    // Socket.io integration
    const token = localStorage.getItem('token');
    socketRef.current = createSocketConnection('/tables', token);
    
    socketRef.current.on(SOCKET_EVENTS.TABLE_STATUS_UPDATED, (data) => {
      setTables(prev => prev.map(t => 
        t._id === data.tableId ? { ...t, isOccupied: data.isOccupied } : t
      ));
    });

    socketRef.current.connect();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tables');
      const data = response.data.data;
      setTables(data);
      
      if (data.length > 0 && socketRef.current) {
        socketRef.current.emit('join', `store:${data[0].storeId}`);
      }
    } catch (err) {
      console.error('Failed to fetch tables:', err);
      setError('Failed to load tables.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = () => {
    setEditingTable(null);
    setIsDrawerOpen(true);
  };

  const handleEditTable = (table) => {
    setEditingTable(table);
    setIsDrawerOpen(true);
  };

  const handleDeleteClick = (id) => {
    setModalConfig({ isOpen: true, tableId: id });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/tables/${modalConfig.tableId}`);
      setTables(tables.filter(t => t._id !== modalConfig.tableId));
      setModalConfig({ isOpen: false, tableId: null });
    } catch (err) {
      setError('Failed to delete table');
      setModalConfig({ isOpen: false, tableId: null });
    }
  };

  const handleDownloadQR = (table) => {
    if (!table.qrImageUrl) return;
    const link = document.createElement('a');
    link.href = table.qrImageUrl;
    link.download = `table-${table.tableNumber}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Tables & QR Codes</h2>
          <p className="text-sm text-text-secondary mt-1">Manage dining tables and corresponding QR codes</p>
        </div>
        <button 
          onClick={handleAddTable}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Table
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-error/10 border border-error/20 text-error text-sm rounded-lg font-medium flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-error/60 hover:text-error transition-colors text-lg">&times;</button>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : tables.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map(table => (
            <div
              key={table._id}
              onClick={() => setQrModalConfig({ isOpen: true, table })}
              className="bg-card-white border border-border-light rounded-xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all flex flex-col relative overflow-hidden group cursor-pointer"
            >
              <div className={`absolute top-0 left-0 w-full h-1 ${table.isOccupied ? 'bg-warning' : 'bg-success'}`}></div>
              <div className="p-6 flex flex-col items-center">
                <div className="flex justify-start w-full mb-2">
                  <StatusBadge status={table.isOccupied ? 'Occupied' : 'Free'} />
                </div>
                <div className="my-6 text-center">
                  <span className="text-sm text-text-muted font-medium uppercase tracking-widest">Table</span>
                  <h3 className="text-6xl font-black text-text-primary font-mono">{table.tableNumber}</h3>
                </div>
                <div className="w-24 h-24 bg-light-bg rounded-lg border border-border-light flex items-center justify-center mb-4 overflow-hidden">
                  {table.qrImageUrl ? (
                    <img src={table.qrImageUrl} alt="QR" className="w-full h-full object-contain p-2" />
                  ) : (
                    <QrCode className="w-16 h-16 text-text-secondary opacity-50" />
                  )}
                </div>
              </div>
              <div className="bg-light-bg border-t border-border-light p-3 flex justify-evenly text-text-secondary mt-auto">
                <button
                  onClick={(e) => { e.stopPropagation(); handleEditTable(table); }}
                  className="flex flex-col items-center gap-1 hover:text-primary transition-colors text-xs font-medium"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <div className="w-px h-full bg-border-light"></div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDownloadQR(table); }}
                  className="flex flex-col items-center gap-1 hover:text-primary transition-colors text-xs font-medium"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
                <div className="w-px h-full bg-border-light"></div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteClick(table._id); }}
                  className="flex flex-col items-center gap-1 hover:text-error transition-colors text-xs font-medium"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-text-muted">
          <QrCode className="w-16 h-16 mx-auto opacity-10 mb-4" />
          <p>No tables added yet.</p>
        </div>
      )}

      <TableDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        table={editingTable}
        onSave={fetchTables}
      />

      <QRModal 
        isOpen={qrModalConfig.isOpen}
        onClose={() => setQrModalConfig({ isOpen: false, table: null })}
        table={qrModalConfig.table}
      />

      <ConfirmationModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ isOpen: false, tableId: null })}
        onConfirm={confirmDelete}
        title="Delete Table"
        message="Are you sure you want to delete this table? This will invalidate the QR code."
      />
    </div>
  );
};

export default Tables;
