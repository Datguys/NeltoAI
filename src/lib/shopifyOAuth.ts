// Shopify OAuth Flow Implementation

interface ShopifyOAuthConfig {
  clientId: string;
  // NOTE: clientSecret removed from frontend for security
  scopes: string[];
  redirectUri: string;
}

interface ShopifyTokenResponse {
  access_token: string;
  scope: string;
  expires_in?: number;
  associated_user_scope?: string;
  associated_user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    account_owner: boolean;
  };
}

export class ShopifyOAuthService {
  private config: ShopifyOAuthConfig;

  constructor() {
    this.config = {
      clientId: import.meta.env.VITE_SHOPIFY_CLIENT_ID || '',
      // Client secret is handled securely on the backend only
      scopes: [
        'read_orders',
        'read_products',
        'read_customers',
        'read_inventory',
        'read_analytics',
        'read_reports'
      ],
      // Fixed redirect URI to match actual route in AppDashboard.tsx
      redirectUri: `${window.location.origin}/dashboard/shopify/callback`
    };
  }

  /**
   * Generate the Shopify App Installation URL (for general app installation)
   * This creates a public app installation link that works across all stores
   * @param state - Optional state parameter for CSRF protection
   */
  getAppInstallationUrl(state?: string): string {
    // Generate state for CSRF protection if not provided
    const oauthState = state || this.generateState();
    
    // Store state in session storage for verification
    sessionStorage.setItem('shopify_oauth_state', oauthState);

    // For public app installation, we create a generic installation URL
    // Users can install this on any Shopify store
    const baseUrl = window.location.origin;
    const installUrl = `${baseUrl}/install-shopify-app`;
    
    // Store the OAuth parameters for when user provides their store domain
    sessionStorage.setItem('shopify_oauth_params', JSON.stringify({
      client_id: this.config.clientId,
      scope: this.config.scopes.join(','),
      redirect_uri: this.config.redirectUri,
      state: oauthState
    }));

    return installUrl;
  }

  /**
   * Generate store-specific OAuth URL (if you know the store domain)
   * @param shop - The shop domain (e.g., 'mystore' for mystore.myshopify.com)
   * @param state - Optional state parameter for CSRF protection
   */
  getStoreAuthorizationUrl(shop: string, state?: string): string {
    // Ensure shop domain is clean (remove .myshopify.com if present)
    const cleanShop = shop.replace('.myshopify.com', '');
    
    // Generate state for CSRF protection if not provided
    const oauthState = state || this.generateState();
    
    // Store state in session storage for verification
    sessionStorage.setItem('shopify_oauth_state', oauthState);
    sessionStorage.setItem('shopify_shop', cleanShop);

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      scope: this.config.scopes.join(','),
      redirect_uri: this.config.redirectUri,
      state: oauthState,
      'grant_options[]': 'per-user' // Optional: for per-user tokens
    });

    return `https://${cleanShop}.myshopify.com/admin/oauth/authorize?${params.toString()}`;
  }

  /**
   * Initiate OAuth flow by navigating to installation page
   * This provides a better user experience for store domain input
   */
  initiatePartnerOAuth(): void {
    // Instead of external redirect, navigate to our own installation page
    // This gives us more control over the user experience
    const baseUrl = window.location.origin;
    const installUrl = `${baseUrl}/dashboard/install-shopify`;
    console.log('Navigating to Shopify installation page:', installUrl);
    window.location.href = installUrl;
  }

  /**
   * Initiate the OAuth flow for a specific store
   * @param shop - The shop domain
   */
  initiateStoreOAuth(shop: string): void {
    const authUrl = this.getStoreAuthorizationUrl(shop);
    console.log('Redirecting to Shopify Store OAuth:', authUrl);
    window.location.href = authUrl;
  }

  /**
   * Validate shop domain format
   * @param shop - The shop domain to validate
   */
  validateShopDomain(shop: string): boolean {
    const cleanShop = shop.replace('.myshopify.com', '');
    // Shop names must be 3-100 characters, alphanumeric and hyphens only
    const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,98}[a-zA-Z0-9]$/;
    return shopRegex.test(cleanShop);
  }

  /**
   * Generate a random state string for CSRF protection
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Handle OAuth callback (frontend part only)
   * The actual token exchange MUST happen on the backend for security
   */
  handleOAuthCallback(code: string, shop: string, state: string): void {
    // Verify state to prevent CSRF attacks
    const storedState = sessionStorage.getItem('shopify_oauth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter - possible CSRF attack');
    }

    // Store the callback parameters temporarily for backend processing
    sessionStorage.setItem('shopify_oauth_callback', JSON.stringify({
      code,
      shop,
      state,
      timestamp: Date.now()
    }));

    // Clear state after verification
    sessionStorage.removeItem('shopify_oauth_state');

    // Navigate to a processing page that will handle the backend call
    window.location.href = '/dashboard/shopify/processing';
  }

  /**
   * Get shop information using access token
   * @param accessToken - The Shopify access token
   * @param shop - The shop domain
   */
  async getShopInfo(accessToken: string, shop: string) {
    const response = await fetch(`https://${shop}.myshopify.com/admin/api/2023-10/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch shop info: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Test API connection with basic shop data
   * @param accessToken - The Shopify access token
   * @param shop - The shop domain
   */
  async testConnection(accessToken: string, shop: string) {
    try {
      const shopInfo = await this.getShopInfo(accessToken, shop);
      return {
        success: true,
        shop: shopInfo.shop
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const shopifyOAuth = new ShopifyOAuthService();

// Helper function to parse Shopify shop domain from various formats
export function parseShopDomain(input: string): string {
  let shop = input.trim().toLowerCase();
  
  // Remove protocol if present
  shop = shop.replace(/^https?:\/\//, '');
  
  // Remove trailing slash
  shop = shop.replace(/\/$/, '');
  
  // Extract shop name from various formats:
  // mystore.myshopify.com -> mystore
  // mystore -> mystore
  // admin/stores/mystore -> mystore
  if (shop.includes('.myshopify.com')) {
    shop = shop.split('.myshopify.com')[0];
  } else if (shop.includes('/')) {
    const parts = shop.split('/');
    shop = parts[parts.length - 1];
  }
  
  return shop;
}