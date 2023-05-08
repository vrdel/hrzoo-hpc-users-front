import React, { useContext, useEffect, useState } from "react";
import { SharedData } from "../root";
import { fetchUsers } from "../../api/users"
import { useQuery } from "@tanstack/react-query";
import { Badge, Col, Row, Table } from "reactstrap";
import { PageTitle } from '../../components/PageTitle';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";


export const UsersList = () => {
  const { LinkTitles } = useContext(SharedData)
	const [pageTitle, setPageTitle] = useState(undefined)

	const { data: users } = useQuery({
		queryKey: ["all-users"],
		queryFn: fetchUsers
	})

	useEffect(() => {
		setPageTitle(LinkTitles(location.pathname))
	}, [location.pathname])

	if (users?.length > 0)
    return (
      <>
        <Row>
          <PageTitle pageTitle={ pageTitle } />
        </Row>
        <Row className="mt-4">
          <Col>
            <Table responsive hover className="shadow-sm">
              <thead id="hzsi-thead" className="table-active align-middle text-center text-white">
                <tr className="border-bottom border-1 border-dark">
                  <th className="fw-normal">
                    #
                  </th>
                  <th className="fw-normal">
                    Korisnička oznaka
                  </th>
                  <th className="fw-normal">
                    Ime i prezime
                  </th>
                  <th className="fw-normal">
                    Institucija
                  </th>
                  <th className="fw-normal">
                    Email
                  </th>
                  <th className="fw-normal">
                    Projekti
                  </th>
                  <th className="fw-normal">
                    Dodan SSH ključ
                  </th>
                </tr>
              </thead>
              <tbody>
                {
                  users.map((user, index) =>
                    <tr key={index}>
                      <td className="p-3 align-middle text-center">
                        { index + 1 }
                      </td>
                      <td className="p-3 align-middle text-center">
                        { user.username }
                      </td>
                      <td className="p-3 align-middle text-center">
                        { `${user.first_name} ${user.last_name}` }
                      </td>
                      <td className="p-3 align-middle text-center">
                        { user.person_institution }
                      </td>
                      <td className="p-3 align-middle text-center">
                        { user.person_mail }
                      </td>
                      <td className="p-3 align-middle text-center">
                        {
                          user.projects.map((proj, pid) => 
                            <Badge key={ pid } color={ `${proj.role === "lead" ? "success" : "primary"}` } className="fw-normal">
                              { proj.identifier }
                            </Badge>
                          )
                        }
                      </td>
                      <td className="p-3 align-middle text-center">
                        {
                          user.ssh_key ? 
                            <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#339900" }} />
                          :
                            <FontAwesomeIcon icon={faTimesCircle} style={{ color: "#CC0000" }} />
                        }
                      </td>
                    </tr>
                  )
                }
              </tbody>
            </Table>
          </Col>
        </Row>
      </>
    )
}