import { Product } from '../models/Product';
import { ICreateProductBody, IProductQuery } from '../types';
import { generateId } from '../utils/generateId';
import { NotFoundError } from '../utils/errors';

export class ProductService {
  /**
   * Get all products with pagination and filters
   */
  async getProducts(query: IProductQuery) {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      sectionId,
      hasOffer,
      minPrice,
      maxPrice,
      isActive,
      sortBy = 'created_at',
      order = 'desc',
    } = query;

    const filter: any = {};

    if (search) {
      filter.$text = { $search: search };
    }

    if (categoryId) {
      filter.category_id = categoryId;
    }

    if (sectionId) {
      filter.sectionId = sectionId;
    }

    if (hasOffer !== undefined) {
      filter.hasOffer = hasOffer;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.afterPrice = {};
      if (minPrice !== undefined) filter.afterPrice.$gte = minPrice;
      if (maxPrice !== undefined) filter.afterPrice.$lte = maxPrice;
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean()
        .select('-_id -__v'),
      Product.countDocuments(filter),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string) {
    const product = await Product.findOne({ id }).lean().select('-_id -__v');

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  /**
   * Create new product
   */
  async createProduct(data: ICreateProductBody, imageUrl?: string) {
    const id = generateId('prod');
    const created_at = new Date().toISOString();

    const productData = {
      id,
      ...data,
      imageUrl: imageUrl || data.imageUrl || '',
      created_at,
    };

    const product = await Product.create(productData);
    return product.toObject({ versionKey: false, transform: (_doc, ret) => {
      const obj = ret as any;
      delete obj._id;
      return obj;
    }});
  }

  /**
   * Update product
   */
  async updateProduct(id: string, data: Partial<ICreateProductBody>, imageUrl?: string) {
    const product = await Product.findOne({ id });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (imageUrl) {
      (data as any).imageUrl = imageUrl;
    }

    Object.assign(product, data);
    await product.save();

    return product.toObject({ versionKey: false, transform: (_doc, ret) => {
      delete (ret as any)._id;
      return ret;
    }});
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string) {
    const product = await Product.findOneAndDelete({ id });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return { message: 'Product deleted successfully' };
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId: string, query: IProductQuery) {
    return this.getProducts({ ...query, categoryId });
  }

  /**
   * Get products by section
   */
  async getProductsBySection(sectionId: string, query: IProductQuery) {
    return this.getProducts({ ...query, sectionId });
  }

  /**
   * Get products with offers
   */
  async getProductsWithOffers(query: IProductQuery) {
    return this.getProducts({ ...query, hasOffer: true });
  }
}

export default new ProductService();
