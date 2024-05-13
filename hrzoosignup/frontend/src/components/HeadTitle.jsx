import React, { useContext } from 'react'
import { SharedData } from '../pages/root';
import { Helmet } from 'react-helmet-async'
import { useIntl } from 'react-intl'


const HeadTitle = () => {
  const { LinkTitles } = useContext(SharedData);
  const intl = useIntl()

  return (
    <Helmet>
      <title>
        { `Napredno računanje - Zahtjev | ${ LinkTitles(location.pathname, intl) }` }
      </title>
    </Helmet>
  )
}

export default HeadTitle
