import React, { useEffect } from "react"
import AboutCard from "../about/AboutCard"
// import Hblog from "./Hblog"
import HAbout from "./HAbout"
import Hero from "./hero/Hero"
// import Hprice from "./Hprice"
// import Testimonal from "./testimonal/Testimonal"

const Home = ({scrollToCourse}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [])
  return (
    <>
      <Hero />
      <AboutCard />
      <HAbout scrollToCourse={scrollToCourse} />
      {/* <Testimonal /> */}
      {/* <Hblog /> */}
      {/* <Hprice /> */}
    </>
  )
}

export default Home
