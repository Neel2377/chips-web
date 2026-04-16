import { NavLink } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="footer-clean pt-5 pb-4 mt-5">
      <div className="container">
        <div className="row gy-4">

          {/* Brand */}
          <div className="col-md-4">
            <h5 className="mb-3">Crunchy Chips</h5>
            <p className="small">
              A modern snack destination with crisp design, smooth browsing, and easy product management.
            </p>
          </div>

          {/* Links */}
          <div className="col-md-4">
            <h6 className="text-white mb-3">Quick links</h6>
            <ul className="list-unstyled footer-links mb-0">

              <li>
                <NavLink to="/" className="footer-link">Home</NavLink>
              </li>

              <li>
                <NavLink to="/chips" className="footer-link">Shop</NavLink>
              </li>

              <li>
                <NavLink to="/about" className="footer-link">About</NavLink>
              </li>

              <li>
                <NavLink to="/admin" className="footer-link">Admin</NavLink>
              </li>

            </ul>
          </div>

          {/* Contact */}
          <div className="col-md-4">
            <h6 className="text-white mb-3">Contact</h6>
            <p className="small mb-1">support@crunchychips.shop</p>
            <p className="small mb-0">Online store available nationwide.</p>
          </div>

        </div>

        {/* Bottom */}
        <div className="row mt-4">
          <div className="col text-center small">
            © {new Date().getFullYear()} Crunchy Chips. Built with React, Bootstrap, Node, Express, and MongoDB.
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer