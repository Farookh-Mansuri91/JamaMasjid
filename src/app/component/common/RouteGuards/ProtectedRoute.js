
"use client";
import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUserRole } from "../../../Utils/authHelpers";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);


  useEffect(() => {
    const isLoggedIn = isAuthenticated();
    const userRole = getUserRole();

    if (!isLoggedIn || (allowedRoles && !allowedRoles.includes(userRole))) {
      router.push("/Login");
    }
    else {
      setIsVerified(true); // User is authenticated
    }
  }, [allowedRoles, router]);
  if (!isVerified) {
    return <div>Loading...</div>; // Show fallback while verifying
  }
  return isAuthenticated() ? children : null;
};

export default ProtectedRoute;
