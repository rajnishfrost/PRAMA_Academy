import React, { useEffect, useState } from "react";
import Back from "../common/back/Back";
import { useParams } from "react-router-dom";
import { coursesCard } from "../../dummydata"
// import "../blog/blog.css"

const ViewCourse = () => {
  const { id } = useParams();
  const [data] = useState(coursesCard.filter(d => d.route === `/${id}`)[0]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [])
  return (
    <>
      <Back title={data?.coursesName} />
      <section className='blog padding'>
        <div className='container grid4'>
          <div className='items shadow'>
            <div className='img'>
              <img src={data?.bigImage} alt='' />
            </div>
            <div className='text'>
              <h1>Introduction</h1>
              <p>{data?.courseIntroduction}</p>
              <h1>{data?.courseHistory === "" ? "" : "History"}</h1>
              <p>{data?.courseHistory}</p>
              <h1>{data?.courseBenefits.length > 0 ? "Benefits" : ""}</h1>
              <div className="d-flex f-wrap  f-center">
                {
                  data?.courseBenefits?.map(d =>
                  (
                    <>
                      <div className='text2 m50'>
                        <img src={d?.image} alt="img" className="BenefitImg" />
                        <h2>{d?.heading}</h2>
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
                          {
                            d?.levelNumber && d?.levelNumber.map((subLevel, subIndex) => (
                              <div key={subIndex}>
                                {
                                  d?.levelNumber.length > 1 ?
                                    <h4 className="mt20"> Level {subIndex + 1}</h4>
                                    : <h4 className="mt20"> Levels</h4>
                                }
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
              <h1>Class Details</h1>
              <div>
                {
                data?.classDetail?.map((detail, index) => (
                  <div key={index}>
                    <h2 className="mt20">{detail.heading}</h2>
                    <ul className="mt20 ">
                      {detail.li.map((item, idx) => (
                        <li className="ls mt10 ml30" key={idx}>{item}</li>
                      ))}
                    </ul>
                    <p className="mt20 color-red">{detail.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <h1>SUMMER CAMP</h1>
          <p>Our summer camps are designed with international school vacation schedules in mind. The camps give children a break from routine schoolwork and immerse them in the beauty of Indian art through programs like Warli painting, sketch pen calligraphy, Madhubani painting, and handwriting classes. These activities help children discover new hobbies and take a break from stressful curricula.</p>
        </div>
      </section>
    </>
  )
}

export default ViewCourse




