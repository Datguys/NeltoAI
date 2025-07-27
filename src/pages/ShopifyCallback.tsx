import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Store } from 'lucide-react';
// Secure OAuth now handled by backend API

export default function ShopifyCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing Shopify connection...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const shop = searchParams.get('shop');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Handle OAuth errors
        if (error) {
          setStatus('error');
          setMessage(errorDescription || 'Authorization was denied or cancelled.');
          return;
        }

        // Validate required parameters
        if (!code || !shop) {
          setStatus('error');
          setMessage('Missing required parameters from Shopify.');
          return;
        }

        // Get state parameter for CSRF protection
        const state = searchParams.get('state');
        
        console.log('Shopify OAuth callback received:', { code, shop, state });
        
        setMessage('Exchanging authorization code for access token...');
        
        // Call our secure backend to exchange the code for an access token
        const response = await fetch('/api/shopify/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            shop,
            state
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to exchange token');
        }

        const tokenResponse = await response.json();
        
        if (tokenResponse) {
          setStatus('success');
          setMessage(`Successfully connected to ${tokenResponse.shop?.name || shop}!`);
          
          // Store connection info in localStorage for the integrations page
          const connectionInfo = {
            shop: tokenResponse.shop,
            connectedAt: new Date().toISOString(),
            lastSync: new Date().toISOString()
          };
          localStorage.setItem('shopify_connection', JSON.stringify(connectionInfo));
        } else {
          throw new Error('Failed to exchange token');
        }
        
        // Redirect to integrations page after 3 seconds
        setTimeout(() => {
          navigate('/dashboard/integrations');
        }, 3000);

      } catch (error) {
        console.error('Shopify callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-8 h-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'error':
        return <XCircle className="w-8 h-8 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            Shopify Integration
          </h1>
          
          <div className="flex justify-center">
            {getIcon()}
          </div>
          
          <p className={`text-lg font-medium ${getStatusColor()}`}>
            {message}
          </p>
          
          {status === 'loading' && (
            <p className="text-sm text-muted-foreground">
              Please wait while we complete the setup...
            </p>
          )}
          
          {status === 'success' && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your Shopify store has been successfully connected!
              </p>
              <p className="text-xs text-muted-foreground">
                Redirecting to integrations page...
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Something went wrong during the connection process.
              </p>
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/dashboard/integrations')}
                >
                  Back to Integrations
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-muted rounded-lg text-left">
            <h3 className="text-sm font-semibold mb-2">Debug Info:</h3>
            <pre className="text-xs text-muted-foreground">
              {JSON.stringify({
                code: searchParams.get('code')?.substring(0, 20) + '...',
                shop: searchParams.get('shop'),
                error: searchParams.get('error'),
                timestamp: new Date().toISOString()
              }, null, 2)}
            </pre>
          </div>
        )}
      </Card>
    </div>
  );
}