/**
 * Minimalist High-Contrast Theme
 * Black, White, and Heat accent color palette
 */

export const Theme = {
  colors: {
    // Primary colors
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    
    // Heat accent color (vibrant orange-red)
    heat: '#FF4500',
    heatLight: '#FF6B35',
    heatDark: '#CC3700',
    
    // Semantic colors
    border: '#E0E0E0',
    divider: '#CCCCCC',
    
    // Status colors (using heat variations)
    urgent: '#FF4500',
    important: '#FF6B35',
    normal: '#000000',
    
    // Interactive states
    pressed: '#F5F5F5',
    disabled: '#CCCCCC',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8,
    },
  },
  
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
  
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
  },
} as const;

export type ThemeType = typeof Theme;
