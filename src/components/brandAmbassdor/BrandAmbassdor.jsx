import React from 'react';
import "./BrandAmbassdor.css"
import Back from '../common/back/Back';
// import brand1 from "./images/medal1.jpg";
// import brand2 from "../../../public/images/medal2.jpg";
// import brand3 from "../../../public/images/medal3.jpg";
// import brand4 from "../../../public/images/medal4.jpg";


export default function BrandAmbassdor() {
  return (
    <div>
      <Back title='Brand Ambassdor' />
      <div className='px100'>
        <img className='w100' src="./images/medal1.jpg" alt="img" />
        <img className='w100' src="./images/medal2.jpg" alt="img" />
        {/* <img className='w100' src="./images/childWithTable.jpg" alt="" /> */}
        <img className='w100' src="./images/medal3.jpg" alt="img" />
        <img className='w100' src="./images/medal4.jpg" alt="img" />
        <video className='video' controls>
          <source src="./images/video1.mp4" type="video/mp4" />
        </video>

        <video className='video' controls >
          <source src="./images/video3.mp4" type="video/mp4" />
        </video>
        <video className='video' controls>
          <source src="./images/video4.mp4" type="video/mp4" />
        </video>

        <video className='video' controls>
          <source src="./images/video6.mp4" type="video/mp4" />
        </video>

        <video className='video' controls>
          <source src="./images/video8.mp4" type="video/mp4" />
        </video>

        <video className='video' controls>
          <source src="./images/video10.mp4" type="video/mp4" />
        </video>

        <video className='video' controls>
          <source src="./images/video12.mp4" type="video/mp4" />
        </video>

        <div className='d-flex f-33'>
          <video className='w-33' controls>
            <source src="./images/video2.mp4" type="video/mp4" />
          </video>
          <video className='w-33' controls>
            <source src="./images/video5.mp4" type="video/mp4" />
          </video>
          <video className='w-33' controls>
            <source src="./images/video7.mp4" type="video/mp4" />
          </video>
        </div>
        <div className='d-flex'>
          <video className='w-33' controls>
            <source src="./images/video14.mp4" type="video/mp4" />
          </video>
          <video className='w-33' controls>
            <source src="./images/video15.mp4" type="video/mp4" />
          </video>
          <video className='w-33' controls>
            <source src="./images/video11.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  )
}
