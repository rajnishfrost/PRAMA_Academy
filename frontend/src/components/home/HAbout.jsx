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
                    <div className='left w50'>
                        <img src={val.cover} alt='' />
                    </div>
                    <div className='text w50'>
                      <h1 className="text-center">{val.coursesName}</h1>
                      <div className="pt50px">
                        <Link to={`/courses${val.route}`} className="viewButton"  ><button className='outline-btn' >View !</button></Link>
                      </div>
                    </div>
                  </div >
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
