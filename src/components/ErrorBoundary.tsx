import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardBody, Button } from '@heroui/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary para capturar errores de React y mostrar UI de fallback
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = '/inicio';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
          <Card className="max-w-2xl w-full">
            <CardBody className="p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h1 className="text-3xl font-bold text-red-600 mb-4">
                  Oops! Algo salió mal
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  La aplicación encontró un error inesperado. Por favor, intenta recargar la página.
                </p>

                {this.state.error && (
                  <details className="text-left mb-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <summary className="cursor-pointer font-semibold mb-2">
                      Detalles del error
                    </summary>
                    <pre className="text-sm text-red-600 dark:text-red-400 overflow-auto">
                      {this.state.error.toString()}
                      {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}

                <div className="flex gap-3 justify-center">
                  <Button
                    color="primary"
                    onPress={this.handleReset}
                  >
                    Volver al Inicio
                  </Button>
                  <Button
                    color="default"
                    variant="flat"
                    onPress={() => window.location.reload()}
                  >
                    Recargar Página
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
