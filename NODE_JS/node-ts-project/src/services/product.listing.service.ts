import { AppError } from "../errors/AppErrors";
import { assertUuid } from "../libs/validation";
import { getProductById } from "../repository/product.repository";
import {
  createListing,
  deleteListing,
  getListingById,
  getListingsByProductId,
  getListingsBySellerId,
  updateListing,
} from "../repository/product.listing.repository";
import {
  CreateListingInput,
  ListingBody,
  ListingCondition,
  ProductListing,
  ProductListingWithProduct,
  UpdateListingFields,
} from "../types/product";

const CONDITIONS: readonly ListingCondition[] = ["new", "used", "refurbished"];
const PRICE_PATTERN = /^\d{1,8}(\.\d{1,2})?$/;
const PG_FOREIGN_KEY_VIOLATION = "23503";
const PG_UNIQUE_VIOLATION = "23505";

function validatePrice(value: unknown): string {
  if (typeof value !== "number" && typeof value !== "string") {
    throw new AppError(400, "Price is required");
  }
  const normalized = String(value).trim();
  if (!PRICE_PATTERN.test(normalized) || Number(normalized) <= 0) {
    throw new AppError(
      400,
      "Price must be greater than 0, with at most 8 whole digits and 2 decimals",
    );
  }
  return normalized;
}

function validateStock(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new AppError(400, "Stock must be a non-negative integer");
  }
  return value;
}

function isListingCondition(value: unknown): value is ListingCondition {
  return (
    typeof value === "string" &&
    (CONDITIONS as readonly string[]).includes(value)
  );
}

function validateCondition(value: unknown): ListingCondition {
  if (!isListingCondition(value)) {
    throw new AppError(
      400,
      `Condition must be one of: ${CONDITIONS.join(", ")}`,
    );
  }
  return value;
}

function buildUpdateFields(body: ListingBody): UpdateListingFields {
  const fields: UpdateListingFields = {
    price: body.price === undefined ? null : validatePrice(body.price),
    stock: body.stock === undefined ? null : validateStock(body.stock),
    condition:
      body.condition === undefined ? null : validateCondition(body.condition),
  };

  if (Object.values(fields).every((value) => value === null)) {
    throw new AppError(400, "Provide at least one field to update");
  }
  return fields;
}

async function assertListingOwner(
  listingId: string,
  sellerId: string,
): Promise<void> {
  const listing = await getListingById(listingId);
  if (!listing) throw new AppError(404, "Listing not found");
  if (listing.seller_id !== sellerId) {
    throw new AppError(403, "You can only change your own listings");
  }
}

export async function createNewListing(
  productId: string,
  sellerId: string,
  body: ListingBody,
): Promise<ProductListing> {
  assertUuid(productId, "Invalid product id");

  const input: CreateListingInput = {
    productId,
    sellerId,
    price: validatePrice(body.price),
    stock: body.stock === undefined ? 0 : validateStock(body.stock),
    condition:
      body.condition === undefined ? "new" : validateCondition(body.condition),
  };

  try {
    return await createListing(input);
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === PG_FOREIGN_KEY_VIOLATION)
      throw new AppError(404, "Product not found");
    if (code === PG_UNIQUE_VIOLATION) {
      throw new AppError(
        409,
        "You already have a listing for this product. Update it instead.",
      );
    }
    throw error;
  }
}

export async function listProductListings(
  productId: string,
): Promise<ProductListing[]> {
  assertUuid(productId, "Invalid product id");

  const product = await getProductById(productId);
  if (!product) throw new AppError(404, "Product not found");

  return getListingsByProductId(productId);
}

export async function listMyListings(
  sellerId: string,
): Promise<ProductListingWithProduct[]> {
  return getListingsBySellerId(sellerId);
}

export async function updateOwnListing(
  listingId: string,
  sellerId: string,
  body: ListingBody,
): Promise<ProductListing> {
  assertUuid(listingId, "Invalid listing id");
  const fields = buildUpdateFields(body);
  await assertListingOwner(listingId, sellerId);

  const updated = await updateListing(listingId, fields);
  if (!updated) throw new AppError(404, "Listing not found");
  return updated;
}

export async function removeOwnListing(
  listingId: string,
  sellerId: string,
): Promise<void> {
  assertUuid(listingId, "Invalid listing id");
  await assertListingOwner(listingId, sellerId);

  const deleted = await deleteListing(listingId, sellerId);
  if (!deleted) throw new AppError(404, "Listing not found");
}
