import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'

import { XelisPayProvider, useXelisPay } from '../provider'

const START_TRANSFER_EVENT = `xelis_pay_start_transfer`
const CANCEL_TRANSFER_EVENT = `xelis_pay_cancel_transfer`

const HandleEvents = () => {
  const { startTransfer, cancelTransfer } = useXelisPay()

  useEffect(() => {
    const handleStartStransfer = (event) => {
      startTransfer(event.detail)
    }

    const handleCancelTransfer = (event) => {
      cancelTransfer()
    }

    document.addEventListener(START_TRANSFER_EVENT, handleStartStransfer)
    document.addEventListener(CANCEL_TRANSFER_EVENT, handleCancelTransfer)

    return () => {
      document.removeEventListener(START_TRANSFER_EVENT, handleStartStransfer)
      document.removeEventListener(CANCEL_TRANSFER_EVENT, handleCancelTransfer)
    }
  }, [])

  return null
}

export const render = (rootElement) => {
  const root = createRoot(rootElement)

  root.render(
    <XelisPayProvider>
      <HandleEvents />
    </XelisPayProvider>
  )
}

export const startTransfer = (payload) => {
  const startTransferEvent = new CustomEvent(START_TRANSFER_EVENT, { detail: payload })
  document.dispatchEvent(startTransferEvent)
}

export const cancelTransfer = () => {
  const cancelTransferEvent = new CustomEvent(CANCEL_TRANSFER_EVENT)
  document.dispatchEvent(cancelTransferEvent)
}

export default { render, startTransfer }