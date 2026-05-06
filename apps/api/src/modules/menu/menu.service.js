import redis from '../../config/redis.js';
import Store from '../../models/Store.js';
import Category from '../../models/Category.js';
import Product from '../../models/Product.js';

const CACHE_TTL = 86400; // 24 hours in seconds

export const getMenuBySlug = async (storeSlug) => {
  const cacheKey = `menu:slug:${storeSlug}`;

  // 1. Try to get from cache
  const cachedData = await redis.get(cacheKey);
  if (cachedData) {
    return JSON.parse(cachedData);
  }

  // 2. Fetch from DB if cache miss
  const store = await Store.findOne({ slug: storeSlug, isActive: true });
  if (!store) {
    throw { status: 404, message: 'Restaurant not found' };
  }

  const categories = await Category.find({ storeId: store._id, isActive: true })
    .sort({ sortOrder: 1 });

  const products = await Product.find({ storeId: store._id, isAvailable: true })
    .sort({ sortOrder: 1 });

  // Group products under their categories
  const menu = categories.map((cat) => ({
    category: {
      id:   cat._id,
      name: cat.name,
    },
    products: products
      .filter((p) => p.categoryId.toString() === cat._id.toString())
      .map((p) => ({
        id:          p._id,
        name:        p.name,
        description: p.description,
        price:       p.price,
        image:       p.image,
        foodType:    p.foodType,
        isAvailable: p.isAvailable,
      })),
  }));

  const responseData = {
    store: { 
      id: store._id,
      name: store.name, 
      logo: store.logo,
      coverImage: store.coverImage,
      description: store.description,
      cuisineType: store.cuisineType,
      avgWaitTime: store.avgWaitTime,
      amenities: store.amenities
    },
    menu,
  };

  // 3. Store in cache
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(responseData));

  return responseData;
};

export const invalidateMenuCache = async (storeId) => {
  try {
    const store = await Store.findById(storeId);
    if (store) {
      const cacheKey = `menu:slug:${store.slug}`;
      await redis.del(cacheKey);
      console.log(`Cache invalidated for store: ${store.slug}`);
    }
  } catch (err) {
    console.error('Failed to invalidate menu cache:', err.message);
  }
};
