# Commissions and Workflows Domain

This document contains models handling custom art commission workflows, communication, progression uploads, and review cycles.

## Tables

### `commissions`
Core contract details for custom artwork requests requested by a buyer from an artist.

| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | **PK** (Default: `uuid_generate_v4()`) |
| `buyer_id` | `uuid` | **FK** references `profiles(id)`, NOT NULL |
| `artist_id` | `uuid` | **FK** references `profiles(id)`, NOT NULL |
| `title` | `text` | NOT NULL |
| `description` | `text` | NOT NULL |
| `price` | `numeric` | NOT NULL |
| `status` | `text` | Default: `'pending'` |
| `deadline` | `timestamp with time zone` | |
| `created_at` | `timestamp with time zone` | Default: `now()` |
| `updated_at` | `timestamp with time zone` | Default: `now()` |

### `chat_messages`
In-app direct messaging tied specifically to a commission room context.

| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | **PK** (Default: `uuid_generate_v4()`) |
| `commission_id` | `uuid` | **FK** references `commissions(id)`, NOT NULL |
| `sender_id` | `uuid` | **FK** references `profiles(id)`, NOT NULL |
| `content` | `text` | NOT NULL |
| `created_at` | `timestamp with time zone` | Default: `now()` |
| `read_at` | `timestamp with time zone` | |

### `work_uploads`
Intermediary or final deliverables uploaded by the artist for feedback or completion.

| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | **PK** (Default: `uuid_generate_v4()`) |
| `commission_id` | `uuid` | **FK** references `commissions(id)`, NOT NULL |
| `image_url` | `text` | NOT NULL |
| `watermarked` | `boolean` | Default: `false` |
| `is_final` | `boolean` | Default: `false` |
| `notes` | `text` | |
| `clean_image_url` | `text` | Image URL without watermark |
| `created_at` | `timestamp with time zone` | Default: `now()` |

### `commission_revisions`
Formal modification or feedback requests placed by buyers regarding a specific `work_upload`.

| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | **PK** (Default: `uuid_generate_v4()`) |
| `commission_id` | `uuid` | **FK** references `commissions(id)`, NOT NULL |
| `work_upload_id`| `uuid` | **FK** references `work_uploads(id)`, NOT NULL |
| `request_notes` | `text` | Feedback provided by the buyer |
| `status` | `text` | Default: `'pending'` |
| `response_notes`| `text` | Counter-notes or resolution text from the artist |
| `created_at` | `timestamp with time zone` | Default: `now()` |
| `resolved_at` | `timestamp with time zone` | |