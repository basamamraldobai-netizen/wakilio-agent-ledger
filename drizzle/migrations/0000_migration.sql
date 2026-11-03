CREATE TABLE public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);
CREATE TABLE public.import_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  imported_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  client_id text NOT NULL,
  file_id uuid NOT NULL REFERENCES public.import_files(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL,
  sheet text NOT NULL DEFAULT '',
  agent_raw text NOT NULL DEFAULT '',
  passport text NOT NULL DEFAULT '',
  receipt text NOT NULL DEFAULT '',
  paid numeric NOT NULL DEFAULT 0,
  remaining numeric NOT NULL DEFAULT 0,
  tx_date text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT '',
  destination text NOT NULL DEFAULT '',
  profession text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, client_id)
);
CREATE INDEX ON public.transactions (user_id, file_id);
CREATE TABLE public.agent_aliases (
  user_id uuid NOT NULL DEFAULT auth.uid(),
  alias text NOT NULL,
  target text NOT NULL,
  PRIMARY KEY (user_id, alias)
);
CREATE TABLE public.dismissed_suggestions (
  user_id uuid NOT NULL DEFAULT auth.uid(),
  key text NOT NULL,
  PRIMARY KEY (user_id, key)
);
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['agents','import_files','transactions','agent_aliases','dismissed_suggestions'] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "own rows" ON public.%I FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)', t);
  END LOOP;
END $$;