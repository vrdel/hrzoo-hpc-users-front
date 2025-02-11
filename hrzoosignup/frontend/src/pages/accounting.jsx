import React, { useContext, useEffect, useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from 'Components/AuthContextProvider';
import { 
  fetchAccountingData, 
  fetchProjectAccountingData 
} from "Api/accounting";
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
  DropdownToggle, 
  Nav,
  NavItem
} from "reactstrap";
import { useNavigate, NavLink } from 'react-router-dom';
import { PageTitle } from 'Components/PageTitle';
import { XAxis, YAxis, CartesianGrid, Bar, BarChart, Tooltip } from 'recharts';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquare } from "@fortawesome/free-solid-svg-icons";
import { SharedData } from "Pages/root";
import { useIntl, FormattedMessage } from 'react-intl'
import { defaultUnAuthnRedirect } from 'Config/default-redirect';


const colors = ["#12436D", "#28A197", "#801650", "#F46A25", "#3D3D3D", "#A285D1"]

const cumulativeDisplay = <FormattedMessage 
  description="myaccounting-cumulative-button"
  defaultMessage="Kumulativni prikaz"
/>

const monthlyDisplay = <FormattedMessage
  description="myaccounting-monthly-button"
  defaultMessage="Mjesečni prikaz"
/>

const projectsButton = <FormattedMessage
  description="myaccounting-projects-button"
  defaultMessage="Projekti"
/>


const get_past_12_months = () => {
  const today = new Date()

  const year = today.getFullYear()
  const month = today.getMonth()

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


const IsLead = () => {
  const { userDetails } = useContext(AuthContext);

  if (userDetails && "userproject_set" in userDetails)
    return userDetails.userproject_set.map(item => item.role.name).includes("lead")

  else
    return false
}


const Navigation = () => {
  const activeBgColor = '#b04c46';

  return (
    <Nav tabs id="hzsi-navlinks" className="rounded d-flex sticky-top">
      <NavItem key='project-accounting' className='ms-3 mt-1'>
        <NavLink
          style={({isActive}) => isActive ? {'backgroundColor': activeBgColor} : {}}
          className={({isActive}) => isActive ? "nav-link active text-white" : "nav-link text-dark"}
          to='/ui/project-accounting'
        >
          <FormattedMessage
            description="project-lead-accounting"
            defaultMessage="Pogled za voditelja"
          />
        </NavLink>
      </NavItem>
      <NavItem key="personal-accounting" className="mt-1">
        <NavLink
          style={({isActive}) => isActive ? {'backgroundColor': activeBgColor} : {}}
          className={({isActive}) => isActive ? "nav-link active text-white" : "nav-link text-dark"}
          to='/ui/my-accounting'
        >
          <FormattedMessage
            description="project-my-accounting"
            defaultMessage="Osobna potrošnja"
          />
        </NavLink>
      </NavItem>
    </Nav>
  )
}


export const MyAccounting = () => {
  const { userDetails } = useContext(AuthContext);
  const [padobranProjects, setPadobranProjects] = useState([])
  const [supekCPUProjects, setSupekCPUProjects] = useState([])
  const [supekGPUProjects, setSupekGPUProjects] = useState([])
  const [galaxyProjects, setGalaxyProjects] = useState([])
  const [jupyterCPUProjects, setJupyterCPUProjects] = useState([])
  const [jupyterGPUProjects, setJupyterGPUProjects] = useState([])
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
        <YAxis padding={{ top: 10 }} />
        {
          projects.map((proj, index) => 
            (index === projects.length - 1) ?
              <Bar 
                key={ proj } 
                label={{
                  position: "top",
                  fontSize: 10
                }}
                dataKey={ proj } 
                stackId={ stackId }
                fill={ colors[listProjects.indexOf(proj)] } 
              />
            :
              <Bar 
                key={ proj } 
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
        <>
          {
            IsLead() && <Navigation />
          }
          <Row className="mt-3 mb-3">
            <Col className="d-flex align-items-center justify-content-center shadow-sm bg-light border border-danger rounded text-muted text-center p-3 fs-3" style={{height: '400px'}} md={{offset: 1, size: 10}}>
              <FormattedMessage
                description="myaccounting-emptygraphs"
                defaultMessage="Nema zabilježenog iskorištenja resursa"
              />
            </Col>
          </Row>
        </>
      )
    else
      return (
        <>
          {
            IsLead() && <Navigation />
          }
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
                            setIsOpenYear(!isOpenYear)
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
                        setIsOpenYear(!isOpenYear)
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
                        setIsOpenYear(!isOpenYear)
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
                    { projectsButton }
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

export const ProjectAccounting = () => {
  const { userDetails } = useContext(AuthContext);
  const { LinkTitles } = useContext(SharedData)
	const [ pageTitle, setPageTitle ] = useState(undefined)
  const [ showCumulative, setShowCumulative ] = useState(false)
  const [ isOpen, setIsOpen ] = useState(false)
  const [ isOpenUsers, setIsOpenUsers ] = useState(false)
  const [ listProjects, setListProjects ] = useState([])
  const [ selectedProject, setSelectedProject ] = useState(undefined)
  const [ subsetUsers, setSubsetUsers ] = useState([])
  const [ listUsers, setListUsers ] = useState(new Object())
  const [ padobran, setPadobran ] = useState(new Object())
  const [ supekCPU, setSupekCPU ] = useState(new Object())
  const [ supekGPU, setSupekGPU ] = useState(new Object())
  const [ vrancicCPU, setVrancicCPU ] = useState(new Object())
  const [ vrancicGPU, setVrancicGPU ] = useState(new Object())

  const intl = useIntl()
  let navigate = useNavigate()

  const { status, data, error } = useQuery({
    queryKey: ["lead-graph-data", userDetails.username],
    queryFn: () => fetchProjectAccountingData()
  })

  useEffect(() => {
    setPageTitle(LinkTitles(`${location.pathname}/${selectedProject}`, intl))
    if (status === 'error' && error.message.includes('403'))
      navigate(defaultUnAuthnRedirect)
  }, [location.pathname, intl, status, selectedProject])

  const onUserSelect = (selected) => {
    console.log(selected)
    let index = subsetUsers.indexOf(selected)

    if (index < 0) {
      subsetUsers.push(selected)
    } else {
      subsetUsers.splice(index, 1)
    }

    setSubsetUsers([...subsetUsers])
  }

  useEffect(() => {
    if (status == "success" && data) {
      let _listProjects = Object.keys(data)
      setSelectedProject(_listProjects[0])
      console.log(subsetUsers)

      for (let index = 0; index <= _listProjects.length; index++) {
        let project = _listProjects[index]
        let _supekCPUsers = new Set()
        let _supekGPUsers = new Set()
        let _padobranUsers = new Set()
        let _vrancicCPUsers = new Set()
        let _vrancicGPUsers = new Set()
        let _supekCPU = supekCPU
        let _supekGPU = supekGPU
        let _padobran = padobran
        let _vrancicCPU = vrancicCPU
        let _vrancicGPU = vrancicGPU
        let _listUsers = listUsers
        if (project in data && "supek" in data[project]) {
          _supekCPUsers = new Set(data[project]["supek"][`${showCumulative ? "cumulative" : "monthly"}`]["cpuh"].map(item => Object.keys(item)).flat())
          _supekGPUsers = new Set(data[project]["supek"][`${showCumulative ? "cumulative" : "monthly"}`]["gpuh"].map(item => Object.keys(item)).flat())
          _supekCPUsers.delete("month")
          _supekGPUsers.delete("month")
          if (subsetUsers.length > 0) {
            _supekCPU[project] = [..._supekCPUsers].filter(user => subsetUsers.indexOf(user) >= 0).sort()
            _supekGPU[project] = [..._supekGPUsers].filter(user => subsetUsers.indexOf(user) >= 0).sort()
          } else {
            _supekCPU[project] = Array.from(_supekCPUsers).sort()
            _supekGPU[project] = Array.from(_supekGPUsers).sort()
          }
          setSupekCPU(_supekCPU)
          setSupekGPU(_supekGPU)
        }
        if (project in data && "padobran" in data[project]) {
          _padobranUsers = new Set(data["padobran"][`${showCumulative ? "cumulative" : "monthly"}`]["cpuh"].map(item => Object.keys(item)).flat())
          _padobranUsers.delete("month")
          if (subsetUsers.length > 0)
            _padobran[project] = [..._padobranUsers].filter(user => subsetUsers.indexOf(user) >= 0).sort()
          else
            _padobran[project] = Array.from(_padobranUsers).sort()
          setPadobran(_padobran)
        }
        if (project in data && "cloud" in data[project]) { 
          _vrancicCPUsers = new Set(data[project]["cloud"][`${showCumulative ? "cumulative" : "monthly"}`]["cpuh"].map(item => Object.keys(item)).flat())
          _vrancicGPUsers = new Set(data[project]["cloud"][`${showCumulative ? "cumulative" : "monthly"}`]["gpuh"].map(item => Object.keys(item)).flat())
          _vrancicCPUsers.delete("month")
          _vrancicGPUsers.delete("month")
          if (subsetUsers.length > 0) {
            _vrancicCPU[project] = [..._vrancicCPUsers].filter(user => subsetUsers.indexOf(user) >= 0).sort()
            _vrancicGPU[project] = [..._vrancicGPUsers].filter(user => subsetUsers.indexOf(user) >= 0).sort()
          } else {
            _vrancicCPU[project] = Array.from(_vrancicCPUsers).sort()
            _vrancicGPU[project] = Array.from(_vrancicGPUsers).sort()
          }
          setVrancicCPU(_vrancicCPU)
          setVrancicGPU(_vrancicGPU)
        }
        _listUsers[project] = Array.from(new Set([ ..._supekCPUsers, ..._supekGPUsers, ..._padobranUsers, ..._vrancicCPUsers, ..._vrancicGPUsers ])).sort()
        setListUsers(_listUsers)
      }
      setListProjects(_listProjects)
    }
  }, [status, data, showCumulative, subsetUsers])

  const UsageBarChart = ({ data, users, stackId }) => {
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
        <YAxis padding={{ top: 10 }} />
        {
          users.map((user, index) => 
            (index === users.length - 1) ?
              <Bar 
                key={ user } 
                label={{
                  position: "top",
                  fontSize: 10
                }}
                dataKey={ user } 
                stackId={ stackId }
                fill={ colors[listUsers[selectedProject].indexOf(user)] } 
              />
            :
              <Bar 
                key={ user } 
                dataKey={ user } 
                stackId={ stackId }
                fill={ colors[listUsers[selectedProject].indexOf(user)] } 
              />
          )
        }
      </BarChart>
    )
  } 

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

    if (selectedProject in supekCPU && supekCPU[selectedProject].length > 0)
      groups.push(
        <Row>
          <h4>Supek CPUH</h4>
          <UsageBarChart
            data={ data[selectedProject]["supek"][`${showCumulative ? "cumulative" : "monthly"}`]["cpuh"] }
            users={ supekCPU[selectedProject] }
            stackId="supek-cpuh"
          />
        </Row>
      )

    if (selectedProject in supekGPU && supekGPU[selectedProject].length > 0)
      groups.push(
        <Row>
          <h4>Supek GPUH</h4>
          <UsageBarChart
            data={ data[selectedProject]["supek"][`${showCumulative ? "cumulative" : "monthly"}`]["gpuh"] }
            users={ supekGPU[selectedProject] }
            stackId="supek-gpuh"
          />
        </Row>
      )

    if (selectedProject in padobran && padobran[selectedProject].length > 0)
      groups.push(
        <Row>
          <h4>Padobran</h4>
          <UsageBarChart
            data={ data[selectedProject]["padobran"][`${showCumulative ? "cumulative" : "monthly"}`]["cpuh"] }
            users={ padobran[selectedProject] }
            stackId="padobran"
          />
        </Row>
      )

    if (selectedProject in vrancicCPU && vrancicCPU[selectedProject].length > 0)
      groups.push(
        <Row>
          <h4>Vrancic CPUH</h4>
          <UsageBarChart
            data={ data[selectedProject]["cloud"][`${showCumulative ? "cumulative" : "monthly"}`]["cpuh"] }
            users={ vrancicCPU[selectedProject] }
            stackId="vrancic-cpuh"
          />
        </Row>
      )

    if (selectedProject in vrancicGPU && vrancicGPU[selectedProject].length > 0)
      groups.push(
        <Row>
          <h4>Vrancic GPUH</h4>
          <UsageBarChart
            data={ data[selectedProject]["cloud"][`${showCumulative ? "cumulative" : "monthly"}`]["gpuh"] }
            users={ vrancicGPU[selectedProject] }
            stackId="vrancic-gpuh"
          />
        </Row>
      )

    if ( Object.keys(supekCPU).length == 0 && Object.keys(supekGPU).length == 0 && Object.keys(padobran).length == 0 && Object.keys(vrancicCPU).length == 0 && Object.keys(vrancicGPU).length == 0)
      return (
        <>
          {
            IsLead() && 
              <Navigation />
          }
          <Row className="mt-3 mb-3">
            <Col className="d-flex align-items-center justify-content-center shadow-sm bg-light border border-danger rounded text-muted text-center p-3 fs-3" style={{height: '400px'}} md={{offset: 1, size: 10}}>
              <FormattedMessage
                description="myaccounting-emptygraphs"
                defaultMessage="Nema zabilježenog iskorištenja resursa"
              />
            </Col>
          </Row>
        </>
      )
    else
      return (
        <>
          {
            IsLead() && 
              <Navigation />
          }
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
                <Dropdown 
                  isOpen={ isOpenUsers } 
                  className="me-2 rounded"
                  toggle={ () => setIsOpenUsers(!isOpenUsers) }
                >
                  <DropdownToggle caret>
                    <FormattedMessage
                      description="myaccounting-users-button"
                      defaultMessage="Korisnici"
                    />
                  </DropdownToggle>
                  <DropdownMenu>
                    {
                      listUsers[selectedProject].map((user) => 
                        <DropdownItem key={ user } toggle={ false }>
                          <Input
                            type="checkbox"
                            className="mr-2"
                            checked={ subsetUsers.indexOf(user) >= 0 }
                            onClick={ () => onUserSelect(user) }
                          />
                          <Label check>{ user }</Label>
                        </DropdownItem>
                      )
                    }
                  </DropdownMenu>
                </Dropdown>
                <Dropdown
                  isOpen={ isOpen }
                  className="ml-2"
                  toggle={ () => setIsOpen(!isOpen) }
                >
                  <DropdownToggle caret>
                    { projectsButton }
                  </DropdownToggle>
                  <DropdownMenu>
                    {
                      listProjects.map(proj => 
                        <DropdownItem
                          key={ proj }
                          onClick={ () => setSelectedProject(proj) }
                        >
                          { proj }
                        </DropdownItem>
                      )
                    }
                  </DropdownMenu>
                </Dropdown>
              </ButtonGroup>
            </PageTitle>
          </Row>
          {
            groups.map(row => row)
          }
        </>
      )
  }
}