import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import { invalidateMenuCache } from '../menu/menu.service.js';

export const createProduct = async (storeId, data) => {
  // Verify the category belongs to this store
  const category = await Category.findOne({ storeId, _id: data.categoryId });
  if (!category) throw { status: 404, message: 'Category not found in this store' };

  const product = await Product.create({ storeId, ...data });
  await invalidateMenuCache(storeId);
  return product;
};

export const getProductsByStore = async (storeId, filters = {}) => {
  const query = { storeId };
  if (filters.categoryId) query.categoryId = filters.categoryId;
  if (filters.isAvailable !== undefined) query.isAvailable = filters.isAvailable;

  return Product.find(query)
    .populate('categoryId', 'name')
    .sort({ sortOrder: 1, createdAt: 1 });
};

export const getProductById = async (storeId, id) => {
  const product = await Product.findOne({ storeId, _id: id }).populate('categoryId', 'name');
  if (!product) throw { status: 404, message: 'Product not found' };
  return product;
};

export const updateProduct = async (storeId, id, updates) => {
  // If categoryId is being changed, verify it belongs to this store
  if (updates.categoryId) {
    const category = await Category.findOne({ storeId, _id: updates.categoryId });
    if (!category) throw { status: 404, message: 'Category not found in this store' };
  }

  const product = await Product.findOneAndUpdate(
    { storeId, _id: id },
    updates,
    { new: true, runValidators: true }
  );
  if (!product) throw { status: 404, message: 'Product not found' };
  
  await invalidateMenuCache(storeId);
  return product;
};

export const toggleAvailability = async (storeId, id) => {
  const product = await Product.findOne({ storeId, _id: id });
  if (!product) throw { status: 404, message: 'Product not found' };

  product.isAvailable = !product.isAvailable;
  await product.save();
  
  await invalidateMenuCache(storeId);
  return product;
};

export const deleteProduct = async (storeId, id) => {
  const product = await Product.findOneAndDelete({ storeId, _id: id });
  if (!product) throw { status: 404, message: 'Product not found' };
  
  await invalidateMenuCache(storeId);
  return product;
};