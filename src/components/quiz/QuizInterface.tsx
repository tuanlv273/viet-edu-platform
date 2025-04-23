tsx
import React, { useState, useEffect } from 'react';
import QuestionDisplay from './QuestionDisplay';
import AnswerOptions from './AnswerOptions';
import Timer from './Timer';
import SubmitButton from './SubmitButton';
import ProgressBar from './ProgressBar';

interface QuizInterfaceProps {
  timeLimit: number;
  questions: any[]; 
  onSubmit: () => void;
  
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({
  timeLimit,
  questions,
  onSubmit,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<any[]>([]);
  const [currentQuestionData, setCurrentQuestionData] = useState<any>(null);
  const [currentAnswerOptionsData, setCurrentAnswerOptionsData] = useState<any[]>([]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const question = questions[currentQuestionIndex];
      setCurrentQuestionData(question);
      setCurrentAnswerOptionsData(question.answerOptions);
    }
  }, [currentQuestionIndex, questions]);

  const handleAnswerSelect = (answer: any) => {
      setSelectedAnswers([...selectedAnswers, answer]);
  };

  const handleSubmit = () => {
    // Logic to submit the answers
    // For now just logging the answers
    console.log('Submitted answers:', selectedAnswers);

    //check if it is the last question
    if (currentQuestionIndex < questions.length - 1) {
      // Move to the next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswers([]);
    } else {
      // Last question, call the onSubmit callback
      onSubmit();
    }
  };

  const handleTimeUp = () => {
      handleSubmit();
  }

  if (!currentQuestionData || currentAnswerOptionsData.length == 0) {
    return <div>Loading...</div>;
  }


  return (
    <div className="quiz-interface-container">
      <div className="quiz-header">
        <ProgressBar
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={questions.length}
        />
        <Timer timeLimit={timeLimit} onTimeUp={handleTimeUp} />
      </div>
      <div className="quiz-body">
        <QuestionDisplay questionData={currentQuestionData} />
        <AnswerOptions answerOptionsData={currentAnswerOptionsData} onSelect={handleAnswerSelect}/>
      </div>
      <div className="quiz-footer">
        <SubmitButton onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default QuizInterface;