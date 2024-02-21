import React, { useContext, useState, useEffect } from 'react';
import { fetchSpecificUser } from "Api/users";
import { fetchCroRISUser } from "Api/croris";
import { useQuery } from "@tanstack/react-query";
import { useParams } from 'react-router-dom';
import { SharedData } from 'Pages/root';
import { Row } from 'reactstrap';
import { PageTitle } from 'Components/PageTitle';
import StatusInfo from 'Components/user-info/StatusInfo';
import InstituteTableInfo from 'Components/user-info/UserInstitute';
import { EmptyCroRis, CroRisInfo } from 'Components/user-info/CroRis';


const UserChange = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);
  const { userId } = useParams()

  const {status, data: userData, error} = useQuery({
      queryKey: ['change-user', userId],
      queryFn: () => fetchSpecificUser(userId),
  })

  const targetOib = userData?.person_oib
  const {status: statusCroRis, data: croRisData} = useQuery({
      queryKey: ['croris-info', userId],
      queryFn: () => fetchCroRISUser(userData.person_oib),
      enabled: !!targetOib
  })

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname))
  }, [location.pathname])

  if (status === 'success' && userData)
    return (
      <>
        <Row>
          <PageTitle pageTitle={pageTitle}/>
        </Row>
        <StatusInfo myInfo={false} userDetails={userData} />
        <InstituteTableInfo myInfo={false} userDetails={userData} />
        {
          statusCroRis === 'success' && croRisData && croRisData.data
          ?
            <CroRisInfo croRisProjects={croRisData['data']} />
          :
            <EmptyCroRis />
        }
      </>
    )
};

export default UserChange;
