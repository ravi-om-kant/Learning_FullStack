import { AppError } from "../errors/AppErrors";
import { logger } from "../libs/logger";
import { assertUuid } from "../libs/validation";
import { getListingsByProductId } from "../repository/product.listing.repository";
import {
  countProducts,
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../repository/product.repository";
import {
  Product,
  ProductBody,
  ProductListQuery,
  ProductListResult,
  ProductWithListings,
  UpdateProductFields,
} from "../types/product";


const NAME_MAX = 200;
const DESCRIPTION_MAX = 2000;
const CATEGORY_MAX = 100;
const BRAND_MAX = 100;
const SEARCH_MAX = 100;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const PG_FOREIGN_KEY_VIOLATION = "23503";

function assertValidProductId(productId: string): void {
  assertUuid(productId, "Invalid product id");
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function validateName(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(400, "Name is required");
  }
  const trimmed = value.trim();
  if (trimmed.length > NAME_MAX) {
    throw new AppError(400, `Name must be ${NAME_MAX} characters or less`);
  }
  return trimmed;
}
function parsePagination(
  limit: unknown,
  offset: unknown,
): { limit: number; offset: number } {
  const parsedLimit = Number(limit ?? DEFAULT_LIMIT);
  const parsedOffset = Number(offset ?? 0);

  if (
    !Number.isInteger(parsedLimit) ||
    parsedLimit < 1 ||
    parsedLimit > MAX_LIMIT
  ) {
    throw new AppError(
      400,
      `limit must be an integer between 1 and ${MAX_LIMIT}`,
    );
  }
  if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
    throw new AppError(400, "offset must be a non-negative integer");
  }
  return { limit: parsedLimit, offset: parsedOffset };
}
function validateOptionalText(
  value: unknown,
  fields: string,
  maxLength: number,
): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") {
    throw new AppError(400, `${fields} must be string`);
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new AppError(
      400,
      `${fields} must be ${maxLength} characters or less`,
    );
  }
  return trimmed || null;
}

function buildSearchPattern(search: unknown): string | null {
  if (search === undefined) return null;
  if (typeof search !== "string") {
    throw new AppError(400, "search much be a string");
  }
  const trimmed = search.trim();
  if (!trimmed) return null;
  if (trimmed.length > SEARCH_MAX) {
    throw new AppError(400, `search must be a string`);
  }
  return `%${escapeLike(trimmed)}%`;
}

export async function createNewProduct(
  body: ProductBody,
  createdBy: string,
): Promise<Product> {
  return createProduct({
    name: validateName(body.name),
    description: validateOptionalText(
      body.description,
      "Description",
      DESCRIPTION_MAX,
    ),
    category: validateOptionalText(body.category, "Category", CATEGORY_MAX),
    brand: validateOptionalText(body.brand, "Brand", BRAND_MAX),
    createdBy,
  });
}

export async function listProducts(
  query: ProductListQuery,
): Promise<ProductListResult> {
  const { limit, offset } = parsePagination(query.limit, query.offset);
  const searchPattern = buildSearchPattern(query.search);
  const [products, total] = await Promise.all([
    getProducts(searchPattern, limit, offset),
    countProducts(searchPattern),
  ]);
  return { products, total, limit, offset };
}

export async function getProductByIdOrThrow(
  productId: string,
): Promise<Product> {
  assertValidProductId(productId);
  const product = await getProductById(productId);
  if (!product) throw new AppError(400, "Product not found");
  return product;
}

export async function getProductWithListings(
  productId: string,
): Promise<ProductWithListings> {
  const product = await getProductByIdOrThrow(productId);
  const listings = await getListingsByProductId(productId);
  logger.info(`getProductWithListings ${product} \n ${listings}`);
  return { ...product, listings };
}

export async function updateExistingProduct(
  productId: string,
  body: ProductBody,
): Promise<Product> {
  assertValidProductId(productId);
  const fields: UpdateProductFields = {
    name: body.name === undefined ? null : validateName(body.name),
    description: validateOptionalText(
      body.description,
      "Description",
      DESCRIPTION_MAX,
    ),
    category: validateOptionalText(body.category, "Category", CATEGORY_MAX),
    brand: validateOptionalText(body.brand, "Brand", BRAND_MAX),
  };
  if(Object.values(fields).every((value) => value === null)){
    throw new AppError(400, "Provide at least one field to update");
  };

  const product = await updateProduct(productId, fields);
  if(!product) throw new AppError(404, "Product not found");
  return product;
};

export async function removeProduct(productId: string): Promise<void>{
    assertValidProductId(productId);
    let deleted: Boolean;
    try {
        deleted = await deleteProduct(productId);
    } catch (error) {
        if((error as {code?: string}).code === PG_FOREIGN_KEY_VIOLATION){
            throw new AppError(409, "Product has seller listing and cannot be deleted");
        }
        throw error;
    }
    if(!deleted) throw new AppError(404, "Product not found");
}
