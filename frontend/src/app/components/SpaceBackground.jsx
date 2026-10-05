import { useEffect, useRef } from "react";

export default function SpaceBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Generate Stars
    const numStars = 220;
    const stars = Array.from({ length: numStars }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.6 + 0.4,
      alpha: Math.random(),
      speed: Math.random() * 0.015 + 0.005,
      twinkleSpeed: Math.random() * 0.02 + 0.008,
      color: Math.random() > 0.85 ? "#00f3ff" : Math.random() > 0.95 ? "#ffaa00" : "#ffffff",
    }));

    // Data Transmission Beams
    const beams = Array.from({ length: 6 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: Math.random() * 200 + 100,
      speed: Math.random() * 2 + 1,
      angle: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    // Shooting Stars
    const shootingStars = [];
    const spawnShootingStar = () => {
      if (Math.random() < 0.04 && shootingStars.length < 3) {
        shootingStars.push({
          x: Math.random() * width * 0.8,
          y: Math.random() * height * 0.4,
          length: Math.random() * 100 + 50,
          speed: Math.random() * 9 + 7,
          alpha: 1,
          angle: Math.PI / 4,
          color: Math.random() > 0.5 ? "#00f3ff" : "#3b82f6",
        });
      }
    };

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep Pitch Black Base Gradient with Soft Glow
      const bgGrad = ctx.createRadialGradient(width * 0.5, height * 0.3, 100, width * 0.5, height * 0.5, width * 0.9);
      bgGrad.addColorStop(0, "#080b12");
      bgGrad.addColorStop(0.5, "#050505");
      bgGrad.addColorStop(1, "#020202");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw Stars
      stars.forEach((star) => {
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 1 || star.alpha < 0.2) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }

        ctx.fillStyle = star.color === "#ffffff" 
          ? `rgba(255, 255, 255, ${Math.abs(star.alpha)})` 
          : star.color;
        ctx.shadowColor = star.color;
        ctx.shadowBlur = star.color !== "#ffffff" ? 6 : 0;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Parallax drift
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }
      });

      // Draw Data Beams
      beams.forEach((b) => {
        ctx.strokeStyle = `rgba(0, 243, 255, ${b.opacity * 0.25})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x + Math.cos(b.angle) * b.length, b.y + Math.sin(b.angle) * b.length);
        ctx.stroke();

        b.x += Math.cos(b.angle) * b.speed * 0.2;
        b.y += Math.sin(b.angle) * b.speed * 0.2;

        if (b.x > width || b.y > height) {
          b.x = Math.random() * width * 0.5;
          b.y = Math.random() * height * 0.5;
        }
      });

      // Spawn & Draw Shooting Stars
      spawnShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        const tailX = ss.x - Math.cos(ss.angle) * ss.length;
        const tailY = ss.y - Math.sin(ss.angle) * ss.length;

        const gradient = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
        gradient.addColorStop(0, ss.color);
        gradient.addColorStop(1, "rgba(0, 243, 255, 0)");

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.shadowColor = ss.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.alpha -= 0.018;

        if (ss.alpha <= 0) {
          shootingStars.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="space-bg-container">
      <canvas ref={canvasRef} className="space-canvas" />
      <div className="grid-overlay" />
      <div className="scanline-overlay" />
    </div>
  );
}
