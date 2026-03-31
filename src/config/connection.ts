import { Pool } from 'pg'

const PgConnectionString=process.env.PG_CONNECTION

export const pool = new Pool({
    connectionString:PgConnectionString
})