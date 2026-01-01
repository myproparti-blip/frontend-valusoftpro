import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "../components/ui";
import { loginUser } from "../services/auth";

const LoginPage = ({ onLogin }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showCredentials, setShowCredentials] = useState(false);
    const [formData, setFormData] = useState({ clientId: "", username: "", password: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError("");
    }, []);

    const onFinish = useCallback(async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError("");

            const response = await loginUser(formData.clientId, formData.username, formData.password);
            
            ("[LoginPage] 📊 Login response:", {
                message: response.message,
                username: response.username,
                role: response.role,
                clientId: response.clientId,
                hasToken: !!response.token,
                hasRefreshToken: !!response.refreshToken,
            });

            localStorage.setItem("user", JSON.stringify(response));
            ("[LoginPage] ✅ User stored in localStorage");

            if (onLogin) {
                onLogin(response);
            }

            setSuccess(`Welcome back, ${response.username}!`);

            setTimeout(() => {
                navigate("/dashboard");
            }, 500);

        } catch (error) {
            const errorMessage = error?.message ||
                error?.response?.data?.message ||
                "Invalid clientId, username, or password";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [formData.clientId, formData.username, formData.password, navigate, onLogin]);


    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
            <Card className="w-full max-w-md shadow-sm overflow-hidden border border-gray-300">
                <CardHeader className="text-center space-y-3 bg-gray-100 py-6 border-b border-gray-300">
                    <div className="flex justify-center mb-1">
                        <div className="text-4xl sm:text-5xl">📊</div>
                    </div>
                    <div>
                        <CardTitle className="text-xl sm:text-2xl font-bold text-black">VALUATION</CardTitle>
                        <p className="text-xs sm:text-xs text-gray-700 font-medium mt-1">Enterprise Valuation Management System</p>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-300 rounded">
                            <p className="text-xs text-red-800 font-medium flex items-center gap-2">
                                <span>⚠️</span> {error}
                            </p>
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-green-50 border border-green-300 rounded">
                            <p className="text-xs text-green-800 font-medium flex items-center gap-2">
                                <span>✓</span> {success}
                            </p>
                        </div>
                    )}

                    <form onSubmit={onFinish} className="space-y-4">
                         {/* Client ID Field */}
                         <div className="space-y-1.5">
                             <Label htmlFor="clientId" className="font-semibold text-black flex items-center gap-2 text-sm">
                                 🏢 Client ID
                             </Label>
                             <Input
                                 id="clientId"
                                 name="clientId"
                                 type="text"
                                 placeholder="e.g., client1"
                                 value={formData.clientId}
                                 onChange={handleInputChange}
                                 disabled={loading}
                                 className="pl-3 h-9 font-medium border border-gray-400 focus:border-black focus:ring-0 bg-white text-sm"
                                 required
                             />
                         </div>

                         {/* Username Field */}
                         <div className="space-y-1.5">
                             <Label htmlFor="username" className="font-semibold text-black flex items-center gap-2 text-sm">
                                 <FaEnvelope className="h-3.5 w-3.5" />
                                 Username
                             </Label>
                             <Input
                                 id="username"
                                 name="username"
                                 type="text"
                                 placeholder="Enter your username"
                                 value={formData.username}
                                 onChange={handleInputChange}
                                 disabled={loading}
                                 className="pl-3 h-9 font-medium border border-gray-400 focus:border-black focus:ring-0 bg-white text-sm"
                                 required
                             />
                         </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="font-semibold text-black flex items-center gap-2 text-sm">
                                <FaLock className="h-3.5 w-3.5" />
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="pr-9 h-9 font-medium border border-gray-400 focus:border-black focus:ring-0 bg-white text-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black transition-colors"
                                    disabled={loading}
                                >
                                    {showPassword ? (
                                        <FaEyeSlash className="h-3.5 w-3.5" />
                                    ) : (
                                        <FaEye className="h-3.5 w-3.5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-9 font-semibold text-sm shadow transition-all bg-black hover:bg-gray-900 text-white"
                        >
                            {loading ? "🔄 Signing in..." : "Sign In"}
                        </Button>
                    </form>

                    <div className="text-center pt-2">
                        <p className="text-xs font-medium text-gray-700">PREMIUM ENTERPRISE SOLUTION</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage;
