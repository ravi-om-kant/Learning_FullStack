import { pool } from "../libs/db";
import {
  CreateProductInput,
  Product,
  UpdateProductFields,
} from "../types/product";

const PRODUCT_COLUMNS =
  "id, name, description, category, brand, created_by, created_at, updated_at";

export async function createProduct(
  input: CreateProductInput,
): Promise<Product> {
  const result = await pool.query<Product>(
    `insert into products (name, description, category, brand, created_by)
        values ($1, $2, $3, $4, $5)
        returning ${PRODUCT_COLUMNS}`,
    [
      input.name,
      input.description,
      input.category,
      input.brand,
      input.createdBy,
    ],
  );
  return result.rows[0];
}

export async function getProducts(
  searchPattern: string | null,
  limit: number,
  offset: number,
): Promise<Product[]> {
  const result = await pool.query<Product>(
    `select ${PRODUCT_COLUMNS}
        from products
        where $1::text is null or name ilike $1
        order by created_at desc
        limit $2 offset $3`,
    [searchPattern, limit, offset],
  );
  return result.rows;
}

// ================================================================================================WE CAN USE GETPRODUCTS AS WELL WITH .ROWSCOUNT cannot because we are uding offset in getproducts()=============================================================================================================
export async function countProducts(
  searchPattern: string | null,
): Promise<number> {
  const result = await pool.query<{ count: string }>(
    `select count(*) from products
        where $1::text is null or name ilike $1`,
    [searchPattern],
  );
  return Number(result.rows[0].count);
}

export async function getProductById(id: string): Promise<Product | null> {
  const result = await pool.query<Product>(
    `select ${PRODUCT_COLUMNS} from products where id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function updateProduct(
  id: string,
  fields: UpdateProductFields,
): Promise<Product | null> {
  const result = await pool.query<Product>(
    `update products
        set name = coalesce($1, name),
            description = coalesce($2, description),
            category = coalesce($3, category),
            brand = coalesce($4, brand),
            updated_at = now()
        where id = $5
        returning ${PRODUCT_COLUMNS}`,
    [fields.name, fields.description, fields.category, fields.brand, id],
  );
  return result.rows[0] ?? null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const result = await pool.query(`delete from products where id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}
