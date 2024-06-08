async function storeApi(endpoint, params) {
  const res = await fetch(`http://localhost:48766${endpoint}`, {
    method: `POST`,
    body: JSON.stringify(params),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const data = await res.json()
  console.log(data)
  if (data.error) {
    throw data.error
  }

  return data
}

export default class PaymentInterface {
  validatePayment = async (obj) => {
    // here you can store a draft "pending" order or simply validate the payload
    // you can implement logic to set the payment amount based on the payload
    // you can fetch an api that check if the item is available and gives you the price

    const { payment, payload } = obj

    payment.payload = payload
    switch (payload.product_id) {
      case 'mystic_quest':
        payment.amount = .8
        return true
      case 'galactica_neon':
        payment.amount = .55
        return true
      default:
        return false
    }
  }

  paymentFailed = async (obj) => {
    const { payment, reason } = obj
    console.log(reason)

    // do nothing because we don't need to delete or update state from validatePayment
  }

  paymentComplete = async (obj) => {
    // you can decide how to implement for your needs

    const { payment, tx } = obj
    const { payload } = payment
    const { product_id } = payload

    const result = await storeApi(`/api/payments/create`, { product_id, amount: payment.amount, tx_id: tx.hash })
    console.log(result)
    return result
  }
}