# Airtable Integration Setup Guide

This guide will walk you through setting up the Airtable integration for your product catalog.

## Table of Contents
1. [Airtable Setup](#airtable-setup)
2. [Netlify Configuration](#netlify-configuration)
3. [Testing](#testing)
4. [Troubleshooting](#troubleshooting)

---

## Airtable Setup

### Step 1: Create Airtable Account
1. Go to [airtable.com](https://airtable.com) and sign up for a free account
2. Verify your email address

### Step 2: Create a Base
1. Click **"Add a base"** in your workspace
2. Choose **"Start from scratch"**
3. Name your base: `These Are Small Things - Products`

### Step 3: Create the Products Table

Your table should have these fields:

| Field Name | Field Type | Options/Notes |
|------------|------------|---------------|
| **Name** | Single line text | Product name (required) |
| **Price** | Currency | Product price in USD |
| **Description** | Long text | Full product description |
| **Categories** | Multiple select | Tags like "Holiday Decor", "Vintage Finds" |
| **Images** | Attachment | Upload product photos |
| **Details** | Long text | JSON format for additional details |
| **Available** | Checkbox | Check = available for sale |

#### Creating Each Field:

**Name Field:**
- Already exists as primary field
- Keep as "Single line text"

**Price Field:**
1. Click **"+"** to add a field
2. Choose **"Currency"**
3. Name it: `Price`
4. Format: USD ($)

**Description Field:**
1. Add field → **"Long text"**
2. Name it: `Description`
3. Enable "Enable rich text formatting" if desired

**Categories Field:**
1. Add field → **"Multiple select"**
2. Name it: `Categories`
3. Add your category options:
   - Holiday Decor
   - Vintage Finds
   - Home Accents
   - Jewelry & Wearables
   - Seasonal
   - Gift Ideas
   - Custom Pieces

**Images Field:**
1. Add field → **"Attachment"**
2. Name it: `Images`
3. You can upload multiple images per product

**Details Field:**
1. Add field → **"Long text"**
2. Name it: `Details`
3. Store JSON format data, for example:
```json
{
  "materials": ["Vintage wood", "Reclaimed metal"],
  "dimensions": "8\" x 10\" x 2\"",
  "care": "Dust with soft cloth",
  "story": "Created from antique barn door hardware"
}
```

**Available Field:**
1. Add field → **"Checkbox"**
2. Name it: `Available`
3. Checked = product is available for sale

### Step 4: Import Your Existing Products

You have two options for importing your products:

#### Option A: Automated Migration Script (Recommended) ⚡

Use the included migration script to automatically upload all 42 products with images:

**Prerequisites:**
```bash
npm install node-fetch form-data
```

**Run the migration:**
```bash
# Set your credentials
AIRTABLE_API_KEY=patXXXXXXXX AIRTABLE_BASE_ID=appXXXXXX node migrate-to-airtable.js

# Or on Windows PowerShell:
$env:AIRTABLE_API_KEY="patXXXXXXXX"; $env:AIRTABLE_BASE_ID="appXXXXXX"; node migrate-to-airtable.js
```

The script will:
- ✅ Upload all 42 products from products.json
- ✅ Upload all product images automatically
- ✅ Create proper JSON formatting for Details field
- ✅ Set categories and availability
- ✅ Show progress and summary

**Expected output:**
```
🚀 Starting Airtable migration...

📦 Found 42 products to migrate

[1/42] Uploading: Seashell Ostrich Art on Weathered Wood
✅ Success! Record ID: recXXXXXXXXXXXXXX
   - Uploaded 3 images

[2/42] Uploading: Blue & Silver Jewelry Flower Collage
✅ Success! Record ID: recXXXXXXXXXXXXXX
   - Uploaded 3 images

...

🎉 Migration complete!
✅ Successfully migrated: 42 products
```

**Troubleshooting:**
- If you get permission errors, ensure your Personal Access Token has `data.records:write` scope
- If images fail to upload, check that all image files exist in `images/products/`

#### Option B: Manual CSV Import

Alternatively, you can manually copy data from your `products.json` file:

**From products.json:**
```json
{
  "id": "rustic-wooden-picture-frame",
  "name": "Rustic Wooden Picture Frame",
  "price": 35,
  "description": "Beautiful handcrafted frame...",
  "categories": ["Home Accents", "Vintage Finds"],
  "images": ["frame-main.jpg", "frame-side.jpg"],
  "details": {
    "materials": ["Reclaimed barn wood", "Glass"],
    "dimensions": "8\" x 10\""
  },
  "available": true
}
```

**To Airtable:**
1. Click **"+"** to add a new record
2. Fill in fields:
   - Name: `Rustic Wooden Picture Frame`
   - Price: `35`
   - Description: `Beautiful handcrafted frame...`
   - Categories: Select `Home Accents` and `Vintage Finds`
   - Images: Upload `frame-main.jpg` and `frame-side.jpg`
   - Details:
     ```json
     {
       "materials": ["Reclaimed barn wood", "Glass"],
       "dimensions": "8\" x 10\""
     }
     ```
   - Available: Check the box

**Important Notes:**
- The `id` field from products.json is NOT needed in Airtable (it's auto-generated from the Name)
- Upload actual image files (JPG, PNG) to the Images field
- The Details field should contain the JSON exactly as shown
- Make sure to check "Available" for products you want to show

### Step 5: Get Your API Credentials

**Base ID:**
1. Go to [airtable.com/api](https://airtable.com/api)
2. Click on your base: "These Are Small Things - Products"
3. Find the base ID in the URL or in the introduction section
   - Format: `appXXXXXXXXXXXXXX`
   - Example: `app12345abcdefghij`

**API Key (Personal Access Token):**
1. Go to [airtable.com/create/apikey](https://airtable.com/create/apikey)
2. Click **"Create new token"**
3. Name it: `These Are Small Things Website`
4. Under **Scopes**, select:
   - `data.records:read` (required for website)
   - `data.records:write` (required ONLY if using migration script)
5. Under **Access**, select:
   - Choose your base: "These Are Small Things - Products"
6. Click **"Create token"**
7. **IMPORTANT:** Copy this token immediately - you won't be able to see it again!
   - Format: `patXXXXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

**Note:** If you're using the automated migration script (Option A above), you need the `data.records:write` scope. If you're only running the website, you only need `data.records:read`.

---

## Netlify Configuration

### Step 1: Set Up Staging Site (Recommended)

1. Log in to [netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to your GitHub repository
4. Configure build settings:
   - **Branch to deploy:** `dev/airtable-integration`
   - **Site name:** `these-are-small-things-staging` (or similar)
5. Click **"Deploy site"**

### Step 2: Configure Environment Variables

**For Staging Site:**
1. Go to your staging site in Netlify
2. Navigate to **Site settings** → **Environment variables**
3. Click **"Add a variable"** and add each of these:

| Key | Value | Example |
|-----|-------|---------|
| `AIRTABLE_API_KEY` | Your personal access token | `patABCD1234...` |
| `AIRTABLE_BASE_ID` | Your base ID | `app12345abcdefg` |
| `AIRTABLE_TABLE_NAME` | Table name | `Products` |

4. Click **"Save"**
5. Trigger a new deploy: **Deploys** → **Trigger deploy** → **Deploy site**

**For Production Site (after testing):**
- Repeat the same steps for your production site
- Make sure to use the same environment variable values

### Step 3: Test Your Staging Site

1. Wait for the deploy to complete
2. Visit your staging site URL
3. Check the browser console (F12) for messages:
   - Should see: `"Attempting to fetch from Airtable..."`
   - If Airtable works: Products should load
   - If Airtable fails: Should see `"Airtable failed, falling back to JSON"` and products load from products.json

---

## Testing

### Test Checklist

**Airtable Connection:**
- [ ] Products load on staging site homepage
- [ ] Product images display correctly
- [ ] Categories filter works
- [ ] Individual product pages load
- [ ] Product details show correctly
- [ ] Unavailable products are hidden

**Fallback to JSON:**
- [ ] Test with invalid API key (should fall back to products.json)
- [ ] Test offline (should use cached data or fall back)

**Browser Console Checks:**
Open browser console (F12) and look for:
```
Attempting to fetch from Airtable...
```
or
```
Using JSON fallback
```

### Testing with JSON Fallback

You can force the system to use products.json by adding `?source=json` to the URL:
```
https://your-staging-site.netlify.app/?source=json
```

---

## Troubleshooting

### Products Not Loading

**Error: "Server configuration error"**
- **Cause:** Environment variables not set in Netlify
- **Fix:**
  1. Go to Netlify → Site settings → Environment variables
  2. Add `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID`
  3. Redeploy the site

**Error: "Failed to fetch from Airtable" (401)**
- **Cause:** Invalid or expired API key
- **Fix:**
  1. Generate a new Personal Access Token in Airtable
  2. Update `AIRTABLE_API_KEY` in Netlify
  3. Redeploy

**Error: "Failed to fetch from Airtable" (404)**
- **Cause:** Invalid Base ID or Table Name
- **Fix:**
  1. Verify your Base ID at airtable.com/api
  2. Check that `AIRTABLE_TABLE_NAME` matches exactly (case-sensitive)
  3. Update environment variables in Netlify
  4. Redeploy

### Images Not Displaying

**Broken image links:**
- **Cause:** Image files not uploaded to Airtable
- **Fix:**
  1. Go to Airtable
  2. For each product, click the Images field
  3. Upload actual image files (JPG, PNG)
  4. The website will automatically extract filenames

**Note:** Image filenames from Airtable should match your existing images in the `images/` folder, or you need to upload those images to Airtable.

### Categories Not Working

**Categories not filtering:**
- **Cause:** Category names don't match
- **Fix:**
  1. In Airtable, go to Categories field settings
  2. Ensure options match exactly: "Holiday Decor", "Vintage Finds", etc.
  3. Check each product has categories selected

### Details Not Parsing

**Product details showing as string:**
- **Cause:** Details field is not valid JSON
- **Fix:**
  1. In Airtable, click the Details field
  2. Ensure it's formatted as JSON:
     ```json
     {
       "materials": ["Wood", "Metal"],
       "dimensions": "10x10"
     }
     ```
  3. Use a JSON validator: [jsonlint.com](https://jsonlint.com)

### Cache Issues

**Changes in Airtable not showing on website:**
- **Cause:** Client-side caching (5 minutes)
- **Fix:**
  1. Wait 5 minutes for cache to expire, or
  2. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R), or
  3. Clear browser cache

---

## Migration to Production

Once you've tested thoroughly on staging:

### Step 1: Merge to Main Branch
```bash
git checkout master
git merge dev/airtable-integration
git push origin master
```

### Step 2: Configure Production Environment Variables
1. Go to your **production** Netlify site
2. Add the same environment variables as staging
3. Deploy will trigger automatically

### Step 3: Monitor Production
1. Check browser console for errors
2. Test all product pages
3. Verify fallback works if needed

### Step 4: Update Your Workflow
From now on, to add/edit products:
1. Go to Airtable
2. Add/edit records directly in the table
3. Changes appear on the website within 5 minutes (cache refresh)

---

## Rollback Plan

If something goes wrong after deploying to production:

### Quick Rollback
1. In Netlify, go to **Deploys**
2. Find the last working deploy (before Airtable integration)
3. Click **"..."** → **"Publish deploy"**
4. Site will immediately revert to previous version

### Permanent Rollback
```bash
git revert <commit-hash>
git push origin master
```

---

## Next Steps

After successful Airtable integration:

1. **Delete or Archive products.json**
   - Keep as backup initially
   - Eventually remove from repository

2. **Image Management**
   - Upload all product images to Airtable
   - Or use a service like Cloudinary for image hosting

3. **Enhanced Features** (see FUTURE_REQUIREMENTS.md)
   - Real-time updates
   - Image optimization
   - Advanced caching
   - Product search

---

## Support Resources

- **Airtable API Documentation:** [airtable.com/api](https://airtable.com/api)
- **Netlify Functions Docs:** [docs.netlify.com/functions/overview](https://docs.netlify.com/functions/overview)
- **Netlify Environment Variables:** [docs.netlify.com/environment-variables/overview](https://docs.netlify.com/environment-variables/overview)

---

*Last updated: January 16, 2026*
