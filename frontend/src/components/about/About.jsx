import React, { useEffect } from "react"
import "./about.css"
import Back from "../common/back/Back"

const About = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [])
  return (
    <>
      <Back title='About Us' />
      {/* <AboutCard /> */}
      <div className="pt70 px100">
        <h2 className="grey-color f15">Teaching Academy has been on a remarkable journey since its founding in 2018, with an
          unwavering commitment to making quality education accessible and affordable for students
          around the world. What began as a single person&#39;s vision has blossomed into a thriving
          academy that has touched the lives of hundreds of eager learners, transcending geographical
          boundaries.
          The academy&#39;s core offerings initially centered around Abacus and Vedic mathematics
          courses, equipping students with valuable skills in mental math and problem-solving. Over
          time, the curriculum expanded to encompass handwriting, shloka, and additional
          mathematics courses, providing a well-rounded educational experience.
          The academy&#39;s true strength lies in its unique approach to teaching, which seamlessly blends
          traditional Indian methods with cutting-edge smart technology. This fusion creates an
          engaging and effective learning environment that resonates with students from diverse
          backgrounds. At the heart of Teaching Academy&#39;s philosophy are the principles of quality,
          persistence, and discipline. These values permeate every aspect of the academy&#39;s operations,
          from curriculum development to student support. The dedicated team of educators is
          passionate about nurturing each student&#39;s potential and instilling a love for lifelong learning.
          As Teaching Academy continues to grow and evolve, it remains steadfast in its mission to
          empower individuals through education, one student at a time.</h2>
      </div>
    </>
  )
}

export default About
