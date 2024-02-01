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
        <Back title='Brand Ambassdor'/>
        <div className='px100'>
            <img className='w100' src="./images/medal1.jpg" alt="img" />
            <img className='w100' src="./images/medal2.jpg" alt="img" />
            <img className='w100' src="./images/childWithTable.jpg" alt="" />
            <img className='w100' src="./images/medal3.jpg" alt="img" />
            <img className='w100' src="./images/medal4.jpg" alt="img" />
        </div>
    </div>
  )
}
