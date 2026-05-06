import Category from '../../models/Category.js';
import { invalidateMenuCache } from '../menu/menu.service.js';

export const createCategory = async (storeId, data) => {
  const category = await Category.create({ storeId, ...data });
  await invalidateMenuCache(storeId);
  return category;
};

export const getCategoriesByStore = async (storeId) => {
  return Category.find({ storeId }).sort({ sortOrder: 1, createdAt: 1 });
};

export const getCategoryById = async (storeId, id) => {
  const category = await Category.findOne({ storeId, _id: id });
  if (!category) throw { status: 404, message: 'Category not found' };
  return category;
};

export const updateCategory = async (storeId, id, updates) => {
  const category = await Category.findOneAndUpdate(
    { storeId, _id: id },
    updates,
    { new: true, runValidators: true }
  );
  if (!category) throw { status: 404, message: 'Category not found' };
  
  await invalidateMenuCache(storeId);
  return category;
};

export const deleteCategory = async (storeId, id) => {
  const category = await Category.findOneAndDelete({ storeId, _id: id });
  if (!category) throw { status: 404, message: 'Category not found' };
  
  await invalidateMenuCache(storeId);
  return category;
};

export const reorderCategory = async (storeId, id, sortOrder) => {
  return updateCategory(storeId, id, { sortOrder });
};

export const bulkReorderCategories = async (storeId, items) => {
  const operations = items.map((item) => ({
    updateOne: {
      filter: { _id: item.id, storeId },
      update: { sortOrder: item.sortOrder },
    },
  }));
  await Category.bulkWrite(operations);
  await invalidateMenuCache(storeId);
};