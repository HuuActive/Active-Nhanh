export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  priceUnit?: 'ngày' | 'tháng' | 'năm' | 'vĩnh viễn';
  variants?: ProductVariant[];
  description: string; // Keep for backward compatibility or as a summary
  importantNote?: string;
  deliveryProcess?: string;
  features?: string;
  warranty?: string;
  faqs?: string;
  usageGuide?: string;
  shortFeatures?: string; // Semicolon separated features for the top section
  category: string;
  image: string;
  rating: number;
  reviews: number;
  stock: number;
  slug?: string; // Friendly URL slug
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  thumbnail: string;
  category: string;
  authorId: string;
  authorName: string;
  createdAt: any;
  updatedAt: any;
  views: number;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  content: string;
  createdAt: any;
  status: 'pending' | 'approved' | 'spam';
}
