# Shopify App Privacy Compliance Setup Guide

## Overview
This guide walks you through setting up mandatory privacy webhooks for your Shopify app to comply with GDPR/CCPA requirements.

## Prerequisites
- Shopify Partner Dashboard access
- Your app deployed with webhook endpoints accessible via HTTPS
- Your Shopify app credentials (Client ID, Client Secret, Webhook Secret)

## 0. Setup Environment Variables

### Frontend (.env.local)
```bash
VITE_SHOPIFY_CLIENT_ID=your-shopify-app-client-id
```

### Backend (.env)
```bash
SHOPIFY_CLIENT_ID=your-shopify-app-client-id
SHOPIFY_CLIENT_SECRET=your-shopify-app-client-secret
SHOPIFY_WEBHOOK_SECRET=your-shopify-webhook-secret
APP_URL=https://yourdomain.com
FRONTEND_URL=https://yourfrontend.com
PORT=3001
```

**Important**: Never expose your Client Secret or Webhook Secret in frontend code!

## 1. Deploy Your Webhook Endpoints

### Option A: Express.js Server (standalone)
Use the `shopify-webhooks.js` file provided in the project root:

1. Install dependencies:
```bash
npm install express crypto
```

2. Set environment variables:
```bash
SHOPIFY_WEBHOOK_SECRET=your-shopify-app-secret-here
PORT=3001
```

3. Deploy to your hosting platform (Heroku, Railway, Render, etc.)

### Option B: Next.js API Routes
Use the `nextjs-shopify-routes.js` examples to create API routes:

1. Create these files in your Next.js project:
   - `/pages/api/webhooks/customers/data_request.js`
   - `/pages/api/webhooks/customers/redact.js`
   - `/pages/api/webhooks/shop/redact.js`

2. Set environment variable:
```bash
SHOPIFY_WEBHOOK_SECRET=your-shopify-app-secret-here
```

3. Deploy to Vercel, Netlify, or similar platform

## 2. Configure Shopify Partner Dashboard

### Step 1: Access Your App Settings
1. Log into your [Shopify Partner Dashboard](https://partners.shopify.com)
2. Navigate to **Apps** → Select your app
3. Click **App setup** in the left sidebar

### Step 2: Configure Privacy Webhooks
Scroll down to the **Privacy webhooks** section and enter these URLs:

#### Customer data request webhook:
```
https://yourdomain.com/webhooks/customers/data_request
```
*Purpose: Handle customer data export requests (GDPR Article 15)*

#### Customer redact webhook:
```
https://yourdomain.com/webhooks/customers/redact
```
*Purpose: Handle customer data deletion requests (GDPR Article 17)*

#### Shop redact webhook:
```
https://yourdomain.com/webhooks/shop/redact
```
*Purpose: Handle shop uninstallation and data cleanup*

### Step 3: Save Configuration
Click **Save** to apply the webhook URLs.

## 3. Test Your Webhooks

### Using ngrok for Local Testing
1. Install ngrok: `npm install -g ngrok`
2. Start your webhook server locally
3. Expose it: `ngrok http 3001`
4. Use the ngrok URL in your Shopify dashboard temporarily

### Test with Shopify Webhook Tester
1. In Partner Dashboard → **App setup** → **Webhooks**
2. Click **Test webhook** next to each configured webhook
3. Verify your endpoints respond with HTTP 200

## 4. Verify HMAC Signature Validation

Your webhook endpoints MUST verify the HMAC signature:

```javascript
const hmac = req.get('X-Shopify-Hmac-Sha256');
const calculatedHmac = crypto
  .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
  .update(body, 'utf8')
  .digest('base64');

const isValid = crypto.timingSafeEqual(
  Buffer.from(calculatedHmac, 'base64'),
  Buffer.from(hmac, 'base64')
);
```

## 5. Implementation Requirements

### Customer Data Request Webhook
- **Must respond within**: 30 days
- **Must provide**: All customer data you have stored
- **Format**: JSON, CSV, or other structured format
- **Delivery**: Email or secure download link

### Customer Redact Webhook  
- **Must complete within**: 30 days
- **Must delete**: All personally identifiable information
- **Can keep**: Anonymized business records for legal/accounting
- **Must remove**: Customer from marketing lists

### Shop Redact Webhook
- **Triggered when**: Shop uninstalls your app
- **Must complete within**: 30 days
- **Must delete**: All shop data, settings, preferences
- **Must cancel**: Any active subscriptions or services

## 6. Error Handling

### Webhook Failures
- Return HTTP 200 for successful processing
- Return HTTP 500 for temporary failures (Shopify will retry)
- Log all webhook requests for debugging

### Compliance Failures
- Document all data processing activities
- Maintain logs of deletion requests and completions
- Have a process for manual fulfillment if automated systems fail

## 7. Final Steps

### Before App Review Submission
1. ✅ All webhook endpoints return HTTP 200
2. ✅ HMAC signature validation works
3. ✅ Test data request/deletion flow end-to-end
4. ✅ Document your data handling procedures
5. ✅ Ensure HTTPS is enabled and certificates are valid

### App Store Requirements
- Privacy policy must be linked in your app listing
- Terms of service must include data handling details
- App description should mention GDPR/CCPA compliance

## 8. Troubleshooting

### Common Issues

**Webhook not receiving requests:**
- Check HTTPS certificate validity
- Verify URL accessibility from external networks
- Ensure firewall allows incoming requests

**HMAC validation failing:**
- Double-check your app secret matches exactly
- Ensure you're using the raw request body (not parsed JSON)
- Verify base64 encoding/decoding

**Timeouts:**
- Shopify expects response within 5 seconds
- Process heavy operations asynchronously
- Return 200 immediately, process in background

### Testing Commands
```bash
# Test webhook endpoint accessibility
curl -X POST https://yourdomain.com/webhooks/customers/data_request \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Check HTTPS certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

## 9. Next Steps

Once your webhooks are configured and tested:
1. Submit your app for Shopify review
2. Monitor webhook logs for any issues
3. Set up alerting for webhook failures
4. Document your compliance procedures for audits

## Security Notes

- Store webhook secrets securely (environment variables, not code)
- Use HTTPS everywhere - Shopify requires it
- Log webhook payloads for compliance auditing
- Implement rate limiting if handling high volumes
- Consider using a webhook queue for reliability

---

**Need help?** Check the [Shopify Partner Documentation](https://shopify.dev/docs/apps/webhooks/privacy-mandatory-webhooks) or contact Shopify Partner Support.