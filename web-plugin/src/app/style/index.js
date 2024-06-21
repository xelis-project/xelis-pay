import { css } from 'goober'
import anim from './anim'

// #97ffd8

const font = `
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  line-height: 1.5;
`

export default {
  layout: css`
    ${font}
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
    font-size: 16px;

    button, input, optgroup, select, textarea {
      font-family: inherit;
      font-size: inherit;
      line-height: inherit;
    }

    @media only screen and (min-height: 650px) {
      align-items: center;
    }
  `,
  backdrop: css`
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgb(0 0 0 / 50%);
  `,
  app: css`
    /*background-color: #7afad3;*/
    background-color: rgb(18 132 103);
    box-shadow: 0 0 40px 0px #2f2f2f;
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
  xelisBackdrop: css`
    position: absolute;
    width: 200%;
    top: -10%;
    left: -70%;
    opacity: 0.04;
    color: white;
    animation: ${anim.floating} 5s ease-in-out infinite;
  `,
  appContainer: css`
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
  button: css`
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
  waitPayment: {
    container: css`
      padding: 2em;
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
    waitForStore: css`
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
    xswd: css`
      display: flex;
      justify-content: center;
      margin-bottom: 1em;
    `,
  },
  info: {
    container: css`
      overflow-y: auto;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgb(22 22 22 / 98%);
      z-index: 1;
      border-radius: .5em;
      color: white;
    `,
    header: {
      container: css`
        display: flex;
        justify-content: space-between;
        margin-bottom: 1em;
        position: sticky;
        top: 0;
        background: rgb(0 0 0 / 60%);
        padding: 1em;
        backdrop-filter: blur(5px);
        align-items: center;
      `,
      title: css`
        font-size: 1.2em;
        font-weight: bold;
      `,
      button: css`
        border: none;
        background: none;
        color: white;
        width: 25px;
        height: 25px;
        cursor: pointer;

        &:hover {
          transform: scale(.95);
        }
      `
    },
    content: css`
      padding: 0 .5em 0 1em;
    `
  },
  status: {
    container: css`
      padding: 2em;
    `,
    title: css`
    font-weight: bold;
    font-size: 1.4rem;
    margin-bottom: .25rem;
  `,
    msg: css`
      line-height: 1.2rem;
    `,
    actions: css`
      display: flex;
      gap: .5rem;
      margin-top: 1rem;
    `,
  },
  complete: {
    container: css`
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2em;
    `,
    title: css`
      font-weight: bold;
      font-size: 2rem;
    `,
    icon: css`
      width: 7rem;
      height: 7rem;
      margin: 1rem 0;
    `,
    msg: css`
      text-align: center;
      margin-bottom: 2rem;
      line-height: 1.3rem;
      max-width: 250px;
    `,
  }
}