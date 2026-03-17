import { useState, useCallback } from 'react'


export function useOpenedIndexMap() {
  const [opened, setOpened] = useState({})

  const toggleIndex = useCallback((id) => {
    if (!id) return

    setOpened(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }, [])

  const openIndex = useCallback((id) => {
    if (!id) return
    setOpened(prev => ({ ...prev, [id]: true }))
  }, [])

  const closeIndex = useCallback((id) => {
    if (!id) return
    setOpened(prev => ({ ...prev, [id]: false }))
  }, [])

  const isOpen = useCallback(
    (id) => !!opened[id],
    [opened]
  )

  return {
    isOpen,
    toggleIndex,
    openIndex,
    closeIndex,
  }
}
