/**
 * Product Service
 * Manages product data from Airtable
 */
class ProductService {
    constructor() {
        this.cache = null;
        this.cacheTimestamp = null;
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes
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
            console.log('Fetching products from Airtable...');
            const products = await this.getProductsFromAirtable();

            // Cache the results
            this.cache = products;
            this.cacheTimestamp = Date.now();

            return products;
        } catch (error) {
            console.error('Error loading products from Airtable:', error);
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
