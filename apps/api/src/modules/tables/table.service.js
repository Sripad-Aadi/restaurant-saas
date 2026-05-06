import QRCode from 'qrcode';
import Table from '../../models/Table.js';

const generateQRCode = async (storeSlug, tableNumber) => {
  const url = `${process.env.CLIENT_URL}/${storeSlug}/table/${tableNumber}`;
  // Returns a base64 data URL — store it directly, no Cloudinary needed for now
  const qrDataUrl = await QRCode.toDataURL(url, { width: 400, margin: 2 });
  return { qrDataUrl, url };
};

export const createTable = async (storeId, storeSlug, data) => {
  // Check for duplicate table number in the same store
  const existing = await Table.findOne({ storeId, tableNumber: data.tableNumber });
  if (existing) throw { status: 409, message: 'Table number already exists in this store' };

  const { qrDataUrl, url } = await generateQRCode(storeSlug, data.tableNumber);

  return Table.create({
    storeId,
    tableNumber: data.tableNumber,
    label:       data.label || `Table ${data.tableNumber}`,
    qrCodeUrl:   url,
    qrImageUrl:  qrDataUrl,
  });
};

export const getTablesByStore = async (storeId) => {
  return Table.find({ storeId }).sort({ tableNumber: 1 });
};

export const getTableById = async (storeId, id) => {
  const table = await Table.findOne({ storeId, _id: id });
  if (!table) throw { status: 404, message: 'Table not found' };
  return table;
};

export const updateTable = async (storeId, id, updates) => {
  const table = await Table.findOneAndUpdate(
    { storeId, _id: id },
    updates,
    { new: true, runValidators: true }
  );
  if (!table) throw { status: 404, message: 'Table not found' };
  return table;
};

export const deleteTable = async (storeId, id) => {
  const table = await Table.findOneAndDelete({ storeId, _id: id });
  if (!table) throw { status: 404, message: 'Table not found' };
  return table;
};