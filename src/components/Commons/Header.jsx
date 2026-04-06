import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./header.css";
import {
  logout,
  isUserLoggedIn,
  getLoggedInDisplayName,
  getUserRole,
  isPetOwnerUser,
} from "../../services/VeterinaryRegistrationService";

const Header = () => {
  const isAuth = isUserLoggedIn();
  const loggedInUser = getLoggedInDisplayName();
  const userRole = getUserRole();
  const isPetOwner = isPetOwnerUser();
  const canAccessManagementServices = isAuth && !isPetOwner;
  const navigate = useNavigate();

  const formatRole = (role) => {
    if (!role) {
      return "User";
    }

    return role
      .replace("ROLE_", "")
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleLogout = () => {
    logout();
    navigate('/login')
  }

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark fixed-top modern-header">
        <div className="container-fluid px-4">
          <Link className="navbar-brand fw-bold fs-5" to="/">
            🐾 PetCare Pro
          </Link>

          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-2">
              {isAuth && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/">
                      📊 Dashboard
                    </Link>
                  </li>
                  {canAccessManagementServices && (
                    <li className="nav-item dropdown">
                      <a
                        className="nav-link dropdown-toggle"
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        📋 Services
                      </a>
                      <ul className="dropdown-menu dropdown-menu-end modern-dropdown">
                        <li>
                          <Link className="dropdown-item" to="/register">
                            👤 Owner Registration
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/add-pet">
                            🐕 Add Pet
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/pet-vaccination-record">
                            💉 Pet Vaccination
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/pet-medical">
                            📝 Medical History
                          </Link>
                        </li>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/book-appointment">
                            📅 Book Appointment
                          </Link>
                        </li>
                      </ul>
                    </li>
                  )}
                  {isPetOwner && (
                    <li className="nav-item">
                      <Link className="nav-link" to="/book-appointment">
                        📅 Book Appointment
                      </Link>
                    </li>
                  )}
                </>
              )}

              {isAuth && (
                <li className="nav-item">
                  <div className="logged-user-chip" title={`Logged in as ${loggedInUser || "User"}`}>
                    <div className="logged-user-avatar">
                      {(loggedInUser || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="logged-user-info">
                      <span className="logged-user-label">Logged in</span>
                      <span className="logged-user-name">
                        {loggedInUser || "User"}
                        <small className="logged-user-role"> ({formatRole(userRole)})</small>
                      </span>
                    </div>
                  </div>
                </li>
              )}

              {isAuth && (
                <li className="nav-item">
                  <button
                    className="btn btn-logout"
                    type="button"
                    onClick={handleLogout}
                  >
                    🚪 Logout
                  </button>
                </li>
              )}

              {!isAuth && (
                <li className="nav-item">
                  <Link className="btn btn-logout" to="/login">
                    🔐 Login
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;
