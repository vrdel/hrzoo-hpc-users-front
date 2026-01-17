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

  const isOpen = useCallback(
    (id) => !!opened[id],
    [opened]
  )

  return {
    isOpen,
    toggleIndex,
  }
}
