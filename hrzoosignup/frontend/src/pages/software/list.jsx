import React, { useContext, useState, useEffect } from 'react';
import { SharedData } from '../root';
import { Col, Row, Table, Input, Card, CardHeader, CardBody, Button, Collapse, Label, Form } from 'reactstrap';
import { PageTitle } from 'Components/PageTitle';
import { fetchScienceSoftware, addScienceSoftware, deleteScienceSoftware } from 'Api/software';
import { fetchOpsUsers } from 'Api/users';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useFieldArray, useForm, useWatch} from "react-hook-form";
import { HZSIPagination, TablePaginationHelper, EmptyTable, SortArrow } from "Components/TableHelpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes, faSave, faWindowRestore } from "@fortawesome/free-solid-svg-icons";
import { convertToEuropean, convertTimeToEuropean } from 'Utils/dates'
import ModalAreYouSure from 'Components/ModalAreYouSure';
import { CustomReactSelect } from 'Components/CustomReactSelect'
import { AuthContext } from 'Components/AuthContextProvider';
import { EmptyTableSpinner } from 'Components/EmptyTableSpinner';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify'
import { useIntl, FormattedMessage } from 'react-intl'
import _ from 'lodash';


const ButtonAdd = ({setShowAddNew, showAddNew, faWindowRestore}) => {
  return (
    <Button size="sm" className="mt-1 mb-1"
      color={showAddNew ? "light" : "success"}
      onClick={() => setShowAddNew(!showAddNew)}
      active={ showAddNew }
    >
      <FontAwesomeIcon className="mt-1" icon={faWindowRestore} />{' '}
      <FormattedMessage
        defaultMessage="Dodaj"
        description="software-add"
      />
    </Button>
  )
}


const SoftwareListTableForm = ({pageTitle, dataSoftware, dataOpsUsers}) => {
  const [pageSize, setPageSize] = useState(50)
  const [pageIndex, setPageIndex] = useState(0)
  const [sortName, setSortName] = useState(undefined)
  const [sortCreated, setSortCreated] = useState(true)
  const [sortAddedBy, setSortAddedBy] = useState(undefined)
  const [showAddNew, setShowAddNew] = useState(false)

  const [areYouSureModal, setAreYouSureModal] = useState(false)
  const [modalTitle, setModalTitle] = useState(undefined)
  const [modalMsg, setModalMsg] = useState(undefined)
  const [onYesCall, setOnYesCall] = useState(undefined)
  const [onYesCallArg, setOnYesCallArg] = useState(undefined)

  const intl = useIntl()

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
    fieldsView = _.orderBy(fieldsView, ['added_by.first_name', 'added_by.last_name'], [sortAddedBy === true ? 'desc' : 'asc'])

  paginationHelp.searchNum = fieldsView.length

  const isSearched = searchName || searchCreated || searchAddedBy
  paginationHelp.isSearched = isSearched

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
          <FormattedMessage
            defaultMessage="Novi modulefile uspješno dodan"
            description="software-toast-ok"
          />
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
          <FormattedMessage
            defaultMessage="Modulefile nije bilo moguće dodati:"
            description="software-toast-fail"
          />
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
            <FormattedMessage
              defaultMessage="Modulefile uspješno izbrisan"
              description="software-toast-del-ok"
            />
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
            <FormattedMessage
              defaultMessage="Modulefile nije bilo moguće izbrisati:"
              description="software-toast-del-fail"
            />
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

  function calcIndex(index) {
    if (sortName || sortAddedBy || sortCreated)
      if (!isSearched)
        return fields.length + 1 - (pageIndex * pageSize + index + 1)
      else
        return paginationHelp.searchLen + 1 - (pageIndex * pageSize + index + 1)
    else
      return pageIndex * pageSize + index + 1
  }

  return (
    <React.Fragment>
      <Form onSubmit={ handleSubmit(onSubmit) } className="needs-validation">
        <Row>
          <PageTitle pageTitle={pageTitle}>
            <ButtonAdd
              setShowAddNew={setShowAddNew}
              showAddNew={showAddNew}
              faWindowRestore={faWindowRestore}
            />
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
                    <FormattedMessage
                      defaultMessage="Nova aplikacija"
                      description="software-cardheader"
                    />
                  </CardHeader>
                  <CardBody className="mb-1 bg-white text-dark">
                    <Row>
                      <Col className="text-left" md={{size: 8}}>
                        <Label
                          htmlFor="appName"
                          className="mr-1 mt-3 form-label fw-bold"
                          aria-label="appName">
                          <FormattedMessage
                            defaultMessage="Modulefile ili ime:"
                            description="software-cardbody-name"
                          />
                        </Label>
                        <Controller
                          name="newAppModuleName"
                          control={ control }
                          render={({field}) =>
                            <Input
                              { ...field }
                              placeholder={ intl.formatMessage({
                                defaultMessage: "Modulefile ili ime aplikacije",
                                description: "software-cardbody-placeholder"
                              }) }
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
                          <FormattedMessage
                            defaultMessage="Osoba:"
                            description="software-cardbody-person"
                          />
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
                          <FormattedMessage
                            defaultMessage="Spremi"
                            description="software-cardbody-save"
                          />
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
              <tr>
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
                    <FormattedMessage
                      defaultMessage="Modulefile aplikacije"
                      description="software-table-appname"
                    />
                  </span>
                  <span className="position-absolute start-100 top-50 translate-middle pe-5">
                    { SortArrow(sortName) }
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
                    <FormattedMessage
                      defaultMessage="Vrijeme"
                      description="software-table-time"
                    />
                  </span>
                  <span className="position-absolute start-100 top-50 translate-middle pe-5">
                    { SortArrow(sortCreated) }
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
                    <FormattedMessage
                      defaultMessage="Dodao"
                      description="software-table-added"
                    />
                  </span>
                  <span className="position-absolute start-100 top-50 translate-middle pe-5">
                    { SortArrow(sortAddedBy) }
                  </span>
                </th>
                <th className="fw-normal position-relative" style={{minWidth: '52px',  cursor: 'pointer'}}>
                  <FormattedMessage
                    defaultMessage="Radnje"
                    description="software-table-actions"
                  />
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
                        placeholder={ intl.formatMessage({
                          defaultMessage: "Traži",
                          description: "software-table-placeholder"
                        }) }
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
                        placeholder={ intl.formatMessage({
                          defaultMessage: "Traži",
                          description: "software-table-placeholder"
                        }) }
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
                        placeholder={ intl.formatMessage({
                          defaultMessage: "Traži",
                          description: "software-table-placeholder"
                        }) }
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
                        { calcIndex(index) }
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
                            setModalTitle(intl.formatMessage({
                              defaultMessage: "Brisanje modulefilea aplikacije",
                              description: "software-modaltitle"
                            }))
                            setModalMsg(intl.formatMessage({
                              defaultMessage: "Da li ste sigurni da želite obrisati modulefile?",
                              description: "software-modalmsg"
                            }))
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
                    <EmptyTable colspan="4" msg={ intl.formatMessage({
                      defaultMessage: "Nijedna aplikacija ne zadovoljava pretragu",
                      description: "software-empty-nosearchresult"
                    }) } />
                  :
                    <EmptyTable colspan="4" msg={ intl.formatMessage({
                      defaultMessage: "Nema aplikacija na klasteru",
                      description: "software-empty-noapp"
                    }) } />
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
        resource_name={intl.formatMessage({
          defaultMessage: "aplikacija",
          description: "software-pagination"
        })}
      />
    </React.Fragment>
  )
}


export const SoftwareList = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);
  const intl = useIntl()

  const { status: statusSoftware, data: dataSoftware} = useQuery({
    queryKey: ['science-software-list'],
    queryFn: fetchScienceSoftware,
  })

  const { status: statusOpsUsers, data: dataOpsUsers} = useQuery({
    queryKey: ['ops-users'],
    queryFn: fetchOpsUsers,
  })

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname, intl))
  }, [location.pathname, intl])

  if (statusSoftware === 'success' && statusOpsUsers === 'success')
    return <SoftwareListTableForm
      pageTitle={pageTitle}
      dataSoftware={dataSoftware}
      dataOpsUsers={dataOpsUsers}
    />

  else if (statusSoftware === 'loading' || statusOpsUsers === 'loading')
    return (
      <EmptyTableSpinner pageTitle={pageTitle} colSpan={5}
        PageTitleChild={ButtonAdd}
        PageTitleChildProps={{
          setShowAddNew: undefined,
          showAddNew: false,
          faWindowRestore: faWindowRestore
        }}
      >
        <thead id="hzsi-thead" className="align-middle text-center text-white">
          <tr>
            <th className="fw-normal position-relative"  style={{width: '52px'}}>
              <span>
                #
              </span>
            </th>
            <th className="fw-normal position-relative"  style={{minWidth: '60%', cursor: 'pointer'}}
            >
              <span>
                <FormattedMessage
                  defaultMessage="Modulefile aplikacije"
                  description="software-table-appname"
                />
              </span>
              <span className="position-absolute start-100 top-50 translate-middle pe-5">
                { SortArrow() }
              </span>
            </th>
            <th className="fw-normal position-relative" style={{cursor: 'pointer'}}
            >
              <span>
                <FormattedMessage
                  defaultMessage="Vrijeme"
                  description="software-table-time"
                />
              </span>
              <span className="position-absolute start-100 top-50 translate-middle pe-5">
                { SortArrow() }
              </span>
            </th>
            <th className="fw-normal position-relative" style={{cursor: 'pointer'}}>
              <span>
                <FormattedMessage
                  defaultMessage="Dodao"
                  description="software-table-added"
                />
              </span>
              <span className="position-absolute start-100 top-50 translate-middle pe-5">
                { SortArrow() }
              </span>
            </th>
            <th className="fw-normal position-relative" style={{minWidth: '52px',  cursor: 'pointer'}}>
              <FormattedMessage
                defaultMessage="Radnje"
                description="software-table-actions"
              />
            </th>
          </tr>
        </thead>
      </EmptyTableSpinner>
    )
};
