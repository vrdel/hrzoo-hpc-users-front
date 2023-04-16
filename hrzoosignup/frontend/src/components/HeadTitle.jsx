import React, { useContext } from 'react'
import { SharedData } from '../pages/root';
import { Helmet } from 'react-helmet-async'


const HeadTitle = () => {
  const { LinkTitles } = useContext(SharedData);

  return (
    <Helmet>
      <title>
        { `Napredno računanje - Zahtjev | ${ LinkTitles(location.pathname) }` }
      </title>
    </Helmet>
  )
}

export default HeadTitle
