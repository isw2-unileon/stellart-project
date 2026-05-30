# Orders and Payments Domain

This document describes marketplace order fulfillment and transactional billing records for commissions.

## Tables

### `orders`
Marketplace transaction records tracking artwork sales from a seller to a buyer.

| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | **PK** (Default: `uuid_generate_v4()`) |
| `artwork_id` | `uuid` | **FK** references `artworks(id)` |
| `buyer_id` | `uuid` | **FK** references `profiles(id)` |
| `seller_id` | `uuid` | **FK** references `profiles(id)` |
| `shipping_address_id`| `uuid` | **FK** references `shipping_addresses(id)` |
| `amount` | `numeric` | NOT NULL |
| `status` | `USER-DEFINED` | Default: `'pending'` (`order_status` enum) |
| `created_at` | `timestamp with time zone` | Default: `now()` |
| `tracking_code` | `text` | Courier shipment identifier |
| `carrier` | `text` | Courier company name |
| `payment_intent` | `text` | Gateway transaction reference |

### `advance_payments`
Upfront escrow deposits or installment records to lock down a custom commission.

| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | **PK** (Default: `uuid_generate_v4()`) |
| `commission_id` | `uuid` | **FK** references `commissions(id)`, NOT NULL |
| `amount` | `numeric` | NOT NULL |
| `status` | `text` | Default: `'pending'` |
| `payment_intent`| `text` | Gateway transaction reference |
| `created_at` | `timestamp with time zone` | Default: `now()` |
| `paid_at` | `timestamp with time zone` | |

### `remaining_payments`
Final stage milestones or payment closure triggers for completing a custom commission.

| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | **PK** (Default: `uuid_generate_v4()`) |
| `commission_id` | `uuid` | **FK** references `commissions(id)`, NOT NULL |
| `amount` | `numeric` | NOT NULL |
| `status` | `text` | Default: `'pending'` |
| `payment_intent`| `text` | Gateway transaction reference |
| `created_at` | `timestamp with time zone` | Default: `now()` |
| `paid_at` | `timestamp with time zone` | |

### `refunds`
Reversal records detailing payouts sent back to buyers on canceled or disputed jobs.

| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | **PK** (Default: `uuid_generate_v4()`) |
| `commission_id` | `uuid` | **FK** references `commissions(id)`, NOT NULL |
| `amount` | `numeric` | NOT NULL |
| `reason` | `text` | |
| `status` | `text` | Default: `'pending'` |
| `created_at` | `timestamp with time zone` | Default: `now()` |
| `processed_at` | `timestamp with time zone` | |