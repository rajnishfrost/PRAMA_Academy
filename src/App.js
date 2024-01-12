import "./App.css";
import Header from "./components/common/header/Header";
import { Switch, Route } from "react-router-dom";
import About from "./components/about/About";
import ViewCourse from "./components/allcourses/CourseHome"
import Team from "./components/team/Team";
import Pricing from "./components/pricing/Pricing";
// import Blog from "./components/blog/Blog"
import Contact from "./components/contact/Contact";
import Footer from "./components/common/footer/Footer";
import Home from "./components/home/Home";

function App() {

  return (
    <>
      <Header />
      <Switch>
        <Route exact path='/' component={Home} />
        <Route exact path='/about' component={About} />
        <Route exact  path='/courses/:id' component={ViewCourse} />
        <Route exact path='/team' component={Team} />
        <Route exact path='/pricing' component={Pricing} />
        {/* <Route exact path='/journal' component={Blog} /> */}
        <Route exact path='/contact' component={Contact} />
      </Switch>
      <Footer />
    </>
  )
}

export default App
