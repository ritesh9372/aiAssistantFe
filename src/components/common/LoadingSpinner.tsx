interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

function LoadingSpinner({ size = 'medium', message }: LoadingSpinnerProps) {
  const sizeMap = { small: 20, medium: 36, large: 48 };
  const px = sizeMap[size];

  return (
    <div className="loading-spinner-container">
      <div
        className="loading-spinner"
        style={{ width: px, height: px }}
      />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
}

export default LoadingSpinner;
