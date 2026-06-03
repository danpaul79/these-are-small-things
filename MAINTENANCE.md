# Maintenance & Handoff Runbook — These Are Small Things

**Last updated:** 2026-06-02
**Live site:** https://thesearesmallthings.netlify.app
**What this is:** The one document a future maintainer should read first. It explains how the
site works, how to keep it running, what can go wrong, and how to pick the project back up with
Claude Code. It is written to stand on its own — you do not need any other file to get oriented.

> **If you are using Claude Code to maintain this site:** open a session in this folder and say
> *"Read MAINTENANCE.md and CLAUDE.md, then help me with &lt;task&gt;."* Everything Claude needs to
> be productive is in those two files. (`CLAUDE.md` / `claude.md` is a deeper technical reference
> that lives only on the original maintainer's machine — it is intentionally **not** committed
> because it contains secrets. This runbook does not depend on it.)

---

## Table of Contents
1. [The site in 60 seconds](#the-site-in-60-seconds)
2. [Accounts & secrets — what you must have access to](#accounts--secrets--what-you-must-have-access-to)
3. [How the code is laid out (accurate file map)](#how-the-code-is-laid-out-accurate-file-map)
4. [Day-to-day: changing products (no code)](#day-to-day-changing-products-no-code)
5. [Deploying code changes & rolling back](#deploying-code-changes--rolling-back)
6. [Free-tier limits — the "don't hit a wall" watch list](#free-tier-limits--the-dont-hit-a-wall-watch-list)
7. [Recurring maintenance schedule](#recurring-maintenance-schedule)
8. [Health check — is everything working?](#health-check--is-everything-working)
9. [Troubleshooting runbook](#troubleshooting-runbook)
10. [Known latent issues & technical debt](#known-latent-issues--technical-debt)
11. [Roadmap / planned work](#roadmap--planned-work)
12. [How to resume this project with Claude](#how-to-resume-this-project-with-claude)

---

## The site in 60 seconds

A static storefront for one-of-a-kind handcrafted art. There is **no traditional backend and no
database server to run**. The moving parts:

```
Shopper's browser
   │
   ├─ loads static HTML/CSS/JS from Netlify (the host)
   │
   ├─ asks a Netlify Function (/.netlify/functions/get-products) for the catalog
   │        └─ the Function calls Airtable with a secret key and returns products
   │
   ├─ checkout runs in the browser via the PayPal JavaScript SDK
   │
   └─ the Contact form posts to Netlify Forms (no code, no server)
```

Plain-English version of why it's built this way:

- **Netlify** hosts the files and runs one small serverless function. Pushing to the `master`
  branch on GitHub automatically publishes the site.
- **Airtable** is the product catalog. The owner adds/edits products and uploads photos in a
  spreadsheet-like UI — **no code changes are ever needed to manage products.**
- The Netlify Function exists only to keep the Airtable secret key off the public internet. The
  browser never sees it.
- **PayPal** handles money. We never touch card numbers; PayPal does.
- The whole thing runs on **free tiers** today (see the limits section).

---

## Accounts & secrets — what you must have access to

To maintain this site you need login access to these accounts. **No passwords or keys are stored
in this repository** — this is only an inventory of *where things live* so a new maintainer knows
what to request.

| Service | What it's for | Where to find it | What you need |
|---|---|---|---|
| **GitHub** | Source code; pushing to `master` triggers deploys | the repo this file is in | Write access to the repo |
| **Netlify** | Hosting, the serverless function, Forms, env vars | https://app.netlify.com (site: `thesearesmallthings`) | Team/site member access |
| **Airtable** | The product catalog + photos | https://airtable.com | Access to the "These Are Small Things – Products" base |
| **PayPal Business** | Payments (PayPal/Venmo/cards) | https://www.paypal.com | Business account login |
| **Domain/DNS** *(if a custom domain is added later)* | Points the domain at Netlify | registrar dashboard | Registrar login |

**The three secrets that make the site work** are stored as **Netlify environment variables**
(Netlify → Site settings → Environment variables), never in code:

- `AIRTABLE_API_KEY` — the Airtable personal access token (the sensitive one)
- `AIRTABLE_BASE_ID` — which Airtable base to read
- `AIRTABLE_TABLE_NAME` — **must be the table _ID_** (looks like `tbl...`), not the word "Products"

The **PayPal client ID** is *not* a secret — it is a publishable identifier and is hardcoded
directly in the page `<script>` tags (see file map). That is normal and safe for PayPal's
browser SDK.

> **Security note for handoff:** the original maintainer's local `claude.md` contains the actual
> Airtable key for convenience. If the project changes hands, **rotate the Airtable token**
> (create a new one in Airtable, update the Netlify env var, delete the old token) so the previous
> owner's copy stops working. See [Recurring maintenance](#recurring-maintenance-schedule).

---

## How the code is laid out (accurate file map)

> This map reflects what is **actually in the repository today.** (If you read older notes that
> mention `products.json`, `js/paypal-config.js`, `about.html`, or `contact.html` — those do not
> exist anymore or never did. The truth is below.)

```
index.html        Main shop page. Contains THREE things in one file:
                    • the product grid (loads from Airtable)
                    • the About section  (the "About" nav link is the #about anchor here)
                    • the Contact form   (the "Contact" nav link is the #contact anchor;
                                          it's a Netlify Form that posts to success.html)
                  Also holds the cart icon/badge in the nav and the PayPal SDK is NOT here.

product.html      Single template for every product detail page (?id=<product-slug>).
                  Has the "Add to Cart" button. Loads the PayPal SDK inline at the top
                  (line ~12, the <script src="https://www.paypal.com/sdk/js?client-id=...">).

cart.html         The shopping cart + checkout page:
                    • lists cart items (from localStorage)
                    • the shipping calculator — SHIPPING_ZONES and the rates are defined
                      inline in this file (search for "SHIPPING_ZONES", ~line 181)
                    • the PayPal checkout button (PayPal SDK loaded inline, ~line 12)
                    • the post-payment success modal

success.html      "Thank you" page shown after the CONTACT form is submitted
                  (not the payment confirmation — payment confirms in a modal on cart.html).

styles.css        Global styles (shared by all pages).

js/airtable-client.js   Talks to the Netlify Function, transforms raw Airtable records into
                        product objects, and generates product IDs from names.
js/product-service.js   Caches products in the browser for 5 minutes; provides
                        getProducts / getProduct / getProductsByCategory / getCategories.
js/cart.js              The ShoppingCart class (localStorage), cart badge, toast
                        notifications, and PayPal item/amount formatting.

netlify/functions/get-products.js   The ONLY server-side code. Reads the Airtable env vars,
                                    fetches the catalog, returns it. Keeps the key secret.

netlify.toml      Netlify config. REQUIRED — without it, the function will not deploy.
                  Also sets security headers and static-asset caching.

.env.example      Documents the env var names (no real values).
```

**Where common things are configured (so you don't have to hunt):**

| To change… | Edit… |
|---|---|
| Products, prices, photos, availability | **Airtable** (no code) |
| Shipping zones / rates / free-shipping threshold | `cart.html` → `SHIPPING_ZONES` and the rate constants near it |
| PayPal account used for checkout | the `client-id=` in the `<script src>` of **both** `cart.html` and `product.html` |
| Which Airtable base/table is read | Netlify env vars (`AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_NAME`) |
| Caching duration (browser side) | `js/product-service.js` → `cacheDuration` (5 min) |
| Caching duration (server side) | `netlify/functions/get-products.js` → `Cache-Control` header (300s) |

---

## Day-to-day: changing products (no code)

**99% of running this site is done in Airtable, not in code.** The owner-facing version of this
lives in [USER_GUIDE.md](USER_GUIDE.md); the short version:

- **Add a product:** new row in Airtable → fill Name, Price, Description, Categories, upload
  Images (drag to set order), set Details (JSON), check **Available**.
- **Mark something sold:** uncheck **Available**. It disappears from the shop.
- **Change a price / description:** edit the cell.
- **Reorder a product's photos:** drag the attachments in the Images field (first = thumbnail).

**Changes take up to ~5 minutes to appear** because of two caches (browser + function). To see a
change immediately: hard-refresh (Ctrl/Cmd+Shift+R), or trigger a Netlify redeploy.

⚠️ **Renaming a product changes its URL.** Product page links are generated from the name
(`"Holiday Tree Diorama"` → `holiday-tree-diorama`). Rename only when you're okay with old links
breaking.

---

## Deploying code changes & rolling back

**Deploying = pushing to `master`.** Netlify watches the `master` branch and rebuilds
automatically on every push. There is no manual build step (it's a static site).

```bash
git checkout master
git pull
# ...make and test your changes...
git add .
git commit -m "Describe the change"
git push origin master         # Netlify deploys within ~1 minute
```

Work on a branch for anything non-trivial, then merge to `master` when tested. (The current
working branch as of this writing is `feature/shopping-cart`.)

**Verify a deploy:** Netlify dashboard → Deploys → newest should say "Published." Then load the
live site and run the [Health check](#health-check--is-everything-working).

**Roll back instantly (no git needed):** Netlify → Deploys → click a previous good deploy →
**"Publish deploy."** The live site reverts immediately. This is the fastest fix if a change
breaks production.

**Roll back permanently:** `git revert <bad-commit>` then `git push origin master`.

---

## Free-tier limits — the "don't hit a wall" watch list

The site runs entirely on free tiers today. These are the ceilings to keep an eye on. **Verify
current numbers at each provider — they change over time.** This table is a starting point, not a
contract.

| Resource | Free-tier ceiling (approx., verify) | What happens at the limit | Where to check usage |
|---|---|---|---|
| **Netlify Functions** invocations | ~125K / month | Function throttled → catalog stops loading | Netlify → Usage |
| **Netlify bandwidth** | ~100 GB / month | Overage charges or throttling | Netlify → Usage |
| **Netlify Forms** submissions | ~100 / month | Extra contact-form submissions blocked | Netlify → Forms |
| **Airtable records** per base | ~1,000–1,200 (varies by plan) | Can't add new products | Airtable base footer |
| **Airtable API page size** | 100 records per request | ✅ Handled — the function paginates and returns the full catalog | n/a (code behavior) |
| **Airtable attachment storage** | a few GB (varies) | Can't upload more photos | Airtable workspace settings |
| **PayPal** | no monthly cap | per-transaction fee (~2.9% + $0.30) | PayPal dashboard |

> ✅ **The old 100-product ceiling is fixed (2026-06-02).** `get-products.js` now follows
> Airtable's `offset` and returns every page, so the catalog can grow well past 100 products. (It
> stops at a 50-page / ~5,000-record safety cap and logs a warning if it ever hits that — far above
> any realistic catalog size.) The real Airtable limit you'd hit first is the **records-per-base**
> cap of the free plan.

**Realistically**, for a small craft shop these limits are generous and unlikely to bite — the one
to actually watch is **Forms submissions** (if the site gets popular).

---

## Recurring maintenance schedule

A light touch keeps this healthy. Suggested cadence:

**Every month (5 minutes)**
- [ ] Load the live site, click into a product, add to cart, reach the PayPal button. (Quick smoke test — full checklist below.)
- [ ] Submit the Contact form once; confirm the email notification still arrives.
- [ ] Glance at Netlify → Usage (functions + bandwidth) and Forms count.

**Every quarter (15–30 minutes)**
- [ ] Run the full [Health check](#health-check--is-everything-working).
- [ ] Export the Airtable base (Airtable → ... → Download CSV) as a **catalog backup**. Keep the last few.
- [ ] Confirm a real (or sandbox) PayPal transaction still completes end-to-end.
- [ ] Check the PayPal Developer dashboard for any required SDK/integration updates.

**Every year (or on handoff)**
- [ ] **Rotate the Airtable token:** create a new personal access token (scope `data.records:read`,
      access limited to this base) → update `AIRTABLE_API_KEY` in Netlify → redeploy → delete the
      old token. Confirm the site still loads.
- [ ] Review the free-tier limits table above against the providers' *current* published limits.
- [ ] Skim provider changelogs (Netlify Functions runtime, Airtable API, PayPal SDK) for anything deprecated.
- [ ] Re-read this file and update anything that drifted.

**On ownership change**
- [ ] Transfer GitHub, Netlify, Airtable, and PayPal account access.
- [ ] Rotate the Airtable token (above) so old local copies stop working.
- [ ] Update the PayPal client ID in `cart.html` and `product.html` if the PayPal account changes.

---

## Health check — is everything working?

Run this after any deploy, and during quarterly maintenance. It's a manual smoke test (the site
has no automated test suite). Open the **live site** with the browser console open (F12) and watch
for errors.

**Storefront**
- [ ] Home page loads and shows products (not a spinner that never resolves).
- [ ] Product images load (no broken-image icons).
- [ ] Category filter buttons work.
- [ ] Clicking a product opens its detail page; image carousel works for multi-photo products.
- [ ] Clicking a category tag on a product page returns to the shop filtered to that category.

**Cart & checkout**
- [ ] "Add to Cart" adds the item and the nav cart badge increments.
- [ ] Adding the same item twice is prevented (one-of-a-kind rule) and shows an info toast.
- [ ] Cart page lists items; "Remove" works.
- [ ] Entering a ZIP calculates shipping; orders ≥ $75 show free shipping.
- [ ] The PayPal button renders **after** shipping is selected.
- [ ] (Quarterly) A test payment completes and the success modal shows order + shipping details.

**Contact & general**
- [ ] Contact form submits and lands on success.html; the notification email arrives.
- [ ] Mobile (resize to < 768px): hamburger menu opens and Shop/About links work, including on product pages.
- [ ] No red errors in the browser console on any page.

If any item fails, jump to the matching entry in the troubleshooting runbook.

---

## Troubleshooting runbook

Symptom → most likely cause → fix. (Ordered by how often each tends to happen.)

### Site loads but spins forever / "no products"
1. **Netlify Function not deployed.** Confirm `netlify.toml` exists and contains
   `[functions] directory = "netlify/functions"`. In Netlify, the function `get-products` should
   be listed and deployed. Redeploy if missing.
2. **Airtable env vars wrong/missing.** Netlify → env vars must have `AIRTABLE_API_KEY`,
   `AIRTABLE_BASE_ID`, and `AIRTABLE_TABLE_NAME` (the **table ID**, `tbl...`, not "Products").
   Redeploy after changing.
3. **Airtable token expired/revoked.** Function logs show 401. Create a new token, update the env
   var, redeploy.
4. **Airtable is down / slow.** The browser request times out after 10s by design and shows an
   error. There is **no fallback** (intentional). Wait and retry; check Airtable status.

### Changes in Airtable aren't showing
- It's almost always **caching** (browser 5 min + function 5 min). Wait 5 minutes, hard-refresh,
  or trigger a Netlify redeploy to clear the server cache immediately.

### Products beyond ~100 don't appear
- The pagination ceiling was fixed (2026-06-02), so this shouldn't happen. If it recurs, confirm
  `get-products.js` still loops on Airtable's `offset` (it returns `{ records: [...] }` combined
  across pages), and check the function logs for a "Stopped paginating after 50 pages" warning.

### Images missing / broken
- Photo not actually uploaded to that Airtable record, or uploaded to the wrong field. Re-upload
  to the **Images** attachment field. (Don't try to add images via the API — upload in the
  Airtable UI.)

### Images in the wrong order
- Order comes straight from the Airtable Images field. **Drag to reorder there.** Do **not** add
  any sorting in the code — the code intentionally preserves Airtable's order.

### PayPal button doesn't appear
- Check the `client-id=` in the page's PayPal `<script>` (in `cart.html` / `product.html`).
- On the cart page, the button only renders **after a shipping option is selected**.
- Look for SDK load errors in the console.

### Contact form doesn't work
- In Netlify → Forms, form detection must be enabled and the `contact` form should appear.
- The form needs `data-netlify="true"` and `action="/success.html"` (it's in `index.html`).

### Mobile menu won't open on product pages
- `product.html` needs its mobile nav override (`.nav-links { display: flex !important; }` inside
  the `@media (max-width: 768px)` block). Confirm it's present.

### A deploy broke the live site
- Don't debug under pressure on production. **Netlify → Deploys → publish the last good deploy** to
  restore service instantly, then fix on a branch.

---

## Known latent issues & technical debt

Honest list of sharp edges, most useful first. None are on fire today.

1. ~~**Catalog caps at 100 products (pagination).**~~ ✅ **Fixed 2026-06-02.**
   `netlify/functions/get-products.js` now follows Airtable's `offset` and concatenates all pages,
   so the catalog can exceed 100 products. (Safety cap: 50 pages / ~5,000 records, with a logged
   warning if ever exceeded.)

2. **Secrets live in the (gitignored) `claude.md`.**
   Convenient locally, but it means the live Airtable key sits in a plaintext file on the
   maintainer's machine. On any handoff, **rotate the token**. Longer term, consider keeping the
   key only in Netlify and referencing it from there.

3. **`claude.md` is gitignored, so deep notes don't travel with the repo.**
   This `MAINTENANCE.md` is committed specifically to solve that — it's the durable handoff doc. If
   you add important institutional knowledge, put the shareable parts here (committed), not only in
   `claude.md`.

4. **No automated tests.** Verification is the manual checklist above. For a site this size that's
   reasonable; if you want a safety net, a tiny smoke test (load the site, assert the catalog
   endpoint returns products) would catch the most damaging failure — products not loading.

5. **PayPal client ID is duplicated** in `cart.html` and `product.html`. If you switch PayPal
   accounts, update **both**. (A future cleanup could centralize it, e.g. a small shared config
   include, but it's not urgent.)

6. **Two places define "5-minute cache"** (browser + function). If you tune one, consider the
   other so behavior stays predictable.

---

## Roadmap / planned work

Tracked in detail in the owner's local `FUTURE_REQUIREMENTS.md` (not committed). The items the
owner has flagged as wanted:

- **More professional payment landing / checkout experience** — graduate from the current
  in-page PayPal flow toward a more branded, polished checkout and confirmation.
- **Stay within hosting limits** — the watch list above. (The 100-product pagination ceiling that
  used to live here was fixed on 2026-06-02.)
- **Order confirmation emails** (automated) and possibly basic order history.
- **Analytics** (e.g., Google Analytics) to understand traffic and conversions.
- **SEO**: structured data for products, sitemap, richer previews.

Lower priority / nice-to-have: product search, wishlist, related products, sold-date tracking and
an archive of sold pieces.

---

## How to resume this project with Claude

The site was built to be maintainable **with Claude Code doing the heavy lifting**. To pick it
back up cold:

1. **Clone the repo and open it in Claude Code** (or the IDE extension) from this folder.
2. Tell Claude: *"Read MAINTENANCE.md and CLAUDE.md if present, then summarize how this site works
   and what state it's in."*
3. Make sure you have the account access listed in
   [Accounts & secrets](#accounts--secrets--what-you-must-have-access-to). Claude can edit code,
   but only you can grant Netlify/Airtable/PayPal access and set secrets.
4. For product changes, **you don't need Claude or code at all** — use Airtable
   ([USER_GUIDE.md](USER_GUIDE.md)).
5. For code changes: describe the goal, let Claude propose a plan, test on a branch with
   `netlify dev` locally if possible, then merge to `master` to deploy.
6. After any change, run the [Health check](#health-check--is-everything-working).

**Good first asks for Claude**, if you want to harden the project:
- *"Add a tiny smoke test that fails if the catalog endpoint returns zero products."*
- *"Help me rotate the Airtable token and update Netlify."*
- *"Centralize the PayPal client ID so it's not duplicated in cart.html and product.html."*

---

*This runbook is committed to the repository on purpose: it must survive a fresh clone so the next
person — with Claude's help — can keep These Are Small Things running. Keep it current.*
