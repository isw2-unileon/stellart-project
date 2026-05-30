# Artist Workflow

## Who is this for

- Artists managing profile, commission intake, and delivery.

## Prerequisites

- Logged-in account.
- Completed profile in `/profile`.
- Open commissions enabled if you want to receive new requests.

## Happy path

1. **Set up profile**
   - Go to `/profile`.
   - Upload avatar, edit bio, and save skills.
2. **Enable commission availability**
   - Go to `/commissions/settings` (or toggle in `/commissions`).
   - Turn on "Open for Commissions".
3. **Publish portfolio**
   - Go to `/profile/upload`.
   - Upload image, add title/details/tags/type, optionally mark on sale.
4. **Handle incoming commission**
   - Open `/commissions`, switch to "As Artist".
   - Open commission detail `/commissions/:id`.
   - If advance payment is paid, accept or deny.
   - After accepting, start work.
5. **Submit previews and revisions**
   - Upload preview(s) in commission detail (watermarked previews).
   - Submit for review.
   - If buyer requests revisions, upload updated preview and submit again.
6. **Complete and deliver final**
   - Once buyer approves and remaining payment is settled, status becomes completed.
   - Upload final clean file (non-watermarked) for buyer download.
7. **Physical order fulfillment (if applicable)**
   - Go to `/orders`, switch to "Sales".
   - Enter carrier + tracking and mark order as shipped.

## Recovery path

- **No commission requests arriving**
  - Ensure open commissions toggle is enabled.
  - Make sure profile and artworks are visible and updated.
- **Cannot accept a pending commission**
  - Buyer may not have completed advance payment yet; wait until payment is marked paid.
- **Preview upload blocked**
  - Check image size and retry; max upload size is 100MB for commission uploads.
- **Artwork publish fails**
  - Verify backend URL/env configuration and retry with valid image metadata.
