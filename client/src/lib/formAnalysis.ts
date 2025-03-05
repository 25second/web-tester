import { botDetector } from './botDetection';

interface FormTiming {
  fieldName: string;
  startTime: number;
  endTime: number;
  corrections: number;
  backspaces: number;
}

class FormAnalyzer {
  private fieldTimings: Map<string, FormTiming> = new Map();
  
  startFieldTracking(fieldName: string) {
    this.fieldTimings.set(fieldName, {
      fieldName,
      startTime: Date.now(),
      endTime: 0,
      corrections: 0,
      backspaces: 0
    });
  }

  endFieldTracking(fieldName: string) {
    const timing = this.fieldTimings.get(fieldName);
    if (timing) {
      timing.endTime = Date.now();
    }
  }

  recordCorrection(fieldName: string) {
    const timing = this.fieldTimings.get(fieldName);
    if (timing) {
      timing.corrections++;
    }
  }

  recordBackspace(fieldName: string) {
    const timing = this.fieldTimings.get(fieldName);
    if (timing) {
      timing.backspaces++;
    }
  }

  analyzeFormBehavior(): {
    averageTimePerField: number;
    correctionRate: number;
    backspaceRate: number;
    naturalness: number;
  } {
    let totalTime = 0;
    let totalCorrections = 0;
    let totalBackspaces = 0;
    let fieldCount = 0;

    this.fieldTimings.forEach(timing => {
      if (timing.endTime > 0) {
        totalTime += timing.endTime - timing.startTime;
        totalCorrections += timing.corrections;
        totalBackspaces += timing.backspaces;
        fieldCount++;
      }
    });

    const averageTimePerField = fieldCount > 0 ? totalTime / fieldCount : 0;
    const correctionRate = fieldCount > 0 ? totalCorrections / fieldCount : 0;
    const backspaceRate = fieldCount > 0 ? totalBackspaces / fieldCount : 0;

    // Calculate naturalness based on timing patterns and corrections
    const timingVariance = this.calculateTimingVariance();
    const humanScore = botDetector.calculateHumanScore();
    
    // Combine multiple factors for naturalness score
    const naturalness = Math.min(1, Math.max(0,
      (humanScore * 0.4) +
      (timingVariance * 0.3) +
      (Math.min(1, correctionRate * 0.5) * 0.3)
    ));

    return {
      averageTimePerField,
      correctionRate,
      backspaceRate,
      naturalness
    };
  }

  private calculateTimingVariance(): number {
    const timings = Array.from(this.fieldTimings.values())
      .filter(t => t.endTime > 0)
      .map(t => t.endTime - t.startTime);

    if (timings.length < 2) return 1;

    const mean = timings.reduce((a, b) => a + b, 0) / timings.length;
    const variance = timings.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / timings.length;
    
    // Normalize variance to 0-1 range
    // Too little variance (robot-like) or too much variance (unusual) reduces the score
    const normalizedVariance = Math.min(1, Math.max(0, 
      1 - Math.abs(variance - 500000) / 1000000
    ));

    return normalizedVariance;
  }

  reset() {
    this.fieldTimings.clear();
  }
}

export const formAnalyzer = new FormAnalyzer();
