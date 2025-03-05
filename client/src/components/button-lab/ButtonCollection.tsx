import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { behaviorAnalyzer } from "@/lib/behaviorAnalysis";

export function ButtonCollection() {
  const [loading, setLoading] = useState(false);
  const [switched, setSwitched] = useState(false);
  const [sliderValue, setSliderValue] = useState([50]);
  const { toast } = useToast();
  const lastInteractionTime = useRef<number>(Date.now());

  const interactionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/interactions", data);
    }
  });

  const logInteraction = async (buttonId: string, eventType: string, e: React.MouseEvent) => {
    const currentTime = Date.now();
    const timeSinceLastInteraction = currentTime - lastInteractionTime.current;
    lastInteractionTime.current = currentTime;

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const cursorPosition = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    // Add point to behavior analyzer
    behaviorAnalyzer.addPoint(e.clientX, e.clientY, currentTime);
    const behaviorMetrics = behaviorAnalyzer.analyzeBehavior();

    const velocity = behaviorAnalyzer.calculateVelocity();
    const acceleration = behaviorAnalyzer.calculateAcceleration();

    await interactionMutation.mutateAsync({
      buttonId,
      eventType,
      cursorPosition,
      cursorVelocity: velocity,
      cursorAcceleration: acceleration,
      timingData: {
        timeStamp: currentTime,
        timeSinceLastInteraction
      },
      behaviorMetrics,
      metadata: { timestamp: new Date() }
    });
  };

  const handleLoadingClick = async (e: React.MouseEvent) => {
    setLoading(true);
    await logInteraction("loading-button", "click", e);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6">
      <div className="flex flex-col gap-4 items-center">
        <Button
          variant="default"
          className="w-full"
          onClick={(e) => logInteraction("primary-button", "click", e)}
        >
          Primary Button
        </Button>
        <span className="text-sm text-muted-foreground">Standard Click</span>
      </div>

      <div className="flex flex-col gap-4 items-center">
        <Button
          variant="secondary"
          className="w-full"
          onClick={(e) => handleLoadingClick(e)}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Loading..." : "Loading Button"}
        </Button>
        <span className="text-sm text-muted-foreground">Loading State</span>
      </div>

      <div className="flex flex-col gap-4 items-center">
        <Switch
          checked={switched}
          onCheckedChange={(checked) => setSwitched(checked)}
        />
        <span className="text-sm text-muted-foreground">Toggle Switch</span>
      </div>

      <div className="flex flex-col gap-4 items-center">
        <Button
          variant="destructive"
          className="w-full"
          onClick={(e) => {
            logInteraction("destructive-button", "click", e);
            toast({
              title: "Action triggered",
              description: "Destructive action completed",
            });
          }}
        >
          Destructive
        </Button>
        <span className="text-sm text-muted-foreground">With Feedback</span>
      </div>

      <div className="flex flex-col gap-4 items-center">
        <Slider
          value={sliderValue}
          onValueChange={setSliderValue}
          max={100}
          step={1}
        />
        <span className="text-sm text-muted-foreground">Slider Input</span>
      </div>
    </div>
  );
}