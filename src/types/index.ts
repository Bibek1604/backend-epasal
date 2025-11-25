// Product Types
export interface IProduct {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  beforePrice: number;
  afterPrice: number;
  discountPrice: number;
  hasOffer: boolean;
  imageUrl: string;
  stock: number | null;
  category_id: string | null;
  sectionId: string;
  isActive: boolean;
  created_at: string;
}

// Order Types
export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface IOrder {
  id: string;
  user_id: string | null;
  first_name: string | null;
  last_name: string | null;
  name: string;
  phone: string | number;
  district: string;
  city: string;
  address: string;
  description: string;
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'sent' | 'on_the_way' | 'out_for_delivery' | 'shipped' | 'delivered' | 'received' | 'reached' | 'cancelled';
  statusHistory?: Array<{ status: string; note?: string | null; location?: string | null; timestamp: string }>;
  created_at: string;
}

// Category Types
export interface ICategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  created_at: string;
}

// Banner Types
export interface IBanner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  isActive: boolean;
  created_at: string;
}

// Coupon Types
export interface ICoupon {
  code: string;
  discountAmount: number;
  validFrom: string | Date;
  validTo: string | Date;
  isActive: boolean;
  created_at: string;
}

// Flash Sale Types
export interface IFlashSale {
  id: string;
  productId: string;
  flashPrice: number;
  currentStock: number;
  maxStock: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  created_at: string;
}

// Query Parameters
export interface IPaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface IProductQuery extends IPaginationQuery {
  categoryId?: string;
  sectionId?: string;
  hasOffer?: boolean;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
}

export interface IOrderQuery extends IPaginationQuery {
  status?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

// Request Body Types
export interface ICreateProductBody {
  imageUrl: string | undefined;
  name: string;
  description?: string;
  price?: number;
  beforePrice: number;
  afterPrice: number;
  discountPrice: number;
  hasOffer: boolean;
  stock?: number;
  category_id?: string;
  sectionId: string;
  isActive?: boolean;
}

export interface ICreateOrderBody {
  user_id?: string;
  first_name?: string;
  last_name?: string;
  name: string;
  phone: string | number;
  district: string;
  city: string;
  address: string;
  description: string;
  items: IOrderItem[];
  totalAmount: number;
}

export interface ICreateCategoryBody {
  name: string;
  description: string;
  isActive?: boolean;
}

export interface ICreateBannerBody {
  title: string;
  subtitle?: string;
  isActive?: boolean;
}

export interface ICreateCouponBody {
  code: string;
  discountAmount: number;
  validFrom: string | Date;
  validTo: string | Date;
  isActive?: boolean;
}

export interface ICreateFlashSaleBody {
  productId: string;
  flashPrice: number;
  maxStock: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}
