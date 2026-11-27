import { pool } from "../libs/db";
import {
  CreateListingInput,
  ProductListing,
  ProductListingWithProduct,
  UpdateListingFields,
} from "../types/product";

const LISTING_COLUMNS =
  "id, product_id, seller_id, price, stock, condition, created_at, updated_at";

export async function createListing(
  input: CreateListingInput,
): Promise<ProductListing> {
  const result = await pool.query<ProductListing>(
    `insert into product_listings (product_id, seller_id, price, stock, condition)
        values ($1, $2, $3, $4, $5)
        returning ${LISTING_COLUMNS}`,
    [
      input.productId,
      input.sellerId,
      input.price,
      input.stock,
      input.condition,
    ],
  );
  return result.rows[0];
}

export async function getListingsByProductId(
  productId: string,
): Promise<ProductListing[]> {
  const result = await pool.query<ProductListing>(
    `select ${LISTING_COLUMNS} from
        product_listings
        where product_id = $1
        order by price asc`,
    [productId],
  );
  return result.rows;
}

export async function getListingsBySellerId(
  sellerId: string,
): Promise<ProductListingWithProduct[]> {
  const result = await pool.query<ProductListingWithProduct>(
    `select l.id, l.product_id, l.seller_id, l.price, l.stock, l.condition,
            l.created_at, l.updated_at, p.name as product_name
        from product_listings l
        join products p on p.id = l.product_id
        where l.seller_id = $1
        order by l.updated_at desc
        `,
    [sellerId],
  );
  return result.rows;
}

export async function getListingById(id: string): Promise<ProductListing | null>{
    const result = await pool.query<ProductListing>(
        `select ${LISTING_COLUMNS} from 
        product_listings where id = $1`,[id]
    );
    return result.rows[0] ?? null;
}

export async function updateListing(id: string, fields: UpdateListingFields): Promise<ProductListing | null> {
    const result = await pool.query<ProductListing>(
        `update product_listings
        set price = coalesce($1, price),
            stock = coalesce($2, stock),
            condition = coalesce($3, condition),
            updated_at = now()
        where id = $4
        returning ${LISTING_COLUMNS}`,
        [fields.price, fields.stock, fields.condition, id]
    );
    return result.rows[0] ?? null;
}

export async function deleteListing(
  id: string,
  sellerId: string,
): Promise<boolean> {
    const result = await pool.query(
      `delete from product_listings where id = $1 and seller_id = $2`,
      [id, sellerId],
    );
    return (result.rowCount ?? 0) > 0;
}