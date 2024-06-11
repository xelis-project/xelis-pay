import React, { useCallback, useEffect, useRef, useState } from 'react'

import { XelisPayProvider, useXelisPay } from '../../web-plugin/src/provider'
import { Modal } from 'bootstrap'

function SupportModal() {
  const modalRef = useRef()
  const bsModalRef = useRef()

  const { onSupport } = useXelisPay()

  useEffect(() => {
    if (!onSupport) return

    bsModalRef.current.show()
  }, [onSupport])

  useEffect(() => {
    bsModalRef.current = new Modal(modalRef.current)
  }, [])

  return <div ref={modalRef} className="modal" tabIndex="-1">
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Support</h5>
          <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div className="modal-body">
          If you have sent a transaction and something failed along the way, please contact support here:<br />Not support it's a demo store.
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-primary" data-bs-dismiss="modal">Ok</button>
        </div>
      </div>
    </div>
  </div>
}

function ConfirmModal() {
  const modalRef = useRef()
  const bsModalRef = useRef()

  const { onComplete, completeData } = useXelisPay()

  useEffect(() => {
    if (!onComplete) return

    bsModalRef.current.show()
  }, [onComplete])

  useEffect(() => {
    bsModalRef.current = new Modal(modalRef.current)
  }, [])

  console.log(completeData)
  const { id, game_key } = completeData || {}

  return <div ref={modalRef} className="modal" tabIndex="-1">
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Success</h5>
          <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div className="modal-body">
          <div>You have succesfully bought the game.</div>
          <ul className="mt-2">
            <li>Payment ID: {id}</li>
            <li>Game Key: {game_key}</li>
          </ul>
          <div>Download the game here: This game does not exists this is a demo.</div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-primary" data-bs-dismiss="modal">Ok</button>
        </div>
      </div>
    </div>
  </div>
}

function ProductBox(props) {
  const { product } = props

  const { startTransfer } = useXelisPay()

  const pay = useCallback(() => {
    startTransfer({ product_id: product.id })
  }, [product])

  const { name, price } = product

  return <div className="card">
    <div className="card-header">
      {name}
    </div>
    <div className="card-body">
      <div>This game does not exists. It is an example to showcase buying a virtual product with the XELIS network.</div>
      <button className="btn btn-primary mt-2" onClick={pay}>
        Pay {price} XEL
      </button>
    </div>
  </div>
}

function Games() {
  return <div>
    <h2 className="my-3">Games</h2>
    <div className="d-flex gap-3 flex-column flex-md-row">
      <ProductBox product={{ id: `mystic_quest`, name: `Mystic Quest`, price: .8 }} />
      <ProductBox product={{ id: `galactica_neon`, name: `Galactica Neon`, price: .55 }} />
    </div>
  </div>
}

function Payments() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchPayments = useCallback(async () => {
    setLoading(true)

    try {
      const res = await fetch(`/api/payments/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const result = await res.json()
      setList(result)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error('There has been a problem with your fetch operation:', error);
    }
  }, [])

  useEffect(() => {
    fetchPayments()
  }, [])

  return <div className="table-responsive">
    <h2 className="my-3 d-flex justify-content-between">
      Payments
      <button className="btn btn-secondary" onClick={fetchPayments}>
        {loading && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>}
        <span>Reload</span>
      </button>
    </h2>
    <table className="table table-bordered">
      <thead className="thead-dark">
        <tr>
          <th>Product ID</th>
          <th>Amount</th>
          <th>Transaction ID</th>
          <th>Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {list.map((item) => {
          return <tr key={item.id}>
            <td>{item.product_id}</td>
            <td>{item.amount}</td>
            <td>{item.tx_id}</td>
            <td>{item.timestamp}</td>
          </tr>
        })}
        {list.length === 0 && <tr>
          <td colSpan={4}>No payments</td>
        </tr>}
      </tbody>
    </table>
  </div>
}

function Page() {
  return <div className="container">
    <h1 className="mt-3">Demo Store</h1>
    <div className="w-50">This is a demo store using the <span className="badge text-bg-secondary">XELIS Pay</span>. Let's pretend this is a portal to buy a new games from an indie game studio.</div>
    <Games />
    <Payments />
    <SupportModal />
    <ConfirmModal />
  </div>
}

function App() {
  return <XelisPayProvider value={{ supportLink: `` }}>
    <Page />
  </XelisPayProvider>
}

export default App