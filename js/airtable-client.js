/**
 * Airtable API Client
 * Handles communication with Airtable API
 */
class AirtableClient {
    constructor(baseId, tableName) {
        this.baseId = baseId;
        this.tableName = tableName;
        // Use Netlify function as proxy to hide API key
        this.apiUrl = '/.netlify/functions/get-products';
    }

    /**
     * Fetch all products from Airtable
     * @returns {Promise<Array>} Array of product objects
     */
    async getProducts() {
        try {
            // Add 10 second timeout to prevent hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(this.apiUrl, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Airtable API error: ${response.status}`);
            }

            const data = await response.json();
            return this.transformRecords(data.records);
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('Airtable request timed out after 10 seconds');
            } else {
                console.error('Error fetching from Airtable:', error);
            }
            throw error;
        }
    }

    /**
     * Transform Airtable records to product format
     * @param {Array} records - Raw Airtable records
     * @returns {Array} Transformed product objects
     */
    transformRecords(records) {
        return records.map(record => {
            const fields = record.fields;

            // Extract image URLs from Airtable attachments
            const images = (fields.Images || []).map(attachment => {
                // Airtable returns full URLs - use them directly
                return attachment.url || attachment.filename;
            });

            // Parse details JSON if it's a string
            let details = {};
            if (typeof fields.Details === 'string') {
                try {
                    details = JSON.parse(fields.Details);
                } catch (e) {
                    console.warn('Failed to parse details for product:', fields.Name);
                }
            } else {
                details = fields.Details || {};
            }

            return {
                id: this.generateProductId(fields.Name),
                name: fields.Name,
                price: fields.Price || 0,
                description: fields.Description || '',
                categories: fields.Categories || [],
                images: images,
                details: details,
                available: fields.Available !== false // Default to true if not specified
            };
        }).filter(product => product.name); // Filter out records without names
    }

    /**
     * Generate product ID from name (same format as products.json)
     * @param {string} name - Product name
     * @returns {string} Product ID
     */
    generateProductId(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }

    /**
     * Extract filename from Airtable attachment URL
     * @param {string} url - Full URL or filename
     * @returns {string} Just the filename
     */
    extractFilename(url) {
        if (!url) return '';

        // If it's already just a filename, return it
        if (!url.includes('/') && !url.includes('\\')) {
            return url;
        }

        // Extract filename from URL
        const parts = url.split('/');
        return parts[parts.length - 1];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AirtableClient;
}
