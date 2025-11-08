'use client';
import React, { useState, useMemo, useEffect } from "react";
import { Container, Row, Col, Form, Table, Modal, Button } from "react-bootstrap";
import { fetchGullakData, addMasjidGullakPaymentData, updateMasjidGullakData } from '../../Services/MasjidGullakService/apiService';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import './MasjidGullak.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { isAuthenticated, getUserRole } from "../../Utils/authHelpers";
import BackButton from "../common/BackButton";

// -- Helpers ---------------------------------------------------------

// Parse values robustly: accepts "YYYY-MM-DD", "YYYY-MM-DDTHH:MM:SS", Date objects
const toValidDate = (value) => {
  if (!value) return null;

  // If already a Date object
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  // If string with T (ISO), take date part
  try {
    const datePart = String(value).split('T')[0]; // works for YYYY-MM-DD or ISO
    const parts = datePart.split('-').map(Number);
    if (parts.length === 3 && parts[0] > 0) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
  } catch (e) {
    // fallthrough
  }

  // Fallback to Date constructor (last resort)
  const fallback = new Date(value);
  if (!isNaN(fallback)) {
    return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate());
  }
  return null;
};

// Format a Date (or string) into "DD-MM-YYYY" for display
const formatDisplayDate = (dateValue) => {
  const d = toValidDate(dateValue);
  if (!d || isNaN(d)) return 'NaN-NaN-NaN';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

// Format stored date string "YYYY-MM-DD" to display
const formatStoredToIsoDateString = (date) => {
  // returns YYYY-MM-DD (no time)
  const d = toValidDate(date);
  if (!d) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Create a safe local-noon ISO string (used internally when needed)
// but we will send YYYY-MM-DD to API (server expects date string)
const toLocalNoonIsoDate = (dateObj) => {
  // dateObj should be a Date object
  const y = dateObj.getFullYear();
  const m = dateObj.getMonth();
  const d = dateObj.getDate();
  // Set local noon to avoid timezone shift
  const dt = new Date(y, m, d, 12, 0, 0);
  return dt.toISOString(); // if you need full ISO later
};

// -------------------------------------------------------------------

const YearlyFridayRecords = () => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [newRecord, setNewRecord] = useState({ date: null, amount: '', remarks: '' });

  const isUserAuthenticated = useMemo(() => (isClient ? isAuthenticated() : false), [isClient]);
  const userRole = useMemo(() => (isClient ? getUserRole() : null), [isClient]);

  const isFriday = (dateString) => {
    const d = toValidDate(dateString);
    return d && d.getDay() === 5;
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

  // Build filtered data but store date strings consistently as "YYYY-MM-DD"
  const filteredData = useMemo(() => {
    const filtered = weeklyData.filter((record) => {
      const d = toValidDate(record.collectionDate);
      return d && d.getFullYear() === selectedYear;
    });

    const totalsByMonth = {};
    filtered.forEach((record) => {
      const d = toValidDate(record.collectionDate);
      if (!d) return;
      const month = d.getMonth();
      if (isFriday(record.collectionDate)) {
        const monthKey = `${month + 1}`;
        if (!totalsByMonth[monthKey]) {
          totalsByMonth[monthKey] = { dates: [], total: 0 };
        }

        // Store date consistently as YYYY-MM-DD (no timezone)
        const stored = formatStoredToIsoDateString(d); // e.g. "2025-11-14"

        totalsByMonth[monthKey].dates.push({
          id: record.id,
          date: stored, // <-- store plain date string
          amount: record.amountCollected,
          remarks: record.remarks
        });
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
    const years = new Set(
      weeklyData.map((record) => {
        const d = toValidDate(record.collectionDate);
        return d ? d.getFullYear() : null;
      }).filter(Boolean)
    );
    return Array.from(years).sort((a, b) => b - a);
  }, [weeklyData]);

  const handleAdd = () => {
    setNewRecord({ date: null, amount: '', remarks: '' });
    setIsEdit(false);
    setShowModal(true);
  };

  const handleEdit = (record) => {
    // record.date is now stored as "YYYY-MM-DD" (string) from filteredData
    // Keep editRecord.date as "YYYY-MM-DD" string so saving/editing is consistent
    setEditRecord({ ...record, date: record.date });
    setIsEdit(true);
    setShowModal(true);
  };

  // Save new record: send YYYY-MM-DD to API and fetch updated data
  const handleSaveNewRecord = async () => {
    try {
      if (!newRecord.date) {
        toast.error('Please select a date');
        return;
      }

      // newRecord.date is a Date object (from DatePicker)
      // Convert to YYYY-MM-DD (local date) while avoiding timezone shift:
      const dt = new Date(newRecord.date.getFullYear(), newRecord.date.getMonth(), newRecord.date.getDate(), 12, 0, 0);
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      const formattedDate = `${yyyy}-${mm}-${dd}`; // send plain date string

      const newRecordData = {
        date: formattedDate,
        amount: parseFloat(newRecord.amount),
        remarks: newRecord.remarks,
      };

      await addMasjidGullakPaymentData(newRecordData);
      const data = await fetchGullakData();
      setWeeklyData(data);
      toast.success('Gullak amount added successfully!');
      setShowModal(false);
    } catch (error) {
      toast.error('Error saving the new record!');
      setShowModal(false);
    }
  };

  // Save edit: convert any editRecord.date to YYYY-MM-DD (whether it's Date or string)
  const handleSaveEdit = async () => {
    try {
      if (!editRecord?.date) {
        toast.error('Please select a date');
        return;
      }

      // editRecord.date can be a Date object (if changed via DatePicker) or a YYYY-MM-DD string
      let d = editRecord.date;
      let parsed = null;
      if (d instanceof Date) {
        parsed = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
      } else {
        // string case - parse safely and set local noon to avoid timezone shift
        const tmp = toValidDate(d);
        parsed = new Date(tmp.getFullYear(), tmp.getMonth(), tmp.getDate(), 12, 0, 0);
      }

      const yyyy = parsed.getFullYear();
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const dd = String(parsed.getDate()).padStart(2, '0');
      const formattedDate = `${yyyy}-${mm}-${dd}`;

      const updatedRecord = {
        ...editRecord,
        date: formattedDate
      };

      await updateMasjidGullakData(updatedRecord);
      const data = await fetchGullakData();
      setWeeklyData(data);
      toast.success('Gullak amount updated successfully!');
      setShowModal(false);
    } catch (error) {
      alert(error.message || 'Error updating record');
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
            {isUserAuthenticated && (userRole === "Treasurer" || userRole === "Admin") && (
              <div className="col-12 col-md-4 text-end mt-3 mt-md-0">
                <Button variant="success" onClick={handleAdd}>Add Collection</Button>
              </div>
            )}
          </div>

          <div className="card p-3 shadow-sm mb-5">
            <div className="table-responsive">
              {Object.keys(filteredData).length === 0 ? (
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
                      {(isUserAuthenticated && (userRole === "Treasurer" || userRole === "Admin")) && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(filteredData).map((key) => {
                      const month = parseInt(key) - 1;
                      const { dates, total } = filteredData[key];
                      return (
                        <React.Fragment key={key}>
                          <tr className="table-secondary">
                            <td rowSpan={dates.length + 1}>{formatMonth(month)}</td>
                            <td>{formatDisplayDate(dates[0].date)}</td>
                            <td>₹{dates[0].amount.toFixed(2)}</td>
                            <td>{dates[0].remarks}</td>
                            {(isUserAuthenticated && (userRole === "Treasurer" || userRole === "Admin")) && (
                              <td>
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleEdit(dates[0])}
                                >Edit</button>
                              </td>
                            )}
                          </tr>
                          {dates.slice(1).map((dateObj, index) => (
                            <tr key={index}>
                              <td>{formatDisplayDate(dateObj.date)}</td>
                              <td>₹{dateObj.amount.toFixed(2)}</td>
                              <td>{dateObj.remarks}</td>
                              {(isUserAuthenticated && (userRole === "Treasurer" || userRole === "Admin")) && (
                                <td>
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleEdit(dateObj)}
                                  >Edit</button>
                                </td>
                              )}
                            </tr>
                          ))}
                          <tr className="table-success">
                            <td className="font-weight-bold">Total</td>
                            <td colSpan={3} className="font-weight-bold">₹{total.toFixed(2)}</td>
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

        {/* Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{isEdit ? "Edit Record" : "Add Collection"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formCollectionDate">
                <Form.Label>Collection Date</Form.Label>
                <DatePicker
                  // selected expects a Date object
                  selected={isEdit ? toValidDate(editRecord?.date) : newRecord.date}
                  onChange={(date) => {
                    if (isEdit) {
                      setEditRecord({ ...editRecord, date });
                    } else {
                      setNewRecord({ ...newRecord, date });
                    }
                  }}
                  filterDate={(date) => date.getDay() === 5}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Select a Friday"
                  className="form-control"
                  calendarClassName="custom-datepicker"
                  showPopperArrow={false}
                />
              </Form.Group>

              <Form.Group controlId="formAmount" className="mt-3">
                <Form.Label>Amount (₹)</Form.Label>
                <Form.Control
                  type="number"
                  value={isEdit ? editRecord?.amount : newRecord.amount}
                  onChange={(e) =>
                    isEdit
                      ? setEditRecord({ ...editRecord, amount: e.target.value })
                      : setNewRecord({ ...newRecord, amount: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group controlId="formRemarks" className="mt-3">
                <Form.Label>Remarks</Form.Label>
                <Form.Control
                  type="text"
                  value={isEdit ? editRecord?.remarks : newRecord.remarks}
                  onChange={(e) =>
                    isEdit
                      ? setEditRecord({ ...editRecord, remarks: e.target.value })
                      : setNewRecord({ ...newRecord, remarks: e.target.value })
                  }
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={isEdit ? handleSaveEdit : handleSaveNewRecord}>Save</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default YearlyFridayRecords;
