tsx
import React, { useState, useEffect } from "react";

interface TimerProps {
  timeInSeconds: number;
  onTimeUp: () => void;
}

const Timer: React.FC<TimerProps> = ({ timeInSeconds, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(timeInSeconds);

  useEffect(() => {
    if (timeLeft === 0) {
      onTimeUp();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;
        if (newTime === 0) {
          onTimeUp();
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onTimeUp]);

  

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div>Time Left: {formatTime(timeLeft)}</div>
  );
};

export default Timer;