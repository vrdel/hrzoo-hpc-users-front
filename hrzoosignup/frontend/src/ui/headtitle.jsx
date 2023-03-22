import React from 'react'
import { Helmet } from 'react-helmet-async'


const HeadTitle = () => {
  return (
    <Helmet>
      <title>
        { `${ location.pathname } | HRZOO Prijava` }
      </title>
    </Helmet>
  )
}

export default HeadTitle
