tsx
import React, { useState } from 'react';

interface AnswerOption {
  id: string;
  content: string;
  isCorrect?: boolean;
}

interface AnswerOptionsProps {
  options: AnswerOption[];
  onSelect?: (optionId: string) => void;
  selectedOptions?: string[];
  questionType?: 'single' | 'multiple'; 
}

const AnswerOptions: React.FC<AnswerOptionsProps> = ({ options, onSelect, selectedOptions = [], questionType = 'single' }) => {
  const handleSelect = (optionId: string) => {
    if (onSelect) {
      onSelect(optionId);
    }
  };
  return (
    <div>
      {options.map((option) => (
        <div key={option.id} style={{ padding: '10px', margin: '5px 0' }}>
          <label>
            {questionType === 'single' ? (
              <input type="radio" name="answer" value={option.id} checked={selectedOptions.includes(option.id)} onChange={() => handleSelect(option.id)} />
            ) : (
              <input type="checkbox" value={option.id} checked={selectedOptions.includes(option.id)} onChange={() => handleSelect(option.id)} />
            )}
            <span style={{ marginLeft: '10px' }}>{option.content}</span>
          </label>
        </div>
      ))}
    </div>
  );
};

export default AnswerOptions;
