# Airtable Integration Plan

## Overview
Migrate product data from static `products.json` to Airtable for easier content management.

## Development Environment Setup

### 1. Branch Strategy
- **Production branch**: `master` (current live site)
- **Development branch**: `dev/airtable-integration` (testing)
- **Staging URL**: Will be created via Netlify

### 2. Airtable Setup

#### Create Test Airtable Base
1. Sign up at [airtable.com](https://airtable.com)
2. Create a new base called "These Are Small Things - DEV"
3. Create a "Products" table with these fields:

| Field Name | Field Type | Notes |
|------------|------------|-------|
| Name | Single line text | Product name |
| Price | Number | Dollar amount |
| Description | Long text | Product description |
| Categories | Multiple select | Pre-set category options |
| Images | Attachment | Multiple images per product |
| Details | Long text | JSON formatted details |
| Available | Checkbox | Product availability |
| Product ID | Formula | Auto-generate from name |

#### Get Airtable API Credentials
- Base ID: Found in API documentation
- API Key: Generate from account settings
- Table Name: "Products"

### 3. Netlify Staging Site Setup

#### Create Netlify Site for Dev Branch
1. Go to Netlify dashboard
2. Create new site from existing repo
3. Set build settings:
   - **Branch**: `dev/airtable-integration`
   - **Site name**: `thesearesmallthings-dev` (or similar)
   - **Build command**: (none needed for static site)
   - **Publish directory**: `/`

4. Set environment variables:
   - `AIRTABLE_API_KEY`: Your API key
   - `AIRTABLE_BASE_ID`: Your base ID
   - `AIRTABLE_TABLE_NAME`: "Products"

### 4. Migration Steps

#### Phase 1: Parallel System (Safe Testing)
1. Keep existing `products.json` as fallback
2. Create new `airtable-products.js` to fetch from Airtable
3. Add toggle in code to switch between data sources
4. Test on staging site with Airtable data

#### Phase 2: Data Migration
1. Export current `products.json` to CSV
2. Import CSV into Airtable test base
3. Manually add images to Airtable records
4. Verify all data transferred correctly

#### Phase 3: Code Updates
1. Update `index.html` to fetch from Airtable API
2. Update `product.html` to fetch from Airtable API
3. Handle image URLs from Airtable attachments
4. Add error handling and fallbacks

#### Phase 4: Testing
1. Test all product listings on staging
2. Test individual product pages
3. Test category filtering
4. Test PayPal integration still works
5. Test mobile responsiveness

#### Phase 5: Production Migration
1. Create production Airtable base
2. Migrate all data to production base
3. Update Netlify production environment variables
4. Merge dev branch to master
5. Monitor for issues

## Code Structure

### New Files
- `js/airtable-client.js` - Airtable API client
- `js/product-service.js` - Abstract product data service
- `.env.example` - Example environment variables

### Modified Files
- `index.html` - Update to use new product service
- `product.html` - Update to use new product service
- `.gitignore` - Add `.env` to prevent committing secrets

## API Implementation

### Airtable Client Example
```javascript
class AirtableClient {
    constructor(apiKey, baseId, tableName) {
        this.apiKey = apiKey;
        this.baseId = baseId;
        this.tableName = tableName;
        this.baseUrl = `https://api.airtable.com/v0/${baseId}/${tableName}`;
    }

    async getProducts() {
        const response = await fetch(this.baseUrl, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            }
        });
        const data = await response.json();
        return this.transformRecords(data.records);
    }

    transformRecords(records) {
        return records.map(record => ({
            id: record.fields['Product ID'],
            name: record.fields.Name,
            price: record.fields.Price,
            description: record.fields.Description,
            categories: record.fields.Categories || [],
            images: record.fields.Images?.map(img => img.filename) || [],
            details: JSON.parse(record.fields.Details || '{}'),
            available: record.fields.Available || false
        }));
    }
}
```

### Product Service Example
```javascript
class ProductService {
    constructor() {
        // Check if we should use Airtable or fallback to JSON
        this.useAirtable = typeof AIRTABLE_API_KEY !== 'undefined';
    }

    async getProducts() {
        if (this.useAirtable) {
            return await this.getProductsFromAirtable();
        } else {
            return await this.getProductsFromJSON();
        }
    }

    async getProductsFromAirtable() {
        const client = new AirtableClient(
            AIRTABLE_API_KEY,
            AIRTABLE_BASE_ID,
            AIRTABLE_TABLE_NAME
        );
        return await client.getProducts();
    }

    async getProductsFromJSON() {
        const response = await fetch('products.json');
        const data = await response.json();
        return data.products;
    }
}
```

## Security Considerations

### API Key Protection
- **Never commit API keys to git**
- Use environment variables in Netlify
- For client-side use, consider using Netlify Functions as a proxy
- Airtable API keys are read-only by default (safe for client use)

### Serverless Function Option (More Secure)
Create a Netlify Function to proxy Airtable requests:

```javascript
// netlify/functions/get-products.js
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    const response = await fetch(
        `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Products`,
        {
            headers: {
                'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`
            }
        }
    );
    const data = await response.json();

    return {
        statusCode: 200,
        body: JSON.stringify(data)
    };
};
```

Then fetch from `/.netlify/functions/get-products` instead of Airtable directly.

## Testing Checklist

### Staging Environment
- [ ] Netlify staging site deployed
- [ ] Environment variables configured
- [ ] Airtable test base created
- [ ] Sample data imported

### Functionality Tests
- [ ] Products load on homepage
- [ ] Product filtering works
- [ ] Individual product pages load
- [ ] Images display correctly
- [ ] PayPal integration works
- [ ] Mobile navigation works
- [ ] Contact form works
- [ ] Category tags work

### Performance Tests
- [ ] Page load time acceptable
- [ ] API response time acceptable
- [ ] No CORS errors
- [ ] Caching implemented

### Edge Cases
- [ ] No products available
- [ ] API error handling
- [ ] Missing images
- [ ] Invalid product IDs
- [ ] Slow network conditions

## Rollback Plan

If issues occur in production:
1. Revert merge commit on master branch
2. Redeploy previous version
3. Keep Airtable base for future retry
4. Products.json is still in repo as backup

## Timeline Estimate

- **Setup (2-3 hours)**: Airtable base, Netlify staging, initial code
- **Migration (1-2 hours)**: Data import, image upload
- **Testing (2-4 hours)**: Comprehensive testing on staging
- **Production Deploy (1 hour)**: Final migration and monitoring

**Total**: ~8-12 hours spread over a few days

## Benefits After Migration

1. **Easier Updates**: Edit products directly in Airtable UI
2. **Image Management**: Upload/manage images in one place
3. **No Git Required**: Non-technical updates without commits
4. **Collaboration**: Multiple people can manage inventory
5. **Filtering/Sorting**: Use Airtable views to organize
6. **Backup**: Airtable has built-in version history

## Next Steps

1. Create Airtable test account and base
2. Set up Netlify staging site
3. Implement basic Airtable client
4. Test with sample data
5. Get your approval before proceeding

---

Would you like me to proceed with Step 1: Setting up the Airtable base structure?
