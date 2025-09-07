"use client";
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  InputGroup,
  FormControl,
  Card,
  Dropdown,
  DropdownButton,
  Pagination,
  Spinner,
} from "react-bootstrap";
import "./YearlyIncomeForm.css";
import { fetchYearlyIncomeData } from "../../Services/MasjidYearlyIncome/apiService";

const YearlyIncomeDetails = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [availableYears, setAvailableYears] = useState([]);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
   const [isClient, setIsClient] = useState(false); // Client-side rendering flag
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Fetch available years dynamically (if required)
  useEffect(() => {
    const yearsFromApi = ["2025", "2024", "2023", "2022"]; // Example data
    setAvailableYears(yearsFromApi);
  }, []);

  // Fetch data based on the selected year
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchYearlyIncomeData(selectedYear);
        setData(response);
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  const filteredMembers = data.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastRecord = currentPage * rowsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - rowsPerPage;
  const currentRecords = filteredMembers.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredMembers.length / rowsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Define columns based on the API structure
  const columns = [
    { key: "sn", label: "SN.#" },
    { key: "name", label: "Name" },
    { key: "fatherName", label: "Father Name" },
    { key: "mohallaName", label: "Mohalla" },
    { key: "caste", label: "Caste" },
    { key: "paymentDate", label: "Payment Date" },
    { key: "masjidAmount", label: "Masjid Amount (₹)" },
    { key: "qabristaanAmount", label: "Qabristaan Amount (₹)" },
    { key: "masjidProgramAmount", label: "Masjid Program Amount (₹)" },
    { key: "remarks", label: "Remarks" },
  ];

  // Calculate grand totals
  const grandTotal = data.reduce(
    (totals, member) => ({
      totalMasjidAmount: totals.totalMasjidAmount + member.totalMasjidAmount,
      totalQabaristan: totals.totalQabaristan + member.totalQabaristan,
      totalMasjidProgramAmount:
        totals.totalMasjidProgramAmount + member.totalMasjidProgramAmount,
      totalMasjidGullakAmount:
        totals.totalMasjidGullakAmount + member.totalMasjidGullakAmount,
      grandTotalAmount: totals.grandTotalAmount + member.grandtotalAmount,
    }),
    {
      totalMasjidAmount: 0,
      totalQabaristan: 0,
      totalMasjidProgramAmount: 0,
      totalMasjidGullakAmount: 0,
      grandTotalAmount: 0,
    }
  );
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
        <Row className="mb-4">
          <Col>
            <h2 className="text-center text-primary">Yearly Income Details</h2>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col sm={12} md={6} className="mx-auto d-flex justify-content-between align-items-center">
            <DropdownButton
              id="dropdown-year"
              title={`Select Year: ${selectedYear}`}
              onSelect={(year) => {
                setSelectedYear(year);
                setCurrentPage(1);
              }}
            >
              {availableYears.map((year) => (
                <Dropdown.Item key={year} eventKey={year}>
                  {year}
                </Dropdown.Item>
              ))}
            </DropdownButton>

            <InputGroup className="w-auto">
              <InputGroup.Text>
                <i className="bi bi-search"></i> Search
              </InputGroup.Text>
              <FormControl
                type="text"
                placeholder="Search by Member Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col>
            <Card className="shadow-sm">
              <Card.Body>
                {loading ? (
                  <Spinner animation="border" variant="primary" />
                ) : error ? (
                  <p className="text-danger text-center">{error}</p>
                ) : (
                  <>
                    <Table className="table-container" striped bordered hover responsive>
                      <thead className="bg-dark text-white">
                        <tr>
                          {columns.map((col) => (
                            <th key={col.key}>{col.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {currentRecords.length > 0 ? (
                          currentRecords.map((member, index) => (
                            <tr key={member.id}>
                              {columns.map((col) => {
                                if (col.key === "sn") {
                                  return (
                                    <td key={col.key}>
                                      {indexOfFirstRecord + index + 1}
                                    </td>
                                  );
                                }
                                return (
                                  <td key={col.key}>
                                    {col.key === "paymentDate"
                                      ? new Date(member[col.key]).toLocaleDateString()
                                      : member[col.key]}
                                  </td>
                                );
                              })}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={columns.length} className="text-center">
                              No members found for {selectedYear}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>

                    <Pagination className="justify-content-center mt-3">
                      <Pagination.Prev
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Pagination.Prev>
                      {[...Array(totalPages)].map((_, index) => (
                        <Pagination.Item
                          key={index + 1}
                          active={index + 1 === currentPage}
                          onClick={() => handlePageChange(index + 1)}
                        >
                          {index + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Pagination.Next>
                    </Pagination>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className="mt-4">
          <Col>
            <Card className="shadow-sm">
              <Card.Body>
                <h4 className="text-center mb-4">Total Amounts for {selectedYear}</h4>
                <Table striped bordered hover responsive>
                  <thead className="bg-info text-white">
                    <tr>
                      <th>Category</th>
                      <th>Total Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Masjid</td>
                      <td>{grandTotal.totalMasjidAmount}</td>
                    </tr>
                    <tr>
                      <td>Qabristaan</td>
                      <td>{grandTotal.totalQabaristan}</td>
                    </tr>
                    <tr>
                      <td>Masjid Yearly Program</td>
                      <td>{grandTotal.totalMasjidProgramAmount}</td>
                    </tr>
                    <tr>
                      <td>Masjid Gullak</td>
                      <td>{grandTotal.totalMasjidGullakAmount}</td>
                    </tr>
                    <tr className="bg-light">
                      <td>
                        <strong>Grand Total</strong>
                      </td>
                      <td>
                        <strong>{grandTotal.grandTotalAmount}</strong>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

      </Container>
    </>
  );
};

export default YearlyIncomeDetails;
