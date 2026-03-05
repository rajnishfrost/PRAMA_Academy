import React , {useEffect, useState} from "react"
import { useLocation } from "react-router-dom";

const Back = ({ title }) => {
  const [backgroundImage, setBackgroundImage] = useState("/images/child-865116.jpg");
  const location = useLocation();

  useEffect(() => {
    checkPath();
    // eslint-disable-next-line
  }, [location])
  
  const checkPath = () => {
    const {pathname} = location;
    if(pathname.includes("about"))
    setBackgroundImage("/images/delighfulChild.jpg")
    if(pathname.includes("team"))
    setBackgroundImage("/images/team.jpg")
    if(pathname.includes("brand-ambassdor"))
    setBackgroundImage("/images/childWithTable.jpg")
  }

  return (
    <>
      <section className='back' style={{backgroundImage :`url(${backgroundImage})`}}>
        <h2 className="ml42">Home / {location.pathname.split("/")[1]}</h2>
        <h1 className="ml42">{title}</h1>
      </section>
      <div className='margin'></div>
    </>
  )
}

export default Back
