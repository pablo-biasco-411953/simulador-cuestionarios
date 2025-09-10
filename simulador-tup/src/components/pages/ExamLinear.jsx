import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ExamLinear.css";

export default function ExamLinear() {
  const location = useLocation();
  const navigate = useNavigate();

  const questions = location.state?.questions || [];
  const username = localStorage.getItem("username") || "Usuario";

  const savedAnswers = JSON.parse(localStorage.getItem("exam-answers") || "{}");
  const savedTime = parseInt(localStorage.getItem("exam-time")) || 10 * 60;

  const [answers, setAnswers] = useState(savedAnswers);
  const [timeLeft, setTimeLeft] = useState(savedTime);

  const [countdownStart, setCountdownStart] = useState(
    localStorage.getItem("exam-started") ? 0 : 3
  );
  const [examStarted, setExamStarted] = useState(
    !!localStorage.getItem("exam-started")
  );

  const [showFinishModal, setShowFinishModal] = useState(false);


  useEffect(() => {
  if (!examStarted) return;

  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timer);

        const timeUsed = 10 * 60 - prev;

        navigate("/exam/results", {
          state: {
            username,
            answers,
            questions,
            timeLeftAtEnd: 0, 
          },
        });

        localStorage.removeItem("exam-time");
        localStorage.removeItem("exam-answers");
        localStorage.removeItem("exam-started");

        return 0;
      }

      const newTime = prev - 1;
      localStorage.setItem("exam-time", newTime);
      return newTime;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [examStarted, navigate, answers, questions, username]);

  const handleCheckboxChange = (questionIndex, option) => {
    setAnswers((prev) => {
      const currentAnswers = prev[questionIndex] || [];
      let newAnswers;
      if (currentAnswers.includes(option)) {
        newAnswers = {
          ...prev,
          [questionIndex]: currentAnswers.filter((o) => o !== option),
        };
      } else {
        newAnswers = {
          ...prev,
          [questionIndex]: [...currentAnswers, option],
        };
      }
      localStorage.setItem("exam-answers", JSON.stringify(newAnswers));
      return newAnswers;
    });
  };

  const handleFinishClick = () => {
    
    setShowFinishModal(true); 
  };

  const handleConfirmFinish = () => {
    localStorage.removeItem("exam-time");
    localStorage.removeItem("exam-answers");
    localStorage.removeItem("exam-started");
   navigate("/exam/results", {
    state: {
        username,
        answers,
        questions,
        timeLeftAtEnd: timeLeft,
    },
    });

  };

  const handleCancelFinish = () => {
    setShowFinishModal(false);
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  return (
    <div className="exam-linear-wrapper">
      <div className="exam-navbar">
        <div className="navbar-left">
          <span>Usuario: {username}</span>
          {examStarted && (
            <span className={timeLeft <= 120 ? "time-warning" : ""}>
              Tiempo restante: {formatTime(timeLeft)}
            </span>
          )}
        </div>
      </div>

      <div
        className={`exam-linear-container ${!examStarted ? "blurred" : ""} ${showFinishModal ? "blurred" : ""}`}
      >
        <h1>Parcial</h1>
        {questions.map((q, idx) => (
          <div key={idx} className="question-container">
            <h3>{`Pregunta ${idx + 1}: ${q.pregunta}`}</h3>
            <div className="options-container">
              {q.opciones.map((option, oidx) => (
                <label key={oidx} className="option-label">
                  <input
                    type="checkbox"
                    name={`question-${idx}`}
                    value={option}
                    checked={answers[idx]?.includes(option) || false}
                    onChange={() => handleCheckboxChange(idx, option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        ))}
        {examStarted && !showFinishModal && (
          <button className="finish-button" onClick={handleFinishClick}>
            Finalizar Intento
          </button>
        )}
      </div>

      {showFinishModal && (
        <div className="finish-modal-overlay">
          <div className="finish-modal">
            <h2>¿Enviar todo y finalizar?</h2>
            <div className="exam-buttons">
              <button onClick={handleConfirmFinish}>Finalizar intento</button>
              <button onClick={handleCancelFinish}>Volver</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
