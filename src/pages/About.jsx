const About = () => {
  return (
    <div>
      <section className="about-hero p-5 rounded-4 mb-5 shadow-sm fade-section">
        <div className="row align-items-center gy-4">
          <div className="col-lg-7">
            <p className="eyebrow">Our story</p>
            <h1 className="display-5 fw-bold mb-4">Crafting a premium chip destination with modern style and fresh technology.</h1>
            <p className="mb-4">
              At Crunchy Chips, we combine bold flavor, premium ingredients, and a polished shopping experience for snack lovers who want quality and convenience together.
            </p>
          </div>
          <div className="col-lg-5">
            <div className="value-grid row g-3">
              {[
                { title: 'Fresh ingredients', value: 'Real seasonings & crisp texture' },
                { title: 'Responsive experience', value: 'Smooth browsing on every device' },
                { title: 'Live inventory', value: 'Updated data from MongoDB' },
              ].map((item) => (
                <div className="col-12" key={item.title}>
                  <div className="value-card p-4 rounded-4">
                    <h6>{item.title}</h6>
                    <p className=" small mb-0">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="section-title mb-4">
          <h2>What makes Crunchy Chips different</h2>
        </div>
        <div className="row g-4">
          {[
            {
              title: 'Bold product design',
              detail: 'Every product page is built to show off flavor, texture, and a compelling snack story.',
            },
            {
              title: 'Admin-powered catalog',
              detail: 'The admin area lets you add, update, and remove chips without redeploying the site.',
            },
            {
              title: 'Connected backend',
              detail: 'Express API and MongoDB deliver product data in real time for the freshest catalog.',
            },
          ].map((item) => (
            <div className="col-md-4" key={item.title}>
              <div className="feature-card p-4 rounded-4 shadow-sm h-100">
                <h5>{item.title}</h5>
                <p className="mb-0">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default About
