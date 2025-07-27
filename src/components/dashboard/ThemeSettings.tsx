import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeSelector } from '@/components/ThemeSelector';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Palette, 
  Layout, 
  Sparkles,
  Monitor,
  Moon,
  Briefcase
} from 'lucide-react';

interface ThemeSettingsProps {
  onSectionChange?: (section: string) => void;
}

export function ThemeSettings({ onSectionChange }: ThemeSettingsProps) {
  const { theme, themeConfig, themeClasses } = useTheme();

  const themeFeatures = {
    default: [
      "Purple gradient accents",
      "Glass morphism effects", 
      "Smooth animations",
      "Dark background"
    ],
    professional: [
      "Clean, minimal interface",
      "Compact layouts",
      "Dense information display",
      "Business-focused design"
    ],
    dark: [
      "Dark color scheme",
      "Reduced eye strain",
      "Modern aesthetics",
      "Same layout as default"
    ],
    creative: [
      "Playful animations",
      "Floating card layouts",
      "Colorful gradients",
      "Large, friendly typography"
    ]
  };

  const themeIcons = {
    default: Monitor,
    professional: Briefcase,
    dark: Moon,
    creative: Sparkles,
  };

  const ThemeIcon = themeIcons[theme];

  return (
    <div className="space-y-8">
      {/* Current Theme Status */}
      <Card className={`${themeClasses.card} ${themeClasses.cardPadding}`}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <ThemeIcon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className={themeClasses.subheading}>Current Theme</h3>
              <Badge variant="secondary">{themeConfig.name}</Badge>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              {themeConfig.description}
            </p>
            
            {/* Theme Features */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Active Features:</h4>
              <div className="flex flex-wrap gap-2">
                {themeFeatures[theme].map((feature, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Theme Configuration */}
      <Card className={`${themeClasses.card} ${themeClasses.cardPadding}`}>
        <div className="space-y-4">
          <h3 className={themeClasses.subheading}>Layout Configuration</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <div className="font-medium text-foreground">Sidebar</div>
              <div className="text-muted-foreground capitalize">
                {themeConfig.layout.sidebarPosition}
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-foreground">Navigation</div>
              <div className="text-muted-foreground capitalize">
                {themeConfig.layout.navStyle}
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-foreground">Card Style</div>
              <div className="text-muted-foreground capitalize">
                {themeConfig.layout.cardStyle}
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-foreground">Animations</div>
              <div className="text-muted-foreground capitalize">
                {themeConfig.layout.animations}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Theme Selector */}
      <ThemeSelector />

      {/* Theme Preview Actions */}
      <Card className={`${themeClasses.card} ${themeClasses.cardPadding}`}>
        <div className="space-y-4">
          <h3 className={themeClasses.subheading}>Preview Themes</h3>
          <p className="text-sm text-muted-foreground">
            Test how different themes look with your actual data by visiting different sections.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onSectionChange?.('dashboard')}
            >
              <Layout className="w-4 h-4 mr-2" />
              View Dashboard
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onSectionChange?.('idea-generator')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Test Idea Generator
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onSectionChange?.('your-project')}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Check Projects
            </Button>
          </div>
        </div>
      </Card>

      {/* Important Note */}
      <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
        <div className="flex items-start gap-3">
          <Palette className="w-5 h-5 text-primary mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Theme System Features</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Layout Changes:</strong> Different themes rearrange components, not just colors</li>
              <li>• <strong>Professional:</strong> Compact, business-focused layouts with dense information</li>
              <li>• <strong>Creative:</strong> Playful floating cards with large spacing and animations</li>
              <li>• <strong>Responsive:</strong> All themes work seamlessly across desktop and mobile</li>
              <li>• <strong>Persistent:</strong> Your theme choice is saved across sessions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}