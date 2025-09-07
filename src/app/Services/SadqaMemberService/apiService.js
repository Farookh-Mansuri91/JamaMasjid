// apiService.js
export const fetchSadqaMemberData = async () => {
  try {
    const response = await fetch('https://localhost:7140/api/SadqaMember/getSadqaMember');
    if (!response.ok) {
      throw new Error('Failed to fetch data from the server.');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// addSadqaMemberData
export const addSadqaMemberData = async (modalData) => {
  // const token = localStorage.getItem("token");
  // if (!token) {
  //   throw new Error("No authentication token found");
  // }
  console.log(modalData)
  const response = await fetch(`https://localhost:7140/api/SadqaMember/addSadqaMember`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      //"Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(modalData),
  });

  if (response.status === 401) {
    // If the response is 401, token is invalid or expired
    // Handle token expiration (e.g., redirect to login page)
    window.location.href = "/Login";  // Redirect to login page
    throw new Error("Session expired, please log in again");
  }

  if (!response.ok) {
    throw new Error("Failed to add sadqa member");
  }

  return response.json();
};

//  update SadqaMember Data
export const updateSadqaMemberData = async (updatedMemeber) => {
  // const token = localStorage.getItem("token");
  // if (!token) {
  //   throw new Error("No authentication token found");
  // }
  // Update existing payment record
  console.log(updatedMemeber);
  const response = await fetch(`https://localhost:7140/api/SadqaMember/updateSadqaMember`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      //"Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(updatedMemeber),
  });
  if (response.status === 401) {
    // If the response is 401, token is invalid or expired
    // Handle token expiration (e.g., redirect to login page)
    window.location.href = "/Login";  // Redirect to login page
    throw new Error("Session expired, please log in again");
  }

  if (!response.ok) {
    throw new Error("Failed to update sadqa member data");
  }
  return response;
};

//new
export const fetchSadqaMemberPaymentData = async () => {
  try {
    const response = await fetch('https://localhost:7140/api/SadqaMember/sadqaMemberPayments');
    if (!response.ok) {
      throw new Error('Failed to fetch data from the server.');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// new
export const addSadqaPaymentData = async (paymentData) => {
  // const token = localStorage.getItem("token");
  // if (!token) {
  //   throw new Error("No authentication token found");
  // }

  const response = await fetch(`https://localhost:7140/api/SadqaMember/addSadqaPayment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
      //"Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(paymentData)
  });

  if (response.status === 400) {

    throw new Error("Duplicate entry found:Payment already exists for the given month and year.");
  }
  if (response.status === 401) {
    // If the response is 401, token is invalid or expired
    // Handle token expiration (e.g., redirect to login page)
    window.location.href = "/Login";  // Redirect to login page
    throw new Error("Session expired, please log in again");
  }

  if (!response.ok) {
    throw new Error("Failed to add member");
  }

  return response.json();
};


export const updateSadqaPaymentData = async (paymentData) => {
  const response = await fetch(`https://localhost:7140/api/SadqaMember/updateSadqaPayments`, {
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
    throw new Error("Failed to update member");
  }
  return response.json();
};
