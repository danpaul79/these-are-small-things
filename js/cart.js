/**
 * Shopping Cart Module
 * Manages cart state using localStorage for persistence
 */
class ShoppingCart {
    constructor() {
        this.storageKey = 'thesearesmallthings_cart';
        this.items = this.loadCart();
        this.listeners = [];
    }

    /**
     * Load cart from localStorage
     * @returns {Array} Cart items
     */
    loadCart() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Error loading cart from localStorage:', e);
            return [];
        }
    }

    /**
     * Save cart to localStorage
     */
    saveCart() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.items));
            this.notifyListeners();
        } catch (e) {
            console.error('Error saving cart to localStorage:', e);
        }
    }

    /**
     * Add item to cart
     * Note: Since these are one-of-a-kind items, we don't allow duplicates
     * @param {Object} product - Product object with id, name, price, image
     * @returns {boolean} True if added, false if already in cart
     */
    addItem(product) {
        // Check if item already in cart (one-of-a-kind items)
        if (this.hasItem(product.id)) {
            console.log('Item already in cart:', product.name);
            return false;
        }

        this.items.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images ? product.images[0] : product.image
        });

        this.saveCart();
        return true;
    }

    /**
     * Remove item from cart
     * @param {string} productId - Product ID to remove
     */
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
    }

    /**
     * Check if item is in cart
     * @param {string} productId - Product ID to check
     * @returns {boolean} True if in cart
     */
    hasItem(productId) {
        return this.items.some(item => item.id === productId);
    }

    /**
     * Get all cart items
     * @returns {Array} Cart items
     */
    getItems() {
        return [...this.items];
    }

    /**
     * Get cart item count
     * @returns {number} Number of items in cart
     */
    getItemCount() {
        return this.items.length;
    }

    /**
     * Get cart subtotal
     * @returns {number} Sum of all item prices
     */
    getSubtotal() {
        return this.items.reduce((sum, item) => sum + item.price, 0);
    }

    /**
     * Clear the entire cart
     */
    clearCart() {
        this.items = [];
        this.saveCart();
    }

    /**
     * Format price for display
     * @param {number} price - Price to format
     * @returns {string} Formatted price string
     */
    formatPrice(price) {
        return price.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    /**
     * Subscribe to cart changes
     * @param {Function} callback - Function to call when cart changes
     */
    subscribe(callback) {
        this.listeners.push(callback);
    }

    /**
     * Notify all listeners of cart changes
     */
    notifyListeners() {
        this.listeners.forEach(callback => callback(this));
    }

    /**
     * Get cart data formatted for PayPal
     * @returns {Array} Items formatted for PayPal API
     */
    getPayPalItems() {
        return this.items.map(item => ({
            name: item.name,
            unit_amount: {
                currency_code: 'USD',
                value: item.price.toFixed(2)
            },
            quantity: '1'
        }));
    }

    /**
     * Get PayPal order amount
     * @returns {Object} Amount object for PayPal API
     */
    getPayPalAmount() {
        const subtotal = this.getSubtotal();
        return {
            currency_code: 'USD',
            value: subtotal.toFixed(2),
            breakdown: {
                item_total: {
                    currency_code: 'USD',
                    value: subtotal.toFixed(2)
                }
            }
        };
    }
}

// Create global cart instance
const cart = new ShoppingCart();

/**
 * Update cart icon badge in navigation
 */
function updateCartBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const count = cart.getItemCount();

    badges.forEach(badge => {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    });
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast ('success', 'error', 'info')
 */
function showToast(message, type = 'success') {
    // Remove any existing toast
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    // Add to page
    document.body.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('toast-fade-out');
            setTimeout(() => toast.remove(), 300);
        }
    }, 3000);
}

/**
 * Add product to cart with visual feedback
 * @param {Object} product - Product to add
 */
function addToCart(product) {
    const added = cart.addItem(product);

    if (added) {
        showToast(`${product.name} added to cart!`, 'success');
        updateCartBadge();
    } else {
        showToast('This item is already in your cart', 'info');
    }
}

/**
 * Remove product from cart with visual feedback
 * @param {string} productId - Product ID to remove
 */
function removeFromCart(productId) {
    cart.removeItem(productId);
    showToast('Item removed from cart', 'info');
    updateCartBadge();
}

// Subscribe to cart changes to update badge
cart.subscribe(updateCartBadge);

// Update badge on page load
document.addEventListener('DOMContentLoaded', updateCartBadge);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ShoppingCart, cart };
}
