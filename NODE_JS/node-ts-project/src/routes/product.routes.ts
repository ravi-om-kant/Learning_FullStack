import { Router } from "express";
import { requireAdmin } from "../middlewares/admin.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import {
  createNewProduct,
  getProductByIdOrThrow,
  listProducts,
  removeProduct,
  updateExistingProduct,
} from "../services/product.service";

export const productRouter = Router();

productRouter.use(authenticate);

productRouter.get("/", async (req, res, next) => {
  try {
    // Query parameters are optional URL values after `?`, for example:
    // /products?search=hat&limit=10&offset=20
    // Express makes them available in req.query. Here they provide a search
    // term and pagination settings without changing the route path.
    const result = await listProducts({
      search: req.query.search,
      limit: req.query.limit,
      offset: req.query.offset,
    });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

productRouter.get("/:productId", async (req, res, next) => {
  try {
    const product = await getProductByIdOrThrow(req.params.productId);
    res.status(200).json({
      success: true,
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  }
});

productRouter.post("/", requireAdmin, async (req, res, next) => {
  try {
    // `authenticate` runs before this handler and should populate `req.user`
    // from the authenticated request (typically the verified token). The `!`
    // is only a TypeScript assertion; it does not check for a user at runtime.
    const product = await createNewProduct(req.body ?? {}, req.user!.userId);
    res.status(201).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
});
productRouter.patch(
  "/:productId",
  authenticate,
  requireAdmin,
  async (req, res, next) => {
    try {
      const productId = Array.isArray(req.params.productId)
        ? req.params.productId[0]
        : req.params.productId;
      const product = await updateExistingProduct(productId, req.body ?? {});
      res.status(200).json({ success: true, data: { product } });
    } catch (error) {
      next(error);
    }
  },
);

productRouter.delete(
  "/:productId",
  requireAdmin,
  async (req, res, next) => {
    try {
      const productId = Array.isArray(req.params.productId)
        ? (req.params.productId[0] ?? "")
        : req.params.productId;
      await removeProduct(productId);
      res.status(200).json({ success: true, message: "Product deleted" });
    } catch (error) {
      next(error);
    }
  },
);
