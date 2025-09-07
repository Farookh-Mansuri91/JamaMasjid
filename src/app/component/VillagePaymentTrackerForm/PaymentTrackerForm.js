"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Modal, Form, InputGroup, DropdownButton, Dropdown } from 'react-bootstrap';
import { FaCalendarAlt, FaSearch } from 'react-icons/fa'; // Importing an icon for a better UI
import { toast } from 'react-toastify';  // Importing react-toastify
import 'react-toastify/dist/ReactToastify.css';  // Import the Toastify CSS
import './PaymentTracker.css';  // Import the custom styles
import { fetchPaymentTrackerData, addVillageMemberPaymentData, updateVillageMemberPaymentData } from '../../Services/VillageMemberService/apiService'; // Import the service layer
import { isAuthenticated, getUserRole } from "../../Utils/authHelpers"; // Authentication utils
import BackButton from "../common/BackButton";
const PaymentTracker = () => {
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const previousYear = currentYear - 1;
    const twoYearsAgo = currentYear - 2;
    const threeYearsAgo = currentYear - 3;

    const [members, setMembers] = useState([]);
    const [yearFilter, setYearFilter] = useState(currentYear);  // Set current year as default
    const [searchText, setSearchText] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [selectedPaymentId, setSelectedPaymentId] = useState(0);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);  // Set current date
    const [showModal, setShowModal] = useState(false);
    const [showAddModal, setAddShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // For adding payment modal
    const [autoSearchName, setAutoSearchName] = useState('');
    const [matchingMembers, setMatchingMembers] = useState([]); // List to store all matching members
    const [selectedAutoMember, setSelectedAutoMember] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [selectedPayment, setSelectedPayment] = useState(null);  // Add selected payment state


    const [yearSelection, setYearSelection] = useState(currentYear); // Default to current year
    const initialYears = [2023, 2024, 2025, 2026];  // Define the fixed year list
    const [isClient, setIsClient] = useState(false); // Client-side rendering flag
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const [showSuccess, setShowSuccess] = useState(false);

    // Handle selecting a member from the search results
    const handleSelectMember = (member) => {
        setSelectedAutoMember(member); // Set the selected member
        setAutoSearchName(`${member.firstName} ${member.lastName}`); // Set the input value to the selected name
        setMatchingMembers([]); // Clear the search results
    };
    const isUserAuthenticated = useMemo(() => (isClient ? isAuthenticated() : false), [isClient]);
    const userRole = useMemo(() => (isClient ? getUserRole() : null), [isClient]);
    const [token, setToken] = useState(null);
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
        // Simulating client-side rendering
        setIsClient(true);
        // Fetch data from the API
        const fetchPaymentData = async () => {
            setIsLoading(true);
            try {
                const data = await fetchPaymentTrackerData();
                setMembers(data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch data. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPaymentData();
    }, []);

    // Dynamic Table Columns - conditionally include Action column
    const tableColumns = [
        { name: "#", key: "sn" },
        { name: "First Name", key: "firstName" },
        { name: "Last Name", key: "lastName" },
        { name: "Father's Name", key: "fatherName" },
        { name: "Amount Paid", key: "amountPaid" },
        { name: "Payment Date", key: "paymentDate" },
        ...(isUserAuthenticated && (userRole === "Member" || userRole === "Admin") && yearFilter !== "All Years" ? [{ name: "Action", key: "action" }] : []), // Only show Action if a specific year is selected
    ];

    // Filter members based on the year and search text
    const filteredMembers = members.filter((member) => {
        const isNameMatch = `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchText.toLowerCase());
        return isNameMatch;
    });

    // Filter members based on the selected year filter
    const yearFilteredMembers = yearFilter === "All Years" ? filteredMembers : filteredMembers.filter((member) =>
        member.payments.some(payment => payment.paymentDate.startsWith(yearFilter))
    );

    // Pagination logic
    const indexOfLastMember = currentPage * itemsPerPage;
    const indexOfFirstMember = indexOfLastMember - itemsPerPage;
    const currentMembers = yearFilteredMembers.slice(indexOfFirstMember, indexOfLastMember);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };


    // Modal Handlers for Edit Payment
    const handleShowModal = (member, payment, paymentId) => {
        setSelectedMember(member);  // Set the member
        setSelectedPayment(payment);  // Set the selected payment
        setSelectedPaymentId(paymentId);  // Set the selected paymentId
        // Pre-fill the modal with existing payment details
        setPaymentAmount(payment.amount);  // Set the amount for the selected payment
        setPaymentDate(payment.paymentDate.split('T')[0]);  // Set the payment date (formatted to YYYY-MM-DD)
        setShowModal(true);  // Show the modal
    };


    const handleModalClose = () => setShowModal(false);
    const handleAddModalClose = () => setAddShowModal(false);

    // Modal Handlers for Add Payment
    const handleShowAddPaymentModal = () => {
        setSelectedAutoMember(null); // Reset selected member when opening modal
        setAutoSearchName('');
        setPaymentAmount(0);
        setPaymentDate(new Date().toISOString().split('T')[0]);
        setAddShowModal(true);
    };

    const handleAddSavePayment = async () => {
        const errors = {};
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            errors.amount = 'Please enter a valid amount greater than zero';
        }
        // Validate payment date
        if (!paymentDate || new Date(paymentDate).getFullYear() !== currentYear) {
            errors.paymentDate = `Please select a valid date within ${currentYear}.`;
        }
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }
        const formattedDate = new Date(paymentDate).toISOString().split('T')[0]; // Format date
        if (selectedAutoMember) {
            const addPayment = {
                memberId: selectedAutoMember.memberId,
                amount: paymentAmount,
                paymentDate: formattedDate,
                year: currentYear,
            };
            try {
                // Add new payment record
                setIsLoading(true);
                const response11 = await addVillageMemberPaymentData(addPayment); // Add the new member
                // Refetch members data after saving
                const data = await fetchPaymentTrackerData();
                setMembers(data);
                setError(null);
                setIsLoading(false);
                // Show success message
                toast.success('Payment saved successfully!');
                setTimeout(() => setShowSuccess(false), 3000);
                setAddShowModal(false); // Close the modal

            } catch (error) {
                toast.error('Failed to save payment!');
            }
        }
    };


    const handleUpdatePayment = async () => {
        if (selectedMember) {
            const updatedPayment = {
                memberId: selectedMember.memberId,
                paymentId: selectedPaymentId,
                amount: paymentAmount,
                paymentDate: paymentDate,
                year: yearFilter === "All Years" ? currentYear : yearFilter, // Use selected year
            };
            try {
                const selectedYearPayment = selectedMember.payments.find(payment => payment.paymentDate.startsWith(yearFilter));
                if (selectedYearPayment) {
                    // Update existing payment record
                    const payementresponse = await updateVillageMemberPaymentData(selectedMember.memberId, updatedPayment.year, updatedPayment);
                }
                // Refetch members data after saving
                const data = await fetchPaymentTrackerData();
                setMembers(data);
                setError(null);
                // Show success message
                toast.success('Payment updated successfully!');
                setShowModal(false);
            } catch (error) {
                toast.error('Failed to update payment!');
            }
        }
    };

    // Handle search member for the add payment modal
    const handleSearchMember = (e) => {
        setAutoSearchName(e.target.value);
        if (e.target.value) {
            const filteredMembers = members.filter(member =>
                `${member.firstName} ${member.lastName} ${member.fatherName}`
                    .toLowerCase()
                    .includes(e.target.value.toLowerCase()) // Including father's name in the search
            );
            setMatchingMembers(filteredMembers); // Display all matching members
        } else {
            setMatchingMembers([]); // Reset the matching members when search is cleared
            setSelectedAutoMember(null); // Clear the selected member
        }
    };
    const getYearRange = () => {
        const startDate = `${currentYear}-01-01`;
        const endDate = `${currentYear}-12-31`;
        return { min: startDate, max: endDate };
    };
    const handleYearChange = (e) => {
        const newYear = Number(e.target.value);
        setCurrentYear(newYear);
        // Reset payment date if it no longer falls within the new year
        if (paymentDate && new Date(paymentDate).getFullYear() !== newYear) {
            setPaymentDate('');
            setFormErrors((prev) => ({
                ...prev,
                paymentDate: `Please select a valid date within ${newYear}.`,
            }));
        }
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'paymentAmount') {
            if (value === '' || parseFloat(value) < 0) {
                setFormErrors((prev) => ({
                    ...prev,
                    amount: 'Amount must be a positive number',
                }));
            } else {
                setFormErrors((prev) => {
                    const updatedErrors = { ...prev };
                    delete updatedErrors.amount;
                    return updatedErrors;
                });
            }

            setPaymentAmount(value);
        }
        if (name === 'paymentDate') {
            // Validate that the selected date falls within the currentYear
            const selectedDate = new Date(value);
            if (
                selectedDate.getFullYear() !== currentYear ||
                isNaN(selectedDate.getTime())
            ) {
                setFormErrors((prev) => ({
                    ...prev,
                    paymentDate: `Please select a valid date within ${currentYear}.`,
                }));
            } else {
                setFormErrors((prev) => {
                    const updatedErrors = { ...prev };
                    delete updatedErrors.paymentDate;
                    return updatedErrors;
                });
            }
            setPaymentDate(value);
        }
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
            <Container className="my-5">
                <h2 className="text-center mb-4" style={headingStyle}>
                    Village Member Payment Tracker
                </h2>
                {/* Back Button - Right aligned on mobile, Left on tablets/desktops */}
                <div className="d-flex justify-content-md-start justify-content-end mb-3">
                    <BackButton />
                </div>

                {/* Filters */}
                <Row className="mb-3 align-items-center">
                    {/* Search Input */}
                    <Col xs={12} sm={10} md={8} lg={6} className="mb-2 mb-md-0">
                        <InputGroup className="w-100">
                            <InputGroup.Text
                                style={{
                                    backgroundColor: '#f1f3f5',
                                    borderRight: 'none',
                                    borderRadius: '50px 0 0 50px',
                                    padding: '10px',
                                }}>
                                <FaSearch style={{ color: '#007bff' }} />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Search by Name"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{
                                    borderLeft: 'none',
                                    borderRadius: '0 50px 50px 0',
                                    padding: '10px 15px',
                                }}
                            />
                        </InputGroup>
                    </Col>

                    {/* Year Filter Dropdown */}
                    <Col xs={12} md={4} lg={3} className="mb-2 mb-md-0">
                        <DropdownButton
                            variant="outline-primary"  // Add border color to make it pop
                            title={
                                <span>
                                    <FaCalendarAlt /> {/* Adding a calendar icon */}
                                    &nbsp; Filter by Year: <strong>{yearFilter}</strong>
                                </span>
                            }
                            onSelect={(year) => setYearFilter(year)}
                            className="w-100 rounded-pill shadow-sm border-0"
                            style={{
                                backgroundColor: '#f8f9fa', // Light background for better contrast
                                fontWeight: '500', // Slightly bolder font for better readability
                            }}
                        >
                            <Dropdown.Item eventKey="All Years">
                                <FaCalendarAlt /> All Years {/* Added icon for visual enhancement */}
                            </Dropdown.Item>
                            <Dropdown.Item eventKey={currentYear}>
                                <strong>{currentYear}</strong>
                            </Dropdown.Item>
                            <Dropdown.Item eventKey={previousYear}>
                                {previousYear}
                            </Dropdown.Item>
                            <Dropdown.Item eventKey={twoYearsAgo}>
                                {twoYearsAgo}
                            </Dropdown.Item>
                            <Dropdown.Item eventKey={threeYearsAgo}>
                                {threeYearsAgo}
                            </Dropdown.Item>
                        </DropdownButton>
                    </Col>

                    {/* Add Payment Button */}
                    {isUserAuthenticated && (userRole === "Member" || userRole === "Admin") && (<Col xs={12} md={2} lg={3} className="text-md-end text-center">
                        <Button
                            variant="success"
                            onClick={handleShowAddPaymentModal}
                            className="w-100 w-sm-auto rounded-pill shadow-sm"
                            style={{
                                fontSize: '1rem', // Adjust font size for readability
                                padding: '10px 20px', // Make the button bigger and more touch-friendly on mobile
                            }}
                        >
                            Add Payment
                        </Button>
                    </Col>)}
                </Row>


                {/* Members Table */}
                <Table striped bordered hover responsive className="table-modern">
                    <thead className="table-dark">
                        <tr>
                            {tableColumns.map(col => (
                                <th key={col.key}>{col.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentMembers.length > 0 ? (
                            currentMembers.map((member, index) => (
                                <tr key={member.memberId}>
                                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td>{member.firstName}</td>
                                    <td>{member.lastName}</td>
                                    <td>{member.fatherName}</td>
                                    <td>
                                        {yearFilter === "All Years"
                                            ? member.payments.map((payment) => (
                                                <div
                                                    key={`${payment.paymentDate}-${payment.amount + 1}-${payment.paymentId}`}
                                                    className="highlight-cell"
                                                    style={{
                                                        backgroundColor: '#f8f9fa',  // Light gray background for payments
                                                        padding: '5px',
                                                        borderRadius: '5px',
                                                        color: '#495057',  // Dark text on light background
                                                    }}
                                                >
                                                    <span style={{ color: '#007bff' }}>{new Date(payment.paymentDate).getFullYear()}</span>:
                                                    <span style={{ color: '#28a745' }}> ₹{payment.amount}</span>
                                                </div>
                                            ))
                                            : member.payments.filter(payment => payment.paymentDate.startsWith(yearFilter)).map((payment) => (
                                                <div
                                                    key={`${payment.paymentDate}-${payment.amount + 2}-${payment.paymentId}`}
                                                    className="highlight-cell"
                                                    style={{
                                                        backgroundColor: '#e7f3fe',  // Light blue for selected year filter
                                                        padding: '5px',
                                                        borderRadius: '5px',
                                                        color: '#343a40',  // Dark text for contrast
                                                    }}
                                                >
                                                    <span style={{ color: '#007bff' }}>
                                                        {new Date(payment.paymentDate).getFullYear()}
                                                    </span>:
                                                    <span style={{ color: '#28a745' }}> ₹{payment.amount}</span>
                                                </div>
                                            ))
                                        }
                                    </td>
                                    <td>
                                        {yearFilter === "All Years"
                                            ? member.payments.map((payment) => (
                                                <div
                                                    key={`${payment.paymentDate}-${payment.amount + 3}-${payment.paymentId}`}
                                                    className="highlight-cell"
                                                    style={{
                                                        backgroundColor: '#f8f9fa',  // Light gray background for payments
                                                        padding: '5px',
                                                        borderRadius: '5px',
                                                        color: '#495057',  // Dark text for payments
                                                    }}
                                                >
                                                    <span style={{ color: '#6f42c1' }}>
                                                        {new Date(payment.paymentDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            ))
                                            : member.payments.filter(payment => payment.paymentDate.startsWith(yearFilter)).map((payment) => (
                                                <div
                                                    key={`${payment.paymentDate}-${payment.amount + 4}-${payment.paymentId}`}
                                                    className="highlight-cell"
                                                    style={{
                                                        backgroundColor: '#e7f3fe',  // Light blue background for selected year
                                                        padding: '5px',
                                                        borderRadius: '5px',
                                                        color: '#343a40',  // Dark text
                                                    }}
                                                >
                                                    <span style={{ color: '#6f42c1' }}>
                                                        {new Date(payment.paymentDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            ))
                                        }
                                    </td>
                                    {isUserAuthenticated && (userRole === "Member" || userRole === "Admin") && yearFilter !== "All Years" && (
                                        <td>
                                            {member.payments
                                                .filter(payment => payment.paymentDate.startsWith(yearFilter)) // Filter payments for the selected year
                                                .map((payment) => (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        key={payment.paymentId}  // Unique key
                                                        onClick={() => handleShowModal(member, payment, payment.paymentId)}  // Pass specific payment to the modal
                                                        style={{ marginBottom: '5px', display: 'block' }}
                                                    >
                                                        Edit
                                                    </Button>
                                                ))
                                            }
                                        </td>
                                    )}
                                </tr>

                            ))
                        ) : (
                            <tr>
                                <td colSpan={yearFilter === "All Years" ? "7" : "8"} className="text-center">No records found</td>
                            </tr>
                        )}
                    </tbody>
                </Table>


                {/* Pagination */}
                <div className="d-flex justify-content-center mt-3">
                    <Button
                        variant="secondary"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                    >
                        Previous
                    </Button>
                    <div className="mx-3">
                        Page {currentPage} of {Math.ceil(yearFilteredMembers.length / itemsPerPage)}
                    </div>
                    <Button
                        variant="secondary"
                        disabled={currentPage === Math.ceil(yearFilteredMembers.length / itemsPerPage)}
                        onClick={() => handlePageChange(currentPage + 1)}
                    >
                        Next
                    </Button>
                </div>

                {/* Modal for Add/Edit Payment */}
                <Modal
                    show={showModal}
                    onHide={handleModalClose}
                    centered
                    size="lg" // Large size modal for better visibility on larger screens
                    style={{
                        borderRadius: '10px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Soft shadow for modern look
                    }}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>{selectedMember ? 'Edit Payment' : 'Add Payment'}</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={selectedMember?.firstName || ''}
                                    readOnly
                                    style={{
                                        backgroundColor: '#f1f3f5',
                                        borderRadius: '8px',
                                        padding: '10px',
                                    }}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={selectedMember?.lastName || ''}
                                    readOnly
                                    style={{
                                        backgroundColor: '#f1f3f5',
                                        borderRadius: '8px',
                                        padding: '10px',
                                    }}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Father's Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={selectedMember?.fatherName || ''}
                                    readOnly
                                    style={{
                                        backgroundColor: '#f1f3f5',
                                        borderRadius: '8px',
                                        padding: '10px',
                                    }}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Amount</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    style={{
                                        borderRadius: '8px',
                                        padding: '10px',
                                    }}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Payment Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    style={{
                                        borderRadius: '8px',
                                        padding: '10px',
                                    }}
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={handleModalClose}
                            style={{
                                borderRadius: '50px',
                                padding: '8px 16px',
                                fontSize: '1rem',
                            }}
                        >
                            Close
                        </Button>
                        <Button
                            variant="success"
                            onClick={handleUpdatePayment}
                            style={{
                                borderRadius: '50px',
                                padding: '8px 16px',
                                fontSize: '1rem',
                            }}
                        >
                            Save Changes
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Modal for Add Payment */}
                <Modal
                    show={showAddModal}
                    onHide={handleAddModalClose}
                    centered
                    size="lg" // Large size modal for better visibility
                    style={{
                        borderRadius: '10px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Soft shadow for modern look
                    }}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Add Payment</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Search Member</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={autoSearchName}
                                    onChange={handleSearchMember}
                                    placeholder="Search by name or father's name"
                                    style={{
                                        borderRadius: '8px',
                                        padding: '10px',
                                        fontSize: '1rem',
                                    }}
                                />
                            </Form.Group>

                            {/* Display matching members if there are any */}
                            {matchingMembers.length > 0 && (
                                <div className="search-results">
                                    <ul className="list-group">
                                        {matchingMembers.map((member, index) => (
                                            <li
                                                key={index}
                                                className="list-group-item list-group-item-action"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleSelectMember(member)} // Call handleSelectMember on click
                                            >
                                                {member.firstName} {member.lastName} - {member.fatherName}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* If a member is selected, display their details */}
                            {selectedAutoMember && (
                                <>
                                    <Form.Group className="mb-3">
                                        <Form.Label>First Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            defaultValue={selectedAutoMember.firstName || ''} // Use defaultValue for read-only
                                            readOnly
                                            style={{
                                                backgroundColor: '#f1f3f5',
                                                borderRadius: '8px',
                                                padding: '10px',
                                            }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Last Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            defaultValue={selectedAutoMember.lastName || ''} // Use defaultValue for read-only
                                            readOnly
                                            style={{
                                                backgroundColor: '#f1f3f5',
                                                borderRadius: '8px',
                                                padding: '10px',
                                            }}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Father's Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            defaultValue={selectedAutoMember.fatherName || ''} // Use defaultValue for read-only
                                            readOnly
                                            style={{
                                                backgroundColor: '#f1f3f5',
                                                borderRadius: '8px',
                                                padding: '10px',
                                            }}
                                        />
                                    </Form.Group>
                                </>
                            )}

                            <Form.Group className="mb-3">
                                <Form.Label>Year</Form.Label>
                                <Form.Control
                                    as="select" // Specify it as a select dropdown
                                    value={currentYear}
                                    onChange={handleYearChange}
                                    style={{
                                        borderRadius: '8px',
                                        padding: '10px',
                                    }}
                                >
                                    {initialYears.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Amount</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="paymentAmount"
                                    value={paymentAmount}
                                    onChange={handleInputChange}
                                    placeholder="Enter Amount"
                                    style={{
                                        borderRadius: '8px',
                                        padding: '10px',
                                    }}
                                    isInvalid={!!formErrors.amount}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formErrors.amount}
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Payment Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="paymentDate"
                                    value={paymentDate}
                                    onChange={handleInputChange}
                                    min={getYearRange().min} // Limit to start of selected year
                                    max={getYearRange().max} // Limit to end of selected year
                                    style={{
                                        borderRadius: '8px',
                                        padding: '10px',
                                    }}
                                    isInvalid={!!formErrors.paymentDate}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formErrors.paymentDate}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Form>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={handleAddModalClose}
                            style={{
                                borderRadius: '50px',
                                padding: '8px 16px',
                                fontSize: '1rem',
                            }}
                        >
                            Close
                        </Button>
                        <Button
                            variant="success"
                            onClick={handleAddSavePayment}
                            // Handle Save Payment functionality here
                            style={{
                                borderRadius: '50px',
                                padding: '8px 16px',
                                fontSize: '1rem',
                            }}
                        >
                            Save Payment
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </>
    );
};

export default PaymentTracker;
