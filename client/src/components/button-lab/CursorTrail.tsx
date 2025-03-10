import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eraser, Activity } from "lucide-react";
import { behaviorAnalyzer } from "@/lib/behaviorAnalysis";
import { botDetector } from "@/lib/botDetection";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Point {
  x: number;
  y: number;
  alpha: number;
  timestamp: number;
  isClick?: boolean;
}

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const [isRecording, setIsRecording] = useState(true);
  const [metrics, setMetrics] = useState({
    naturalness: 1,
    jitterAmount: 0,
    pathEfficiency: 1,
    humanScore: 1,
  });

  useEffect(() => {
    botDetector.initialize().then(() => {
      setMetrics(prev => ({
        ...prev,
        humanScore: botDetector.calculateHumanScore()
      }));
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isRecording) return;

      const timestamp = Date.now();
      behaviorAnalyzer.addPoint(e.pageX, e.pageY, timestamp);
      const newBehaviorMetrics = behaviorAnalyzer.analyzeBehavior();
      const humanScore = botDetector.calculateHumanScore();

      setMetrics({
        ...newBehaviorMetrics,
        humanScore
      });

      pointsRef.current.push({
        x: e.pageX,
        y: e.pageY,
        alpha: 1,
        timestamp,
        isClick: false
      });
    };

    const handleClick = (e: MouseEvent) => {
      if (!isRecording) return;

      const timestamp = Date.now();
      behaviorAnalyzer.addPoint(e.pageX, e.pageY, timestamp);
      const newBehaviorMetrics = behaviorAnalyzer.analyzeBehavior();
      const humanScore = botDetector.calculateHumanScore();

      setMetrics({
        ...newBehaviorMetrics,
        humanScore
      });

      pointsRef.current.push({
        x: e.pageX,
        y: e.pageY,
        alpha: 1,
        timestamp,
        isClick: true
      });
    };

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply scroll offset transform
      ctx.save();
      ctx.translate(0, -window.scrollY);

      // Draw paths
      if (pointsRef.current.length > 1) {
        ctx.beginPath();
        ctx.moveTo(pointsRef.current[0].x, pointsRef.current[0].y);

        for (let i = 1; i < pointsRef.current.length; i++) {
          const point = pointsRef.current[i];
          const prevPoint = pointsRef.current[i - 1];

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

      // Draw points and clicks
      for (let i = 0; i < pointsRef.current.length; i++) {
        const point = pointsRef.current[i];
        ctx.beginPath();

        if (point.isClick) {
          ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 0, 0, ${point.alpha})`;

          ctx.strokeStyle = `rgba(255, 255, 255, ${point.alpha})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(33, 150, 243, ${point.alpha})`;
        }

        ctx.fill();

        point.alpha = Math.max(
          0.2,
          point.alpha - (point.isClick ? 0.002 : 0.001)
        );
      }

      ctx.restore();

      requestAnimationFrame(animate);
    };

    window.addEventListener("resize", updateCanvasSize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);
    updateCanvasSize();
    animate();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
    };
  }, [isRecording]);

  const clearTrail = () => {
    pointsRef.current = [];
  };

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        pointerEvents: 'none',
        transform: 'translateZ(0)'
      }}>
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        />
      </div>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <Card className="w-64 bg-background/80 backdrop-blur-sm">
          <CardHeader className="p-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Behavior Metrics
            </CardTitle>
            <CardDescription className="text-xs">
              Real-time interaction analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Human Score:</span>
                <span>{(metrics.humanScore * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Naturalness:</span>
                <span>{(metrics.naturalness * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Path Efficiency:</span>
                <span>{(metrics.pathEfficiency * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Jitter Amount:</span>
                <span>{metrics.jitterAmount.toFixed(3)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
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