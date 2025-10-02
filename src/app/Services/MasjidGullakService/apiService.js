// apiService.js
export const fetchGullakData = async () => {
    try {
      const response = await fetch('https://localhost:7140/api/MasjidGullak/GetMasjidGullakData');
      if (!response.ok) {
        throw new Error('Failed to fetch data from the server.');
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  };
  
// addVillageMemberPaymentData
export const addMasjidGullakPaymentData  = async (addPayment) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  try {
    const response = await fetch(`https://localhost:7140/api/MasjidGullak/addMasjidGullakData`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Uncomment and use token if authentication is required
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(addPayment),
    });

    // Check if the response indicates unauthorized access
    if (response.status === 401) {
      window.location.href = "/Login"; // Redirect to login page
      throw new Error("Session expired, please log in again.");
    }

    // Handle non-200 responses
    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message || "Failed to add the record.");
    }

    // Parse the successful response
    const data = await response.json();
    // Return the parsed response to the calling function
    return data;

  } catch (error) {
    // Log the error and rethrow it for further handling
    throw new Error("An error occurred while adding Masjid Gullak data. " + error.message);
  }
};

export const updateMasjidGullakData = async (paymentData) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  try {
    const response = await fetch(`https://localhost:7140/api/MasjidGullak/updateMasjidGullakData`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // Uncomment and use token if authentication is required
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(paymentData),
    });

    // Check if the response indicates unauthorized access
    if (response.status === 401) {
      window.location.href = "/Login"; // Redirect to login page
      throw new Error("Session expired, please log in again.");
    }

    // Handle non-200 responses
    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("API Error:", errorResponse.message || "Failed to update record.");
      throw new Error(errorResponse.message || "Failed to update the record.");
    }

    // Parse the successful response
    const data = await response.json();
    // Return the parsed response to the calling function
    return data;

  } catch (error) {
    // Log the error and rethrow it for further handling
    throw new Error("An error occurred while updating Masjid Gullak data. " + error.message);
  }
};
