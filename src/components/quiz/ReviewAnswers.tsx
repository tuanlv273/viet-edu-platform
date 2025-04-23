tsx
import React from "react";

interface QuizHistoryItem {
  question: string;
  userAnswer: string | string[]; // Can be a string or an array of strings for multiple choice
  options?: {id: string, content: string}[];
}

interface CorrectAnswer {
  [questionId: string]: string | string[];
}

interface ReviewAnswersProps {
  quizHistory: QuizHistoryItem[];
  correctAnswers: CorrectAnswer;
}

const ReviewAnswers: React.FC<ReviewAnswersProps> = ({
  quizHistory,
  correctAnswers,
}) => {
  return (
    <div>
      <h2>Review Answers</h2>
      {quizHistory.map((item, index) => (
        <div
          key={index}
          style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "10px" }}
        >
          <p>
            <strong>Question {index + 1}:</strong> {item.question}
          </p>
          <p>
            <strong>Your Answer:</strong>{" "}
            {Array.isArray(item.userAnswer) ? item.userAnswer.join(", ") : item.userAnswer}
          </p>
          <p>
            <strong>Correct Answer:</strong>{" "}
            {Array.isArray(correctAnswers[item.question]) ? correctAnswers[item.question].join(", ") : correctAnswers[item.question]}
          </p>
          <p
            style={{ color: JSON.stringify(item.userAnswer) === JSON.stringify(correctAnswers[item.question]) ? "green" : "red" }}
          >
            {JSON.stringify(item.userAnswer) === JSON.stringify(correctAnswers[item.question]) ? "Correct" : "Incorrect"}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ReviewAnswers;