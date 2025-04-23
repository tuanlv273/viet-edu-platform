tsx
import React from 'react';

interface QuestionData {
  content: string;
  type: 'single-choice' | 'multiple-choice' | 'text'; 
}

interface QuestionDisplayProps {
  questionData: QuestionData;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ questionData }) => {
  return (
    <div className="question-display">
      <p className="text-lg font-medium">{questionData.content}</p>
    </div>
  );
};

export default QuestionDisplay;