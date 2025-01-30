import React, { useContext, useEffect, useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from 'Components/AuthContextProvider';
import { fetchAccountingData } from "Api/accounting";
import { 
  Button, 
  ButtonGroup,
  Input, 
  Col,
  Row, 
  Label, 
  Dropdown, 
  DropdownMenu, 
  DropdownItem, 
  DropdownToggle 
} from "reactstrap";
import { PageTitle } from 'Components/PageTitle';
import { XAxis, YAxis, CartesianGrid, Bar, BarChart, Tooltip } from 'recharts';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquare } from "@fortawesome/free-solid-svg-icons";
import { SharedData } from "Pages/root";
import { useIntl, FormattedMessage } from 'react-intl'
import { defaultUnAuthnRedirect } from 'Config/default-redirect';
import { useNavigate } from "react-router-dom";


const colors = ["#12436D", "#28A197", "#801650", "#F46A25", "#3D3D3D", "#A285D1"]

const linearScale = <FormattedMessage 
  description="myaccounting-linearscale-button"
  defaultMessage="Linearna skala"
/>

const logScale = <FormattedMessage
  description="myaccounting-logscale-button"
  defaultMessage="Log skala"
/>

const cumulativeDisplay = <FormattedMessage 
  description="myaccounting-cumulative-button"
  defaultMessage="Kumulativni prikaz"
/>

const monthlyDisplay = <FormattedMessage
  description="myaccounting-monthly-button"
  defaultMessage="Mjesečni prikaz"
/>


const get_past_12_months = () => {
  const today = new Date()

  const year = today.getFullYear()
  const month = today.getMonth()
  console.log(month)

  let dates = []

  for (var i=month+2; i <= 12; i++) {
    if (i.toString().length == 1)
      dates.push(`0${i}/${year-1}`)

    else
      dates.push(`${i}/${year-1}`)
  }

  for (var j=1; j<= month + 1; j++) {
    if (j.toString().length == 1)
      dates.push(`0${j}/${year}`)

    else
      dates.push(`${j}/${year}`)
  }

  return dates
}


const MyAccounting = () => {
  const { userDetails } = useContext(AuthContext);
  const [padobranProjects, setPadobranProjects] = useState([])
  const [supekCPUProjects, setSupekCPUProjects] = useState([])
  const [supekGPUProjects, setSupekGPUProjects] = useState([])
  const [galaxyProjects, setGalaxyProjects] = useState([])
  const [jupyterCPUProjects, setJupyterCPUProjects] = useState([])
  const [jupyterGPUProjects, setJupyterGPUProjects] = useState([])
  const [useLogScale, setUseLogScale] = useState(false)
  const [showCumulative, setShowCumulative] = useState(false)
  const [listProjects, setListProjects] = useState([])
  const [subsetOfProjects, setSubsetOfProjects] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const { LinkTitles } = useContext(SharedData)
	const [pageTitle, setPageTitle] = useState(undefined)
  const [years, setYears] = useState([])
  const [selectedYear, setSelectedYear] = useState(undefined)
  const [useDefaultTimeRange, setUseDefaultTimeRange] = useState(true)
  const [isOpenYear, setIsOpenYear] = useState(false)

  const intl = useIntl()
  let navigate = useNavigate()

  const { status, data, error } = useQuery({
    queryKey: ["graph-data", userDetails.username],
    queryFn: () => fetchAccountingData()
  })

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname, intl))
    if (status === 'error' && error.message.includes('403'))
      navigate(defaultUnAuthnRedirect)
  }, [location.pathname, intl, status])

  const onProjectSelect = (selected) => {
    let index = subsetOfProjects.indexOf(selected)
    if (index < 0) {
      subsetOfProjects.push(selected)
    } else {
      subsetOfProjects.splice(index, 1)
    }

    setSubsetOfProjects([...subsetOfProjects])
  }

  const filterTime = (data) => {
    let result = data
    if (selectedYear) {
      result = data.filter((item) => {
        return item.month.endsWith(selectedYear)
      })
    }

    if (useDefaultTimeRange) {
      result = data.filter((item) => {
        return get_past_12_months().includes(item.month)
      })
    }
    return result
  }


  const UsageBarChart = ({ data, projects, stackId }) => {
    const graph_width = 1650

    return (
      <BarChart
        width={ graph_width }
        height={ 300 }
        data={ data }
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <XAxis dataKey="month" />
        {
          useLogScale ?
            <YAxis 
              scale="log" 
              domain={[1, "dataMax"]} 
              padding={{ top: 10 }} 
            />
          :
            <YAxis padding={{ top: 10 }} />
        }
        {
          projects.map((proj) => 
            <Bar 
              key={ proj } 
              label={{ 
                position: "top", 
                fontSize: 10, 
                fill: colors[listProjects.indexOf(proj)] 
              }} 
              dataKey={ proj } 
              stackId={ stackId }
              fill={ colors[listProjects.indexOf(proj)] } 
            />
          )
        }
      </BarChart>
    )
  } 

  useEffect(() => {
    if (status == "success" && data) {
      let supek_cpu = new Set()
      let supek_gpu = new Set()
      let supek_years = new Set()
      let padobran = new Set()
      let padobran_years = new Set()
      let galaxy = new Set()
      let galaxy_years = new Set()
      let jupyter_cpu = new Set()
      let jupyter_gpu = new Set()
      let jupyter_years = new Set()
      if ("supek" in data) {
        supek_cpu = new Set(data["supek"][`${showCumulative ? "cumulative" : "monthly"}`]["cpuh"].map(item => Object.keys(item)).flat())
        supek_gpu = new Set(data["supek"][`${showCumulative ? "cumulative" : "monthly"}`]["gpuh"].map(item => Object.keys(item)).flat())
        supek_cpu.delete("month")
        supek_gpu.delete("month")
        supek_years = new Set(data["supek"][`${showCumulative ? "cumulative" : "monthly"}`]["cpuh"].map(item => item["month"].substring(3)))
        if (subsetOfProjects.length > 0) {
          setSupekCPUProjects([...supek_cpu].filter(proj => subsetOfProjects.indexOf(proj) >= 0))
          setSupekGPUProjects([...supek_gpu].filter(proj => subsetOfProjects.indexOf(proj) >= 0))
        } else {
          setSupekCPUProjects(Array.from(supek_cpu).sort())
          setSupekGPUProjects(Array.from(supek_gpu).sort())
        }
      }

      if ("padobran" in data) {
        padobran = new Set(data["padobran"][`${showCumulative ? "cumulative" : "monthly"}`]["cpuh"].map(item => Object.keys(item)).flat())
        padobran.delete("month")
        padobran_years = new Set(data["padobran"][`${showCumulative ? "cumulative" : "monthly"}`]["cpuh"].map(item => item["month"].substring(3)))
        if (subsetOfProjects.length > 0) {
          setPadobranProjects([...padobran].filter(proj => subsetOfProjects.indexOf(proj) >= 0))
        } else {
          setPadobranProjects(Array.from(padobran).sort())
        }
      }

      if ("galaxy" in data) {
        galaxy = new Set(data["galaxy"][`${showCumulative ? "cumulative" : "monthly"}`]["cpuh"].map(item => Object.keys(item)).flat())
        galaxy.delete("month")
        galaxy_years = new Set(data["galaxy"][`${showCumulative ? "cumulative" : "monthly"}`]["cpuh"].map(item => item["month"].substring(3)))
        if (subsetOfProjects.length > 0) {
          setGalaxyProjects([...galaxy].filter(proj => subsetOfProjects.indexOf(proj) >= 0))
        } else {
          setGalaxyProjects(Array.from(galaxy).sort())
        }
      }

      if ("jupyter" in data) {
        jupyter_cpu = new Set(data["jupyter"][`${showCumulative ? "cumulative" : "monthly"}`]["cpuh"].map(item => Object.keys(item)).flat())
        jupyter_gpu = new Set(data["jupyter"][`${showCumulative ? "cumulative" : "monthly"}`]["gpuh"].map(item => Object.keys(item)).flat())
        jupyter_cpu.delete("month")
        jupyter_gpu.delete("month")
        galaxy_years = new Set(data["jupyter"][`${showCumulative ? "cumulative" : "monthly"}`]["cpuh"].map(item => item["month"].substring(3)))
        if (subsetOfProjects.length > 0) {
          setJupyterCPUProjects([...jupyter_cpu].filter(proj => subsetOfProjects.indexOf(proj) >= 0))
          setJupyterGPUProjects([...jupyter_gpu].filter(proj => subsetOfProjects.indexOf(proj) >= 0))
        } else {
          setJupyterCPUProjects(Array.from(jupyter_cpu).sort())
          setJupyterGPUProjects(Array.from(jupyter_gpu).sort())
        }
      }
      setListProjects(Array.from(new Set([...supek_cpu, ...supek_gpu, ...padobran, ...galaxy, ...jupyter_cpu, ...jupyter_gpu])).sort())
      setYears(Array.from(new Set([...supek_years, ...padobran_years, ...galaxy_years, ...jupyter_years])).sort())
    }
  }, [status, data, subsetOfProjects, showCumulative])

  if (error) {
    toast.error(
      <span className="font-monospace">
        { error.message }
      </span>, {
        theme: "colored",
        toastId: "accounting-record-error",
        autoClose: 2500,
        delay: 1000
      }
    )
  }

  if (data) {
    let groups = []

    if (supekCPUProjects.length > 0)
      groups.push(
        <Row>
          <h4>Supek CPUH</h4>
          <UsageBarChart
            data={
              "supek" in data ? 
                filterTime(data["supek"][`${showCumulative ? "cumulative" : "monthly"}`]["cpuh"]) 
              : 
                [] 
            }
            projects={ supekCPUProjects }
            stackId="supek-cpuh"
          />
        </Row>
      )

    if (supekGPUProjects.length > 0)
      groups.push(
        <Row>
          <h4>Supek GPUH</h4>
          <UsageBarChart
            data={ 
              "supek" in data ? 
                filterTime(data["supek"][`${showCumulative ? "cumulative" : "monthly"}`]["gpuh"]) 
              : 
                [] 
            }
            projects={ supekGPUProjects }
            stackId="supek-gpuh"
          />
        </Row>
      )

    if (padobranProjects.length > 0) 
      groups.push(
        <Row>
          <h4>Padobran CPUH</h4>
          <UsageBarChart
            data={ 
              "padobran" in data ? 
                filterTime(data["padobran"][`${showCumulative ? "cumulative" : "monthly"}`]["cpuh"]) 
              : 
                [] 
            }
            projects={ padobranProjects }
            stackId="padobran"
          />
        </Row>
      )

    if (galaxyProjects.length > 0)
      groups.push(
        <Row>
          <h4>Galaxy CPUH</h4>
          <UsageBarChart
            data={ 
              "galaxy" in data ? 
                filterTime(data["galaxy"][`${showCumulative ? "cumulative" : "monthly"}`]["cpuh"]) 
              : 
              [] 
            }
            projects={ galaxyProjects }
            stackId="galaxy"
          />
        </Row>
      )

    if (jupyterCPUProjects.length > 0)
      groups.push(
        <Row>
          <h4>Jupyter CPUH</h4>
          <UsageBarChart
            data={ 
              "jupyter" in data ? 
                filterTime(data["jupyter"][`${showCumulative ? "cumulative" : "monthly"}`]["cpuh"])
              : 
                [] 
            }
            projects={ jupyterCPUProjects }
            stackId="jupyter-cpuh"
          />
        </Row>
      )

    if (jupyterGPUProjects.length > 0)
      groups.push(
        <Row>
          <h4>Jupyter GPUH</h4>
          <UsageBarChart
            data={ 
              "jupyter" in data ? 
                filterTime(data["jupyter"][`${showCumulative ? "cumulative" : "monthly"}`]["gpuh"]) 
              : 
                [] 
            }
            projects={ jupyterGPUProjects }
            stackId="jupyter-gpuh"
          />
        </Row>
      )

    if (supekCPUProjects.length == 0 && supekGPUProjects.length == 0 && padobranProjects.length == 0 && galaxyProjects.length == 0 && jupyterCPUProjects.length == 0 && jupyterGPUProjects.length == 0)
      return (
        <Row className="mt-3 mb-3">
          <Col className="d-flex align-items-center justify-content-center shadow-sm bg-light border border-danger rounded text-muted text-center p-3 fs-3" style={{height: '400px'}} md={{offset: 1, size: 10}}>
            <FormattedMessage
              description="myaccounting-emptygraphs"
              defaultMessage="Nema zabilježenog iskorištenja resursa"
            />
          </Col>
        </Row>
      )
    else
      return (
        <>
          <Row>
            <PageTitle pageTitle={ pageTitle }>
              <ButtonGroup
                className="d-flex align-items-center justify-content-between"
              >
                <Button
                  color="secondary"
                  className="me-2 rounded"
                  onClick={ () => setShowCumulative(!showCumulative) }
                >
                  { showCumulative ? monthlyDisplay : cumulativeDisplay }
                </Button>
                <Button
                  color="secondary"
                  className="me-2 rounded"
                  onClick={ () => setUseLogScale(!useLogScale) }
                >
                  { useLogScale ? linearScale : logScale }
                </Button>
                <Dropdown 
                  isOpen={ isOpenYear } 
                  className="me-2"
                  toggle={ () => setIsOpenYear(!isOpenYear) }
                >
                  <DropdownToggle caret>
                    <FormattedMessage
                      description="myaccounting-year-dropdown"
                      defaultMessage="Godine"
                    />
                  </DropdownToggle>
                  <DropdownMenu>
                    {
                      years.map((year) => 
                        <DropdownItem 
                          key={ year } 
                          onClick={ () => {
                            setSelectedYear(year)
                            setUseDefaultTimeRange(false)
                          }}
                        >
                          { year }
                        </DropdownItem>
                      )
                    }
                    <DropdownItem 
                      key="default"
                      onClick={ () => {
                        setSelectedYear(undefined) 
                        setUseDefaultTimeRange(true)
                      }}
                      toggle={false}
                    >
                      <FormattedMessage
                        description="myaccounting-year-default"
                        defaultMessage="Prikaži zadnjih 12 mjeseci"
                      />
                    </DropdownItem>
                    <DropdownItem 
                      key="show-all"
                      onClick={ () => {
                        setSelectedYear(undefined) 
                        setUseDefaultTimeRange(false)
                      }}
                      toggle={false}
                    >
                      <FormattedMessage
                        description="myaccounting-year-showall"
                        defaultMessage="Prikaži sve"
                      />
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <Dropdown isOpen={ isOpen } toggle={ () => setIsOpen(!isOpen) }>
                  <DropdownToggle caret>
                    <FormattedMessage
                      description="myaccounting-projects-button"
                      defaultMessage="Projekti"
                    />
                  </DropdownToggle>
                  <DropdownMenu>
                    {
                      listProjects.map((project) => 
                        <DropdownItem key={ project } toggle={ false }>
                          <Input 
                            type="checkbox" 
                            className="mr-1" 
                            checked={ subsetOfProjects.indexOf(project) >= 0 } 
                            onClick={ () => onProjectSelect(project) }
                          />
                          <Label check>{ project }</Label>
                        </DropdownItem>
                      )
                    }
                  </DropdownMenu>
                </Dropdown>
              </ButtonGroup>
            </PageTitle>
          </Row>
          <Row>
          </Row>
          <Row className="mt-3">
          </Row>
          {
            groups.map(row => row)
          }
          <Row className="mt-3">
            <Col md={4}></Col>
            <Col md={4} className="d-flex align-items-center justify-content-center">
              <div>
                {
                  subsetOfProjects.length > 0 ?
                    subsetOfProjects.map((proj, index) => (
                      <p key={ proj }>
                        <FontAwesomeIcon icon={ faSquare } key={ proj } className="mt-1" color={ colors[index] } />
                        { " " }{ proj }
                      </p>
                    ))
                  :
                    listProjects.map((proj, index) => (
                      <p key={ proj }>
                        <FontAwesomeIcon icon={ faSquare } key={ proj } className="mt-1" color={ colors[index] } />
                        { " " }{ proj }
                      </p>
                    ))
                }
              </div>
            </Col>
          </Row>
        </>
      )
  }
}

export default MyAccounting