import { nanoid } from 'nanoid'

function resError(res, err) {
  res.status(400).json({ error: err.message })
}

function init(app) {
  app.post(`/api/payments/create`, (req, res) => {
    const db = req.app.get('db')
    const { product_id, amount, tx_id } = req.body

    const game_key = nanoid()
    const timestamp = new Date().getTime()
    const query = `INSERT INTO payments (product_id, amount, tx_id, timestamp) VALUES (?, ?, ?, ?)`
    const params = [product_id, amount, tx_id, timestamp]

    db.run(query, params, (err) => {
      if (err) return resError(res, err)
      res.json({ id: this.lastID, game_key })
    })
  })

  app.post(`/api/payments/list`, (req, res) => {
    const db = req.app.get('db')
    const query = `SELECT * FROM payments ORDER BY timestamp DESC`

    db.all(query, [], (err, rows) => {
      if (err) return resError(res, err)
      res.json(rows)
    })
  })
}

export default { init }