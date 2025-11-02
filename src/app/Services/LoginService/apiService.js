const userLogin = async (userName, password) => {
  const API_URL = "https://api.noorimasjidghanghori.com/api/Login/memberLogin"; // Replace with your actual login API URL

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, password }),
    });

    if (!response.ok) {
      throw new Error("Invalid credentials. Please check your userName and password.");
    }

    return await response.json(); // Return the token and role
  } catch (error) {
    throw error;
  }
};

export default userLogin;
