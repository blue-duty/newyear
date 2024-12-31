export default {
  async fetch(request, env, ctx) {
    // 备用祝福语
    const fallbackBlessings = [
      "新年快乐，万事如意！",
      "福星高照，吉祥如意！",
      "心想事成，阖家欢乐！",
      "恭贺新禧，福寿安康！",
    ];

    async function getBlessing() {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                { parts: [{ text: "写一个充满祝福和喜悦的新年祝福语" }] },
              ],
            }),
          },
        );

        if (!response.ok) {
          throw new Error("API 请求失败");
        }

        const data = await response.json();
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return data.candidates[0].content.parts[0].text.trim();
        }

        throw new Error("无有效数据");
      } catch (error) {
        console.error(error);
        return fallbackBlessings[
          Math.floor(Math.random() * fallbackBlessings.length)
        ];
      }
    }

    const blessing = await getBlessing();
    return new Response(JSON.stringify({ blessing }), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
