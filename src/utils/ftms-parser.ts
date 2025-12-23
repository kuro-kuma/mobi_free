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
 */
// 解析器改为兼容 Indoor Bike Data (0x2AD2) 结构
// 即使 UUID 是 Cross Trainer (0x2ACE)，许多厂商 (如 Mobi) 实际上发送的是 Bike 数据结构
const getUint16BE = (value: DataView, offset: number) => {
  return (value.getUint8(offset) << 8) | value.getUint8(offset + 1);
};

export const parseCrossTrainerData = (value: DataView): Partial<WorkoutStats> => {
  // DEBUG log
  // const hex = Array.from(new Uint8Array(value.buffer, value.byteOffset, value.byteLength))
  //   .map(b => b.toString(16).padStart(2, '0').toUpperCase())
  //   .join(' ');
  // console.log('FTMS Raw:', hex);

  const result: Partial<WorkoutStats> = {};

  // Reverting to Flag-based dynamic parsing because hardcoded offsets failed (flags change!).
  const flags = value.getUint16(0, true);
  let offset = 2; // Start after flags

  // 1. Instant Speed (Bit 0? No, usually Byte 2-3 if flags say so)
  // Standard FTMS:
  // Bit 0: More Data (0 = Instant Speed present) - Actually usually present regardless?
  // Let's assume Speed is always first field 2 bytes.
  // We found Speed needs /10.
  const rawSpeed = getUint16BE(value, offset);
  result.instantSpeed = rawSpeed / 10;
  offset += 2;

  // 2. Average Speed (Bit 1)
  if (flags & (1 << 1)) {
    offset += 2;
  }

  // 3. Total Distance (Bit 2) - 3 Bytes
  // We saw this was present.
  if (flags & (1 << 2)) {
    // Device reports cumulative distance (e.g. 88km). 
    // We want session distance. 
    // Ideally we'd read this and subtract start value, but device value implies long-term total.
    // Better to calculate locally based on speed for this session.
    // result.totalDistance = ...
    offset += 3;
  }

  // 4. Cadence? (Bit 3?)
  // Standard: Bit 3 is "Step Count"? Or Bit 2 is "Instant Cadence" (Bike)?
  // In Mobi trace, we saw: 
  // Flags 2F 9E -> 0010 1111 1001 1110
  // Bits set: 1, 2, 3, 4, 7, 8... 
  // Wait, 9E = 1001 1110. Bits: 1(AvgSpd), 2(Dist), 3(Step), 4(Stride), 7(Resist).
  // 2F = 0010 1111. Bits 8(Power), 9(AvgPwr), 10(Energy), 11(HR), 13(Time).
  // So:
  // Speed (2)
  // Avg Speed (2)
  // Distance (3)
  // Step Count (2) <- This is our Cadence!
  // Stride Count (2)
  // Resistance (2) <- This is our Power? Or pure Resistance?
  // Power (2) <- This was the fixed value F0.

  // Let's parse strictly by flags now.

  // Step Count (Bit 3) -> Mapped to Cadence
  if (flags & (1 << 3)) {
    result.instantCadence = getUint16BE(value, offset);
    offset += 2;
  }

  // Stride Count (Bit 4)
  if (flags & (1 << 4)) {
    offset += 2;
  }

  // Elevation (Bit 5)
  if (flags & (1 << 5)) {
    offset += 2;
  }

  // Inclination (Bit 6)
  if (flags & (1 << 6)) {
    offset += 2;
  }

  // Resistance Level (Bit 7) -> Mapped to Power based on trace?
  // Trace showed 00 C0 (192) at this slot?
  // Let's check sequence: Spd(2)+Avg(2)+Dist(3)+Step(2)+Stride(2) = 11 bytes.
  // Flags(2) + 11 = 13.
  // Next fields?
  // If bit 7 is set: 2 bytes.
  if (flags & (1 << 7)) {
    // This looks like where dynamic power was.
    result.instantPower = getUint16BE(value, offset);
    offset += 2;
  }

  // Instant Power (Bit 8) -> The fixed F0 value
  if (flags & (1 << 8)) {
    // Skip fixed junk
    offset += 2;
  }

  // Avg Power (Bit 9)
  if (flags & (1 << 9)) {
    offset += 2;
  }

  // Energy (Bit 10)
  if (flags & (1 << 10)) {
    // Device reports cumulative/huge value (510 kcal).
    // We will calculate locally based on power.
    // result.kcal = ... 
    offset += 2; // Total
    offset += 2; // /Hour
    offset += 1; // /Min
  }

  // Heart Rate (Bit 11)
  if (flags & (1 << 11)) {
    const hr = value.getUint8(offset);
    if (hr !== 0xFF) {
      result.heartRate = hr;
    } else {
      result.heartRate = 0;
    }
    offset += 1;
  }

  // Meta (Bit 12)
  if (flags & (1 << 12)) offset += 1;

  // Time (Bit 13)
  if (flags & (1 << 13)) {
    const time = value.getUint16(offset, true); // LE per trace
    if (time !== 0xFFFF) {
      result.elapsedTime = time;
    } else {
      result.elapsedTime = 0;
    }
    offset += 2;
  }

  return result;
};