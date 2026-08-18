
import { Zone, GrainLot, AlertEvent, UserProfile, SensorReading, RiskLevel, SAFE_THRESHOLDS } from '../types';

// ============================================================================
// Seed data — simulates a real FAM-GUARD device install on a small Tamil Nadu
// farm (Vishnu .M). Use this for prototype demonstration. All numbers are
// plausible but not live device reads.
// ============================================================================

const minutesAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

function makeSensors(temp: number, rh: number, co2: number, moist: number): SensorReading[] {
  return [
    {
      key: 'temperature',
      label: 'Temperature',
      value: temp,
      unit: '°C',
      safeMin: SAFE_THRESHOLDS.temperature.min,
      safeMax: SAFE_THRESHOLDS.temperature.max,
      icon: 'fa-temperature-half',
    },
    {
      key: 'humidity',
      label: 'Relative Humidity',
      value: rh,
      unit: '%',
      safeMin: SAFE_THRESHOLDS.humidity.min,
      safeMax: SAFE_THRESHOLDS.humidity.max,
      icon: 'fa-droplet',
    },
    {
      key: 'co2',
      label: 'CO₂ Level',
      value: co2,
      unit: 'ppm',
      safeMin: SAFE_THRESHOLDS.co2.min,
      safeMax: SAFE_THRESHOLDS.co2.max,
      icon: 'fa-wind',
    },
    {
      key: 'moisture',
      label: 'Grain Moisture',
      value: moist,
      unit: '%wb',
      safeMin: SAFE_THRESHOLDS.moisture.min,
      safeMax: SAFE_THRESHOLDS.moisture.max,
      icon: 'fa-seedling',
    },
  ];
}

export function classifyRisk(sensors: SensorReading[]): RiskLevel {
  let outOfRange = 0;
  let critical = false;
  for (const s of sensors) {
    if (s.value < s.safeMin || s.value > s.safeMax) outOfRange++;
    if (s.key === 'humidity' && s.value > 75) critical = true;
    if (s.key === 'temperature' && s.value > 32) critical = true;
    if (s.key === 'moisture' && s.value > 15) critical = true;
    if (s.key === 'co2' && s.value > 1500) critical = true;
  }
  if (critical || outOfRange >= 3) return 'ACTION';
  if (outOfRange >= 1) return 'CHECK';
  return 'SAFE';
}

export const SEED_ZONES: Zone[] = [
  {
    id: 'z1',
    name: 'Main Paddy Bin',
    location: 'Backyard Godown',
    crop: 'Paddy',
    storageType: 'Metal Bin',
    capacityKg: 1200,
    filledKg: 950,
    risk: 'SAFE',
    sensors: makeSensors(24.5, 58, 720, 11.8),
    ventilation: 'AUTO',
    lastUpdated: minutesAgo(2),
    ventilationRuntimeMin: 184,
    safeDaysRemaining: 95,
    activeAlerts: 0,
  },
  {
    id: 'z2',
    name: 'Side Ragi Store',
    location: 'Side Room',
    crop: 'Ragi',
    storageType: 'Hermetic Bag',
    capacityKg: 400,
    filledKg: 320,
    risk: 'CHECK',
    sensors: makeSensors(29.2, 71, 980, 13.6),
    ventilation: 'MANUAL_ON',
    lastUpdated: minutesAgo(5),
    ventilationRuntimeMin: 96,
    safeDaysRemaining: 41,
    activeAlerts: 2,
  },
  {
    id: 'z3',
    name: 'Top Pulses Drum',
    location: 'Top Loft',
    crop: 'Pulses',
    storageType: 'Plastic Drum',
    capacityKg: 200,
    filledKg: 180,
    risk: 'ACTION',
    sensors: makeSensors(33.4, 78, 1480, 15.2),
    ventilation: 'MANUAL_OFF',
    lastUpdated: minutesAgo(8),
    ventilationRuntimeMin: 42,
    safeDaysRemaining: 6,
    activeAlerts: 4,
  },
  {
    id: 'z4',
    name: 'Maize Overflow',
    location: 'Open Verandah',
    crop: 'Maize',
    storageType: 'Gunja Bag',
    capacityKg: 800,
    filledKg: 540,
    risk: 'SAFE',
    sensors: makeSensors(26.8, 62, 690, 12.4),
    ventilation: 'AUTO',
    lastUpdated: minutesAgo(3),
    ventilationRuntimeMin: 132,
    safeDaysRemaining: 78,
    activeAlerts: 0,
  },
];

export const SEED_INVENTORY: GrainLot[] = [
  {
    id: 'lot-1',
    crop: 'Paddy',
    variety: 'CR-1009 (Subala)',
    quantityKg: 950,
    harvestDate: daysAgo(45),
    storageDate: daysAgo(38),
    zoneId: 'z1',
    moistureAtStorage: 11.8,
    expectedShelfLifeDays: 180,
    isCertified: true,
    lotCode: 'PDD-2026-001',
  },
  {
    id: 'lot-2',
    crop: 'Ragi',
    variety: 'GPU-28',
    quantityKg: 320,
    harvestDate: daysAgo(20),
    storageDate: daysAgo(14),
    zoneId: 'z2',
    moistureAtStorage: 13.6,
    expectedShelfLifeDays: 120,
    isCertified: true,
    lotCode: 'RGI-2026-002',
  },
  {
    id: 'lot-3',
    crop: 'Pulses',
    variety: 'Black Gram (ADT-5)',
    quantityKg: 180,
    harvestDate: daysAgo(60),
    storageDate: daysAgo(55),
    zoneId: 'z3',
    moistureAtStorage: 15.2,
    expectedShelfLifeDays: 90,
    isCertified: false,
    lotCode: 'PLS-2026-003',
  },
  {
    id: 'lot-4',
    crop: 'Maize',
    variety: 'CO-6',
    quantityKg: 540,
    harvestDate: daysAgo(15),
    storageDate: daysAgo(10),
    zoneId: 'z4',
    moistureAtStorage: 12.4,
    expectedShelfLifeDays: 150,
    isCertified: true,
    lotCode: 'MZE-2026-004',
  },
];

export const SEED_ALERTS: AlertEvent[] = [
  {
    id: 'a1',
    timestamp: minutesAgo(8),
    zoneId: 'z3',
    zoneName: 'Top Pulses Drum',
    severity: 'ACTION',
    category: 'Humidity',
    title: 'Critical Humidity Spike',
    detail: 'Relative humidity exceeded 75% threshold for over 30 minutes. Visible moisture condensation likely on bin walls.',
    recommendation: 'Sun-dry grain immediately. Move bag to lower, cooler location. Inspect for mould.',
    acknowledged: false,
  },
  {
    id: 'a2',
    timestamp: minutesAgo(22),
    zoneId: 'z3',
    zoneName: 'Top Pulses Drum',
    severity: 'ACTION',
    category: 'Moisture',
    title: 'Grain Moisture Above 15%',
    detail: 'Grain moisture content at 15.2%wb. Aflatoxin risk rises sharply above 14%.',
    recommendation: 'Dry to 12% or below. Use solar dryer or tarpaulin sun drying before storage continues.',
    acknowledged: false,
  },
  {
    id: 'a3',
    timestamp: hoursAgo(1),
    zoneId: 'z3',
    zoneName: 'Top Pulses Drum',
    severity: 'CHECK',
    category: 'CO2',
    title: 'CO₂ Rising — Possible Insect Respiration',
    detail: 'CO₂ at 1480ppm. Rising trend indicates possible early-stage insect infestation.',
    recommendation: 'Inspect for live insects. Apply neem leaf treatment or diatomaceous earth as preventive.',
    acknowledged: false,
  },
  {
    id: 'a4',
    timestamp: hoursAgo(2),
    zoneId: 'z2',
    zoneName: 'Side Ragi Store',
    severity: 'CHECK',
    category: 'Temperature',
    title: 'Temperature Approaching Threshold',
    detail: 'Temperature at 29.2°C. Within 1°C of safe upper limit.',
    recommendation: 'Activate ventilation during cooler evening hours (8 PM – 6 AM).',
    acknowledged: true,
  },
  {
    id: 'a5',
    timestamp: hoursAgo(3),
    zoneId: 'z2',
    zoneName: 'Side Ragi Store',
    severity: 'CHECK',
    category: 'Humidity',
    title: 'RH Above 65%',
    detail: 'RH at 71%. Fungal growth favourable window opened.',
    recommendation: 'Reduce aeration source humidity. Inspect top layer for early mould.',
    acknowledged: false,
  },
  {
    id: 'a6',
    timestamp: daysAgo(1),
    zoneId: 'z1',
    zoneName: 'Main Paddy Bin',
    severity: 'SAFE',
    category: 'Ventilation',
    title: 'Auto-Ventilation Cycle Complete',
    detail: 'Daily auto-vent cycle ran for 38 minutes during cooler hours.',
    recommendation: 'No action needed.',
    acknowledged: true,
  },
  {
    id: 'a7',
    timestamp: daysAgo(2),
    zoneId: 'z4',
    zoneName: 'Maize Overflow',
    severity: 'CHECK',
    category: 'Pest',
    title: 'Possible Pest Activity Detected',
    detail: 'CO₂ variation pattern suggests low-level insect activity in gunja bag.',
    recommendation: 'Apply diatomaceous earth at 1g/kg. Re-scan in 48 hours.',
    acknowledged: true,
  },
  {
    id: 'a8',
    timestamp: daysAgo(3),
    zoneId: 'z1',
    zoneName: 'Main Paddy Bin',
    severity: 'SAFE',
    category: 'Device',
    title: 'Sensor Self-Calibration Complete',
    detail: 'All four sensors recalibrated within tolerance.',
    recommendation: 'No action needed.',
    acknowledged: true,
  },
];

export function makeDefaultProfile(name: string, phone?: string): UserProfile {
  return {
    name,
    phone,
    farmName: 'Vishnu Family Farm',
    village: 'Poongulam',
    district: 'Tiruvarur',
    state: 'Tamil Nadu',
    totalLandHoldingAcres: 1.8,
    primaryCrop: 'Paddy',
    subscription: 'Basic',
    isLoggedIn: true,
    authMethod: 'Phone',
    theme: 'light',
    language: 'English',
    offlineMode: false,
    pairedDeviceId: 'FAM-GUARD-01',
    farmMembers: [
      {
        id: 'm1',
        name,
        role: 'Owner',
        phone,
        initials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'FM',
        receivesAlerts: true,
      }
    ],
    totalZones: SEED_ZONES.length,
    totalGrainKg: SEED_ZONES.reduce((s, z) => s + z.filledKg, 0),
    safeZones: SEED_ZONES.filter(z => z.risk === 'SAFE').length,
    checkZones: SEED_ZONES.filter(z => z.risk === 'CHECK').length,
    actionZones: SEED_ZONES.filter(z => z.risk === 'ACTION').length,
    seasonStartMonth: 'April',
  };
}

// 7-day trend data for charts (kept simple — inline SVG-friendly)
export const SEED_TRENDS: Record<string, { t: string; temperature: number; humidity: number; co2: number; moisture: number }[]> = {
  z1: [
    { t: 'Mon', temperature: 23.8, humidity: 56, co2: 680, moisture: 11.6 },
    { t: 'Tue', temperature: 24.0, humidity: 57, co2: 700, moisture: 11.7 },
    { t: 'Wed', temperature: 24.2, humidity: 57, co2: 710, moisture: 11.7 },
    { t: 'Thu', temperature: 24.1, humidity: 58, co2: 705, moisture: 11.8 },
    { t: 'Fri', temperature: 24.3, humidity: 58, co2: 715, moisture: 11.8 },
    { t: 'Sat', temperature: 24.4, humidity: 58, co2: 720, moisture: 11.8 },
    { t: 'Sun', temperature: 24.5, humidity: 58, co2: 720, moisture: 11.8 },
  ],
  z2: [
    { t: 'Mon', temperature: 27.1, humidity: 64, co2: 850, moisture: 12.8 },
    { t: 'Tue', temperature: 27.8, humidity: 67, co2: 890, moisture: 13.0 },
    { t: 'Wed', temperature: 28.4, humidity: 69, co2: 920, moisture: 13.2 },
    { t: 'Thu', temperature: 28.7, humidity: 70, co2: 950, moisture: 13.4 },
    { t: 'Fri', temperature: 29.0, humidity: 70, co2: 970, moisture: 13.5 },
    { t: 'Sat', temperature: 29.1, humidity: 71, co2: 980, moisture: 13.6 },
    { t: 'Sun', temperature: 29.2, humidity: 71, co2: 980, moisture: 13.6 },
  ],
  z3: [
    { t: 'Mon', temperature: 29.5, humidity: 70, co2: 1100, moisture: 13.8 },
    { t: 'Tue', temperature: 30.4, humidity: 72, co2: 1180, moisture: 14.1 },
    { t: 'Wed', temperature: 31.2, humidity: 74, co2: 1250, moisture: 14.4 },
    { t: 'Thu', temperature: 32.0, humidity: 76, co2: 1340, moisture: 14.7 },
    { t: 'Fri', temperature: 32.5, humidity: 77, co2: 1410, moisture: 15.0 },
    { t: 'Sat', temperature: 33.0, humidity: 78, co2: 1450, moisture: 15.1 },
    { t: 'Sun', temperature: 33.4, humidity: 78, co2: 1480, moisture: 15.2 },
  ],
  z4: [
    { t: 'Mon', temperature: 25.8, humidity: 60, co2: 650, moisture: 12.0 },
    { t: 'Tue', temperature: 26.0, humidity: 60, co2: 660, moisture: 12.1 },
    { t: 'Wed', temperature: 26.2, humidity: 61, co2: 670, moisture: 12.2 },
    { t: 'Thu', temperature: 26.5, humidity: 61, co2: 680, moisture: 12.3 },
    { t: 'Fri', temperature: 26.6, humidity: 62, co2: 685, moisture: 12.3 },
    { t: 'Sat', temperature: 26.7, humidity: 62, co2: 690, moisture: 12.4 },
    { t: 'Sun', temperature: 26.8, humidity: 62, co2: 690, moisture: 12.4 },
  ],
};
