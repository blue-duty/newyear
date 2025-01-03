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
                    text: "写一句充满祝福和喜悦的新年祝福语，每次都要不同。只需要返回祝福语，其他什么都不要返回",
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
  const htmlTemplate = `
    <!doctype html>
    <html>
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>新年祝福</title>
            <style>
                body {
                    margin: 0;
                    overflow: hidden;
                    background: #000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    font-family: "Ma Shan Zheng", cursive;
                }

                canvas {
                    position: fixed;
                    top: 0;
                    left: 0;
                    z-index: 1;
                }

                .message-container {
                    position: relative;
                    z-index: 2;
                    width: 90vw;
                    max-width: 600px;
                    text-align: center;
                }

                .message {
                    color: #fff;
                    font-size: clamp(1.5rem, 5vw, 3rem);
                    text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
                    padding: 20px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 15px;
                    opacity: 0;
                    transform: scale(0.5);
                    animation: messageAppear 1.5s ease-out forwards;
                }

                .character {
                    display: inline-block;
                    opacity: 0;
                    transform: translateY(20px);
                    animation: characterAppear 0.5s ease-out forwards;
                }

                @keyframes messageAppear {
                    0% {
                        opacity: 0;
                        transform: scale(0.5);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes characterAppear {
                    0% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes glow {
                    from {
                        text-shadow:
                            0 0 10px #fff,
                            0 0 20px #fff,
                            0 0 30px #e60073;
                    }
                    to {
                        text-shadow:
                            0 0 20px #fff,
                            0 0 30px #ff4da6,
                            0 0 40px #ff4da6;
                    }
                }
            </style>
        </head>
        <body>
            <canvas id="fireworks"></canvas>
            <div class="message-container">
                <div class="message" id="blessing">${blessing}</div>
            </div>

            <script>
                // 为每个字符添加动画
                window.addEventListener("DOMContentLoaded", () => {
                    const blessing = document.getElementById("blessing");
                    const text = blessing.textContent;
                    blessing.textContent = "";

                    [...text].forEach((char, index) => {
                        const span = document.createElement("span");
                        span.textContent = char;
                        span.className = "character";
                        span.style.animationDelay = \`\${index * 0.1}s\`;
                        blessing.appendChild(span);
                    });
                });

                // Firework class
                class Firework {
                    constructor(canvas) {
                        this.canvas = canvas;
                        this.ctx = canvas.getContext("2d");
                        this.particles = [];
                        this.hue = Math.random() * 360;
                        this.type = Math.floor(Math.random() * 3);
                    }

                    createParticles(x, y) {
                        const particleCount =
                            this.type === 0 ? 80 : this.type === 1 ? 100 : 120;
                        const spreadFactor =
                            this.type === 0 ? 8 : this.type === 1 ? 12 : 6;

                        for (let i = 0; i < particleCount; i++) {
                            let angle, velocity;

                            if (this.type === 2) {
                                angle = (i / particleCount) * Math.PI * 2;
                                velocity = spreadFactor;
                            } else {
                                angle = Math.random() * Math.PI * 2;
                                velocity = Math.random() * spreadFactor;
                            }

                            const particle = {
                                x,
                                y,
                                vx: Math.cos(angle) * velocity,
                                vy: Math.sin(angle) * velocity,
                                size: Math.random() * 3 + 2,
                                hue:
                                    this.type === 1
                                        ? this.hue + Math.random() * 50 - 25
                                        : this.hue,
                                alpha: 1,
                                decay: Math.random() * 0.02 + 0.005,
                                brightness: Math.random() * 30 + 70,
                                trail: [],
                            };
                            this.particles.push(particle);
                        }
                    }

                    update() {
                        this.particles.forEach((particle, index) => {
                            if (this.type === 1) {
                                particle.trail.push({
                                    x: particle.x,
                                    y: particle.y,
                                    alpha: particle.alpha,
                                });
                                if (particle.trail.length > 5) {
                                    particle.trail.shift();
                                }
                            }

                            particle.x += particle.vx;
                            particle.y += particle.vy;
                            particle.vy += 0.15;
                            particle.vx *= 0.99;
                            particle.vy *= 0.99;
                            particle.alpha -= particle.decay;

                            if (particle.alpha <= 0) {
                                this.particles.splice(index, 1);
                            }
                        });
                    }

                    draw() {
                        this.particles.forEach((particle) => {
                            if (this.type === 1 && particle.trail.length > 0) {
                                particle.trail.forEach((point) => {
                                    this.ctx.beginPath();
                                    this.ctx.arc(
                                        point.x,
                                        point.y,
                                        particle.size * 0.5,
                                        0,
                                        Math.PI * 2,
                                    );
                                    this.ctx.fillStyle =
                                        "hsla(" +
                                        particle.hue +
                                        ", 100%, " +
                                        particle.brightness +
                                        "%, " +
                                        point.alpha * 0.5 +
                                        ")";
                                    this.ctx.fill();
                                });
                            }

                            this.ctx.beginPath();
                            this.ctx.arc(
                                particle.x,
                                particle.y,
                                particle.size,
                                0,
                                Math.PI * 2,
                            );
                            this.ctx.fillStyle =
                                "hsla(" +
                                particle.hue +
                                ", 100%, " +
                                particle.brightness +
                                "%, " +
                                particle.alpha +
                                ")";
                            this.ctx.fill();

                            this.ctx.beginPath();
                            this.ctx.arc(
                                particle.x,
                                particle.y,
                                particle.size * 1.5,
                                0,
                                Math.PI * 2,
                            );
                            this.ctx.fillStyle =
                                "hsla(" +
                                particle.hue +
                                ", 100%, " +
                                particle.brightness +
                                "%, " +
                                particle.alpha * 0.3 +
                                ")";
                            this.ctx.fill();
                        });
                    }
                }

                // Setup
                const canvas = document.getElementById("fireworks");
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                const ctx = canvas.getContext("2d");
                const fireworks = [];

                // Animation loop
                function animate() {
                    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    if (Math.random() < 0.08) {
                        const firework = new Firework(canvas);
                        firework.createParticles(
                            Math.random() * canvas.width,
                            Math.random() * (canvas.height * 0.8),
                        );
                        fireworks.push(firework);
                    }

                    fireworks.forEach((firework, index) => {
                        firework.update();
                        firework.draw();

                        if (firework.particles.length === 0) {
                            fireworks.splice(index, 1);
                        }
                    });

                    requestAnimationFrame(animate);
                }

                animate();

                // Resize handler
                window.addEventListener("resize", () => {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                });
            </script>
        </body>
    </html>`;

  return new Response(htmlTemplate, {
    headers: { "Content-Type": "text/html" },
  });
}
