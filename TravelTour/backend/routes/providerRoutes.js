import express from "express";
import {
  getDashboardData,
  getTours,
  createNewTour,
  deleteTourController,
  updateTourStatusController,
  getBookings,
  updateBooking,
  getAllGuides,
  assignGuideController
} from "../controllers/providerController.js";

const router = express.Router();

router.get("/dashboard", getDashboardData);

router.get("/tours", getTours);
router.post("/tours", createNewTour);
router.delete("/tours/:id", deleteTourController);
router.put("/tours/:id", updateTourStatusController);

router.get("/bookings", getBookings);
router.put("/bookings/:id", updateBooking);

router.get("/guides", getAllGuides);
router.post("/assign-guide", assignGuideController);

export default router;