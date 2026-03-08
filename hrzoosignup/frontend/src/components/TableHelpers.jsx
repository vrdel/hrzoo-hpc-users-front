import React from "react"
import {
  Row,
  Col,
  Pagination,
  Placeholder
 } from "react-bootstrap"


export const SortArrow = (descending=undefined) => {
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


export function buildOptionsStates(intl) {
  let svi = intl.formatMessage({
    defaultMessage: "Svi",
    description: "tablehelpers-optionstates-1"
  })
  let podnesen = intl.formatMessage({
    defaultMessage: "Podnesen",
    description: "tablehelpers-optionstates-2"
  })
  let odobren = intl.formatMessage({
    defaultMessage: "Odobren",
    description: "tablehelpers-optionstates-3"
  })
  let odbijen = intl.formatMessage({
    defaultMessage: "Odbijen",
    description: "tablehelpers-optionstates-4"
  })
  let zavrsen = intl.formatMessage({
    defaultMessage: "Završen",
    description: "tablehelpers-optionstates-5"
  })
  let produljen = intl.formatMessage({
    defaultMessage: "Produljen",
    description: "tablehelpers-optionstates-6"
  })
  let produljenje = intl.formatMessage({
    defaultMessage: "Produljenje",
    description: "tablehelpers-optionstates-7"
  })
  let istice = intl.formatMessage({
    defaultMessage: "Ističe",
    description: "tablehelpers-optionstates-8"
  })

  const optionsStates = [
    { label: svi, value: "all" },
    { label: podnesen, value: "submit" },
    { label: odobren, value: "approve" },
    { label: odbijen, value: "deny" },
    { label: zavrsen, value: "expire" },
    { label: produljen, value: "extend" },
    { label: produljenje, value: "submit-extend" },
    { label: istice, value: "approve-expire" },
  ]

  return optionsStates
}


export function buildOptionsTypes(intl) {
  let svi = intl.formatMessage({
    defaultMessage: "Svi",
    description: "tablehelpers-optiontypes-1"
  })
  let istrazivacki = intl.formatMessage({
    defaultMessage: "Istraživački",
    description: "tablehelpers-optiontypes-2"
  })
  let istrazivackien = intl.formatMessage({
    defaultMessage: "Istraživački EU",
    description: "tablehelpers-optiontypes-3"
  })
  let institucijski = intl.formatMessage({
    defaultMessage: "Institucijski",
    description: "tablehelpers-optiontypes-4"
  })
  let interni = intl.formatMessage({
    defaultMessage: "Interni",
    description: "tablehelpers-optiontypes-5"
  })
  let rad = intl.formatMessage({
    defaultMessage: "Rad",
    description: "tablehelpers-optiontypes-6"
  })
  let nastava = intl.formatMessage({
    defaultMessage: "Nastava",
    description: "tablehelpers-optiontypes-7"
  })
  let srceworkshop = intl.formatMessage({
    defaultMessage: "Srce Radionica",
    description: "tablehelpers-optiontypes-8"
  })
  let merlin = intl.formatMessage({
    defaultMessage: "Merlin",
    description: "tablehelpers-optiontypes-9"
  })
  let ai = intl.formatMessage({
    defaultMessage: "AI",
    description: "tablehelpers-optiontypes-10"
  })
  const optionsTypes = [
    { label: svi, value: "all" },
    { label: ai, value: "ai" },
    { label: institucijski, value: "research-institutional" },
    { label: interni, value: "internal" },
    { label: istrazivacki, value: "research-croris" },
    { label: istrazivackien, value: "research-eu-croris" },
    { label: merlin, value: "merlin" },
    { label: nastava, value: "practical" },
    { label: rad, value: "thesis" },
    { label: srceworkshop, value: "srce-workshop" },
  ]

  return optionsTypes
}



export function buildOptionsStatesProjects(intl) {

  let svi = intl.formatMessage({
    defaultMessage: "Svi",
    description: "tablehelpers-optionstates-1"
  })
  let odobren = intl.formatMessage({
    defaultMessage: "Odobren",
    description: "tablehelpers-optionstates-3"
  })
  let zavrsen = intl.formatMessage({
    defaultMessage: "Završen",
    description: "tablehelpers-optionstates-5"
  })
  let produljen = intl.formatMessage({
    defaultMessage: "Produljen",
    description: "tablehelpers-optionstates-6"
  })
  let produljenje = intl.formatMessage({
    defaultMessage: "Produljenje",
    description: "tablehelpers-optionstates-7"
  })
  let istice = intl.formatMessage({
    defaultMessage: "Ističe",
    description: "tablehelpers-optionstates-8"
  })

  const optionsStatesProjects = [
    { label: svi, value: "all" },
    { label: odobren, value: "approve" },
    { label: zavrsen, value: "expire" },
    { label: produljen, value: "extend" },
    { label: produljenje, value: "submit-extend" },
    { label: istice, value: "approve-expire" },
  ]

  return optionsStatesProjects
}


export const allStates = ["submit", "approve", "deny", "expire", "extend", "submit-extend", "approve-expire"]
export const allProjectTypes = ["research-croris", "thesis", "practical", "research-institutional", "internal", "srce-workshop"]

export class TablePaginationHelper {
  searchLen = 0
  startIndex = 0

  constructor(fullLen, pageSize, pageIndex) {
    this.fullLen = fullLen
    this.pageNumArray = Array()
    this.pageSize = pageSize
    this.pagesIndex = pageIndex
    this.buildChoices()
    this.buildSlices()
  }

  buildChoices() {
    if (this.fullLen <= 30)
      this.pageNumArray = [30]
    else if (this.fullLen > 30 && this.fullLen <= 50)
      this.pageNumArray = [30, 50]
    else if (this.fullLen > 50 && this.fullLen <= 100)
      this.pageNumArray = [30, 50, 100]
    else if (this.fullLen > 100)
      this.pageNumArray = [30, 50, 100, this.fullLen]

    return this.pageNumArray
  }

  constructSlicesArrays(num, len) {
    let slices = Array()
    let times = Math.trunc(len / num)
    let start = 0
    let end = 0
    for (var i = 0; i < times; i++) {
      start = i * num
      end = start + num
      slices.push([start, end])
    }
    if (end)
      slices.push([end, len])
    return slices
  }

  buildSlices() {
    let pagesAndIndexes = Object()
    let len = this.fullLen

    if (this.searched)
      len = this.searchLen

    if (len <= 30)
      pagesAndIndexes['30'] = [[0, len]]
    else if (len > 30 && len <= 50) {
      pagesAndIndexes['30'] = this.constructSlicesArrays(30, len)
      pagesAndIndexes['50'] = this.constructSlicesArrays(50, len)
    }
    else if (len > 50 && len <= 100) {
      pagesAndIndexes['30'] = this.constructSlicesArrays(30, len)
      pagesAndIndexes['50'] = this.constructSlicesArrays(50, len)
      pagesAndIndexes['100'] = this.constructSlicesArrays(100, len)
    }
    else if (len > 100)
      pagesAndIndexes['30'] = this.constructSlicesArrays(30, len)
      pagesAndIndexes['50'] = this.constructSlicesArrays(50, len)
      pagesAndIndexes['100'] = this.constructSlicesArrays(100, len)

    pagesAndIndexes[len] = [[0, len]]
    if (this.searched)
      pagesAndIndexes[this.fullLen] = [[0, this.fullLen]]

    this.pagesIndexes = pagesAndIndexes
  }

  calcEndIndex() {
    return this.pageSize + this.startIndex
  }

  set pagesIndexes(slices) {
    this.pagesAndIndexes = slices
  }

  set searchNum(i) {
    this.searchLen = i
  }

  set isSearched(b) {
    this.searched = b
    if (this.searched)
      this.buildSlices()
  }

  get choices() {
    return this.buildChoices()
  }

  get end() {
    let arraySlices = this.pagesAndIndexes[this.pageSize]
    let targetSlice = arraySlices[this.pagesIndex]
    if (targetSlice)
      return targetSlice[1]
    else
      return this.fullLen
  }

  get pageCount() {
    let pages = 1
    let endIndex = this.calcEndIndex()

    if (endIndex >= this.fullLen)
      endIndex = this.fullLen

    if (endIndex - this.startIndex === this.fullLen)
      return pages
    else if (this.searched && this.searchLen <= this.pageSize)
      return pages
    else if (this.searched && this.searchLen > this.pageSize)
      return Math.trunc(this.searchLen / this.pageSize) + 1
    else
      return Math.trunc(this.fullLen / this.pageSize) + 1
  }

  get start() {
    let arraySlices = this.pagesAndIndexes[this.pageSize]
    let targetSlice = arraySlices[this.pagesIndex]
    if (targetSlice)
      return targetSlice[0]
    else
      return 0
  }
}


export const EmptyTable = ({ colspan, msg }) => (
  <>
    {
      [...Array(3)].map((_, i) => (
        <tr key={i}>
          <td colSpan={colspan} className="m-0 p-0 bg-light border-0">
            <Placeholder size="lg" xs={12} style={{height: '40px', backgroundColor: "rgba(255, 255, 255, 0)"}}/>
          </td>
        </tr>
      ))
    }
    <tr key="4">
      <td colSpan={colspan} className="table-light border-0 text-muted text-center p-3 fs-3">
        { msg }
      </td>
    </tr>
    {
      [...Array(3)].map((_, i) => (
        <tr key={i + 6}>
          <td colSpan={colspan} className="m-0 p-0 bg-light border-0">
            <Placeholder size="lg" xs={12} style={{height: '40px', backgroundColor: "rgba(255, 255, 255, 0)"}}/>
          </td>
        </tr>
      ))
    }
  </>
)


export const HZSIPagination = ({
  pageIndex,
  pageSize,
  setPageIndex,
  setPageSize,
  pageCount,
  start,
  choices,
  resource_name
}) => {
  return (
    <Row className="g-0">
      <Col className="d-flex flex-column flex-md-row align-items-center justify-content-center">
        <Pagination className="mt-2">
          <Pagination.First aria-label="First" disabled={pageIndex === 0} onClick={() => setPageIndex(0)} />
          <Pagination.Prev aria-label="Previous" disabled={pageIndex === 0} onClick={() => setPageIndex(pageIndex - 1)} />
          {
            [...Array(pageCount)].map((e, i) =>
              <Pagination.Item active={pageIndex === i ? true : false} key={i} onClick={() => setPageIndex(i)}>
                { i + 1 }
              </Pagination.Item>
            )
          }
          <Pagination.Next aria-label="Next" disabled={pageIndex === pageCount - 1} onClick={() => setPageIndex(pageIndex + 1)} />
          <Pagination.Last aria-label="Last" disabled={pageIndex === pageCount - 1} onClick={() => setPageIndex(pageCount - 1)} />
        </Pagination>
        <Pagination className="mt-0 mt-md-2">
          <Pagination.Item>
            <select
              style={{width: '180px'}}
              className="ms-1 form-control form-select text-primary"
              aria-label={`Broj ${resource_name}`}
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value))
                setPageIndex(Math.trunc(start / e.target.value))
              }}
            >
              {choices.map(pageSize => (
                <option label={`${pageSize} ${resource_name}`} key={pageSize} value={pageSize}>
                  {pageSize} {resource_name}
                </option>
              ))}
            </select>
          </Pagination.Item>
        </Pagination>
      </Col>
    </Row>
  )
}
