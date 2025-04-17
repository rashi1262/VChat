import React, { useEffect, useRef } from "react";

const GradientCircleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2;

    let frame = 0;

    const draw = () => {
      frame += 1;

      // Animate gradient layers with different speeds and directions
      const gradientX1 = centerX + Math.sin(frame * 0.02) * 60; // Fast left-right motion
      const gradientY1 = centerY + Math.cos(frame * 0.02) * 60; // Fast top-bottom motion

      const gradientX2 = centerX + Math.cos(frame * 0.01) * 100; // Slow left-right motion
      const gradientY2 = centerY + Math.sin(frame * 0.01) * 100; // Slow top-bottom motion
      const gradient1 = ctx.createRadialGradient(
        gradientX1,
        gradientY1,
        10,
        centerX,
        centerY,
        radius
      );
      gradient1.addColorStop(0, "#00e0ff");
      gradient1.addColorStop(0.4, "#3399ff");
      gradient1.addColorStop(1, "#0093cc");

      // Second Gradient Layer (Radial)
      const gradient2 = ctx.createRadialGradient(
        gradientX2,
        gradientY2,
        20,
        centerX,
        centerY,
        radius
      );
      gradient2.addColorStop(0, "#ff00cc");
      gradient2.addColorStop(0.5, "#ff6699");
      gradient2.addColorStop(1, "#9933ff");

      // Third Gradient Layer (Linear)
      const gradient3 = ctx.createLinearGradient(0, 0, width, height); // Left to right diagonal
      gradient3.addColorStop(0, "#ff8c00");
      gradient3.addColorStop(0.5, "#ffb84d");
      gradient3.addColorStop(1, "#ff4d00");

      ctx.clearRect(0, 0, width, height);

      // First Layer (Glow effect with a soft blur)
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.shadowColor = "rgba(0, 140, 255, 0.6)";
      ctx.shadowBlur = 40;
      ctx.fillStyle = gradient1;
      ctx.fill();

      // Second Layer (Light effect with softer blur)
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.shadowColor = "rgba(255, 105, 180, 0.5)";
      ctx.shadowBlur = 30;
      ctx.fillStyle = gradient2;
      ctx.fill();

      // Third Layer (Linear Gradient effect with soft light)
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = gradient3;
      ctx.globalCompositeOperation = "overlay"; // Blend the linear gradient with the rest
      ctx.fill();

      requestAnimationFrame(draw);
    };

    draw();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      className="w-full h-full rounded-full"
    />
  );
};

export default GradientCircleCanvas;
