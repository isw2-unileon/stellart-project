# Users and Profiles Domain

This document describes the database models related to user management, profiles, and user skills.

## Tables

### `profiles`
Stores the core public and private profile information for artists and buyers.

| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | **PK** (Default: `uuid_generate_v4()`) |
| `full_name` | `text` | |
| `email` | `text` | **UNIQUE**, NOT NULL |
| `avatar_url` | `text` | |
| `biography` | `text` | |
| `open_commissions` | `boolean` | Default: `false` |
| `created_at` | `timestamp with time zone` | Default: `now()` |
| `updated_at` | `timestamp with time zone` | Default: `now()` |

### `shipping_addresses`
Physical address records used for delivering orders.

| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | **PK** (Default: `uuid_generate_v4()`) |
| `profile_id` | `uuid` | **FK** references `profiles(id)` |
| `street` | `text` | NOT NULL |
| `city` | `text` | NOT NULL |
| `postal_code` | `text` | NOT NULL |
| `country` | `text` | NOT NULL |
| `address_label` | `text` | Optional label |

### `master_skills`
A global registry of skills available within the platform.

| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | **PK** (Default: `uuid_generate_v4()`) |
| `name` | `text` | **UNIQUE**, NOT NULL |

### `profile_skills`
A many-to-many relationship mapping profiles to their specific skills and proficiency levels.

| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | **PK** (Default: `uuid_generate_v4()`) |
| `profile_id` | `uuid` | **FK** references `profiles(id)` |
| `skill_id` | `uuid` | **FK** references `master_skills(id)` |
| `level` | `integer` | Default: `0` |