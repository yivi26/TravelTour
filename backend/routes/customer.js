import express from "express";
import {
  getCustomerProfile,
  updateCustomerProfile,
  changePassword,
} from "../controllers/customerController.js";

const router = express.Router();

// test tạm chưa cần token
router.use((req, res, next) => {
  req.user = { id: 5, role: "customer" };
  next();
});

router.get("/profile", getCustomerProfile);
router.put("/profile", updateCustomerProfile);
router.put("/change-password", changePassword);

export default router;
