-- 1. ENUMS

-- Moneda en la que el usuario registró la transacción
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'currency_code'
    ) THEN
        CREATE TYPE public.currency_code AS ENUM ('COP', 'USD');
    END IF;
END$$;

-- Tipo de transacción
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'transaction_type'
    ) THEN
        CREATE TYPE public.transaction_type AS ENUM ('income', 'expense');
    END IF;
END$$;


-- 2. PROFILES
-- Tabla para info adicional del usuario autenticado.
-- id = auth.users.id
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    name TEXT,
    default_currency public.currency_code DEFAULT 'COP',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opcional: trigger updated_at si quieres mantenerlo fresco
-- (puedes agregarlo luego con una función que haga updated_at = NOW())



-- 3. CATEGORIES
-- Categorías de gasto/ingreso.
-- user_id = NULL  => categoría global por defecto (plantilla del sistema)
-- user_id = <uuid> => categoría privada de ese usuario

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    emoji TEXT DEFAULT '💸',
    is_default BOOLEAN DEFAULT FALSE,         -- marca si es una categoría global del sistema
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_user_category_name UNIQUE (user_id, name)
);

-- Notas:
-- - unique_user_category_name evita que el mismo usuario cree "Comida" dos veces.
-- - Para las categorías globales que quieras precargar (tipo "Comida 🍔"), inserta filas con user_id = NULL y is_default = TRUE.



-- 4. TRANSACTIONS
-- Movimientos financieros del usuario.
-- Guardamos snapshot en USD para reporting histórico estable.

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,

    category_id UUID REFERENCES public.categories (id) ON DELETE SET NULL,

    title TEXT NOT NULL,
    notes TEXT,                                -- opcional descripción larga

    amount_original NUMERIC(12,2) NOT NULL,    -- monto que escribió el usuario
    currency_code public.currency_code NOT NULL DEFAULT 'COP',

    -- fx_rate_to_usd = cuántos USD vale 1 unidad de currency_code en el momento del registro
    fx_rate_to_usd NUMERIC(12,6) NOT NULL DEFAULT 1.0,

    -- amount_usd = amount_original * fx_rate_to_usd
    amount_usd NUMERIC(12,2) NOT NULL,

    tx_type public.transaction_type NOT NULL,  -- income | expense

    tx_date DATE NOT NULL DEFAULT CURRENT_DATE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices útiles para filtros en dashboard
CREATE INDEX IF NOT EXISTS idx_transactions_user_date
    ON public.transactions (user_id, tx_date);

CREATE INDEX IF NOT EXISTS idx_transactions_user_category
    ON public.transactions (user_id, category_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_type
    ON public.transactions (user_id, tx_type);
