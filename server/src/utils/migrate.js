import 'dotenv/config'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import pool from '../config/database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const migrationsPath = path.join(__dirname, '../../migrations')

async function migrate() {
  const client = await pool.connect()

  try {
    // Prevent concurrent migration processes from applying the same file.
    await client.query(
      'SELECT pg_advisory_lock(8392742)'
    )

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    const files = (await fs.readdir(migrationsPath))
      .filter(file => file.endsWith('.sql'))
      .sort()

    const appliedResult = await client.query(
      'SELECT filename FROM schema_migrations ORDER BY filename'
    )

    const applied = new Set(
      appliedResult.rows.map(row => row.filename)
    )

    for (const file of files) {
      if (applied.has(file)) {
        continue
      }

      console.log(`Applying migration: ${file}`)

      const sql = await fs.readFile(
        path.join(migrationsPath, file),
        'utf8'
      )

      await client.query('BEGIN')

      try {
        await client.query(sql)

        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [file]
        )

        await client.query('COMMIT')

        console.log(`Applied: ${file}`)
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      }
    }

    console.log('Database migrations complete')
  } finally {
    try {
      await client.query(
        'SELECT pg_advisory_unlock(8392742)'
      )
    } catch {
      // Connection may already be unavailable during shutdown.
    }

    client.release()
    await pool.end()
  }
}

migrate().catch(error => {
  console.error('Migration failed')
  console.error(error.message)
  process.exit(1)
})