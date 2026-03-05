import React, { useState } from "react"
import { Link } from "react-router-dom"
import Head from "./Head"
import "./header.css"

const Header = ({handleCourse , handleContact}) => {
  const [click, setClick] = useState(false)

  return (
    <>
      <Head />
      <header>
        <nav className='flexSB'>
          <ul className={click ? "mobile-nav" : "flexSB "} onClick={() => setClick(false)}>
            <li>
              <Link to='/'>Home</Link>
            </li>
            <li>
              <Link onClick={() => handleCourse()} to="">Courses</Link>
            </li>
            <li>
              <Link to='/team'>Team</Link>
            </li>
            <li>
              <Link to='/about'>About</Link>
            </li>
            <li>
              <Link to='/brand-ambassdor'>Our Brand Ambassdor</Link>
            </li>
            <li>
              <Link to='/abacus-worksheet'>Let's Practice</Link>
            </li>
            <li>
              <Link to='' onClick={()=> handleContact()}>Contact</Link>
            </li>
          </ul>
          <div className='start'>
            <div className='button'></div>
          </div>
          <button className='toggle' onClick={() => setClick(!click)}>
            {click ? <i className='fa fa-times'> </i> : <i className='fa fa-bars'></i>}
          </button>
        </nav>
      </header>
    </>
  )
}

export default Header
