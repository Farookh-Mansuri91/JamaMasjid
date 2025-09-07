"use client";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Container,
  Button,
  Row,
  Col,
  Form,
  Table,
  InputGroup,
  Modal, Spinner
} from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { FaSearch, FaPlus, FaEdit } from "react-icons/fa";
import { toast } from 'react-toastify';  // Importing react-toastify
import 'react-toastify/dist/ReactToastify.css';  // Import the Toastify CSS
import "./SadqamemberForm.css";

import {
  fetchSadqaMemberData,
  addSadqaMemberData,
  updateSadqaMemberData
} from "../../Services/SadqaMemberService/apiService"; // Service methods
import { isAuthenticated, getUserRole } from "../../Utils/authHelpers"; // Authentication utils
import BackButton from "../common/BackButton";


const SadqaMember = () => {
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({});
  const [errors, setErrors] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const router = useRouter(); // ✅ Initialize router
  const [loadingButton, setLoadingButton] = useState(null); // Track which button is loading

  const handleNavigate = (path, buttonType) => {
    setLoadingButton(buttonType); // Set the loading state for the clicked button
    setTimeout(() => {
      router.push(path); // Navigate after delay
      //setLoadingButton(null); // Reset loader after navigation
    }, 300);
  };

  const headingStyle = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: "600",
    fontSize: "1.5rem",
    color: "#0d6efd",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: "2px",
    marginBottom: "2rem",
  };
  useEffect(() => {
    setIsClient(true);

    if (typeof window !== "undefined") {
      setIsUserAuthenticated(isAuthenticated());
      setUserRole(getUserRole());
    }
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [members, mohallasData] = await Promise.all([fetchSadqaMemberData()]);
        setData(members);  // Store all data
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    setIsClient(true);
  }, []);

  // Apply filter logic to the entire dataset, not just the page's data
  const filteredData = useMemo(() => {
    return data.filter((item) =>
      `${item.firstName} ${item.lastName}`.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, data]);

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  const currentData = filteredData.slice(currentPage * perPage, (currentPage + 1) * perPage);

  const handleModalClose = () => {
    setShowModal(false);
    setModalData({});
    setIsEdit(false);
    setErrors({});
  };

  const handleModalOpen = (member = {}) => {
    setModalData(member);
    setIsEdit(!!member.memberId);
    setShowModal(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!modalData.firstName?.trim()) newErrors.firstName = "First Name is required.";
    if (!modalData.lastName?.trim()) newErrors.lastName = "Last Name is required.";
    if (!modalData.fatherName?.trim()) newErrors.fatherName = "Father's Name is required.";
    // if (!modalData.mobile?.trim()) {
    //   newErrors.mobile = "Mobile number is required.";
    // } else if (!/^\d{10}$/.test(modalData.mobile)) {
    //   newErrors.mobile = "Mobile number must be 10 digits.";
    // }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setModalData({ ...modalData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleSaveMember = async (event) => {
    event?.preventDefault(); // Prevent default only if event exists

    if (!validateForm()) return;

    try {
      if (isEdit) {
        await updateSadqaMemberData(modalData);
        toast.success("Member updated successfully!");
      } else {
        await addSadqaMemberData(modalData);
        toast.success("Member added successfully!");
      }

      const updatedData = await fetchSadqaMemberData();
      setData(updatedData);
      setShowModal(false);
    } catch (error) {
      toast.error("Failed to save member data!");
    }
  };
console.log('isauth',isUserAuthenticated);
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
    <div className="card" style={{ position: "relative" }}>

      <div className="container my-4">
        <h2 className="text-center mb-4" style={headingStyle}>
          Sadqa Member
        </h2>
        {/* Back Button - Right aligned on mobile, Left on tablets/desktops */}
        <div className="d-flex justify-content-md-start justify-content-end mb-3">
          <BackButton />
        </div>
        <Row className="align-items-center mb-4 g-3">
          {/* Search Bar - Takes More Space on Large Screens */}
          <Col xs={12} md={6} lg={7}>
            <InputGroup>
              <InputGroup.Text
                style={{
                  backgroundColor: "#f1f3f5",
                  borderRight: "none",
                  borderRadius: "50px 0 0 50px",
                  padding: "10px",
                }}
              >
                <FaSearch style={{ color: "#007bff" }} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search by First Name..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  borderLeft: "none",
                  borderRadius: "0 50px 50px 0",
                  padding: "10px 15px",
                }}
              />
            </InputGroup>
          </Col>

          {/* Buttons - Stack on Small Screens, Inline on Large Screens */}
          <Col xs={12} md={6} lg={5} className="d-flex justify-content-center justify-content-md-end gap-2">
            {/* Add Member Button (Shown for Admin & Other roles) */}
            {(isUserAuthenticated && (userRole === "Other" || userRole === "Admin")) && (
              <Button
                variant="primary"
                className="rounded-pill shadow-sm"
                onClick={() => handleModalOpen({})}>
                <FaPlus className="me-2" />
                Add Member
              </Button>
            )}

            {/* View Details Button */}
            <Button
              variant="success"
              className="d-flex align-items-center justify-content-center gap-2 rounded-pill px-4 shadow-sm"
              onClick={() => handleNavigate("/SadqaPaymentTrackerList", "paymentTracker")}
              disabled={loadingButton === "paymentTracker"}
            >
              {loadingButton === "paymentTracker" && <Spinner animation="border" size="sm" />}
              View Details
            </Button>
          </Col>
        </Row>


        <Table striped bordered hover responsive className="table-modern">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Father Name</th>
              {/* <th>Mobile</th> */}
              {isUserAuthenticated && userRole === "Other" || userRole === "Admin" && (<th>Actions</th>)}
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  No members found
                </td>
              </tr>
            ) : (
              currentData.map((member, index) => (
                <tr key={member.memberId || `${member.firstName}-${member.lastName}-${index}`}>
                  <td>{currentPage * perPage + index + 1}</td>
                  <td>{member.firstName}</td>
                  <td>{member.lastName}</td>
                  <td>{member.fatherName}</td>
                  {/* <td>{member.mobile}</td> */}
                  {isUserAuthenticated && userRole === "Other" || userRole === "Admin" && (<td>
                    <Button
                      variant="primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleModalOpen(member)}
                    >Edit
                      {/* <FaEdit /> */}
                    </Button>
                  </td>)}
                </tr>
              ))
            )}
          </tbody>
        </Table>

        <ReactPaginate
          previousLabel={"Previous"}
          nextLabel={"Next"}
          breakLabel={"..."}
          pageCount={Math.ceil(filteredData.length / perPage)}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageChange}
          containerClassName={"pagination justify-content-center"}
          activeClassName={"active"}
          pageClassName={"page-item"}
          pageLinkClassName={"page-link"}
          previousClassName={"page-item"}
          previousLinkClassName={"page-link"}
          nextClassName={"page-item"}
          nextLinkClassName={"page-link"}
        />
      </div>

      <Modal show={showModal} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? "Edit Member" : "Add Member"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter first name"
                value={modalData.firstName || ""}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                isInvalid={!!errors.firstName}
              />
              <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter last name"
                value={modalData.lastName || ""}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                isInvalid={!!errors.lastName}
              />
              <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Father Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter father's name"
                value={modalData.fatherName || ""}
                onChange={(e) => handleInputChange("fatherName", e.target.value)}
                isInvalid={!!errors.fatherName}
              />
              <Form.Control.Feedback type="invalid">{errors.fatherName}</Form.Control.Feedback>
            </Form.Group>

            {/* <Form.Group className="mb-3">
              <Form.Label>Mobile</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter mobile number"
                value={modalData.mobile || ""}
                onChange={(e) => handleInputChange("mobile", e.target.value)}
                isInvalid={!!errors.mobile}
              />
              <Form.Control.Feedback type="invalid">{errors.mobile}</Form.Control.Feedback>
            </Form.Group> */}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => handleSaveMember()}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SadqaMember;
