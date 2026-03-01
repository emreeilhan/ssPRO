import React from 'react';

const AUTOSAVE_STORAGE_KEY = 'sspro-project-autosave-v1';
const THEME_STORAGE_KEY = 'sspro-theme';

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected application error.',
    };
  }

  componentDidCatch(error, errorInfo) {
    // Keep details in console for quick debugging while showing a friendly UI in production.
    console.error('Fatal UI error:', error, errorInfo);
  }

  handleResetWorkspace = () => {
    try {
      window.localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    } finally {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            background: '#f5f6f8',
            color: '#111827',
            padding: '24px',
            fontFamily:
              'Manrope, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: 620,
              width: '100%',
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 14,
              boxShadow: '0 14px 36px rgba(17, 24, 39, 0.08)',
              padding: 24,
            }}
          >
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>UI Recovery Mode</h1>
            <p style={{ marginTop: 10, marginBottom: 0, color: '#4b5563', lineHeight: 1.5 }}>
              The app hit an unexpected compatibility/runtime error. You can safely recover by
              clearing local autosave data and reloading.
            </p>
            <pre
              style={{
                marginTop: 14,
                marginBottom: 0,
                fontSize: 13,
                color: '#7f1d1d',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 10,
                padding: 12,
                overflow: 'auto',
              }}
            >
              {this.state.errorMessage}
            </pre>
            <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={this.handleResetWorkspace}
                style={{
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontWeight: 600,
                  background: '#111827',
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                Clear Autosave + Reload
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  border: '1px solid #d1d5db',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontWeight: 600,
                  background: '#ffffff',
                  color: '#111827',
                  cursor: 'pointer',
                }}
              >
                Reload Only
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
