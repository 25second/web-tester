interface Point {
  x: number;
  y: number;
  timestamp: number;
}

interface BehaviorMetrics {
  naturalness: number;
  jitterAmount: number;
  pathEfficiency: number;
}

export class BehaviorAnalyzer {
  private movementBuffer: Point[] = [];
  private readonly bufferSize = 10;

  addPoint(x: number, y: number, timestamp: number) {
    this.movementBuffer.push({ x, y, timestamp });
    if (this.movementBuffer.length > this.bufferSize) {
      this.movementBuffer.shift();
    }
  }

  calculateVelocity(): { x: number, y: number } {
    if (this.movementBuffer.length < 2) return { x: 0, y: 0 };

    const latest = this.movementBuffer[this.movementBuffer.length - 1];
    const previous = this.movementBuffer[this.movementBuffer.length - 2];
    const dt = (latest.timestamp - previous.timestamp) / 1000; // Convert to seconds

    return {
      x: (latest.x - previous.x) / dt,
      y: (latest.y - previous.y) / dt
    };
  }

  calculateAcceleration(): { x: number, y: number } {
    if (this.movementBuffer.length < 3) return { x: 0, y: 0 };

    const v1 = this.calculateVelocity();
    const previous = this.movementBuffer[this.movementBuffer.length - 3];
    const middle = this.movementBuffer[this.movementBuffer.length - 2];
    const dt = (middle.timestamp - previous.timestamp) / 1000;

    const v0 = {
      x: (middle.x - previous.x) / dt,
      y: (middle.y - previous.y) / dt
    };

    return {
      x: (v1.x - v0.x) / dt,
      y: (v1.y - v0.y) / dt
    };
  }

  analyzeBehavior(): BehaviorMetrics {
    const velocity = this.calculateVelocity();
    const acceleration = this.calculateAcceleration();

    // Calculate jitter (micro-movements)
    const jitter = this.calculateJitter();

    // Calculate path efficiency
    const efficiency = this.calculatePathEfficiency();

    // Calculate movement naturalness based on velocity changes
    const naturalness = this.calculateNaturalness(velocity, acceleration);

    return {
      naturalness,
      jitterAmount: jitter,
      pathEfficiency: efficiency
    };
  }

  private calculateJitter(): number {
    if (this.movementBuffer.length < 3) return 0;

    let totalJitter = 0;
    for (let i = 2; i < this.movementBuffer.length; i++) {
      const p1 = this.movementBuffer[i - 2];
      const p2 = this.movementBuffer[i - 1];
      const p3 = this.movementBuffer[i];

      // Calculate angle changes in movement
      const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
      const angleChange = Math.abs(angle2 - angle1);

      totalJitter += angleChange;
    }

    return totalJitter / (this.movementBuffer.length - 2);
  }

  private calculatePathEfficiency(): number {
    if (this.movementBuffer.length < 2) return 1;

    const start = this.movementBuffer[0];
    const end = this.movementBuffer[this.movementBuffer.length - 1];

    // Direct distance
    const directDistance = Math.sqrt(
      Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    );

    // Actual path distance
    let actualDistance = 0;
    for (let i = 1; i < this.movementBuffer.length; i++) {
      const p1 = this.movementBuffer[i - 1];
      const p2 = this.movementBuffer[i];
      actualDistance += Math.sqrt(
        Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
      );
    }

    return directDistance / (actualDistance || 1);
  }

  private calculateNaturalness(
    velocity: { x: number; y: number },
    acceleration: { x: number; y: number }
  ): number {
    // Human movements typically follow a bell-shaped velocity profile
    // and have smooth acceleration changes
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    const accel = Math.sqrt(
      acceleration.x * acceleration.x + acceleration.y * acceleration.y
    );

    // Penalize very high speeds and accelerations (likely automated)
    const speedFactor = Math.min(1, 1000 / (speed + 1));
    const accelFactor = Math.min(1, 500 / (accel + 1));

    // Consider timing between points
    const timingNaturalness = this.calculateTimingNaturalness();

    return (speedFactor + accelFactor + timingNaturalness) / 3;
  }

  private calculateTimingNaturalness(): number {
    if (this.movementBuffer.length < 2) return 1;

    let timingScore = 0;
    let count = 0;

    for (let i = 1; i < this.movementBuffer.length; i++) {
      const dt = this.movementBuffer[i].timestamp - this.movementBuffer[i - 1].timestamp;
      
      // Human movements typically have some variation in timing
      // but not too much variation or too regular patterns
      const timeScore = Math.min(1, Math.max(0, 
        1 - Math.abs(dt - 16.67) / 50  // Assuming 60fps as baseline
      ));
      
      timingScore += timeScore;
      count++;
    }

    return timingScore / count;
  }
}

export const behaviorAnalyzer = new BehaviorAnalyzer();
