-- Schéma OpeAgri — version canonique et sûre.
-- Isolation stricte par coopérative : chaque policy RLS compare la
-- cooperative_name de l'utilisateur connecté à celle du créateur de la ligne
-- (created_by), au lieu d'autoriser tout compte authentifié ("using (true)").
-- Voir l'audit de sécurité (Conclusions #2 et #3) : les anciennes versions
-- permissives ont été déplacées vers ARCHIVE_INSECURE_*.sql.txt.
--
-- Si une base existe déjà avec les anciennes policies, ne relancez pas ce
-- fichier tel quel (les "CREATE TABLE" échoueront) : utilisez plutôt
-- supabase_migration_lockdown_rls.sql, qui ne fait que remplacer les policies.

DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.inputs CASCADE;
DROP TABLE IF EXISTS public.harvests CASCADE;
DROP TABLE IF EXISTS public.parcels CASCADE;
DROP TABLE IF EXISTS public.producers CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. Table des profils utilisateurs
CREATE TABLE public.profiles (
    id uuid references auth.users on delete cascade not null primary key,
    role text check (role in ('admin', 'agent')) default 'agent',
    email text,
    full_name text,
    cooperative_name text unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Fonction SECURITY DEFINER pour éviter la récursion RLS : une policy sur
-- "profiles" ne doit jamais interroger "profiles" directement dans sa propre
-- condition, sous peine de récursion silencieuse (voir supabase_fix_rls_recursion.sql).
CREATE OR REPLACE FUNCTION public.get_my_cooperative_name()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT cooperative_name FROM public.profiles WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_my_cooperative_name() TO authenticated;

CREATE POLICY "Lecture profils même coopérative" ON profiles FOR SELECT TO authenticated
    USING (cooperative_name = public.get_my_cooperative_name());

CREATE POLICY "Création profil par l'utilisateur" ON profiles FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Modification propre profil" ON profiles FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Empêche un utilisateur de modifier son propre rôle (auto-promotion admin),
-- que la policy UPDATE ci-dessus ne bloque pas à elle seule (elle vérifie
-- seulement "c'est ma ligne", pas "je ne touche pas à mon rôle").
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Vous ne pouvez pas modifier votre propre rôle.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_role_self_escalation_trigger ON public.profiles;
CREATE TRIGGER prevent_role_self_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_self_escalation();

-- 2. Table des producteurs
CREATE TABLE public.producers (
    id uuid default gen_random_uuid() primary key,
    first_name text not null,
    last_name text not null,
    village text,
    cooperative text,
    phone text CONSTRAINT check_phone_format CHECK (phone ~ '^\+?[0-9\s\-]{8,20}$'),
    area_ha numeric default 0 CONSTRAINT check_area_positive CHECK (area_ha >= 0),
    status text check (status in ('Actif', 'Suspendu')) default 'Actif',
    created_by uuid default auth.uid() references auth.users(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.producers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture producteurs coopérative" ON producers FOR SELECT TO authenticated
    USING (
      (SELECT cooperative_name FROM public.profiles WHERE id = auth.uid()) =
      (SELECT cooperative_name FROM public.profiles WHERE id = created_by)
    );

CREATE POLICY "Insertion producteurs coopérative" ON producers FOR INSERT TO authenticated
    WITH CHECK (
      (SELECT cooperative_name FROM public.profiles WHERE id = auth.uid()) =
      (SELECT cooperative_name FROM public.profiles WHERE id = created_by)
    );

CREATE POLICY "Modification producteurs coopérative" ON producers FOR UPDATE TO authenticated
    USING (
      (SELECT cooperative_name FROM public.profiles WHERE id = auth.uid()) =
      (SELECT cooperative_name FROM public.profiles WHERE id = created_by)
    )
    WITH CHECK (
      (SELECT cooperative_name FROM public.profiles WHERE id = auth.uid()) =
      (SELECT cooperative_name FROM public.profiles WHERE id = created_by)
    );

CREATE POLICY "Suppression producteurs coopérative" ON producers FOR DELETE TO authenticated
    USING (
      (SELECT cooperative_name FROM public.profiles WHERE id = auth.uid()) =
      (SELECT cooperative_name FROM public.profiles WHERE id = created_by)
    );

-- 3. Table des parcelles
CREATE TABLE public.parcels (
    id uuid default gen_random_uuid() primary key,
    producer_id uuid references public.producers(id) on delete cascade,
    crop text,
    area_ha numeric default 0 CONSTRAINT check_parcel_area_positive CHECK (area_ha >= 0),
    village text,
    coordinates text,
    status text check (status in ('Cartographiée', 'En attente')) default 'En attente',
    created_by uuid default auth.uid() references auth.users(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture parcelles coopérative" ON parcels FOR SELECT TO authenticated
    USING (
      (SELECT cooperative_name FROM public.profiles WHERE id = auth.uid()) =
      (SELECT cooperative_name FROM public.profiles WHERE id = created_by)
    );

CREATE POLICY "Insertion parcelles coopérative" ON parcels FOR INSERT TO authenticated
    WITH CHECK (
      (SELECT cooperative_name FROM public.profiles WHERE id = auth.uid()) =
      (SELECT cooperative_name FROM public.profiles WHERE id = created_by)
    );

CREATE POLICY "Modification parcelles coopérative" ON parcels FOR UPDATE TO authenticated
    USING (
      (SELECT cooperative_name FROM public.profiles WHERE id = auth.uid()) =
      (SELECT cooperative_name FROM public.profiles WHERE id = created_by)
    )
    WITH CHECK (
      (SELECT cooperative_name FROM public.profiles WHERE id = auth.uid()) =
      (SELECT cooperative_name FROM public.profiles WHERE id = created_by)
    );

CREATE POLICY "Suppression parcelles coopérative" ON parcels FOR DELETE TO authenticated
    USING (
      (SELECT cooperative_name FROM public.profiles WHERE id = auth.uid()) =
      (SELECT cooperative_name FROM public.profiles WHERE id = created_by)
    );

-- 4. Table des récoltes/collectes
CREATE TABLE public.harvests (
    id uuid default gen_random_uuid() primary key,
    parcel_id uuid references public.parcels(id) on delete set null,
    quantity_kg numeric default 0 CONSTRAINT check_quantity_positive CHECK (quantity_kg >= 0),
    quality text check (quality in ('A', 'B', 'C')) default 'A',
    date date default (timezone('utc'::text, now()))::date,
    status text check (status in ('Pesée validée', 'Payé', 'En attente paiement')) default 'Pesée validée',
    created_by uuid default auth.uid() references auth.users(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.harvests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture récoltes coopérative" ON harvests FOR SELECT TO authenticated
    USING (
      (SELECT cooperative_name FROM public.profiles WHERE id = auth.uid()) =
      (SELECT cooperative_name FROM public.profiles WHERE id = created_by)
    );

CREATE POLICY "Insertion récoltes coopérative" ON harvests FOR INSERT TO authenticated
    WITH CHECK (
      (SELECT cooperative_name FROM public.profiles WHERE id = auth.uid()) =
      (SELECT cooperative_name FROM public.profiles WHERE id = created_by)
    );

CREATE POLICY "Modification récoltes coopérative" ON harvests FOR UPDATE TO authenticated
    USING (
      (SELECT cooperative_name FROM public.profiles WHERE id = auth.uid()) =
      (SELECT cooperative_name FROM public.profiles WHERE id = created_by)
    )
    WITH CHECK (
      (SELECT cooperative_name FROM public.profiles WHERE id = auth.uid()) =
      (SELECT cooperative_name FROM public.profiles WHERE id = created_by)
    );

CREATE POLICY "Suppression récoltes coopérative" ON harvests FOR DELETE TO authenticated
    USING (
      (SELECT cooperative_name FROM public.profiles WHERE id = auth.uid()) =
      (SELECT cooperative_name FROM public.profiles WHERE id = created_by)
    );

-- 5. Table des distributions d'intrants
CREATE TABLE public.inputs (
    id uuid default gen_random_uuid() primary key,
    producer text,
    village text,
    product text not null,
    quantity numeric default 0 CONSTRAINT check_input_quantity_positive CHECK (quantity >= 0),
    amount numeric CONSTRAINT check_input_amount_positive CHECK (amount >= 0),
    type text default 'Distribution',
    status text check (status in ('Remboursé', 'Partiel', 'En attente')) default 'En attente',
    date timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid default auth.uid() references auth.users(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.inputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture inputs coopérative" ON inputs FOR SELECT TO authenticated
    USING (
      (SELECT cooperative_name FROM public.profiles WHERE id = auth.uid()) =
      (SELECT cooperative_name FROM public.profiles WHERE id = created_by)
    );

CREATE POLICY "Insertion inputs coopérative" ON inputs FOR INSERT TO authenticated
    WITH CHECK (
      (SELECT cooperative_name FROM public.profiles WHERE id = auth.uid()) =
      (SELECT cooperative_name FROM public.profiles WHERE id = created_by)
    );

CREATE POLICY "Modification inputs coopérative" ON inputs FOR UPDATE TO authenticated
    USING (
      (SELECT cooperative_name FROM public.profiles WHERE id = auth.uid()) =
      (SELECT cooperative_name FROM public.profiles WHERE id = created_by)
    )
    WITH CHECK (
      (SELECT cooperative_name FROM public.profiles WHERE id = auth.uid()) =
      (SELECT cooperative_name FROM public.profiles WHERE id = created_by)
    );

CREATE POLICY "Suppression inputs coopérative" ON inputs FOR DELETE TO authenticated
    USING (
      (SELECT cooperative_name FROM public.profiles WHERE id = auth.uid()) =
      (SELECT cooperative_name FROM public.profiles WHERE id = created_by)
    );

-- 6. Table de l'inventaire des stocks
CREATE TABLE public.inventory (
    id uuid default gen_random_uuid() primary key,
    product text not null,
    type text check (type in ('Engrais', 'Semences', 'Pesticides', 'Matériel')),
    quantity numeric default 0 CONSTRAINT check_inv_quantity_positive CHECK (quantity >= 0),
    unit text,
    status text check (status in ('En stock', 'Stock faible', 'Rupture', 'Critique')) default 'En stock',
    last_restock date,
    created_by uuid default auth.uid() references auth.users(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture inventaire coopérative" ON inventory FOR SELECT TO authenticated
    USING (
      (SELECT cooperative_name FROM public.profiles WHERE id = auth.uid()) =
      (SELECT cooperative_name FROM public.profiles WHERE id = created_by)
    );

CREATE POLICY "Modification inventaire par admin" ON inventory FOR ALL TO authenticated
    USING (
      (SELECT cooperative_name FROM public.profiles WHERE id = auth.uid()) =
      (SELECT cooperative_name FROM public.profiles WHERE id = created_by)
      AND
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    )
    WITH CHECK (
      (SELECT cooperative_name FROM public.profiles WHERE id = auth.uid()) =
      (SELECT cooperative_name FROM public.profiles WHERE id = created_by)
      AND
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- 7. Table des campagnes agricoles
CREATE TABLE public.campaigns (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    start_date date,
    end_date date,
    status text check (status in ('En cours', 'Planifiée', 'Terminée')) default 'Planifiée',
    budget numeric default 0 CONSTRAINT check_budget_positive CHECK (budget >= 0),
    created_by uuid default auth.uid() references auth.users(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture campagnes coopérative" ON campaigns FOR SELECT TO authenticated
    USING (
      (SELECT cooperative_name FROM public.profiles WHERE id = auth.uid()) =
      (SELECT cooperative_name FROM public.profiles WHERE id = created_by)
    );

CREATE POLICY "Modification campagnes par admin" ON campaigns FOR ALL TO authenticated
    USING (
      (SELECT cooperative_name FROM public.profiles WHERE id = auth.uid()) =
      (SELECT cooperative_name FROM public.profiles WHERE id = created_by)
      AND
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    )
    WITH CHECK (
      (SELECT cooperative_name FROM public.profiles WHERE id = auth.uid()) =
      (SELECT cooperative_name FROM public.profiles WHERE id = created_by)
      AND
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );
