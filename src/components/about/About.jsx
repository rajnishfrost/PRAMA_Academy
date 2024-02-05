import React from "react"
import "./about.css"
import Back from "../common/back/Back"

const About = () => {
  return (
    <>
      <Back title='About Us' />
      {/* <AboutCard /> */}
      <div className="pt70 px100">
        <h2 className="grey-color">The ancient Indian school of philosophy known as Nyaya held that valid knowledge (pramā) is certain, true, and accurately represents its object. They believed pramā arises from reliable means of gaining knowledge (pramāṇa). Prama Academy's vision aligns with this emphasis on spreading valid, correct knowledge. Since starting in 2018, we have trained over 600 students across 5 countries. Our team of skilled teachers provides personalized attention and quality instruction in areas like abacus, Vedic math, handwriting, and more. We keep class sizes small, with 5-10 students, to facilitate healthy competition and ensure each child gets individual care. Our dedication to sharing authentic, proven methods sets us apart.</h2>
      </div>
    </>
  )
}

export default About
