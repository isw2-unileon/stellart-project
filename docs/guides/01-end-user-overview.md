# End-user Overview

## Who is this for

- Buyers and artists using Stellart through the web app.

## Roles

- Buyer: requests commissions, pays advance and remaining amounts, tracks orders.
- Artist: publishes artworks, opens commissions, uploads previews/final files, ships sold works.

## Main navigation map

- Public:
  - `/` landing
  - `/explore` discover artworks
  - `/artwork-details/:id` artwork detail
  - `/profile/:id` artist profile
  - `/contact` support form
- Auth:
  - `/register`
  - `/login`
- User account:
  - `/profile` own profile
  - `/profile/upload` upload artwork
  - `/wishlist`
  - `/shipping`
  - `/orders`
- Commissions:
  - `/commissions`
  - `/commissions/find`
  - `/commissions/settings`
  - `/commission/start/:artistId`
  - `/commissions/:id`

## Core product flows

1. Register and verify email, then log in.
2. Buyers find artists and request commissions.
3. Artists accept/start work and upload previews.
4. Buyers request revisions or approve and pay remaining amount.
5. Artists upload final file after completion.
6. Buyers and artists manage physical order shipment and delivery confirmation.

## Recovery path

- Not logged in: protected pages redirect to `/login`.
- Cannot find an artist for commissions: verify artist has "open commissions" enabled.
- Missing purchase delivery details: add at least one address in `/shipping` before checkout flow.
