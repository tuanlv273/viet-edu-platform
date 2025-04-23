tsx
import React from 'react';

interface ResultDisplayProps {
  score: number;
  totalQuestions: number;
  correctQuestions: number;
  wrongQuestions: number;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  score,
  totalQuestions,
  correctQuestions,
  wrongQuestions,
}) => {
    const pass = score >= totalQuestions / 2
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Kết quả bài kiểm tra</h2>
        <div className="space-y-2">
            <p>Điểm số: <span className="font-medium">{score}</span></p>
            <p>Tổng số câu hỏi: <span className="font-medium">{totalQuestions}</span></p>
            <p>Số câu đúng: <span className="font-medium">{correctQuestions}</span></p>
            <p>Số câu sai: <span className="font-medium">{wrongQuestions}</span></p>
        </div>
        <div className="mt-4">
            <p className={`${pass ? 'text-green-600' : 'text-red-600'}`}>{pass ? "Đạt" : "Không đạt"}</p>
        </div>
    </div>
    );
};

export default ResultDisplay;