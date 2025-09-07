'use client';
import React, { useState, useMemo, useEffect } from "react";
import { Container, Row, Col, Form, Table, Modal, Button } from "react-bootstrap";
import { fetchGullakData, addMasjidGullakPaymentData, updateMasjidGullakData } from '../../Services/MasjidGullakService/apiService';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import './MasjidGullak.css';
import { toast } from 'react-toastify';  // Importing react-toastify
import 'react-toastify/dist/ReactToastify.css';  // Import the Toastify CSS
import { isAuthenticated, getUserRole } from "../../Utils/authHelpers"; // Authentication utils
import BackButton from "../common/BackButton";
const YearlyFridayRecords = () => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [collectionDate, setCollectionDate] = useState(new Date());
  const [isEdit, setIsEdit] = useState(false); // To differentiate between add and edit modals
  const [newRecord, setNewRecord] = useState({ date: null, amount: '', remarks: '' }); // For adding new collection
  const isUserAuthenticated = useMemo(() => (isClient ? isAuthenticated() : false), [isClient]);
  const userRole = useMemo(() => (isClient ? getUserRole() : null), [isClient]);
  const isFriday = (dateString) => {
    const date = new Date(dateString);
    return date.getDay() === 5;
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

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchGullakData();
        setWeeklyData(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    const filtered = weeklyData.filter((record) => {
      const date = new Date(record.collectionDate);
      return date.getFullYear() === selectedYear;
    });

    const totalsByMonth = {};

    filtered.forEach((record) => {
      const date = new Date(record.collectionDate);
      const month = date.getMonth();

      if (isFriday(record.collectionDate)) {
        const monthKey = `${month + 1}`;
        if (!totalsByMonth[monthKey]) {
          totalsByMonth[monthKey] = { dates: [], total: 0 };
        }
        totalsByMonth[monthKey].dates.push({ id: record.id, date: date.toLocaleDateString(), amount: record.amountCollected, remarks: record.remarks });
        totalsByMonth[monthKey].total += record.amountCollected;
      }
    });

    return totalsByMonth;
  }, [weeklyData, selectedYear]);

  const formatMonth = (monthIndex) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
  };

  const yearlyTotal = useMemo(() => {
    return Object.values(filteredData).reduce((total, monthData) => total + monthData.total, 0);
  }, [filteredData]);

  const availableYears = useMemo(() => {
    const years = new Set(weeklyData.map((record) => new Date(record.collectionDate).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [weeklyData]);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}- ${date.getFullYear()}`;
  };
  const handleAdd = () => {
    setNewRecord({ date: null, amount: '', remarks: '' });
    setIsEdit(false);
    setShowModal(true);
  };
  const handleEdit = (record) => {
    const date = new Date(record.date);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    setEditRecord({ ...record, date: formattedDate });
    setIsEdit(true);
    setShowModal(true);
  };

  const handleSaveNewRecord = async () => {
    try {
      // Prepare the new record data to send to the API
      const date = newRecord.date;
      const formattedDate = date.getFullYear() + '-'
        + String(date.getMonth() + 1).padStart(2, '0') + '-'
        + String(date.getDate()).padStart(2, '0');

      const newRecordData = {
        date: formattedDate,
        amount: parseFloat(newRecord.amount),
        remarks: newRecord.remarks,
      };
      // Make the API call to save the new record
      const response = await addMasjidGullakPaymentData(newRecordData);
      const data = await fetchGullakData();
      setWeeklyData(data);
      toast.success('Gullak amount addedd successfully!');
      // Close the modal after saving
      setShowModal(false);
    } catch (error) {
      // Handle error (show an alert or error message)
      toast.error('Error saving the new record!');
      setShowModal(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      // Prepare the data to be sent to the API
      const updatedRecord = {
        ...editRecord,
      };
      // Make the API call to save the updated record
      const response = await updateMasjidGullakData(updatedRecord);
      const data = await fetchGullakData();
      setWeeklyData(data);
      toast.success('Gullak amount updated successfully!');
      // Close the modal
      setShowModal(false);
    } catch (error) {
      // Handle error (e.g., show an alert or error message)
      alert(error.message);
    }
  };

  if (!isClient || isLoading) {
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
      <div className="card" style={{ position: 'relative' }}>
        <div className="container my-5">
          <h2 className="text-center mb-4" style={headingStyle}>Zuma Gullak Collection</h2>
          {/* Back Button - Right aligned on mobile, Left on tablets/desktops */}
          <div className="d-flex justify-content-md-start justify-content-end mb-3">
            <BackButton />
          </div>
          <div className="row mb-4">
            <div className="col-12 col-md-4 offset-md-4">
              <div className="card p-3 shadow-sm">
                <h4 className="text-center">Select Year</h4>
                <div className="select-container">
                  <select
                    className="form-select form-select-lg"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                  >
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {isUserAuthenticated && userRole === "Treasurer" || userRole === "Admin" && (
              <div className="col-12 col-md-4 text-end mt-3 mt-md-0">
                <Button variant="success" onClick={handleAdd}>
                  Add Collection
                </Button>
              </div>
            )}
          </div>

          <div className="card p-3 shadow-sm mb-5">
            <div className="table-responsive">
              {isLoading ? (
                <div className="text-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted">Fetching data, please wait...</p>
                </div>
              ) : error ? (
                <div className="text-center p-4">
                  <div className="card shadow-sm bg-light p-4">
                    <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: "3rem" }}></i>
                    <h5 className="mt-3 text-danger">Something went wrong</h5>
                    <p className="text-muted">Please try again later.</p>
                    <Button variant="primary" onClick={fetchData}>Retry</Button>
                  </div>
                </div>
              ) : Object.keys(filteredData).length === 0 ? (
                <div className="text-center p-4">
                  <div className="card shadow-sm bg-light p-4">
                    <i className="bi bi-box-seam text-muted" style={{ fontSize: "3rem" }}></i>
                    <h5 className="mt-3 text-muted">No records found</h5>
                    <p className="text-muted">Start by adding a new collection.</p>
                    <Button variant="success" onClick={handleAdd}>Add Collection</Button>
                  </div>
                </div>
              ) : (
                <table className="table table-striped table-bordered table-hover">
                  <thead>
                    <tr className="custom-table-dark">
                      <th>Month</th>
                      <th>Friday Date</th>
                      <th>Amount (₹)</th>
                      <th>Remarks</th>
                      {isUserAuthenticated && userRole === "Treasurer" || userRole === "Admin" && (<th>Actions</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(filteredData).map((key) => {
                      const month = parseInt(key) - 1;
                      const { dates, total } = filteredData[key];
                      return (
                        <React.Fragment key={key}>
                          <tr className="table-secondary">
                            <td rowSpan={dates.length + 1} className="font-weight-bold">
                              {formatMonth(month)}
                            </td>
                            <td>{formatDate(dates[0].date)}</td>
                            <td>₹{dates[0].amount.toFixed(2)}</td>
                            <td>{dates[0].remarks}</td>
                            {isUserAuthenticated && userRole === "Treasurer" || userRole === "Admin" && (<td>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() =>
                                  handleEdit({
                                    id: dates[0].id,
                                    date: dates[0].date,
                                    amount: dates[0].amount,
                                    remarks: dates[0].remarks,
                                  })
                                }
                              >
                                Edit
                              </button>
                            </td>
                            )}
                          </tr>
                          {dates.slice(1).map((dateObj, index) => (
                            <tr key={index}>
                              <td>{formatDate(dateObj.date)}</td>
                              <td>₹{dateObj.amount.toFixed(2)}</td>
                              <td>{dateObj.remarks}</td>
                              {isUserAuthenticated && userRole === "Treasurer" || userRole === "Admin" && (<td>
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() =>
                                    handleEdit({
                                      id: dateObj.id,
                                      date: dateObj.date,
                                      amount: dateObj.amount,
                                      remarks: dateObj.remarks,
                                    })
                                  }
                                >
                                  Edit
                                </button>
                              </td>)}
                            </tr>
                          ))}
                          <tr className="table-success">
                            <td className="font-weight-bold">Total</td>
                            <td colSpan={3} className="font-weight-bold">
                              ₹{total.toFixed(2)}
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>


          <div className="text-center mt-4">
            <div className="card p-4 shadow-sm bg-light">
              <h4 className="text-success"><span style={{ color: "#0d6efd" }}>Total for {selectedYear}:</span> ₹{yearlyTotal.toFixed(2)}</h4>
            </div>
          </div>
        </div>
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{isEdit ? "Edit Record" : "Add Collection"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formCollectionDate">
                <Form.Label>Collection Date</Form.Label>
                <DatePicker
                  selected={isEdit ? new Date(editRecord?.date) : newRecord.date}
                  onChange={(date) => (isEdit ? setEditRecord({ ...editRecord, date }) : setNewRecord({ ...newRecord, date }))}
                  filterDate={(date) => date.getDay() === 5}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Select a Friday"
                  className="form-control"
                />
              </Form.Group>
              <Form.Group controlId="formAmount" className="mt-3">
                <Form.Label>Amount (₹)</Form.Label>
                <Form.Control
                  type="number"
                  value={isEdit ? editRecord?.amount : newRecord.amount}
                  onChange={(e) => (isEdit ? setEditRecord({ ...editRecord, amount: e.target.value }) : setNewRecord({ ...newRecord, amount: e.target.value }))}
                />
              </Form.Group>
              <Form.Group controlId="formRemarks" className="mt-3">
                <Form.Label>Remarks</Form.Label>
                <Form.Control
                  type="text"
                  value={isEdit ? editRecord?.remarks : newRecord.remarks}
                  onChange={(e) => (isEdit ? setEditRecord({ ...editRecord, remarks: e.target.value }) : setNewRecord({ ...newRecord, remarks: e.target.value }))}
                />
              </Form.Group>

            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={isEdit ? handleSaveEdit : handleSaveNewRecord}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </div>



    </>
  );
};

export default YearlyFridayRecords;
