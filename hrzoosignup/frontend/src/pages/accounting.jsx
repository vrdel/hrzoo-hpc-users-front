import React, { useContext, useEffect, useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from 'Components/AuthContextProvider';
import { fetchAccountingData } from "Api/accounting";
import { Button, Col,Row } from "reactstrap";
import { PageTitle } from 'Components/PageTitle';
import { XAxis, YAxis, CartesianGrid, Bar, BarChart, Legend } from 'recharts';
import { toast } from 'react-toastify';


const colors = ['#e8827a', '#b04c46','#d71635', '#510707', '#7e191e',  '#df7f1b', '#e8827a', '#b04c46','#d71635', '#510707', '#7e191e',  '#df7f1b','#fcaf26', '#b4bbc0', '#929597', '#606365']


const MyAccounting = () => {
  const { userDetails } = useContext(AuthContext);
  const [padobranProjects, setPadobranProjects] = useState([])
  const [supekCPUProjects, setSupekCPUProjects] = useState([])
  const [supekGPUProjects, setSupekGPUProjects] = useState([])
  const [useLogScale, setUseLogScale] = useState(false)

  const { status, data, error } = useQuery({
    queryKey: ["graph-data", userDetails.username],
    queryFn: () => fetchAccountingData()
  })

  const toggleScale = () => {
    setUseLogScale(!useLogScale)
  }

  useEffect(() => {
    if (status == "success" && data) {
      if ("supek" in data) {
        let supek_cpu = new Set(...data["supek"]["cpuh"].map(item => Object.keys(item)))
        let supek_gpu = new Set(...data["supek"]["gpuh"].map(item => Object.keys(item)))
        supek_cpu.delete("month")
        supek_gpu.delete("month")
        setSupekCPUProjects(Array.from(supek_cpu).sort())
        setSupekGPUProjects(Array.from(supek_gpu).sort())
      }

      if ("padobran" in data) {
        let padobran = new Set(...data["padobran"]["cpuh"].map(item => Object.keys(item)))
        padobran.delete("month")
        setPadobranProjects(Array.from(padobran).sort())
      }
    }
  }, [status, data])

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
    return (
      <>
        <Row>
          <PageTitle pageTitle="graphs" />
        </Row>
        <div className="d-flex align-items-center justify-content-between">
          <div></div>
          <Button
            color="secondary"
            onClick={ toggleScale }
          >
            { useLogScale ? "Linear scale" : "Log scale" }
          </Button>
        </div>
        {
          (supekCPUProjects.length > 0 || supekGPUProjects.length > 0) &&
            <Row>
              <h3>Supek</h3> 
              {
                supekCPUProjects.length > 0 &&
                  <Col md={6}>
                    <h4>CPUH</h4>
                    <BarChart
                      width={ 600 }
                      height={ 300 }
                      data={ data["supek"]["cpuh"] }
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
                          <YAxis scale="log" domain={[1, "dataMax"]} />
                        :
                          <YAxis />
                      }
                      <Legend iconSize={10} />
                      {
                        supekCPUProjects.map((proj, index) => <Bar key={ proj } label={{ position: "top", fontSize: 10, fill: colors[index] }} dataKey={ proj } fill={ colors[index] } />)
                      }
                    </BarChart>
                  </Col>
              }
              {
                supekGPUProjects.length > 0 &&
                  <Col md={6}>
                    <h4>GPUH</h4>
                    <BarChart
                      width={ 600 }
                      height={ 300 }
                      data={ data["supek"]["gpuh"] }
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
                          <YAxis scale="log" domain={[1, "dataMax"]} />
                        :
                          <YAxis />
                      }
                      <Legend iconSize={10} />
                      {
                        supekGPUProjects.map((proj, index) => <Bar key={ proj } dataKey={ proj } label={{ position: "top", fill: colors[index], fontSize: 10 }} fill={ colors[index] } />)
                      }
                    </BarChart>
                  </Col>
              }
            </Row>
        }
        {
          padobranProjects.length > 0 &&
            <Row>
              <h3>Padobran</h3>
              <Col md={6}>
                <h4>CPUH</h4>
                <BarChart
                  width={ 600 }
                  height={ 300 }
                  data={ data["padobran"]["cpuh"] }
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
                      <YAxis scale="log" domain={[1, "dataMax"]} />
                    :
                      <YAxis />
                  }
                  <Legend iconSize={10} />
                  {
                    padobranProjects.map((proj, index) => <Bar key={ proj } dataKey={ proj } label={{ position: "top", fill: colors[index], fontSize: 10 }} fill={ colors[index] } />)
                  }
                </BarChart>
              </Col>
            </Row>
        }
        {
          (supekCPUProjects.length == 0 && supekGPUProjects.length == 0 && padobranProjects == 0) &&
            <Row className="mt-3 mb-3">
              <Col className="d-flex align-items-center justify-content-center shadow-sm bg-light border border-danger rounded text-muted text-center p-3 fs-3" style={{height: '400px'}} md={{offset: 1, size: 10}}>
                Nema zabilježenog iskorištenja resursa
              </Col>
            </Row>
        }
      </>
    )
  }
}

export default MyAccounting