/**
 * Design System Constants
 * Centralized design tokens and constants
 */

// Default Primary Color for Profile
export const DEFAULT_PRIMARY_COLOR = '#3B82F6';

// Plan Types
export type PlanType = 'demo' | 'basic' | 'professional' | 'enterprise';

// Plan Configuration Interface
export interface PlanConfig {
  name: string;
  price: number;
  credits: number;
  maxSchedulesPerMonth?: number;
  maxSchedulesTotal?: number;
  maxAddresses: number | 'unlimited';
  isPeriodic: boolean;
}

// Plan Constants
export const PLANS: Record<PlanType, PlanConfig> = {
  demo: { 
    name: 'demo', 
    price: 0, 
    credits: 50, 
    maxSchedulesTotal: 50,
    maxAddresses: 1,
    isPeriodic: false
  },
  basic: { 
    name: 'one', 
    price: 67, 
    credits: 80, 
    maxSchedulesPerMonth: 80,
    maxAddresses: 1,
    isPeriodic: true
  },
  professional: { 
    name: 'pro', 
    price: 99, 
    credits: 120, 
    maxSchedulesPerMonth: 120,
    maxAddresses: 3,
    isPeriodic: true
  },
  enterprise: { 
    name: 'prime', 
    price: 159, 
    credits: 300, 
    maxSchedulesPerMonth: 300,
    maxAddresses: 'unlimited',
    isPeriodic: true
  },
};

// Color Palette
export const COLORS = {
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
    light: '#DBEAFE', // blue-100
    dark: '#1D4ED8',  // blue-700
  },
  success: {
    DEFAULT: '#10B981', // green-500
    light: '#D1FAE5',   // green-100
    dark: '#047857',    // green-700
  },
  error: {
    DEFAULT: '#EF4444', // red-500
    light: '#FEE2E2',   // red-100
    dark: '#B91C1C',    // red-700
  },
  warning: {
    DEFAULT: '#F59E0B', // orange-500
    light: '#FEF3C7',   // orange-100
    dark: '#D97706',    // orange-600
  },
  info: {
    DEFAULT: '#3B82F6', // blue-500
    light: '#DBEAFE',   // blue-100
    dark: '#1D4ED8',    // blue-700
  },
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  }
} as const

// Typography Scale
export const FONT_SIZES = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
} as const

// Font Weights
export const FONT_WEIGHTS = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const

// Spacing Scale
export const SPACING = {
  0: '0px',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
} as const

// Border Radius
export const RADIUS = {
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',  // Circular
} as const

// Breakpoints
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1400px',
} as const

// Icon Sizes
export const ICON_SIZES = {
  sm: 16,      // w-4 h-4
  default: 20, // w-5 h-5
  md: 24,      // w-6 h-6
  lg: 32,      // w-8 h-8
} as const

// Z-Index Scale
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const

// Animation Durations
export const DURATIONS = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
} as const

// Touch Target Minimum Size
export const TOUCH_TARGET = {
  minHeight: '44px',
  minWidth: '44px',
} as const

// Container Max Width
export const CONTAINER = {
  maxWidth: '1280px',
  padding: {
    mobile: '1rem',
    tablet: '1.5rem',
    desktop: '2rem',
  }
} as const

// Button Heights
export const BUTTON_HEIGHTS = {
  sm: '36px',      // h-9
  default: '40px', // h-10
  lg: '44px',      // h-11
} as const

// Input Heights
export const INPUT_HEIGHTS = {
  default: '40px', // h-10
  lg: '48px',      // h-12
} as const

// Shadow Scale
export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const

// Status Colors
export const STATUS_COLORS = {
  success: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  error: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
  },
  warning: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-200',
  },
  info: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
} as const
