/**
 * Product Service
 * Abstracts product data source (Airtable or JSON)
 * Automatically falls back to JSON if Airtable fails
 */
class ProductService {
    constructor() {
        // Check if we should use Airtable
        this.useAirtable = this.shouldUseAirtable();
        this.cache = null;
        this.cacheTimestamp = null;
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Determine if Airtable should be used
     * @returns {boolean}
     */
    shouldUseAirtable() {
        // Check if we're in a context where Netlify functions are available
        // and we're not explicitly using JSON fallback
        const urlParams = new URLSearchParams(window.location.search);
        const forceJson = urlParams.get('source') === 'json';

        // Use Airtable on production/staging, JSON on localhost or if forced
        return !forceJson && window.location.hostname !== 'localhost';
    }

    /**
     * Get all products (with caching)
     * @returns {Promise<Array>} Array of product objects
     */
    async getProducts() {
        // Check cache
        if (this.cache && this.cacheTimestamp) {
            const now = Date.now();
            if (now - this.cacheTimestamp < this.cacheDuration) {
                console.log('Using cached products');
                return this.cache;
            }
        }

        try {
            let products;

            if (this.useAirtable) {
                console.log('Attempting to fetch from Airtable...');
                products = await this.getProductsFromAirtable();
            } else {
                console.log('Using JSON fallback (localhost or forced)');
                products = await this.getProductsFromJSON();
            }

            // Cache the results
            this.cache = products;
            this.cacheTimestamp = Date.now();

            return products;
        } catch (error) {
            console.error('Error loading products:', error);
            // Don't fallback - let the error propagate so you know there's a problem
            throw error;
        }
    }

    /**
     * Get products from Airtable
     * @returns {Promise<Array>}
     */
    async getProductsFromAirtable() {
        if (typeof AirtableClient === 'undefined') {
            throw new Error('AirtableClient not loaded');
        }

        // Base ID and table name will be configured via Netlify function
        const client = new AirtableClient('', 'Products');
        return await client.getProducts();
    }

    /**
     * Get products from JSON file (fallback)
     * @returns {Promise<Array>}
     */
    async getProductsFromJSON() {
        const response = await fetch('products.json');

        if (!response.ok) {
            throw new Error('Failed to load products.json');
        }

        const data = await response.json();
        return data.products;
    }

    /**
     * Get a single product by ID
     * @param {string} productId - Product ID
     * @returns {Promise<Object|null>} Product object or null if not found
     */
    async getProduct(productId) {
        const products = await this.getProducts();
        return products.find(p => p.id === productId) || null;
    }

    /**
     * Get products filtered by category
     * @param {string} category - Category name
     * @returns {Promise<Array>} Filtered products
     */
    async getProductsByCategory(category) {
        const products = await this.getProducts();
        return products.filter(p =>
            p.categories.some(cat =>
                cat.toLowerCase() === category.toLowerCase()
            )
        );
    }

    /**
     * Get all unique categories
     * @returns {Promise<Array>} Array of category names
     */
    async getCategories() {
        const products = await this.getProducts();
        const categoriesSet = new Set();

        products.forEach(product => {
            product.categories.forEach(category => {
                categoriesSet.add(category);
            });
        });

        return Array.from(categoriesSet).sort();
    }

    /**
     * Clear cache (useful for testing)
     */
    clearCache() {
        this.cache = null;
        this.cacheTimestamp = null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductService;
}
