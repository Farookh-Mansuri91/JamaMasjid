
"use client";
import React, { useState } from 'react';

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  const handleReset = () => {
    setHasError(false);
  };

  return (
    <>
      {hasError ? (
        <div className="error-container text-center p-4">
          <h2 className="text-danger">Something went wrong!</h2>
          <p>Please refresh the page or try again later.</p>
          <button className="btn btn-primary" onClick={handleReset}>
            Try Again
          </button>
        </div>
      ) : (
        <ErrorCatcher setError={setHasError}>{children}</ErrorCatcher>
      )}
    </>
  );
};
export default ErrorBoundary;

