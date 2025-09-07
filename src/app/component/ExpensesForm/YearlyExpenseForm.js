"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Table,
  Pagination,
  Container,
  Row,
  Col,
  Card,
  Dropdown,
  DropdownButton,
  Modal,
  Button,
  Form,
} from "react-bootstrap";
import "./YearlyExpenseForm.css";
import { toast } from 'react-toastify';  // Importing react-toastify
import 'react-toastify/dist/ReactToastify.css';  // Import the Toastify CSS
import { fetchYearlyExpensesData, addExpenseData, updateExpenseData } from "../../Services/MasjidYearlyExpenses/apiService";
import { fetchMasjidCommitteeData } from "../../Services/MasjidCommitteeService/apiService";
import { isAuthenticated, getUserRole } from "../../Utils/authHelpers"; // Authentication utils
import BackButton from "../common/BackButton";
const ExpenseDetails = () => {
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [years, setYears] = useState([]);
  const [modalData, setModalData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [villageAllMembers, setVillageAllMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // error message state
  const itemsPerPage = 10;
  const [isClient, setIsClient] = useState(false); // Client-side rendering flag
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isUserAuthenticated = useMemo(() => (isClient ? isAuthenticated() : false), [isClient]);
  const userRole = useMemo(() => (isClient ? getUserRole() : null), [isClient]);

  useEffect(() => {
    // Simulating client-side rendering
    setIsClient(true);
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetchYearlyExpensesData(selectedYear);
        const { yearlyExpenses, totalExpenses } = response;

        setExpenses(yearlyExpenses);
        setTotalExpenses(totalExpenses);
        setError(null);
      } catch (error) {
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);


  useEffect(() => {
    const currentYear = new Date().getFullYear();
    setYears(Array.from({ length: 4 }, (_, i) => currentYear - i));
  }, []);

  useEffect(() => {
    const fetchMemberData = async () => {
      setLoading(true);
      try {
        const memberData = await fetchMasjidCommitteeData();

        const allMemberData = [
          ...(memberData.regularMembers || []),
          ...(memberData.specialMembers || []),
        ];

        setVillageAllMembers(allMemberData);
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleAddExpense = () => {
    setModalData({
      expenseDate: new Date().toISOString().split("T")[0], // Set today’s date
      category: "",
      memberId: "",
      description: "",
      amount: "",
      paidTo: "",
      year: new Date().getFullYear(),
      paidBy: "",  // Ensuring 'Paid By' is blank in add mode
    });
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleEditExpense = (expense) => {
    const date = new Date(expense.expenseDate);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    setModalData({
      id: expense.id,
      memberId: expense.memberId,
      expenseDate: formattedDate,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      paidTo: expense.paidTo,
      year: new Date(expense.expenseDate).getFullYear(),
      paidBy: expense.paidBy || "",  // Ensure Paid By is properly bound
    });

    setIsEditMode(true);
    setShowModal(true);
  };


  const handleModalClose = () => setShowModal(false);

  const handleModalSubmit = async () => {
    if (!modalData.expenseDate || !modalData.category || !modalData.description || !modalData.amount || !modalData.paidTo || !modalData.paidBy) {
      setError("All fields are required.");
      return;
    }

    setError(null);

    try {
      const newExpenseData = {
        ...modalData
      };
      if (!isEditMode) {
        await addExpenseData(newExpenseData);
        // Show success message
        toast.success('Expense saved successfully!');
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        await updateExpenseData(newExpenseData);
        // Show success message
        toast.success('Expense update successfully!');
        setTimeout(() => setShowSuccess(false), 3000);
      }

      setShowModal(false);

      // Refresh the expense list
      const response = await fetchYearlyExpensesData(selectedYear);
      setExpenses(response.yearlyExpenses);
      setTotalExpenses(response.totalExpenses);
    } catch (error) {
      // Show success message
      toast.error('Something went wrong!');
      setTimeout(() => setShowSuccess(false), 3000);
      setError("Failed to save data. Please try again.");
    }
  };


  const totalPages = Math.ceil(expenses.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExpenses = expenses.slice(indexOfFirstItem, indexOfLastItem);
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const handleYearChange = (year) => {
    setSelectedYear(year);
    setIsDropdownOpen(false);
    setCurrentPage(1);
  };
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
  const columnNames = {
    sno: "SNO.#",
    expenseDate: "Date",
    year: "Year",
    category: "Category",
    description: "Description",
    amount: "Amount (₹)",
    paidTo: "Paid To",
    paidBy: "Paid By",
    ...(isUserAuthenticated && (userRole === "Treasurer" || userRole === "Admin")
      ? { actions: "Actions" }
      : {}), // Show Actions column only for Member or Admin
  };
  // Helper function to get the name of the person who paid by their ID
  const getPaidByName = (id) => {
    const member = villageAllMembers.find((member) => member.id === id);
    return member ? member.name : "Unknown";
  };
  if (!isClient || isLoading) {
    // Loading skeleton
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

if (error) {
    return <div className="alert alert-danger text-center">{error}</div>;
}
  return (
    <>
      <Container className="py-5">
                        {/* Back Button - Right aligned on mobile, Left on tablets/desktops */}
                        <div className="d-flex justify-content-md-start justify-content-end mb-3">
                          <BackButton />
                        </div>
        <Row>
          <Col>
            <Card className="shadow-sm mb-4 text-center">
              <Card.Body>
                <h2></h2>
                <h2 className="text-center mb-4" style={headingStyle}>Total Expenses for {selectedYear}</h2>
                <h3 className="text-danger">₹ {totalExpenses.toLocaleString()}</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-4 d-flex align-items-center">
          <Col className="d-flex justify-content-end flex-wrap gap-3">
            <div ref={dropdownRef} style={{ minWidth: "250px" }}>
              <DropdownButton
                id="year-dropdown"
                title={`Select Year: ${selectedYear}`}
                show={isDropdownOpen}
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                variant="outline-primary"
                className="w-100 text-start"
              >
                {years.map((year) => (
                  <Dropdown.Item
                    key={year}
                    eventKey={year}
                    className="bg-light text-dark"
                    onClick={() => handleYearChange(year)}
                  >
                    {year}
                  </Dropdown.Item>
                ))}
              </DropdownButton>
            </div>
            {isUserAuthenticated && (userRole === "Treasurer" || userRole === "Admin") && (<Button
              variant="success"
              onClick={handleAddExpense}
              className="px-4"
            >
              + Add Expense
            </Button>)}
          </Col>
        </Row>

        <Row>
          <Col>
            <Table
              className="table-modern shadow-sm"
              striped
              hover
              bordered
              responsive
            >
              <thead className="bg-primary text-white">
                <tr>
                  {Object.keys(columnNames).map((key) => (
                    <th key={key}>{columnNames[key]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentExpenses.map((expense, index) => {
                  return (
                    <tr key={expense.id}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>{new Date(expense.expenseDate).toLocaleDateString()}</td>
                      <td>{new Date(expense.expenseDate).getFullYear()}</td>
                      <td>{expense.category}</td>
                      <td>{expense.description}</td>
                      <td>{expense.amount.toLocaleString()}</td>
                      <td>{expense.paidTo}</td>
                      <td>{getPaidByName(expense.paidBy)}</td>
                      {isUserAuthenticated && (userRole === "Treasurer" || userRole === "Admin") && (<td>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleEditExpense(expense)}
                        >
                          Edit
                        </Button>
                      </td>)}
                    </tr>
                  );
                })}
              </tbody>


            </Table>

            <Pagination className="justify-content-center mt-4">
              <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
              <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
              {[...Array(totalPages)].map((_, idx) => (
                <Pagination.Item
                  key={idx + 1}
                  active={idx + 1 === currentPage}
                  onClick={() => handlePageChange(idx + 1)}
                >
                  {idx + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
              <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
            </Pagination>
          </Col>
        </Row>
      </Container>

      <Modal show={showModal} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? "Edit Expense" : "Add Expense"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Expense Date */}
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={modalData.expenseDate || ""}
                onChange={(e) =>
                  setModalData({ ...modalData, expenseDate: e.target.value })
                }
                isInvalid={error && !modalData.expenseDate}
              />
              {error && !modalData.expenseDate && (
                <Form.Control.Feedback type="invalid">
                  Date is required.
                </Form.Control.Feedback>
              )}
            </Form.Group>
            {/* Year Selection */}
            <Form.Group className="mb-3">
              <Form.Label>Year</Form.Label>
              <Form.Control
                as="select"
                value={modalData.expenseDate ? new Date(modalData.expenseDate).getFullYear() : ""}
                onChange={(e) =>
                  setModalData({
                    ...modalData,
                    expenseDate: `${e.target.value}-01-01`,
                  })
                }
                isInvalid={error && !modalData.expenseDate}
              >
                {years.map((year) => (
                  <option key={year}>{year}</option>
                ))}
              </Form.Control>
            </Form.Group>
            {/* Category Selection */}
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control
                as="select"
                value={modalData.category || ""}
                onChange={(e) =>
                  setModalData({ ...modalData, category: e.target.value })
                }
                isInvalid={error && !modalData.category}
              >
                <option value="">Select Category</option>
                <option>Maintenance</option>
                <option>Utilities</option>
                <option>Charity</option>
              </Form.Control>
              {error && !modalData.category && (
                <Form.Control.Feedback type="invalid">
                  Category is required.
                </Form.Control.Feedback>
              )}
            </Form.Group>
            {/* Description */}
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter description"
                value={modalData.description || ""}
                onChange={(e) =>
                  setModalData({ ...modalData, description: e.target.value })
                }
                isInvalid={error && !modalData.description}
              />
              {error && !modalData.description && (
                <Form.Control.Feedback type="invalid">
                  Description is required.
                </Form.Control.Feedback>
              )}
            </Form.Group>
            {/* Amount */}
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter amount"
                value={modalData.amount || ""}
                onChange={(e) =>
                  setModalData({ ...modalData, amount: e.target.value })
                }
                isInvalid={error && !modalData.amount}
              />
              {error && !modalData.amount && (
                <Form.Control.Feedback type="invalid">
                  Amount is required.
                </Form.Control.Feedback>
              )}
            </Form.Group>
            {/* Paid To */}
            <Form.Group className="mb-3">
              <Form.Label>Paid To</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={modalData.paidTo || ""}
                onChange={(e) =>
                  setModalData({ ...modalData, paidTo: e.target.value })
                }
                isInvalid={error && !modalData.paidTo}
              />
              {error && !modalData.paidTo && (
                <Form.Control.Feedback type="invalid">
                  Paid To is required.
                </Form.Control.Feedback>
              )}
            </Form.Group>
            {/* Paid By */}
            <Form.Group className="mb-3">
              <Form.Label>Paid By</Form.Label>
              <Form.Control
                as="select"
                value={modalData.paidBy || ""}  // Ensure default is empty in Add mode
                onChange={(e) =>
                  setModalData({ ...modalData, paidBy: e.target.value })
                }
                isInvalid={error && !modalData.paidBy}
              >
                <option value="">Select Member</option> {/* Ensure first option is empty */}
                {villageAllMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </Form.Control>
              {error && !modalData.paidBy && (
                <Form.Control.Feedback type="invalid">
                  Paid By is required.
                </Form.Control.Feedback>
              )}
            </Form.Group>

          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleModalSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

    </>
  );
};

export default ExpenseDetails;
