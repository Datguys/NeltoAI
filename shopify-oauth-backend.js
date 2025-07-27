// Shopify OAuth Backend Implementation
// This handles the secure token exchange and webhook setup

const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for your frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'https://founder-launch-mj58.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Environment variables - store these securely
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;
const APP_URL = process.env.APP_URL; // Your app's public URL

if (!SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET) {
  console.error('❌ Missing required Shopify credentials in environment variables');
  process.exit(1);
}

// In-memory store (replace with database in production)
const connectedStores = new Map();

/**
 * OAuth Token Exchange Endpoint
 * Called by frontend after user approves the app
 */
app.post('/api/shopify/oauth/token', async (req, res) => {
  try {
    const { code, shop, state } = req.body;

    if (!code || !shop) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    console.log(`🔄 Processing OAuth token exchange for shop: ${shop}`);

    // Exchange authorization code for access token
    const tokenResponse = await axios.post(`https://${shop}.myshopify.com/admin/oauth/access_token`, {
      client_id: SHOPIFY_CLIENT_ID,
      client_secret: SHOPIFY_CLIENT_SECRET,
      code: code
    });

    const { access_token, scope } = tokenResponse.data;
    
    // Get shop information
    const shopResponse = await axios.get(`https://${shop}.myshopify.com/admin/api/2023-10/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': access_token
      }
    });

    const shopInfo = shopResponse.data.shop;

    // Store the connection (replace with database)
    const storeData = {
      shop: shop,
      accessToken: access_token,
      scope: scope,
      shopInfo: shopInfo,
      connectedAt: new Date().toISOString(),
      webhooksSetup: false
    };

    connectedStores.set(shop, storeData);

    // Set up mandatory privacy webhooks
    try {
      await setupPrivacyWebhooks(shop, access_token);
      storeData.webhooksSetup = true;
      console.log(`✅ Privacy webhooks configured for ${shop}`);
    } catch (webhookError) {
      console.error(`⚠️ Failed to setup webhooks for ${shop}:`, webhookError.message);
      // Don't fail the connection, but log the issue
    }

    console.log(`✅ Successfully connected shop: ${shopInfo.name} (${shop})`);

    // Return safe data to frontend (no access token)
    res.json({
      success: true,
      shop: {
        domain: shop,
        name: shopInfo.name,
        email: shopInfo.email,
        currency: shopInfo.currency,
        timezone: shopInfo.iana_timezone,
        plan: shopInfo.plan_name
      },
      scope: scope,
      connectedAt: storeData.connectedAt
    });

  } catch (error) {
    console.error('OAuth token exchange error:', error.response?.data || error.message);
    
    res.status(500).json({
      error: 'Failed to exchange OAuth token',
      details: error.response?.data?.error_description || error.message
    });
  }
});

/**
 * Setup mandatory privacy webhooks
 */
async function setupPrivacyWebhooks(shop, accessToken) {
  const webhooks = [
    {
      topic: 'customers/data_request',
      address: `${APP_URL}/webhooks/customers/data_request`,
      format: 'json'
    },
    {
      topic: 'customers/redact',
      address: `${APP_URL}/webhooks/customers/redact`,
      format: 'json'
    },
    {
      topic: 'shop/redact',
      address: `${APP_URL}/webhooks/shop/redact`,
      format: 'json'
    }
  ];

  for (const webhook of webhooks) {
    try {
      await axios.post(`https://${shop}.myshopify.com/admin/api/2023-10/webhooks.json`, {
        webhook: webhook
      }, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Created webhook: ${webhook.topic} for ${shop}`);
    } catch (error) {
      if (error.response?.status === 422) {
        console.log(`ℹ️ Webhook ${webhook.topic} already exists for ${shop}`);
      } else {
        throw error;
      }
    }
  }
}

/**
 * Get connected stores
 */
app.get('/api/shopify/stores', (req, res) => {
  const stores = Array.from(connectedStores.values()).map(store => ({
    domain: store.shop,
    name: store.shopInfo.name,
    email: store.shopInfo.email,
    currency: store.shopInfo.currency,
    connectedAt: store.connectedAt,
    webhooksSetup: store.webhooksSetup
  }));

  res.json({ stores });
});

/**
 * Disconnect a store
 */
app.delete('/api/shopify/stores/:shop', async (req, res) => {
  const { shop } = req.params;
  
  if (connectedStores.has(shop)) {
    const storeData = connectedStores.get(shop);
    
    try {
      // Optionally revoke the access token
      await axios.delete(`https://${shop}.myshopify.com/admin/api/2023-10/oauth/revoke.json`, {
        headers: {
          'X-Shopify-Access-Token': storeData.accessToken
        }
      });
    } catch (error) {
      console.error(`Failed to revoke token for ${shop}:`, error.message);
    }
    
    connectedStores.delete(shop);
    console.log(`🔌 Disconnected shop: ${shop}`);
    
    res.json({ success: true, message: 'Store disconnected' });
  } else {
    res.status(404).json({ error: 'Store not found' });
  }
});

/**
 * Get shop data (orders, products, etc.)
 */
app.get('/api/shopify/stores/:shop/data', async (req, res) => {
  const { shop } = req.params;
  const { type = 'orders' } = req.query;
  
  const storeData = connectedStores.get(shop);
  if (!storeData) {
    return res.status(404).json({ error: 'Store not connected' });
  }

  try {
    let endpoint;
    switch (type) {
      case 'orders':
        endpoint = '/admin/api/2023-10/orders.json?limit=50&status=any';
        break;
      case 'products':
        endpoint = '/admin/api/2023-10/products.json?limit=50';
        break;
      case 'customers':
        endpoint = '/admin/api/2023-10/customers.json?limit=50';
        break;
      default:
        return res.status(400).json({ error: 'Invalid data type' });
    }

    const response = await axios.get(`https://${shop}.myshopify.com${endpoint}`, {
      headers: {
        'X-Shopify-Access-Token': storeData.accessToken
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error(`Failed to fetch ${type} for ${shop}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch store data' });
  }
});

// Include the privacy webhooks from the previous implementation
// (Customer data request, customer redact, shop redact)
const verifyShopifyWebhook = (data, hmacHeader) => {
  const calculatedHmac = crypto
    .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
    .update(data, 'utf8')
    .digest('base64');
  
  return crypto.timingSafeEqual(
    Buffer.from(calculatedHmac, 'base64'),
    Buffer.from(hmacHeader, 'base64')
  );
};

// Middleware for webhook verification
const verifyWebhook = (req, res, next) => {
  const hmac = req.get('X-Shopify-Hmac-Sha256');
  const body = req.body;
  
  if (!hmac || !verifyShopifyWebhook(body, hmac)) {
    return res.status(401).send('Unauthorized: HMAC verification failed');
  }
  
  req.body = JSON.parse(body);
  next();
};

// Raw body middleware for webhooks
app.use('/webhooks', express.raw({ type: 'application/json' }));

// Privacy webhooks (same as before)
app.post('/webhooks/customers/data_request', verifyWebhook, (req, res) => {
  const { shop_id, shop_domain, customer, data_request } = req.body;
  console.log(`📋 Customer data request from ${shop_domain} for customer ${customer?.email}`);
  
  // TODO: Implement data collection and export
  
  res.status(200).json({ message: 'Data request received' });
});

app.post('/webhooks/customers/redact', verifyWebhook, (req, res) => {
  const { shop_id, shop_domain, customer } = req.body;
  console.log(`🗑️ Customer data redaction from ${shop_domain} for customer ${customer?.email}`);
  
  // TODO: Implement data deletion
  
  res.status(200).json({ message: 'Customer data redacted' });
});

app.post('/webhooks/shop/redact', verifyWebhook, (req, res) => {
  const { shop_id, shop_domain } = req.body;
  console.log(`🏪 Shop data redaction for ${shop_domain}`);
  
  // Remove store from our database
  connectedStores.delete(shop_domain.replace('.myshopify.com', ''));
  
  res.status(200).json({ message: 'Shop data redacted' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    connectedStores: connectedStores.size,
    timestamp: new Date().toISOString() 
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Shopify OAuth server running on port ${PORT}`);
  console.log(`📊 Connected stores: ${connectedStores.size}`);
  
  console.log('\n🔧 Required environment variables:');
  console.log(`✅ SHOPIFY_CLIENT_ID: ${SHOPIFY_CLIENT_ID ? 'Set' : '❌ Missing'}`);
  console.log(`✅ SHOPIFY_CLIENT_SECRET: ${SHOPIFY_CLIENT_SECRET ? 'Set' : '❌ Missing'}`);
  console.log(`✅ SHOPIFY_WEBHOOK_SECRET: ${SHOPIFY_WEBHOOK_SECRET ? 'Set' : '❌ Missing'}`);
  console.log(`✅ APP_URL: ${APP_URL || '❌ Missing'}`);
});

module.exports = app;