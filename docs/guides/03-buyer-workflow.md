# Buyer Workflow

## Who is this for

- Buyers requesting custom commissions and purchasing artworks.

## Prerequisites

- Logged-in account.
- At least one shipping address saved in `/shipping` for physical orders.

## Happy path

1. **Register and log in**
   - Create account at `/register`.
   - Verify your email if prompted.
   - Log in at `/login`.
2. **Find an artist**
   - Go to `/commissions/find`.
   - Open artist profile and start request at `/commission/start/:artistId`.
3. **Create commission request**
   - Fill title, description, budget, and optional deadline.
   - Confirm and pay 50% advance.
4. **Track commission**
   - Open `/commissions` and select "As Buyer".
   - Enter `/commissions/:id` to monitor status and chat with artist.
5. **Review delivery previews**
   - In `review` status, inspect previews and notes.
   - Choose:
     - Approve (pays remaining 50% if needed), or
     - Request revision with clear notes.
6. **Receive final work**
   - After completion, download final clean file from commission detail.
7. **Manage order shipping**
   - In `/orders` under "Purchases", track shipment.
   - Confirm delivery when received.

## Recovery path

- **Cannot start commission**
  - You may be trying to commission your own account, or artist profile is unavailable.
- **Payment action required before approval**
  - If advance/remaining payment is missing, complete payment modal first.
- **No shipping destination available**
  - Add/edit an address in `/shipping`, then retry order flow.
- **Commission appears stuck**
  - Use chat in `/commissions/:id` to request status update and next action.
