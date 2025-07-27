import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, ExternalLink, ShoppingBag, Zap, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ShopifyConnectProps {
  /** Custom button text */
  buttonText?: string;
  /** Button variant */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Custom CSS classes */
  className?: string;
  /** Callback when connection is initiated */
  onConnectionStart?: () => void;
}

// Configuration - Uses environment variables
const SHOPIFY_CONFIG = {
  clientId: import.meta.env.VITE_SHOPIFY_CLIENT_ID || '',
  callbackUrl: 'https://founder-launch-mj58.vercel.app/dashboard/shopify/callback',
  scopes: [
    'read_orders',
    'read_products', 
    'read_customers',
    'read_inventory',
    'read_analytics',
    'read_reports'
  ],
  affiliateUrl: 'https://www.shopify.com/?ref=my-affiliate-id' // Replace with your real affiliate link
};

// Verify Client ID is loaded correctly
console.log('Shopify Client ID:', import.meta.env.VITE_SHOPIFY_CLIENT_ID);
console.log('SHOPIFY_CONFIG.clientId:', SHOPIFY_CONFIG.clientId);

/**
 * ShopifyConnect Component
 * 
 * Handles the user flow for connecting to Shopify:
 * 1. User clicks "Connect Shopify" button
 * 2. Modal opens with two options:
 *    - "I have a Shopify store" → Store URL input → OAuth flow
 *    - "I need a Shopify store" → Redirect to affiliate link
 * 3. Handles OAuth URL generation and redirects
 */
export function ShopifyConnect({
  buttonText = "Connect Shopify",
  variant = "default",
  size = "default",
  className = "",
  onConnectionStart
}: ShopifyConnectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'choice' | 'store-input'>('choice');
  const [storeUrl, setStoreUrl] = useState('');
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Generate random state for CSRF protection
  const generateState = (): string => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  // Validate and clean shop domain
  const validateShopDomain = (input: string): { isValid: boolean; cleanDomain: string; error?: string } => {
    let domain = input.trim().toLowerCase();
    
    // Remove protocol if present
    domain = domain.replace(/^https?:\/\//, '');
    
    // Remove trailing slash
    domain = domain.replace(/\/$/, '');
    
    // Extract shop name from various formats
    if (domain.includes('.myshopify.com')) {
      domain = domain.split('.myshopify.com')[0];
    } else if (domain.includes('/')) {
      const parts = domain.split('/');
      domain = parts[parts.length - 1];
    }
    
    // Validate shop name format
    const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-]{1,98}[a-zA-Z0-9]$/;
    
    if (!domain) {
      return { isValid: false, cleanDomain: '', error: 'Please enter a store URL' };
    }
    
    if (!shopRegex.test(domain)) {
      return { 
        isValid: false, 
        cleanDomain: '', 
        error: 'Invalid store name. Store names must be 3-100 characters with only letters, numbers, and hyphens.' 
      };
    }
    
    return { isValid: true, cleanDomain: domain };
  };

  // Generate Shopify OAuth URL
  const generateOAuthUrl = (shopDomain: string): string => {
    const state = generateState();
    
    // Store state for verification
    sessionStorage.setItem('shopify_oauth_state', state);
    sessionStorage.setItem('shopify_shop', shopDomain);
    
    const params = new URLSearchParams({
      client_id: SHOPIFY_CONFIG.clientId,
      scope: SHOPIFY_CONFIG.scopes.join(','),
      redirect_uri: SHOPIFY_CONFIG.callbackUrl,
      state: state,
      'grant_options[]': 'per-user' // Optional: for per-user tokens
    });

    return `https://${shopDomain}.myshopify.com/admin/oauth/authorize?${params.toString()}`;
  };

  // Handle existing store connection
  const handleExistingStore = () => {
    setStep('store-input');
    setError('');
  };

  // Handle new store signup (affiliate link)
  const handleNewStore = () => {
    console.log('Redirecting to Shopify affiliate link:', SHOPIFY_CONFIG.affiliateUrl);
    
    // Track the affiliate click if needed
    if (onConnectionStart) {
      onConnectionStart();
    }
    
    // Redirect to affiliate link
    window.open(SHOPIFY_CONFIG.affiliateUrl, '_blank');
    setIsOpen(false);
  };

  // Handle store connection submission
  const handleConnectStore = async () => {
    setError('');
    
    const validation = validateShopDomain(storeUrl);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid store URL');
      return;
    }

    setIsConnecting(true);
    
    try {
      console.log('Initiating OAuth for store:', validation.cleanDomain);
      
      if (onConnectionStart) {
        onConnectionStart();
      }
      
      // Generate OAuth URL and redirect
      const oauthUrl = generateOAuthUrl(validation.cleanDomain);
      console.log('OAuth URL:', oauthUrl);
      
      // Redirect to Shopify OAuth
      window.location.href = oauthUrl;
      
    } catch (err) {
      console.error('OAuth initiation error:', err);
      setError('Failed to initiate connection. Please try again.');
      setIsConnecting(false);
    }
  };

  // Reset modal state when closed
  const handleClose = () => {
    setIsOpen(false);
    setStep('choice');
    setStoreUrl('');
    setError('');
    setIsConnecting(false);
  };

  return (
    <>
      {/* Connect Button */}
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsOpen(true)}
      >
        <Store className="w-4 h-4 mr-2" />
        {buttonText}
      </Button>

      {/* Connection Modal */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="w-5 h-5 text-green-600" />
              Connect to Shopify
            </DialogTitle>
            <DialogDescription>
              {step === 'choice' 
                ? "Do you already have a Shopify store, or do you need to create one?"
                : "Enter your Shopify store URL to connect your store"
              }
            </DialogDescription>
          </DialogHeader>

          {step === 'choice' && (
            <div className="grid gap-4 py-4">
              {/* Existing Store Option */}
              <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={handleExistingStore}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    I have a Shopify store
                  </CardTitle>
                  <CardDescription>
                    Connect your existing store to sync data and analytics
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* New Store Option */}
              <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={handleNewStore}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-green-600" />
                    I need a Shopify store
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    Create a new store and get started with Shopify
                    <ExternalLink className="w-3 h-3" />
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          )}

          {step === 'store-input' && (
            <div className="grid gap-4 py-4">
              {/* Store URL Input */}
              <div className="space-y-2">
                <Label htmlFor="store-url">Store URL</Label>
                <Input
                  id="store-url"
                  placeholder="mystore.myshopify.com or just mystore"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleConnectStore()}
                  disabled={isConnecting}
                />
                <p className="text-xs text-muted-foreground">
                  Enter your store domain (e.g., "mystore" or "mystore.myshopify.com")
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('choice')}
                  disabled={isConnecting}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleConnectStore}
                  disabled={isConnecting || !storeUrl.trim()}
                  className="flex-1"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Store className="w-4 h-4 mr-2" />
                      Connect Store
                    </>
                  )}
                </Button>
              </div>

              {/* Info Box */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  You'll be redirected to Shopify to authorize the connection. 
                  We only request read-only access to orders, products, and analytics.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ShopifyConnect;