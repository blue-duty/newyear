export async function onRequest(context) {
  // 定义一些备用的祝福语，以防 API 调用失败
  const fallbackBlessings = [
    "新年快乐，万事如意！",
    "福星高照，吉祥如意！",
    "心想事成，阖家欢乐！",
    "恭贺新禧，福寿安康！",
  ];

  // Gemini API 调用函数
  async function getBlessing() {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${context.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: "写一个充满祝福和喜悦的新年祝福语，每次都要不同。只需要返回祝福语，其他什么都不要返回",
                  },
                ],
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Gemini API request failed");
      }

      const data = await response.json();
      if (
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0]
      ) {
        const blessing = data.candidates[0].content.parts[0].text.trim();
        return (
          blessing ||
          fallbackBlessings[
            Math.floor(Math.random() * fallbackBlessings.length)
          ]
        );
      }
      return fallbackBlessings[
        Math.floor(Math.random() * fallbackBlessings.length)
      ];
    } catch (error) {
      console.error("Gemini API error:", error);
      return fallbackBlessings[
        Math.floor(Math.random() * fallbackBlessings.length)
      ];
    }
  }

  // 获取祝福语
  const blessing = await getBlessing();
  // 获取原始的 HTML 模板

  return new Response(JSON.stringify({ blessing }), {
    headers: { "Content-Type": "application/json" },
  });
}
