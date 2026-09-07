import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getBakeryStatus } from '../services/bakeryService.js'

const BakeryContext = createContext(null)

export function BakeryProvider({ children }) {
  const [status, setStatus] = useState({ closure: { isClosed: false, note: null }, hours: [] })
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const response = await getBakeryStatus()
      setStatus(response.data)
      return response.data
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh().catch(() => {}) }, [refresh])

  const value = useMemo(() => ({
    ...status,
    isClosed: status.closure?.isClosed === true,
    closureNote: status.closure?.note || null,
    loading,
    refresh,
  }), [status, loading, refresh])

  return <BakeryContext.Provider value={value}>{children}</BakeryContext.Provider>
}

export function useBakery() {
  const context = useContext(BakeryContext)
  if (!context) throw new Error('useBakery must be used inside BakeryProvider')
  return context
}
