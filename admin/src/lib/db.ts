import postgres from 'postgres'

const toIso = (value: string) => new Date(value).toISOString()

// Match the JSON shapes the app received from Supabase: numbers as numbers, timestamps as ISO strings.
const createSql = () =>
  postgres(process.env.DATABASE_URL!, {
    max: 10,
    idle_timeout: 30,
    types: {
      numeric: { to: 1700, from: [1700], serialize: (x: number) => String(x), parse: (x: string) => parseFloat(x) },
      int8: { to: 20, from: [20], serialize: (x: number) => String(x), parse: (x: string) => Number(x) },
      timestamptz: { to: 1184, from: [1184, 1114], serialize: (x: string) => x, parse: toIso },
      date: { to: 1082, from: [1082], serialize: (x: string) => x, parse: (x: string) => x },
    },
  })

const globalForDb = globalThis as unknown as { sql?: ReturnType<typeof createSql> }

export const sql = globalForDb.sql ?? createSql()

if (process.env.NODE_ENV !== 'production') globalForDb.sql = sql

export type Tx = postgres.TransactionSql<any>

// Prepare a row object for sql(row): drop undefined keys and send arrays/objects as JSON (all such columns are jsonb).
export function columns(values: object) {
  const out: Record<string, any> = {}
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) continue
    out[key] = value !== null && typeof value === 'object' ? sql.json(value) : value
  }
  return out
}
