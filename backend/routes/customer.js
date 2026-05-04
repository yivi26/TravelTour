import express from "express";
import uploadAvatar from "../middleware/uploadAvatar.js";
import {
  getCustomerProfile,
  updateCustomerProfile,
  changePassword,
  updateCustomerAvatar,
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
router.post("/avatar", uploadAvatar.single("avatar"), updateCustomerAvatar);

export default router;
