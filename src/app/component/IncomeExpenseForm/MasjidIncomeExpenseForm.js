"use client";
import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import './MasjidIncomeExpenseForm.css';
import { fetchMasjidIncomeExpensesData } from "../../Services/MasjidIncomeExpenseService/apiService";
export default function YearlyIncomeExpenses() {
    const [selectedYear, setSelectedYear] = useState("2025");
    const [incomeData, setIncomeData] = useState([]);
    const [expenseData, setExpenseData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Error state

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await fetchMasjidIncomeExpensesData();
                if (data && data.length > 0) {
                    setIncomeData(data[0].income); // Bind income data
                    setExpenseData(data[0].expense); // Bind expense data
                }
            } catch (err) {
                setError('Failed to fetch data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);



    // Filter income and expenses based on the selected year
    const income = incomeData.find((data) => data.year.toString() === selectedYear) || {};
    const expense = expenseData.find((data) => data.year.toString() === selectedYear) || {};
    // Calculate total income and balance
    const totalIncome =
        (income.masjidAmount || 0) + (income.masjidProgram || 0) + (income.qabristanAmount || 0);
    //const balance = totalIncome - (expense.totalExpenses || 0);

    if (loading) {
        return <div>Loading...</div>; // Show loading state while data is being fetched
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-12 col-md-8">
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white text-center">
                            <h4 className="mb-0">Yearly Income and Expense Details</h4>
                        </div>
                        <div className="card-body">
                            <div className="mb-4">
                                <label htmlFor="year-select" className="form-label">
                                    Select Year:
                                </label>
                                <div className="dropdown-wrapper position-relative">
                                    <select
                                        id="year-select"
                                        className="form-select"
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        style={{ zIndex: 10, position: "relative" }}
                                    >
                                        {incomeData.map((data) => (
                                            <option key={data.year} value={data.year}>
                                                {data.year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Category</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="table-success">
                                            <td>Masjid Amount</td>
                                            <td>₹{income.masjidAmount || 0}</td>
                                        </tr>
                                        <tr className="table-info">
                                            <td>Masjid Program</td>
                                            <td>₹{income.masjidProgram || 0}</td>
                                        </tr>
                                        <tr className="table-primary">
                                            <td>Qabristan Amount</td>
                                            <td>₹{income.qabristanAmount || 0}</td>
                                        </tr>
                                        <tr className="table-secondary">
                                            <td><strong>Total Income</strong></td>
                                            <td className="text-success"><strong>₹{totalIncome}</strong></td>
                                        </tr>
                                        <tr className="table-danger">
                                            <td><strong>Total Expenses</strong></td>
                                            <td className="text-danger"><strong>₹{expense.totalExpenses || 0}</strong></td>
                                        </tr>
                                        <tr className="table-warning">
                                            <td><strong>Balance</strong></td>
                                            <td className="text-dark-yellow"><strong>₹{income.balance}</strong></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
