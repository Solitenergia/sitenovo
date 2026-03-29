import { Client } from 'pg'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import dotenv from 'dotenv'

dotenv.config()

// Extract project ref from SUPABASE_URL
const url = process.env.SUPABASE_URL!
const ref = url.replace('https://', '').split('.')[0]

// Direct connection (not pooler) - Session mode needed for DDL
const connectionString = `postgresql://postgres.${ref}:${process.env.SUPABASE_DB_PASSWORD}@aws-0-sa-east-1.pooler.supabase.com:5432/postgres`

async function migrate() {
  console.log('🔄 Conectando ao banco de dados...')

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })

  try {
    await client.connect()
    console.log('✅ Conectado!')

    const sqlPath = resolve(__dirname, '../../supabase/migrations/001_initial_schema.sql')
    const sql = readFileSync(sqlPath, 'utf-8')

    console.log('🔄 Executando migration...')
    await client.query(sql)
    console.log('✅ Migration executada com sucesso!')
  } catch (error: any) {
    console.error('❌ Erro na migration:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

migrate()
