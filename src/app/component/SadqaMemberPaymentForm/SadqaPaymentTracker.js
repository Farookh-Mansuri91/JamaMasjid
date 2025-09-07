"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
    Container,
    Button,
    Row,
    Col,
    Form,
    Table,
    InputGroup,
    Modal,
} from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { FaSearch, FaPlus, FaEdit } from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';  // Importing react-toastify
import 'react-toastify/dist/ReactToastify.css';  // Import the Toastify CSS
import { format } from 'date-fns';
import './SadqaPaymentTracker.css';
import { fetchSadqaMemberPaymentData, updateSadqaPaymentData, addSadqaPaymentData } from '../../Services/SadqaMemberService/apiService'; // Import the service layer
import { isAuthenticated, getUserRole } from "../../Utils/authHelpers"; // Authentication utils
import BackButton from "../common/BackButton";

const MemberDonation = () => {
    const [members, setMembers] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [searchMemberText, setSearchMemberText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [selectedYear, setSelectedYear] = useState("all");
    const [selectedMonth, setSelectedMonth] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [addShowModal, setaddShowModal] = useState(false);
    const [paymentModalData, setPaymentModalData] = useState({});
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });  // Current month name (e.g., January)
    const currentYear = currentDate.getFullYear();  // Current year (e.g., 2025)
    const [addPaymentModalData, setaddPaymentModalData] = useState({
        month: currentMonth,  // Default to current month
        year: currentYear,    // Default to current year
        amount: "",
        paymentDate: "",
    });
    const [editingPayment, setEditingPayment] = useState(null); // To track if editing payment
    const [currentPage, setCurrentPage] = useState(0);
    const [isEditing, setIsEditing] = useState(false); // For edit functionality
    const [isClient, setIsClient] = useState(false); // Client-side rendering flag
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const perPage = 5;
    const isUserAuthenticated = useMemo(() => (isClient ? isAuthenticated() : false), [isClient]);
    const userRole = useMemo(() => (isClient ? getUserRole() : null), [isClient]);
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
                const data = await fetchSadqaMemberPaymentData();
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

    // Filter members based on search and filters
    useEffect(() => {
        const filtered = members.map((member) => ({
            ...member,
            payments: member.payments.filter((payment) => {
                const yearMatch =
                    selectedYear === "all" || payment.year === parseInt(selectedYear, 10);
                const monthMatch =
                    selectedMonth === "all" || payment.month === selectedMonth;
                return yearMatch && monthMatch;
            }),
        }));

        const searchFiltered = filtered.filter((member) =>
            `${member.firstName} ${member.lastName}`
                .toLowerCase()
                .includes(searchText.toLowerCase())
        );

        setFilteredMembers(searchFiltered);
    }, [searchText, selectedYear, selectedMonth, members]);

    const currentData = useMemo(() => {
        return filteredMembers.slice(
            currentPage * perPage,
            (currentPage + 1) * perPage
        );
    }, [filteredMembers, currentPage, perPage]);

    const handlePageChange = ({ selected }) => setCurrentPage(selected);
    const handleModalClose = () => {
        setShowModal(false);
        setPaymentModalData({});
        setEditingPayment(null);
    };


    const handleSearchMember = (text) => {
        setSearchMemberText(text);
        if (text.trim() === "") {
            setSearchResults([]);
            return;
        }

        const results = members.filter((member) =>
            `${member.firstName} ${member.lastName}`.toLowerCase().includes(text.toLowerCase())
        );
        setSearchResults(results);
    };

    const selectMember = (member) => {
        setSelectedMember(member);
        setSearchResults([]);
        setSearchMemberText(`${member.firstName} ${member.lastName}`);
    };


    //  edit payment modal
    const openPaymentModal = (memberId, year, month, payment = null) => {
        if (!payment) {
            return;
        }

        // Find the selected member by ID
        const member = members.find((m) => m.id === memberId);

        if (!member) {
            return;
        }

        // Update the payment modal data
        setPaymentModalData({
            memberId: member.id,
            year: year,
            month: month,
            payment: {
                id: payment.id,
                month: payment.month,
                year: payment.year,
                amount: payment.amount,
                paymentDate: payment.paymentDate
                    ? format(new Date(payment.paymentDate), 'yyyy-MM-dd') // Format as 'YYYY-MM-DD'
                    : "",
            },
        });

        // Set editing state and open the modal
        setIsEditing(true);
        setEditingPayment(true);
        setShowModal(true);
    };

    //  add payment modal
    const openAddPaymentModal = () => {
        setaddPaymentModalData({
            month: currentMonth,
            year: currentYear,
            amount: "",
            paymentDate: new Date().toISOString().split("T")[0],
        });
        setSelectedMember(null);
        setSearchMemberText("");
        setIsEditing(false);
        setaddShowModal(true);
    };

    const addEditSadqaPayment = async () => {
        if (isEditing) {
            const updatedPayment = { ...paymentModalData };
            try {
                //  URL with your API endpoint for updating payments
                const response = await updateSadqaPaymentData(updatedPayment);
                // Refetch members data after saving
                const data = await fetchSadqaMemberPaymentData();
                setMembers(data);
                setError(null);
                // Show success message
                toast.success('Payment updated successfully!');
                setShowModal(false);
            }
            catch (error) {
                toast.error('Failed to update payment!');
            }
        }
        else {
            // Add new payment
            const selectedMemberData = selectedMember;
            const newPayment = { ...addPaymentModalData };
            const addedPayment = {
                memberId: selectedMemberData.id,
                amount: newPayment.amount,
                paymentDate: newPayment.paymentDate,
                year: newPayment.year,
                month: newPayment.month
            };
            try {
                //  URL with your API endpoint for updating payments
                const response = await addSadqaPaymentData(addedPayment);
                // Refetch members data after saving
                const data = await fetchSadqaMemberPaymentData();
                setMembers(data);
                setError(null);
                // Show success message
                toast.success('Payment added successfully!');
                setaddShowModal(false);
            }
            catch (error) {
                // Log the entire error object for debugging
                setaddShowModal(false);
                // Handle 400 Bad Request error (duplicate entry error in your case)
                if (error != null) {
                    toast.success('Payment already exists!');
                    setaddShowModal(false);
                } else {
                    setError('An unexpected error occurred. Please try again later.');
                    toast.success('Error adding payment!');
                    setaddShowModal(false);
                }
            }
        }
        setaddShowModal(false); // Close the modal
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
        <>
            <Container fluid className="p-3">
                <h2 className="text-center mb-4" style={headingStyle}>Sadqa Payment Tracker</h2>
                {/* Back Button - Right aligned on mobile, Left on tablets/desktops */}
                <div className="d-flex justify-content-md-start justify-content-end mb-3">
                    <BackButton />
                </div>
                <Row className="align-items-center mb-4">
                    {/* Search Input */}
                    <Col xs={12} md={3} className="mb-2 mb-md-0">
                        <InputGroup>
                            <InputGroup.Text>
                                <FaSearch />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Search by Name..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </InputGroup>
                    </Col>

                    {/* Year Dropdown */}
                    <Col xs={6} md={3} className="mb-2 mb-md-0">
                        <Form.Select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            <option value="all">All Years</option>
                            <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                            <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                        </Form.Select>
                    </Col>

                    {/* Month Dropdown */}
                    <Col xs={6} md={3} className="mb-2 mb-md-0">
                        <Form.Select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            <option value="all">All Months</option>
                            {[
                                "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
                            ].map((month) => (
                                <option key={month} value={month}>
                                    {month}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>

                    {/* Add Payment Button */}
                    {isUserAuthenticated && userRole === "Other" || userRole === "Admin" && (<Col xs={6} md={3} className="text-end mb-2 mb-md-0">
                        <Button variant="success" onClick={openAddPaymentModal} className="w-100 w-md-auto">
                            <FaPlus /> Add Payment
                        </Button>
                    </Col>)}

                </Row>




                <Table striped bordered hover responsive className="table-modern">
                    <thead className="table-dark">
                        <tr>
                            <th>#</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Father Name</th>
                            <th>Mobile</th>
                            <th>Month</th>
                            <th>Year</th>
                            <th>Amount</th>
                            <th>Payment Date</th>
                            {isUserAuthenticated && userRole === "Other" || userRole === "Admin" && (<th>Actions</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="text-center">
                                    No data found
                                </td>
                            </tr>
                        ) : (
                            currentData.map((member) =>
                                member.payments.map((payment, index) => (
                                    <tr key={`${member.id}-${index}`}>
                                        <td>{member.id}</td>
                                        <td>{member.firstName}</td>
                                        <td>{member.lastName}</td>
                                        <td>{member.fatherName}</td>
                                        <td>{member.mobile}</td>
                                        <td>{payment.month}</td>
                                        <td>{payment.year}</td>
                                        <td>{payment.amount}</td>
                                        <td>
                                            {new Date(payment.paymentDate).toLocaleDateString()}


                                        </td>

                                        {isUserAuthenticated && userRole === "Other" || userRole === "Admin" && (<td>
                                            <Button
                                                size="sm"
                                                // variant="info"
                                                variant="primary"
                                                onClick={() => openPaymentModal(member.id, payment.year, payment.month, payment)}
                                            >
                                                Edit
                                                {/* <FaEdit /> */}
                                            </Button>
                                        </td>)}
                                    </tr>
                                ))
                            )
                        )}
                    </tbody>
                </Table>

                <ReactPaginate
                    previousLabel={<FontAwesomeIcon icon={faChevronLeft} />}
                    nextLabel={<FontAwesomeIcon icon={faChevronRight} />}
                    pageCount={Math.ceil(filteredMembers.length / perPage)}
                    onPageChange={handlePageChange}
                    containerClassName="pagination justify-content-center my-4"
                    activeClassName="active"
                    pageClassName="page-item"
                    pageLinkClassName="page-link"
                    previousClassName="page-item"
                    previousLinkClassName="page-link"
                    nextClassName="page-item"
                    nextLinkClassName="page-link"
                    disabledClassName="disabled"
                />


                {/* Edit Payment Modal  */}
                <Modal show={showModal} onHide={handleModalClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Edit Payment
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Month</Form.Label>
                                <Form.Select
                                    value={paymentModalData.payment?.month || ""}
                                    onChange={(e) =>
                                        setPaymentModalData((prev) => ({
                                            ...prev,
                                            payment: { ...prev.payment, month: e.target.value },
                                        }))
                                    }
                                >
                                    {[
                                        "January",
                                        "February",
                                        "March",
                                        "April",
                                        "May",
                                        "June",
                                        "July",
                                        "August",
                                        "September",
                                        "October",
                                        "November",
                                        "December",
                                    ].map((month) => (
                                        <option key={month} value={month}>
                                            {month}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Year</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={paymentModalData.payment?.year || ""}
                                    onChange={(e) =>
                                        setPaymentModalData((prev) => ({
                                            ...prev,
                                            payment: { ...prev.payment, year: e.target.value },
                                        }))
                                    }
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Amount</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={paymentModalData.payment?.amount || ""}
                                    onChange={(e) =>
                                        setPaymentModalData((prev) => ({
                                            ...prev,
                                            payment: { ...prev.payment, amount: e.target.value },
                                        }))
                                    }
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Payment Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={paymentModalData.payment?.paymentDate || ""}
                                    onChange={(e) =>
                                        setPaymentModalData((prev) => ({
                                            ...prev,
                                            payment: { ...prev.payment, paymentDate: e.target.value },
                                        }))
                                    }
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleModalClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={addEditSadqaPayment}>
                            Update Payment
                        </Button>
                    </Modal.Footer>
                </Modal>


                {/* Add Payment Modal  */}
                <Modal show={addShowModal} onHide={() => setaddShowModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Add Payment</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Search Member</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Search by Name"
                                    value={searchMemberText}
                                    onChange={(e) => handleSearchMember(e.target.value)}
                                />
                                {searchResults.length > 0 && (
                                    <ul className="list-group mt-2">
                                        {searchResults.map((member) => (
                                            <li
                                                key={member.id}
                                                className="list-group-item"
                                                onClick={() => selectMember(member)}
                                                style={{ cursor: "pointer" }}
                                            >
                                                {member.firstName} {member.lastName}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Form.Group>
                            {selectedMember && (
                                <>
                                    <Form.Group className="mb-3">
                                        <Form.Label>First Name</Form.Label>
                                        <Form.Control value={selectedMember.firstName} disabled />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Last Name</Form.Label>
                                        <Form.Control value={selectedMember.lastName} disabled />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Father Name</Form.Label>
                                        <Form.Control value={selectedMember.fatherName} disabled />
                                    </Form.Group>
                                </>
                            )}
                            <Form.Group className="mb-3">
                                <Form.Label>Month</Form.Label>
                                <Form.Select
                                    value={addPaymentModalData.month} // Set a default value if month is null/undefined
                                    onChange={(e) =>
                                        setaddPaymentModalData((prev) => ({
                                            ...prev,
                                            month: e.target.value,
                                        }))
                                    }
                                >
                                    {[
                                        "January",
                                        "February",
                                        "March",
                                        "April",
                                        "May",
                                        "June",
                                        "July",
                                        "August",
                                        "September",
                                        "October",
                                        "November",
                                        "December",
                                    ].map((month) => (
                                        <option key={month} value={month}>
                                            {month}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Year</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={addPaymentModalData.year}
                                    onChange={(e) =>
                                        setaddPaymentModalData((prev) => ({
                                            ...prev,
                                            year: e.target.value,
                                        }))
                                    }
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Amount</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={addPaymentModalData.amount}
                                    onChange={(e) =>
                                        setaddPaymentModalData((prev) => ({
                                            ...prev,
                                            amount: e.target.value,
                                        }))
                                    }
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Payment Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={addPaymentModalData.paymentDate}
                                    onChange={(e) =>
                                        setaddPaymentModalData((prev) => ({
                                            ...prev,
                                            paymentDate: e.target.value,
                                        }))
                                    }
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setaddShowModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={addEditSadqaPayment}>
                            Save Payment
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </>
    );
};

export default MemberDonation;
