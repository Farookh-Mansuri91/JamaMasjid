// apiService.js
// fetchVillageMemberData
export const fetchVillageMemberData = async () => {
  try {
    const response = await fetch('https://api.noorimasjidghanghori.com/api/VillageMember');
    if (!response.ok) {
      throw new Error('Failed to fetch data from the server.');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// addVillageMemberData
export const addVillageMemberData = async (memberData) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`https://api.noorimasjidghanghori.com/api/VillageMember/addVillageMember`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(memberData),
  });

  if (response.status === 401) {
    // If the response is 401, token is invalid or expired
    // Handle token expiration (e.g., redirect to login page)
    window.location.href = "/Login";  // Redirect to login page
    throw new Error("Session expired, please log in again");
  }

  if (!response.ok) {
    throw new Error("Failed to add village member");
  }

  return response.json();
};

// update VillageMember Data
export const updateVillageMemberData = async (updatedMemeber) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  // Update existing payment record
  const response = await fetch(`https://api.noorimasjidghanghori.com/api/VillageMember/updateVillageMember`, {
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
    throw new Error("Failed to update payemnt data");
  }
  return response;
};


// fetchPaymentTrackerData
export const fetchPaymentTrackerData = async () => {
  try {
    const response = await fetch('https://api.noorimasjidghanghori.com/api/VillageMember/payments');
    if (!response.ok) {
      throw new Error('Failed to fetch data from the server.');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// addVillageMemberPaymentData
export const addVillageMemberPaymentData = async (addPayment) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  // Add new payment record
  const response = await fetch(`https://api.noorimasjidghanghori.com/api/VillageMember/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(addPayment),
  });
  if (response.status === 401) {
    // If the response is 401, token is invalid or expired
    // Handle token expiration (e.g., redirect to login page)
    window.location.href = "/Login";  // Redirect to login page
    throw new Error("Session expired, please log in again");
  }

  if (!response.ok) {
    throw new Error("Failed to add member payment");
  }

  return response.json();
};

// updateVillageMemberPaymentData
export const updateVillageMemberPaymentData = async (memberId, year, updatedPayment) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }
  // Update existing payment record
  const response = await fetch(`https://api.noorimasjidghanghori.com/api/VillageMember/payments/${memberId}/${year}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      //"Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(updatedPayment),
  });
  if (response.status === 401) {
    // If the response is 401, token is invalid or expired
    // Handle token expiration (e.g., redirect to login page)
    window.location.href = "/Login";  // Redirect to login page
    throw new Error("Session expired, please log in again");
  }

  if (!response.ok) {
    throw new Error("Failed to update payemnt data");
  }
  return response;
};


// fetch Mohalla Data
export const fetchMohallas = async () => {
  try {
    const response = await fetch('https://api.noorimasjidghanghori.com/api/VillageMember/mohalla');
    if (!response.ok) {
      throw new Error('Failed to fetch data from the server.');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// fetch Village Data
export const fetchVillages = async () => {
  try {
    const response = await fetch('https://api.noorimasjidghanghori.com/api/VillageMember/villages');
    if (!response.ok) {
      throw new Error('Failed to fetch data from the server.');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};