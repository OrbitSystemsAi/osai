'use client'

import dynamic from 'next/dynamic'

const OSaiApp = dynamic(() => import('../src/App'), { ssr: false })

export default function SiteClient() {
  return <OSaiApp />
}
