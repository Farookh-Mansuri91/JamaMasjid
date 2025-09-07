"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Container, Row, Col, Card, Table } from "react-bootstrap";
import { motion } from "framer-motion";

// Sample Sehri & Iftar Times for 2025
const ramadanTimings = [
  { date: "March 1, 2025", sehri: "5:10 AM", iftar: "6:30 PM" },
  { date: "March 2, 2025", sehri: "5:09 AM", iftar: "6:31 PM" },
  { date: "March 3, 2025", sehri: "5:08 AM", iftar: "6:32 PM" },
  // Add full Ramadan 2025 timings here...
];

const RamadanTimetable = () => {
  const [nextSehri, setNextSehri] = useState(5);
  const [nextIftar, setNextIftar] = useState(7);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const now = new Date();
    const today = ramadanTimings.find((day) => new Date(day.date).toDateString() === now.toDateString());

    if (today) {
      setNextSehri(today.sehri);
      setNextIftar(today.iftar);
      updateCountdown(today);
    }
  }, []);

  const updateCountdown = (timing) => {
    const now = new Date();
    const sehriTime = new Date(`${timing.date} ${timing.sehri}`);
    const iftarTime = new Date(`${timing.date} ${timing.iftar}`);

    const nextTime = now < sehriTime ? sehriTime : iftarTime;
    const interval = setInterval(() => {
      const diff = nextTime - new Date();
      if (diff <= 0) {
        clearInterval(interval);
        setCountdown("Time Reached!");
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setCountdown(`${hours}h ${minutes}m remaining`);
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={10}>
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Card className="shadow-lg p-4 text-center bg-light rounded-4 border-0">
              <motion.h2 
                className="text-danger fw-bold"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Ramadan 2025 Sehri & Iftar Timings
              </motion.h2>
              <p className="text-muted">Observe your fast with accurate Sehri & Iftar timings.</p>
              
              {/* Countdown Timer */}
              <motion.div
                className="bg-dark text-white rounded-3 p-3 mb-3 shadow"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h4>Next Sehri: <span className="text-warning">{nextSehri}</span></h4>
                <h4>Next Iftar: <span className="text-success">{nextIftar}</span></h4>
                <h5 className="mt-2">{countdown}</h5>
              </motion.div>

              {/* Sehri & Iftar Table */}
              <Table striped bordered hover responsive className="table-light">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Sehri Time</th>
                    <th>Iftar Time</th>
                  </tr>
                </thead>
                <tbody>
                  {ramadanTimings.map((timing, index) => (
                    <tr key={index}>
                      <td>{timing.date}</td>
                      <td>{timing.sehri}</td>
                      <td>{timing.iftar}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default RamadanTimetable;
