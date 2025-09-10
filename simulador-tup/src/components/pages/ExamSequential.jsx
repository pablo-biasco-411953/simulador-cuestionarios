// src/components/Pages/ExamSequential.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ExamSequential.css";

export default function ExamSequential() {
  const location = useLocation();
  const navigate = useNavigate();

  const questions = location.state?.questions || [];
  const username = localStorage.getItem("username") || "Usuario";

  const savedAnswers = JSON.parse(localStorage.getItem("exam-answers") || "{}");
  const savedTime = parseInt(localStorage.getItem("exam-time")) || 10 * 60;

  const [answers, setAnswers] = useState(savedAnswers);
  const [timeLeft, setTimeLeft] = useState(savedTime);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

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
          return 0;
        }
        const newTime = prev - 1;
        localStorage.setItem("exam-time", newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, username, answers, questions]);

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

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleFinish = () => {
    localStorage.removeItem("exam-time");
    localStorage.removeItem("exam-answers");

    navigate("/exam/results", {
      state: {
        username,
        answers,
        questions,
        timeLeftAtEnd: timeLeft,
      },
    });
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="exam-sequential-wrapper">
      <div className="exam-navbar">
        <div className="navbar-left">
          <span>Usuario: {username}</span>
          <span className={timeLeft <= 120 ? "time-warning" : ""}>
            Tiempo restante: {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {currentQuestion && (
        <div className="question-card">
          <h3>{`Pregunta ${currentQuestionIndex + 1}: ${currentQuestion.pregunta}`}</h3>
          <div className="options-container">
            {currentQuestion.opciones.map((option, idx) => (
              <label key={idx} className="option-label">
                <input
                  type="checkbox"
                  value={option}
                  checked={answers[currentQuestionIndex]?.includes(option) || false}
                  onChange={() => handleCheckboxChange(currentQuestionIndex, option)}
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="question-actions">
        {currentQuestionIndex < questions.length - 1 ? (
          <button onClick={handleNext}>Siguiente</button>
        ) : (
          <button onClick={handleFinish}>Terminar intento</button>
        )}
      </div>
    </div>
  );
}
