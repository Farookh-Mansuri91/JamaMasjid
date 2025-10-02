"use client";

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, ListGroup } from "react-bootstrap";
import moment from "moment";
import "./CommitteeForm.css";
import { fetchMasjidCommitteeData } from "../../Services/MasjidCommitteeService/apiService";

const MasjidCommitteeForm = () => {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [specialMembers, setSpecialMembers] = useState([]);
  const [regularMembers, setRegularMembers] = useState([]);
  const [imamHistory, setImamHistory] = useState([]);

  const headingStyle = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: "600",
    fontSize: "1.5rem",
    color: "#0d6efd",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: "2px",
    textShadow: "2px 2px 5px rgba(0, 0, 0, 0.1)",
    marginBottom: "2rem",
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetchMasjidCommitteeData();
        if (response) {
          setSpecialMembers(response.specialMembers || []);
          setRegularMembers(response.regularMembers || []);
          setImamHistory(response.imamHistory || []);
        }
      } catch (error) {
        console.error("Error fetching masjid committee data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getData();
    setIsClient(true);
  }, []);

  const calculateYearsAndMonths = (startDate, endDate) => {
    if (!startDate || !endDate) return { years: 0, months: 0 };
    const start = moment(startDate);
    const end = moment(endDate);
    const years = end.diff(start, "years");
    const months = end.diff(start, "months") % 12;
    return { years, months };
  };

  const currentImam =
    imamHistory.length > 0 ? imamHistory[imamHistory.length - 1] : null;

  if (!isClient || isLoading) {
    return (
      <div className="loader-container">
        <div className="spinner-container">
          <div
            className="spinner-border text-primary"
            style={{ width: "5rem", height: "5rem" }}
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4" style={headingStyle}>
        Imam's Details & Committee Members
      </h2>

      {/* Current Imam */}
      <h3 className="text-center mb-4" style={headingStyle}>
        Current Imam
      </h3>
      {currentImam ? (
        <Row xs={1} md={2} lg={2} className="g-4">
          <Col>
            <Card className="shadow-lg border-0 rounded">
              <Card.Img
                variant="top"
                src={currentImam?.imamImage || "/placeholder.jpg"}
              />
              <Card.Body>
                <Card.Title>{currentImam?.imamName || "Unknown Imam"}</Card.Title>
                <Card.Text className="text-muted">Imam</Card.Text>
                <Card.Text>
                  <strong>Joined:</strong>{" "}
                  {currentImam?.joiningDate
                    ? moment(currentImam.joiningDate).format("MMMM YYYY")
                    : "N/A"}
                </Card.Text>
                <Card.Text>
                  <strong>Address:</strong> {currentImam?.address || "N/A"}
                </Card.Text>
                <Card.Text>
                  <strong>Last Serving Day:</strong>{" "}
                  {currentImam?.lastServingDay || "N/A"}
                </Card.Text>
                <Card.Text>
                  <strong>Total Service:</strong>{" "}
                  {calculateYearsAndMonths(
                    currentImam?.yearJoined + "-01-01",
                    currentImam?.lastServingDay
                  ).years}{" "}
                  years{" "}
                  {calculateYearsAndMonths(
                    currentImam?.yearJoined + "-01-01",
                    currentImam?.lastServingDay
                  ).months}{" "}
                  months
                </Card.Text>
                <Card.Text>
                  <strong>Salary:</strong> ${currentImam?.salary || "N/A"}
                </Card.Text>
                <Card.Text>
                  <strong>Contact:</strong> {currentImam?.contactNumber || "N/A"}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          {/* Imam Bio */}
          <Col>
            <Card className="shadow-lg border-0 rounded">
              <Card.Body>
                <Card.Title>Imam's Bio</Card.Title>
                <Card.Text>
                  Imam {currentImam?.imamName || "N/A"} has been serving the
                  community since{" "}
                  {currentImam?.joiningDate
                    ? moment(currentImam.joiningDate).format("MMMM YYYY")
                    : "N/A"}
                  . With dedication, he has guided the community spiritually and
                  supported those in need.
                </Card.Text>
                <Card.Title>Upcoming Events</Card.Title>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    Lecture on Islamic Ethics - January 15, 2025
                  </ListGroup.Item>
                  <ListGroup.Item>
                    Community Prayer Session - February 20, 2025
                  </ListGroup.Item>
                  <ListGroup.Item>
                    Masjid Fundraising Event - March 25, 2025
                  </ListGroup.Item>
                </ListGroup>
                <Card.Title>Imam's Vision</Card.Title>
                <Card.Text>
                  "To strengthen the bonds of the community and foster a place
                  where every individual feels welcome and supported."
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <p className="text-center text-muted">No current Imam data found.</p>
      )}

      {/* Imam History */}
      <h3 className="text-center mb-4" style={headingStyle}>
        Imam History
      </h3>
      {imamHistory.length > 0 ? (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {imamHistory.map((imam) => {
            const { years, months } = calculateYearsAndMonths(
              imam.joiningDate,
              imam.lastServingDate
            );
            return (
              <Col key={imam.imamId}>
                <Card className="shadow-lg border-0 rounded">
                  <Card.Img
                    variant="top"
                    src={imam.imamImage || "/placeholder.jpg"}
                  />
                  <Card.Body>
                    <Card.Title>{imam.imamName || "Unknown"}</Card.Title>
                    <Card.Text className="text-muted">Imam</Card.Text>
                    <Card.Text>
                      <strong>Joined:</strong>{" "}
                      {imam.joiningDate
                        ? moment(imam.joiningDate).format("MMMM YYYY")
                        : "N/A"}
                    </Card.Text>
                    <Card.Text>
                      <strong>Last Serving Day:</strong>{" "}
                      {imam.lastServingDate
                        ? moment(imam.lastServingDate).format("MMMM YYYY")
                        : "N/A"}
                    </Card.Text>
                    <Card.Text>
                      <strong>Total Service:</strong> {years} years {months} months
                    </Card.Text>
                    <Card.Text>
                      <strong>Salary:</strong> ${imam.salary || "N/A"}
                    </Card.Text>
                    <Card.Text>
                      <strong>Contact:</strong> {imam.contactNumber || "N/A"}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        <p className="text-center text-muted">No Imam history found.</p>
      )}

      {/* Special Roles */}
      <h2 className="text-center mb-4" style={headingStyle}>
        Special Roles
      </h2>
      {specialMembers.length > 0 ? (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {specialMembers.map((member) => (
            <Col key={member.id}>
              <Card className="shadow-lg border-0 rounded">
                <Card.Img
                  variant="top"
                  src={member.memberPic || "/placeholder.jpg"}
                />
                <Card.Body>
                  <Card.Title>{member.name || "N/A"}</Card.Title>
                  <Card.Text className="text-muted">
                    {member.roleName || "N/A"}
                  </Card.Text>
                  <Card.Text>
                    <strong>Father's Name:</strong> {member.fatherName || "N/A"}
                  </Card.Text>
                  <Card.Text>
                    <strong>Contact:</strong> {member.mobileNumber || "N/A"}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <p className="text-center text-muted">No special members found.</p>
      )}

      {/* Regular Members */}
      <h2 className="text-center mb-4" style={headingStyle}>
        Village Members
      </h2>
      {regularMembers.length > 0 ? (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {regularMembers.map((member) => (
            <Col key={member.id}>
              <Card className="shadow-lg border-0 rounded">
                <Card.Img
                  variant="top"
                  src={member.memberPic || "/placeholder.jpg"}
                />
                <Card.Body>
                  <Card.Title>{member.name || "N/A"}</Card.Title>
                  <Card.Text className="text-muted">
                    {member.roleName || "N/A"}
                  </Card.Text>
                  <Card.Text>
                    <strong>Father's Name:</strong> {member.fatherName || "N/A"}
                  </Card.Text>
                  <Card.Text>
                    <strong>Contact:</strong> {member.mobileNumber || "N/A"}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <p className="text-center text-muted">No members found.</p>
      )}
    </Container>
  );
};

export default MasjidCommitteeForm;
