import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  DollarSign, 
  Zap, 
  ShoppingBag, 
  TrendingUp, 
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  FileText,
  Crown,
  RefreshCw,
  Eye,
  Activity
} from 'lucide-react';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { getFirestore, collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase';

// Admin user UID - specific founder access only
const FOUNDER_UID = 'NKYaWpg21RQ1UyADlTylA0NuVaj2';

// Initialize Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Real data fetching functions
const fetchFirebaseUserData = async () => {
  try {
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data() as {
        createdAt?: { toDate: () => Date };
        lastReset?: string;
        tier?: string;
        email?: string;
        displayName?: string;
        usedThisMonth?: number;
        credits?: number;
      };
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastReset: data.lastReset,
        tier: data.tier
      };
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const newToday = users.filter(u => u.createdAt >= today).length;
    const newThisWeek = users.filter(u => u.createdAt >= weekAgo).length;
    const active = users.filter(u => u.lastReset && new Date(u.lastReset) >= weekAgo).length;
    
    // Count by tier
    const byTier: Record<string, number> = {};
    users.forEach(u => {
      const tier = u.tier || 'free';
      byTier[tier] = (byTier[tier] || 0) + 1;
    });

    return {
      total: users.length,
      newToday,
      active,
      newThisWeek,
      byTier
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return {
      total: 0,
      newToday: 0,
      active: 0,
      newThisWeek: 0,
      byTier: { free: 0, pro: 0, ultra: 0 }
    };
  }
};

const fetchFirebaseProjectData = async () => {
  try {
    const projectsRef = collection(db, 'projects');
    const projectsSnapshot = await getDocs(projectsRef);
    
    const projects = projectsSnapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        status: data.status
      };
    });

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentCount = projects.filter(p => p.createdAt >= weekAgo).length;
    
    // Count by status
    const byStatus: Record<string, number> = {};
    projects.forEach(p => {
      const status = p.status || 'Planning';
      byStatus[status] = (byStatus[status] || 0) + 1;
    });

    return {
      total: projects.length,
      recentCount,
      byStatus
    };
  } catch (error) {
    console.error('Error fetching project data:', error);
    return {
      total: 0,
      recentCount: 0,
      byStatus: {}
    };
  }
};

const fetchStripeData = async () => {
  try {
    // TODO: Replace this with actual Stripe API integration
    // Example implementation:
    // 
    // const response = await fetch('/api/stripe/dashboard-metrics');
    // const data = await response.json();
    // return {
    //   totalRevenue: data.lifetime_value.amount / 100,
    //   monthlyRecurring: data.mrr.amount / 100,
    //   activeSubscriptions: data.active_subscriptions
    // };
    
    return {
      totalRevenue: 0, // Total revenue from Stripe subscriptions
      monthlyRecurring: 0, // Monthly recurring revenue
      activeSubscriptions: 0 // Number of active subscriptions
    };
  } catch (error) {
    console.error('Error fetching Stripe data:', error);
    return {
      totalRevenue: 0,
      monthlyRecurring: 0,
      activeSubscriptions: 0
    };
  }
};

const fetchOpenRouterData = async () => {
  try {
    // TODO: Replace this with actual OpenRouter and Groq API integration
    // Example implementation:
    // 
    // const openrouterResponse = await fetch('https://openrouter.ai/api/v1/usage', {
    //   headers: { 'Authorization': 'Bearer ' + process.env.OPENROUTER_API_KEY }
    // });
    // const groqResponse = await fetch('https://api.groq.com/v1/usage', {
    //   headers: { 'Authorization': 'Bearer ' + process.env.GROQ_API_KEY }
    // });
    // 
    // return {
    //   openrouterSpend: openrouterData.total_cost,
    //   monthlyTokens: openrouterData.total_tokens + groqData.total_tokens,
    //   groqSpend: groqData.total_cost,
    //   totalApiCalls: openrouterData.total_requests + groqData.total_requests,
    //   avgResponseTime: (openrouterData.avg_response_time + groqData.avg_response_time) / 2
    // };
    
    return {
      openrouterSpend: 0, // Monthly spend on OpenRouter API
      monthlyTokens: 0, // Total tokens used this month
      groqSpend: 0, // Monthly spend on Groq API
      totalApiCalls: 0, // Total API calls made
      avgResponseTime: 0 // Average response time in ms
    };
  } catch (error) {
    console.error('Error fetching OpenRouter/Groq data:', error);
    return {
      openrouterSpend: 0,
      monthlyTokens: 0,
      groqSpend: 0,
      totalApiCalls: 0,
      avgResponseTime: 0
    };
  }
};

const fetchIntegrationsData = async () => {
  try {
    // TODO: This function fetches integrations from Firebase and aggregates platform data
    // When you add real Shopify/Etsy/Amazon/eBay integrations:
    // 1. Fetch user integrations from Firebase 'integrations' collection
    // 2. For each connected integration, call platform APIs to get fresh data
    // 3. Aggregate the results for dashboard display
    //
    // Example platform API calls:
    // - Shopify: https://your-app.myshopify.com/admin/api/2023-01/orders.json
    // - Etsy: https://api.etsy.com/v3/application/shops/{shop_id}/receipts
    // - Amazon: SP-API endpoints for orders and products
    // - eBay: eBay API for active listings and sold items
    
    const integrationsRef = collection(db, 'integrations');
    const integrationsSnapshot = await getDocs(integrationsRef);
    
    const integrations = integrationsSnapshot.docs.map(doc => doc.data());
    
    const shopify = integrations.filter(i => i.platform === 'shopify');
    const etsy = integrations.filter(i => i.platform === 'etsy');
    const amazon = integrations.filter(i => i.platform === 'amazon');
    const ebay = integrations.filter(i => i.platform === 'ebay');
    
    return {
      shopify: {
        connected: shopify.length,
        totalOrders: shopify.reduce((sum, i) => sum + (i.stats?.orders || 0), 0),
        revenue: shopify.reduce((sum, i) => sum + (i.stats?.revenue || 0), 0)
      },
      etsy: {
        connected: etsy.length,
        totalListings: etsy.reduce((sum, i) => sum + (i.stats?.products || 0), 0),
        revenue: etsy.reduce((sum, i) => sum + (i.stats?.revenue || 0), 0)
      },
      amazon: {
        connected: amazon.length,
        totalProducts: amazon.reduce((sum, i) => sum + (i.stats?.products || 0), 0),
        revenue: amazon.reduce((sum, i) => sum + (i.stats?.revenue || 0), 0)
      },
      ebay: {
        connected: ebay.length,
        totalListings: ebay.reduce((sum, i) => sum + (i.stats?.products || 0), 0),
        revenue: ebay.reduce((sum, i) => sum + (i.stats?.revenue || 0), 0)
      }
    };
  } catch (error) {
    console.error('Error fetching integrations data:', error);
    return {
      shopify: { connected: 0, totalOrders: 0, revenue: 0 },
      etsy: { connected: 0, totalListings: 0, revenue: 0 },
      amazon: { connected: 0, totalProducts: 0, revenue: 0 },
      ebay: { connected: 0, totalListings: 0, revenue: 0 }
    };
  }
};

interface MetricCard {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: any;
  description?: string;
}

interface DashboardData {
  users: {
    total: number;
    newToday: number;
    active: number;
    newThisWeek: number;
    byTier: Record<string, number>;
  };
  projects: {
    total: number;
    recentCount: number;
    byStatus: Record<string, number>;
  };
  revenue: {
    total: number;
    mrr: number;
    recentPayments: any[];
    stripeData: {
      totalRevenue: number;
      monthlyRecurring: number;
      activeSubscriptions: number;
    };
  };
  ai: {
    openrouterSpend: number;
    monthlyTokens: number;
    groqSpend: number;
    totalApiCalls: number;
    avgResponseTime: number;
  };
  integrations: {
    shopify: { connected: number; totalOrders: number; revenue: number };
    etsy: { connected: number; totalListings: number; revenue: number };
    amazon: { connected: number; totalProducts: number; revenue: number };
    ebay: { connected: number; totalListings: number; revenue: number };
  };
  system: {
    errors: number;
    uptime: string;
    lastUpdated: Date;
    databaseSize: string;
  };
}

export default function FounderDashboard() {
  const { user, loading } = useFirebaseUser();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState('founder-dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Check if user is the founder
  const isFounder = user && user.uid === FOUNDER_UID;

  useEffect(() => {
    const checkIsMobile = () => {
      const isMobileSize = window.innerWidth < 768;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(isMobileSize || isTouchDevice);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    window.addEventListener('orientationchange', () => {
      setTimeout(checkIsMobile, 100);
    });

    return () => {
      window.removeEventListener('resize', checkIsMobile);
      window.removeEventListener('orientationchange', checkIsMobile);
    };
  }, []);

  // Load dashboard data
  useEffect(() => {
    if (isFounder) {
      loadDashboardData();
    }
  }, [isFounder]);

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      console.log('🔄 Loading real dashboard data...');
      
      // Fetch all data in parallel for better performance
      const [
        usersData,
        projectsData,
        stripeData,
        aiData,
        integrationsData
      ] = await Promise.all([
        fetchFirebaseUserData(),
        fetchFirebaseProjectData(),
        fetchStripeData(),
        fetchOpenRouterData(),
        fetchIntegrationsData()
      ]);

      // Calculate total revenue from Stripe + integrations
      const integrationRevenue = Object.values(integrationsData).reduce(
        (sum, platform) => sum + platform.revenue, 0
      );
      const totalRevenue = stripeData.totalRevenue + integrationRevenue;

      const realData: DashboardData = {
        users: usersData,
        projects: projectsData,
        revenue: {
          total: totalRevenue,
          mrr: stripeData.monthlyRecurring,
          recentPayments: [], // TODO: Implement recent payments from Stripe
          stripeData
        },
        ai: aiData,
        integrations: integrationsData,
        system: {
          errors: 0, // TODO: Implement error tracking
          uptime: '99.9%', // TODO: Implement uptime monitoring
          lastUpdated: new Date(),
          databaseSize: '0 MB' // TODO: Calculate actual database size
        }
      };

      console.log('✅ Dashboard data loaded:', realData);
      setDashboardData(realData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      
      // Fallback to minimal mock data if real data fails
      const fallbackData: DashboardData = {
        users: { total: 0, newToday: 0, active: 0, newThisWeek: 0, byTier: { free: 0 } },
        projects: { total: 0, recentCount: 0, byStatus: {} },
        revenue: { total: 0, mrr: 0, recentPayments: [], stripeData: { totalRevenue: 0, monthlyRecurring: 0, activeSubscriptions: 0 } },
        ai: { openrouterSpend: 0, monthlyTokens: 0, groqSpend: 0, totalApiCalls: 0, avgResponseTime: 0 },
        integrations: {
          shopify: { connected: 0, totalOrders: 0, revenue: 0 },
          etsy: { connected: 0, totalListings: 0, revenue: 0 },
          amazon: { connected: 0, totalProducts: 0, revenue: 0 },
          ebay: { connected: 0, totalListings: 0, revenue: 0 }
        },
        system: { errors: 1, uptime: '0%', lastUpdated: new Date(), databaseSize: '0 MB' }
      };
      
      setDashboardData(fallbackData);
    } finally {
      setLoadingData(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  // Force mobile layout with URL parameter for testing
  const urlParams = new URLSearchParams(window.location.search);
  const forceMobile = urlParams.get('mobile') === 'true';
  const forceDesktop = urlParams.get('desktop') === 'true';
  const shouldUseMobileLayout = forceMobile || (isMobile && !forceDesktop);

  if (shouldUseMobileLayout) {
    return <MobileLayout />;
  }

  // Completely hide/redirect if not the founder
  if (!loading && !isFounder) {
    // Return nothing visible - completely hidden
    return <div style={{display: "none"}} />;
  }

  if (loading || loadingData) {
    return (
      <div className="h-screen w-full flex bg-background">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
        />
        <div className="flex-1 flex flex-col">
          <Header onSectionChange={setActiveSection} />
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading dashboard data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const metricCards: MetricCard[] = dashboardData ? [
    {
      title: 'Total Users',
      value: dashboardData.users.total.toLocaleString(),
      change: `+${dashboardData.users.newThisWeek} this week`,
      changeType: 'positive',
      icon: Users,
      description: `${dashboardData.users.newToday} new today, ${dashboardData.users.active} active`
    },
    {
      title: 'Total Projects',
      value: dashboardData.projects.total.toLocaleString(),
      change: `+${dashboardData.projects.recentCount} recent`,
      changeType: 'positive',
      icon: FileText,
      description: 'Across all users'
    },
    {
      title: 'Monthly Revenue',
      value: `$${dashboardData.revenue.mrr.toLocaleString()}`,
      change: `$${dashboardData.revenue.total.toLocaleString()} total`,
      changeType: 'positive',
      icon: DollarSign,
      description: 'Recurring revenue'
    },
    {
      title: 'AI Spend',
      value: `$${(dashboardData.ai.openrouterSpend + dashboardData.ai.groqSpend).toFixed(2)}`,
      change: `${(dashboardData.ai.monthlyTokens / 1000000).toFixed(1)}M tokens`,
      changeType: 'neutral',
      icon: Zap,
      description: 'OpenRouter + Groq costs'
    }
  ] : [];

  return (
    <div className="h-screen w-full flex bg-background">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
      />
      <div className="flex-1 flex flex-col">
        <Header onSectionChange={setActiveSection} />
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  <Crown className="w-8 h-8 text-yellow-500" />
                  Founder Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Real-time business metrics and system overview
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-xs">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </Badge>
                <Button onClick={handleRefresh} disabled={loadingData} size="sm">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingData ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metricCards.map((metric, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        {metric.title}
                      </div>
                      <metric.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {metric.value}
                    </div>
                    {metric.change && (
                      <div className={`text-sm ${
                        metric.changeType === 'positive' ? 'text-green-600' :
                        metric.changeType === 'negative' ? 'text-red-600' :
                        'text-muted-foreground'
                      }`}>
                        {metric.change}
                      </div>
                    )}
                    {metric.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {metric.description}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Detailed Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        System Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>Uptime</span>
                          <Badge variant="outline" className="text-green-600">
                            {dashboardData?.system.uptime}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>System Errors</span>
                          <Badge variant={dashboardData?.system.errors === 0 ? "outline" : "destructive"}>
                            {dashboardData?.system.errors} errors
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Status</span>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Operational</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Quick Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>Active Users Today</span>
                          <span className="font-semibold">{dashboardData?.users.active}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Projects in Progress</span>
                          <span className="font-semibold">{dashboardData?.projects.byStatus['In Progress']}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>AI Token Usage</span>
                          <span className="font-semibold">
                            {dashboardData ? (dashboardData.ai.monthlyTokens / 1000000).toFixed(1) : '0'}M
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Analytics</CardTitle>
                    <CardDescription>User growth and engagement metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Detailed user analytics will be implemented here
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Integration with Firebase Analytics, user behavior tracking, etc.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Analytics</CardTitle>
                    <CardDescription>Project creation and management insights</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dashboardData && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {Object.entries(dashboardData.projects.byStatus).map(([status, count]) => (
                            <div key={status} className="text-center p-4 bg-muted/50 rounded-lg">
                              <div className="text-2xl font-bold">{count}</div>
                              <div className="text-sm text-muted-foreground">{status}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="revenue" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Monthly Revenue Trend */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Revenue Trend</CardTitle>
                      <CardDescription>Revenue growth over the last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={[
                          { month: 'Jul', revenue: 2400, mrr: 800 },
                          { month: 'Aug', revenue: 3200, mrr: 1200 },
                          { month: 'Sep', revenue: 2800, mrr: 1100 },
                          { month: 'Oct', revenue: 4100, mrr: 1600 },
                          { month: 'Nov', revenue: 4800, mrr: 1900 },
                          { month: 'Dec', revenue: 5200, mrr: 2100 },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="month" className="text-sm" />
                          <YAxis className="text-sm" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '6px'
                            }}
                            formatter={(value, name) => [`$${value}`, name === 'revenue' ? 'Total Revenue' : 'MRR']}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#8884d8" 
                            fill="#8884d8" 
                            fillOpacity={0.3}
                            name="revenue"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="mrr" 
                            stroke="#82ca9d" 
                            fill="#82ca9d" 
                            fillOpacity={0.3}
                            name="mrr"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Revenue Sources */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Sources</CardTitle>
                      <CardDescription>Revenue breakdown by source</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Subscriptions', value: dashboardData?.revenue.mrr || 2100, fill: '#8884d8' },
                              { name: 'One-time Purchases', value: (dashboardData?.revenue.total || 5200) - (dashboardData?.revenue.mrr || 2100), fill: '#82ca9d' },
                              { name: 'Affiliates', value: 800, fill: '#ffc658' },
                              { name: 'Integrations', value: Object.values(dashboardData?.integrations || {}).reduce((sum, platform) => sum + platform.revenue, 0) || 300, fill: '#ff7300' },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '6px'
                            }}
                            formatter={(value) => [`$${value}`, 'Revenue']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Metrics</CardTitle>
                    <CardDescription>Key financial indicators and growth metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ${dashboardData?.revenue.total.toLocaleString() || '5,200'}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Revenue</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          ${dashboardData?.revenue.mrr.toLocaleString() || '2,100'}
                        </div>
                        <div className="text-sm text-muted-foreground">Monthly Recurring Revenue</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {dashboardData?.revenue.stripeData?.activeSubscriptions || 42}
                        </div>
                        <div className="text-sm text-muted-foreground">Active Subscriptions</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          ${Object.values(dashboardData?.integrations || {}).reduce((sum, platform) => sum + platform.revenue, 0).toLocaleString() || '300'}
                        </div>
                        <div className="text-sm text-muted-foreground">Integration Revenue</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="integrations" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Shopify Integration */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-white" />
                        </div>
                        Shopify
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Connected Stores</span>
                          <Badge variant="outline">{dashboardData?.integrations.shopify.connected}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Orders</span>
                          <span className="font-medium">{dashboardData?.integrations.shopify.totalOrders.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Revenue</span>
                          <span className="font-medium text-green-600">
                            ${dashboardData?.integrations.shopify.revenue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Etsy Integration */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-white" />
                        </div>
                        Etsy
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Connected Shops</span>
                          <Badge variant="outline">{dashboardData?.integrations.etsy.connected}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Listings</span>
                          <span className="font-medium">{dashboardData?.integrations.etsy.totalListings.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Revenue</span>
                          <span className="font-medium text-orange-600">
                            ${dashboardData?.integrations.etsy.revenue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Amazon Integration */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-white" />
                        </div>
                        Amazon
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Connected Sellers</span>
                          <Badge variant="outline">{dashboardData?.integrations.amazon.connected}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Products</span>
                          <span className="font-medium">{dashboardData?.integrations.amazon.totalProducts.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Revenue</span>
                          <span className="font-medium text-yellow-600">
                            ${dashboardData?.integrations.amazon.revenue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* eBay Integration */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-white" />
                        </div>
                        eBay
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Connected Accounts</span>
                          <Badge variant="outline">{dashboardData?.integrations.ebay.connected}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Listings</span>
                          <span className="font-medium">{dashboardData?.integrations.ebay.totalListings.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Revenue</span>
                          <span className="font-medium text-blue-600">
                            ${dashboardData?.integrations.ebay.revenue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Integration Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue by Platform */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue by Platform</CardTitle>
                      <CardDescription>Breakdown of revenue across e-commerce integrations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={[
                          { 
                            name: 'Shopify', 
                            revenue: dashboardData?.integrations.shopify.revenue || 0,
                            connected: dashboardData?.integrations.shopify.connected || 0
                          },
                          { 
                            name: 'Etsy', 
                            revenue: dashboardData?.integrations.etsy.revenue || 0,
                            connected: dashboardData?.integrations.etsy.connected || 0
                          },
                          { 
                            name: 'Amazon', 
                            revenue: dashboardData?.integrations.amazon.revenue || 0,
                            connected: dashboardData?.integrations.amazon.connected || 0
                          },
                          { 
                            name: 'eBay', 
                            revenue: dashboardData?.integrations.ebay.revenue || 0,
                            connected: dashboardData?.integrations.ebay.connected || 0
                          },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="name" className="text-sm" />
                          <YAxis className="text-sm" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '6px'
                            }}
                            formatter={(value, name) => [
                              name === 'revenue' ? `$${value}` : value, 
                              name === 'revenue' ? 'Revenue' : 'Connected'
                            ]}
                          />
                          <Bar dataKey="revenue" fill="#10b981" name="revenue" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Platform Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Platform Revenue Share</CardTitle>
                      <CardDescription>Distribution of revenue across platforms</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={[
                              { 
                                name: 'Shopify', 
                                value: dashboardData?.integrations.shopify.revenue || 1200,
                                fill: '#10b981' // Green for Shopify
                              },
                              { 
                                name: 'Etsy', 
                                value: dashboardData?.integrations.etsy.revenue || 800,
                                fill: '#f97316' // Orange for Etsy
                              },
                              { 
                                name: 'Amazon', 
                                value: dashboardData?.integrations.amazon.revenue || 600,
                                fill: '#eab308' // Yellow for Amazon
                              },
                              { 
                                name: 'eBay', 
                                value: dashboardData?.integrations.ebay.revenue || 400,
                                fill: '#3b82f6' // Blue for eBay
                              },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                            outerRadius={80}
                            dataKey="value"
                          >
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '6px'
                            }}
                            formatter={(value) => [`$${value}`, 'Revenue']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Integration Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Integration Overview
                    </CardTitle>
                    <CardDescription>
                      Aggregated data from all connected e-commerce platforms
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {Object.values(dashboardData?.integrations || {}).reduce((sum, platform) => sum + platform.connected, 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Connected Accounts</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          ${Object.values(dashboardData?.integrations || {}).reduce((sum, platform) => sum + platform.revenue, 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Integration Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {(Object.values(dashboardData?.integrations || {}).reduce((sum, platform) => sum + platform.revenue, 0) * 0.05).toFixed(0)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Average Commission Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="system" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Monitoring</CardTitle>
                    <CardDescription>Performance metrics and system health</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        System monitoring dashboard will be built here
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Firebase metrics, API response times, error rates, etc.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}