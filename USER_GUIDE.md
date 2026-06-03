# Owner's Guide — Managing Your Shop

**For:** the shop owner (no coding needed)
**Last updated:** 2026-06-02

Your website shows your products automatically from **Airtable** — think of it as a friendly
spreadsheet for your shop. You add and edit everything there, and the website updates itself.
**You never have to touch any code or re-upload the website.**

> Looking for the technical/maintenance details (hosting, deploys, troubleshooting)? That's in
> [MAINTENANCE.md](MAINTENANCE.md). This guide is just the everyday stuff.

---

## The one thing to remember

**Everything about your products lives in Airtable.** Open your Airtable base ("These Are Small
Things – Products"), make your change, and it shows up on the website within about **5 minutes**.

That's it. No files, no zip, no uploading the site.

---

## How to manage your products

Each row in Airtable is one product. Here are the everyday tasks.

### Mark something as SOLD
1. Open the product's row in Airtable.
2. **Uncheck** the **Available** box.
3. Done — it disappears from the shop within ~5 minutes.

(You're not deleting it. Leaving the row there keeps your record of the piece. To bring something
back, just check **Available** again.)

### Add a new product
1. Add a new row in Airtable.
2. Fill in:
   - **Name** — the product's name (this also becomes its web address, so pick the final name).
   - **Price** — just the number (e.g. `85`), no dollar sign.
   - **Description** — the full description shoppers will read.
   - **Categories** — pick one or more (e.g. "Dioramas", "Holiday"). Type a new one to create it.
   - **Images** — drag your photos in. **The first photo is the main thumbnail.** Drag to reorder.
   - **Details** — optional extra info in a specific format (see "Filling in Details" below).
   - **Available** — check the box so it shows in the shop.
3. Save. It appears on the site within ~5 minutes.

### Change a price or description
- Just edit the cell in Airtable. That's the whole task.

### Add or reorder a product's photos
- Open the row, drag photos into the **Images** field, and **drag them into the order you want.**
  The first one is the thumbnail. The website shows a photo carousel automatically when there's
  more than one.

### Reorder photos the right way
The website shows photos in **exactly the order they appear in Airtable.** If a photo is in the
wrong spot, drag it in Airtable — don't worry about file names. (File names don't matter at all.)

---

## Filling in "Details"

The **Details** field holds extra specs (materials, size, etc.). It has to be written in a simple
structured format called JSON. The easiest approach: copy this template and change the words.

```json
{
  "Handmade": "Yes, one-of-a-kind",
  "Type": "Diorama",
  "Dimensions": "Approximately 6\" x 8\"",
  "Ready to display": "Yes"
}
```

Rules that keep it from breaking:
- Keep the curly braces `{ }`.
- Each line is `"Label": "Value",` with a comma after every line **except the last**.
- Use straight quotes `"` (not curly “smart quotes”).
- If a value itself needs a quote (like inches), write it as `\"` — see the Dimensions line above.

If a product's details ever look wrong on the site, the Details JSON probably has a typo. Paste it
into https://jsonlint.com to find the mistake, or just simplify it.

---

## Good to know

- **Changes take up to ~5 minutes** to appear (the site briefly remembers the old version to stay
  fast). To see a change right away, refresh the page with **Ctrl+Shift+R** (Windows) or
  **Cmd+Shift+R** (Mac).
- **Renaming a product changes its web link.** If you've shared a direct link to a product and then
  rename it, the old link stops working. Renaming is fine — just know that.
- **Categories are automatic.** Any category you use in Airtable becomes a filter button on the
  shop page. No setup needed.
- **You can't oversell a one-of-a-kind piece.** The cart won't let a shopper add the same item
  twice, and quantity is always 1.

---

## When something looks wrong

| What you see | Try this |
|---|---|
| A change isn't showing up | Wait 5 minutes, then hard-refresh (Ctrl/Cmd+Shift+R). |
| A photo is missing | Make sure it's actually uploaded in that row's **Images** field. |
| Photos in the wrong order | Drag them into order in the Airtable **Images** field. |
| Product details look garbled | The **Details** JSON has a typo — check it at jsonlint.com. |
| The whole shop won't load | This is a technical issue — see [MAINTENANCE.md](MAINTENANCE.md) or ask Claude Code to help (point it at that file). |

---

## Backing up your catalog

Once in a while (a quarterly habit is plenty), make a backup of your products:

1. In Airtable, open the Products table.
2. Use the **"..."** menu → **Download CSV**.
3. Save the file somewhere safe. Keep the last few.

That's your safety net if anything ever happens to the Airtable base.

---

*That's everything for day-to-day running of the shop. For anything technical, the
[MAINTENANCE.md](MAINTENANCE.md) runbook (and Claude Code) has you covered.*
