/* Cote Supabase du banc de chaos : un VRAI PostgreSQL, les VRAIES migrations.
   ⛔ Aucune reecriture des fonctions : on applique les fichiers de `supabase/migrations/`
      tels quels, et on appelle les RPC comme le Worker les appelle. */
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RACINE = path.resolve(__dirname, '..', '..');
const SOCK = process.env.FT_PGSOCK || '/tmp/pg_s2b';
const PORT = process.env.FT_PGPORT || '55432';
const BIN = '/usr/lib/postgresql/16/bin';

/* ⚠️ `ft_comptes` et `ft_miroir` ne sont PAS versionnees (creees a la main). On les
   reconstruit d'apres la definition MESUREE le 17/09, comme le fait deja
   `tools/test_migrations_s2b.py`. Ce bloc n'est pas une migration. */
const SOCLE = `
do $$ begin
  if not exists (select 1 from pg_roles where rolname='anon')          then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role')  then create role service_role nologin; end if;
end $$;
grant usage on schema public to anon, authenticated, service_role;
create table public.ft_comptes (
  email      text primary key,
  data       jsonb,
  updated_at timestamptz default now()
);
alter table public.ft_comptes enable row level security;
create or replace function public.ft_miroir(p_email text, p_data jsonb)
returns void language plpgsql security definer set search_path to 'public' as $function$
begin
  insert into public.ft_comptes(email, data, updated_at)
  values (lower(trim(p_email)), p_data, now())
  on conflict (email) do update set data = excluded.data, updated_at = now();
end;
$function$;
grant execute on function public.ft_miroir(text, jsonb) to anon, authenticated;
`;

function sql(texte, base) {
  try {
    const out = execFileSync(path.join(BIN, 'psql'),
      ['-h', SOCK, '-p', PORT, '-U', 'postgres', '-d', base || 'postgres',
       '-v', 'ON_ERROR_STOP=1', '-tA', '-c', texte],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { ok: true, sortie: out.trim() };
  } catch (e) {
    return { ok: false, sortie: String((e.stderr || '') + (e.stdout || '')).trim() };
  }
}

function fichier(chemin, base) {
  try {
    execFileSync(path.join(BIN, 'psql'),
      ['-h', SOCK, '-p', PORT, '-U', 'postgres', '-d', base,
       '-v', 'ON_ERROR_STOP=1', '-f', chemin],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { ok: true, sortie: '' };
  } catch (e) {
    return { ok: false, sortie: String((e.stderr || '') + (e.stdout || '')).trim() };
  }
}

function monter(base, dossierMigrations) {
  const MIG = dossierMigrations || path.join(RACINE, 'supabase', 'migrations');
  sql('drop database if exists ' + base, 'postgres');
  let r = sql('create database ' + base, 'postgres');
  if (!r.ok) return r;
  r = sql(SOCLE, base);
  if (!r.ok) return r;
  for (const f of fs.readdirSync(MIG).filter((x) => x.endsWith('.sql')).sort()) {
    r = fichier(path.join(MIG, f), base);
    if (!r.ok) return { ok: false, sortie: f + ' : ' + r.sortie };
  }
  return { ok: true, sortie: '' };
}

const q = (s) => String(s).replace(/'/g, "''");

module.exports = {
  sql,
  monter,
  /** Pose un jeton directement (la pose n'est pas le sujet ici). */
  poserJeton: (base, hache, compte) =>
    sql(`insert into public.ft_jetons(hachage, compte) values ('${q(hache)}','${q(compte)}')
         on conflict (hachage) do nothing`, base),
  revoquer: (base, hache) =>
    sql(`select public.ft_revoquer_jeton('${q(hache)}')`, base),
  /** LA voie moderne : le serveur resout l'identite depuis le hache. */
  enregistrer: (base, hache, obj) =>
    sql(`select public.ft_enregistrer_instantane('${q(hache)}', '${q(JSON.stringify(obj))}'::jsonb)`,
        base),
  /** L'ANCIENNE porte, que V2 laisse ouverte : le navigateur choisit le compte. */
  miroirAncien: (base, email, obj) =>
    sql(`select public.ft_miroir('${q(email)}', '${q(JSON.stringify(obj))}'::jsonb)`, base),
  lireBlob: (base, email) => {
    const r = sql(`select coalesce(data::text,'<<NULL>>') from public.ft_comptes
                   where email='${q(email)}'`, base);
    if (!r.ok || !r.sortie) return null;
    return r.sortie === '<<NULL>>' ? '<<NULL>>' : JSON.parse(r.sortie);
  },
  vider: (base) => sql('delete from public.ft_comptes', base),
};
