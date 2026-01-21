import { useState, useEffect, useContext } from 'react';
import { useIntl } from 'react-intl'
import { SharedData } from "Pages/root";


export function usePageTitle(location) {
  const { LinkTitles } = useContext(SharedData)
	const [pageTitle, setPageTitle] = useState(undefined)
  const intl = useIntl()

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname, intl))
  }, [location.pathname, intl])

  return pageTitle
}
