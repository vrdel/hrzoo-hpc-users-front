import React, { useState, useEffect, useContext } from 'react';
import { CustomReactSelect } from '../ui/CustomReactSelect';
import { Outlet, useNavigate } from 'react-router-dom';
import { Col, Row, Button } from 'reactstrap';
import { SharedData } from '../main';
import { PageTitle } from '../ui/PageTitle';


const NewRequest = () => {
  const [pageTitle, setPageTitle] = useState(undefined)
  const [linkDisabled, setButtonDisabled] = useState(undefined)
  const navigate = useNavigate()
  const { linkTitles } = useContext(SharedData);

  useEffect(() => {
    setPageTitle(linkTitles[location.pathname])
    if (location.pathname.endsWith('novi-zahtjev'))
      setButtonDisabled(false)
    else
      setButtonDisabled(true)
  }, [location.pathname])

  return (
    <>
      <Row>
        <PageTitle pageTitle={pageTitle}/>
      </Row>
      <Row>
        <Col>
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
        </Col>
      </Row>
      <Row>
        <Outlet />
      </Row>
    </>
  )
};

export default NewRequest;
