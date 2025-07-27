import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Store, 
  ArrowRight, 
  CheckCircle, 
  Shield, 
  Zap,
  BarChart3,
  ArrowLeft
} from 'lucide-react';
import { shopifyOAuth, parseShopDomain } from '@/lib/shopifyOAuth';

export default function InstallShopify() {
  const navigate = useNavigate();
  const [shopDomain, setShopDomain] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!shopDomain.trim()) {
      alert('Please enter your Shopify store domain');
      return;
    }

    const cleanShop = parseShopDomain(shopDomain);
    
    if (!shopifyOAuth.validateShopDomain(cleanShop)) {
      alert('Please enter a valid Shopify store domain');
      return;
    }

    setIsConnecting(true);
    
    try {
      // Initiate OAuth flow for the specific store
      shopifyOAuth.initiateStoreOAuth(cleanShop);
    } catch (error) {
      console.error('Failed to initiate Shopify OAuth:', error);
      setIsConnecting(false);
      alert('Failed to start Shopify connection. Please try again.');
    }
  };

  const features = [
    {
      icon: BarChart3,
      title: 'Sales Analytics',
      description: 'Track orders, revenue, and customer insights'
    },
    {
      icon: Zap,
      title: 'Automatic Sync',
      description: 'Real-time synchronization of products and orders'
    },
    {
      icon: Shield,
      title: 'Secure Connection',
      description: 'OAuth 2.0 secure authentication with Shopify'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Store className="w-10 h-10 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Connect Your Shopify Store</h1>
            <p className="text-lg text-gray-600 mt-2">
              Sync your store data and unlock powerful analytics
            </p>
          </div>
        </div>

        {/* Main Connection Card */}
        <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="shop-domain" className="text-base font-semibold">
                Your Shopify Store Domain
              </Label>
              <div className="relative">
                <Input
                  id="shop-domain"
                  type="text"
                  placeholder="mystore"
                  value={shopDomain}
                  onChange={(e) => setShopDomain(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                  className="text-lg h-14 pr-32"
                  disabled={isConnecting}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  .myshopify.com
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Enter your store name. You can find this in your Shopify admin URL.<br />
                <span className="font-medium">Example:</span> If your admin is at "mystore.myshopify.com/admin", enter "mystore"
              </p>
            </div>

            <Button 
              onClick={handleConnect}
              disabled={!shopDomain.trim() || isConnecting}
              className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700"
            >
              {isConnecting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                  Connecting to Shopify...
                </>
              ) : (
                <>
                  Connect Store
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="p-4 bg-white/60 backdrop-blur-sm border-0">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* What Happens Next */}
        <Card className="p-6 bg-blue-50/50 backdrop-blur-sm border-blue-200/50">
          <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            What happens next?
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
              <p>You'll be redirected to Shopify to log into your store</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
              <p>Review and approve the connection permissions</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
              <p>You'll be redirected back here with your store connected</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</div>
              <p>Your store data will start syncing automatically</p>
            </div>
          </div>
        </Card>

        {/* Back Button */}
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard/integrations')}
            className="bg-white/80 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Integrations
          </Button>
        </div>
      </div>
    </div>
  );
}