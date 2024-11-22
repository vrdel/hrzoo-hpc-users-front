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
import { XAxis, YAxis, CartesianGrid, Bar, BarChart } from 'recharts';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquare } from "@fortawesome/free-solid-svg-icons";
import { SharedData } from "Pages/root";
import { useIntl, FormattedMessage } from 'react-intl'
import { defaultUnAuthnRedirect } from 'Config/default-redirect';
import { useNavigate } from "react-router-dom";


const colors = ['#e8827a', '#b04c46','#d71635', '#510707', '#7e191e',  '#df7f1b', '#e8827a', '#b04c46','#d71635', '#510707', '#7e191e',  '#df7f1b','#fcaf26', '#b4bbc0', '#929597', '#606365']

const linearScale = <FormattedMessage 
  description="myaccounting-linearscale-button"
  defaultMessage="Linearna skala"
/>

const logScale = <FormattedMessage
  description="myaccounting-logscale-button"
  defaultMessage="Log skala"
/>


const MyAccounting = () => {
  const { userDetails } = useContext(AuthContext);
  const [padobranProjects, setPadobranProjects] = useState([])
  const [supekCPUProjects, setSupekCPUProjects] = useState([])
  const [supekGPUProjects, setSupekGPUProjects] = useState([])
  const [galaxyProjects, setGalaxyProjects] = useState([])
  const [jupyterCPUProjects, setJupyterCPUProjects] = useState([])
  const [jupyterGPUProjects, setJupyterGPUProjects] = useState([])
  const [useLogScale, setUseLogScale] = useState(false)
  const [listProjects, setListProjects] = useState([])
  const [subsetOfProjects, setSubsetOfProjects] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const { LinkTitles } = useContext(SharedData)
	const [pageTitle, setPageTitle] = useState(undefined)

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

  useEffect(() => {
    if (status == "success" && data) {
      let supek_cpu = new Set()
      let supek_gpu = new Set()
      let padobran = new Set()
      let galaxy = new Set()
      let jupyter_cpu = new Set()
      let jupyter_gpu = new Set()
      if ("supek" in data) {
        supek_cpu = new Set(data["supek"]["cpuh"].map(item => Object.keys(item)).flat())
        supek_gpu = new Set(data["supek"]["gpuh"].map(item => Object.keys(item)).flat())
        supek_cpu.delete("month")
        supek_gpu.delete("month")
        if (subsetOfProjects.length > 0) {
          setSupekCPUProjects([...supek_cpu].filter(proj => subsetOfProjects.indexOf(proj) >= 0))
          setSupekGPUProjects([...supek_gpu].filter(proj => subsetOfProjects.indexOf(proj) >= 0))
        } else {
          setSupekCPUProjects(Array.from(supek_cpu).sort())
          setSupekGPUProjects(Array.from(supek_gpu).sort())
        }
      }

      if ("padobran" in data) {
        padobran = new Set(data["padobran"]["cpuh"].map(item => Object.keys(item)).flat())
        padobran.delete("month")
        if (subsetOfProjects.length > 0) {
          setPadobranProjects([...padobran].filter(proj => subsetOfProjects.indexOf(proj) >= 0))
        } else {
          setPadobranProjects(Array.from(padobran).sort())
        }
      }

      if ("galaxy" in data) {
        galaxy = new Set(data["galaxy"]["cpuh"].map(item => Object.keys(item)).flat())
        galaxy.delete("month")
        if (subsetOfProjects.length > 0) {
          setGalaxyProjects([...galaxy].filter(proj => subsetOfProjects.indexOf(proj) >= 0))
        } else {
          setGalaxyProjects(Array.from(galaxy).sort())
        }
      }

      if ("jupyter" in data) {
        jupyter_cpu = new Set(data["jupyter"]["cpuh"].map(item => Object.keys(item)).flat())
        jupyter_gpu = new Set(data["jupyter"]["gpuh"].map(item => Object.keys(item)).flat())
        jupyter_cpu.delete("month")
        jupyter_gpu.delete("month")
        if (subsetOfProjects.length > 0) {
          setJupyterCPUProjects([...jupyter_cpu].filter(proj => subsetOfProjects.indexOf(proj) >= 0))
          setJupyterGPUProjects([...jupyter_gpu].filter(proj => subsetOfProjects.indexOf(proj) >= 0))
        } else {
          setJupyterCPUProjects(Array.from(jupyter_cpu).sort())
          setJupyterGPUProjects(Array.from(jupyter_gpu).sort())
        }
      }

      setListProjects(Array.from(new Set([...supek_cpu, ...supek_gpu, ...padobran, ...galaxy, ...jupyter_cpu, ...jupyter_gpu])).sort())
    }
  }, [status, data, subsetOfProjects])

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
    let n = (supekCPUProjects.length > 0) + (supekGPUProjects.length > 0) + (padobranProjects.length > 0) + (galaxyProjects.length > 0) + (jupyterCPUProjects.length > 0) + (jupyterGPUProjects.length > 0)
    let col_md = 4
    let graph_width = 450
    let di = 3
    let groups = []
    if (n <= 4) {
      col_md = 6
      graph_width = 600
      di = 2
    }

    if (supekCPUProjects.length > 0)
      groups.push(
        <Col md={col_md}>
          <h4>Supek CPUH</h4>
          <BarChart
            width={ graph_width }
            height={ 300 }
            data={ "supek" in data ? data["supek"]["cpuh"] : [] }
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            {
              useLogScale ?
                <YAxis scale="log" domain={[1, "dataMax"]} padding={{ top: 10 }} />
              :
                <YAxis padding={{ top: 10 }} />
            }
            {
              supekCPUProjects.map((proj) => <Bar key={ proj } label={{ position: "top", fontSize: 10, fill: colors[listProjects.indexOf(proj)] }} dataKey={ proj } fill={ colors[listProjects.indexOf(proj)] } />)
            }
          </BarChart>
        </Col>
      )

    if (supekGPUProjects.length > 0)
      groups.push(
        <Col md={col_md}>
          <h4>Supek GPUH</h4>
          <BarChart
            width={ graph_width }
            height={ 300 }
            data={ "supek" in data ? data["supek"]["gpuh"] : [] }
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            {
              useLogScale ?
                <YAxis scale="log" domain={[1, "dataMax"]} padding={{ top: 10 }} />
              :
                <YAxis padding={{ top: 10 }} />
            }
            {
              supekGPUProjects.map((proj) => <Bar key={ proj } dataKey={ proj } label={{ position: "top", fill: colors[listProjects.indexOf(proj)], fontSize: 10 }} fill={ colors[listProjects.indexOf(proj)] } />)
            }
          </BarChart>
        </Col>
      )

    if (padobranProjects.length > 0) 
      groups.push(
        <Col md={col_md}>
          <h4>Padobran CPUH</h4>
          <BarChart
            width={ graph_width }
            height={ 300 }
            data={ "padobran" in data ? data["padobran"]["cpuh"] : [] }
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            {
              useLogScale ?
                <YAxis scale="log" domain={[1, "dataMax"]} padding={{ top: 10 }} />
              :
                <YAxis padding={{ top: 10 }} />
            }
            {
              padobranProjects.map((proj) => <Bar key={ proj } dataKey={ proj } label={{ position: "top", fill: colors[listProjects.indexOf(proj)], fontSize: 10 }} fill={ colors[listProjects.indexOf(proj)] } />)
            }
          </BarChart>
        </Col>
      )

    if (galaxyProjects.length > 0)
      groups.push(
        <Col md={col_md}>
          <h4>Galaxy CPUH</h4>
          <BarChart
            width={ graph_width }
            height={ 300 }
            data={ "galaxy" in data ? data["galaxy"]["cpuh"] : [] }
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            {
              useLogScale ?
                <YAxis scale="log" domain={[1, "dataMax"]} padding={{ top: 10 }} />
              :
                <YAxis padding={{ top: 10 }} />
            }
            {
              galaxyProjects.map((proj) => <Bar key={ proj } label={{ position: "top", fontSize: 10, fill: colors[listProjects.indexOf(proj)] }} dataKey={ proj } fill={ colors[listProjects.indexOf(proj)] } />)
            }
          </BarChart>
        </Col>
      )

    if (jupyterCPUProjects.length > 0)
      groups.push(
        <Col md={col_md}>
          <h4>Jupyter CPUH</h4>
          <BarChart
            width={ graph_width }
            height={ 300 }
            data={ "jupyter" in data ? data["jupyter"]["cpuh"] : [] }
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            {
              useLogScale ?
                <YAxis scale="log" domain={[1, "dataMax"]} padding={{ top: 10 }} />
              :
                <YAxis padding={{ top: 10 }} />
            }
            {
              jupyterCPUProjects.map((proj) => <Bar key={ proj } dataKey={ proj } label={{ position: "top", fill: colors[listProjects.indexOf(proj)], fontSize: 10 }} fill={ colors[listProjects.indexOf(proj)] } />)
            }
          </BarChart>
        </Col>
      )

    if (jupyterGPUProjects.length > 0)
      groups.push(
        <Col md={col_md}>
          <h4>Jupyter GPUH</h4>
          <BarChart
            width={ graph_width }
            height={ 300 }
            data={ "jupyter" in data ? data["jupyter"]["gpuh"] : [] }
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            {
              useLogScale ?
                <YAxis scale="log" domain={[1, "dataMax"]} padding={{ top: 10 }} />
              :
                <YAxis padding={{ top: 10 }} />
            }
            {
              jupyterGPUProjects.map((proj) => <Bar key={ proj } dataKey={ proj } label={{ position: "top", fill: colors[listProjects.indexOf(proj)], fontSize: 10 }} fill={ colors[listProjects.indexOf(proj)] } />)
            }
          </BarChart>
        </Col>
      )

    const rows = []
    for (let i = 0; i < groups.length; i = i + di) {
      let chosen_group = groups.slice(i, di + 1)
      if (i == 0)
        rows.push(
          <Row>
            {
              chosen_group.map(column => column)
            }
          </Row>
        )
    }

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
              <ButtonGroup>
                <Button
                  color="secondary"
                  size="sm"
                  onClick={ () => setUseLogScale(!useLogScale) }
                >
                  { useLogScale ? linearScale : logScale }
                </Button>
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
          <Row className="mt-3">
            <Col md={4}></Col>
            <Col md={4} className="d-flex align-items-center justify-content-center">
              <div>
                {
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
          {
            rows.map(row => row)
          }
        </>
      )
  }
}

export default MyAccounting