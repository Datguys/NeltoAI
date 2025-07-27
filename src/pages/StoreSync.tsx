import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Store, 
  RefreshCw, 
  Trash2, 
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Package,
  BarChart3,
  Sparkles,
  Lock,
  Crown,
  Settings,
  Eye,
  Brain,
  ShoppingCart,
  AlertCircle
} from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { canAccessFeature } from '@/lib/tiers';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import ShopifyConnect from '@/components/ShopifyConnect';
import { 
  getShopifyConnection, 
  removeShopifyConnection,
  saveShopifyConnection,
  generateShopifyOAuthUrl,
  fetchProducts,
  fetchOrders,
  calculateRevenueData,
  calculateTopProducts,
  generateAIInsights,
  ShopifyStore as ShopifyStoreType
} from '@/lib/shopifyIntegration';

// Use the interface from shopifyIntegration.ts

interface RevenueData {
  last7Days: number;
  last30Days: number;
  allTime: number;
  orders7Days: number;
  orders30Days: number;
  avgOrderValue: number;
}

interface TopProduct {
  id: string;
  title: string;
  image?: string;
  unitsSold: number;
  revenue: number;
}

interface AIInsight {
  id: string;
  message: string;
  suggestions: Array<{
    label: string;
    action: string;
  }>;
}

// Mock data for demo purposes
const MOCK_STORE_DATA = {
  store: {
    id: 'store_1234567890',
    domain: 'boutique-essentials.myshopify.com',
    name: 'Boutique Essentials',
    email: 'hello@boutiqueessentials.com',
    connected: true,
    lastSync: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    accessToken: 'mock_token'
  } as ShopifyStoreType,
  revenueData: {
    last7Days: 3247.82,
    last30Days: 12891.45,
    allTime: 89234.67,
    orders7Days: 28,
    orders30Days: 134,
    avgOrderValue: 96.34
  },
  topProducts: [
    {
      id: '1',
      title: 'Silk Hair Scrunchies (Set of 3)',
      image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=100&h=100&fit=crop',
      unitsSold: 89,
      revenue: 1247.65
    },
    {
      id: '2', 
      title: 'Organic Cotton Tote Bag',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop',
      unitsSold: 67,
      revenue: 892.30
    },
    {
      id: '3',
      title: 'Minimalist Gold Earrings',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=100&h=100&fit=crop',
      unitsSold: 45,
      revenue: 675.00
    },
    {
      id: '4',
      title: 'Bamboo Phone Case',
      image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=100&h=100&fit=crop',
      unitsSold: 34,
      revenue: 578.90
    },
    {
      id: '5',
      title: 'Wellness Tea Blend',
      image: 'https://images.unsplash.com/photo-1594736797933-d0408ba2ba2b?w=100&h=100&fit=crop',
      unitsSold: 28,
      revenue: 420.00
    }
  ],
  aiInsight: {
    id: '1',
    message: "Your store is performing exceptionally well! The Silk Hair Scrunchies are your top performer with 89 units sold. Consider creating bundle deals with your organic cotton products to increase average order value. Your 30-day revenue growth of 15% suggests strong brand momentum.",
    suggestions: [
      { label: "Create Bundle Deals", action: "bundles" },
      { label: "Expand Silk Collection", action: "expand_silk" },
      { label: "Email Previous Customers", action: "email_campaign" },
      { label: "Optimize Product Images", action: "optimize_images" }
    ]
  },
  customerData: {
    totalCustomers: 342,
    returningCustomers: 89,
    newCustomers30Days: 67,
    avgLifetimeValue: 156.78,
    topLocations: [
      { city: "Los Angeles, CA", orders: 23, revenue: 1890.45 },
      { city: "New York, NY", orders: 19, revenue: 1654.32 },
      { city: "Austin, TX", orders: 15, revenue: 1234.56 },
      { city: "Seattle, WA", orders: 12, revenue: 1098.76 },
      { city: "Miami, FL", orders: 11, revenue: 987.65 }
    ]
  },
  inventoryAlerts: [
    { product: "Silk Hair Scrunchies", stock: 8, status: "low" },
    { product: "Gold Earrings", stock: 3, status: "critical" },
    { product: "Bamboo Phone Case", stock: 15, status: "medium" }
  ],
  recentOrders: [
    {
      id: "#1001",
      customer: "Sarah M.",
      items: 2,
      total: 45.99,
      date: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
      status: "fulfilled"
    },
    {
      id: "#1000",
      customer: "Alex K.",
      items: 1,
      total: 24.99,
      date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      status: "processing"
    },
    {
      id: "#999",
      customer: "Emma L.",
      items: 4,
      total: 89.96,
      date: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      status: "fulfilled"
    }
  ]
};

export default function StoreSync() {
  const [activeSection, setActiveSection] = useState('store-sync');
  const { tier } = useCredits();
  const [store, setStore] = useState<ShopifyStoreType | null>(null);
  const [loading, setLoading] = useState(false);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [aiInsight, setAIInsight] = useState<AIInsight | null>(null);
  const [error, setError] = useState<string>('');
  const [showMockData, setShowMockData] = useState(false);

  const hasAccess = canAccessFeature(tier, 'storeSync');

  // Load existing connection on mount
  useEffect(() => {
    const existingConnection = getShopifyConnection();
    if (existingConnection && existingConnection.connected) {
      setStore(existingConnection);
      loadStoreData(existingConnection);
    }
  }, []);

  // Toggle mock data for demo
  const handleShowDemo = () => {
    setShowMockData(true);
    setStore(MOCK_STORE_DATA.store);
    setRevenueData(MOCK_STORE_DATA.revenueData);
    setTopProducts(MOCK_STORE_DATA.topProducts);
    setAIInsight(MOCK_STORE_DATA.aiInsight);
    setError('');
  };

  const handleHideDemo = () => {
    setShowMockData(false);
    const existingConnection = getShopifyConnection();
    if (existingConnection && existingConnection.connected) {
      setStore(existingConnection);
      loadStoreData(existingConnection);
    } else {
      setStore(null);
      setRevenueData(null);
      setTopProducts([]);
      setAIInsight(null);
    }
  };

  const loadStoreData = async (storeConnection: ShopifyStoreType) => {
    if (!storeConnection.accessToken) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Fetch products and orders
      const [products, orders] = await Promise.all([
        fetchProducts(storeConnection.domain, storeConnection.accessToken, 50),
        fetchOrders(storeConnection.domain, storeConnection.accessToken, 250, 'any')
      ]);

      // Calculate revenue data
      const revenue = calculateRevenueData(orders);
      setRevenueData(revenue);

      // Calculate top products
      const topProductsData = calculateTopProducts(orders, products);
      setTopProducts(topProductsData);

      // Generate AI insights
      const insights = generateAIInsights(revenue, topProductsData, orders);
      setAIInsight({
        id: '1',
        message: insights.message,
        suggestions: insights.suggestions
      });

    } catch (err: any) {
      console.error('Error loading store data:', err);
      setError(err.message || 'Failed to load store data');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    // Prompt for shop domain
    const shopDomain = prompt('Enter your Shopify store domain (e.g., mystore.myshopify.com):');
    if (!shopDomain) return;
    
    // Clean domain input
    const cleanDomain = shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    // Generate OAuth URL and redirect
    const oauthUrl = generateShopifyOAuthUrl(cleanDomain, 'store-sync');
    window.location.href = oauthUrl;
  };

  const handleDisconnect = () => {
    removeShopifyConnection();
    setStore(null);
    setRevenueData(null);
    setTopProducts([]);
    setAIInsight(null);
    setError('');
  };

  const handleRefresh = async () => {
    if (!store) return;
    
    await loadStoreData(store);
    
    // Update last sync time
    const updatedStore = { ...store, lastSync: new Date() };
    setStore(updatedStore);
    saveShopifyConnection(updatedStore);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Access denied screen for non-Ultra users
  if (!hasAccess) {
    return (
      <div className="min-h-screen h-screen w-full flex bg-background">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
        />
        <div className="flex-1 flex flex-col">
          <Header onSectionChange={setActiveSection} />
          <div className="flex-1 flex items-center justify-center p-8">
            <Card className="p-8 max-w-lg text-center bg-gradient-card glow-card">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Lock className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">🔒 Unlock Shopify Sync with Ultra</h2>
              <p className="text-muted-foreground mb-6">
                This powerful feature connects your store to our AI, giving you actionable insights on products, sales, and strategy.
              </p>
              
              {/* Blurred preview */}
              <div className="relative mb-6 blur-sm pointer-events-none">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Revenue Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Last 7 days:</span>
                        <span className="font-bold">$1,247.82</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Orders:</span>
                        <span>28</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Top Product</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-pink-200 rounded"></div>
                      <div>
                        <p className="font-medium">Silk Scrunchies</p>
                        <p className="text-sm text-muted-foreground">45 sold</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <Button 
                onClick={() => window.location.href = '/upgrade'} 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                size="lg"
              >
                <Crown className="w-5 h-5 mr-2" />
                Upgrade to Ultra for $39.99/month
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen w-full flex bg-background">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
      />
      <div className="flex-1 flex flex-col">
        <Header onSectionChange={setActiveSection} />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  <Store className="w-8 h-8 text-primary" />
                  Store Sync
                </h1>
                <p className="text-muted-foreground">Connect your Shopify store for AI-powered insights</p>
              </div>
              {store && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Data
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleDisconnect}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <Card className="p-4 border-red-500/30 bg-red-500/10">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold">Error</span>
                </div>
                <p className="text-red-300 mt-1">{error}</p>
              </Card>
            )}

            {/* Connection State */}
            {!store ? (
              <Card className="p-8 text-center bg-gradient-card glow-card">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Store className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Connect Your Shopify Store</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Get AI-powered insights on your products, sales performance, and growth opportunities.
                </p>
                <div className="flex gap-3 justify-center">
                  <ShopifyConnect 
                    buttonText="Connect Shopify Store"
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    onConnectionStart={() => console.log('Shopify connection initiated')}
                  />
                  <Button 
                    variant="outline"
                    size="lg"
                    onClick={handleShowDemo}
                    className="border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    View Demo
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                {/* Connected Status */}
                <Card className="p-4 bg-gradient-card glow-card border-green-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <Store className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-500/20 text-green-400">
                            {showMockData ? 'Demo Mode' : 'Connected'}
                          </Badge>
                          <span className="font-semibold text-foreground">{store.domain}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Last synced: {store.lastSync.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {showMockData && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={handleHideDemo}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Exit Demo
                        </Button>
                      )}
                      <Settings className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </Card>

                {/* Dashboard Content */}
                <div className="grid gap-6">
                  {/* Top Row - Revenue & Top Products */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Revenue Summary Card */}
                    <Card className="bg-gradient-card glow-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-green-500" />
                          Revenue Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {revenueData && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center p-3 bg-card/50 rounded-lg">
                                <div className="text-2xl font-bold text-green-400">
                                  {formatCurrency(revenueData.last7Days)}
                                </div>
                                <div className="text-xs text-muted-foreground">Last 7 days</div>
                              </div>
                              <div className="text-center p-3 bg-card/50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-400">
                                  {formatCurrency(revenueData.last30Days)}
                                </div>
                                <div className="text-xs text-muted-foreground">Last 30 days</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div className="text-center">
                                <div className="font-bold text-foreground">{revenueData.orders7Days}</div>
                                <div className="text-xs text-muted-foreground">Orders (7d)</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-foreground">{formatCurrency(revenueData.avgOrderValue)}</div>
                                <div className="text-xs text-muted-foreground">Avg Order</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-foreground">{formatCurrency(revenueData.allTime)}</div>
                                <div className="text-xs text-muted-foreground">All Time</div>
                              </div>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>

                    {/* Top Products Card */}
                    <Card className="bg-gradient-card glow-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-blue-500" />
                          Top Products
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {topProducts.slice(0, 3).map((product, index) => (
                            <div key={product.id} className="flex items-center justify-between p-2 bg-card/30 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded flex items-center justify-center text-white font-bold text-xs">
                                  #{index + 1}
                                </div>
                                <div>
                                  <div className="font-medium text-foreground text-sm">{product.title}</div>
                                  <div className="text-xs text-muted-foreground">{product.unitsSold} units sold</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-green-400 text-sm">{formatCurrency(product.revenue)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* AI Insights Card */}
                  {aiInsight && (
                    <Card className="bg-gradient-card glow-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-purple-500" />
                          AI Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                            <p className="text-foreground leading-relaxed">{aiInsight.message}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {aiInsight.suggestions.map((suggestion, index) => (
                              <Button 
                                key={index}
                                variant="outline" 
                                size="sm"
                                className="bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30"
                              >
                                {suggestion.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Additional Analytics - Only show in demo mode */}
                  {showMockData && (
                    <>
                      {/* Customer Analytics & Inventory Row */}
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Customer Analytics */}
                        <Card className="bg-gradient-card glow-card">
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                              <Brain className="w-5 h-5 text-orange-500" />
                              Customer Analytics
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center p-3 bg-card/50 rounded-lg">
                                <div className="text-2xl font-bold text-orange-400">
                                  {MOCK_STORE_DATA.customerData.totalCustomers}
                                </div>
                                <div className="text-xs text-muted-foreground">Total Customers</div>
                              </div>
                              <div className="text-center p-3 bg-card/50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-400">
                                  {formatCurrency(MOCK_STORE_DATA.customerData.avgLifetimeValue)}
                                </div>
                                <div className="text-xs text-muted-foreground">Avg Lifetime Value</div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-foreground">Top Locations</h4>
                              {MOCK_STORE_DATA.customerData.topLocations.slice(0, 3).map((location, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">{location.city}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-foreground">{location.orders} orders</span>
                                    <span className="text-green-400 font-medium">{formatCurrency(location.revenue)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Inventory Alerts */}
                        <Card className="bg-gradient-card glow-card">
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                              <Package className="w-5 h-5 text-red-500" />
                              Inventory Alerts
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {MOCK_STORE_DATA.inventoryAlerts.map((alert, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-card/30 rounded-lg">
                                  <div>
                                    <div className="font-medium text-foreground text-sm">{alert.product}</div>
                                    <div className="text-xs text-muted-foreground">{alert.stock} units remaining</div>
                                  </div>
                                  <Badge 
                                    variant={alert.status === 'critical' ? 'destructive' : alert.status === 'low' ? 'destructive' : 'secondary'}
                                    className={
                                      alert.status === 'critical' ? 'bg-red-500/20 text-red-400' :
                                      alert.status === 'low' ? 'bg-orange-500/20 text-orange-400' :
                                      'bg-yellow-500/20 text-yellow-400'
                                    }
                                  >
                                    {alert.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Recent Orders */}
                      <Card className="bg-gradient-card glow-card">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-cyan-500" />
                            Recent Orders
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {MOCK_STORE_DATA.recentOrders.map((order, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-card/30 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                                    <ShoppingCart className="w-4 h-4 text-cyan-400" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-foreground text-sm">{order.id}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {order.customer} • {order.items} item{order.items !== 1 ? 's' : ''}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-green-400 text-sm">{formatCurrency(order.total)}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {order.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}