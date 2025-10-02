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
export const getUserData = () => {
  const user = localStorage.getItem('userName'); 
  const role = localStorage.getItem('role');
  // Create an object with the user's name and role
  const userData = {
    name: user,
    role: role
  }
  return userData ? userData : null; // Return the user object (which should contain name, role, etc.)
}
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userName");
  window.location.href = "/Login";
};  