// SHOPIFY WEBHOOKS IMPLEMENTATION
// This is example code for your backend API (Node.js/Express or Next.js API routes)
// Deploy this to handle Shopify webhooks at: https://founder-launch-mj58.vercel.app/api/shopify/

const crypto = require('crypto');
const express = require('express');
const app = express();

// Middleware to capture raw body for HMAC verification
app.use('/api/shopify/webhooks', express.raw({ type: 'application/json' }));

// Shopify webhook secret (set this in your environment variables)
const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || 'your-webhook-secret';

/**
 * Verify HMAC signature from Shopify
 * This is CRITICAL for security - only accept verified requests
 */
function verifyShopifyWebhook(data, hmacHeader) {
  if (!hmacHeader) {
    return false;
  }

  const calculatedHmac = crypto
    .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
    .update(data)
    .digest('base64');
  
  const providedHmac = hmacHeader.replace('sha256=', '');
  
  return crypto.timingSafeEqual(
    Buffer.from(calculatedHmac, 'base64'),
    Buffer.from(providedHmac, 'base64')
  );
}

/**
 * MANDATORY WEBHOOK 1: Customer Data Request (GDPR)
 * Shopify sends this when a customer requests their data
 * You must implement this to comply with GDPR
 */
app.post('/api/shopify/webhooks/customers/data_request', (req, res) => {
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  
  // Verify the webhook is from Shopify
  if (!verifyShopifyWebhook(req.body, hmacHeader)) {
    console.log('Webhook verification failed for customers/data_request');
    return res.status(401).send('Unauthorized');
  }

  const payload = JSON.parse(req.body);
  
  console.log('Customer data request received:', {
    shop_id: payload.shop_id,
    shop_domain: payload.shop_domain,
    customer: payload.customer,
    data_request: payload.data_request
  });

  // TODO: Implement your data collection logic
  // 1. Search your database for any data related to this customer
  // 2. Compile the data into the required format
  // 3. Send it to the customer (or store it for retrieval)
  
  /* Example implementation:
  try {
    const customerData = await collectCustomerData(payload.customer.id);
    await sendDataToCustomer(payload.customer.email, customerData);
    
    // Log the completion for compliance records
    await logDataRequest(payload.shop_domain, payload.customer.id, 'completed');
  } catch (error) {
    console.error('Failed to process data request:', error);
    return res.status(500).send('Internal Server Error');
  }
  */

  // Respond with 200 OK to acknowledge receipt
  res.status(200).send('Customer data request processed');
});

/**
 * MANDATORY WEBHOOK 2: Customer Redact (GDPR)
 * Shopify sends this when a customer requests data deletion
 * You must delete all customer data within 30 days
 */
app.post('/api/shopify/webhooks/customers/redact', (req, res) => {
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  
  if (!verifyShopifyWebhook(req.body, hmacHeader)) {
    console.log('Webhook verification failed for customers/redact');
    return res.status(401).send('Unauthorized');
  }

  const payload = JSON.parse(req.body);
  
  console.log('Customer redaction request received:', {
    shop_id: payload.shop_id,
    shop_domain: payload.shop_domain,
    customer: payload.customer
  });

  // TODO: Implement your data deletion logic
  // 1. Find all data related to this customer in your database
  // 2. Permanently delete it (within 30 days of receiving this webhook)
  // 3. Log the deletion for compliance records
  
  /* Example implementation:
  try {
    await deleteCustomerData(payload.customer.id);
    await logDataDeletion(payload.shop_domain, payload.customer.id, 'scheduled');
    
    // Schedule permanent deletion within 30 days
    await scheduleDataDeletion(payload.customer.id, Date.now() + (30 * 24 * 60 * 60 * 1000));
  } catch (error) {
    console.error('Failed to process redaction request:', error);
    return res.status(500).send('Internal Server Error');
  }
  */

  res.status(200).send('Customer redaction request processed');
});

/**
 * MANDATORY WEBHOOK 3: Shop Redact (GDPR)
 * Shopify sends this when a shop owner requests deletion after uninstalling your app
 * You must delete all shop data within 30 days
 */
app.post('/api/shopify/webhooks/shop/redact', (req, res) => {
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  
  if (!verifyShopifyWebhook(req.body, hmacHeader)) {
    console.log('Webhook verification failed for shop/redact');
    return res.status(401).send('Unauthorized');
  }

  const payload = JSON.parse(req.body);
  
  console.log('Shop redaction request received:', {
    shop_id: payload.shop_id,
    shop_domain: payload.shop_domain
  });

  // TODO: Implement your shop data deletion logic
  // 1. Find all data related to this shop in your database
  // 2. Permanently delete it (within 30 days)
  // 3. Log the deletion for compliance records
  
  /* Example implementation:
  try {
    await deleteShopData(payload.shop_id);
    await logShopDeletion(payload.shop_domain, 'scheduled');
    
    // Schedule permanent deletion within 30 days
    await scheduleShopDeletion(payload.shop_id, Date.now() + (30 * 24 * 60 * 60 * 1000));
  } catch (error) {
    console.error('Failed to process shop redaction:', error);
    return res.status(500).send('Internal Server Error');
  }
  */

  res.status(200).send('Shop redaction request processed');
});

/**
 * OPTIONAL: Business Logic Webhooks
 * These help your app react to store changes
 */

// New order created - track revenue, update analytics
app.post('/api/shopify/webhooks/orders/create', (req, res) => {
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  
  if (!verifyShopifyWebhook(req.body, hmacHeader)) {
    return res.status(401).send('Unauthorized');
  }

  const order = JSON.parse(req.body);
  
  console.log('New order received:', {
    shop: req.get('X-Shopify-Shop-Domain'),
    order_id: order.id,
    total_price: order.total_price,
    customer_id: order.customer?.id
  });

  // TODO: Update your analytics, send notifications, etc.
  
  res.status(200).send('Order webhook processed');
});

// Product updated - sync inventory, update listings
app.post('/api/shopify/webhooks/products/update', (req, res) => {
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  
  if (!verifyShopifyWebhook(req.body, hmacHeader)) {
    return res.status(401).send('Unauthorized');
  }

  const product = JSON.parse(req.body);
  
  console.log('Product updated:', {
    shop: req.get('X-Shopify-Shop-Domain'),
    product_id: product.id,
    title: product.title
  });

  // TODO: Sync product changes to your database
  
  res.status(200).send('Product webhook processed');
});

// App uninstalled - clean up data
app.post('/api/shopify/webhooks/app/uninstalled', (req, res) => {
  const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
  
  if (!verifyShopifyWebhook(req.body, hmacHeader)) {
    return res.status(401).send('Unauthorized');
  }

  const payload = JSON.parse(req.body);
  
  console.log('App uninstalled:', {
    shop_id: payload.id,
    shop_domain: payload.domain
  });

  // TODO: Mark shop as uninstalled, clean up resources
  
  res.status(200).send('Uninstall webhook processed');
});

/**
 * WEBHOOK REGISTRATION
 * Call this after successful OAuth to register webhooks with Shopify
 */
async function registerWebhooks(shopDomain, accessToken) {
  const baseUrl = 'https://founder-launch-mj58.vercel.app';
  
  const webhooks = [
    // Mandatory GDPR webhooks
    {
      webhook: {
        topic: 'customers/data_request',
        address: `${baseUrl}/api/shopify/webhooks/customers/data_request`,
        format: 'json'
      }
    },
    {
      webhook: {
        topic: 'customers/redact',
        address: `${baseUrl}/api/shopify/webhooks/customers/redact`,
        format: 'json'
      }
    },
    {
      webhook: {
        topic: 'shop/redact',
        address: `${baseUrl}/api/shopify/webhooks/shop/redact`,
        format: 'json'
      }
    },
    // Optional business webhooks
    {
      webhook: {
        topic: 'orders/create',
        address: `${baseUrl}/api/shopify/webhooks/orders/create`,
        format: 'json'
      }
    },
    {
      webhook: {
        topic: 'products/update',
        address: `${baseUrl}/api/shopify/webhooks/products/update`,
        format: 'json'
      }
    },
    {
      webhook: {
        topic: 'app/uninstalled',
        address: `${baseUrl}/api/shopify/webhooks/app/uninstalled`,
        format: 'json'
      }
    }
  ];

  try {
    for (const webhook of webhooks) {
      const response = await fetch(`https://${shopDomain}/admin/api/2024-01/webhooks.json`, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhook)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`Registered webhook: ${webhook.webhook.topic}`, result.webhook.id);
      } else {
        console.error(`Failed to register ${webhook.webhook.topic}:`, await response.text());
      }
    }
  } catch (error) {
    console.error('Error registering webhooks:', error);
  }
}

// Export for use in your OAuth callback
module.exports = { registerWebhooks, verifyShopifyWebhook };

/**
 * DEPLOYMENT INSTRUCTIONS:
 * 
 * 1. Deploy this code to your backend (Vercel, Railway, etc.)
 * 2. Set environment variables:
 *    - SHOPIFY_WEBHOOK_SECRET (generate a random string)
 * 3. In Shopify Partner Dashboard, set webhook URLs:
 *    - https://your-domain.com/api/shopify/webhooks/customers/data_request
 *    - https://your-domain.com/api/shopify/webhooks/customers/redact
 *    - https://your-domain.com/api/shopify/webhooks/shop/redact
 * 4. Test with Shopify's webhook testing tool
 * 5. Call registerWebhooks() after successful OAuth
 */