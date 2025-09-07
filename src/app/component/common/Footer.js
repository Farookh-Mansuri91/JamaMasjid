"use client";

import React from 'react';
import './Footer.css'; // Make sure you have a Footer.css for styling
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { FaTwitter, FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp } from 'react-icons/fa'; // You can use React Icons for social media

const Footer = () => {
  return (
    <footer className="site-footer bg-dark text-white pt-5 pb-3">
      <Container>
        <Row>
          {/* Contact Information Section */}
          <Col lg={4} md={6} sm={12}>
            <h5 className="footer-title">Contact Us</h5>
            <ul className="list-unstyled">
              <li><i className="bi-geo-alt me-2"></i> Ghanghori Masjid, Bhojipura, Bareilly, UP, India</li>
              <li><i className="bi-envelope me-2"></i><a href="mailto:info@noorisunnimasjid.com" className="text-white">info@noorisunnimasjid.com</a></li>
              <li><i className="bi-phone me-2"></i> +91-1234567890</li>
            </ul>
          </Col>

          {/* Quick Links Section */}
          <Col lg={4} md={6} sm={12}>
            <h5 className="footer-title">Quick Links</h5>
            <Nav className="flex-column">
              <Nav.Link href="/Home" className="text-white">Home</Nav.Link>
              <Nav.Link href="/SadqaMemberList" className="text-white">Sadqa Member</Nav.Link>
              <Nav.Link href="/VillageMemberList" className="text-white">Village Member</Nav.Link>
              <Nav.Link href="/MasjidGullak" className="text-white">Masjid Gullak</Nav.Link>
              <Nav.Link href="/MasjidCommitteeList" className="text-white">Masjid Committee</Nav.Link>
              <Nav.Link href="/Contact" className="text-white">Contact</Nav.Link>
            </Nav>
          </Col>

          {/* Social Media Section */}
          <Col lg={4} md={6} sm={12}>
            <h5 className="footer-title">Follow Us</h5>
            <ul className="social-icon list-unstyled d-flex">
              <li className="social-icon-item">
                <a href="#" className="social-icon-link text-white"><FaTwitter /></a>
              </li>
              <li className="social-icon-item">
                <a href="#" className="social-icon-link text-white"><FaFacebookF /></a>
              </li>
              <li className="social-icon-item">
                <a href="#" className="social-icon-link text-white"><FaInstagram /></a>
              </li>
              <li className="social-icon-item">
                <a href="#" className="social-icon-link text-white"><FaYoutube /></a>
              </li>
              <li className="social-icon-item">
                <a href="#" className="social-icon-link text-white"><FaWhatsapp /></a>
              </li>
            </ul>
          </Col>
        </Row>
        
        {/* Footer Bottom Section */}
        <Row className="mt-4">
          <Col className="text-center">
            <p>&copy; {new Date().getFullYear()} Sunni Noori Masjid | All Rights Reserved</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
