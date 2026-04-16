import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const Navbar = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom sticky-top shadow-sm">
      <div className="container py-3">
        <NavLink className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span className="brand-mark">C</span>
          <span>Crunchy Chips</span>
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `nav-link text-uppercase px-3 py-2 ${isActive ? 'active-link' : 'text-muted'}`
                }
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/chips"
                className={({ isActive }) =>
                  `nav-link text-uppercase px-3 py-2 ${isActive ? 'active-link' : 'text-muted'}`
                }
              >
                Shop
              </NavLink>
            </li>
            {isAuthenticated && (
              <li className="nav-item">
                <NavLink
                  to="/orders"
                  className={({ isActive }) =>
                    `nav-link text-uppercase px-3 py-2 ${isActive ? 'active-link' : 'text-muted'}`
                  }
                >
                  My Orders
                </NavLink>
              </li>
            )}
            <li className="nav-item">
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `nav-link text-uppercase px-3 py-2 ${isActive ? 'active-link' : 'text-muted'}`
                }
              >
                About
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `nav-link text-uppercase px-3 py-2 ${isActive ? 'active-link' : 'text-muted'}`
                }
              >
                Contact
              </NavLink>
            </li>
            {isAuthenticated ? (
              <>
                {!isAdmin && (
                  <li className="nav-item">
                    <NavLink
                      to="/profile"
                      className={({ isActive }) =>
                        `nav-link text-uppercase px-3 py-2 ${isActive ? 'active-link' : 'text-muted'}`
                      }
                    >
                      Profile
                    </NavLink>
                  </li>
                )}
                {isAdmin && (
                  <li className="nav-item">
                    <NavLink
                      to="/admin"
                      className={({ isActive }) =>
                        `nav-link text-uppercase px-3 py-2 ${isActive ? 'active-link' : 'text-muted'}`
                      }
                    >
                      Admin
                    </NavLink>
                  </li>
                )}
                <li className="nav-item">
                  <button type="button" className="btn btn-link nav-link text-uppercase px-3 py-2 text-muted" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `nav-link text-uppercase px-3 py-2 ${isActive ? 'active-link' : 'text-muted'}`
                    }
                  >
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/signup"
                    className={({ isActive }) =>
                      `nav-link text-uppercase px-3 py-2 ${isActive ? 'active-link' : 'text-muted'}`
                    }
                  >
                    Signup
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
