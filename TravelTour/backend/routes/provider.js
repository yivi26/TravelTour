import express from "express";
import {
  getDashboardData,
  getTours,
  getTourDetailController,
  createNewTour,
  updateTourController,
  deleteTourController,
  updateTourStatusController,
  getToursForGuideAssignmentController,
  getBookings,
  updateBooking,
  getAllGuides,
  assignGuideToTourController,
  getPublicFeaturedToursController,
  getPublicToursController,
  getPublicDiscountedToursController,
  getPublicTourDetailController,
  getProfile,
  updateProfile
} from "../controllers/providerController.js";
import {
  uploadMultiple,
  uploadMultipleController,
  uploadSingle,
  uploadSingleController
} from "../controllers/uploadController.js";

const router = express.Router();

// Chặn cache cho route theo user (đổi tài khoản không bị “dính” data cũ)
router.use((req, res, next) => {
  res.setHeader("X-Provider-NoCache", "1");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  return next();
});

/* =========================
   PUBLIC ROUTES
========================= */
router.get("/public/featured-tours", getPublicFeaturedToursController);
router.get("/public/tours", getPublicToursController);
router.get("/public/discounted-tours", getPublicDiscountedToursController);
router.get("/public/tours/:id", getPublicTourDetailController);

/* =========================
   PROVIDER PROFILE
========================= */
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

/* =========================
   UPLOADS
========================= */
router.post("/upload", uploadSingle, uploadSingleController);
router.post("/uploads", uploadMultiple, uploadMultipleController);

/* =========================
   PROVIDER DASHBOARD
========================= */
router.get("/dashboard", getDashboardData);

/* =========================
   PROVIDER TOURS
========================= */
router.get("/tours/guide-assignment", getToursForGuideAssignmentController);
router.get("/tours", getTours);
router.get("/tours/:id", getTourDetailController);
router.post("/tours", createNewTour);
router.put("/tours/:id", updateTourController);
router.patch("/tours/:id/status", updateTourStatusController);
router.delete("/tours/:id", deleteTourController);

/* =========================
   PROVIDER BOOKINGS
========================= */
router.get("/bookings", getBookings);
router.put("/bookings/:id", updateBooking);

/* =========================
   PROVIDER GUIDES
========================= */
router.get("/guides", getAllGuides);
router.post("/assign-guide-to-tour", assignGuideToTourController);

export default router;