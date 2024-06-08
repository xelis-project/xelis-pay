import { WS as WalletWS } from '@xelis/sdk/wallet/websocket'
import { XELIS_ASSET } from '@xelis/sdk/config'

class TxHandler {
  wallet = null

  async init(options) {
    const { walletEndpoint, walletUser, walletPass } = options
    const wallet = new WalletWS(walletUser, walletPass)
    await wallet.connect(walletEndpoint)
    this.wallet = wallet
  }

  checkNewTransactions(serverHandler) {
    this.wallet.methods.onNewTransaction((event, data) => {
      const { hash, topoheight, incoming } = data

      if (incoming) {
        console.log(`Incoming tx: ${hash}`)
        const { from, transfers } = incoming
        transfers.forEach(async (transfer) => {
          // the extra_data is the payment_id
          const payment = serverHandler.getPayment(transfer.extra_data)
          if (payment) {
            // make sure it's xelis asset
            if (transfer.asset !== XELIS_ASSET) {
              // send a notification that the asset is not xelis
              // skip
              return
            }

            // transfer.amount is in atomic value with 8 decimals
            // let's convert
            const amount = transfer.amount / 100000000

            if (amount < payment.amount) {
              // user didn't send enough
              // send a notification
              payment.sendInsufficentFunds(amount)
              return
            }

            if (amount > payment.amount) {
              // user sent too much 
              // do nothing and continue
            }

            const tx = { hash, topoheight, from, transfer }
            payment.sendComplete(tx)
          }
        })
      }
    })

    console.log(`Tx handler is checking for new wallet transactions...`)
  }

  createPaymentAddress(paymentId) {
    return this.wallet.methods.getAddress({
      integrated_data: paymentId
    })
  }

  refundTransaction(hash) {
    wallet.methods.buildTransaction({
      broadcast: true,
      transfers: [{
        amount: 0,
        asset: XELIS_ASSET,
        destination: "",
        extra_data
      }]
    })
  }
}

export default TxHandler