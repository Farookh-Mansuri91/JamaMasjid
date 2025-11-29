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
  Modal,
  Spinner,
  Collapse
} from "react-bootstrap";
import ReactPaginate from "react-paginate";
import {
  fetchVillageMemberData,
  addVillageMemberData,
  updateVillageMemberData,
  fetchMohallas,
} from "../../Services/VillageMemberService/apiService";
import { FaSearch, FaPlus, FaEdit, FaChevronDown, FaChevronUp } from "react-icons/fa";

const VillageMember = () => {
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage] = useState(10);
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
  const router = useRouter();
  const [loadingButton, setLoadingButton] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null); // for row expansion

  const handleNavigate = (path, buttonType) => {
    setLoadingButton(buttonType);
    setTimeout(() => {
      router.push(path);
    }, 300);
  };

  const headingStyle = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: "700",
    fontSize: "1.6rem",
    color: "#0d6efd",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    marginBottom: "1.5rem",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [members, mohallasData] = await Promise.all([
          fetchVillageMemberData(),
          fetchMohallas(),
        ]);
        setData(members || []);
        setMohallas(mohallasData || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    setIsClient(true);
  }, []);

  const filteredData = useMemo(() => {
    const t = searchText.trim().toLowerCase();
    if (!t) return data;
    return data.filter((item) =>
      `${item.firstName ?? ""} ${item.lastName ?? ""}`.toLowerCase().includes(t)
    );
  }, [searchText, data]);

  const handlePageChange = ({ selected }) => setCurrentPage(selected);
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
    if (!modalData.mobileNumber?.trim()) {
      newErrors.mobileNumber = "Mobile number is required.";
    } else if (!/^\d{10}$/.test(modalData.mobileNumber)) {
      newErrors.mobileNumber = "Mobile number must be 10 digits.";
    }
    if (!modalData.mohallaId) newErrors.mohallaId = "Mohalla is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setModalData({ ...modalData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  const handleSaveMember = async (event) => {
    event?.preventDefault();
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
      setData(updatedData || []);
      handleModalClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save member data.');
    }
  };

  const toggleExpand = (id) => setExpandedRow(expandedRow === id ? null : id);

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
        <h2 style={headingStyle}>Village Member</h2>
        {/* Back Button - Right aligned on mobile, Left on tablets/desktops */}
        <div className="d-flex justify-content-md-start justify-content-end mb-3">
          <BackButton />
        </div>
        <div className="d-flex justify-content-between align-items-center mb-3 flex-column flex-md-row gap-3">
          <div className="d-flex align-items-center w-100 w-md-50">
            <InputGroup className="me-2 w-100">
              <InputGroup.Text style={{ background: "#f6f8fb", borderRight: "none" }}>
                <FaSearch style={{ color: "#0d6efd" }} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search by first or last name..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                aria-label="Search members"
                style={{ borderLeft: "none" }}
              />
            </InputGroup>
          </div>

          <div className="d-flex gap-2 justify-content-end">
            {(isUserAuthenticated && (userRole === "Member" || userRole === "Admin")) && (
              <Button variant="primary" className="d-flex align-items-center rounded-pill" onClick={() => handleModalOpen({})}>
                <FaPlus className="me-2" /> Add New Member
              </Button>
            )}

            <Button
              variant="success"
              className="d-flex align-items-center rounded-pill"
              onClick={() => handleNavigate("/PaymentTrackerList", "paymentTracker")}
              disabled={loadingButton === "paymentTracker"}
            >
              {loadingButton === "paymentTracker" ? <Spinner animation="border" size="sm" /> : "Payment Details"}
            </Button>
          </div>
        </div>

        <div className="table-responsive modern-table-wrapper">
          <Table bordered hover className="table-modern align-middle">
            <thead className="table-head">
              <tr>
                <th style={{ width: 50 }}>#</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Father Name</th>
                <th>Mohalla</th>
                {isUserAuthenticated && (userRole === "Member" || userRole === "Admin") && <th>Mobile Number</th>}
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">No members found</td>
                </tr>
              ) : (
                currentData.map((member, idx) => {
                  const idKey = member.id ?? `${member.firstName}-${member.lastName}-${idx}`;
                  const rowIndex = currentPage * perPage + idx + 1;
                  // Optional: assume API returns an array member.mohallaMembers for the mohalla's committee members.
                  const mohallaMembers = member.mohallaMembers || member.membersOfMohalla || [];

                  return (
                    <React.Fragment key={idKey}>
                      <tr className="align-middle">
                        <td>{rowIndex}</td>
                        <td>{member.firstName}</td>
                        <td>{member.lastName}</td>
                        <td>{member.fatherName}</td>
                        <td>{member.mohallaName}</td>
                        {isUserAuthenticated && (userRole === "Member" || userRole === "Admin") && <td>{member.mobileNumber || "-"}</td>}
                        <td>
                          <div className="d-flex gap-2 align-items-center">

                            {/* EDIT BUTTON → ONLY for Member/Admin */}
                            {isUserAuthenticated && (userRole === "Member" || userRole === "Admin") && (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleModalOpen(member)}
                              >
                                <FaEdit className="me-1" /> Edit
                              </Button>
                            )}

                            {/* SHOW / HIDE BUTTON → VISIBLE FOR EVERYONE */}
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              aria-expanded={expandedRow === idKey}
                              onClick={() => toggleExpand(idKey)}
                            >
                              {expandedRow === idKey ? (
                                <>
                                  <FaChevronUp /> Hide
                                </>
                              ) : (
                                <>
                                  <FaChevronDown /> Show
                                </>
                              )}
                            </Button>

                          </div>
                        </td>


                      </tr>

                      {/* Expandable row for mohalla members */}
                      <tr>
                        <td colSpan={isUserAuthenticated && (userRole === "Member" || userRole === "Admin") ? 7 : 6} className="p-0 border-0">
                          <Collapse in={expandedRow === idKey}>
                            <div className="p-3 border-top bg-white">
                              <div className="d-flex flex-column flex-md-row gap-3 align-items-start">
                                {mohallaMembers.length > 0 ? (
                                  mohallaMembers.map((mm) => (
                                    <div key={mm.memberId ?? mm.id ?? mm.name} className="mohalla-card p-2">
                                      <div className="mohalla-name fw-bold">{mm.name ?? `${mm.firstName ?? ""} ${mm.lastName ?? ""}`}</div>
                                      {mm.mobileNumber || mm.mobile ? <div className="small text-muted">{mm.mobileNumber || mm.mobile}</div> : <div className="small text-muted">No mobile</div>}
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-muted">No committee members found for this mohalla.</div>
                                )}
                              </div>
                            </div>
                          </Collapse>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>

        <div className="d-flex justify-content-center mt-3">
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
      </div>

      <Modal show={showModal} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? "Edit Member" : "Add New Member"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveMember}>
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
                value={modalData.mobileNumber || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) handleInputChange("mobileNumber", value);
                }}
                maxLength={10}
                isInvalid={!!errors.mobileNumber}
              />
              <Form.Control.Feedback type="invalid">{errors.mobileNumber}</Form.Control.Feedback>
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
          <Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveMember}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default VillageMember;
