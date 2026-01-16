import { useState, useCallback } from 'react'


export function usePopoverMap() {
  const [opened, setOpened] = useState({})

  const togglePopover = useCallback((id) => {
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

  const closePopover = useCallback((id) => {
    if (!id) return

    setOpened(prev => ({
      ...prev,
      [id]: false
    }))
  }, [])

  const closeAll = useCallback(() => {
    setOpened({})
  }, [])

  return {
    isOpen,
    togglePopover,
    closePopover,
    closeAll
  }
}
