import React, { lazy, Suspense, useEffect, useState, useCallback, memo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from 'react-redux';
import './globals.css';
import './App.css';
import { NotificationProvider, useNotification } from "./context/NotificationContext";
import { setNotificationHandler, resetUnauthorizedErrorFlag, clearCache } from "./services/axios";
import store from "./redux/store";
import GlobalLoader from "./components/GlobalLoader";

// Lazy load all pages for optimal performance
const LoginPage = lazy(() => import("./pages/login"));
const DashboardPage = lazy(() => import("./pages/dashboard"));
const FormPage = lazy(() => import("./pages/valuationform"));
const EditValuationPage = lazy(() => import("./pages/ubiShop.jsx"));
const BofMaharastraEditForm = lazy(() => import("./pages/bomflat.jsx"));
const UbiApfEditForm = lazy(() => import("./pages/ubiApf.jsx"));
const RajeshHouseEditForm = lazy(() => import("./pages/rajeshHouse.jsx"));
const RajeshBankEditForm = lazy(() => import("./pages/rajeshBank.jsx"));
const RajeshRowHouseEditForm = lazy(() => import("./pages/rajeshRowHouse.jsx"));

const BillsPage = lazy(() => import("./pages/billspage"));
const BillForm = lazy(() => import("./components/BillForm"));
const BillDetailPage = lazy(() => import("./pages/billdetailpage"));

// Memoized global fallback loader component - Optimized for performance
const GlobalFallback = memo(() => (
	<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
		<style>
			{`
              @keyframes spin-fast {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}
		</style>
		<div className="flex flex-col items-center gap-4">
			{/* Optimized lightweight spinner */}
			<svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ animation: 'spin-fast 1s linear infinite' }}>
				<circle cx="20" cy="20" r="18" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" />
				<circle cx="20" cy="20" r="18" stroke="#F36E21" strokeWidth="2" strokeDasharray="28 112" strokeLinecap="round" />
			</svg>
			<p className="text-white text-sm font-medium">Loading</p>
		</div>
	</div>
));

GlobalFallback.displayName = "GlobalFallback";

// Error Boundary for lazy loaded components
const ErrorFallback = memo(() => (
	<div className="fixed inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4">
		<div className="flex flex-col items-center gap-8 max-w-md">
			<div className="relative">
				<div className="relative bg-white/10 backdrop-blur-2xl border border-red-500/20 rounded-3xl p-12 shadow-2xl">
					<div className="text-center space-y-4">
						<h3 className="text-red-400 font-semibold text-lg tracking-wide">Error Loading Page</h3>
						<p className="text-xs text-white/60 font-medium">Please refresh the page</p>
						<button
							onClick={() => window.location.reload()}
							className="mt-4 px-6 py-2 bg-[#F36E21] hover:bg-[#EC5E25] text-white rounded-lg font-semibold transition-colors"
						>
							Refresh
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
));

ErrorFallback.displayName = "ErrorFallback";

// Simple Error Boundary
class SimpleErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	render() {
		if (this.state.hasError) {
			return <ErrorFallback />;
		}
		return this.props.children;
	}
}

const AppContent = memo(function AppContent() {
	const [user, setUser] = useState(() => {
		// Initialize user state synchronously from localStorage
		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			try {
				return JSON.parse(storedUser);
			} catch (e) {
				localStorage.removeItem("user");
			}
		}
		return null;
	});
	const [loading, setLoading] = useState(false);
	const { hideUnauthorizedError, showUnauthorizedError } = useNotification();

	// Initialize notification handler
	useEffect(() => {
		setNotificationHandler({ showUnauthorizedError, hideUnauthorizedError });
	}, [showUnauthorizedError, hideUnauthorizedError]);

	// Memoized login handler
	const handleLogin = useCallback((userData) => {
		setUser(userData);
		localStorage.setItem("user", JSON.stringify(userData));
		clearCache(); // Clear cache to fetch fresh data on login
		hideUnauthorizedError();
		resetUnauthorizedErrorFlag();
	}, [hideUnauthorizedError]);

	// Memoized logout handler
	const handleLogout = useCallback(() => {
		setUser(null);
		localStorage.removeItem("user");
		clearCache(); // Clear all cached data on logout
	}, []);

	// Memoized route components to prevent unnecessary re-renders
	const ProtectedRoute = useCallback(({ children }) => {
		if (loading) return null;
		return children;
	}, [loading]);

	const PublicRoute = useCallback(({ children }) => {
		if (loading) return null;
		return !user ? children : <Navigate to="/dashboard" replace />;
	}, [loading, user]);

	if (loading) return null;

	return (
		<SimpleErrorBoundary>
			<Suspense fallback={<GlobalFallback />}>
				<Routes>
					{/* Root redirect */}
					<Route path="/" element={<Navigate to="/dashboard" replace />} />

					{/* Login - Public Route with Lazy Loading */}
					<Route
						path="/login"
						element={
							<PublicRoute>
								<LoginPage onLogin={handleLogin} />
							</PublicRoute>
						}
					/>

					{/* Dashboard - Protected Route with Lazy Loading */}
					<Route
						path="/dashboard"
						element={
							<ProtectedRoute>
								<DashboardPage user={user} onLogout={handleLogout} onLogin={handleLogin} />
							</ProtectedRoute>
						}
					/>

					{/* Create Form - Protected Route with Lazy Loading */}
					<Route
						path="/valuationform"
						element={
							<ProtectedRoute>
								<FormPage user={user} onLogin={handleLogin} />
							</ProtectedRoute>
						}
					/>

					{/* Edit Form - Protected Route with Lazy Loading */}
					<Route
						path="/valuationeditform/:id"
						element={
							<ProtectedRoute>
								<EditValuationPage user={user} onLogin={handleLogin} />
							</ProtectedRoute>
						}
					/>

					{/* Edit Form - Union Bank - Protected Route with Lazy Loading */}
					<Route
						path="/valuationeditformunion/:id"
						element={
							<ProtectedRoute>
								<EditValuationPage user={user} onLogin={handleLogin} />
							</ProtectedRoute>
						}
					/>

					{/* Edit Form - Bomaharastra - Protected Route with Lazy Loading */}
					<Route
						path="/valuationeditformbomaharastra/:id"
						element={
							<ProtectedRoute>
								<BofMaharastraEditForm user={user} onLogin={handleLogin} />
							</ProtectedRoute>
						}
					/>

					{/* Edit Form - UBI APF - Protected Route with Lazy Loading */}
					<Route
						path="/valuationeditformubiapf/:id"
						element={
							<ProtectedRoute>
								<UbiApfEditForm user={user} onLogin={handleLogin} />
							</ProtectedRoute>
						}
					/>

					{/* Edit Form - Rajesh House - Protected Route with Lazy Loading */}
					<Route
						path="/valuationeditformrajeshhouse/:id"
						element={
							<ProtectedRoute>
								<RajeshHouseEditForm user={user} onLogin={handleLogin} />
							</ProtectedRoute>
						}
					/>

					{/* Edit Form - Rajesh Bank - Protected Route with Lazy Loading */}
					<Route
						path="/valuationeditformrajeshbank/:id"
						element={
							<ProtectedRoute>
								<RajeshBankEditForm user={user} onLogin={handleLogin} />
							</ProtectedRoute>
						}
					/>

					{/* Edit Form - Rajesh Row House - Protected Route with Lazy Loading */}
					<Route
						path="/valuationeditformrajeshrowhouse/:id"
						element={
							<ProtectedRoute>
								<RajeshRowHouseEditForm user={user} onLogin={handleLogin} />
							</ProtectedRoute>
						}
					/>

					{/* Bills - Protected Route with Lazy Loading */}
					<Route
						path="/bills"
						element={
							<ProtectedRoute>
								<BillsPage user={user} onLogin={handleLogin} />
							</ProtectedRoute>
						}
					/>

					{/* Create Bill - Protected Route with Lazy Loading */}
					<Route
						path="/bills/create"
						element={
							<ProtectedRoute>
								<BillForm user={user} onLogin={handleLogin} />
							</ProtectedRoute>
						}
					/>

					{/* Edit Bill - Protected Route with Lazy Loading */}
					<Route
						path="/bills/edit/:id"
						element={
							<ProtectedRoute>
								<BillForm user={user} onLogin={handleLogin} />
							</ProtectedRoute>
						}
					/>

					{/* View Bill - Protected Route with Lazy Loading */}
					<Route
						path="/bills/:id"
						element={
							<ProtectedRoute>
								<BillDetailPage user={user} onLogin={handleLogin} />
							</ProtectedRoute>
						}
					/>

					{/* Catch all - redirect to login */}
					<Route path="*" element={<Navigate to="/login" replace />} />
				</Routes>
			</Suspense>
		</SimpleErrorBoundary>
	);
});

AppContent.displayName = "AppContent";

function App() {
	return (
		<Provider store={store}>
			<NotificationProvider>
				<BrowserRouter>
					<GlobalLoader />
					<AppContent />
				</BrowserRouter>
			</NotificationProvider>
		</Provider>
	);
}

export default App;
