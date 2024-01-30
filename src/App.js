import "./App.css";
import Header from "./components/common/header/Header";
import { Switch, Route } from "react-router-dom";
import About from "./components/about/About";
import ViewCourse from "./components/allcourses/CourseHome"
import Team from "./components/team/Team";
// import Pricing from "./components/pricing/Pricing";
import Question from "./components/blog/Question"
// import Contact from "./components/contact/Contact";
import Footer from "./components/common/footer/Footer";
import Home from "./components/home/Home";
import {useState } from "react";
import TermAndCondition from "./components/termAndCondition/TermAndCondition";

function App() {
  const [scrollToCourse, setScrollToCourse] = useState(null);

  const handleCourse = () => {
    setScrollToCourse(!scrollToCourse);
  };
  return (
    <>
      <Header handleCourse={handleCourse}/>
      <Switch>
        <Route exact path='/' render={() => <Home scrollToCourse={scrollToCourse}/>} />
        <Route exact path='/about' component={About} />
        <Route exact path='/courses/:id' component={ViewCourse} />
        <Route exact path='/team' component={Team} />
        <Route exact path='/term-and-condition' component={TermAndCondition} />
        <Route exact path='/journal' component={Question} />
        {/* <Route exact path='/contact' component={Contact} /> */}
      </Switch>
      <Footer handleCourse={handleCourse}/>
    </>
  )
}

export default App
