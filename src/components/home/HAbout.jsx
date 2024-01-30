import React, { useEffect, useRef } from "react"
// import OnlineCourses from "../allcourses/OnlineCourses"
import Heading from "../common/heading/Heading"
import "../allcourses/courses.css"
import { coursesCard } from "../../dummydata"
import { Link } from "react-router-dom"

const HAbout = ({ scrollToCourse }) => {

  const sectionRef = useRef(null);

  useEffect(() => {
    if (scrollToCourse !== null) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scrollToCourse]);

  return (
    <>
      <section className='homeAbout' >
        <div className='container' ref={sectionRef}>
          <Heading subtitle='our courses' title='explore our popular online courses' />

          <div className='coursesCard'>
            {/* copy code form  coursesCard */}
            <div className='grid2'>
              {coursesCard.map((val) => (
                <div className='items'>
                  <div className='content flex'>
                    <div className='left'>
                      <div className='img'>
                        <img src={val.cover} alt='' />
                      </div>
                    </div>
                    <div className='text'>
                      <h1>{val.coursesName}</h1>
                      <div className='rate'>
                        {/* <i className='fa fa-star'></i>
                        <i className='fa fa-star'></i>
                        <i className='fa fa-star'></i>
                        <i className='fa fa-star'></i>
                        <i className='fa fa-star'></i>
                        <label htmlFor=''>(5.0)</label> */}
                      </div>
                      <div className='details'>
                        {val.courTeacher.map((details) => (
                          <>
                            <div className='box'>
                              <div className='dimg'>
                                <img src={details.dcover} alt='' />
                              </div>
                              <div className='para'>
                                <h4>{details.name}</h4>
                              </div>
                            </div>
                            {/* <span>{details.totalTime}</span> */}
                          </>
                        ))}
                      </div>
                    </div>
                  </div >
                  {/* <div className='price'>
                    <h3>
                      {val.priceAll} / {val.pricePer}
                    </h3>
                  </div> */}
                  <div className="pt50px">
                  <Link to={`/courses${val.route}`} className="viewButton"  ><button className='outline-btn' >View !</button></Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* <OnlineCourses /> */}
      </section>
    </>
  )
}

export default HAbout