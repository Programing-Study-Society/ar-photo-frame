import React from 'react';

const ShareButton = ({ onClick, className }: ButtonProps) => {
  return (
    <button onClick={onClick} className={className}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a3.27 3.27 0 0 0 0-1.39l7-4.11A2.99 2.99 0 1 0 15 5a3 3 0 0 0 .05.54l-7 4.11a3 3 0 1 0 0 4.7l7.05 4.13A3 3 0 1 0 18 16.08z" />
      </svg>
      共有
    </button>
  );
};

export default ShareButton;