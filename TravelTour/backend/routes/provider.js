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

const router = express.Router();

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