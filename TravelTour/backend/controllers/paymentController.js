import crypto from "crypto";
import axios from "axios";
import db from "../config/db.js";

function getEnv(...keys) {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export const createMomoPayment = async (req, res) => {
  try {
    const bookingId = Number(req.params.bookingId);
    const userId = req.user.id;

    const [rows] = await db.execute(
      `
      SELECT id, booking_code, final_price, status
      FROM bookings
      WHERE id = ? AND user_id = ?
      LIMIT 1
      `,
      [bookingId, userId],
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy booking",
      });
    }

    const booking = rows[0];

    if (booking.status !== "pending_payment") {
      return res.status(400).json({
        success: false,
        message: "Booking không ở trạng thái chờ thanh toán",
      });
    }

    const partnerCode = getEnv("MOMO_PARTNER_CODE", "MOMO_PARTNERCODE");
    const accessKey = getEnv("MOMO_ACCESS_KEY", "MOMO_ACCESSKEY");
    const secretKey = getEnv("MOMO_SECRET_KEY", "MOMO_SECRETKEY");
    const endpoint = getEnv("MOMO_ENDPOINT", "MOMO_API_ENDPOINT");
    const appBaseUrl = getEnv("APP_BASE_URL", "BASE_URL") || "http://localhost:3000";
    const redirectUrl =
      getEnv("MOMO_REDIRECT_URL", "MOMO_RETURN_URL") ||
      `${appBaseUrl}/api/payments/momo/return`;
    const ipnUrl =
      getEnv("MOMO_IPN_URL", "MOMO_NOTIFY_URL") ||
      `${appBaseUrl}/api/payments/momo/ipn`;

    const missingConfig = [];
    if (!partnerCode) missingConfig.push("MOMO_PARTNER_CODE");
    if (!accessKey) missingConfig.push("MOMO_ACCESS_KEY");
    if (!secretKey) missingConfig.push("MOMO_SECRET_KEY");
    if (!endpoint) missingConfig.push("MOMO_ENDPOINT");

    if (missingConfig.length > 0) {
      return res.status(500).json({
        success: false,
        message: `Thiếu cấu hình MoMo: ${missingConfig.join(", ")}`,
      });
    }

    const orderId = `TT_${booking.id}_${Date.now()}`;
    const requestId = orderId;
    const amount = String(Math.round(Number(booking.final_price)));
    const orderInfo = `Thanh toán booking ${booking.booking_code}`;
    const extraData = "";
    const requestType = "payWithATM";
    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: "vi",
    };

    const momoRes = await axios.post(endpoint, requestBody, {
      headers: { "Content-Type": "application/json" },
    });

    if (momoRes.data.resultCode !== 0) {
      return res.status(400).json({
        success: false,
        message: momoRes.data.message,
      });
    }

    return res.json({
      success: true,
      payUrl: momoRes.data.payUrl,
    });
  } catch (error) {
    const momoErrorData = error.response?.data || null;
    console.error("MOMO ERROR:", momoErrorData || error.message);

    if (momoErrorData) {
      return res.status(400).json({
        success: false,
        message: momoErrorData.message || "Yêu cầu thanh toán MoMo không hợp lệ",
        momo: momoErrorData,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Lỗi MoMo",
    });
  }
};

export const momoReturn = async (req, res) => {
  try {
    console.log("MOMO RETURN QUERY:", req.query);

    const { orderId, resultCode } = req.query;
    const bookingId = Number(String(orderId || "").split("_")[1]);

    if (!bookingId) {
      return res.redirect(
        "/pages/tours/thanhtoan.html?payment=missing_booking",
      );
    }

    if (Number(resultCode) === 0) {
      const [result] = await db.execute(
        `
        UPDATE bookings
        SET status = 'confirmed',
            updated_at = NOW()
        WHERE id = ?
        `,
        [bookingId],
      );

      console.log("UPDATE BOOKING RESULT:", result);

      return res.redirect(`/pages/tours/success.html?bookingId=${bookingId}`);
    }

    return res.redirect(`/pages/tours/thanhtoan.html?payment=failed`);
  } catch (error) {
    console.error("momoReturn error:", error);
    return res.redirect("/pages/tours/thanhtoan.html?payment=error");
  }
};

export const momoIpn = async (req, res) => {
  try {
    const { orderId, resultCode } = req.body;

    const bookingId = Number(String(orderId).split("_")[1]);

    if (Number(resultCode) === 0 && bookingId) {
      await db.execute(
        `
        UPDATE bookings
        SET status = 'confirmed',
            updated_at = NOW()
        WHERE id = ?
        `,
        [bookingId],
      );
    }

    return res.json({
      resultCode: 0,
      message: "OK",
    });
  } catch (error) {
    return res.json({
      resultCode: 1,
      message: "ERROR",
    });
  }
};
