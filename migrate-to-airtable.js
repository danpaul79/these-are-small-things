/**
 * Airtable Migration Script
 *
 * This script migrates all products from products.json to Airtable,
 * including uploading all product images.
 *
 * Requirements:
 * - Node.js installed
 * - Airtable personal access token with data.records:write scope
 * - Airtable base created with Products table
 *
 * Usage:
 * 1. npm install node-fetch form-data
 * 2. Set environment variables:
 *    - AIRTABLE_API_KEY (your personal access token)
 *    - AIRTABLE_BASE_ID (your base ID)
 * 3. node migrate-to-airtable.js
 */

const fs = require('fs');
const path = require('path');

// Dynamic import for node-fetch (ESM module)
async function main() {
    const fetch = (await import('node-fetch')).default;
    const FormData = (await import('form-data')).default;

    // Configuration
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Products';
    const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

    // Validate environment variables
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
        console.error('❌ Error: Missing required environment variables');
        console.error('Please set:');
        console.error('  - AIRTABLE_API_KEY (your personal access token)');
        console.error('  - AIRTABLE_BASE_ID (your base ID)');
        console.error('\nExample:');
        console.error('  AIRTABLE_API_KEY=patXXXXXX AIRTABLE_BASE_ID=appXXXXXX node migrate-to-airtable.js');
        process.exit(1);
    }

    console.log('🚀 Starting Airtable migration...\n');
    console.log(`Base ID: ${AIRTABLE_BASE_ID}`);
    console.log(`Table: ${AIRTABLE_TABLE_NAME}\n`);

    // Load products.json
    const productsData = JSON.parse(fs.readFileSync('products.json', 'utf8'));
    const products = productsData.products;

    console.log(`📦 Found ${products.length} products to migrate\n`);

    // Upload images to Airtable and get attachment URLs
    async function uploadImage(imagePath) {
        const fullPath = path.join('images', 'products', imagePath);

        if (!fs.existsSync(fullPath)) {
            console.warn(`⚠️  Warning: Image not found: ${fullPath}`);
            return null;
        }

        // Read the image file
        const imageBuffer = fs.readFileSync(fullPath);
        const base64Image = imageBuffer.toString('base64');

        // Airtable accepts attachments as objects with url or base64
        return {
            filename: imagePath,
            url: `data:image/jpeg;base64,${base64Image}`
        };
    }

    // Create a record in Airtable
    async function createProduct(product, index) {
        console.log(`\n[${index + 1}/${products.length}] Uploading: ${product.name}`);

        // Upload all images for this product
        const imageAttachments = [];
        for (const imageName of product.images) {
            const attachment = await uploadImage(imageName);
            if (attachment) {
                imageAttachments.push(attachment);
            }
        }

        // Prepare the record
        const record = {
            fields: {
                Name: product.name,
                Price: product.price,
                Description: product.description,
                Categories: product.categories,
                Images: imageAttachments,
                Details: JSON.stringify(product.details, null, 2),
                Available: product.available
            }
        };

        // Send to Airtable
        try {
            const response = await fetch(AIRTABLE_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(record)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`HTTP ${response.status}: ${JSON.stringify(error)}`);
            }

            const result = await response.json();
            console.log(`✅ Success! Record ID: ${result.id}`);
            console.log(`   - Uploaded ${imageAttachments.length} images`);

            return result;
        } catch (error) {
            console.error(`❌ Failed to upload ${product.name}:`, error.message);
            throw error;
        }
    }

    // Migrate all products (with rate limiting)
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < products.length; i++) {
        try {
            await createProduct(products[i], i);
            successCount++;

            // Airtable rate limit: 5 requests per second
            // Wait 250ms between requests to be safe
            if (i < products.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 250));
            }
        } catch (error) {
            failCount++;
            console.error(`Continuing with next product...\n`);
        }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary');
    console.log('='.repeat(50));
    console.log(`✅ Successfully migrated: ${successCount} products`);
    if (failCount > 0) {
        console.log(`❌ Failed: ${failCount} products`);
    }
    console.log('\n🎉 Migration complete!');
    console.log('\nNext steps:');
    console.log('1. Visit your Airtable base to verify the data');
    console.log('2. Check that images uploaded correctly');
    console.log('3. Configure Netlify environment variables');
    console.log('4. Deploy your staging site\n');
}

// Run the migration
main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
