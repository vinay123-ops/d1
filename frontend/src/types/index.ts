// Zone and Map related types
export interface Zone {
  id: string;
  name: string;
  coordinates: [number, number]; // [lat, lng]
  status: 'normal' | 'anomaly' | 'bottleneck' | 'critical';
  crowdDensity: number;
  lastFrame?: string; // URL to last frame image
  lastUpdated: string; // ISO timestamp
  area?: number; // in square meters
}

export interface ZoneDetails extends Zone {
  summary: string;
  events: EventLogEntry[];
  nearbyUnits: Unit[];
}

// Unit and Dispatch types
export interface Unit {
  id: string;
  type: 'police' | 'medical' | 'fire' | 'security';
  name: string;
  status: 'available' | 'dispatched' | 'busy' | 'offline';
  location: [number, number]; // [lat, lng]
  estimatedArrival?: string; // ISO timestamp
  assignedZone?: string;
  lastUpdated: string;
}

export interface DispatchRecommendation {
  zoneId: string;
  recommendedUnits: Unit[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  estimatedResponseTime: number; // in minutes
}

// Event and Alert types
export interface EventLogEntry {
  id: string;
  timestamp: string; // ISO timestamp
  zoneId: string;
  type: 'bottleneck' | 'anomaly' | 'dispatch' | 'alert' | 'resolution';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  details?: Record<string, any>;
  unitId?: string;
  resolved?: boolean;
  resolvedAt?: string;
}

export interface Alert {
  id: string;
  type: 'fire' | 'medical' | 'security' | 'crowd' | 'technical';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  zoneId?: string;
  timestamp: string;
  acknowledged?: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

// Summary and Analytics types
export interface SummaryEntry {
  id: string;
  timestamp: string;
  zoneId: string;
  zoneName: string;
  combinedSummary: string;
  crowdDensity: number;
  anomalyCount: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: Zone['status'];
}

export interface DashboardMetrics {
  totalZones: number;
  bottlenecks: number;
  anomalies: number;
  unitsDispatched: number;
  activeAlerts: number;
  lastUpdated: string;
}

export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface AnalyticsData {
  crowdDensityTrend: ChartDataPoint[];
  anomalyTrend: ChartDataPoint[];
  dispatchTrend: ChartDataPoint[];
  zoneStatusDistribution: {
    normal: number;
    anomaly: number;
    bottleneck: number;
    critical: number;
  };
}

// User and Auth types
export interface Commander {
  id: string;
  name: string;
  rank: string;
  division: string;
  fcmToken?: string;
  lastActive: string;
  permissions: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  commander: Commander | null;
  loading: boolean;
  error: string | null;
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface CameraConfig {
  id: string;
  name: string;
  location: [number, number];
  status: 'online' | 'offline' | 'maintenance';
  streamUrl?: string;
  zoneId: string;
}

// Firebase real-time data types
export interface FirebaseBottleneckEvent {
  zone_id: string;
  density: number;
  timestamp: string;
  severity: string;
  camera_id: string;
}

export interface FirebaseAnomalyEvent {
  zone_id: string;
  type: string;
  confidence: number;
  timestamp: string;
  details: Record<string, any>;
}

export interface FirebaseDispatchLog {
  unit_id: string;
  zone_id: string;
  timestamp: string;
  status: string;
  eta: string;
}

// UI State types
export interface UIState {
  sidebarOpen: boolean;
  selectedZone: string | null;
  mapCenter: [number, number];
  mapZoom: number;
  filterCriteria: {
    severity?: string[];
    status?: string[];
    timeRange?: [string, string];
  };
  theme: 'light' | 'dark';
}

// Error types
export interface DashboardError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
} 