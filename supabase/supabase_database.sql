-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.advance_payments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  commission_id uuid NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  payment_intent text,
  created_at timestamp with time zone DEFAULT now(),
  paid_at timestamp with time zone,
  CONSTRAINT advance_payments_pkey PRIMARY KEY (id),
  CONSTRAINT advance_payments_commission_id_fkey FOREIGN KEY (commission_id) REFERENCES public.commissions(id)
);
CREATE TABLE public.artworks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  artist_id uuid,
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  tags text,
  price numeric DEFAULT 0,
  embedding USER-DEFINED,
  product_type text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT artworks_pkey PRIMARY KEY (id),
  CONSTRAINT artworks_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  commission_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  read_at timestamp with time zone,
  CONSTRAINT chat_messages_pkey PRIMARY KEY (id),
  CONSTRAINT chat_messages_commission_id_fkey FOREIGN KEY (commission_id) REFERENCES public.commissions(id),
  CONSTRAINT chat_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.commission_revisions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  commission_id uuid NOT NULL,
  work_upload_id uuid NOT NULL,
  request_notes text,
  status text NOT NULL DEFAULT 'pending'::text,
  response_notes text,
  created_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone,
  CONSTRAINT commission_revisions_pkey PRIMARY KEY (id),
  CONSTRAINT commission_revisions_commission_id_fkey FOREIGN KEY (commission_id) REFERENCES public.commissions(id),
  CONSTRAINT commission_revisions_work_upload_id_fkey FOREIGN KEY (work_upload_id) REFERENCES public.work_uploads(id)
);
CREATE TABLE public.commissions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  buyer_id uuid NOT NULL,
  artist_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  deadline timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT commissions_pkey PRIMARY KEY (id),
  CONSTRAINT commissions_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.profiles(id),
  CONSTRAINT commissions_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.likes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  profile_id uuid NOT NULL,
  artwork_id uuid NOT NULL,
  CONSTRAINT likes_pkey PRIMARY KEY (id),
  CONSTRAINT likes_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT likes_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id)
);
CREATE TABLE public.master_skills (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  CONSTRAINT master_skills_pkey PRIMARY KEY (id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  artwork_id uuid,
  buyer_id uuid,
  seller_id uuid,
  shipping_address_id uuid,
  amount numeric NOT NULL,
  status USER-DEFINED DEFAULT 'pending'::order_status,
  created_at timestamp with time zone DEFAULT now(),
  tracking_code text,
  carrier text,
  payment_intent text,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id),
  CONSTRAINT orders_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.profiles(id),
  CONSTRAINT orders_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.profiles(id),
  CONSTRAINT orders_shipping_address_id_fkey FOREIGN KEY (shipping_address_id) REFERENCES public.shipping_addresses(id)
);
CREATE TABLE public.profile_skills (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  profile_id uuid,
  skill_id uuid,
  level integer DEFAULT 0,
  CONSTRAINT profile_skills_pkey PRIMARY KEY (id),
  CONSTRAINT profile_skills_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT profile_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.master_skills(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  full_name text,
  email text NOT NULL UNIQUE,
  avatar_url text,
  biography text,
  open_commissions boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.refunds (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  commission_id uuid NOT NULL,
  amount numeric NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone,
  CONSTRAINT refunds_pkey PRIMARY KEY (id),
  CONSTRAINT refunds_commission_id_fkey FOREIGN KEY (commission_id) REFERENCES public.commissions(id)
);
CREATE TABLE public.remaining_payments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  commission_id uuid NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  payment_intent text,
  created_at timestamp with time zone DEFAULT now(),
  paid_at timestamp with time zone,
  CONSTRAINT remaining_payments_pkey PRIMARY KEY (id),
  CONSTRAINT remaining_payments_commission_id_fkey FOREIGN KEY (commission_id) REFERENCES public.commissions(id)
);
CREATE TABLE public.shipping_addresses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  profile_id uuid,
  street text NOT NULL,
  city text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL,
  address_label text,
  CONSTRAINT shipping_addresses_pkey PRIMARY KEY (id),
  CONSTRAINT shipping_addresses_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.wishlist (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  profile_id uuid,
  artwork_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT wishlist_pkey PRIMARY KEY (id),
  CONSTRAINT wishlist_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT wishlist_artwork_id_fkey FOREIGN KEY (artwork_id) REFERENCES public.artworks(id)
);
CREATE TABLE public.work_uploads (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  commission_id uuid NOT NULL,
  image_url text NOT NULL,
  watermarked boolean DEFAULT false,
  is_final boolean DEFAULT false,
  notes text,
  clean_image_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT work_uploads_pkey PRIMARY KEY (id),
  CONSTRAINT work_uploads_commission_id_fkey FOREIGN KEY (commission_id) REFERENCES public.commissions(id)
);