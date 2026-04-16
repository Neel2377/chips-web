const Contact = () => {
  return (
    <div>
      <section className="contact-hero p-4 p-md-5 rounded-4 shadow-sm mb-5 fade-section">
        <div className="row gy-4 align-items-center">
          <div className="col-lg-7">
            <p className="eyebrow">Get in touch</p>
            <h2 className="fw-bold mb-3">Questions, orders, or product ideas? We’re ready to chat.</h2>
            <p className="mb-4">Send a message to Crunchy Chips and we’ll respond quick with support, product updates, or wholesale help.</p>
          </div>
          <div className="col-lg-5">
            <div className="info-card p-4 rounded-4 h-100">
              <p className="mb-2 small">Email</p>
              <h6 className="mb-4">support@crunchychips.shop</h6>
              <p className="mb-2 small">Phone</p>
              <h6 className="mb-4">+1 (555) 123-4567</h6>
              <p className="mb-2 small">Location</p>
              <h6>Online store, available nationwide</h6>
            </div>
          </div>
        </div>
      </section>

      <div className="row gy-4">
        <div className="col-lg-6">
          <div className="contact-form-card p-4 rounded-4 shadow-sm h-100">
            <h5 className="mb-4">Send a message</h5>
            <form>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input className="form-control form-control-dark" type="text" placeholder="Your name" />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input className="form-control form-control-dark" type="email" placeholder="name@example.com" />
              </div>
              <div className="mb-3">
                <label className="form-label">Message</label>
                <textarea className="form-control form-control-dark" rows="5" placeholder="Tell us what you need" />
              </div>
              <button className="btn btn-accent px-4" type="button">
                Send Message
              </button>
            </form>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="contact-panel p-4 rounded-4 shadow-sm h-100">
            <h5 className="mb-4">Need something specific?</h5>
            <div className="mb-4">
              <h6>Order questions</h6>
              <p className="mb-0">Ask about shipping, inventory, or product availability in our snack catalog.</p>
            </div>
            <div className="mb-4">
              <h6>Product support</h6>
              <p className="mb-0">Got a flavor request or package question? We’ll help you find the perfect chip match.</p>
            </div>
            <div>
              <h6>Wholesale inquiries</h6>
              <p className="mb-0">Interested in larger orders or business partnerships? Reach out for pricing and delivery details.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
