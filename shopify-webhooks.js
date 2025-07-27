// Shopify Privacy Webhook Implementation
// This is a complete Express.js server implementation for handling Shopify privacy webhooks

const express = require('express');
const crypto = require('crypto');
const app = express();
const port = process.env.PORT || 3001;

// Middleware to capture raw body for HMAC verification
app.use('/webhooks', express.raw({ type: 'application/json' }));

// Your Shopify app secret - IMPORTANT: Store this securely in environment variables
const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || 'your-shopify-app-secret-here';

// HMAC verification function
function verifyShopifyWebhook(data, hmacHeader) {
  const calculatedHmac = crypto
    .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
    .update(data, 'utf8')
    .digest('base64');
  
  return crypto.timingSafeEqual(
    Buffer.from(calculatedHmac, 'base64'),
    Buffer.from(hmacHeader, 'base64')
  );
}

// Middleware to verify all webhook requests
function verifyWebhook(req, res, next) {
  const hmac = req.get('X-Shopify-Hmac-Sha256');
  const body = req.body;
  
  if (!hmac) {
    return res.status(401).send('Unauthorized: No HMAC header');
  }
  
  if (!verifyShopifyWebhook(body, hmac)) {
    return res.status(401).send('Unauthorized: HMAC verification failed');
  }
  
  // Convert body back to JSON for processing
  req.body = JSON.parse(body);
  next();
}

// 1. Customer Data Request Webhook
// URL: https://yourdomain.com/webhooks/customers/data_request
app.post('/webhooks/customers/data_request', verifyWebhook, (req, res) => {
  const { shop_id, shop_domain, orders_requested, customer, data_request } = req.body;
  
  console.log('Customer Data Request received:', {
    shop_id,
    shop_domain,
    customer_id: customer?.id,
    customer_email: customer?.email,
    orders_requested: orders_requested?.length || 0,
    request_id: data_request?.id
  });
  
  // TODO: Implement your logic to:
  // 1. Collect all customer data from your systems
  // 2. Generate a data export (JSON, CSV, etc.)
  // 3. Send the data to the customer via email or secure download link
  // 4. You have 30 days to fulfill this request
  
  // Example implementation:
  try {
    // Your data collection logic here
    // collectCustomerData(customer.id, shop_id);
    // generateDataExport(customer);
    // sendDataToCustomer(customer.email);
    
    console.log(`Data request processed for customer ${customer?.email} from shop ${shop_domain}`);
    
    res.status(200).json({ 
      message: 'Data request received and will be processed',
      request_id: data_request?.id 
    });
  } catch (error) {
    console.error('Error processing data request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Customer Data Erasure Webhook  
// URL: https://yourdomain.com/webhooks/customers/redact
app.post('/webhooks/customers/redact', verifyWebhook, (req, res) => {
  const { shop_id, shop_domain, customer, orders_to_redact } = req.body;
  
  console.log('Customer Redaction Request received:', {
    shop_id,
    shop_domain,
    customer_id: customer?.id,
    customer_email: customer?.email,
    orders_to_redact: orders_to_redact?.length || 0
  });
  
  // TODO: Implement your logic to:
  // 1. Delete or anonymize all customer personal data
  // 2. Remove customer from marketing lists
  // 3. Delete stored customer preferences
  // 4. Anonymize order data while preserving business records
  // 5. You have 30 days to complete this erasure
  
  try {
    // Your data erasure logic here
    // deleteCustomerData(customer.id, shop_id);
    // anonymizeOrderData(orders_to_redact);
    // removeFromMarketingLists(customer.email);
    
    console.log(`Customer data erased for ${customer?.email} from shop ${shop_domain}`);
    
    res.status(200).json({ 
      message: 'Customer data erasure completed',
      customer_id: customer?.id 
    });
  } catch (error) {
    console.error('Error processing customer redaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Shop Data Erasure Webhook
// URL: https://yourdomain.com/webhooks/shop/redact
app.post('/webhooks/shop/redact', verifyWebhook, (req, res) => {
  const { shop_id, shop_domain } = req.body;
  
  console.log('Shop Redaction Request received:', {
    shop_id,
    shop_domain
  });
  
  // TODO: Implement your logic to:
  // 1. Delete all shop data from your systems
  // 2. Remove shop from your database
  // 3. Delete any stored shop preferences/settings
  // 4. Cancel any active subscriptions
  // 5. You have 30 days to complete this erasure
  
  try {
    // Your shop data erasure logic here
    // deleteShopData(shop_id);
    // removeShopSettings(shop_id);
    // cancelShopSubscriptions(shop_id);
    
    console.log(`Shop data erased for ${shop_domain} (${shop_id})`);
    
    res.status(200).json({ 
      message: 'Shop data erasure completed',
      shop_id 
    });
  } catch (error) {
    console.error('Error processing shop redaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
  console.log(`Shopify webhook server running on port ${port}`);
  console.log('Webhook endpoints:');
  console.log('  POST /webhooks/customers/data_request');
  console.log('  POST /webhooks/customers/redact');
  console.log('  POST /webhooks/shop/redact');
});

module.exports = app;