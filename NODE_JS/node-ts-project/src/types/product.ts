export type Product = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  brand: string | null;
  created_at: Date;
  updated_at: Date;
};

export type ProductBody = {
  name?: unknown;
  description?: unknown;
  category?: unknown;
  brand?: unknown;
};

export type ProductListQuery = {
  search?: unknown;
  limit?: unknown;
  offset?: unknown;
};

export type ProductListResult = {
  products: Product[];
  total: number;
  limit: number;
  offset: number;
};

export type CreateProductInput = {
  name: string;
  description: string | null;
  category: string | null;
  brand: string | null;
  createdBy: string;
};

export type UpdateProductFields = {
  name: string | null;
  description: string | null;
  category: string | null;
  brand: string | null;
};

export type ListingCondition = "new" | "used" | "refurbished";

export type ProductListing = {
  id: string;
  product_id: string;
  seller_id: string;
  price: string;
  stock: number;
  condition: ListingCondition;
  created_at: Date;
  updated_at: Date;
};

export type ProductListingWithProduct = ProductListing & {
  product_name: string;
};

export type ProductWithListings = Product & {
  listings: ProductListing[];
};

export type ListingBody = {
  price?: unknown;
  stock?: unknown;
  condition?: unknown;
};

export type CreateListingInput = {
  productId: string;
  sellerId: string;
  price: string;
  stock: number;
  condition: ListingCondition;
};

export type UpdateListingFields = {
  price: string | null;
  stock: number | null;
  condition: ListingCondition | null;
};
