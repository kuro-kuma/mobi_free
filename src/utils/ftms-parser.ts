/**
 * 莫比椭圆机 FTMS 协议数据解析器
 */

export interface WorkoutStats {
  instantSpeed: number;
  instantCadence: number;
  instantPower: number;
  resistanceLevel: number;
  totalDistance: number;
  kcal: number;
  heartRate: number;      // New
  elapsedTime: number;    // New
}

/**
 * 解析 Cross Trainer Data (0x2ACE)
 * Strict implementation of Bluetooth FTMS spec.
 */
const getUint24 = (view: DataView, offset: number) => {
  return view.getUint16(offset, true) | (view.getUint8(offset + 2) << 16);
};

export const parseCrossTrainerData = (value: DataView): Partial<WorkoutStats> => {
  const result: Partial<WorkoutStats> = {};

  // Cross Trainer Data (0x2ACE)
  // Flags: 24 bits (3 bytes)
  // Note: We use Little Endian as per standard.
  const flags = value.getUint16(0, true) | (value.getUint8(2) << 16);
  let offset = 3;

  // 1. Instantaneous Speed (Always present, Uint16, 0.01 km/h)
  const speed = value.getUint16(offset, true);
  result.instantSpeed = speed / 100; // 0.01 resolution
  offset += 2;

  // 2. Average Speed (Bit 1)
  if (flags & (1 << 1)) {
    offset += 2;
  }

  // 3. Total Distance (Bit 2) - Uint24 (meters)
  if (flags & (1 << 2)) {
    const dist = getUint24(value, offset);
    result.totalDistance = dist;
    offset += 3;
  }

  // 4. Step Count / Instant Step Rate (Bit 3)
  // Based on nRF and standard usage observed:
  // Bit 3 presence implies TWO fields:
  // - Step Per Minute (Uint16) -> Instant Cadence
  // - Average Step Rate (Uint16)
  if (flags & (1 << 3)) {
    const stepRate = value.getUint16(offset, true);
    result.instantCadence = stepRate;
    offset += 2;

    // Average Step Rate (Skip)
    offset += 2;
  }

  // 5. Stride Count (Bit 4)
  if (flags & (1 << 4)) {
    // const strideCount = value.getUint16(offset, true);
    offset += 2;
  }

  // 6. Elevation Gain (Bit 5)
  if (flags & (1 << 5)) {
    offset += 2;
  }

  // 7. Inclination (Bit 6)
  if (flags & (1 << 6)) {
    offset += 2;
  }

  // 8. Resistance Level (Bit 7)
  if (flags & (1 << 7)) {
    const resistance = value.getInt16(offset, true);
    result.resistanceLevel = resistance / 10;
    offset += 2;
  }

  // 9. Instantaneous Power (Bit 8)
  if (flags & (1 << 8)) {
    const power = value.getInt16(offset, true);
    result.instantPower = power;
    offset += 2;
  }

  // 10. Average Power (Bit 9)
  if (flags & (1 << 9)) {
    offset += 2;
  }

  // 11. Total Energy (Bit 10) - Uint16 (kcal)
  if (flags & (1 << 10)) {
    const energy = value.getUint16(offset, true);
    result.kcal = energy;
    offset += 2;
  }

  // 12. Energy Per Hour (Bit 11) - Uint16
  if (flags & (1 << 11)) {
    offset += 2;
  }

  // 13. Energy Per Minute (Bit 12) - Uint8
  if (flags & (1 << 12)) {
    offset += 1;
  }

  // 14. Heart Rate (Bit 13) - Uint8
  if (flags & (1 << 13)) {
    const hr = value.getUint8(offset);
    result.heartRate = hr;
    offset += 1;
  }

  // 15. Metabolic Equivalent (Bit 14) - Uint8
  if (flags & (1 << 14)) {
    offset += 1;
  }

  // 16. Elapsed Time (Bit 15) - Uint16
  if (flags & (1 << 15)) {
    const time = value.getUint16(offset, true);
    result.elapsedTime = time;
    offset += 2;
  }

  // Remaining Time (Bit 16)
  if (flags & (1 << 16)) {
    offset += 2;
  }

  return result;
};