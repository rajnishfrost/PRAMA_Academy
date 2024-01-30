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
        <h1 className="text-center mt20 theme-text">Franchisee </h1>
        <ul>
          <li className="mt10 list-style-disc grey-color">Level Vise training cost - Rs 2000/-only. </li>
          <li className="mt10 list-style-disc grey-color">Standardized Material Kit (Books, Abacus, Bag, Practise Sheet, Exam Paper, Certificate)</li>
          <li className="mt10 list-style-disc grey-color">Online Training Level Vise one to one instructor training</li>
          <li className="mt10 list-style-disc grey-color">No Royalty only pay for Material & Education Kit</li>
          <li className="mt10 list-style-disc grey-color">Support for Online & Offline Exam</li>
          <li className="mt10 list-style-disc grey-color">Support for Online & Offline training for Franchisee</li>
          <li className="mt10 list-style-disc grey-color">State, National & International Level Competition</li>
          <li className="mt10 list-style-disc grey-color">Franchise has to renewed in every 3 years</li>
        </ul>
      </div>
    </>
  )
}

export default About
