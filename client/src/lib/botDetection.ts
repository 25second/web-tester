import { load, type DetectorResults } from '@fingerprintjs/botd';

class BotDetectionService {
  private detector: any = null;
  private detectionResult: DetectorResults | null = null;

  async initialize() {
    try {
      this.detector = await load();
      this.detectionResult = await this.detector.detect();
      return this.detectionResult;
    } catch (error) {
      console.error('Failed to initialize bot detection:', error);
      return null;
    }
  }

  getDetectionStatus() {
    if (!this.detectionResult) return 'unknown';

    // Use optional chaining and nullish coalescing for safety
    const botProbability = this.detectionResult?.bot?.probability ?? 0;
    const automationProbability = this.detectionResult?.automation?.probability ?? 0;
    const fraudProbability = this.detectionResult?.deviceFraud?.probability ?? 0;

    // Weighted score calculation
    const weightedScore = (
      botProbability * 0.4 + 
      automationProbability * 0.4 + 
      fraudProbability * 0.2
    );

    return {
      isAutomated: weightedScore > 0.5,
      automationProbability: weightedScore,
      details: {
        bot: botProbability,
        automation: automationProbability,
        fraud: fraudProbability
      }
    };
  }

  calculateHumanScore(): number {
    try {
      if (!this.detectionResult) return 1;

      const status = this.getDetectionStatus();
      if (typeof status === 'string') return 1;

      return Math.max(0, Math.min(1, 1 - status.automationProbability));
    } catch (error) {
      console.error('Error calculating human score:', error);
      return 1; // Default to "human" on error
    }
  }
}

export const botDetector = new BotDetectionService();