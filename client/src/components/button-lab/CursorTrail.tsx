import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";

interface Point {
  x: number;
  y: number;
  alpha: number;
  timestamp: number;
}

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const [isRecording, setIsRecording] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isRecording) return;

      pointsRef.current.push({
        x: e.clientX,
        y: e.clientY,
        alpha: 1,
        timestamp: Date.now()
      });
    };

    const handleClick = (e: MouseEvent) => {
      if (!isRecording) return;

      // Add a larger point for clicks
      pointsRef.current.push({
        x: e.clientX,
        y: e.clientY,
        alpha: 1,
        timestamp: Date.now()
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw lines between points
      if (pointsRef.current.length > 1) {
        ctx.beginPath();
        ctx.moveTo(pointsRef.current[0].x, pointsRef.current[0].y);

        for (let i = 1; i < pointsRef.current.length; i++) {
          const point = pointsRef.current[i];
          const prevPoint = pointsRef.current[i - 1];

          // Only connect points that are close in time (within 100ms)
          if (point.timestamp - prevPoint.timestamp < 100) {
            ctx.lineTo(point.x, point.y);
          } else {
            ctx.moveTo(point.x, point.y);
          }
        }

        ctx.strokeStyle = "rgba(33, 150, 243, 0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw points
      for (let i = 0; i < pointsRef.current.length; i++) {
        const point = pointsRef.current[i];
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(33, 150, 243, ${point.alpha})`;
        ctx.fill();

        // Fade out points slowly
        point.alpha = Math.max(0.2, point.alpha - 0.001);
      }

      requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
    };
  }, [isRecording]);

  const clearTrail = () => {
    pointsRef.current = [];
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50"
      />
      <div className="fixed bottom-4 right-4 z-50 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={clearTrail}
          className="bg-background/80 backdrop-blur-sm"
        >
          <Eraser className="h-4 w-4 mr-2" />
          Clear Trail
        </Button>
      </div>
    </>
  );
}