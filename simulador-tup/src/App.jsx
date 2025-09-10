import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/pages/Home";
import ExamLinear from "./components/pages/ExamLinear"; 
import ExamResults from "./components/pages/ExamResults";
import ExamSequential from "./components/pages/ExamSequential";

import "./App.css";

function App() {
  return (
    <>
      <div className="video-container">
        <video autoPlay loop muted className="background-video">
          <source src="/videos/background.mp4" type="video/mp4" />
          Tu navegador no soporta video.
        </video>
        <div className="video-overlay"></div>
      </div>

      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/exam/linear" element={<ExamLinear />} />
          <Route path="/exam/results" element={<ExamResults />} /> 
          <Route path="/exam/sequential" element={<ExamSequential />} />

        </Routes>
      </Router>
    </>
  );
}

export default App;
