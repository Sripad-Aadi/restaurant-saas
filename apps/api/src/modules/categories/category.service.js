import Category from '../../models/Category.js';

export const createCategory = async (storeId, data) => {
  return Category.create({ storeId, ...data });
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
  return category;
};

export const deleteCategory = async (storeId, id) => {
  const category = await Category.findOneAndDelete({ storeId, _id: id });
  if (!category) throw { status: 404, message: 'Category not found' };
  return category;
};

export const reorderCategory = async (storeId, id, sortOrder) => {
  return updateCategory(storeId, id, { sortOrder });
};