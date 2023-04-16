import React from 'react'
import { Helmet } from 'react-helmet-async'


const HeadTitle = () => {
  return (
    <Helmet>
      <title>
        { `Napredno računanje - Zahtjev | ${ location.pathname }` }
      </title>
    </Helmet>
  )
}

export default HeadTitle
