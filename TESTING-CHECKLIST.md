# Shoply v1.5.0 Testing Checklist

## 1. Safe upgrade and startup

1. Preserve the existing `data/db.json`, `.env.local` and `public/uploads`.
2. Extract the patch over v1.4, run `VERIFY.bat`, then `START.bat`.
3. Confirm the merchant can log in and existing products, orders, customers and uploads remain present.

Expected: no database or upload file is supplied by the patch. Database backup is not part of v1.5.

## 2. Navigator and shortcuts

1. Open Dashboard → Store Editor → Navigator.
2. Select a container and a nested widget from the tree.
3. Toggle visibility, duplicate and delete an item.
4. Test Ctrl/Cmd+C, Ctrl/Cmd+V, Ctrl/Cmd+D, Delete, Ctrl/Cmd+Z and Ctrl/Cmd+Y.

Expected: selection stays clear, pasted items receive new IDs, and undo/redo restores changes.

## 3. Drag and insertion accuracy

1. Drag a new widget above, between and below existing widgets.
2. Move an existing widget across columns.
3. Move a container using only its drag handle.

Expected: the purple insertion line matches the final location; clicking content never accidentally drags the entire container.

## 4. Reusable templates

1. Select a configured container and choose Save as template.
2. Open Templates and insert it twice.
3. Edit one inserted copy and delete the saved template.

Expected: inserted copies have independent IDs/content; deleting the template does not remove inserted containers.

## 5. Media Library

1. Open an Image widget or container background and select Media Library.
2. Upload JPG, PNG, WEBP and GIF files; search and reuse an asset.
3. Try a file over 5 MB and a renamed non-image file.
4. Try deleting an image currently used by the theme/product, then delete an unused image.

Expected: valid images work, invalid/oversized files are rejected, used media is protected, unused media can be removed.

## 6. Recovery and autosave

1. Make an edit and wait at least five seconds.
2. Refresh or close/reopen the editor.
3. Restore the recovery copy, then test Discard.
4. Close the tab immediately after a fresh unsaved edit.

Expected: a recovery prompt appears after refresh and the browser warns before discarding a new unsaved change.

## 7. Advanced container styling

1. Set a background image, gradient and overlay.
2. Set minimum height, row/column direction, alignment, border, radius, shadow and overflow.
3. Check Desktop, Tablet and Mobile previews.

Expected: editor canvas, Draft Preview and published storefront agree.

## 8. Mobile column order

1. Create a three-column container.
2. Set different Tablet and Mobile order values.
3. Change responsive direction and spacing.

Expected: columns reorder only at the selected breakpoint and retain their desktop order elsewhere.

## 9. Draft/publish regression

1. Save Draft after a visible change.
2. Confirm Draft Preview shows it while the public storefront still shows the prior design.
3. Publish and refresh the public storefront.

Expected: only Publish changes the public design.

## 10. Commerce and security regression

Confirm products, variants, collections, cart, checkout, discounts, orders, customers, wishlist, reviews, CMS pages, contact form and password-reset flows still work. Verify payment proof checkout succeeds only after a proof upload, repeated login/contact/checkout requests are throttled, and demo card payment is unavailable in production.

## Automated release gates

Run:

```text
npm run test:v1.5
npm run verify
```

Expected: zero failures. SMTP may warn when email settings are not configured. A production build can additionally be run with `npm run build` on a normal local Windows terminal.
