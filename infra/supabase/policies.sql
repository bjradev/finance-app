-- Activa RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- PROFILES
-- Cada usuario solo puede ver/editar su propio perfil
CREATE POLICY "Select own profile"
ON public.profiles
FOR SELECT
USING ( id = auth.uid() );

CREATE POLICY "Update own profile"
ON public.profiles
FOR UPDATE
USING ( id = auth.uid() );

-- (Si quieres permitir INSERT automático al registrarse vía trigger, lo puedes manejar con una función
-- en Supabase. Normalmente profiles se crea con un trigger en el signup.)


-- CATEGORIES
-- Regla de lectura:
-- - usuario puede ver sus categorías
-- - usuario puede ver categorías globales (user_id IS NULL)

CREATE POLICY "Select categories (own or default)"
ON public.categories
FOR SELECT
USING (
    user_id = auth.uid()
    OR user_id IS NULL
);

-- Regla de inserción:
-- - usuario solo puede insertar categorías con su propio user_id
CREATE POLICY "Insert own categories"
ON public.categories
FOR INSERT
WITH CHECK ( user_id = auth.uid() );

-- Regla de update/delete:
-- - usuario solo puede editar/eliminar las categorías que le pertenecen
CREATE POLICY "Update own categories"
ON public.categories
FOR UPDATE
USING ( user_id = auth.uid() );

CREATE POLICY "Delete own categories"
ON public.categories
FOR DELETE
USING ( user_id = auth.uid() );


-- TRANSACTIONS
-- Lectura: usuario solo puede ver sus transacciones
CREATE POLICY "Select own transactions"
ON public.transactions
FOR SELECT
USING ( user_id = auth.uid() );

-- Inserción: usuario solo puede crear transacciones con su user_id
CREATE POLICY "Insert own transactions"
ON public.transactions
FOR INSERT
WITH CHECK ( user_id = auth.uid() );

-- Update/Delete: usuario solo puede tocar sus transacciones
CREATE POLICY "Update own transactions"
ON public.transactions
FOR UPDATE
USING ( user_id = auth.uid() );

CREATE POLICY "Delete own transactions"
ON public.transactions
FOR DELETE
USING ( user_id = auth.uid() );
