import React, { useCallback, useEffect, useRef, useState } from 'react'
import { css, keyframes } from 'goober'
import { QRCodeCanvas } from 'qrcode.react'

import { useXelisPay } from '../provider'
import { IconArrowDown, IconBan, IconCircleCheck, IconCircleQuestion, IconCopy, IconInfo, IconXelis } from './icons'

const anim = {
  enter: keyframes`
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `,
  leave: keyframes`
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(100%);
    }
  `,
  scalePulse: keyframes`
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(.9);
      opacity: 0.7;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  `,
  opacityPulse: keyframes`
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
    100% {
      opacity: 1;
    }
  `,
  floating: keyframes`
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
    100% {
      transform: translateY(0px);
    }
  `
}

const style = {
  backdrop: css`
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgb(0 0 0 / 50%);
  `,
  layout: css`
    position: fixed;
    width: 100%;
    top: 0;
    bottom: 0;
    z-index: 9999999999999999999;
    padding: 1rem;
    overflow-y: scroll;
    overflow-x: hidden;
    display: flex;
    align-items: start;
    justify-content: center;

    @media only screen and (min-height: 650px) {
      align-items: center;
    }
  `,
  app: css`
    /*background-color: #7afad3;*/
    background-color: rgb(18 132 103);
    box-shadow: 0 0 40px 0px #2f2f2f;
    padding: 2rem;
    border-radius: 15px;
    opacity: 0;
    transform: translateY(-100%);
    width: 100%;
    overflow: hidden;
    color: white;

    @media only screen and (min-width: 400px) {
      max-width: 350px;
    }
  `,
  appEnter: css`
    animation: ${anim.enter} .25s forwards ease-out;
  `,
  appLeave: css`
    animation: ${anim.leave} .25s forwards ease-in;
  `,
  header: css`
    display: flex;
    gap: 3rem;
    align-items: center;
    justify-content: center;
  `,
  todoMsg: css`
    text-align: center;
    font-size: 1.2rem;
    line-height: 1.3rem;
    max-width: 250px;
    margin: 1em auto;
  `,
  amount: css`
    font-weight: bold;
    font-size: 1.4rem;
  `,
  qrCode: css`
    display: flex;
    justify-content: center;
  
    > canvas {
      background-color: black;
      border-radius: 1em;
      padding: 1em;
    }
  `,
  waitStore: css`
    display: flex;
    gap: 1rem;
    align-items: center;
    max-width: 250px;
    margin: 2em auto;
    line-height: 1rem;
    font-size: 1rem;

    animation: ${anim.opacityPulse} 2s infinite;
  `,
  cancel: css`
    display: flex;
    justify-content: center;
  `,
  actionButton: css`
    display: flex;
    gap: .5rem;
    background-color: black;
    border-radius: 1rem;
    border: none;
    color: white;
    padding: .3rem .85rem;
    font-weight: bold;
    align-items: center;
    transition: all .25s;
    text-decoration: none;
    cursor: pointer;

    &:hover {
      transform: scale(.95);
    }

    > svg {
      width: 1rem;
      height: 1rem;
    }  
  `,
  timer: css`
    display: flex;
    justify-content: center;

    > div {
      background: black;
      padding: .25rem 1rem 0 1rem;
      border-top-left-radius: 1rem;
      border-top-right-radius: 1rem;
      position: relative;
      top: .5rem;
      font-size: 1.5rem;
      font-weight: bold;
      color: white;
    }
  `,
  headerIconButton: css`
    background: none;
    width: 2.5rem;
    height: 2.5rem;
    border: none;
    cursor: pointer;
    transition: all .25s;

    &:hover {
      transform: scale(.95);
    }
  `,
  dotPulse: css`
    min-width: 1.5rem;
    min-height: 1.5rem;
    max-width: 1.5rem;
    max-height: 1.5rem;
    background-color: black;
    border-radius: 50%;
    animation: ${anim.scalePulse} 2s infinite;
  `,
  statusTitle: css`
    font-weight: bold;
    font-size: 1.4rem;
    margin-bottom: .25rem;
  `,
  statusMsg: css`
    line-height: 1.2rem;
  `,
  statusActions: css`
    display: flex;
    gap: .5rem;
    margin-top: 1rem;
  `,
  complete: css`
    display: flex;
    flex-direction: column;
    align-items: center;
  `,
  completeTitle: css`
    font-weight: bold;
    font-size: 2rem;
  `,
  completeIcon: css`
    width: 7rem;
    height: 7rem;
    margin: 1rem 0;
  `,
  completeMsg: css`
    text-align: center;
    margin-bottom: 2rem;
    line-height: 1.3rem;
    max-width: 250px;
  `,
  xelisBackdrop: css`
    position: absolute;
    width: 200%;
    top: -10%;
    left: -70%;
    opacity: 0.04;
    color: white;
    animation: ${anim.floating} 5s ease-in-out infinite;
  `,
  container: css`
    position: relative;
  `,
  dotsBackground: css`
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="2" fill="black"/></svg>') repeat;
    background-size: 5px 5px;
    width: 100%;
    height: 100%;
    position: absolute;
    opacity: .05;
    top: 0;
    left: 0;
  `,
  xswd: css`
    display: flex;
    justify-content: center;
    margin-bottom: 1em;
  `
}

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

  const copy = useCallback(() => {
    navigator.clipboard.writeText(addr)
    alert("The payment address was copied to clipboard.")
  }, [])

  const cancel = useCallback(() => {
    const canCancel = confirm(`Are you sure you want to cancel? Do not cancel if you have already sent a transaction and you are waiting for the vendor response.`)
    if (!canCancel) return

    cancelTransfer()
  }, [cancelTransfer])

  const connectXSWD = useCallback(() => {
    // TODO
  }, [])

  return <div>
    <div className={style.header}>
      <button className={style.headerIconButton} onClick={copy} title="Copy receiving address to clipboard.">
        <IconCopy />
      </button>
      <div className={style.amount}>{amount} XEL</div>
      <button className={style.headerIconButton} title="More information about this proccess.">
        <IconInfo />
      </button>
    </div>
    <div className={style.todoMsg}>
      Copy the address, scan the QR code, or use XSWD to send the amount.
    </div>
    <div className={style.xswd}>
      <button className={style.actionButton} onClick={connectXSWD}>
        <IconArrowDown style={{ transform: `rotate(270deg)` }} />
        Use XSWD
      </button>
    </div>
    <div className={style.timer}>
      <div><Timer duration={5 * 60} /></div>
    </div>
    <div className={style.qrCode}>
      <QRCodeCanvas value={addr} size={200} />
    </div>
    <div className={style.waitStore}>
      <div className={style.dotPulse}></div>
      <div>Waiting for store to confirm your transaction...</div>
    </div>
    <div className={style.cancel}>
      <button className={style.actionButton} onClick={cancel}>
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

  return <div>
    <div className={style.statusTitle}>{title}</div>
    <div className={style.statusMsg}>{msg}</div>
    <div className={style.statusActions}>
      {displaySupport && <button onClick={support} className={style.actionButton}>
        <IconCircleQuestion />
        Support
      </button>}
      <button onClick={cancelTransfer} className={style.actionButton}>
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

  return <div className={style.complete}>
    <div className={style.completeTitle}>Success</div>
    <div className={style.completeIcon}><IconCircleCheck /></div>
    <div className={style.completeMsg}>The payment was received and confirmed by the store.</div>
    <button className={style.actionButton} onClick={complete}>
      <IconArrowDown style={{ transform: `rotate(270deg)` }} />
      Continue
    </button>
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
      <div className={style.container}>
        <Container />
      </div>
    </div>
  </div>
}

export default App