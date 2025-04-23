tsx
import React from 'react';

interface SubmitButtonProps {
  onSubmit: () => void;
    disabled?: boolean;
    label?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ onSubmit, disabled, label = "Nộp bài" }) => {
  return (
    <button
      onClick={onSubmit}
      disabled={disabled}
        type={"button"}
      className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      Nộp bài
    </button>
  );
};
