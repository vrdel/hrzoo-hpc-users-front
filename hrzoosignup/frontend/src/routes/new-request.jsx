import React, { useState, useEffect, useContext } from 'react';
import { CustomReactSelect } from '../ui/CustomReactSelect';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from 'reactstrap';
import { SharedData } from '../main';

const NewRequest = () => {
  const [mainTitle, setMainTitle] = useState(undefined)
  const [linkDisabled, setButtonDisabled] = useState(undefined)
  const navigate = useNavigate()
  const { linkTitles } = useContext(SharedData);

  useEffect(() => {
    setMainTitle(linkTitles[location.pathname])
    if (location.pathname.endsWith('novi-zahtjev'))
      setButtonDisabled(false)
    else
      setButtonDisabled(true)
  }, [location.pathname])

  return (
    <>
      <div>
        { mainTitle }
      </div>
      <div>
        <CustomReactSelect
          options={[
            {
              "label": 'Istraživački projekt',
              "value": "Istraživački projekt"
            }
          ]}
          value={{
            "label": 'Istraživački projekt',
            "value": 'Istraživački projekt'
          }}
        />
      </div>
      <Button
        className="btn btn-success"
        disabled={linkDisabled}
        onClick={() => {
          navigate('istrazivacki-projekt')
        }}>
        Nastavi
      </Button>
      <Outlet />
    </>
  )
};

export default NewRequest;
