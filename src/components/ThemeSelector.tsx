import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Monitor, 
  Moon, 
  Sparkles,
  Check 
} from 'lucide-react';

const themeIcons = {
  default: Monitor,
  professional: Monitor,
  dark: Moon,
  creative: Sparkles,
};

export function ThemeSelector() {
  const { theme, setTheme, availableThemes, themeClasses } = useTheme();

  return (
    <Card className={`${themeClasses.card} ${themeClasses.cardPadding}`}>
      <div className="flex items-center gap-3 mb-6">
        <Palette className="w-6 h-6 text-primary" />
        <h3 className={themeClasses.subheading}>Choose Your Theme</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableThemes.map((themeOption) => {
          const Icon = themeIcons[themeOption.id];
          const isActive = theme === themeOption.id;
          
          return (
            <div
              key={themeOption.id}
              className={`
                relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-300
                ${isActive 
                  ? 'border-primary bg-primary/10 shadow-lg' 
                  : 'border-border hover:border-primary/50 hover:bg-card/50'
                }
              `}
              onClick={() => setTheme(themeOption.id)}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-foreground">{themeOption.name}</h4>
                    {isActive && <Check className="w-4 h-4 text-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {themeOption.description}
                  </p>
                  {isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Currently Active
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-muted/20 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Each theme changes not just colors, but also layout structure, 
          component positioning, spacing, and animations to provide a completely different experience.
        </p>
      </div>
    </Card>
  );
}