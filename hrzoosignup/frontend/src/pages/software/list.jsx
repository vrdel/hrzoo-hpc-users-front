import React, { useContext, useState, useEffect } from 'react';
import { SharedData } from '../root';
import { Col, Row, Table, Input, Card, CardHeader, CardBody, Button, Collapse, Label } from 'reactstrap';
import { PageTitle } from '../../components/PageTitle';
import { fetchScienceSoftware } from '../../api/software';
import { fetchOpsUsers } from '../../api/users';
import { useQuery } from '@tanstack/react-query';
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { HZSIPagination, TablePaginationHelper, EmptyTable } from "../../components/TableHelpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes, faSave, faWindowRestore } from "@fortawesome/free-solid-svg-icons";
import { convertToEuropean, convertTimeToEuropean } from '../../utils/dates'
import ModalAreYouSure from '../../components/ModalAreYouSure';
import { CustomReactSelect } from '../../components/CustomReactSelect'
import { AuthContext } from '../../components/AuthContextProvider';
import { EmptyTableSpinner } from '../../components/EmptyTableSpinner';
import _ from 'lodash';


const sortArrow = (descending=undefined) => {
  if (descending === true)
    return (
      <span>{' '}&uarr;</span>
    )
  else if (descending === false)
    return (
      <span>&darr;{' '}</span>
    )
  else
    return (
      <>
        <span>&uarr;</span>
        <span>&darr;</span>
      </>
    )
}


const SoftwareListTable = ({pageTitle, dataSoftware, dataOpsUsers}) => {
  const [pageSize, setPageSize] = useState(30)
  const [pageIndex, setPageIndex] = useState(0)
  const [sortName, setSortName] = useState(undefined)
  const [sortCreated, setSortCreated] = useState(undefined)
  const [sortAddedBy, setSortAddedBy] = useState(undefined)
  const [showAddNew, setShowAddNew] = useState(false)

  const [areYouSureModal, setAreYouSureModal] = useState(false)
  const [modalTitle, setModalTitle] = useState(undefined)
  const [modalMsg, setModalMsg] = useState(undefined)
  const [onYesCall, setOnYesCall] = useState(undefined)
  const [onYesCallArg, setOnYesCallArg] = useState(undefined)

  const { userDetails } = useContext(AuthContext)

  const { control, setValue } = useForm({
    defaultValues: {
      applications: dataSoftware,
      searchName: "",
      newAppModuleName: '',
      newAppAddedBy: buildSelectValues([userDetails])[0]
    }
  })

  const searchName = useWatch({ control, name: "searchName" })
  const { fields, remove } = useFieldArray({ control, name: "applications" })

  let fieldsView = fields

  let paginationHelp = new TablePaginationHelper(fieldsView.length, pageSize, pageIndex)

  if (searchName)
    fieldsView = fieldsView.filter(e => e.name.toLowerCase().includes(searchName.toLowerCase()))

  if (sortName !== undefined)
    fieldsView = _.orderBy(fieldsView, ['name'], [sortName === true ? 'desc' : 'asc'])

  if (sortCreated !== undefined)
    fieldsView = _.orderBy(fieldsView, ['created'], [sortCreated === true ? 'desc' : 'asc'])

  if (sortAddedBy !== undefined)
    fieldsView = _.orderBy(fieldsView, ['added_by.first_name', 'added_by.last_name'], [sortCreated === true ? 'desc' : 'asc'])

  paginationHelp.searchNum = fieldsView.length
  paginationHelp.isSearched = searchName === true

  fieldsView = fieldsView.slice(paginationHelp.start, paginationHelp.end)

  function buildSelectValues(opsusers) {
    return opsusers.map(user => ({
      'value': `${user.first_name} ${user.last_name}`,
      'label': `${user.first_name} ${user.last_name}`
    }))
  }

  function doRemove(index) {
    console.log('VRDEL DEBUG', index)
    //remove(index)
  }

  function onYesCallback() {
    if (onYesCall == 'doremove') {
      doRemove(onYesCallArg)
    }
  }

  return (
    <>
      <Row>
        <PageTitle pageTitle={pageTitle}>
          <Button color="success" onClick={() => setShowAddNew(!showAddNew)}>
            <FontAwesomeIcon className="mt-1" icon={faWindowRestore} />{' '}
            Dodaj
          </Button>
        </PageTitle>
      </Row>
      <ModalAreYouSure
        isOpen={areYouSureModal}
        toggle={() => setAreYouSureModal(!areYouSureModal)}
        title={modalTitle}
        msg={modalMsg}
        onYes={onYesCallback}
      />
      <Row>
        <Collapse className="m-2 p-2" isOpen={showAddNew}>
          <Row>
            <Col xl={{offset: 2, size: 8}}>
              <Card className="bg-success me-5 mt-4 text-white">
                <CardHeader>
                  Nova aplikacija
                </CardHeader>
                <CardBody className="mb-1 bg-white text-dark">
                  <Row>
                    <Col className="text-left" md={{size: 8}}>
                      <Label
                        htmlFor="appName"
                        className="mr-1 mt-3 form-label fw-bold"
                        aria-label="appName">
                        Modulefile:
                      </Label>
                      <Controller
                        name="newAppModuleName"
                        control={ control }
                        render={({field}) =>
                          <Input
                            { ...field }
                            placeholder="Ime modulefile-a aplikacije"
                            className="form-control"
                          />
                        }
                      />
                    </Col>
                    <Col>
                      <Label
                        htmlFor="newAppModuleName"
                        className="mr-1 mt-3 form-label fw-bold"
                        aria-label="newAppModuleName">
                        Osoba:
                      </Label>
                      <Controller
                        name="newAppAddedBy"
                        control={control}
                        rules={{required: true}}
                        render={ ({field}) =>
                          <CustomReactSelect
                            aria-label="newAppAddedBy"
                            forwardedRef={field.ref}
                            id="newAppAddedBy"
                            options={buildSelectValues(dataOpsUsers)}
                            value={field.value}
                            onChange={(e) => setValue('newAppAddedBy', e)}
                          />
                        }
                      />
                    </Col>
                  </Row>
                  <Row className="mt-3 text-center">
                    <Col>
                      <Button color="success" id="submit-button" type="submit">
                        <FontAwesomeIcon icon={faSave}/>{' '}
                        Spremi
                      </Button>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Collapse>
      </Row>
      <Row className="g-0 mt-4">
        <Col sm={{size: 12}}>
          <Table responsive hover className="shadow-sm">
            <thead id="hzsi-thead" className="align-middle text-center text-white">
              <tr className="border-2 border-dark" style={{'borderLeft': 0, 'borderTop': 0, 'borderRight': 0}}>
                <th className="fw-normal position-relative"  style={{width: '52px'}}>
                  <span>
                    #
                  </span>
                </th>
                <th className="fw-normal position-relative"  style={{minWidth: '60%', cursor: 'pointer'}}
                  onClick={() => {
                    setSortName(!sortName)
                  }}
                >
                  <span>
                    Modulefile aplikacije
                  </span>
                  <span className="position-absolute start-100 top-50 translate-middle pe-5">
                    { sortArrow(sortName) }
                  </span>
                </th>
                <th className="fw-normal position-relative" style={{cursor: 'pointer'}}
                  onClick={() => {
                    setSortCreated(!sortCreated)
                  }}
                >
                  <span>
                    Vrijeme
                  </span>
                  <span className="position-absolute start-100 top-50 translate-middle pe-5">
                    { sortArrow(sortCreated) }
                  </span>
                </th>
                <th className="fw-normal position-relative" style={{cursor: 'pointer'}}>
                  <span>
                    Dodao
                  </span>
                  <span className="position-absolute start-100 top-50 translate-middle pe-5">
                    { sortArrow(sortAddedBy) }
                  </span>
                </th>
                <th className="fw-normal position-relative" style={{minWidth: '52px',  cursor: 'pointer'}}>
                  Radnje
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 align-middle text-center">
                  <FontAwesomeIcon icon={ faSearch } />
                </td>
                <td className="p-2 align-middle text-center">
                  <Controller
                    name="searchName"
                    control={ control }
                    render={ ({ field }) =>
                      <Input
                        { ...field }
                        placeholder="Traži"
                        className="form-control"
                        style={{fontSize: '0.83rem'}}
                      />
                    }
                  />
                </td>
                <td>
                </td>
                <td>
                </td>
                <td>
                </td>
              </tr>
              {
                fieldsView.length > 0 ?
                  fieldsView.map((application, index) =>
                    <tr key={index}>
                      <td className="p-3 align-middle text-center">
                        { pageIndex * pageSize + index + 1 }
                      </td>
                      <td className="p-3 align-middle text-center fw-bold">
                        { application.name }
                      </td>
                      <td className="p-3 align-middle text-center font-monospace fs-6">
                        { convertToEuropean(application.created) }
                        <br/>
                        { convertTimeToEuropean(application.created) }
                      </td>
                      <td className="p-3 align-middle text-center">
                        { application.added_by.first_name } { application.added_by.last_name }
                      </td>
                      <td className="p-3 text-center align-middle">
                        <Button
                          size="sm"
                          className="d-flex-column align-items-center justify-content-center"
                          color="danger"
                          onClick={() => {
                            setAreYouSureModal(!areYouSureModal)
                            setModalTitle("Brisanje modulefilea aplikacije")
                            setModalMsg("Da li ste sigurni da želite obrisati modulefile?")
                            setOnYesCall('doremove')
                            setOnYesCallArg(index)
                          }}
                        >
                          <FontAwesomeIcon className="mt-1" icon={faTimes} />
                        </Button>
                      </td>
                    </tr>
                  )
                :
                  dataSoftware.length > 0 && searchName ?
                    <EmptyTable colspan="4" msg="Nijedna aplikacija ne zadovoljava pretragu" />
                  :
                    <EmptyTable colspan="4" msg="Nema aplikacija na klasteru" />
              }
            </tbody>
          </Table>
        </Col>
        <Col>
        </Col>
      </Row>
      <HZSIPagination
        pageIndex={ pageIndex }
        pageSize={ pageSize }
        setPageIndex={ setPageIndex }
        setPageSize={ setPageSize }
        pageCount={ paginationHelp.pageCount }
        start={ paginationHelp.start }
        choices={ paginationHelp.choices }
        resource_name="aplikacija"
      />
    </>
  )
}


export const SoftwareList = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);

  const { status: statusSoftware, data: dataSoftware} = useQuery({
    queryKey: ['science-software-list'],
    queryFn: fetchScienceSoftware,
  })

  const { status: statusOpsUsers, data: dataOpsUsers} = useQuery({
    queryKey: ['ops-users'],
    queryFn: fetchOpsUsers,
  })

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname))
  }, [location.pathname])

  if (statusSoftware === 'success' && statusOpsUsers === 'success')
    return <SoftwareListTable
      pageTitle={pageTitle}
      dataSoftware={dataSoftware}
      dataOpsUsers={dataOpsUsers}
      />
  else if (statusSoftware === 'loading' || statusOpsUsers === 'loading')
    return (
      <EmptyTableSpinner pageTitle={pageTitle} colSpan={5}>
        <thead id="hzsi-thead" className="align-middle text-center text-white">
          <tr className="border-2 border-dark" style={{'borderLeft': 0, 'borderTop': 0, 'borderRight': 0}}>
            <th className="fw-normal position-relative"  style={{width: '52px'}}>
              <span>
                #
              </span>
            </th>
            <th className="fw-normal position-relative"  style={{minWidth: '60%', cursor: 'pointer'}}
            >
              <span>
                Modulefile aplikacije
              </span>
              <span className="position-absolute start-100 top-50 translate-middle pe-5">
                { sortArrow() }
              </span>
            </th>
            <th className="fw-normal position-relative" style={{cursor: 'pointer'}}
            >
              <span>
                Vrijeme
              </span>
              <span className="position-absolute start-100 top-50 translate-middle pe-5">
                { sortArrow() }
              </span>
            </th>
            <th className="fw-normal position-relative" style={{cursor: 'pointer'}}>
              <span>
                Dodao
              </span>
              <span className="position-absolute start-100 top-50 translate-middle pe-5">
                { sortArrow() }
              </span>
            </th>
            <th className="fw-normal position-relative" style={{minWidth: '52px',  cursor: 'pointer'}}>
              Radnje
            </th>
          </tr>
        </thead>
      </EmptyTableSpinner>
    )

};
