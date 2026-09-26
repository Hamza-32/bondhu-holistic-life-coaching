/**
 * Generates src/lib/database.types.ts from the local migrations, without Docker or a hosted
 * project: the migrations run in PGlite and the `public` schema is introspected.
 *
 * The output follows the shape of `supabase gen types typescript`, so it can be swapped for the
 * official output at any time (`npm run db:types` once the project is linked).
 *
 * Usage: node --experimental-strip-types scripts/gen-db-types.ts
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { createDb } from '../supabase/tests/db.ts';

const OUT = path.resolve(import.meta.dirname, '..', 'src', 'lib', 'database.types.ts');

const SCALARS: Record<string, string> = {
  uuid: 'string',
  text: 'string',
  varchar: 'string',
  bpchar: 'string',
  citext: 'string',
  date: 'string',
  time: 'string',
  timetz: 'string',
  timestamp: 'string',
  timestamptz: 'string',
  interval: 'string',
  int2: 'number',
  int4: 'number',
  int8: 'number',
  float4: 'number',
  float8: 'number',
  numeric: 'number',
  bool: 'boolean',
  json: 'Json',
  jsonb: 'Json',
  void: 'undefined',
};

function tsType(udt: string): string {
  if (udt.startsWith('_')) return `${tsType(udt.slice(1))}[]`;
  return SCALARS[udt] ?? 'unknown';
}

const quote = (s: string) => (/^[a-z_][a-z0-9_]*$/.test(s) ? s : JSON.stringify(s));

interface Column {
  table_name: string;
  column_name: string;
  udt_name: string;
  is_nullable: 'YES' | 'NO';
  column_default: string | null;
  is_identity: 'YES' | 'NO';
  is_generated: 'ALWAYS' | 'NEVER';
}

interface ForeignKey {
  constraint_name: string;
  table_name: string;
  columns: string[];
  referenced_table: string;
  referenced_columns: string[];
  one_to_one: boolean;
}

interface Fn {
  name: string;
  arg_names: string[] | null;
  arg_types: string[];
  arg_modes: string[] | null;
  n_defaults: number;
  ret_type: string;
  ret_set: boolean;
  ret_is_table_type: boolean;
}

const db = await createDb();

const tables = (
  await db.query<{ table_name: string }>(
    `select table_name from information_schema.tables
     where table_schema = 'public' and table_type = 'BASE TABLE' order by table_name`,
  )
).rows.map((r) => r.table_name);

const columns = (
  await db.query<Column>(
    `select table_name, column_name, udt_name, is_nullable, column_default, is_identity, is_generated
     from information_schema.columns where table_schema = 'public' order by table_name, ordinal_position`,
  )
).rows;

const foreignKeys = (
  await db.query<ForeignKey>(
    `select c.conname as constraint_name,
            rel.relname as table_name,
            array(select a.attname from unnest(c.conkey) k join pg_attribute a on a.attrelid = c.conrelid and a.attnum = k) as columns,
            frel.relname as referenced_table,
            array(select a.attname from unnest(c.confkey) k join pg_attribute a on a.attrelid = c.confrelid and a.attnum = k) as referenced_columns,
            exists (
              select 1 from pg_index i
              where i.indrelid = c.conrelid and i.indisunique and i.indkey::int2[] @> c.conkey and array_length(i.indkey::int2[], 1) = array_length(c.conkey, 1)
            ) as one_to_one
     from pg_constraint c
     join pg_class rel on rel.oid = c.conrelid
     join pg_namespace n on n.oid = rel.relnamespace
     join pg_class frel on frel.oid = c.confrelid
     join pg_namespace fn on fn.oid = frel.relnamespace
     where c.contype = 'f' and n.nspname = 'public' and fn.nspname = 'public'
     order by rel.relname, c.conname`,
  )
).rows;

const functions = (
  await db.query<Fn>(
    `select p.proname as name,
            p.proargnames as arg_names,
            array(select t.typname from unnest(coalesce(p.proallargtypes, p.proargtypes::oid[])) with ordinality u(oid, i) join pg_type t on t.oid = u.oid order by u.i) as arg_types,
            p.proargmodes::text[] as arg_modes,
            p.pronargdefaults as n_defaults,
            rt.typname as ret_type,
            p.proretset as ret_set,
            (rt.typtype = 'c' and exists (select 1 from pg_class c where c.oid = rt.typrelid and c.relkind = 'r')) as ret_is_table_type
     from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     join pg_type rt on rt.oid = p.prorettype
     where n.nspname = 'public' and rt.typname <> 'trigger'
     order by p.proname`,
  )
).rows;

function tableBlock(table: string): string {
  const cols = columns.filter((c) => c.table_name === table);
  const row = cols
    .map(
      (c) =>
        `          ${quote(c.column_name)}: ${tsType(c.udt_name)}${c.is_nullable === 'YES' ? ' | null' : ''}`,
    )
    .join('\n');
  const insertable = cols.filter((c) => c.is_generated === 'NEVER');
  const insert = insertable
    .map((c) => {
      const optional =
        c.is_nullable === 'YES' || c.column_default !== null || c.is_identity === 'YES';
      return `          ${quote(c.column_name)}${optional ? '?' : ''}: ${tsType(c.udt_name)}${c.is_nullable === 'YES' ? ' | null' : ''}`;
    })
    .join('\n');
  const update = insertable
    .map(
      (c) =>
        `          ${quote(c.column_name)}?: ${tsType(c.udt_name)}${c.is_nullable === 'YES' ? ' | null' : ''}`,
    )
    .join('\n');
  const rels = foreignKeys
    .filter((fk) => fk.table_name === table)
    .map(
      (fk) => `          {
            foreignKeyName: ${JSON.stringify(fk.constraint_name)}
            columns: ${JSON.stringify(fk.columns)}
            isOneToOne: ${fk.one_to_one}
            referencedRelation: ${JSON.stringify(fk.referenced_table)}
            referencedColumns: ${JSON.stringify(fk.referenced_columns)}
          },`,
    )
    .join('\n');

  return `      ${quote(table)}: {
        Row: {
${row}
        }
        Insert: {
${insert}
        }
        Update: {
${update}
        }
        Relationships: [${rels ? `\n${rels}\n        ` : ''}]
      }`;
}

function functionBlock(fn: Fn): string {
  const modes = fn.arg_modes ?? fn.arg_types.map(() => 'i');
  const names = fn.arg_names ?? [];
  const inputs: string[] = [];
  const outputs: string[] = [];
  const inputIndexes = modes.map((m, i) => (m === 'i' || m === 'b' ? i : -1)).filter((i) => i >= 0);
  const firstDefault = inputIndexes.length - fn.n_defaults;

  modes.forEach((mode, i) => {
    const name = names[i] ?? `arg${i}`;
    const type = tsType(fn.arg_types[i] ?? 'unknown');
    if (mode === 'i' || mode === 'b') {
      const optional = inputIndexes.indexOf(i) >= firstDefault;
      inputs.push(`          ${quote(name)}${optional ? '?' : ''}: ${type}`);
    }
    if (mode === 't' || mode === 'o' || mode === 'b')
      outputs.push(`          ${quote(name)}: ${type}`);
  });

  let returns: string;
  if (outputs.length > 0) {
    returns = `{\n${outputs.join('\n')}\n        }[]`;
  } else if (fn.ret_is_table_type) {
    returns = `Database["public"]["Tables"][${JSON.stringify(fn.ret_type)}]["Row"]${fn.ret_set ? '[]' : ''}`;
  } else {
    returns = `${tsType(fn.ret_type)}${fn.ret_set ? '[]' : ''}`;
  }

  const args = inputs.length > 0 ? `{\n${inputs.join('\n')}\n        }` : 'never';
  return `      ${quote(fn.name)}: {
        Args: ${args.replace(/\n {10}/g, '\n          ')}
        Returns: ${returns}
      }`;
}

const output = `// Generated by scripts/gen-db-types.ts from supabase/migrations. Do not edit by hand.
// Regenerate: npm run db:types:local  (or, once linked: npm run db:types)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
${tables.map(tableBlock).join('\n')}
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
${functions.map(functionBlock).join('\n')}
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"]
export type Functions<T extends keyof PublicSchema["Functions"]> = PublicSchema["Functions"][T]
`;

writeFileSync(OUT, output);
console.log(
  `Wrote ${path.relative(process.cwd(), OUT)}: ${tables.length} tables, ${functions.length} functions`,
);
