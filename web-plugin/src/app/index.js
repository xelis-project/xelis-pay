import React, { useCallback, useEffect, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { WS as XSWD } from '@xelis/sdk/xswd/websocket'
import { XELIS_ASSET, LOCAL_XSWD_WS } from '@xelis/sdk/config'

import { useXelisPay } from '../provider'
import {
  IconArrowDown, IconBan, IconCircleCheck, IconCircleQuestion,
  IconCopy, IconInfo, IconXelis, IconClose
} from './icons'
import style from './style'

function Timer(props) {
  const { duration } = props

  const [timer, setTimer] = useState(duration) // 5min

  useEffect(() => {
    const updateTimer = () => {
      setTimer(timer => {
        const newTimer = timer - 1
        if (newTimer > 0) setTimeout(updateTimer, 1000)
        return newTimer
      })
    }

    setTimeout(updateTimer, 1000)
  }, [])

  let min = Math.floor(timer / 60)
  let sec = Math.floor(timer % 60)
  if (sec < 10) sec = `0${sec}`

  return `${min}:${sec}`
}

function WaitingForPayment() {
  const { paymentData, cancelTransfer } = useXelisPay()
  const { id, ttl, addr, amount } = paymentData || {}

  const [showInfo, setShowInfo] = useState(false)

  const copy = useCallback(() => {
    navigator.clipboard.writeText(addr)
    alert("The payment address was copied to clipboard.")
  }, [])

  const info = useCallback(() => {
    setShowInfo(true)
  }, [])

  const cancel = useCallback(() => {
    const canCancel = confirm(`Are you sure you want to cancel? Do not cancel if you have already sent a transaction and you are waiting for the vendor response.`)
    if (!canCancel) return

    cancelTransfer()
  }, [cancelTransfer])

  const connectXSWD = useCallback(async () => {
    let xswd = null

    try {
      xswd = new XSWD()
      await xswd.connect(LOCAL_XSWD_WS)

      await xswd.authorize({
        id: `9F86D081884C7D659A2FEAA0C55AD015A3BF4F1B2B0B822CD15D6C15B0F00A08`,
        name: `XELIS Pay`,
        description: ``,
        permissions: new Map()
      })

      const atomicAmount = Math.trunc(amount * 100000000)
      await xswd.wallet.buildTransaction({
        transfers: [{
          amount: atomicAmount, // in atomic value
          asset: XELIS_ASSET,
          destination: addr
        }],
        broadcast: true
      })

      xswd.close()
    } catch (err) {
      console.log(err)
      xswd.close()
    }
  }, [addr, amount])

  return <div className={style.waitPayment.container}>
    {showInfo && <Info onClose={() => setShowInfo(false)} />}
    <div className={style.waitPayment.header}>
      <button className={style.waitPayment.headerIconButton} onClick={copy} title="Copy receiving address to clipboard.">
        <IconCopy />
      </button>
      <div className={style.waitPayment.amount}>{amount} XEL</div>
      <button className={style.waitPayment.headerIconButton} onClick={info} title="More information about this entire proccess.">
        <IconInfo />
      </button>
    </div>
    <div className={style.waitPayment.todoMsg}>
      Copy the address, scan the QR code, or use XSWD to send the amount.
    </div>
    <div className={style.waitPayment.xswd}>
      <button className={style.button} onClick={connectXSWD}>
        <IconArrowDown style={{ transform: `rotate(270deg)` }} />
        Use XSWD
      </button>
    </div>
    <div className={style.waitPayment.timer}>
      <div><Timer duration={5 * 60} /></div>
    </div>
    <div className={style.waitPayment.qrCode}>
      <QRCodeCanvas value={addr} size={200} />
    </div>
    <div className={style.waitPayment.waitForStore}>
      <div className={style.waitPayment.dotPulse}></div>
      <div>Waiting for store to confirm your transaction...</div>
    </div>
    <div className={style.waitPayment.cancel}>
      <button className={style.button} onClick={cancel}>
        <IconBan />
        Cancel
      </button>
    </div>
  </div>
}

function Status(props) {
  const { title, msg, displaySupport = true } = props
  const { cancelTransfer, setOnSupport } = useXelisPay()

  const support = useCallback(() => {
    setOnSupport(true)
    cancelTransfer()
  }, [])

  return <div className={style.status.container}>
    <div className={style.status.title}>{title}</div>
    <div className={style.status.msg}>{msg}</div>
    <div className={style.status.actions}>
      {displaySupport && <button onClick={support} className={style.button}>
        <IconCircleQuestion />
        Support
      </button>}
      <button onClick={cancelTransfer} className={style.button}>
        <IconArrowDown />
        Close
      </button>
    </div>
  </div>
}

function Complete() {
  const { cancelTransfer, setOnComplete } = useXelisPay()
  // payment is complete, cancelTransfer does not cancel but simply closes the app

  const complete = useCallback(() => {
    setOnComplete(true)
    cancelTransfer()
  }, [])

  return <div className={style.complete.container}>
    <div className={style.complete.title}>Success</div>
    <div className={style.complete.icon}><IconCircleCheck /></div>
    <div className={style.complete.msg}>The payment was received and confirmed by the store.</div>
    <button className={style.button} onClick={complete}>
      <IconArrowDown style={{ transform: `rotate(270deg)` }} />
      Continue
    </button>
  </div>
}

function Info(props) {
  const { onClose } = props

  return <div className={style.info.container}>
    <div className={style.info.header.container}>
      <div className={style.info.header.title}>Info</div>
      <button onClick={onClose} className={style.info.header.button}>
        <IconClose />
      </button>
    </div>
    <div className={style.info.content}>
      <p>
        XELIS Pay is a trusted setup. The store provides an integrated address for you to send funds and pay for the product / service.
        There is usually a 5 minute window for the entire transaction to be fulfilled by the store.
        You should NOT cancel an ongoing process if you sent a transaction.
      </p>
      <p>
        Try to keep the window open in order to receive feedback of a fulfilled transaction. However, if you close the window
        and sent a transaction, it can still be validated by the store, but you will not receive any feedback from this plugin.
        Same goes if you loose power / connection or your computer does not respond for whatever reasons.
      </p>
      <p>
        Do NOT send a transaction without giving enough time for the network & store to validate within the process time window.
      </p>
      <p>Here are multiple ways you can send funds:</p>
      <div>Copy address:</div>
      <ul>
        <li>Copy the integrated address with the copy button.</li>
        <li>Paste the address in the wallet and enter the needed amount.</li>
        <li>Send the transaction.</li>
      </ul>
      <div>Scan the QR code:</div>
      <ul>
        <li>Scan the QR code with the wallet.</li>
        <li>Enter the needed amount.</li>
        <li>Send the transaction.</li>
      </ul>
      <div>Use the XSWD protocol:</div>
      <ul>
        <li>Click `Use XSWD` to connect to the wallet.</li>
        <li>Authorize the app and transfer within the wallet.</li>
      </ul>
      <p>
        Again, this is a trusted setup, make sure the store is legit and trusted.
        Use at your own risk.
      </p>
    </div>
  </div>
}

function Container() {
  let { status, connClosed } = useXelisPay()

  if (connClosed) {
    const noConnErrStatusList = [`timeout`, `complete`, `insufficent_funds`, `limit_exceeded`, `invalid_payload`]
    if (noConnErrStatusList.indexOf(status) === -1) {
      return <Status title="Connection Error" msg="The connection was closed or unable to establish. If you have sent a transaction please contact the store support." />
    }
  }

  //status = `waiting_for_payment`

  switch (status) {
    case 'insufficent_funds':
      return <Status title="Wrong payment amount" msg="The payment was received but it does not match the amount needed. Contact the store support." />
    case 'timeout':
      return <Status title="Payment Timed Out" msg="The payment handler timed out without receiving any funds. Contact the store support if you did send funds." />
    case 'complete':
      return <Complete />
    case 'waiting_for_payment':
      return <WaitingForPayment />
    case 'limit_exceeded':
      return <Status title="Limit exceeded" msg="You have reached the limit of unfulfilled orders. Retry later." />
    case 'invalid_payload':
      return <Status title="Invalid payload" msg="The initial payload is invalid." />
    case 'connecting':
      return <Status title="Connecting..." msg="Trying to connect with the vendor payment handler." displaySupport={false} />
  }
}

const appEnterClassName = `${style.app} ${style.appEnter}`
const appLeaveClassName = `${style.app} ${style.appLeave}`

function App() {
  const { visible } = useXelisPay()

  const [appClassName, setAppClassName] = useState(appEnterClassName)
  const [visibleAnim, setVisibleAnim] = useState(visible)

  useEffect(() => {
    if (!visible && visibleAnim) {
      setAppClassName(appLeaveClassName)
      setTimeout(() => {
        setVisibleAnim(false)
      }, 250)
    }

    if (visible) {
      setAppClassName(appEnterClassName)
      setVisibleAnim(true)
    }
  }, [visible])

  if (!visibleAnim) return

  return <div className={style.layout}>
    <div className={style.backdrop} />
    <div className={appClassName}>
      <div className={style.dotsBackground} />
      <div className={style.xelisBackdrop}>
        <IconXelis />
      </div>
      <div className={style.appContainer}>
        <Container />
      </div>
    </div>
  </div>
}

export default App