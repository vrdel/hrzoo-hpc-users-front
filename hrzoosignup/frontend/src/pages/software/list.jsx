import React, { useContext, useState, useEffect } from 'react';
import { SharedData } from '../root';
import { Col, Row, Table, Input } from 'reactstrap';
import { PageTitle } from '../../components/PageTitle';
import { fetchScienceSoftware } from '../../api/software';
import { useQuery } from '@tanstack/react-query';
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { HZSIPagination, TablePaginationHelper, EmptyTable } from "../../components/TableHelpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { convertToEuropean, convertTimeToEuropean } from '../../utils/dates'
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


const SoftwareListTable = ({pageTitle, data}) => {
  const [pageSize, setPageSize] = useState(30)
  const [pageIndex, setPageIndex] = useState(0)
  const [sortName, setSortName] = useState(undefined)
  const [sortCreated, setSortCreated] = useState(undefined)
  const [sortAddedBy, setSortAddedBy] = useState(undefined)

  const { control, setValue } = useForm({
    defaultValues: {
      applications: data,
      searchName: "",
    }
  })

  const searchName = useWatch({ control, name: "searchName" })
  const { fields } = useFieldArray({ control, name: "applications" })

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

  return (
    <>
      <Row>
        <PageTitle pageTitle={pageTitle}/>
      </Row>
      <Row>
        <Col sm={{size: 7}}>
          <Table responsive hover className="shadow-sm">
            <thead id="hzsi-thead" className="align-middle text-center text-white">
              <tr className="border-bottom border-dark">
                <th className="fw-normal"  style={{width: '52px'}}>
                  #
                </th>
                <th className="fw-normal border-0 d-flex justify-content-center"  style={{minWidth: '286px', cursor: 'pointer'}}
                  onClick={() => {
                    setSortName(!sortName)
                  }}
                >
                  <div className="flex-grow-1">
                    Modulefile aplikacije
                  </div>
                  <div>
                    { sortArrow(sortName) }
                  </div>
                </th>
                <th className="fw-normal border-0 d-flex justify-content-center" style={{minWidth: '146px', cursor: 'pointer'}}
                  onClick={() => {
                    setSortCreated(!sortCreated)
                  }}
                >
                  <div className="flex-grow-1">
                    Vrijeme
                  </div>
                  <div>
                    { sortArrow(sortCreated) }
                  </div>
                </th>
                <th className="fw-normal border-0 d-flex justify-content-center" style={{minWidth: '158px', cursor: 'pointer'}}
                  onClick={() => {
                    setSortAddedBy(!sortAddedBy)
                  }}
                >
                  <div className="flex-grow-1">
                    Dodao
                  </div>
                  <div>
                    { sortArrow(sortAddedBy) }
                  </div>
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
                    </tr>
                  )
                :
                  data.length > 0 && searchName ?
                    <EmptyTable colspan="4" msg="Nijedna aplikacija ne zadovoljava pretragu" />
                  :
                    <EmptyTable colspan="4" msg="Nema aplikacija na klasteru" />
              }
            </tbody>
          </Table>
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

  const { status, data} = useQuery({
    queryKey: ['science-software-list'],
    queryFn: fetchScienceSoftware,
  })

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname))
  }, [location.pathname])

  if (status === 'success')
    return <SoftwareListTable pageTitle={pageTitle} data={data}/>
};
