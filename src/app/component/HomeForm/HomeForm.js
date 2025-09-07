"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Card, Button, Table, Carousel, Spinner } from "react-bootstrap";
import "./HomeForm.css";
import YearlyIncomeExpenses from "@/app/IncomeExpenseDetails/page";
import { fetchMasjidIncomeExpensesData } from "../../Services/MasjidIncomeExpenseService/apiService";
import { isAuthenticated, getUserRole } from "../../Utils/authHelpers";
import { motion } from "framer-motion";
import RamadanTimetable from "@/app/Ramadan/page";


const prayerTimes = [
  { name: "Fajr", time: "5:30 AM" },
  { name: "Dhuhr", time: "1:15 PM" },
  { name: "Asr", time: "4:30 PM" },
  { name: "Maghrib", time: "6:45 PM" },
  { name: "Isha", time: "8:00 PM" },
];

const backgroundImages = [
  "/assets/images/slide/masjid-1.jpg",
  "/assets/images/slide/masjid-2.jpg",
  "/assets/images/slide/bhopal-masjid.jpg",
];

const HomePage = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isUserAuthenticated = useMemo(() => (isClient ? isAuthenticated() : false), [isClient]);
  const userRole = useMemo(() => (isClient ? getUserRole() : null), [isClient]);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const router = useRouter(); // ✅ Initialize router

  const [loadingButton, setLoadingButton] = useState(null); // Track which button is loading

  const handleNavigate = (path, buttonType) => {
    setLoadingButton(buttonType); // Set the loading state for the clicked button
    setTimeout(() => {
      router.push(path); // Navigate after delay
      //setLoadingButton(null); // Reset loader after navigation
    }, 300);
  };


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchMasjidIncomeExpensesData();
        if (data && data.length > 0) {
          const currentIncome = data[0].income.find((item) => item.year === currentYear - 1) || {};
          const currentExpense = data[0].expense.find((item) => item.year === currentYear - 1) || {};
          setIncome((currentIncome.masjidAmount || 0) + (currentIncome.masjidProgram || 0) + (currentIncome.qabristanAmount || 0));
          setExpenses(currentExpense.totalExpenses || 0);
        }
      } catch (err) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    setIsClient(true);
  }, [currentYear]);

  {
    isLoadingPage && (
      <div className="loader-overlay">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  if (!isClient || isLoading) {
    return (
      <div className="loader-container">
        <div className="spinner-container">
          <div className="spinner-border text-primary" style={{ width: "5rem", height: "5rem" }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>

      {/* Carousel Section */}
      <Carousel fade controls={false} indicators={false} interval={3000} className="hero-section-carousel">
        {backgroundImages.map((image, index) => (
          <Carousel.Item key={index}>
            <div className="hero-section" style={{ backgroundImage: `url(${image})` }}>
              <Container>
                <Row className="align-items-start text-white flex-column flex-md-row">
                  <Col md={8} className="p-4 bg-dark bg-opacity-75 rounded">
                    <h2 className="text-warning text-center text-md-start">Welcome to Jama Masjid</h2>
                    <p className="text-light text-justify">Jama Masjid is a historic center for worship and community service, aiming to uplift and support people through spiritual and social initiatives.</p>
                    <h3 className="text-info text-center text-md-start">Islamic Articles</h3>
                    <p className="text-light text-justify">يؤكد الإسلام على الكرم وأهمية الصدقة. العطاء وسيلة تطهير وطريقة لطلب البركة من الله.</p>
                  </Col>
                  <Col md={4} className="p-3 bg-light bg-opacity-75 rounded shadow-lg text-dark text-center">
                    <h2 className="text-primary">Namaz Timing</h2>
                    <Table striped bordered hover variant="light" responsive className="table-sm">
                      <thead>
                        <tr>
                          <th>Prayer</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prayerTimes.map((prayer) => (
                          <tr key={prayer.name}>
                            <td>{prayer.name}</td>
                            <td>{prayer.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Col>

                </Row>
              </Container>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
      <RamadanTimetable />
      {/* Donation Section */}
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="shadow-lg p-4 text-center bg-white rounded-4 border-0 donation-card">
                <motion.h2
                  className="text-primary fw-bold"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  Support Jama Masjid
                </motion.h2>
                <p className="text-muted">Your generous donations help maintain and support our community. Every contribution makes a difference.</p>

                <motion.div
                  className="d-flex justify-content-center"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Image
                    src="/assets/images/qrCode.png"
                    width={250}
                    height={250}
                    alt="Donation QR Code"
                    className="rounded-3 shadow img-fluid"
                  />
                </motion.div>

                <p className="mt-3 text-succe ss fw-bold">Thank you for your generosity!</p>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Button variant="success" className="px-4 py-2 mt-3 rounded-pill shadow-sm">Donate Now</Button>
                </motion.div>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>

      {/* Financial Overview Section */}
      <Container className="mt-5">
        <Row>
          <Col lg={4} md={6} sm={12} className="mb-4">
            <Card className="text-center shadow-sm income-card">
              <Card.Body>
                <Card.Title className="text-success">Total Income</Card.Title>
                <Card.Text className="fs-2">₹{isLoading ? "Loading..." : income.toFixed(2)}</Card.Text>
                <div className="d-flex justify-content-center">
                  <Button
                    variant="success"
                    className="d-flex align-items-center justify-content-center gap-2 mx-auto"
                    onClick={() => handleNavigate("/IncomeDetails", "income")}
                    disabled={loadingButton === "income"} // ✅ Only disable this button when it's clicked
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    {loadingButton === "income" && <Spinner animation="border" size="sm" />}
                    View Details
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4} md={6} sm={12} className="mb-4">
            <Card className="text-center shadow-sm expenses-card">
              <Card.Body>
                <Card.Title className="text-danger">Total Expenses</Card.Title>
                <Card.Text className="fs-2">₹{isLoading ? "Loading..." : expenses.toFixed(2)}</Card.Text>
                <div className="d-flex justify-content-center">
                  <Button
                    variant="danger"
                    className="d-flex align-items-center justify-content-center gap-2 mx-auto"
                    onClick={() => handleNavigate("/ExpenseDetails", "expense")}
                    disabled={loadingButton === "expense"} // ✅ Only disable this button when it's clicked
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    {loadingButton === "expense" && <Spinner animation="border" size="sm" />}
                    View Details
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4} md={12} sm={12} className="mb-4">
            <Card className="text-center shadow-sm">
              <Card.Body>
                <Card.Title className="text-warning">Balance</Card.Title>
                <Card.Text className="fs-2">₹{isLoading ? "Loading..." : (income - expenses).toFixed(2)}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <YearlyIncomeExpenses />
      </Container>


    </>
  );
};

export default HomePage;
