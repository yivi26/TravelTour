import bcrypt from "bcrypt";
import {
  getUserProfileById,
  updateUserProfileById,
  getUserPasswordById,
  updateUserPasswordById,
} from "../models/userModel.js";

export const getCustomerProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await getUserProfileById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin khách hàng",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin cá nhân thành công",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomerProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, address } = req.body;

    if (!full_name || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ",
      });
    }

    const currentUser = await getUserProfileById(userId);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khách hàng",
      });
    }

    await updateUserProfileById(userId, {
      full_name,
      phone,
      address,
    });

    const updatedUser = await getUserProfileById(userId);

    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin thành công",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Xác nhận mật khẩu mới không khớp.",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới không được trùng mật khẩu hiện tại.",
      });
    }

    const hasMinLength = newPassword.length >= 8;
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(newPassword);

    if (
      !hasMinLength ||
      !hasUpperCase ||
      !hasLowerCase ||
      !hasNumber ||
      !hasSpecialChar
    ) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới chưa đúng yêu cầu bảo mật.",
      });
    }

    const user = await getUserPasswordById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng.",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu hiện tại không đúng.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await updateUserPasswordById(userId, hashedPassword);

    return res.status(200).json({
      success: true,
      message: "Cập nhật mật khẩu thành công.",
    });
  } catch (error) {
    console.error("changePassword error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi đổi mật khẩu.",
    });
  }
};
