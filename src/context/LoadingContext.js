import React, { createContext, useContext, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "../redux/slices/loaderSlice";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
    const dispatch = useDispatch();

    const showLoading = useCallback((message = "Loading...") => {
        dispatch(showLoader(message));
    }, [dispatch]);

    const hideLoading = useCallback(() => {
        dispatch(hideLoader());
    }, [dispatch]);

    // Memoize context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        showLoading,
        hideLoading,
    }), [showLoading, hideLoading]);

    return (
        <LoadingContext.Provider value={value}>
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error("useLoading must be used within a LoadingProvider");
    }
    return context;
};
