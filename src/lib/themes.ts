export type Theme = 'default' | 'professional' | 'dark' | 'creative';

export interface ThemeConfig {
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    card: string;
    border: string;
    muted: string;
  };
  layout: {
    sidebarPosition: 'left' | 'right' | 'hidden';
    navStyle: 'top' | 'minimal' | 'floating';
    cardStyle: 'compact' | 'normal' | 'spacious' | 'floating';
    spacing: 'tight' | 'normal' | 'loose';
    animations: 'minimal' | 'normal' | 'playful';
  };
  typography: {
    headingSize: 'sm' | 'base' | 'lg' | 'xl';
    bodySize: 'sm' | 'base' | 'lg';
    fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  };
}

export const themes: Record<Theme, ThemeConfig> = {
  default: {
    name: 'Default',
    description: 'Modern dark theme with purple gradients',
    colors: {
      primary: 'rgb(147, 51, 234)', // purple-600
      secondary: 'rgb(99, 102, 241)', // indigo-500
      background: 'rgb(3, 7, 18)', // slate-950
      foreground: 'rgb(248, 250, 252)', // slate-50
      card: 'rgb(15, 23, 42)', // slate-800
      border: 'rgb(51, 65, 85)', // slate-600
      muted: 'rgb(100, 116, 139)', // slate-500
    },
    layout: {
      sidebarPosition: 'left',
      navStyle: 'top',
      cardStyle: 'normal',
      spacing: 'normal',
      animations: 'normal',
    },
    typography: {
      headingSize: 'lg',
      bodySize: 'base',
      fontWeight: 'semibold',
    },
  },
  professional: {
    name: 'Professional',
    description: 'Clean white business theme with minimal design',
    colors: {
      primary: 'rgb(30, 64, 175)', // blue-800 - more professional
      secondary: 'rgb(75, 85, 99)', // gray-600
      background: 'rgb(255, 255, 255)', // pure white
      foreground: 'rgb(31, 41, 55)', // gray-800
      card: 'rgb(249, 250, 251)', // gray-50
      border: 'rgb(209, 213, 219)', // gray-300
      muted: 'rgb(107, 114, 128)', // gray-500
    },
    layout: {
      sidebarPosition: 'left',
      navStyle: 'top',
      cardStyle: 'compact',
      spacing: 'tight',
      animations: 'minimal',
    },
    typography: {
      headingSize: 'base',
      bodySize: 'sm',
      fontWeight: 'medium',
    },
  },
  dark: {
    name: 'Pure Dark',
    description: 'Clean dark theme with blue accents, no purple',
    colors: {
      primary: 'rgb(34, 197, 94)', // green-500 - different from purple
      secondary: 'rgb(14, 165, 233)', // sky-500
      background: 'rgb(9, 9, 11)', // zinc-950 - deeper black
      foreground: 'rgb(250, 250, 250)', // zinc-50
      card: 'rgb(24, 24, 27)', // zinc-900
      border: 'rgb(63, 63, 70)', // zinc-700
      muted: 'rgb(161, 161, 170)', // zinc-400
    },
    layout: {
      sidebarPosition: 'left',
      navStyle: 'top',
      cardStyle: 'normal',
      spacing: 'normal',
      animations: 'normal',
    },
    typography: {
      headingSize: 'lg',
      bodySize: 'base',
      fontWeight: 'semibold',
    },
  },
  creative: {
    name: 'Sidebar Only',
    description: 'Everything in sidebar, no headers, minimal nav',
    colors: {
      primary: 'rgb(236, 72, 153)', // pink-500
      secondary: 'rgb(168, 85, 247)', // purple-500
      background: 'rgb(254, 252, 232)', // yellow-50
      foreground: 'rgb(41, 37, 36)', // stone-800
      card: 'rgb(255, 255, 255)', // white
      border: 'rgb(253, 224, 71)', // yellow-300
      muted: 'rgb(120, 113, 108)', // stone-500
    },
    layout: {
      sidebarPosition: 'left',
      navStyle: 'minimal', // Minimal header
      cardStyle: 'floating',
      spacing: 'loose',
      animations: 'playful',
    },
    typography: {
      headingSize: 'xl',
      bodySize: 'lg',
      fontWeight: 'bold',
    },
  },
};

export const getThemeClasses = (theme: Theme) => {
  const config = themes[theme];
  const classes: Record<string, string> = {};

  // Base layout classes
  classes.container = theme === 'creative' 
    ? 'min-h-screen p-4 space-y-8' 
    : 'min-h-screen';

  classes.sidebar = theme === 'professional'
    ? 'w-64 border-r bg-card/50 backdrop-blur-sm'
    : theme === 'creative'
    ? 'hidden'
    : 'w-72 border-r bg-background/80 backdrop-blur-md';

  classes.main = theme === 'creative'
    ? 'container mx-auto max-w-7xl'
    : theme === 'professional'
    ? 'flex-1 bg-background'
    : 'flex-1 bg-background/50 backdrop-blur-sm';

  classes.nav = theme === 'professional'
    ? 'h-16 border-b bg-card px-6 flex items-center justify-between'
    : theme === 'creative'
    ? 'fixed top-4 left-4 right-4 z-50 bg-card/90 backdrop-blur-xl rounded-2xl px-6 py-4 border shadow-lg'
    : 'h-20 border-b bg-background/80 backdrop-blur-md px-8 flex items-center justify-between';

  // Card styles
  classes.card = theme === 'professional'
    ? 'bg-card border rounded-lg shadow-sm'
    : theme === 'creative'
    ? 'bg-card border-2 border-primary/20 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300'
    : 'bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg';

  classes.cardPadding = config.layout.spacing === 'tight'
    ? 'p-4'
    : config.layout.spacing === 'loose'
    ? 'p-8'
    : 'p-6';

  // Typography
  classes.heading = theme === 'creative'
    ? 'text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'
    : theme === 'professional'
    ? 'text-lg font-medium text-foreground'
    : 'text-2xl font-bold text-foreground';

  classes.subheading = theme === 'creative'
    ? 'text-xl font-bold text-foreground'
    : theme === 'professional'
    ? 'text-sm font-medium text-muted-foreground'
    : 'text-lg font-semibold text-foreground';

  classes.body = `text-${config.typography.bodySize} font-${config.typography.fontWeight} text-foreground`;

  // Spacing
  classes.spacing = config.layout.spacing === 'tight'
    ? 'space-y-4'
    : config.layout.spacing === 'loose'
    ? 'space-y-12'
    : 'space-y-6';

  classes.grid = theme === 'creative'
    ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8'
    : theme === 'professional'
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

  // Animations
  classes.animation = config.layout.animations === 'playful'
    ? 'animate-bounce-in hover:animate-wiggle'
    : config.layout.animations === 'minimal'
    ? 'transition-colors duration-200'
    : 'transition-all duration-300 hover:scale-105';

  classes.button = theme === 'creative'
    ? 'bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300'
    : theme === 'professional'
    ? 'bg-primary text-white font-medium py-2 px-4 rounded-md hover:bg-primary/90 transition-colors duration-200'
    : 'bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-lg hover:bg-primary/90 transition-all duration-200';

  return classes;
};