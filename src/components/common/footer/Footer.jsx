import React from "react"
import { blog } from "../../../dummydata"
import "./footer.css";
import { Link } from "react-router-dom"

const Footer = ({handleCourse}) => {
  return (
    <>
      {/* <section className='newletter'>
        <div className='container flexSB'>
          <div className='left row'>
            <h1>Newsletter - Stay tune and get the latest update</h1>
            <span>Far far away, behind the word mountains</span>
          </div>
          <div className='right row'>
            <input type='text' placeholder='Enter email address' />
            <i className='fa fa-paper-plane'></i>
          </div>
        </div>
      </section> */}
      <footer>
        <div className='container padding'>
          <div className='box logo'>
            <h1>PRAMA ACADEMY</h1>
            <span>Expanding Horizons Through Quality Education</span>
            <br />
            <br />
            <a href="https://www.instagram.com/pramaacademy/" target="_blank"><i className='fab fa-instagram icon'></i></a>
            <a href="https://www.youtube.com/@pramaacademy1122" target="_blank"><i className='fab fa-youtube icon'></i></a>
          </div>
          {/* <div className='box link'>
            <h3>Explore</h3>
            <ul>
              <li>About Us</li>
              <li>Services</li>
              <li>Courses</li>
              <li>Blog</li>
              <li>Contact us</li>
            </ul>
          </div> */}
          <div className='box link'>
            <h3>Quick Links</h3>
            <ul>
            <li><Link className="footerInherit" to="/">Home</Link></li>
              <li><Link className="footerInherit" to="" onClick={() => handleCourse()}>Course</Link></li>
              <li><Link className="footerInherit" to="/term-and-condition">Terms & Conditions</Link></li>
              <li><Link className="footerInherit" to="/about">About</Link></li>
              <li><Link className="footerInherit" to="home">Our Brand Ambasdor</Link></li>
            </ul>
          </div>
          {/* <div className='box'>
            <h3>Recent Post</h3>
            {blog.slice(0, 3).map((val) => (
              <div className='items flexSB'>
                <div className='img'>
                  <img src={val.cover} alt='' />
                </div>
                <div className='text'>
                  <span>
                    <i className='fa fa-calendar-alt'></i>
                    <label htmlFor=''>{val.date}</label>
                  </span>
                  <span>
                    <i className='fa fa-user'></i>
                    <label htmlFor=''>{val.type}</label>
                  </span>
                  <h4>{val.title.slice(0, 40)}...</h4>
                </div>
              </div>
            ))}
          </div> */}
          <div className='box last'>
            <h3>Contacts</h3>
            <ul>
              <li>
                <i className='fa fa-map'></i>
               some address of the office
              </li>
              <li>
                <i className='fa fa-phone-alt'></i>
               +91000000000
              </li>
              <li>
                <i className='fa fa-paper-plane'></i>
                info@yourdomain.com
              </li>
            </ul>
          </div>
        </div>
      </footer>
      <div className='legal'>
        <p>
          Copyright ©2024 All rights reserved 
        </p>
      </div>
    </>
  )
}

export default Footer
