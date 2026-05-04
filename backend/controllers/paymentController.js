import crypto from "crypto";
import axios from "axios";
import db from "../config/db.js";

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

    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const endpoint = process.env.MOMO_ENDPOINT;

    const orderId = `TT_${booking.id}_${Date.now()}`;
    const requestId = orderId;
    const amount = String(Math.round(Number(booking.final_price)));
    const orderInfo = `Thanh toán booking ${booking.booking_code}`;
    const redirectUrl = `${process.env.MOMO_REDIRECT_URL}?forceSuccess=true`;
    const ipnUrl = process.env.MOMO_IPN_URL;
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
    console.error("MOMO ERROR:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "Lỗi MoMo",
    });
  }
};

export const momoReturn = async (req, res) => {
  try {
    const { orderId, forceSuccess } = req.query;

    const bookingId = Number(String(orderId || "").split("_")[1]);

    if (!bookingId) {
      return res.redirect(
        "/pages/tours/thanhtoan.html?payment=missing_booking",
      );
    }

    if (forceSuccess === "true") {
      await db.execute(
        `
        UPDATE bookings
        SET status = 'confirmed',
            updated_at = NOW()
        WHERE id = ?
          AND status = 'pending_payment'
        `,
        [bookingId],
      );

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
