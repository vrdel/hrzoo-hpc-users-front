import React, { useContext, useState, useEffect } from 'react';
import { fetchSpecificUser } from "Api/users";
import { fetchCroRISUser } from "Api/croris";
import { useQuery } from "@tanstack/react-query";
import { useParams } from 'react-router-dom';
import { SharedData } from 'Pages/root';
import { Row, Col, Table, Badge } from 'reactstrap';
import { PageTitle } from 'Components/PageTitle';
import StatusInfo from 'Components/user-info/StatusInfo';
import InstituteTableInfo from 'Components/user-info/UserInstitute';
import { EmptyCroRis, CroRisInfo } from 'Components/user-info/CroRis';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TypeString, TypeColor } from 'Config/map-projecttypes';
import { StateIcons } from "Config/map-states";
import { Link } from 'react-router-dom';
import { convertToEuropean } from 'Utils/dates';
import { copyToClipboard } from 'Utils/copy-clipboard';
import {
  faCopy,
} from '@fortawesome/free-solid-svg-icons';
import { url_ui_prefix } from 'Config/general';
import { MiniButton } from 'Components/MiniButton';
import { TableUserKeys } from 'Components/sshkeys/UserKeys';
import _ from "lodash";
import { fetchSshKeys } from 'Api/sshkeys';


const UserProjectsTable = ({projects}) => {
  return (
    <Row className="mt-4 ms-2 me-3 g-0">
      <Col>
        <Table responsive hover className="shadow-sm">
          <thead id="hzsi-thead" className="align-middle text-center text-white">
            <tr>
              <th className="fw-normal"  style={{width: '52px'}}>
                #
              </th>
              <th className="fw-normal" style={{width: '92px'}}>
                Stanje
              </th>
              <th className="fw-normal">
                Naziv projekta i institucija nositelj
              </th>
              <th className="fw-normal">
                Šifra
              </th>
              <th className="fw-normal">
                Tip
              </th>
              <th className="fw-normal" style={{maxWidth: '100px'}}>
                Resursi
              </th>
              <th className="fw-normal">
                Uloga
              </th>
              <th className="fw-normal">
                Odobren
              </th>
            </tr>
          </thead>
          <tbody>
            {
              projects.map((pro, index) =>
                <tr key={ index }>
                  <td className="p-3 align-middle text-center">
                    { projects.length - index }
                  </td>
                  <td className="p-3 align-middle text-center">
                    { StateIcons(pro.project.state.name) }
                  </td>
                  <td className="p-3 align-middle fw-bold text-center">
                    <Row>
                      <Col>
                        <Link className="text-dark" to={`${url_ui_prefix}/projekti/${encodeURIComponent(pro.project.identifier)}`}>
                          { pro.project.name}
                        </Link>
                      </Col>
                    </Row>
                    <Row className="pt-1">
                      <Col className="fw-medium fst-italic">
                        <small>{ pro.project.institute }</small>
                      </Col>
                    </Row>
                  </td>
                  <td className="align-middle text-center">
                    <Row className="g-0 d-flex justify-content-center align-items-center">
                      <Col className="d-flex justify-content-center align-items-center align-self-center">
                        <Badge color="secondary" className="fw-normal">
                          { pro.project.identifier }
                        </Badge>
                        <MiniButton
                          childClassName="me-3"
                          onClick={(e) => copyToClipboard(
                            e, pro.project.identifier,
                            "Šifra projekta kopirana u međuspremnik",
                            "Greška prilikom kopiranja šifre projekta u međuspremnik",
                            "id-uid"
                          )}
                        >
                          <FontAwesomeIcon size="xs" icon={faCopy} />
                        </MiniButton>
                      </Col>
                    </Row>
                  </td>
                  <td className="align-middle text-center">
                    <span className={ `badge fw-normal position-relative ${TypeColor(pro.project.project_type.name)}` }>
                      { TypeString(pro.project.project_type.name) }
                      {
                        _.findIndex(pro.project.croris_finance, (fin) => fin.toLowerCase().includes('euro')) > -1 &&
                        <span className="position-absolute fw-normal top-100 start-100 translate-middle badge rounded-pill bg-danger">
                          EU
                          <span className="visually-hidden">EU</span>
                        </span>
                      }
                    </span>
                  </td>
                  <td className="align-middle text-center">
                    <Row>
                      <Col>
                        {
                          pro.project.staff_resources_type.map((rtype, i) =>
                            i <= 2 &&
                            <span className="ms-1 p-1 fw-normal" key={i}
                              style={{
                                backgroundColor: '#feb272',
                                color: '#303030',
                                borderRadius: '2px',
                                fontSize: '0.83rem'
                              }}>
                              {rtype.value}
                            </span>)
                        }
                      </Col>
                    </Row>
                    <Row className="mt-1">
                      <Col>
                        {
                          pro.project.staff_resources_type.map((rtype, i) =>
                            i > 2 && i <=5 &&
                            <span className="ms-1 p-1 fw-normal" key={i}
                              style={{
                                backgroundColor: '#feb272',
                                color: '#303030',
                                borderRadius: '2px',
                                fontSize: '0.83rem'
                              }}>
                              {rtype.value}
                            </span>)
                        }
                      </Col>
                    </Row>
                    <Row className="mt-1">
                      <Col>
                        {
                          pro.project.staff_resources_type.map((rtype, i) =>
                            i > 5 &&
                            <span className="ms-1 p-1 fw-normal" key={i}
                              style={{
                                backgroundColor: '#feb272',
                                color: '#303030',
                                borderRadius: '2px',
                                fontSize: '0.83rem'
                              }}>
                              {rtype.value}
                            </span>)
                        }
                      </Col>
                    </Row>
                  </td>
                  <td className="align-middle text-center">
                    {
                      pro.role.name === 'lead' ?
                        <Badge className="fw-normal" color="success">
                          voditelj
                        </Badge>
                      :
                        <Badge className="fw-normal" color="primary">
                          suradnik
                        </Badge>
                    }
                  </td>
                  <td className="align-middle text-center fs-6 font-monospace">
                    { convertToEuropean(pro.project.date_approved) }
                  </td>
                </tr>
              )
            }
          </tbody>
        </Table>
      </Col>
    </Row>
  )
}


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
      queryFn: () => fetchCroRISUser(targetOib),
      enabled: !!targetOib
  })

  const targetUsername = userData?.username
  const {status: statusSshKeys, data: userSshKeys} = useQuery({
      queryKey: ['user-ssh-keys', targetUsername],
      queryFn: () => fetchSshKeys(targetUsername),
      enabled: !!targetUsername
  })

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname))
  }, [location.pathname])

  if (status === 'success' && userData) {
    let interestedProjecs = userData.userproject_set.filter(pro => pro.project.state.name !== 'deny' && pro.project.state.name !== 'submit')
    interestedProjecs = _.orderBy(interestedProjecs, ['project.date_approved'], ['desc'])

    return (
      <>
        <Row>
          <PageTitle pageTitle={pageTitle}/>
        </Row>
        <StatusInfo myInfo={false} userDetails={userData} />
        {
          interestedProjecs.length > 0 &&
          <UserProjectsTable projects={interestedProjecs} />
        }
        {
          statusSshKeys === 'success'
          ?
            <TableUserKeys sshKeys={userSshKeys} />
          :
            ''
        }
        <InstituteTableInfo myInfo={false} userDetails={userData} />
        {
          statusCroRis === 'loading' ?
            <EmptyCroRis spinner={true} changeView={true} />
          :
            statusCroRis === 'success' && croRisData && croRisData.data
            ?
              <CroRisInfo croRisProjects={croRisData['data']} changeView={true} />
            :
              <EmptyCroRis changeView={true} />
        }
      </>
    )
  }
};

export default UserChange;
