"use client";
import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Alert, Card, ListGroup } from "react-bootstrap";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("");
  const headingStyle = {
    fontFamily: "'Poppins', sans-serif", // Modern font
    fontWeight: '600', // Semi-bold font
    fontSize: '1.5rem', // Larger text
    color: '#080808', // Bright color for text
    textAlign: 'center',
    textTransform: 'uppercase', // Uppercase letters
    letterSpacing: '2px', // Spacing between letters
    textShadow: '2px 2px 5px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
    marginBottom: '2rem', // Bottom margin for spacing
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      setAlertMessage("All fields are required!");
      setAlertVariant("danger");
      setShowAlert(true);
      return;
    }

    // Simulate a successful form submission (you can replace it with an actual API call)
    setAlertMessage("Your message has been sent successfully!");
    setAlertVariant("success");
    setShowAlert(true);

    // Reset form
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <>
      <Container className="my-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <h2 className="text-center mb-4" style={headingStyle}>Contact Us</h2>
            {showAlert && (
              <Alert variant={alertVariant} onClose={() => setShowAlert(false)} dismissible>
                {alertMessage}
              </Alert>
            )}

            {/* Contact Form */}
            <Form onSubmit={handleSubmit} className="shadow-sm p-4 rounded bg-light">
              <Form.Group controlId="name" className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                  className="rounded-pill"
                />
              </Form.Group>

              <Form.Group controlId="email" className="mb-3">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="rounded-pill"
                />
              </Form.Group>

              <Form.Group controlId="message" className="mb-3">
                <Form.Label>Message</Form.Label>
                <Form.Control
                  as="textarea"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Write your message"
                  required
                  className="rounded-3"
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100 rounded-pill">
                Send Message
              </Button>
            </Form>

            <hr className="my-4" />

            {/* Developer Information */}
            <Card className="mt-5 shadow-lg">
              <Card.Header as="h5" className="bg-primary text-white text-center">
                Developer Information
              </Card.Header>
              <Card.Body className="bg-light">
                <Card.Text className="text-center">
                  If you have any questions or need assistance, feel free to contact the developer.
                </Card.Text>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex align-items-center">
                    <h2 className="text-center mb-4" style={headingStyle}> <strong>Name: </strong> Farookh Mansuri</h2>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex align-items-center">
                    <FaEnvelope className="text-primary mr-3" />
                    <strong>Email:</strong>{" "}
                    <a href="farookh.mansuri91@gmail.com" className="text-decoration-none">
                      farookh.mansuri91@gmail.com
                    </a>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex align-items-center">
                    <FaPhoneAlt className="text-primary mr-3" />
                    <strong>Mobile:</strong> +91 9818437359
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex align-items-center">
                    <FaMapMarkerAlt className="text-primary mr-3" />
                    <strong>Location:</strong> Bareilly, UP.
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ContactForm;
