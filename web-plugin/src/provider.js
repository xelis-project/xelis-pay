import React, { createContext, useCallback, useContext, useRef, useState } from 'react'

import App from './app'

const Context = createContext()

export function XelisPayProvider(props) {
  const { children } = props

  const [visible, setVisible] = useState(false)
  const socketRef = useRef()
  const [status, setStatus] = useState(`connecting`)
  const [paymentData, setPaymentData] = useState()
  const [connClosed, setConnClosed] = useState(false)
  const [completeData, setCompleteData] = useState()
  const [onSupport, setOnSupport] = useState(false)
  const [onComplete, setOnComplete] = useState(false)

  const reset = useCallback(() => {
    setVisible(false)
    setConnClosed(false)
    setStatus(`connecting`)
    setOnSupport(false)
    setOnComplete(false)
  })

  const startTransfer = useCallback((payload) => {
    reset()
    setVisible(true)

    let jsonPayload = ``
    try {
      if (payload) jsonPayload = JSON.stringify(payload)
    } catch { }

    const socket = new WebSocket('ws://localhost:4534');

    socket.addEventListener('open', function (event) {
      socket.send(jsonPayload)
    })

    socket.addEventListener('message', function (event) {
      const { key, value } = JSON.parse(event.data)
      switch (key) {
        case 'limit_exceeded':
          setStatus(`limit_exceeded`)
          break
        case 'insufficent_funds':
          setStatus(`insufficent_funds`)
          const { amountSent } = value
          break
        case 'timeout':
          setStatus(`timeout`)
          break
        case 'complete':
          setStatus(`complete`)
          setCompleteData(value)
          break
        case 'payment_data':
          setPaymentData(value)
          setStatus(`waiting_for_payment`)
          break
        case 'invalid_payload':
          setStatus(`invalid_payload`)
          break
      }
    })

    socket.addEventListener('close', function (event) {
      console.log('WebSocket connection closed')
      setConnClosed(true)
      socketRef.current = null
    })

    socket.addEventListener('error', function (event) {
      console.error(event)
      // do nothing - handle in close event instead
    })

    socketRef.current = socket
  }, [])

  const cancelTransfer = useCallback(() => {
    setVisible(false)

    if (socketRef.current) {
      // wait for animation to close before closing connection
      // this avoids showing connection closed during animation
      setTimeout(() => {
        socketRef.current.close()
        socketRef.current = null
      }, 300)
    }
  }, [])

  const value = {
    visible, connClosed, startTransfer, cancelTransfer,
    status, paymentData, onSupport, setOnSupport,
    onComplete, setOnComplete, completeData
  }

  return <Context.Provider value={value}>
    {children}
    <App />
  </Context.Provider>
}

export const useXelisPay = () => useContext(Context)
