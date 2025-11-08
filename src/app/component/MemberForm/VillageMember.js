"use client";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./VillageMember.css";
import { toast } from 'react-toastify';  // Importing react-toastify
import 'react-toastify/dist/ReactToastify.css';  // Import the Toastify CSS
import { isAuthenticated, getUserRole } from "../../Utils/authHelpers"; // Authentication utils
import BackButton from "../common/BackButton";

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
import {
  fetchVillageMemberData,
  addVillageMemberData,
  updateVillageMemberData,
  fetchMohallas,
} from "../../Services/VillageMemberService/apiService"; // Service methods
import { FaSearch, FaPlus, FaEdit } from "react-icons/fa";

const VillageMember = () => {
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [mohallas, setMohallas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({});
  const [errors, setErrors] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const isUserAuthenticated = useMemo(() => (isClient ? isAuthenticated() : false), [isClient]);
  const userRole = useMemo(() => (isClient ? getUserRole() : null), [isClient]);
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
    const fetchData = async () => {
      try {
        const [members, mohallasData] = await Promise.all([
          fetchVillageMemberData(),
          fetchMohallas(),
        ]);
        setData(members);
        setMohallas(mohallasData);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    setIsClient(true);
  }, []);

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
    setIsEdit(!!member.id);
    setShowModal(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!modalData.firstName?.trim()) newErrors.firstName = "First Name is required.";
    if (!modalData.lastName?.trim()) newErrors.lastName = "Last Name is required.";
    if (!modalData.fatherName?.trim()) newErrors.fatherName = "Father's Name is required.";
    if (!modalData.mobile?.trim()) {
      newErrors.mobile = "Mobile number is required.";
    } else if (!/^\d{10}$/.test(modalData.mobile)) {
      newErrors.mobile = "Mobile number must be 10 digits.";
    }
    if (!modalData.mohallaId) newErrors.mohallaId = "Mohalla is required.";

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
        await updateVillageMemberData(modalData);
        toast.success('Member updated successfully!');
      } else {
        await addVillageMemberData(modalData);
        toast.success('Member added successfully!');
      }
      const updatedData = await fetchVillageMemberData();
      setData(updatedData);
      handleModalClose();
    } catch (error) {
      toast.error('Failed to save member data.');
    }
  };

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
          Village Member
        </h2>
        {/* Back Button - Right aligned on mobile, Left on tablets/desktops */}
        <div className="d-flex justify-content-md-start justify-content-end mb-3">
          <BackButton />
        </div>
        <Row className="align-items-center mb-4 g-3">
          {/* Search Input - Takes more space on large screens */}
          <Col xs={12} md={5} lg={6}>
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

          {/* Buttons - Stay in a single row */}
          <Col xs={12} md={7} lg={6} className="d-flex flex-wrap justify-content-center justify-content-md-end gap-2">
            {/* Add Member Button (Shown for Admin & Member roles) */}
            {(isUserAuthenticated && (userRole === "Member" || userRole === "Admin")) && (
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
              onClick={() => handleNavigate("/PaymentTrackerList", "paymentTracker")}
              disabled={loadingButton === "paymentTracker"}
            >
              {loadingButton === "paymentTracker" && <Spinner animation="border" size="sm" />}
              Payment Details
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
              <th>Mohalla</th>
              <th>Mobile</th>
              {isUserAuthenticated && (userRole === "Member" || userRole === "Admin") && (<th>Actions</th>)}
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
                <tr key={member.id || `${member.firstName}-${member.lastName}-${index}`}>
                  <td>{currentPage * perPage + index + 1}</td>
                  <td>{member.firstName}</td>
                  <td>{member.lastName}</td>
                  <td>{member.fatherName}</td>
                  <td>{member.mohallaName}</td>
                  <td>{member.mobile}</td>
                  {isUserAuthenticated && (userRole === "Member" || userRole === "Admin") && (<td>
                    <Button
                      variant="primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleModalOpen(member)}
                    >
                      Edit
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

            <Form.Group className="mb-3">
              <Form.Label>Mobile</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter mobile number"
                value={modalData.mobile || ""}
                onChange={(e) => handleInputChange("mobile", e.target.value)}
                isInvalid={!!errors.mobile}
              />
              <Form.Control.Feedback type="invalid">{errors.mobile}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mohalla</Form.Label>
              <Form.Select
                value={modalData.mohallaId || ""}
                onChange={(e) => handleInputChange("mohallaId", e.target.value)}
                isInvalid={!!errors.mohallaId}
              >
                <option value="">Select Mohalla</option>
                {mohallas.map((mohalla) => (
                  <option key={mohalla.mohallaId} value={mohalla.mohallaId}>
                    {mohalla.mohallaName}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.mohallaId}</Form.Control.Feedback>
            </Form.Group>
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

export default VillageMember;
