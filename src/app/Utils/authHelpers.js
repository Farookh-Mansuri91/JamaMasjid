export const isAuthenticated = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    return !!token; // Check if token exists
  }
  return false; // Default to not authenticated in non-browser environments
};

export const getUserRole = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("role");
  }
  return null; // Default to null in non-browser environments
};
export const getUserId = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("userId");
  }
  return null; // Default to null in non-browser environments
};
export const getMemberId = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("memberId");
  }
  return null; // Default to null in non-browser environments
};
export const getUserData = () => {
  const user = localStorage.getItem('userName'); 
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');
  const memberId = localStorage.getItem('memberId');

  // Create an object with the user's name and role
  const userData = {
    name: user,
    role: role,
    userId: userId,
    memberId: memberId
  }
  return userData ? userData : null; // Return the user object (which should contain name, role, etc.)
}
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userName");
  localStorage.removeItem("userId");
  localStorage.removeItem("memberId");
  window.location.href = "/Login";
};  