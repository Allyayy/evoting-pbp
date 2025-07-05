import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state agar render fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Bisa log error ke service eksternal jika perlu
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, backgroundColor: '#fee', color: '#900' }}>
          <h2>Terjadi kesalahan pada aplikasi.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
          </details>
          <button onClick={() => window.location.reload()}>Muat ulang halaman</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
