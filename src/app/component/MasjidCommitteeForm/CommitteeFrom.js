"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Container, Row, Col, Card, Button, ListGroup } from "react-bootstrap";
import moment from "moment"; // For handling date operations
import "./CommitteeForm.css";
import { fetchMasjidCommitteeData } from '../../Services/MasjidCommitteeService/apiService'; // Import the service layer


const MasjidCommitteeForm = () => {

  const [isClient, setIsClient] = useState(false);  // Flag to check if it’s client-side rendering
  const [isLoading, setIsLoading] = useState(true); // Flag to indicate loading state
  const [specialMembers, setSpecialMembers] = useState([]);
  const [regularMembers, setRegularMembers] = useState([]);
  const [imamHistory, setImamHistory] = useState([]);
  const headingStyle = {
    fontFamily: "'Poppins', sans-serif", // Modern font
    fontWeight: '600', // Semi-bold font
    fontSize: '1.5rem', // Larger text
    color: '#0d6efd', // Bright color for text
    textAlign: 'center',
    textTransform: 'uppercase', // Uppercase letters
    letterSpacing: '2px', // Spacing between letters
    textShadow: '2px 2px 5px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
    marginBottom: '2rem', // Bottom margin for spacing
  };
  useEffect(() => {
    // Fetch data from API
    const getData = async () => {
      try {
        const response = await fetchMasjidCommitteeData();
        if (response) {
          setSpecialMembers(response.specialMembers);
          setRegularMembers(response.regularMembers);
          setImamHistory(response.imamHistory);
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoading(false);
      }
    };

    getData();
    setIsClient(true);  // Ensure client-side rendering
  }, []);

  useEffect(() => {
    // Simulating a delay to show the loader
    setTimeout(() => {
      setIsLoading(false);  // Set to false after data is loaded
    }, 500);  // Adjust the timeout as per your need
    setIsClient(true);
  }, []);



  // Helper function to calculate years and months served
  const calculateYearsAndMonths = (startDate, endDate) => {
    const start = moment(startDate);
    const end = moment(endDate);
    console.log('datette', start.toLocaleString("en-GB"));
    console.log(start.diff(end, 'years'));
    const years = end.diff(start, 'years');
    const months = end.diff(start, 'months') % 12;
    return { years, months };
  };

  // Current Imam (e.g., Imam Ali)
  const currentImam = imamHistory[3];
  console.log('currentImam', currentImam);
  if (!isClient || isLoading) {
    // If not client-side, render nothing or loading skeleton
    return (
      <div className="loader-container">
        <div className="spinner-container">
          <div className="spinner-border text-primary" style={{ width: '5rem', height: '5rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Container className="py-5">
        <h2 className="text-center mb-4" style={headingStyle}>Imam's Details &Committee Members</h2>
        {/* Current Imam Section */}
        <h3 className="text-center mb-4" style={headingStyle}>Current Imam</h3>
        <Row xs={1} md={2} lg={2} className="g-4">
          <Col>
            <Card className="shadow-lg border-0 rounded">
              <Card.Img variant="top" src={currentImam.imamImage} />
              <Card.Body>
                <Card.Title>{currentImam.imamName}</Card.Title>
                <Card.Text className="text-muted">Imam</Card.Text>
                <Card.Text><strong>Joined:</strong> {moment(currentImam.joiningDate).format('MMMM YYYY')} </Card.Text>
                <Card.Text><strong>Address:</strong> {currentImam.address}</Card.Text>
                <Card.Text><strong>Last Serving Day:</strong> {currentImam.lastServingDay}</Card.Text>
                <Card.Text>
                  <strong>Total Service:</strong> {calculateYearsAndMonths(currentImam.yearJoined + "-01-01", currentImam.lastServingDay).years} years {calculateYearsAndMonths(currentImam.yearJoined + "-01-01", currentImam.lastServingDay).months} months
                </Card.Text>
                <Card.Text><strong>Salary:</strong> ${currentImam.salary}</Card.Text>
                <Card.Text><strong>Contact:</strong> {currentImam.contactNumber}</Card.Text>
              </Card.Body>
            </Card>
          </Col>

          {/* Additional Content on Right Side */}
          <Col>
            <Card className="shadow-lg border-0 rounded">
              <Card.Body>
                <Card.Title>Imam's Bio</Card.Title>
                <Card.Text>
                  Imam {currentImam.name} has been serving the community since {moment(currentImam.joiningDate).format('MMMM YYYY')}. With a deep understanding of Islamic teachings, he has been an instrumental part of the masjid, guiding the community in spiritual matters, leading prayers, and offering support to the needy.
                </Card.Text>
                <Card.Title>Upcoming Events</Card.Title>
                <ListGroup variant="flush">
                  <ListGroup.Item>Lecture on Islamic Ethics - January 15, 2025</ListGroup.Item>
                  <ListGroup.Item>Community Prayer Session - February 20, 2025</ListGroup.Item>
                  <ListGroup.Item>Masjid Fundraising Event - March 25, 2025</ListGroup.Item>
                </ListGroup>
                <Card.Title>Imam's Vision</Card.Title>
                <Card.Text>
                  "To strengthen the bonds of the community and foster a place where every individual feels welcome and supported."
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Imam History Section */}
        <div className="text-center mb-4"></div>
        <h3 className="text-center mb-4" style={headingStyle}>Imam History</h3>
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {imamHistory.map((imam) => {
            const { years, months } = calculateYearsAndMonths(imam.joiningDate, imam.lastServingDate);
            return (
              <Col key={imam.imamId}>
                <Card className="shadow-lg border-0 rounded">
                  <Card.Img variant="top" src={imam.imamImage} />
                  <Card.Body>
                    <Card.Title>{imam.imamName}</Card.Title>
                    <Card.Text className="text-muted">Imam</Card.Text>
                    <Card.Text><strong>Joined:</strong> {moment(imam.joiningDate).format('MMMM YYYY')}</Card.Text>
                    <Card.Text><strong>Last Serving Day:</strong> {moment(imam.lastServingDate).format('MMMM YYYY')}</Card.Text>
                    <Card.Text><strong>Total Service:</strong> {years} years {months} months</Card.Text>
                    <Card.Text><strong>Salary:</strong> ${imam.salary}</Card.Text>
                    <Card.Text><strong>Contact:</strong> {imam.contactNumber}</Card.Text>
                    {/* <Button variant="primary" href={`mailto:${imam.contactNumber}`}>
                      Contact Imam
                    </Button> */}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* Special Roles Section */}
        <div className="text-center mb-4"></div>
        <h2 className="text-center mb-4" style={headingStyle}>Special Roles</h2>
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {specialMembers.map((member) => (
            <Col key={member.id}>
              <Card className="shadow-lg border-0 rounded">
                <Card.Img variant="top" src={member.memberPic} />
                <Card.Body>
                  <Card.Title>{member.name}</Card.Title>
                  <Card.Text className="text-muted">{member.roleName}</Card.Text>
                  <Card.Text><strong>Father's Name:</strong> {member.fatherName}</Card.Text>
                  <Card.Text><strong>Contact:</strong> {member.mobileNumber}</Card.Text>
                  {/* <Button variant="primary" href={`mailto:${member.mobileNumber}`}>
                    Contact Member
                  </Button> */}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Regular Members Section */}
        <div className="text-center mb-4"></div>
        <h2 className="text-center mb-4" style={headingStyle}>Village Members</h2>
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {regularMembers.map((member) => (
            <Col key={member.id}>
              <Card className="shadow-lg border-0 rounded">
                <Card.Img variant="top" src={member.memberPic} />
                <Card.Body>
                  <Card.Title>{member.name}</Card.Title>
                  <Card.Text className="text-muted">{member.roleName}</Card.Text>
                  <Card.Text><strong>Father's Name:</strong> {member.fatherName}</Card.Text>
                  <Card.Text><strong>Contact:</strong> {member.mobileNumber}</Card.Text>
                  {/* <Button variant="primary" href={`mailto:${member.mobileNumber}`}>
                    Contact Member
                  </Button> */}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default MasjidCommitteeForm;
