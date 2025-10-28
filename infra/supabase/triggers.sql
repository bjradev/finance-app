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
