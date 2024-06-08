import React from 'react'
import { createRoot } from 'react-dom/client'

import { XelisPayProvider } from './provider'

export function initialize(rootElement) {
  const root = createRoot(rootElement)
  root.render(<XelisPayProvider />)
}

// TODO
// build a consumable package so you can use with other frameworks or simply with javascript
