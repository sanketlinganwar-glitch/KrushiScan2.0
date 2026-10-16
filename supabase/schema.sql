-- ==============================================================================
-- KrushiScan AI - PostgreSQL Database Schema & Security Policies (Supabase)
-- Target Region: Vidarbha, Maharashtra (Cotton, Soybean, Tur Farming Ecosystem)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Farmers, Experts, Retailers, Admins)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'expert', 'retailer', 'admin')),
    language TEXT NOT NULL DEFAULT 'mr' CHECK (language IN ('mr', 'hi', 'en')),
    district TEXT DEFAULT 'Yavatmal',
    village TEXT,
    farm_size_acres NUMERIC(6, 2) DEFAULT 5.0,
    active_crops TEXT[] DEFAULT ARRAY['कापूस (Cotton)', 'सोयाबीन (Soybean)', 'तूर (Pigeonpea)'],
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CROPS & PLOTS
CREATE TABLE IF NOT EXISTS public.crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    variety TEXT,
    area_acres NUMERIC(5, 2) NOT NULL,
    plot_name TEXT NOT NULL,
    sowing_date DATE,
    soil_type TEXT DEFAULT 'black_cotton',
    irrigation_type TEXT DEFAULT 'drip',
    stage TEXT DEFAULT 'vegetative',
    health_status TEXT DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'attention', 'critical', 'recovering')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CROP SCANS & AI DIAGNOSES
CREATE TABLE IF NOT EXISTS public.crop_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
    crop_name TEXT NOT NULL,
    crop_variety TEXT,
    image_url TEXT NOT NULL,
    disease_name TEXT NOT NULL,
    local_disease_name JSONB NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('Low', 'Moderate', 'High', 'Critical')),
    confidence NUMERIC(5, 2) NOT NULL,
    diagnosis_explanation TEXT NOT NULL,
    symptoms TEXT[] DEFAULT ARRAY[]::TEXT[],
    recommended_treatments JSONB NOT NULL,
    prevention_methods TEXT[] DEFAULT ARRAY[]::TEXT[],
    follow_up_plan TEXT,
    scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RECOVERY TRACKER RECORDS
CREATE TABLE IF NOT EXISTS public.recovery_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scan_id UUID REFERENCES public.crop_scans(id) ON DELETE CASCADE,
    crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
    crop_name TEXT NOT NULL,
    original_disease TEXT NOT NULL,
    initial_severity TEXT NOT NULL,
    current_status TEXT NOT NULL CHECK (current_status IN ('improving', 'stable', 'deteriorating', 'recovered')),
    treatment_applied TEXT NOT NULL,
    start_date DATE DEFAULT CURRENT_DATE,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    initial_image_url TEXT NOT NULL,
    latest_image_url TEXT,
    observations TEXT[] DEFAULT ARRAY[]::TEXT[],
    timeline JSONB DEFAULT '[]'::JSONB
);

-- 5. MANDI PRICE RECORDS (Agmarknet cache)
CREATE TABLE IF NOT EXISTS public.mandi_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commodity TEXT NOT NULL,
    variety TEXT NOT NULL,
    state TEXT DEFAULT 'Maharashtra',
    district TEXT NOT NULL,
    market_name TEXT NOT NULL,
    min_price NUMERIC(10, 2) NOT NULL,
    max_price NUMERIC(10, 2) NOT NULL,
    modal_price NUMERIC(10, 2) NOT NULL,
    arrivals_tonnes NUMERIC(10, 2),
    msp NUMERIC(10, 2),
    arrival_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PRODUCTS & AGRI STORE CATALOG
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_local JSONB NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('seeds', 'bio', 'protection', 'fertilizer', 'tools')),
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    rating NUMERIC(3, 2) DEFAULT 4.5,
    reviews_count INT DEFAULT 0,
    image_url TEXT NOT NULL,
    description TEXT NOT NULL,
    target_crops TEXT[] DEFAULT ARRAY[]::TEXT[],
    dosage_or_usage TEXT NOT NULL,
    is_verified_seller BOOLEAN DEFAULT TRUE,
    seller_name TEXT NOT NULL,
    in_stock BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subtotal NUMERIC(10, 2) NOT NULL,
    delivery_charge NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    shipping_address JSONB NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('kcc', 'upi', 'cod')),
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('placed', 'confirmed', 'shipped', 'delivered')),
    items JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EXPERT INQUIRIES
CREATE TABLE IF NOT EXISTS public.expert_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    issue_category TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    expert_response JSONB,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. USER BOOKMARKS
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    article_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, article_id)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandi_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile; admins can view all
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Crops: Farmers can manage only their own crops
CREATE POLICY "Users can CRUD own crops" 
    ON public.crops FOR ALL 
    USING (auth.uid() = user_id);

-- Scans: Farmers can view and create their own scans
CREATE POLICY "Users can CRUD own scans" 
    ON public.crop_scans FOR ALL 
    USING (auth.uid() = user_id);

-- Recovery records
CREATE POLICY "Users can CRUD own recovery" 
    ON public.recovery_records FOR ALL 
    USING (auth.uid() = user_id);

-- Mandi prices & Products: Public read access
CREATE POLICY "Public read mandi prices" 
    ON public.mandi_prices FOR SELECT 
    TO public USING (true);

CREATE POLICY "Public read products" 
    ON public.products FOR SELECT 
    TO public USING (true);

-- Orders: Users view only their own orders
CREATE POLICY "Users view own orders" 
    ON public.orders FOR ALL 
    USING (auth.uid() = user_id);

-- Expert inquiries: Users view own; experts view all
CREATE POLICY "Users and experts manage inquiries" 
    ON public.expert_inquiries FOR ALL 
    USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('expert', 'admin'))
    );

-- User Bookmarks
CREATE POLICY "Users manage own bookmarks" 
    ON public.user_bookmarks FOR ALL 
    USING (auth.uid() = user_id);
