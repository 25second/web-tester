import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, MousePointer2, FormInput, Shield } from "lucide-react";
import { botDetector } from "@/lib/botDetection";
import { formAnalyzer } from "@/lib/formAnalysis";

interface MetricsState {
  bot: {
    probability: number;
    details: {
      bot: number;
      automation: number;
      fraud: number;
    };
  };
  cursor: {
    naturalness: number;
    pathEfficiency: number;
    jitterAmount: number;
  };
  form: {
    averageTimePerField: number;
    correctionRate: number;
    backspaceRate: number;
    naturalness: number;
  };
}

export function BehaviorMetrics() {
  const [metrics, setMetrics] = useState<MetricsState>({
    bot: {
      probability: 0,
      details: { bot: 0, automation: 0, fraud: 0 }
    },
    cursor: {
      naturalness: 1,
      pathEfficiency: 1,
      jitterAmount: 0
    },
    form: {
      averageTimePerField: 0,
      correctionRate: 0,
      backspaceRate: 0,
      naturalness: 1
    }
  });

  useEffect(() => {
    // Initialize bot detection
    botDetector.initialize().then(() => {
      const status = botDetector.getDetectionStatus();
      if (typeof status !== 'string') {
        setMetrics(prev => ({
          ...prev,
          bot: {
            probability: status.automationProbability,
            details: status.details
          }
        }));
      }
    });

    // Update metrics periodically
    const interval = setInterval(() => {
      const formMetrics = formAnalyzer.analyzeFormBehavior();
      setMetrics(prev => ({
        ...prev,
        form: formMetrics
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const humanScore = Math.max(0, Math.min(1, (
    (1 - metrics.bot.probability) * 0.4 +
    metrics.cursor.naturalness * 0.3 +
    metrics.form.naturalness * 0.3
  )));

  return (
    <Card className="w-96 bg-background/80 backdrop-blur-sm">
      <CardHeader className="p-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Behavior Analysis
        </CardTitle>
        <CardDescription>
          Detailed interaction metrics
        </CardDescription>
        <div className="space-y-2 mt-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Human Behavior Score:</span>
            <span>{(humanScore * 100).toFixed(1)}%</span>
          </div>
          <Progress 
            value={humanScore * 100} 
            className="h-2"
            indicatorClassName={`${
              humanScore > 0.7 
                ? 'bg-green-500' 
                : humanScore > 0.4 
                ? 'bg-yellow-500' 
                : 'bg-red-500'
            }`}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Tabs defaultValue="bot" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="bot" className="flex-1">
              <Shield className="h-4 w-4 mr-2" />
              Bot
            </TabsTrigger>
            <TabsTrigger value="cursor" className="flex-1">
              <MousePointer2 className="h-4 w-4 mr-2" />
              Cursor
            </TabsTrigger>
            <TabsTrigger value="form" className="flex-1">
              <FormInput className="h-4 w-4 mr-2" />
              Form
            </TabsTrigger>
          </TabsList>
          <TabsContent value="bot" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Bot Detection:</span>
                  <span>{(metrics.bot.details.bot * 100).toFixed(1)}%</span>
                </div>
                <Progress value={metrics.bot.details.bot * 100} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Automation:</span>
                  <span>{(metrics.bot.details.automation * 100).toFixed(1)}%</span>
                </div>
                <Progress value={metrics.bot.details.automation * 100} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Fraud Risk:</span>
                  <span>{(metrics.bot.details.fraud * 100).toFixed(1)}%</span>
                </div>
                <Progress value={metrics.bot.details.fraud * 100} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="cursor" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Movement Naturalness:</span>
                  <span>{(metrics.cursor.naturalness * 100).toFixed(1)}%</span>
                </div>
                <Progress value={metrics.cursor.naturalness * 100} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Path Efficiency:</span>
                  <span>{(metrics.cursor.pathEfficiency * 100).toFixed(1)}%</span>
                </div>
                <Progress value={metrics.cursor.pathEfficiency * 100} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Jitter Amount:</span>
                  <span>{metrics.cursor.jitterAmount.toFixed(3)}</span>
                </div>
                <Progress 
                  value={Math.min(metrics.cursor.jitterAmount * 100, 100)} 
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="form" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Input Naturalness:</span>
                  <span>{(metrics.form.naturalness * 100).toFixed(1)}%</span>
                </div>
                <Progress value={metrics.form.naturalness * 100} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Avg. Time per Field:</span>
                  <span>{metrics.form.averageTimePerField.toFixed(0)}ms</span>
                </div>
                <Progress 
                  value={Math.min(metrics.form.averageTimePerField / 5000 * 100, 100)} 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Correction Rate:</span>
                  <span>{(metrics.form.correctionRate * 100).toFixed(1)}%</span>
                </div>
                <Progress value={metrics.form.correctionRate * 100} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
