import React, { useContext } from 'react'
import { SharedData } from 'Pages/root';
import { Helmet } from 'react-helmet-async'
import { useIntl } from 'react-intl'


const HeadTitle = () => {
  const { LinkTitles } = useContext(SharedData);
  const intl = useIntl()

  const mainTitle = intl.formatMessage({
    defaultMessage: "Napredno računanje - Zahtjev",
    description: "headtitle-main"
  })

  return (
    <Helmet>
      <title>
        { `${mainTitle} | ${ LinkTitles(location.pathname, intl) }` }
      </title>
    </Helmet>
  )
}

export default HeadTitle
