import React, { useContext, useEffect, useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from 'Components/AuthContextProvider';
import { fetchAccountingData } from "Api/accounting";
import { Button, Input, Col,Row, Label, Dropdown, DropdownMenu, DropdownItem, DropdownToggle } from "reactstrap";
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
  const [useLogScaleSupekCPU, setUseLogScaleSupekCPU] = useState(false)
  const [useLogScaleSupekGPU, setUseLogScaleSupekGPU] = useState(false)
  const [useLogScalePadobran, setUseLogScalePadobran] = useState(false)
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

      setListProjects(Array.from(new Set([...supek_cpu, ...supek_gpu, ...padobran])).sort())
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
    if (supekCPUProjects.length == 0 && supekGPUProjects.length == 0 && padobranProjects == 0)
      return (
        <Row className="mt-3 mb-3">
          <Col className="d-flex align-items-center justify-content-center shadow-sm bg-light border border-danger rounded text-muted text-center p-3 fs-3" style={{height: '400px'}} md={{offset: 1, size: 10}}>
            Nema zabilježenog iskorištenja resursa
          </Col>
        </Row>
      )
    else
      return (
        <>
          <Row>
            <PageTitle pageTitle={ pageTitle }>
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
            </PageTitle>
          </Row>
          <h3>Supek</h3> 
          <Row>
            <Col md={6}>
              <h4>CPUH</h4>
              {
                supekCPUProjects.length > 0 &&
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={ () => setUseLogScaleSupekCPU(!useLogScaleSupekCPU) }
                  >
                    { useLogScaleSupekCPU ? linearScale : logScale }
                  </Button>
              }
              <BarChart
                width={ 600 }
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
                  useLogScaleSupekCPU ?
                    <YAxis scale="log" domain={[1, "dataMax"]} padding={{ top: 10 }} />
                  :
                    <YAxis padding={{ top: 10 }} />
                }
                {
                  supekCPUProjects.map((proj) => <Bar key={ proj } label={{ position: "top", fontSize: 10, fill: colors[listProjects.indexOf(proj)] }} dataKey={ proj } fill={ colors[listProjects.indexOf(proj)] } />)
                }
              </BarChart>
            </Col>
            <Col md={6}>
              <h4>GPUH</h4>
              {
                supekGPUProjects.length > 0 &&
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={ () => setUseLogScaleSupekGPU(!useLogScaleSupekGPU) }
                  >
                    { useLogScaleSupekGPU ? linearScale : logScale }
                  </Button>
              }
              <BarChart
                width={ 600 }
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
                  useLogScaleSupekGPU ?
                    <YAxis scale="log" domain={[1, "dataMax"]} padding={{ top: 10 }} />
                  :
                    <YAxis padding={{ top: 10 }} />
                }
                {
                  supekGPUProjects.map((proj) => <Bar key={ proj } dataKey={ proj } label={{ position: "top", fill: colors[listProjects.indexOf(proj)], fontSize: 10 }} fill={ colors[listProjects.indexOf(proj)] } />)
                }
              </BarChart>
            </Col>
          </Row>
          <Row>
            <h3>Padobran</h3>
            <Col md={6}>
              <h4>CPUH</h4>
              {
                padobranProjects.length > 0 &&
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={ () => setUseLogScalePadobran(!useLogScalePadobran) }
                  >
                    { useLogScalePadobran ? linearScale : logScale }
                  </Button>
              }
              <BarChart
                width={ 600 }
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
                  useLogScalePadobran ?
                    <YAxis scale="log" domain={[1, "dataMax"]} padding={{ top: 10 }} />
                  :
                    <YAxis padding={{ top: 10 }} />
                }
                {
                  padobranProjects.map((proj) => <Bar key={ proj } dataKey={ proj } label={{ position: "top", fill: colors[listProjects.indexOf(proj)], fontSize: 10 }} fill={ colors[listProjects.indexOf(proj)] } />)
                }
              </BarChart>
            </Col>
            <Col md={ 6 } className="d-flex align-items-center justify-content-left">
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
        </>
      )
  }
}

export default MyAccounting