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
import { usePageTitle } from 'Hooks/pagetitle';


const MyInfo = () => {
  const pageTitle = usePageTitle(location)
  const { userDetails } = useContext(AuthContext)

  const {status, data: croRisProjects, error, isFetching} = useQuery({
      queryKey: ['croris-info'],
      queryFn: fetchCroRISMe,
      staleTime: 15 * 60 * 1000
  })

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
