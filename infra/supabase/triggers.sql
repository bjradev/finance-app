-- Crea la función que insertará automáticamente el profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    name,
    default_currency,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,                                -- mismo id que auth.users
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), -- intenta usar nombre del signup, si no el email
    'COP',                                 -- valor por defecto que tú definiste
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atamos la función a los inserts en auth.users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Crea las categorías iniciales para el usuario recién creado
CREATE OR REPLACE FUNCTION public.handle_new_profile_categories()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertamos categorías iniciales para este usuario.
  -- NEW.id es el id del perfil recién creado (igual al id del usuario en auth.users)

  INSERT INTO public.categories (user_id, name, emoji, is_default, created_at, updated_at)
  VALUES
    (NEW.id, 'Comida',          '🍔', FALSE, NOW(), NOW()),
    (NEW.id, 'Transporte',      '🚕', FALSE, NOW(), NOW()),
    (NEW.id, 'Vivienda',        '🏠', FALSE, NOW(), NOW()),
    (NEW.id, 'Entretenimiento', '🎮', FALSE, NOW(), NOW()),
    (NEW.id, 'Salud',           '💊', FALSE, NOW(), NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_seed_categories
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_profile_categories();
