import React, { useState } from "react";
import "./contactus.css"; 
import Header from '../components/Header';
import { createGlobalStyle } from 'styled-components';

function Contact() {

const ContactUsStyle = createGlobalStyle`
    .navbar {
        background: #fff;
        border: 0;
        border-radius: 0 !important;
        box-shadow: 0px 5px 11px rgba(50, 50, 50, 0.08);
        }
    
    h1, h2, h3, h4, h5, h6 {
        margin: 0;
        font-family: 'Montserrat', sans-serif;
        font-weight: 700;
        text-transform: uppercase;
        }
        h2 {
        font-size: 32px;
        line-height: 40px;
        }
        h6 {
        font-size: 16px;
        }
    html {
        font-size: 100%;
    }

    body {
        background-color: #e4e1da;
        font-family: 'Lato', sans-serif !important;
        font-size: 14px;
        color: #808080;
        line-height: 25px;
        text-align: center;
        min-width: 260px;
        width: auto !important;
        overflow-x: hidden !important;
    }

    *,
    *:before,
    *:after {
        box-sizing: border-box;
    }

    a {
        color: #e96656;
        transition: all 0.3s ease-in-out;
    }
    a:hover {
        color: #cb4332;
        text-decoration: none;
    }
  `;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState(""); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");

    try {
     
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <>
    <ContactUsStyle />
    <Header />
     <div className="contact-wrapper">
    <section className="contact-us" id="contact">
      <div className="container">
        <div className="section-header">
          <h2 className="white-text">Contact Us</h2>
          <h6 className="white-text">
            Have any questions? Drop us a message. We will get back to you today.
          </h6>
        </div>

        <div className="row">
          <form className="contact-form" id="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="col-lg-4 col-sm-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  className="form-control input-box"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="col-lg-4 col-sm-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  className="form-control input-box"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="col-lg-4 col-sm-4">
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  className="form-control input-box"
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="clearfix">
              <div className="col-md-12">
                <textarea
                  name="message"
                  className="form-control textarea-box"
                  placeholder="Your Message"
                  id="message"
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>
            </div>

            {status === "sending" && (
              <h4 className="sending pull-left white-text">Sending message...</h4>
            )}
            {status === "success" && (
              <h4 className="success pull-left white-text">
                Your message has been sent successfully.
              </h4>
            )}
            {status === "error" && (
              <h4 className="error pull-left white-text">
                E-mail must be valid and message must be longer than 1 character.
              </h4>
            )}

            <button
              className="btn btn-primary custom-button red-btn"
              id="submit"
              type="submit"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
    </div>
    </>
  );
}

export default Contact;
