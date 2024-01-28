import React from "react"
import AboutCard from "../about/AboutCard"
// import Hblog from "./Hblog"
import HAbout from "./HAbout"
import Hero from "./hero/Hero"
import Hprice from "./Hprice"
// import Testimonal from "./testimonal/Testimonal"

const Home = ({scrollToCourse}) => {
  return (
    <>
      <Hero />
      <AboutCard />
      <HAbout scrollToCourse={scrollToCourse}/>
      {/* <Testimonal /> */}
      {/* <Hblog /> */}
      {/* <Hprice /> */}
    </>
  )
}

export default Home
