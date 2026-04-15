import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        message: "Thiếu message"
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Bạn là chatbot tư vấn du lịch cho website TravelTour. Trả lời ngắn gọn, thân thiện, bằng tiếng Việt."
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter error:", data);
      return res.status(response.status).json({
        message: "Lỗi gọi OpenRouter",
        error: data
      });
    }

    return res.json({
      reply: data?.choices?.[0]?.message?.content || "Bot chưa có phản hồi"
    });
  } catch (error) {
    console.error("❌ Chatbot route error:", error);

    return res.status(500).json({
      message: "Lỗi chatbot server",
      error: error.message
    });
  }
});

export default router;