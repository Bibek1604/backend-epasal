import { Category } from '../models/Category';
import { ICreateCategoryBody, IPaginationQuery } from '../types';
import { generateId } from '../utils/generateId';
import { generateSlug } from '../utils/slugGenerator';
import { NotFoundError, ConflictError } from '../utils/errors';

export class CategoryService {
  /**
   * Get all categories with pagination and filters
   */
  async getCategories(query: IPaginationQuery) {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'created_at',
      order = 'desc',
    } = query;

    const filter: any = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [categories, total] = await Promise.all([
      Category.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean()
        .select('-_id -__v'),
      Category.countDocuments(filter),
    ]);

    return {
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string) {
    const category = await Category.findOne({ id }).lean().select('-_id -__v');

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return category;
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string) {
    const category = await Category.findOne({ slug }).lean().select('-_id -__v');

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return category;
  }

  /**
   * Create new category
   */
  async createCategory(data: ICreateCategoryBody, imageUrl?: string) {
    const id = generateId('cat');
    const slug = generateSlug(data.name);
    const created_at = new Date().toISOString();

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      throw new ConflictError('Category with this name already exists');
    }

    const categoryData = {
      id,
      ...data,
      slug,
      imageUrl: imageUrl || '',
      created_at,
    };

    const category = await Category.create(categoryData);
    return category.toObject({ versionKey: false, transform: (_doc, ret) => {
      delete (ret as any)._id;
      return ret;
    }});
  }

  /**
   * Update category
   */
  async updateCategory(id: string, data: Partial<ICreateCategoryBody>, imageUrl?: string) {
    const category = await Category.findOne({ id });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // Update slug if name changes
    if (data.name && data.name !== category.name) {
      const newSlug = generateSlug(data.name);
      const existingCategory = await Category.findOne({ slug: newSlug, id: { $ne: id } });
      
      if (existingCategory) {
        throw new ConflictError('Category with this name already exists');
      }

      (data as any).slug = newSlug;
    }

    if (imageUrl) {
      (data as any).imageUrl = imageUrl;
    }

    Object.assign(category, data);
    await category.save();

    return category.toObject({ versionKey: false, transform: (_doc, ret) => {
      delete (ret as any)._id;
      return ret;
    }});
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string) {
    const category = await Category.findOneAndDelete({ id });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return { message: 'Category deleted successfully' };
  }

  /**
   * Get active categories
   */
  async getActiveCategories() {
    const categories = await Category.find({ isActive: true })
      .sort({ created_at: -1 })
      .lean()
      .select('-_id -__v');

    return categories;
  }
}

export default new CategoryService();
