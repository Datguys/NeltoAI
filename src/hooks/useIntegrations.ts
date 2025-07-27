import { useState, useEffect } from 'react';
import { useFirebaseUser } from './useFirebaseUser';

export interface Integration {
  id: string;
  name: string;
  platform: 'shopify' | 'etsy' | 'amazon' | 'ebay' | 'custom';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  apiKey?: string;
  shopUrl?: string;
  sellerId?: string;
  connectedAt?: Date;
  lastSync?: Date;
  syncEnabled: boolean;
  settings: {
    autoSync: boolean;
    syncInterval: number; // in minutes
    syncProducts: boolean;
    syncOrders: boolean;
    syncInventory: boolean;
  };
  stats?: {
    products: number;
    orders: number;
    revenue: number;
    lastOrderDate?: Date;
  };
  features: string[];
}

export interface IntegrationConfig {
  name: string;
  icon: any;
  color: string;
  description: string;
  features: string[];
  requiredFields: string[];
  tierRequired?: 'pro' | 'ultra';
  apiDocs?: string;
  setupInstructions?: string[];
}

// Shopify API functions
export const shopifyAPI = {
  async connect(shopUrl: string, apiKey: string) {
    // Mock connection - replace with actual Shopify Admin API calls
    const response = await fetch(`https://${shopUrl}/admin/api/2023-10/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to connect to Shopify store');
    }
    
    const data = await response.json();
    return data.shop;
  },

  async getProducts(shopUrl: string, apiKey: string) {
    // Mock products - replace with actual API call
    return {
      products: [],
      total: 0
    };
  },

  async getOrders(shopUrl: string, apiKey: string) {
    // Mock orders - replace with actual API call
    return {
      orders: [],
      total: 0
    };
  }
};

// Etsy API functions
export const etsyAPI = {
  async connect(apiKey: string) {
    // Mock connection - replace with actual Etsy API calls
    try {
      // Etsy OAuth flow would go here
      return { success: true, shopId: 'mock-shop-id' };
    } catch (error) {
      throw new Error('Failed to connect to Etsy');
    }
  },

  async getListings(apiKey: string, shopId: string) {
    // Mock listings - replace with actual API call
    return {
      listings: [],
      total: 0
    };
  }
};

export function useIntegrations() {
  const { user } = useFirebaseUser();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadIntegrations();
    }
  }, [user]);

  const loadIntegrations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would fetch from Firestore or your backend
      // For now, we'll use localStorage for demo purposes
      const userKey = user?.uid || user?.email || 'anonymous';
      const stored = localStorage.getItem(`integrations_${userKey}`);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const integrations = parsed.map((integration: any) => ({
          ...integration,
          connectedAt: integration.connectedAt ? new Date(integration.connectedAt) : undefined,
          lastSync: integration.lastSync ? new Date(integration.lastSync) : undefined,
          stats: integration.stats ? {
            ...integration.stats,
            lastOrderDate: integration.stats.lastOrderDate ? new Date(integration.stats.lastOrderDate) : undefined
          } : undefined
        }));
        setIntegrations(integrations);
      }
    } catch (err) {
      console.error('Failed to load integrations:', err);
      setError('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const saveIntegrations = (newIntegrations: Integration[]) => {
    if (!user) return;
    const userKey = user.uid || user.email || 'anonymous';
    localStorage.setItem(`integrations_${userKey}`, JSON.stringify(newIntegrations));
  };

  const connectIntegration = async (config: {
    platform: Integration['platform'];
    name: string;
    apiKey: string;
    shopUrl?: string;
    sellerId?: string;
  }) => {
    try {
      let connectionData;
      
      // Test connection based on platform
      switch (config.platform) {
        case 'shopify':
          if (!config.shopUrl) throw new Error('Shop URL is required for Shopify');
          connectionData = await shopifyAPI.connect(config.shopUrl, config.apiKey);
          break;
        case 'etsy':
          connectionData = await etsyAPI.connect(config.apiKey);
          break;
        default:
          // For other platforms, we'll just mock the connection
          connectionData = { success: true };
      }

      const newIntegration: Integration = {
        id: Date.now().toString(),
        name: config.name,
        platform: config.platform,
        status: 'connected',
        apiKey: config.apiKey,
        shopUrl: config.shopUrl,
        sellerId: config.sellerId,
        connectedAt: new Date(),
        lastSync: new Date(),
        syncEnabled: true,
        settings: {
          autoSync: true,
          syncInterval: 60, // 1 hour
          syncProducts: true,
          syncOrders: true,
          syncInventory: true
        },
        features: [], // Will be set based on platform
        stats: {
          products: 0,
          orders: 0,
          revenue: 0
        }
      };

      const updatedIntegrations = [...integrations, newIntegration];
      setIntegrations(updatedIntegrations);
      saveIntegrations(updatedIntegrations);
      
      return newIntegration;
    } catch (err) {
      console.error('Failed to connect integration:', err);
      throw err;
    }
  };

  const disconnectIntegration = async (integrationId: string) => {
    try {
      const updatedIntegrations = integrations.filter(i => i.id !== integrationId);
      setIntegrations(updatedIntegrations);
      saveIntegrations(updatedIntegrations);
    } catch (err) {
      console.error('Failed to disconnect integration:', err);
      throw err;
    }
  };

  const syncIntegration = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) throw new Error('Integration not found');

    try {
      // Update status to pending
      const updatedIntegrations = integrations.map(i => 
        i.id === integrationId ? { ...i, status: 'pending' as const } : i
      );
      setIntegrations(updatedIntegrations);

      // Perform sync based on platform
      let stats;
      switch (integration.platform) {
        case 'shopify':
          if (integration.shopUrl && integration.apiKey) {
            const products = await shopifyAPI.getProducts(integration.shopUrl, integration.apiKey);
            const orders = await shopifyAPI.getOrders(integration.shopUrl, integration.apiKey);
            stats = {
              products: products.total,
              orders: orders.total,
              revenue: orders.orders?.reduce((sum: number, order: any) => sum + parseFloat(order.total_price || '0'), 0) || 0
            };
          }
          break;
        case 'etsy':
          // Etsy sync logic
          stats = { products: 0, orders: 0, revenue: 0 };
          break;
        default:
          // Mock stats for other platforms
          stats = {
            products: Math.floor(Math.random() * 100),
            orders: Math.floor(Math.random() * 50),
            revenue: Math.floor(Math.random() * 10000)
          };
      }

      // Update integration with new stats and status
      const finalIntegrations = integrations.map(i => 
        i.id === integrationId ? { 
          ...i, 
          status: 'connected' as const,
          lastSync: new Date(),
          stats: stats || i.stats
        } : i
      );
      
      setIntegrations(finalIntegrations);
      saveIntegrations(finalIntegrations);
      
    } catch (err) {
      // Update status to error
      const errorIntegrations = integrations.map(i => 
        i.id === integrationId ? { ...i, status: 'error' as const } : i
      );
      setIntegrations(errorIntegrations);
      saveIntegrations(errorIntegrations);
      throw err;
    }
  };

  const updateIntegrationSettings = async (integrationId: string, settings: Partial<Integration['settings']>) => {
    const updatedIntegrations = integrations.map(i => 
      i.id === integrationId ? { 
        ...i, 
        settings: { ...i.settings, ...settings }
      } : i
    );
    setIntegrations(updatedIntegrations);
    saveIntegrations(updatedIntegrations);
  };

  return {
    integrations,
    loading,
    error,
    connectIntegration,
    disconnectIntegration,
    syncIntegration,
    updateIntegrationSettings,
    refreshIntegrations: loadIntegrations
  };
}