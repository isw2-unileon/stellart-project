# Artworks and Interactions Domain

This document outlines the schema for listed artworks and direct catalog interactions like shortlists and likes.

## Tables

### `artworks`
Represents pieces of art published by artists for display or sale.

| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | **PK** (Default: `uuid_generate_v4()`) |
| `artist_id` | `uuid` | **FK** references `profiles(id)` |
| `title` | `text` | NOT NULL |
| `description` | `text` | |
| `image_url` | `text` | NOT NULL |
| `tags` | `text` | |
| `price` | `numeric` | Default: `0` |
| `embedding` | `USER-DEFINED` | Vector representation for AI features/similarity |
| `product_type` | `text` | Category classification |
| `created_at` | `timestamp with time zone` | Default: `now()` |

### `likes`
Tracks user appreciation/likes given to specific artworks.

| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | **PK** (Default: `uuid_generate_v4()`) |
| `profile_id` | `uuid` | **FK** references `profiles(id)`, NOT NULL |
| `artwork_id` | `uuid` | **FK** references `artworks(id)`, NOT NULL |

### `wishlist`
Items saved by users for future consideration or purchase.

| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | **PK** (Default: `uuid_generate_v4()`) |
| `profile_id` | `uuid` | **FK** references `profiles(id)` |
| `artwork_id` | `uuid` | **FK** references `artworks(id)` |
| `created_at` | `timestamp with time zone` | Default: `now()` |