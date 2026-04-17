import React, { useState, useEffect, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function ErrorBoundary({ children }: Props) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true);
      setError(event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    let message = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
    
    try {
      const parsed = JSON.parse(error?.message || '');
      if (parsed.error && parsed.error.includes('insufficient permissions')) {
        message = 'Bạn không có quyền thực hiện thao tác này.';
      }
    } catch (e) {
      // Not a JSON error
    }

    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
        <h2 className="mb-4 text-2xl font-black text-tiktok-magenta">Oops!</h2>
        <p className="mb-6 text-brand-500">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="tiktok-button px-8"
        >
          Tải lại trang
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
