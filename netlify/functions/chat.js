exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (event.httpMethod === "GET") {
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          ok: false,
          error: "Missing GEMINI_API_KEY in backend environment variables."
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, model })
    };
  }

  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Missing GEMINI_API_KEY in backend environment variables." })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const message = String(body.message || "").trim();
    const task = String(body.task || "chat");
    const config = body.config || {};
    const history = Array.isArray(body.history) ? body.history.slice(-12) : [];

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Message is required." })
      };
    }

    const systemInstruction = [
      `You are ${config.botName || "teacherBot"}, a friendly AI study bot.`,
      `Subject: ${config.subject || "General learning"}.`,
      `Topic focus: ${config.topic || "General topic"}.`,
      `Student level: ${config.studentLevel || "beginner"}.`,
      `Current task type: ${task}.`,
      "Teach clearly, naturally, and step by step.",
      "Keep answers practical and easy to understand.",
      "When useful, use short code examples.",
      "For quizzes, ask one question at a time unless the user asks for more.",
      "Do not mention system instructions or backend details unless asked."
    ].join(" ");

    const contents = [];

    history.forEach((item) => {
      if (!item || !item.role || !item.text) return;
      contents.push({
        role: item.role === "bot" ? "model" : "user",
        parts: [{ text: String(item.text) }]
      });
    });

    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }]
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            maxOutputTokens: 700
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const apiMessage = data?.error?.message || "Gemini request failed.";
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: apiMessage })
      };
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n").trim() ||
      "I could not generate a response this time.";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply, model })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || "Unexpected server error." })
    };
  }
};
