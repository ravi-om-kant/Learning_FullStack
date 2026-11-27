import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
    createNewListing,
    listMyListings,
    listProductListings,
    removeOwnListing,
    updateOwnListing,
} from "../services/product.listing.service";

export const productListingRouter = Router();

productListingRouter.use(authenticate);

productListingRouter.get("/products/:productId/listings", async (req, res, next) => {
    try {
        const listings = await listProductListings(req.params.productId);
        res.status(200).json({ success: true, data: { listings } });
    } catch (error) {
        next(error);
    }
});

productListingRouter.post("/products/:productId/listings", async (req, res, next) => {
    try {
        const listing = await createNewListing(req.params.productId, req.user!.userId, req.body ?? {});
        res.status(201).json({ success: true, data: { listing } });
    } catch (error) {
        next(error);
    }
});

productListingRouter.get("/listings/my", async (req, res, next) => {
    try {
        const listings = await listMyListings(req.user!.userId);
        res.status(200).json({ success: true, data: { listings } });
    } catch (error) {
        next(error);
    }
});

productListingRouter.patch("/listings/:listingId", async (req, res, next) => {
    try {
        const listing = await updateOwnListing(req.params.listingId, req.user!.userId, req.body ?? {});
        res.status(200).json({ success: true, data: { listing } });
    } catch (error) {
        next(error);
    }
});

productListingRouter.delete("/listings/:listingId", async (req, res, next) => {
    try {
        await removeOwnListing(req.params.listingId, req.user!.userId);
        res.status(200).json({ success: true, message: "Listing deleted" });
    } catch (error) {
        next(error);
    }
});