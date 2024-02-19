import React, { useContext, useState, useEffect } from 'react';
import { fetchSpecificUser } from "Api/users";
import { useQuery } from "@tanstack/react-query";
import { useParams } from 'react-router-dom';
import { SharedData } from 'Pages/root';
import { Col, Row } from 'reactstrap';
import { PageTitle } from 'Components/PageTitle';
import StatusInfo from 'Components/user-info/StatusInfo';


const UserChange = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);
  const { userId } = useParams()

  const {status, data: userData, error} = useQuery({
      queryKey: ['change-user', userId],
      queryFn: () => fetchSpecificUser(userId),
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
      </>
    )
};

export default UserChange;
