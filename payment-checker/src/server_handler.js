import WebSocket from 'ws'
import { nanoid } from 'nanoid'

class PaymentHandler {
  validated = false
  amount = null

  constructor({ paymentId, ws, ip, serverHandler }) {
    this.id = paymentId
    this.ws = ws
    this.ip = ip

    this.serverHandler = serverHandler
  }

  sendTimeout() {
    const key = `timeout`
    this.ws.send(JSON.stringify({ key }))
    this.ws.close()

    const { paymentInterface } = this.serverHandler
    paymentInterface.paymentFailed({ payment: this, reason: key })
    this.delete()
  }

  async sendPaymentData() {
    const { txHandler, paymentTtl } = this.serverHandler
    const addr = await txHandler.createPaymentAddress(this.id)
    this.ws.send(JSON.stringify({ key: `payment_data`, value: { id: this.id, ttl: paymentTtl, addr, amount: this.amount } }))
    // don't close connection keep it alive
  }

  async sendComplete(tx) {
    const { paymentInterface } = this.serverHandler
    const completeData = await paymentInterface.paymentComplete({ payment: this, tx })
    this.ws.send(JSON.stringify({ key: `complete`, value: completeData }))
    this.ws.close()
    this.delete()
  }

  sendInsufficentFunds(amountSent) {
    const key = `insufficent_funds`
    this.ws.send(JSON.stringify({ key, value: { amountSent } }))
    this.ws.close()
    const { paymentInterface } = this.serverHandler
    paymentInterface.paymentFailed({ payment: this, reason: key })
    this.delete()
  }

  sendLimitExceeded() {
    const key = `limit_exceeded`
    this.ws.send(JSON.stringify({ key }))
    this.ws.close()
    const { paymentInterface } = this.serverHandler
    paymentInterface.paymentFailed({ payment: this, reason: key })
    // we don't delete because it was not added to server_handler map
  }

  sendInvalidPayload() {
    this.ws.send(JSON.stringify({ key: `invalid_payload` }))
    this.ws.close()
    // we don't trigger paymentFailed because it's set invalid by validatePayment()
    this.delete()
  }

  delete() {
    this.serverHandler.deletePayment(this.id)
  }
}

class ServerHandler {
  payments = new Map()
  ips = new Map() // ip limit in case the POS let buy product without a user account

  constructor({ txHandler, paymentInterface, paymentTtl, maxPaymentsPerIp }) {
    this.txHandler = txHandler

    this.paymentInterface = paymentInterface

    this.maxPaymentsPerIp = maxPaymentsPerIp || 5
    this.paymentTtl = paymentTtl || 5 * 60 * 1000 // 5min
  }

  init(options) {
    const { port } = options
    const wss = new WebSocket.Server({ port })

    wss.on('connection', (ws, req) => {
      const payment = this.createPayment(ws, req)

      ws.on('message', async (buf) => {
        let payload = null
        if (buf.length > 0) {
          try {
            payload = JSON.parse(buf.toString())
          } catch {
            payment.sendInvalidPayload()
            return
          }
        }

        if (payment.validated) {
          return // do nothing we already validated and sent the necessary payment data
        }

        const valid = await this.paymentInterface.validatePayment({ payment, payload })
        payment.validated = valid
        if (valid) {
          payment.sendPaymentData()
        } else {
          payment.sendInvalidPayload()
        }
      })

      ws.on('close', () => {
        console.log('connection close')
        // don't remove payment in case the client looses connection or close the window after sending the transfer from his wallet
        // let the 5min time window pass and check if received
        // this.deletePayment(paymentId)
      })
    })

    console.log(`WebSocket server running on ws://localhost:${port}`)
  }

  createPayment(ws, req) {
    const ip = req.socket.remoteAddress

    const paymentId = `${new Date().getTime()}_${nanoid(8)}`
    const payment = new PaymentHandler({
      paymentId,
      ws,
      ip,
      serverHandler: this,
    })

    let connCount = this.ips.get(ip) || 0

    if (connCount >= this.maxPaymentsPerIp - 1) {
      payment.sendLimitExceeded()
      return
    }

    this.payments.set(paymentId, payment)
    this.ips.set(ip, ++connCount)

    setTimeout(() => {
      payment.sendTimeout()
    }, this.paymentTtl)

    return payment
  }

  deletePayment(paymentId) {
    const payment = this.payments.get(paymentId)
    if (payment) {
      const { ip } = payment
      this.payments.delete(paymentId)

      let connCount = (this.ips.get(ip) || 0) - 1
      if (connCount <= 0) {
        this.ips.delete(ip)
      } else {
        this.ips.set(ip, connCount)
      }
    }
  }

  getPayment(paymentId) {
    return this.payments.get(paymentId)
  }
}

export default ServerHandler