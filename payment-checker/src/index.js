import dotenv from 'dotenv'

import TxHandler from './tx_handler.js'
import ServerHandler from './server_handler.js'

import PaymentInterface from './payment_interface.js'

dotenv.config()

const walletEndpoint = process.env.WALLET_ENDPOINT || "ws://127.0.0.1:8081/json_rpc"
const walletUser = process.env.WALLET_USER || "test"
const walletPass = process.env.WALLET_PASS || "test"
const wsPort = process.env.WS_PORT || 4534

async function main() {
  try {
    const txHandler = new TxHandler()
    await txHandler.init({ walletEndpoint, walletUser, walletPass })

    const paymentInterface = new PaymentInterface()
    const serverHandler = new ServerHandler({ txHandler, paymentInterface })
    await serverHandler.init({ port: wsPort })

    txHandler.checkNewTransactions(serverHandler)
  } catch (err) {
    console.log(err.message)
  }
}

main()