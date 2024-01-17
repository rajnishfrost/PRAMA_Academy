import React, { useState } from "react"
import Back from "../common/back/Back"
// import BlogCard from "./BlogCard"
import "./blog.css"

const Question = () => {
  const [noOfDigit, setNoOfDigit] = useState(1);
  const [noOfRow, setNoOfRow] = useState(5);
  const [noOfQuestion, setNoOfQuestion] = useState(10);
  const [questionArray, setQuestionArray] = useState([]);
  const [result, setResult] = useState();

  function gernerateNumberOfQuestion() {
    let newArray = []
    for (let index = 0; index < noOfQuestion; index++) {
      for (let j = 0; j < noOfRow; j++) {
        newArray.push(generateRandomNumber(noOfDigit));
      }
    }
    setQuestionArray(newArray)
  }

  function generateRandomNumber(numDigits) {
    const min = Math.pow(10, numDigits - 1);
    const max = Math.pow(10, numDigits) - 1;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNumber;
  }

  console.log(questionArray);
  return (
    <>
      <Back title='Blog Posts' />
      <section className='blog padding'>
        <div className='container grid2'>
          <button onClick={() => gernerateNumberOfQuestion()}>click me</button>
        </div>
      </section>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {
                Array.from({ length: noOfQuestion }, (_, index) => (
                  <th key={index}>Q{index + 1}</th>
                ))
              }
            </tr>
          </thead>
          <tbody>
            {
              Array.from({ length: noOfRow }, (_, rows) => (
                <>
                  <tr>
                    {
                      Array.from({ length: noOfQuestion }, (_, column) => {
                        return (<td key={column}>{questionArray[column * noOfRow + rows]}</td>)
                      })
                    }
                  </tr>
                </>
              ))
            }
          </tbody>
        </table>
      </div>
    </>
  )
}

export default Question
