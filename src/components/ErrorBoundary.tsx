
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Ici, vous pourriez envoyer l'erreur à un service de suivi des erreurs
    // comme Sentry ou LogRocket
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <Alert variant="destructive" className="max-w-lg w-full mb-4">
            <AlertTitle>Une erreur s'est produite</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                L'application a rencontré un problème inattendu. Veuillez réessayer ou contacter le support si le problème persiste.
              </p>
              <pre className="bg-muted/50 p-2 rounded overflow-x-auto text-xs mt-2">
                {error?.message || 'Erreur inconnue'}
              </pre>
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-4">
            <Button onClick={this.handleReset} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Réessayer
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
            >
              Revenir à l'accueil
            </Button>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
