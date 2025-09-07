"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import "./Header.css";
import Image from "next/image";
import { Navbar, Nav, Container } from "react-bootstrap";
import { isAuthenticated, getUserData, logout } from "../../Utils/authHelpers";
const headingStyle = {
  fontFamily: "'Poppins', sans-serif", // Modern font
  fontWeight: '600', // Semi-bold font
  fontSize: '1.5rem', // Larger text
  color: '#080808', // Bright color for text
  textAlign: 'center',
  textTransform: 'uppercase', // Uppercase letters
  letterSpacing: '2px', // Spacing between letters
  textShadow: '2px 2px 5px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
  marginBottom: '2rem', // Bottom margin for spacing
};
const Header = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (isAuthenticated()) {
      const userData = getUserData();
      if (userData) {
        setLoggedIn(true);
        setUser(userData.name);
        setRole(userData.role);
      } else {
        setLoggedIn(false);
      }
    } else {
      setLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    setUser(null);
    setRole(null);
  };

  return (
    <>
      <header className="site-header">
        <Container>
          <div className="row align-items-center">
            <div className="col-lg-8 col-12 d-flex flex-wrap justify-content-between">
              <div className="contact-info d-flex align-items-center">
                <i className="bi-geo-alt me-2"></i>
                <p className="mb-0">Ghanghori Jama Masjid, Bhojipura, Bareilly, UP, India</p>
              </div>
              <div className="contact-info d-flex align-items-center">
                <i className="bi-envelope me-2"></i>
                <a href="mailto:info@noorisunnimasjid.com" className="text-decoration-none">
                  info@noorisunnimasjid.com
                </a>
              </div>
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-12 d-flex justify-content-between align-items-center">
              <div className="masjid-title">
                <h2 className="text-center mb-4" style={headingStyle}>Jama Masjid</h2>
              </div>
              {loggedIn && (
                <div className="user-info d-flex align-items-center">
                  <span className="me-2">Welcome, {user} ({role})</span>
                </div>
              )}
            </div>
          </div>
        </Container>
      </header>
      <NavbarNew loggedIn={loggedIn} handleLogout={handleLogout} />
    </>
  );
};

const NavbarNew = ({ loggedIn, handleLogout }) => {
  const pathname = usePathname();
  return (
    <Navbar expand="lg" className="navbar-custom sticky-top">
      <Container>
        <Navbar.Brand  className="logo">
        <img src="/assets/images/masjidLogo.png" width={150} height={150} alt="Mosque icon" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="ms-auto navbar-toggler-custom" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto text-center d-flex flex-column flex-lg-row gap-2">
            {[
              { href: "/Home", label: "Home" },
              { href: "/SadqaMemberList", label: "Sadqa Members" },
              { href: "/VillageMemberList", label: "Village Members" },
              { href: "/MasjidGullak", label: "Masjid Gullak" },
              { href: "/MasjidCommitteeList", label: "Masjid Committee" }, // <-- This needs special styling
              { href: "/Contact", label: "Contact" }
            ].map((item) => (
              item.href === "/MasjidCommitteeList" ? (
                <div className="masjid-committee-container" key={item.href}>
                  <Nav.Link
                    href={item.href}
                    className={`nav-item py-2 px-3 ${pathname === item.href ? "active" : ""}`}
                  >
                    {item.label}
                  </Nav.Link>
                </div>
              ) : (
                <Nav.Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item py-2 px-3 ${pathname === item.href ? "active" : ""}`}
                >
                  {item.label}
                </Nav.Link>
              )
            ))}

            {loggedIn ? (
              <Nav.Link className="btn-logout py-2 px-3" onClick={handleLogout}>
                Log Out
              </Nav.Link>
            ) : (
              <Nav.Link href="/Login" className="btn-login py-2 px-3">
                Log In
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>

      </Container>
    </Navbar>
  );
};

export default Header;
