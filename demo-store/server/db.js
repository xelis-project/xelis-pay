import sqlite3 from 'sqlite3'

export function init(app) {
  const db = new sqlite3.Database('./payments.db')

  // payments
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id REAL NOT NULL,
      amount REAL NOT NULL,
      timestamp INTEGER NOT NULL,
      tx_id TEXT NOT NULL
    )
  `)

  app.set('db', db)
}

export default { init }
