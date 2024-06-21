import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'

import { XelisPayProvider, useXelisPay } from '../provider'

const START_TRANSFER_EVENT = `xelis_pay_start_transfer`
const CANCEL_TRANSFER_EVENT = `xelis_pay_cancel_transfer`

const ON_SUPPORT_EVENT = `xelis_pay_on_support`
const ON_COMPLETE_EVENT = `xelis_pay_on_complete`

const HandleEvents = () => {
  const { startTransfer, cancelTransfer, onComplete, completeData, onSupport } = useXelisPay()

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

  useEffect(() => {
    if (!onComplete) return

    const onCompleteEvent = new CustomEvent(ON_COMPLETE_EVENT, { detail: completeData })
    document.dispatchEvent(onCompleteEvent)
  }, [onComplete, completeData])

  useEffect(() => {
    if (!onSupport) return

    const onSupportEvent = new CustomEvent(ON_SUPPORT_EVENT)
    document.dispatchEvent(onSupportEvent)
  }, [onSupport])

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

export const onComplete = (cb) => {
  document.addEventListener(ON_COMPLETE_EVENT, (event) => {
    cb(event.detail)
  })
}

export const onSupport = (cb) => {
  document.addEventListener(ON_SUPPORT_EVENT, (event) => {
    cb()
  })
}

export default { render, startTransfer, cancelTransfer, onComplete, onSupport }