import React, { useEffect, useState } from "react";
import AdminLayout from "../Layout/AdminLayout";
import { getApihandler } from "../Apihandler";
import { Col, Container, Row } from "react-bootstrap";
import { Card, CardContent, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getAllCount();
  }, []);

  const getAllCount = async () => {
    const res = await getApihandler("/getCountForDashboard");
    console.log("get all count api res --->", res);
    if (res.status === 200) {
      setData(res.data);
    }
  };

  return (
    <AdminLayout>
      <h1>Dashboard</h1>

      {data ? (
        <Container
          style={{
            boxShadow: "none",
            backgroundColor: "transparent",
            display: "contents",
            marginTop: "30px",
          }}
        >
          <Row className="gy-3">
            {" "}
            {/* Bootstrap gutter between rows */}
            <Col md={3}>
              <Link
                to="/users"
                style={{ color: "black", textDecoration: "none" }}
              >
                <Card
                  sx={{
                    backgroundColor: "#f8f9fa",
                    borderRadius: 2,
                    boxShadow: 3,
                    textAlign: "center",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6">Total Users</Typography>
                    <Typography variant="h4">{data.totalUserCount}</Typography>
                  </CardContent>
                </Card>
              </Link>
            </Col>
            <Col md={3}>
              <Link
                to="/users"
                style={{ color: "black", textDecoration: "none" }}
              >
                <Card
                  sx={{
                    backgroundColor: "#f8f9fa",
                    borderRadius: 2,
                    boxShadow: 3,
                    textAlign: "center",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6">Today's Users</Typography>
                    <Typography variant="h4">{data.todayUserCount}</Typography>
                  </CardContent>
                </Card>
              </Link>
            </Col>
            <Col md={3}>
              <Link
                to="/property"
                style={{ color: "black", textDecoration: "none" }}
              >
                <Card
                  sx={{
                    backgroundColor: "#f8f9fa",
                    borderRadius: 2,
                    boxShadow: 3,
                    textAlign: "center",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6">Total Properties</Typography>
                    <Typography variant="h4">
                      {data.totalPropertyCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            </Col>
            <Col md={3}>
              <Link
                to="/property"
                style={{ textDecoration: "none", color: "black" }}
              >
                <Card
                  sx={{
                    backgroundColor: "#f8f9fa",
                    borderRadius: 2,
                    boxShadow: 3,
                    textAlign: "center",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6">Today's Properties</Typography>
                    <Typography variant="h4">
                      {data.todayPropertyCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            </Col>
          </Row>
        </Container>
      ) : (
        <p>Loading data...</p>
      )}
    </AdminLayout>
  );
}
