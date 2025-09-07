// fetchMasjidYearlyIncomeData
export const fetchMasjidYearlyIncomeData = async () => {
  try {
    const response = await fetch(`https://localhost:7140/api/YearlyIncome/masjidYearlyIncome`);
    if (!response.ok) {
      throw new Error('Failed to fetch data from the server.');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const addMasjidIncometData = async (paymentData) => {
  const response = await fetch(`https://localhost:7140/api/YearlyIncome/addMasjidYearlyPayment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
      //"Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(paymentData)
  });

  if (response.status === 401) {
    // If the response is 401, token is invalid or expired
    // Handle token expiration (e.g., redirect to login page)
    window.location.href = "/Login";  // Redirect to login page
    throw new Error("Session expired, please log in again");
  }

  if (!response.ok) {
    throw new Error("Failed to add payment");
  }

  return response.json();
};


export const updateMasjidIncomeData = async (paymentData) => {
  const response = await fetch(`https://localhost:7140/api/YearlyIncome/updateMasjidYearlyPayment`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      // "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(paymentData)
  });

  if (response.status === 401) {
    // If the response is 401, token is invalid or expired
    // Handle token expiration (e.g., redirect to login page)
    window.location.href = "/Login";  // Redirect to login page
    throw new Error("Session expired, please log in again");
  }

  if (!response.ok) {
    throw new Error("Failed to update payment");
  }
  return response.json();
};
