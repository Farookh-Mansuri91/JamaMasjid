export const fetchYearlyExpensesData = async (year) => {
    try {
      const response = await fetch(`https://localhost:7140/api/YearlyExpense?year=${year}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data from the server.');
      }
     
      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  export const addExpenseData = async (expenseData) => {
    const response = await fetch(`https://localhost:7140/api/YearlyExpense/addExpense`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
        //"Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(expenseData)
    });
  
    if (response.status === 401) {
      // If the response is 401, token is invalid or expired
      // Handle token expiration (e.g., redirect to login page)
      window.location.href = "/Login";  // Redirect to login page
      throw new Error("Session expired, please log in again");
    }
  
    if (!response.ok) {
      throw new Error("Failed to add expense");
    }
  
    return response.json();
  };
  
  
  export const updateExpenseData = async (expenseData) => {
    const response = await fetch(`https://localhost:7140/api/YearlyExpense/updateExpense`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(expenseData)
    });
  
    if (response.status === 401) {
      // If the response is 401, token is invalid or expired
      // Handle token expiration (e.g., redirect to login page)
      window.location.href = "/Login";  // Redirect to login page
      throw new Error("Session expired, please log in again");
    }
  
    if (!response.ok) {
      throw new Error("Failed to update expense");
    }
    return response.json();
  };
  
  