import React, { useEffect, useState } from "react";
import Back from "../common/back/Back";
import { useParams } from "react-router-dom";
import { coursesCard } from "../../dummydata"
import "../blog/blog.css"

const ViewCourse = () => {
  const { id } = useParams();
  const [data] = useState(coursesCard.filter(d => d.route === `/${id}`)[0]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [])
  return (
    <>
      <Back title='Explore Courses' />
      <section className='blog padding'>
        <div className='container grid4'>
          <div className='items shadow'>
            <div className='img'>
              <img src={data.bigImage} alt='' />
            </div>
            <div className='text'>
              <h1>Introduction</h1>
              <p>{data.courseIntroduction}</p>
              <h1>History</h1>
              <p>{data.courseHistory}</p>
              <h1>Benefits</h1>
              <div className="d-flex f-wrap  f-center">
                {
                  data.courseBenefits.map(d =>
                  (
                    <>
                      <div className='text2 m50'>
                        <img src={d.image} alt="img" className="BenefitImg" />
                        <h2>{d.heading}</h2>
                      </div>
                    </>
                  )
                  )
                }
              </div>
              <h1>Levels</h1>
              <div>
                {
                  data?.levels.map(d => {
                    return (
                      <>
                        <div className='text2'>
                          <h4>{d?.des}</h4>
                          {d.levelNumber && d.levelNumber.map((subLevel, subIndex) => (
                            <div key={subIndex}>
                              {subLevel.level && subLevel.level.map((item, idx) => (
                                <div key={idx}>
                                  <p>{item.l}</p>
                                  {item.li && (
                                    <ul>
                                      {item.li.map((liItem, liIndex) => (
                                        <li key={liIndex}>{liItem}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </>
                    )
                  }
                  )
                }
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default ViewCourse




