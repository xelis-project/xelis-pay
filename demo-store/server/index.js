import express from 'express'
import bodyParser from 'body-parser'
import path from 'path'

import database from './db.js'
import apiPayments from './api/payments.js'

const app = express()
const port = process.env.PORT || 3000
const hostname = process.env.HOSTNAME || `127.0.0.1`

app.use(bodyParser.json())

database.init(app)
apiPayments.init(app)

app.use(express.static(`./public`))

app.use(`*`, (req, res) => {
  res.sendFile(path.resolve(`./public/index.html`))
})

app.listen(port, hostname, () => {
  console.log(`Server is running on http://${hostname}:${port}`)
})