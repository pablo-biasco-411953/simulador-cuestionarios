// src/components/Pages/ExamResult.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ExamResults.css";
import mal01 from "../../assets/mal01.gif";
import mal02 from "../../assets/mal02.png";
import mal03 from "../../assets/mal03.png";
import mal04 from "../../assets/mal04.png";
import bien01 from "../../assets/bien01.png";


function importAll(r) {
  return r.keys().map(r);
}
const malImages = [mal01, mal02,mal03,mal04];

const bienImages = [bien01];



export default function ExamResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const { username, answers, questions, timeLeftAtEnd } = location.state || {};

  const [score, setScore] = useState(0);
  const [resultImage, setResultImage] = useState(null);

  const totalQuestions = questions?.length || 0;

  useEffect(() => {
    if (!questions) return;

    let total = 0;

    questions.forEach((q, idx) => {
      const userAnswers = answers[idx] || [];
      const correctAnswers = Array.isArray(q.correcta)
        ? q.correcta
        : [q.correcta].filter(Boolean);

      const allCorrectSelected =
        correctAnswers.every((ans) => userAnswers.includes(ans)) &&
        userAnswers.every((ans) => correctAnswers.includes(ans));

      if (allCorrectSelected) total += 1;
    });

    setScore(total);

    const imagesPool = total < 6 ? malImages : bienImages;
    if (imagesPool.length > 0) {
      const randomImg = imagesPool[Math.floor(Math.random() * imagesPool.length)];
      setResultImage(randomImg);
    }
  }, [questions, answers]);

  const timeUsed = 10 * 60 - (timeLeftAtEnd || 0);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  
  const finalizar = () => {
    localStorage.removeItem("answers");
    localStorage.removeItem("questions");
    localStorage.removeItem("timeLeftAtEnd");
    localStorage.removeItem("exam-started");
    navigate("/")
  };

  return (
    <div className="exam-result-wrapper">
      <div className="exam-result-card">
        <h1>{username}</h1>
        <h2>
          Calificación: {score}/{totalQuestions}
        </h2>
        <h3>Tiempo transcurrido: {formatTime(timeUsed)}</h3>
        <div className="meme-container">
          {resultImage ? (
            <img src={resultImage} alt="resultado" />
          ) : (
            <p>No hay imágenes disponibles</p>
          )}
        </div>
        <button onClick={() => finalizar()}>Volver al inicio</button>
      </div>
    </div>
  );
}
