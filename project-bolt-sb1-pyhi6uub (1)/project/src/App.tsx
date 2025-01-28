import React, { useState } from 'react';
import { Book, CheckCircle2, RotateCcw, Settings, Download } from 'lucide-react';
import { questions } from './data/questions';
import type { Question, ExamConfig } from './types';

function App() {
  const [examConfig, setExamConfig] = useState<ExamConfig>({
    numberOfQuestions: 10,
    selectedCategories: [],
  });
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const categories = Array.from(new Set(questions.map(q => q.category)));

  const generateExam = () => {
    let filteredQuestions = questions;
    if (examConfig.selectedCategories.length > 0) {
      filteredQuestions = questions.filter(q => 
        examConfig.selectedCategories.includes(q.category || '')
      );
    }
    
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    setSelectedQuestions(shuffled.slice(0, examConfig.numberOfQuestions));
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowResults(false);
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setUserAnswers(newAnswers);

    if (currentQuestionIndex < selectedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const calculateScore = () => {
    return userAnswers.reduce((score, answer, index) => {
      return score + (answer === selectedQuestions[index].correctAnswer ? 1 : 0);
    }, 0);
  };

  const exportOfflineVersion = () => {
    // Incluimos todas las preguntas disponibles
    const allQuestions = JSON.stringify(questions);
    
    const offlineAppCode = `
      // Todas las preguntas disponibles
      const allQuestions = ${allQuestions};
      
      function ExamApp() {
        const [questions, setQuestions] = React.useState([]);
        const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
        const [userAnswers, setUserAnswers] = React.useState([]);
        const [showResults, setShowResults] = React.useState(false);
        const [examStarted, setExamStarted] = React.useState(false);
        const [numQuestions, setNumQuestions] = React.useState(10);
        
        const generateExam = () => {
          const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
          setQuestions(shuffled.slice(0, numQuestions));
          setCurrentQuestionIndex(0);
          setUserAnswers([]);
          setShowResults(false);
          setExamStarted(true);
        };

        const handleAnswer = (answerIndex) => {
          const newAnswers = [...userAnswers];
          newAnswers[currentQuestionIndex] = answerIndex;
          setUserAnswers(newAnswers);
      
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
          }
        };
      
        const calculateScore = () => {
          return userAnswers.reduce((score, answer, index) => {
            return score + (answer === questions[index].correctAnswer ? 1 : 0);
          }, 0);
        };

        if (!examStarted) {
          return (
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Número de preguntas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={allQuestions.length}
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Math.min(allQuestions.length, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <button
                  onClick={generateExam}
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Comenzar Examen
                </button>
              </div>
            </div>
          );
        }
      
        if (showResults) {
          return (
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Resultados del Examen</h2>
                <p className="text-lg text-gray-600 mt-2">
                  Puntuación: {calculateScore()} de {questions.length}
                </p>
              </div>
      
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className={\`p-4 rounded-lg \${
                    userAnswers[index] === question.correctAnswer ? 'bg-green-50' : 'bg-red-50'
                  }\`}>
                    <p className="font-medium text-gray-800">{question.text}</p>
                    <div className="mt-2 space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className={\`flex items-center \${
                          optionIndex === question.correctAnswer ? 'text-green-700' : 
                          optionIndex === userAnswers[index] ? 'text-red-700' : 'text-gray-600'
                        }\`}>
                          <span className="mr-2">{optionIndex === question.correctAnswer ? '✓' : 
                            optionIndex === userAnswers[index] ? '✗' : '•'}</span>
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
      
              <button
                onClick={() => {
                  setExamStarted(false);
                  setQuestions([]);
                  setUserAnswers([]);
                  setCurrentQuestionIndex(0);
                  setShowResults(false);
                }}
                className="mt-6 w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Nuevo Examen
              </button>
            </div>
          );
        }
      
        return (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Pregunta {currentQuestionIndex + 1} de {questions.length}
                </span>
                <button
                  onClick={() => setShowResults(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Finalizar examen
                </button>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: \`\${((currentQuestionIndex + 1) / questions.length) * 100}%\`
                  }}
                />
              </div>
            </div>
      
            <div className="space-y-4">
              <p className="text-lg font-medium text-gray-800">
                {questions[currentQuestionIndex].text}
              </p>
      
              <div className="space-y-2">
                {questions[currentQuestionIndex].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={\`w-full text-left p-4 rounded-lg border transition-colors duration-200 \${
                      userAnswers[currentQuestionIndex] === index
                        ? 'bg-indigo-50 border-indigo-500'
                        : 'border-gray-200 hover:bg-gray-50'
                    }\`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      }
    `;

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Examen Offline</title>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
    <div id="root"></div>
    <script type="text/javascript">
        ${offlineAppCode}
        
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(ExamApp));
    </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'examen-offline.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8">
          <Book className="w-8 h-8 text-indigo-600 mr-2" />
          <h1 className="text-3xl font-bold text-gray-800">Generador de Exámenes</h1>
        </div>

        {selectedQuestions.length === 0 ? (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Número de preguntas
                </label>
                <input
                  type="number"
                  min="1"
                  max={questions.length}
                  value={examConfig.numberOfQuestions}
                  onChange={(e) => setExamConfig({
                    ...examConfig,
                    numberOfQuestions: parseInt(e.target.value)
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Categorías
                </label>
                <div className="mt-2 space-y-2">
                  {categories.map((category) => (
                    <label key={category} className="inline-flex items-center mr-4">
                      <input
                        type="checkbox"
                        checked={examConfig.selectedCategories.includes(category || '')}
                        onChange={(e) => {
                          const newCategories = e.target.checked
                            ? [...examConfig.selectedCategories, category]
                            : examConfig.selectedCategories.filter(c => c !== category);
                          setExamConfig({
                            ...examConfig,
                            selectedCategories: newCategories
                          });
                        }}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={generateExam}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Settings className="w-4 h-4 mr-2" />
                Generar Examen
              </button>
            </div>
          </div>
        ) : showResults ? (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
            <div className="text-center mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">Resultados del Examen</h2>
              <p className="text-lg text-gray-600 mt-2">
                Puntuación: {calculateScore()} de {selectedQuestions.length}
              </p>
            </div>

            <div className="space-y-4">
              {selectedQuestions.map((question, index) => (
                <div key={question.id} className={`p-4 rounded-lg ${
                  userAnswers[index] === question.correctAnswer ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <p className="font-medium text-gray-800">{question.text}</p>
                  <div className="mt-2 space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className={`flex items-center ${
                        optionIndex === question.correctAnswer ? 'text-green-700' : 
                        optionIndex === userAnswers[index] ? 'text-red-700' : 'text-gray-600'
                      }`}>
                        <span className="mr-2">{optionIndex === question.correctAnswer ? '✓' : 
                          optionIndex === userAnswers[index] ? '✗' : '•'}</span>
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => setSelectedQuestions([])}
                className="flex-1 flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Nuevo Examen
              </button>
              
              <button
                onClick={exportOfflineVersion}
                className="flex-1 flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Offline
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Pregunta {currentQuestionIndex + 1} de {selectedQuestions.length}
                </span>
                <button
                  onClick={() => setShowResults(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Finalizar examen
                </button>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIndex + 1) / selectedQuestions.length) * 100}%`
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-lg font-medium text-gray-800">
                {selectedQuestions[currentQuestionIndex].text}
              </p>

              <div className="space-y-2">
                {selectedQuestions[currentQuestionIndex].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors duration-200 ${
                      userAnswers[currentQuestionIndex] === index
                        ? 'bg-indigo-50 border-indigo-500'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;