import express from "express";
import {
  getDashboardData,
  getTours,
  getTourDetailController,
  createNewTour,
  updateTourController,
  deleteTourController,
  updateTourStatusController,
  getBookings,
  updateBooking,
  getAllGuides,
  assignGuideController
} from "../controllers/providerController.js";

const router = express.Router();

router.get("/dashboard", getDashboardData);

// TOUR
router.get("/tours", getTours);
router.get("/tours/:id", getTourDetailController);
router.post("/tours", createNewTour);
router.put("/tours/:id", updateTourController);
router.patch("/tours/:id/status", updateTourStatusController);
router.delete("/tours/:id", deleteTourController);

// BOOKING
router.get("/bookings", getBookings);
router.put("/bookings/:id", updateBooking);

// GUIDE
router.get("/guides", getAllGuides);
router.post("/assign-guide", assignGuideController);

export default router;