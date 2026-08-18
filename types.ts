
// ============================================================================
// FAM-GUARD — Domain Types
// Family Agricultural Resource & Grain Utility & Alert Device
// ============================================================================

export type RiskLevel = 'SAFE' | 'CHECK' | 'ACTION';

export type CropType =
  | 'Paddy'
  | 'Wheat'
  | 'Maize'
  | 'Ragi'
  | 'Bajra'
  | 'Pulses'
  | 'Groundnut'
  | 'Soybean'
  | 'Mixed';

export type StorageType =
  | 'Metal Bin'
  | 'Pusa Bin'
  | 'Mud Storage'
  | 'Hermetic Bag'
  | 'Warehouse'
  | 'Plastic Drum'
  | 'Gunja Bag';

export type SensorKey =
  | 'temperature'
  | 'humidity'
  | 'co2'
  | 'moisture';

export interface SensorReading {
  key: SensorKey;
  label: string;
  value: number;
  unit: string;
  /** Reference safe range as per FAO / TNAU guidance */
  safeMin: number;
  safeMax: number;
  icon: string;
}

export interface Zone {
  id: string;
  name: string;
  /** e.g., "Backyard godown", "Top bin", "Side room" */
  location: string;
  crop: CropType;
  storageType: StorageType;
  capacityKg: number;
  filledKg: number;
  risk: RiskLevel;
  sensors: SensorReading[];
  ventilation: 'AUTO' | 'MANUAL_ON' | 'MANUAL_OFF' | 'FAULT';
  lastUpdated: string; // ISO
  /** runtime in minutes for the current week */
  ventilationRuntimeMin: number;
  /** Predicted safe storage days remaining at current trajectory */
  safeDaysRemaining: number;
  activeAlerts: number;
}

export interface GrainLot {
  id: string;
  crop: CropType;
  variety?: string;
  quantityKg: number;
  harvestDate: string;
  storageDate: string;
  zoneId: string;
  moistureAtStorage: number;
  expectedShelfLifeDays: number;
  isCertified?: boolean;
  lotCode: string;
}

export interface AlertEvent {
  id: string;
  timestamp: string;
  zoneId: string;
  zoneName: string;
  severity: RiskLevel;
  category: 'Temperature' | 'Humidity' | 'CO2' | 'Moisture' | 'Pest' | 'Device' | 'Ventilation';
  title: string;
  detail: string;
  recommendation: string;
  acknowledged: boolean;
}

export interface FarmMember {
  id: string;
  name: string;
  role: 'Owner' | 'Co-Farmer' | 'Worker' | 'Family';
  phone?: string;
  initials: string;
  receivesAlerts: boolean;
}

export interface UserProfile {
  name: string;
  email?: string;
  phone?: string;
  farmName: string;
  village: string;
  district: string;
  state: string;
  totalLandHoldingAcres: number;
  primaryCrop: CropType;
  subscription: 'Basic' | 'Plus' | 'Pro';
  isLoggedIn: boolean;
  authMethod?: 'Google' | 'Phone';
  theme: 'light' | 'dark';
  language: 'English' | 'Tamil' | 'Hindi';
  offlineMode: boolean;
  pairedDeviceId?: string;
  farmMembers: FarmMember[];
  /** Aggregated counters for dashboard */
  totalZones: number;
  totalGrainKg: number;
  safeZones: number;
  checkZones: number;
  actionZones: number;
  seasonStartMonth: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface VentilationSchedule {
  zoneId: string;
  enabled: boolean;
  /** HH:MM 24h */
  startHour: number;
  durationMin: number;
  /** Trigger condition for AUTO mode */
  trigger: 'Humidity > 70%' | 'Temperature > 32°C' | 'CO2 > 1000ppm' | 'Manual Only';
}

export interface TrendPoint {
  t: string;
  temperature: number;
  humidity: number;
  co2: number;
  moisture: number;
}

export enum AppScreen {
  LOGIN = 'LOGIN',
  WELCOME = 'WELCOME',
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  ZONES = 'ZONES',
  ZONE_DETAIL = 'ZONE_DETAIL',
  ALERTS = 'ALERTS',
  INVENTORY = 'INVENTORY',
  VENTILATION = 'VENTILATION',
  ADVISORY_CHAT = 'ADVISORY_CHAT',
  HISTORY = 'HISTORY',
  SUBSCRIPTION = 'SUBSCRIPTION',
  FARM_MANAGEMENT = 'FARM_MANAGEMENT',
  PROFILE_EDIT = 'PROFILE_EDIT',
  SETTINGS = 'SETTINGS'
}

// Reference thresholds (per FAO / TNAU / Indian Standard IS 1155)
export const SAFE_THRESHOLDS = {
  temperature: { min: 15, max: 27, label: 'Temperature', unit: '°C' },
  humidity: { min: 30, max: 65, label: 'Relative Humidity', unit: '%' },
  co2: { min: 350, max: 1000, label: 'CO₂', unit: 'ppm' },
  moisture: { min: 8, max: 13, label: 'Grain Moisture', unit: '%wb' },
};
