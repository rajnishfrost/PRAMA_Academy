import React from "react";
import "./header.css"

const Head = () => {
  return (
    <>
      <section className='head'>
        <div className='container flexSB'>
          <div className='logo'>
            <h1>PRAMA ACADEMY</h1>
            <span className="spanHead">Expanding Horizons Through Quality Education</span>
          </div>

          <div className='social'>
          {/* <a href="https://example.com" target="_blank"><i className='fab fa-facebook-f icon'></i></a> */}
          <a href="https://www.instagram.com/pramaacademy/" target="_blank"><i className='fab fa-instagram icon'></i></a>
            {/* <i className='fab fa-twitter icon'></i> */}
            <a href="https://www.youtube.com/@pramaacademy1122" target="_blank"><i className='fab fa-youtube icon'></i></a>
          </div>
        </div>
      </section>
    </>
  )
}

export default Head
