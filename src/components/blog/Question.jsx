import React, { useEffect, useState } from "react";
import Back from "../common/back/Back";
import "./blog.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import html2pdf from "html2pdf.js";

const Question = () => {

  const [payload, setPayload] = useState({ operators: '+', noOfQuestion: "25", noOfRows: "2", noOfDigits: "1" });
  const [substract, setSubstract] = useState(false);
  const [questionRows, setQuestionRows] = useState(null);

  function generateNumberOfRows(noOfDigit, noOfQuestion, rows, Substraction) {
    let dynamicArrays = {};
    for (let index = 0; index < rows; index++)
      dynamicArrays[`row${index}`] = generateNumberOfQuestion(noOfDigit, noOfQuestion, Substraction, dynamicArrays, index);
    setQuestionRows(dynamicArrays);
  }

  function generateNumberOfQuestion(noOfDigit, noOfQuestion, Subtraction, dynamicArrays, index) {
    let newArray = []; // New array to hold the generated row

    for (let j = 0; j < noOfQuestion; j++) {
      let gen = generateRandomNumber(noOfDigit); // Generate the random number for this question

      // If Subtraction is true and it's row1 (index === 1)
      if (Subtraction && index === 1) {
        // Ensure dynamicArrays['row0'] exists and has enough questions
        if (dynamicArrays['row0'] && dynamicArrays['row0'][j] !== undefined) {
          const referenceNumber = dynamicArrays['row0'][j]; // Number from the first row

          // Subtract the generated number from the reference number in row0 to make it negative
          gen = referenceNumber - gen;

          // Ensure that the result is negative
          if (gen > 0) {
            gen = -Math.abs(gen); // Force the value to be negative
          }
        } else {
          console.error('Invalid reference in dynamicArrays.row0');
        }
      }

      newArray.push(gen); // Add the generated (or subtracted) number to the current row
    }

    return newArray; // Return the generated row
  }

  function generateRandomNumber(noOfDigit) {
    const min = Math.pow(10, noOfDigit - 1);
    const max = Math.pow(10, noOfDigit) - 1;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNumber;
  }

  const handlePayload = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
    setQuestionRows(null)
  }

  useEffect(() => {
    if (payload.operators === "-")
      setSubstract(true);
    else
      setSubstract(false);
  }, [payload])

  const download = () => {
    const element = document.querySelector("#test");
    html2pdf(element);
  }

  return (
    <>
      <Back title='Worksheet' />
      <section className='blog padding'>
        <div className="row px-5 pt-5">
          {/* First Select Field */}
          <div className="col-lg-3 col-md-6 mb-3 p-2">
            <label htmlFor="select1" className="form-label">Operators</label>
            <select onChange={handlePayload} name='operators' className="form-select" id="select1">
              <option value="+">Addition </option>
              <option value="-">Substraction</option>
              <option value="*">Multiplication</option>
              <option value="/">Division</option>
            </select>
          </div>
          {/* Second Select Field */}
          <div className="col-lg-3 col-md-6 mb-3 p-2">
            <label htmlFor="select2" className="form-label">No. Of Question</label>
            <select onChange={handlePayload} name='noOfQuestion' className="form-select" id="select2">
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>
          </div>
          {/* Third Select Field */}
          <div className="col-lg-3 col-md-6 mb-3 p-2">
            <label htmlFor="select3" className="form-label">{payload.operators === "*" ? "Multiplicand digits:" : payload.operators === "/" ? "Dividend digits:" : "No. of Rows"}</label>
            <select onChange={handlePayload} name='noOfRows' className="form-select" id="select3">
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>
          {/* Fourth Select Field */}
          <div className="col-lg-3 col-md-6 mb-3 p-2">
            <label htmlFor="select4" className="form-label">{payload.operators === "*" ? "Multiplier digits:" : payload.operators === "/" ? "Divisor digits:" : "No. of Digits"}</label>
            <select onChange={handlePayload} name='noOfDigits' className="form-select" id="select4">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="3">4</option>
            </select>
          </div>
        </div>
        <div className="d-flex justify-content-center">
          <button className="bg-dark rounded fs-4" onClick={() => generateNumberOfRows(payload?.noOfDigits, payload?.noOfQuestion, payload?.noOfRows, substract)}>Generate</button>
        </div>
      </section>
      <div className="d-flex justify-content-end">
        {
          questionRows !== null
            ?
            <button onClick={download} style={{ padding: "10px", marginRight: "10px" }} className="bg-dark rounded"><i class="fas fa-download"></i></button>
            :
            <></>
        }

      </div>
      {
        questionRows !== null
          ?
          <section id="test">
            <h1 className="text-center fw-bold">PRAMA ACADEMY</h1>
            <div className="d-flex flex-wrap justify-content-center">
              {
                Array.from({ length: payload?.noOfQuestion }).map((_, questionIndex) =>
                  <div className="add" key={questionIndex}>
                    <div className="d-flex justify-content-center">
                      <div className="add-symbol">
                        <h4>{payload?.operators === "-" ? <></> : payload?.operators}</h4>
                      </div>
                      <div>
                        {
                          Array.from({ length: payload?.noOfRows }).map((_, rowsIndex) =>
                            questionRows && <p className="text-center" key={rowsIndex}>{questionRows[`row${rowsIndex}`][questionIndex]}</p>
                          )
                        }
                      </div>
                    </div>
                    <hr />
                  </div>
                )
              }
            </div>
          </section>
          :
          <></>
      }
    </>
  )
}



export default Question
