"use client";
import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Alert, Card } from "react-bootstrap";
import { FaUserAlt, FaLock } from "react-icons/fa"; // Add icons for user and lock
import userLogin from "../../Services/LoginService/apiService";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
  });

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value || "", // Ensure no undefined values
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.userName || !formData.password) {
      setAlertMessage("Please fill in all fields.");
      setAlertVariant("danger");
      setShowAlert(true);
      return;
    }

    // Simulate login (you would replace this with actual API call)
    // setAlertMessage("Login successful!");
    // setAlertVariant("success");
    // setShowAlert(true);
    try {
      // Call the login API
      const response = await userLogin(formData.userName, formData.password);
    
      if (response && response.token) {
        // Save token and role in localStorage
        localStorage.setItem("token", response.token);
        localStorage.setItem("role", response.role);
        localStorage.setItem("userName", response.userName);
        setAlertMessage("Login successful!");
        setAlertVariant("success");
        setShowAlert(true);
    
        // Redirect user based on role
        const userRole = response.role;
    
        if (userRole === "Other") {
          window.location.href = "/SadqaMemberList";
        } else if (userRole === "Treasurer") {
          window.location.href = "/MasjidGullak";
        } else if (userRole === "Member") {
          window.location.href = "/VillageMemberList";
        } else if (userRole === "Admin") {
          window.location.href = "/Home";
        } else {
          // Optionally handle the case where the user role is unknown.
          setAlertMessage("Role not recognized.");
          setAlertVariant("danger");
          setShowAlert(true);
        }
      } else {
        throw new Error("Invalid response from the server.");
      }
    } catch (error) {
      setAlertMessage(error.message || "Login failed. Please try again.");
      setAlertVariant("danger");
      setShowAlert(true);
    }
    
    // Reset form (uncomment if necessary)
    // setFormData({ userName: "", password: "" });
    
    // Reset form
    // setFormData({ userName: "", password: "" });
  };

  return (
    <>
      <Container className="my-5">
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="shadow-lg rounded-3">
              <Card.Body>
                <h3 className="text-center mb-4 text-primary">Member Login</h3>

                {/* Show alert if any */}
                {showAlert && (
                  <Alert variant={alertVariant} onClose={() => setShowAlert(false)} dismissible>
                    {alertMessage}
                  </Alert>
                )}

                {/* Login Form */}
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="email" className="mb-3">
                    <Form.Label>User Name</Form.Label>
                    <div className="input-group">
                      <div className="input-group-text">
                        <FaUserAlt />
                      </div>
                      <Form.Control
                        type="userName"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                        placeholder="Enter username"
                        required
                        className="rounded-3"
                      />
                    </div>
                  </Form.Group>

                  <Form.Group controlId="password" className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <div className="input-group">
                      <div className="input-group-text">
                        <FaLock />
                      </div>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                        className="rounded-3"
                      />
                    </div>
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100 rounded-pill mb-3">
                    Login
                  </Button>
                </Form>

                <div className="text-center">
                  <a href="/forgot-password" className="text-muted">Forgot Password?</a>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default LoginPage;
