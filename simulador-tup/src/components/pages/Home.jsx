import { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const [username, setUsername] = useState("");
  const [animateModal, setAnimateModal] = useState(false);
  const [expandNavbar, setExpandNavbar] = useState(false);
  const [showExamOptions, setShowExamOptions] = useState(false); 
  const [showLoading, setShowLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const [resumeModal, setResumeModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const savedName = localStorage.getItem("username");
    if (savedName) {
      setUsername(savedName);
      setAnimateModal(true);
      setTimeout(() => setExpandNavbar(true), 1200);
    }

  
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) return;

    try {
      await addDoc(collection(db, "Users"), {
        Nombre: username,
        Calificacion: 0,
        createdAt: new Date()
      });

      localStorage.setItem("username", username);
      setAnimateModal(true);
      setTimeout(() => setExpandNavbar(true), 1200);
    } catch (error) {
      console.error("Error guardando usuario:", error);
    }
  };

  const shuffleArray = (array) => {
    return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  };

  const getRandomQuestions = (questions, n) => {
    const shuffled = shuffleArray(questions);
    return shuffled.slice(0, n).map(q => ({
      ...q,
      opciones: shuffleArray(q.opciones)
    }));
  };

  const handleLineal = async () => {
    setShowExamOptions(false);       
    setShowLoading(true);            
    setLoadingText("Cargando preguntas...");

    setTimeout(() => {
      setLoadingText("Randomizando preguntas...");
    }, 1000);

    setTimeout(async () => {
      const response = await fetch("/data/preguntas.json");
      const allQuestions = await response.json();

      const selectedQuestions = getRandomQuestions(allQuestions, 10);

      localStorage.setItem("exam-questions", JSON.stringify(selectedQuestions));

      localStorage.setItem("exam-started", "true");

      navigate("/exam/linear", { state: { questions: selectedQuestions } });
    }, 1200);
  };

   const handleSecuencial = async () => {
    setShowExamOptions(false);       
    setShowLoading(true);            
    setLoadingText("Cargando preguntas...");

    setTimeout(() => {
      setLoadingText("Randomizando preguntas...");
    }, 1000);

    setTimeout(async () => {
      const response = await fetch("/data/preguntas.json");
      const allQuestions = await response.json();

      const selectedQuestions = getRandomQuestions(allQuestions, 10);

      localStorage.setItem("exam-questions", JSON.stringify(selectedQuestions));

      localStorage.setItem("exam-started", "true");

      navigate("/exam/sequential", { state: { questions: selectedQuestions } });
    }, 1200);
  };


  const handleContinueAttempt = () => {
    const savedQuestions = JSON.parse(localStorage.getItem("exam-questions") || "[]");
    setResumeModal(false);
    navigate("/exam/linear", { state: { questions: savedQuestions } });
  };

  const handleDiscardAttempt = () => {
    localStorage.removeItem("exam-started");
    localStorage.removeItem("exam-answers");
    localStorage.removeItem("exam-time");
    localStorage.removeItem("exam-questions");
    setResumeModal(false);
  };

  return (
    <>
      {/* Modal para continuar examen */}
      {resumeModal && (
        <div className="modal-container-exam">
          <div className="modal-content-exam">
            <h2>Ya tenes un intento en curso</h2>
            <p>¿Querés continuar con tu intento o descartarlo?</p>
            <div className="exam-buttons">
              <button onClick={handleDiscardAttempt}>No, descartar</button>
              <button onClick={handleContinueAttempt}>Continuar intento</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal que se transforma en navbar */}
      {!showLoading && !resumeModal && (
        <div className={`modal-to-navbar ${animateModal ? "animate" : ""} ${expandNavbar ? "expanded" : ""}`}>
          {!animateModal && (
            <div className="modal-content">
              <h2>Bienvenido al Simulador</h2>
              <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
                <input
                  type="text"
                  placeholder="Ingresa tu nombre"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <button type="submit">Ingresar</button>
              </form>
            </div>
          )}
          {animateModal && (
            <div className="navbar-content">
              <span className="navbar-username">{username}</span>
              {expandNavbar && (
                <div className="navbar-buttons">
                  <button onClick={() => {
                    const examStarted = localStorage.getItem("exam-started");
                    if (examStarted) {
                      setResumeModal(true); 
                    } else {
                      setShowExamOptions(true); 
                    }
                  }}>Iniciar cuestionario</button>
                  <button>Sugerir preguntas</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showExamOptions && !showLoading && (
        <div className="modal-container-exam">
          <div className="modal-content-exam">
            <h2>Modo de examen</h2>
            <div className="exam-buttons">
              <button onClick={() => handleSecuencial()}>Secuencial</button>
              <button onClick={handleLineal}>Lineal</button>
            </div>
            <h4 style={{ marginBottom: "4px" }}>Aclaración:</h4>
            <h5 style={{ color: "#eb8f8fff", margin: "2px 0" }}>
              * Secuencial: 1 enunciado por página. No se puede volver atrás.
            </h5>
            <h5 style={{ color: "#eb8f8fff", margin: "2px 0" }}>
              * Lineal: Todas las preguntas juntas.
            </h5>
            <button className="close-button" onClick={() => setShowExamOptions(false)}>Cerrar</button>
          </div>
        </div>
      )}

      {/* Modal de carga */}
      {showLoading && (
        <div className="loading-modal">
          <div className="loading-spinner"></div>
          <h1>{loadingText}</h1>
        </div>
      )}
    </>
  );
}
