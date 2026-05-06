import React from 'react';
import { X, Download, Printer, ExternalLink } from 'lucide-react';

const QRModal = ({ isOpen, onClose, table }) => {
  if (!isOpen || !table) return null;

  const handleDownload = () => {
    if (!table.qrImageUrl) return;
    const link = document.createElement('a');
    link.href = table.qrImageUrl;
    link.download = `table-${table.tableNumber}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Table ${table.tableNumber} QR Code</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
            img { width: 300px; height: 300px; margin-bottom: 20px; }
            h1 { font-size: 24px; margin: 0; }
          </style>
        </head>
        <body>
          <img src="${table.qrImageUrl}" />
          <h1>Table ${table.tableNumber}</h1>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark-bg/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="bg-card-white w-full max-w-lg rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden border border-border-light">
        <div className="px-6 py-4 border-b border-border-light flex justify-between items-center bg-light-bg/50">
          <div>
            <h3 className="font-bold text-lg text-text-primary">Table {table.tableNumber} QR Code</h3>
            <p className="text-xs text-text-secondary">Scan to view menu and order</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-border-light rounded-full transition-colors text-text-muted hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-10 flex flex-col items-center gap-8">
          <div className="p-6 bg-white rounded-3xl shadow-xl border border-border-light">
            {table.qrImageUrl ? (
              <img src={table.qrImageUrl} alt="QR Code" className="w-64 h-64 object-contain" />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-gray-400 text-sm">QR not available</div>
            )}
          </div>

          <div className="w-full grid grid-cols-2 gap-4">
            <button 
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-light-bg border border-border-light rounded-xl font-bold text-text-primary hover:bg-border-light transition-all active:scale-95"
            >
              <Download className="w-5 h-5" /> Download
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-light-bg border border-border-light rounded-xl font-bold text-text-primary hover:bg-border-light transition-all active:scale-95"
            >
              <Printer className="w-5 h-5" /> Print
            </button>
            <a 
              href={table.qrCodeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`col-span-2 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 ${
                table.qrCodeUrl
                  ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
                  : 'bg-light-bg text-text-muted cursor-not-allowed'
              }`}
            >
              <ExternalLink className="w-5 h-5" /> Visit Menu Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRModal;
