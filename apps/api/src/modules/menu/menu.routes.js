import { Router } from 'express';
import Store from '../../models/Store.js';
import Category from '../../models/Category.js';
import Product from '../../models/Product.js';

const router = Router();

// GET /api/menu/:storeSlug
// Public endpoint — no authentication required
router.get('/:storeSlug', async (req, res) => {
  try {
    const store = await Store.findOne({ slug: req.params.storeSlug, isActive: true });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Get all active categories sorted by sortOrder
    const categories = await Category.find({ storeId: store._id, isActive: true })
      .sort({ sortOrder: 1 });

    // Get all available products sorted by sortOrder
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
          price:       p.price,       // paise
          priceInRupees: (p.price / 100).toFixed(2),
          imageUrl:    p.imageUrl,
        })),
    }));

    res.json({
      success: true,
      data: {
        store: { name: store.name, logo: store.logo },
        menu,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;