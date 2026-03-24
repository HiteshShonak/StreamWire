import React from 'react';

const isDev = import.meta.env.DEV;

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(_error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0a0a0a',
                    color: '#ffffff',
                    padding: '2rem'
                }}>
                    <div style={{
                        maxWidth: '600px',
                        textAlign: 'center'
                    }}>
                        <h1 style={{
                            fontSize: '3rem',
                            fontWeight: 'bold',
                            marginBottom: '1rem',
                            background: 'linear-gradient(to right, #ef4444, #dc2626)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Oops! Something went wrong
                        </h1>

                        <p style={{
                            color: '#9ca3af',
                            marginBottom: '2rem',
                            fontSize: '1.125rem'
                        }}>
                            We encountered an unexpected error. Don't worry, your data is safe.
                        </p>

                        <button
                            onClick={this.handleReset}
                            style={{
                                padding: '0.75rem 2rem',
                                background: '#ffffff',
                                color: '#000000',
                                border: 'none',
                                borderRadius: '9999px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#e5e5e5'}
                            onMouseOut={(e) => e.target.style.background = '#ffffff'}
                        >
                            Reload Page
                        </button>

                        {isDev && this.state.error && (
                            <details style={{
                                marginTop: '2rem',
                                textAlign: 'left',
                                background: '#18181b',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #27272a'
                            }}>
                                <summary style={{
                                    cursor: 'pointer',
                                    color: '#ef4444',
                                    fontWeight: '600',
                                    marginBottom: '0.5rem'
                                }}>
                                    Error Details (Dev Mode)
                                </summary>
                                <pre style={{
                                    fontSize: '0.875rem',
                                    overflow: 'auto',
                                    color: '#d4d4d8'
                                }}>
                                    {this.state.error && this.state.error.toString()}
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
