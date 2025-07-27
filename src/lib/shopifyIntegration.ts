// Shopify Store Sync Integration
export interface ShopifyStore {
  id: string;
  name: string;
  domain: string;
  accessToken?: string;
  connected: boolean;
  lastSync: Date;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  vendor: string;
  product_type: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  template_suffix: string | null;
  status: string;
  published_scope: string;
  tags: string;
  admin_graphql_api_id: string;
  variants: ShopifyVariant[];
  images: ShopifyImage[];
}

export interface ShopifyVariant {
  id: string;
  product_id: string;
  title: string;
  price: string;
  sku: string;
  inventory_quantity: number;
  inventory_management: string;
  fulfillment_service: string;
  created_at: string;
  updated_at: string;
}

export interface ShopifyImage {
  id: string;
  product_id: string;
  position: number;
  created_at: string;
  updated_at: string;
  alt: string | null;
  width: number;
  height: number;
  src: string;
}

export interface ShopifyOrder {
  id: string;
  order_number: number;
  created_at: string;
  updated_at: string;
  financial_status: string;
  fulfillment_status: string | null;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  customer: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  line_items: Array<{
    id: string;
    product_id: string;
    variant_id: string;
    title: string;
    quantity: number;
    price: string;
    total_discount: string;
  }>;
}

// Environment variables for Shopify App
const SHOPIFY_CLIENT_ID = import.meta.env.VITE_SHOPIFY_CLIENT_ID;
const SHOPIFY_CLIENT_SECRET = import.meta.env.VITE_SHOPIFY_CLIENT_SECRET;
const SHOPIFY_SCOPES = 'read_products,read_orders,read_analytics,read_customers';
const REDIRECT_URI = `${window.location.origin}/dashboard/shopify/callback`;

/**
 * Generate Shopify OAuth URL
 */
export function generateShopifyOAuthUrl(shopDomain: string, state?: string): string {
  const params = new URLSearchParams({
    client_id: SHOPIFY_CLIENT_ID || '',
    scope: SHOPIFY_SCOPES,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    ...(state && { state })
  });

  return `https://${shopDomain}/admin/oauth/authorize?${params.toString()}`;
}

/**
 * Exchange code for access token
 */
export async function exchangeCodeForToken(shopDomain: string, code: string): Promise<string> {
  const response = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: SHOPIFY_CLIENT_ID,
      client_secret: SHOPIFY_CLIENT_SECRET,
      code
    })
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for access token');
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Fetch store information
 */
export async function fetchShopInfo(shopDomain: string, accessToken: string): Promise<any> {
  const response = await fetch(`https://${shopDomain}/admin/api/2024-01/shop.json`, {
    headers: {
      'X-Shopify-Access-Token': accessToken
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch shop info');
  }

  const data = await response.json();
  return data.shop;
}

/**
 * Fetch products from Shopify
 */
export async function fetchProducts(shopDomain: string, accessToken: string, limit = 50): Promise<ShopifyProduct[]> {
  const response = await fetch(`https://${shopDomain}/admin/api/2024-01/products.json?limit=${limit}`, {
    headers: {
      'X-Shopify-Access-Token': accessToken
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  const data = await response.json();
  return data.products;
}

/**
 * Fetch orders from Shopify
 */
export async function fetchOrders(
  shopDomain: string, 
  accessToken: string, 
  limit = 50,
  status = 'any',
  createdAtMin?: string
): Promise<ShopifyOrder[]> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    status,
    ...(createdAtMin && { created_at_min: createdAtMin })
  });

  const response = await fetch(
    `https://${shopDomain}/admin/api/2024-01/orders.json?${params.toString()}`,
    {
      headers: {
        'X-Shopify-Access-Token': accessToken
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }

  const data = await response.json();
  return data.orders;
}

/**
 * Calculate revenue data from orders
 */
export function calculateRevenueData(orders: ShopifyOrder[]) {
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const orders7Days = orders.filter(order => new Date(order.created_at) >= last7Days);
  const orders30Days = orders.filter(order => new Date(order.created_at) >= last30Days);

  const revenue7Days = orders7Days.reduce((sum, order) => sum + parseFloat(order.total_price), 0);
  const revenue30Days = orders30Days.reduce((sum, order) => sum + parseFloat(order.total_price), 0);
  const revenueAllTime = orders.reduce((sum, order) => sum + parseFloat(order.total_price), 0);

  const avgOrderValue = orders.length > 0 
    ? revenueAllTime / orders.length 
    : 0;

  return {
    last7Days: revenue7Days,
    last30Days: revenue30Days,
    allTime: revenueAllTime,
    orders7Days: orders7Days.length,
    orders30Days: orders30Days.length,
    avgOrderValue
  };
}

/**
 * Calculate top products from orders
 */
export function calculateTopProducts(orders: ShopifyOrder[], products: ShopifyProduct[]) {
  const productStats = new Map<string, { unitsSold: number; revenue: number; title: string }>();

  orders.forEach(order => {
    order.line_items.forEach(item => {
      const existing = productStats.get(item.product_id) || { 
        unitsSold: 0, 
        revenue: 0, 
        title: item.title 
      };
      
      existing.unitsSold += item.quantity;
      existing.revenue += parseFloat(item.price) * item.quantity;
      
      productStats.set(item.product_id, existing);
    });
  });

  return Array.from(productStats.entries())
    .map(([id, stats]) => ({
      id,
      title: stats.title,
      unitsSold: stats.unitsSold,
      revenue: stats.revenue,
      image: products.find(p => p.id === id)?.images[0]?.src
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

/**
 * Generate AI insights based on store data
 */
export function generateAIInsights(
  revenueData: any,
  topProducts: any[],
  orders: ShopifyOrder[]
): { message: string; suggestions: Array<{ label: string; action: string }> } {
  const insights = [];
  const suggestions = [];

  // Best selling product insight
  if (topProducts.length > 0) {
    const topProduct = topProducts[0];
    insights.push(`Your best-selling product this week is '${topProduct.title}'.`);
    suggestions.push({ label: '🧠 Generate Bundle Offer', action: 'create-bundle' });
  }

  // Revenue trend analysis
  const revenueRatio = revenueData.last7Days / (revenueData.last30Days / 4.3); // Compare to weekly average
  if (revenueRatio < 0.8) {
    insights.push("Your store's revenue dropped slightly this week. Need help with marketing strategies?");
    suggestions.push({ label: '📈 Marketing Ideas', action: 'marketing-ideas' });
  } else if (revenueRatio > 1.2) {
    insights.push("Great news! Your revenue is up this week. Want to capitalize on this momentum?");
    suggestions.push({ label: '🚀 Scale Strategy', action: 'scale-strategy' });
  }

  // Product description improvement
  if (Math.random() > 0.5) { // Randomly suggest this
    insights.push("Want to create better product descriptions to boost conversion rates?");
    suggestions.push({ label: '🛍 Write Better Descriptions', action: 'improve-descriptions' });
  }

  // Always add forecasting
  suggestions.push({ label: '📈 Forecast Next 7 Days', action: 'forecast' });

  return {
    message: insights.join(' '),
    suggestions
  };
}

/**
 * Store connection data in localStorage
 */
export function saveShopifyConnection(store: ShopifyStore) {
  localStorage.setItem('shopify_store', JSON.stringify(store));
}

/**
 * Get stored connection from localStorage
 */
export function getShopifyConnection(): ShopifyStore | null {
  const stored = localStorage.getItem('shopify_store');
  if (!stored) return null;
  
  try {
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      lastSync: new Date(parsed.lastSync)
    };
  } catch {
    return null;
  }
}

/**
 * Remove stored connection
 */
export function removeShopifyConnection() {
  localStorage.removeItem('shopify_store');
}