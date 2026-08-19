import type { StayRecord, TransportMode, TransportSegment } from "../types";

function id(prefix: string, now: Date): string {
  return `${prefix}-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createTransportSegment(
  from: string,
  to: string,
  mode: TransportMode,
  now = new Date()
): TransportSegment {
  return { id: id("transport", now), from, to, mode };
}

export function createStayRecord(
  name: string,
  area: string,
  checkIn: string,
  checkOut: string,
  now = new Date()
): StayRecord {
  return { id: id("stay", now), name, area, checkIn, checkOut };
}
