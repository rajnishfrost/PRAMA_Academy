import React from "react"
import Back from "../common/back/Back"
import TeamCard from "./TeamCard"
import "./team.css"
import "../about/about.css"

const Team = () => {
  return (
    <>
      <Back title='Team' />
      <section className='team padding'>
        <div className='container grid'>
          <TeamCard />
        </div>
        <div className="pt70 px100">
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
      </section>
    </>
  )
}

export default Team
