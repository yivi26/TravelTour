import express from "express";
import uploadAvatar from "../middleware/uploadAvatar.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getCustomerProfile,
  updateCustomerProfile,
  changePassword,
  updateCustomerAvatar,
} from "../controllers/customerController.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/profile", getCustomerProfile);
router.put("/profile", updateCustomerProfile);
router.put("/change-password", changePassword);

router.post("/avatar", uploadAvatar.single("avatar"), updateCustomerAvatar);

export default router;
