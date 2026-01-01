import React, { memo } from 'react';
import { useSelector } from 'react-redux';

// Global style for loader animation - defined once outside component
const loaderStyles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Consistent loader size configuration
const LOADER_SIZE = {
    SPINNER: 'w-20 h-20', // 80px x 80px
    CARD_PADDING: 'p-12',
    ICON_SIZE: 'h-5 w-5'
};

// Memoized spinner SVG to prevent re-renders
const LoaderSpinner = memo(() => (
    <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        style={{
            animation: 'spin 1s linear infinite',
        }}
    >
        <circle
            cx="20"
            cy="20"
            r="18"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="2"
        />
        <circle
            cx="20"
            cy="20"
            r="18"
            stroke="#F36E21"
            strokeWidth="2"
            strokeDasharray="28 112"
            strokeLinecap="round"
        />
    </svg>
));

LoaderSpinner.displayName = "LoaderSpinner";

// Memoized message display component
const LoaderMessage = memo(({ message }) => {
    if (!message) return null;
    return <p className="text-white text-sm font-medium">{message}</p>;
});

LoaderMessage.displayName = "LoaderMessage";

const GlobalLoader = memo(() => {
    const { isLoading, message } = useSelector((state) => state.loader);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <style>{loaderStyles}</style>
            <div className="flex flex-col items-center justify-center gap-3">
                <LoaderSpinner />
                <LoaderMessage message={message} />
            </div>
        </div>
    );
});

GlobalLoader.displayName = "GlobalLoader";

export default GlobalLoader;
