// Map configuration
export const DEFAULT_MAP_CENTER: [number, number] = [28.6139, 77.2090]; // New Delhi
export const DEFAULT_MAP_ZOOM = 12;
export const MIN_MAP_ZOOM = 8;
export const MAX_MAP_ZOOM = 18;

// Status colors for zones
export const STATUS_COLORS = {
  normal: '#16a34a',     // Green
  anomaly: '#f97316',    // Orange
  bottleneck: '#dc2626', // Red
  critical: '#b91c1c',   // Dark red
} as const;

// Severity levels
export const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'] as const;

// Unit types
export const UNIT_TYPES = ['police', 'medical', 'fire', 'security'] as const;

// Alert types
export const ALERT_TYPES = ['fire', 'medical', 'security', 'crowd', 'technical'] as const;

// Dashboard refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  SUMMARY_FEED: 5000,    // 5 seconds
  ANALYTICS: 30000,      // 30 seconds
  MAP_MARKERS: 10000,    // 10 seconds
  METRICS: 15000,        // 15 seconds
} as const;

// Firebase configuration paths
export const FIREBASE_PATHS = {
  BOTTLENECK_EVENTS: 'bottleneck_events',
  ANOMALIES: 'anomalies',
  DISPATCH_LOG: 'dispatch_log',
  ZONES: 'zones',
  UNITS: 'units',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  SUMMARY: '/summary',
  UNITS: '/units',
  CAMERA_CONFIG: '/camera-config',
  ZONES: '/zones',
  EVENTS: '/events',
  DISPATCH: '/dispatch',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'drishti-theme',
  MAP_PREFERENCES: 'drishti-map-preferences',
  USER_PREFERENCES: 'drishti-user-preferences',
  FCM_TOKEN: 'drishti-fcm-token',
} as const;

// Date and time formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy HH:mm',
  API: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  LOG: 'yyyy-MM-dd HH:mm:ss',
} as const;

// Notification settings
export const NOTIFICATION_SETTINGS = {
  DEFAULT_DURATION: 5000, // 5 seconds
  CRITICAL_DURATION: 0,   // Persistent
  MAX_NOTIFICATIONS: 10,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to server. Please check your connection.',
  AUTH_ERROR: 'Authentication failed. Please login again.',
  PERMISSION_ERROR: 'You do not have permission to perform this action.',
  DATA_ERROR: 'Unable to load data. Please try again.',
  FIREBASE_ERROR: 'Real-time connection failed. Some features may not work.',
} as const;

// Component sizes and limits
export const COMPONENT_LIMITS = {
  MAX_SUMMARY_ENTRIES: 100,
  MAX_EVENT_LOG_ENTRIES: 500,
  MAX_CHART_DATA_POINTS: 50,
  SIDEBAR_WIDTH: 280,
  TOPBAR_HEIGHT: 64,
} as const; 