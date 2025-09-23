import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ExamLinear.css";

export default function ExamLinear() {
  const location = useLocation();
  const navigate = useNavigate();

  const questions = location.state?.questions || [];
  const username = localStorage.getItem("username") || "Usuario";

  const savedAnswers = JSON.parse(localStorage.getItem("exam-answers") || "{}");
  const savedTime = parseInt(localStorage.getItem("exam-time")) || 10 * 60;
  const savedFlags = JSON.parse(localStorage.getItem("exam-flags") || "{}");

  const [answers, setAnswers] = useState(savedAnswers);
  const [flags, setFlags] = useState(savedFlags);
  const [timeLeft, setTimeLeft] = useState(savedTime);

  const [examStarted, setExamStarted] = useState(
    !!localStorage.getItem("exam-started")
  );
  const [showFinishModal, setShowFinishModal] = useState(false);

  const questionRefs = useRef([]);

  useEffect(() => {
    if (!examStarted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

          navigate("/exam/results", {
            state: { username, answers, questions, timeLeftAtEnd: 0 },
          });

          localStorage.removeItem("exam-time");
          localStorage.removeItem("exam-answers");
          localStorage.removeItem("exam-flags");
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

  const handleToggleFlag = (index) => {
    setFlags((prev) => {
      const updated = { ...prev, [index]: !prev[index] };
      localStorage.setItem("exam-flags", JSON.stringify(updated));
      return updated;
    });
  };

  const scrollToQuestion = (index) => {
    questionRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleConfirmFinish = () => {
    localStorage.removeItem("exam-time");
    localStorage.removeItem("exam-answers");
    localStorage.removeItem("exam-flags");
    localStorage.removeItem("exam-started");
    navigate("/exam/results", {
      state: { username, answers, questions, timeLeftAtEnd: timeLeft },
    });
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
        <div className="navbar-questions">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`nav-question ${
                answers[idx]?.length ? "answered" : ""
              } ${flags[idx] ? "flagged" : ""}`}
              onClick={() => scrollToQuestion(idx)}
            >
              {idx + 1}
              {flags[idx] && <span className="flag-icon">⚑</span>}
            </div>
          ))}
        </div>
      </div>

      <div
        className={`exam-linear-container ${
          !examStarted ? "blurred" : ""
        } ${showFinishModal ? "blurred" : ""}`}
      >
        <h1>Parcial</h1>
        {questions.map((q, idx) => (
          <div
            key={idx}
            ref={(el) => (questionRefs.current[idx] = el)}
            className="question-container"
          >
            <div className="question-header">
              <h3>{`Pregunta ${idx + 1}: ${q.pregunta}`}</h3>
              <button
                className={`flag-btn ${flags[idx] ? "active" : ""}`}
                onClick={() => handleToggleFlag(idx)}
              >
                {flags[idx] ? "Quitar bandera" : "Marcar"}
              </button>
            </div>
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
          <button
            className="finish-button"
            onClick={() => setShowFinishModal(true)}
          >
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
              <button onClick={() => setShowFinishModal(false)}>Volver</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
