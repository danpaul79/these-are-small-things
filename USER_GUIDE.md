# These Are Small Things - JSON-Based Website Guide

## 🎉 What's New in Version 4

Your website now uses a **smart JSON-based system** that makes managing products super easy!

### Key Benefits:
- ✅ **One product page** instead of 18 separate HTML files
- ✅ **Easy to mark items as sold** - just change one line in products.json
- ✅ **Easy to add new products** - just add to products.json
- ✅ **Easy to update prices** - edit products.json
- ✅ **Automatic image carousels** - add multiple images to any product
- ✅ **No coding needed** - everything in products.json

---

## 📁 File Structure

```
your-site/
├── index.html           (Main shop page - loads products from JSON)
├── product.html         (Single template for ALL products)
├── products.json        (★ ALL YOUR PRODUCT DATA HERE ★)
└── images/
    └── products/
        ├── 1A_20251115.jpg
        ├── 1B_20251115.jpg  (additional images for carousels)
        └── ... (all product images)
```

---

## 🛍️ How to Manage Products

### Mark a Product as SOLD

1. Open `products.json`
2. Find the product
3. Change `"available": true` to `"available": false`

```json
{
  "id": "vintage-jewelry-tree",
  "name": "Vintage Jewelry Tree on Teal",
  "price": 85,
  ...
  "available": false    ← Change this!
}
```

4. Save the file
5. Re-upload to Netlify

**That's it!** The product will automatically disappear from the shop page.

---

### Add a New Product

1. Open `products.json`
2. Copy an existing product entry
3. Update all the fields:

```json
{
  "id": "new-product-slug",        ← URL-friendly name
  "name": "New Product Name",      ← Display name
  "price": 75,                     ← Price
  "category": "Jewelry Art",       ← Category
  "description": "Description...", ← Full description
  "images": [                      ← Image filenames
    "19A_20251115.jpg",
    "19B_20251115.jpg"            ← Optional: add more for carousel
  ],
  "details": {                     ← Product details
    "Materials": "...",
    "Frame size": "...",
    "Style": "...",
    "Handmade": "Yes, one-of-a-kind",
    "Ready to hang": "Yes"
  },
  "available": true
}
```

4. Add a comma after the previous product
5. Upload your product images to `images/products/`
6. Save and re-upload to Netlify

---

### Update a Price

1. Open `products.json`
2. Find the product
3. Change the price number

```json
"price": 85,  ← Change to: "price": 90,
```

4. Save and re-upload

---

## 🖼️ How Images Work

### Single Image Products
Just list one image:
```json
"images": ["2A_20251115.jpg"]
```

### Multiple Image Products (Carousel)
List multiple images - carousel appears automatically:
```json
"images": [
  "13A_20251115.jpg",
  "13B_20251115.jpg",
  "13C_20251115.jpg"
]
```

The website automatically:
- Shows a carousel if multiple images exist
- Shows navigation arrows
- Shows thumbnails below
- Shows a single image if only one exists

---

## 📂 Product Categories

Current categories:
- **Jewelry Art** - jewelry-based artwork
- **Vintage Collections** - buttons, keys, shells
- **Dioramas** - miniature scenes

To add a new category:
1. Just use it in products.json: `"category": "New Category"`
2. It will automatically appear in the filter buttons

---

## 🔧 Common Tasks

### Change Product Description
Edit the `"description"` field in products.json

### Change Product Details
Edit the `"details"` object in products.json

### Reorder Products
Products appear in the order they're listed in products.json.
Just cut and paste to reorder.

### Update PayPal Email
1. Open `product.html`
2. Find `[YOUR_PAYPAL_EMAIL]`
3. Replace with your actual PayPal email
4. Save and re-upload

---

## 🚀 Deploying Updates

1. Edit `products.json` with your changes
2. Zip the entire folder (make sure index.html, product.html, products.json are at root level)
3. Upload to Netlify

**Or** you can:
1. Just upload the edited `products.json` file to Netlify
2. It will automatically update without re-uploading everything!

---

## 📸 Adding Product Images

### Option 1: Edit the Zip
1. Extract the zip file
2. Add your images to `images/products/`
3. Update the filenames in products.json
4. Re-zip and upload

### Option 2: Through Netlify
1. Upload images directly through Netlify's file manager
2. Update products.json to reference the new images

**Image naming convention:**
- Format: `{NUMBER}{LETTER}_20251115.jpg`
- Examples: `1A_20251115.jpg`, `1B_20251115.jpg`, `19A_20251115.jpg`
- The letter (A, B, C) indicates different views of the same product

---

## ✨ Tips

1. **Always test locally** - open index.html in your browser before uploading
2. **JSON syntax matters** - missing commas or quotes will break things
3. **Use a JSON validator** - paste your JSON into jsonlint.com to check for errors
4. **Keep backups** - save a copy of products.json before making changes
5. **Image optimization** - compress images before uploading to keep site fast

---

## 🆘 Troubleshooting

**Products not showing up?**
- Check products.json syntax with jsonlint.com
- Make sure `"available": true`
- Check that image filenames match exactly

**Images not loading?**
- Verify image filenames in products.json match actual files
- Check that images are in `images/products/` folder

**Carousel not working?**
- Make sure you have multiple images listed in the "images" array
- Verify all image files exist

---

## 📝 Example: Complete Product Entry

```json
{
  "id": "vintage-jewelry-tree",
  "name": "Vintage Jewelry Tree on Teal",
  "price": 85,
  "category": "Jewelry Art",
  "description": "A stunning jewelry tree artwork created from vintage brooches, earrings, and beads arranged on a rich teal velvet background.",
  "images": [
    "1A_20251115.jpg",
    "1B_20251115.jpg",
    "1C_20251115.jpg"
  ],
  "details": {
    "Materials": "Vintage jewelry, beads, teal velvet, ornate gold frame",
    "Frame size": "Approximately 11\" x 14\"",
    "Style": "Elegant, Nature-inspired",
    "Handmade": "Yes, one-of-a-kind",
    "Ready to hang": "Yes"
  },
  "available": true
}
```

This creates a product with:
- A 3-image carousel
- Full product details
- Available for purchase
- Appears in "Jewelry Art" category

---

## 🎯 Quick Reference

| Task | File to Edit | What to Change |
|------|-------------|----------------|
| Mark as sold | products.json | `"available": false` |
| Change price | products.json | `"price": 90` |
| Add product | products.json | Add new entry |
| Update description | products.json | `"description": "..."` |
| Add images | products.json + upload images | `"images": [...]` |
| Update PayPal | product.html | `[YOUR_PAYPAL_EMAIL]` |

---

**Need help?** The JSON structure is self-explanatory - just look at existing products as templates!
