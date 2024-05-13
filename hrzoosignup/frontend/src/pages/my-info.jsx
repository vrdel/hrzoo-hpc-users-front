import React, { useContext, useState, useEffect } from 'react';
import { Row, Button } from 'reactstrap';
import { SharedData } from 'Pages/root';
import { PageTitle } from 'Components/PageTitle';
import { AuthContext } from 'Components/AuthContextProvider'
import { fetchCroRISMe } from 'Api/croris';
import { useQuery } from '@tanstack/react-query';
import StatusInfo from 'Components/user-info/StatusInfo';
import InstituteTableInfo from 'Components/user-info/UserInstitute';
import { EmptyCroRis, CroRisInfo } from 'Components/user-info/CroRis';
import { useIntl } from 'react-intl'


const MyInfo = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined)
  const intl = useIntl()
  const { userDetails } = useContext(AuthContext)

  const {status, data: croRisProjects, error, isFetching} = useQuery({
      queryKey: ['croris-info'],
      queryFn: fetchCroRISMe,
      staleTime: 15 * 60 * 1000
  })

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname, intl))
  }, [location.pathname, intl])

  return (
    <>
      <Row>
        <PageTitle pageTitle={pageTitle}/>
      </Row>

      <StatusInfo userDetails={userDetails} />
      <InstituteTableInfo userDetails={userDetails} />

      <Row style={{height: "40px"}}>
      </Row>

      {
        status && croRisProjects && croRisProjects.data
        ?
          <CroRisInfo croRisProjects={croRisProjects['data']} />
        :
          <EmptyCroRis />
      }
    </>
  )
};

export default MyInfo;
