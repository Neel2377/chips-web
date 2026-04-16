import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const Home = () => {
  const { isAuthenticated, isAdmin } = useAuth()

  return (
    <div>
      <section className="home-hero mb-5 fade-section rounded-4 rounded-4">
        <div className="row align-items-center gy-5">
          <div className="col-lg-6">
            <p className="eyebrow">Snack experience</p>
            <h1 className="display-4 fw-bold mb-4">A fresh take on chips shopping with bold design and crunchy flavor.</h1>
            <p className="lead mb-4">
              Discover a sleek, modern snack shop built for fast browsing, easy ordering, and products that feel premium from first glance to last bite.
            </p>
            <div className="d-flex flex-wrap gap-3">
              {isAuthenticated ? (
                isAdmin ? (
                  <Link className="btn btn-accent btn-lg" to="/admin">
                    Manage catalog
                  </Link>
                ) : (
                  <Link className="btn btn-accent btn-lg" to="/profile">
                    My account
                  </Link>
                )
              ) : (
                <>
                  <Link className="btn btn-accent btn-lg" to="/login">
                    Login
                  </Link>
                  <Link className="btn btn-outline-light btn-lg" to="/signup">
                    Signup
                  </Link>
                </>
              )}
              <Link className="btn btn-outline-light btn-lg" to="/chips">
                Browse chips
              </Link>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="hero-image rounded-4 overflow-hidden shadow-lg ">
              <img
                src="https://5.imimg.com/data5/SELLER/Default/2024/11/468913984/SF/WV/AO/215613320/baked-potato-chips.jpg"
                alt="Fresh chips display"
                className="w-100 h-100 object-fit-cover rounded-4 rounded-4"
              />
            </div>
          </div>
        </div>

        <div className="hero-stats row g-3 mt-5 fade-section">
          {[
            { label: 'Flavors', value: '120+' },
            { label: 'Fresh batches', value: 'Daily' },
            { label: 'Managed online', value: 'Live inventory' },
          ].map((stat) => (
            <div className="col-sm-4" key={stat.label}>
              <div className="stat-card p-4 rounded-4 shadow-sm">
                <p className=" mb-1">{stat.label}</p>
                <h4 className="mb-0">{stat.value}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-features fade-section">
        <div className="section-title mb-4">
          <h2>Why snack with Crunchy Chips</h2>
        </div>

        <div className="row g-4">
          {[
            {
              title: 'Inspired flavor blends',
              detail: 'Signature chip styles designed for every craving, from smoky savory to electric spice.',
            },
            {
              title: 'Instant online shopping',
              detail: 'A fast, intuitive checkout experience on desktop and mobile that puts every flavor within reach.',
            },
            {
              title: 'Live product management',
              detail: 'Admin controls keep inventory updated and product data fresh with ease.',
            },
          ].map((feature) => (
            <div className="col-md-4" key={feature.title}>
              <div className="feature-card p-4 rounded-4 shadow-sm h-100">
                <h5>{feature.title}</h5>
                <p className="mb-0">{feature.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
