import React, { useState, useEffect, memo, useCallback } from "react";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input, Label } from "./ui";
import { loginUser } from "../services/auth";
import { useNotification } from "../context/NotificationContext";

const LoginModal = memo(({ isOpen, onClose, onLogin }) => {
    const { showError } = useNotification();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ clientId: "", username: "", password: "" });
    const [error, setError] = useState("");
    const [internalOpen, setInternalOpen] = useState(isOpen);

    useEffect(() => {
        // Sync opening from parent, but ignore closing requests if error exists
        if (isOpen && !internalOpen) {
            setInternalOpen(true);
            setError("");
        } else if (!isOpen && internalOpen && !error) {
            // Only close if no error exists
            setInternalOpen(false);
        }
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError("");

            // Custom validation
            if (!formData.clientId.trim()) {
                const errorMsg = "Client ID is required";
                setError(errorMsg);
                showError(errorMsg);
                setLoading(false);
                return;
            }

            if (!formData.username.trim()) {
                const errorMsg = "Username is required";
                setError(errorMsg);
                showError(errorMsg);
                setLoading(false);
                return;
            }

            if (!formData.password.trim()) {
                const errorMsg = "Password is required";
                setError(errorMsg);
                showError(errorMsg);
                setLoading(false);
                return;
            }

            const response = await loginUser(formData.clientId, formData.username, formData.password);

            localStorage.setItem("user", JSON.stringify(response));

            if (onLogin) {
                onLogin(response);
            }

            // Reset form
            setFormData({ clientId: "", username: "", password: "" });
            setInternalOpen(false);
            onClose();

        } catch (error) {
            const errorMessage = error?.message ||
                error?.response?.data?.message ||
                "Invalid clientId, username, or password";
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDialogOpenChange = (open) => {
        // Block closing via X button or outside click if error exists
        if (!open) {
            if (error) {
                return; // Do nothing, keep modal open
            }
            // Allow closing only if no error
            setInternalOpen(false);
            onClose();
        }
    };

    return (
        <Dialog open={internalOpen} onOpenChange={handleDialogOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Login</DialogTitle>
                    <DialogDescription>
                        Enter your credentials to access the dashboard
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800 font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Client ID Field */}
                        <div className="space-y-2">
                            <Label htmlFor="modal-clientId">🏢 Client ID</Label>
                            <Input
                                id="modal-clientId"
                                name="clientId"
                                type="text"
                                placeholder="e.g., client1"
                                value={formData.clientId}
                                onChange={handleInputChange}
                                disabled={loading}
                                required
                            />
                        </div>

                        {/* Username Field */}
                        <div className="space-y-2">
                            <Label htmlFor="modal-username">Username</Label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                                <Input
                                    id="modal-username"
                                    name="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="modal-password">Password</Label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                                <Input
                                    id="modal-password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="pl-10 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#F36E21] transition-colors"
                                    disabled={loading}
                                >
                                    {showPassword ? (
                                        <FaEyeSlash className="h-4 w-4" />
                                    ) : (
                                        <FaEye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-3 justify-end pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? "Signing in..." : "Sign In"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
});

LoginModal.displayName = "LoginModal";

export default LoginModal;
