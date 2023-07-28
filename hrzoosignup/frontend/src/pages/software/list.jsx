import React, { useContext, useState, useEffect, useMemo } from 'react';
import { SharedData } from '../root';
import { Col, Row, Table, Input, Card, CardHeader, CardBody, Button, Collapse, Label, Form } from 'reactstrap';
import { PageTitle } from '../../components/PageTitle';
import { fetchScienceSoftware, addScienceSoftware, deleteScienceSoftware } from '../../api/software';
import { fetchOpsUsers } from '../../api/users';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useFieldArray, useForm, useWatch} from "react-hook-form";
import { HZSIPagination, TablePaginationHelper, EmptyTable } from "../../components/TableHelpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes, faSave, faWindowRestore } from "@fortawesome/free-solid-svg-icons";
import { convertToEuropean, convertTimeToEuropean } from '../../utils/dates'
import ModalAreYouSure from '../../components/ModalAreYouSure';
import { CustomReactSelect } from '../../components/CustomReactSelect'
import { AuthContext } from '../../components/AuthContextProvider';
import { EmptyTableSpinner } from '../../components/EmptyTableSpinner';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify'
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


const SoftwareListTableForm = ({pageTitle, dataSoftware, dataOpsUsers}) => {
  const [pageSize, setPageSize] = useState(50)
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

  const { userDetails, csrfToken } = useContext(AuthContext)
  const queryClient = useQueryClient()

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      applications: dataSoftware,
      searchName: "",
      searchCreated: "",
      searchAddedBy: "",
      newAppModuleName: "",
      newAppAddedBy: buildSelectValues([userDetails])[0]
    }
  })

  const searchName = useWatch({ control, name: "searchName" })
  const searchCreated = useWatch({ control, name: "searchCreated" })
  const searchAddedBy = useWatch({ control, name: "searchAddedBy" })
  const { fields, remove } = useFieldArray({ control, name: "applications" })

  const addMutation = useMutation({
    mutationFn: (data) => addScienceSoftware(data, csrfToken)
  })
  const deleteMutation = useMutation({
    mutationFn: (data) => deleteScienceSoftware(data, csrfToken)
  })

  let fieldsView = _.orderBy(fields, ['name'])
  let paginationHelp = new TablePaginationHelper(fieldsView.length, pageSize, pageIndex)

  if (searchName)
    fieldsView = fieldsView.filter(e => e.name.toLowerCase().includes(searchName.toLowerCase()))

  if (searchCreated)
    fieldsView = fieldsView.filter(e => convertToEuropean(e.created).includes(searchCreated.toLowerCase()))

  if (searchAddedBy)
    fieldsView = fieldsView.filter(e =>
    e.added_by.first_name.toLowerCase().includes(searchAddedBy.toLowerCase())
      || e.added_by.last_name.toLowerCase().includes(searchAddedBy.toLowerCase()))

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

  const doAdd = (data) => addMutation.mutate(data, {
    onSuccess: () => {
      queryClient.invalidateQueries('science-software-list')
      toast.success(
        <span className="font-monospace text-dark">
          Novi modulefile uspješno dodan
        </span>, {
          toastId: 'software-ok-add',
          autoClose: 2500,
          delay: 500,
        }
      )
    },
    onError: (error) => {
      toast.error(
        <span className="font-monospace text-dark">
          Modulefile nije bilo moguće dodati:
          { error.message }
        </span>, {
          toastId: 'software-fail-add',
          autoClose: 2500,
          delay: 500
        }
      )
    }
  })

  function doRemove(data) {
    remove(data.index)
    return deleteMutation.mutate(data, {
      onSuccess: () => {
        queryClient.invalidateQueries('science-software-list')
        toast.success(
          <span className="font-monospace text-dark">
            Modulefile uspješno izbrisan
          </span>, {
            toastId: 'software-ok-del',
            autoClose: 2500,
            delay: 500,
          }
        )
      },
      onError: (error) => {
        toast.error(
          <span className="font-monospace text-dark">
            Modulefile nije bilo moguće izbrisati:
            { error.message }
          </span>, {
            toastId: 'software-fail-del',
            autoClose: 2500,
            delay: 500
          }
        )
      }
    })
  }

  function onSubmit(data) {
    if (data) {
      for (var user of dataOpsUsers) {
        if (data['newAppAddedBy'].value.includes(user.first_name)
          && data['newAppAddedBy'].value.includes(user.last_name))
          data['username'] = user.username
      }
      doAdd(data)
    }
  }

  function onYesCallback() {
    if (onYesCall == 'doremove') {
      doRemove(onYesCallArg)
    }
  }

  let lookupIndexes = _.fromPairs(fields.map((e, index) => [e.id, index]))

  useEffect(() => {
    setValue("applications", dataSoftware)
  }, [dataSoftware.length])

  return (
    <React.Fragment>
      <Form onSubmit={ handleSubmit(onSubmit) } className="needs-validation">
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
                          Modulefile ili ime:
                        </Label>
                        <Controller
                          name="newAppModuleName"
                          control={ control }
                          render={({field}) =>
                            <Input
                              { ...field }
                              placeholder="Modulefile ili ime aplikacije"
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
      </Form>
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
                    setSortCreated(undefined)
                    setSortAddedBy(undefined)
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
                    setSortName(undefined)
                    setSortAddedBy(undefined)
                  }}
                >
                  <span>
                    Vrijeme
                  </span>
                  <span className="position-absolute start-100 top-50 translate-middle pe-5">
                    { sortArrow(sortCreated) }
                  </span>
                </th>
                <th className="fw-normal position-relative" style={{cursor: 'pointer'}}
                  onClick={() => {
                    setSortCreated(undefined)
                    setSortName(undefined)
                    setSortAddedBy(!sortAddedBy)
                  }}
                >
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
                  <Controller
                    name="searchCreated"
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
                  <Controller
                    name="searchAddedBy"
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
                            setOnYesCallArg({
                              'index': lookupIndexes[application.id],
                              'name': application.name,
                              'pk': application.pk
                            })
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
    </React.Fragment>
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
    return <SoftwareListTableForm
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
