import React, { useContext, useEffect, useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from 'Components/AuthContextProvider';
import { fetchAccountingData } from "Api/accounting";
import { Col,Row } from "reactstrap";
import { PageTitle } from 'Components/PageTitle';
import { XAxis, YAxis, CartesianGrid, Bar, BarChart, Legend } from 'recharts';
import { toast } from 'react-toastify';


const colors = ['#e8827a', '#b04c46','#d71635', '#510707', '#7e191e',  '#df7f1b', '#e8827a', '#b04c46','#d71635', '#510707', '#7e191e',  '#df7f1b','#fcaf26', '#b4bbc0', '#929597', '#606365']


const MyAccounting = () => {
  const { userDetails } = useContext(AuthContext);
  const [padobranProjects, setPadobranProjects] = useState([])
  const [supekProjects, setSupekProjects] = useState([])

  const { status, data, error } = useQuery({
    queryKey: ["graph-data", userDetails.username],
    queryFn: () => fetchAccountingData()
  })

  useEffect(() => {
    if (status == "success" && data) {
      if ("supek" in data) {
        let supek_cpu = new Set(...data["supek"]["cpuh"].map(item => Object.keys(item)))
        let supek_gpu = new Set(...data["supek"]["cpuh"].map(item => Object.keys(item)))
        let supek = new Set([...supek_cpu, ...supek_gpu])
        supek.delete("month")
        setSupekProjects(Array.from(supek).sort())
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
        {
          supekProjects.length > 0 &&
            <Row>
              <h3>Supek</h3> 
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
                  <YAxis scale="log" domain={[1, "dataMax"]} />
                  <Legend />
                  {
                    supekProjects.map((proj, index) => <Bar key={ proj } dataKey={ proj } fill={ colors[index] } />)
                  }
                </BarChart>
              </Col>
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
                  <YAxis scale="log" domain={[1, "dataMax"]} />
                  <Legend />
                  {
                    supekProjects.map((proj, index) => <Bar key={ proj } dataKey={ proj } fill={ colors[index] } />)
                  }
                </BarChart>
              </Col>
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
                  <YAxis scale="log" domain={[1, "dataMax"]} />
                  <Legend />
                  {
                    padobranProjects.map((proj, index) => <Bar key={ proj } dataKey={ proj } fill={ colors[index] } />)
                  }
                </BarChart>
              </Col>
            </Row>
        }
      </>
    )
  }
}

export default MyAccounting