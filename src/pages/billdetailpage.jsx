import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBillById } from "../services/billService";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/card";
import { FaFileInvoice, FaArrowLeft, FaPrint } from "react-icons/fa";

const BillDetailPage = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const role = useMemo(() => user?.role || "", [user?.role]);
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadBill = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getBillById(id);
            if (response.success) {
                setBill(response.data);
            } else {
                setError(response.message || "Error loading bill");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Error loading bill");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadBill();
    }, [loadBill]);

    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block p-3 bg-slate-100 rounded-full mb-4">
                        <FaFileInvoice className="h-8 w-8 text-blue-500" />
                    </div>
                    <p className="text-slate-600 font-semibold">Loading bill...</p>
                </div>
            </div>
        );
    }

    const ErrorState = ({ message }) => (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
                <div className="flex items-center gap-3 mb-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate("/bills")}
                        className="h-9 w-9 border border-slate-300 hover:bg-slate-100 hover:border-blue-500 rounded-lg p-0 transition-colors"
                    >
                        <FaArrowLeft className="h-4 w-4 text-slate-700" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bill Details</h1>
                        <p className="text-xs text-slate-500 mt-1">View bill information</p>
                    </div>
                </div>
                {message && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-lg mb-6 shadow-sm">
                        <p className="font-semibold">Error</p>
                        <p className="text-sm mt-1">{message}</p>
                    </div>
                )}
            </div>
        </div>
    );
    if (error) {
        return <ErrorState message={error} />;
    }

    if (!bill) {
        return (
            <div className="min-h-screen bg-slate-50 p-4 md:p-6">
                <div className="max-w-7xl mx-auto flex flex-col gap-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate("/bills")}
                            className="h-9 w-9 border border-slate-300 hover:bg-slate-100 hover:border-blue-500 rounded-lg p-0 transition-colors"
                        >
                            <FaArrowLeft className="h-4 w-4 text-slate-700" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bill Details</h1>
                            <p className="text-xs text-slate-500 mt-1">View bill information</p>
                        </div>
                    </div>
                    <div className="text-center py-16">
                        <div className="mb-4 flex justify-center">
                            <div className="p-4 bg-slate-100 rounded-full">
                                <FaFileInvoice className="h-12 w-12 text-blue-500" />
                            </div>
                        </div>
                        <p className="text-slate-600 font-semibold text-lg">Bill not found</p>
                        <Button onClick={() => navigate("/bills")} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-300">
                            <FaArrowLeft className="h-4 w-4 mr-2" />
                            Back to Bills
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const totalItems = bill.items?.length || 0;
    const totalAmount = bill.totalAmount || 0;
    const totalCgst = bill.totalCgst || 0;
    const totalSgst = bill.totalSgst || 0;
    const totalIgst = bill.totalIgst || 0;
    const totalGst = totalCgst + totalSgst + totalIgst;
    const grandTotal = bill.grandTotal || 0;

    // Calculate totals from items for verification
    const calculatedTotals = bill.items?.reduce((acc, item) => {
        acc.totalAmount += item.amount || 0;
        acc.totalCgst += item.cgst || 0;
        acc.totalSgst += item.sgst || 0;
        acc.totalItemTotal += item.itemTotal || 0;
        return acc;
    }, { totalAmount: 0, totalCgst: 0, totalSgst: 0, totalItemTotal: 0 });

    return (
        <div className="min-h-screen bg-slate-50 p-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate("/bills")}
                    className="h-9 w-9 border border-slate-300 hover:bg-slate-100 hover:border-blue-500 rounded-lg p-0 transition-colors"
                >
                    <FaArrowLeft className="h-4 w-4 text-slate-700" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bill Details</h1>
                    <p className="text-xs text-slate-500 mt-1">Bill No. {bill.billNumber}</p>
                </div>
                <Button
                    onClick={handlePrint}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-300"
                >
                    <FaPrint className="h-4 w-4 mr-2" />
                    Print / PDF
                </Button>
            </div>

            {/* Main Content - 2-Column Layout (Full Height Optimized) */}
             <div className="grid grid-cols-12 gap-4 h-[calc(100vh-140px)]">
                 {/* Left Column - Stats & Form Info */}
                 <div className="col-span-12 sm:col-span-3 lg:col-span-2 flex flex-col gap-4 overflow-y-auto">
                     {/* Stats Card */}
                     <Card className="border border-slate-200 bg-white rounded-lg overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all h-auto">
                         <CardHeader className="bg-slate-50 text-slate-900 p-4 border-b border-slate-200">
                             <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900">
                                 <FaFileInvoice className="h-4 w-4 text-blue-500" />
                                 Summary
                             </CardTitle>
                         </CardHeader>
                         <CardContent className="p-4 space-y-3">
                             <div className="space-y-1">
                                 <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Bill Number</p>
                                 <p className="text-sm font-medium text-slate-900">{bill.billNumber}</p>
                             </div>
                             <div className="border-t border-slate-200"></div>
                             <div className="space-y-1">
                                 <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Bill Month</p>
                                 <p className="text-sm font-medium text-slate-900">{bill.billMonth}</p>
                             </div>
                             <div className="border-t border-slate-200"></div>
                             <div className="space-y-1">
                                 <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Bill Date</p>
                                 <p className="text-sm font-medium text-slate-900">{bill.billDate}</p>
                             </div>
                             <div className="border-t border-slate-200"></div>
                             <div className="space-y-1">
                                 <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Total Items</p>
                                 <p className="text-sm font-medium text-slate-900">{totalItems}</p>
                             </div>
                             <div className="border-t border-slate-200"></div>
                             <div className="space-y-1">
                                 <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Grand Total</p>
                                 <p className="text-lg font-bold text-blue-600">₹{grandTotal?.toFixed(2) || "0.00"}</p>
                             </div>
                         </CardContent>
                     </Card>

                     {/* Form Info Card */}
                     <Card className="border border-slate-200 bg-white rounded-lg overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all h-auto">
                         <CardHeader className="bg-slate-50 text-slate-900 p-4 border-b border-slate-200">
                             <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900">
                                 <FaFileInvoice className="h-4 w-4 text-blue-500" />
                                 Form Info
                             </CardTitle>
                         </CardHeader>
                         <CardContent className="p-4 space-y-4">
                             <div className="space-y-1">
                                 <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">BY</p>
                                 <p className="text-sm font-semibold text-slate-900">{user?.name || user?.email || "admin"}</p>
                             </div>
                             <div className="space-y-1">
                                 <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">DAY</p>
                                 <p className="text-sm font-semibold text-slate-900">
                                     {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                                 </p>
                             </div>
                             <div className="space-y-1">
                                 <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">DATE TIME</p>
                                 <p className="text-sm font-semibold text-slate-900">
                                     {new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })},&nbsp;
                                     {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                                 </p>
                             </div>
                             <div className="space-y-1">
                                 <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">ID</p>
                                 <p className="text-sm font-mono bg-slate-50 border border-slate-300 px-3 py-2 rounded text-slate-700 truncate">
                                     BILL-{bill.billNumber ? bill.billNumber.substring(0, 8).toUpperCase() : "N/A"}
                                 </p>
                             </div>
                         </CardContent>
                     </Card>
                 </div>

                {/* Right Column - Invoice Details */}
                <div className="col-span-12 sm:col-span-9 lg:col-span-10">
                    <Card className="border border-slate-200 shadow-sm bg-white rounded-lg overflow-hidden h-full flex flex-col">
                        <CardHeader className="bg-slate-50 text-slate-900 p-4 border-b border-slate-200">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <FaFileInvoice className="h-4 w-4 text-blue-500" />
                                Invoice Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 overflow-y-auto flex-1">


                            <div className="grid grid-cols-3 gap-6 mb-8">
                                 {/* Vendor Details */}
                                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                     <h3 className="font-bold text-sm mb-3 text-slate-900 flex items-center gap-2">
                                         <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                                         VENDOR DETAILS
                                     </h3>
                                     <p className="font-bold text-slate-900 mb-2">{bill.vendorName}</p>
                                     <p className="text-sm whitespace-pre-wrap text-slate-700 mb-2">
                                         {bill.vendorAddress}
                                     </p>
                                     {bill.vendorPan && (
                                         <p className="text-xs mt-2 text-slate-700">
                                             <strong className="font-semibold">PAN:</strong> <span className="font-mono text-slate-800">{bill.vendorPan}</span>
                                         </p>
                                     )}
                                     {bill.vendorGst && (
                                         <p className="text-xs text-slate-700">
                                             <strong className="font-semibold">GST:</strong> <span className="font-mono text-slate-800">{bill.vendorGst}</span>
                                         </p>
                                     )}
                                 </div>

                                 {/* Bill Info */}
                                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                     <div className="mb-4">
                                         <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Bill Number</p>
                                         <p className="font-bold text-slate-900 text-lg mt-1">{bill.billNumber}</p>
                                     </div>
                                     <div className="mb-4">
                                         <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Bill Month</p>
                                         <p className="font-semibold text-slate-800 mt-1">{bill.billMonth}</p>
                                     </div>
                                     <div>
                                         <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Bill Date</p>
                                         <p className="font-semibold text-slate-800 mt-1">{bill.billDate}</p>
                                     </div>
                                 </div>

                                 {/* Bill To Details */}
                                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                     <h3 className="font-bold text-sm mb-3 text-slate-900 flex items-center gap-2">
                                         <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                                         BILL TO (RECEIVER)
                                     </h3>
                                     <p className="font-bold text-slate-900 mb-2">{bill.billToName}</p>
                                     <p className="text-sm whitespace-pre-wrap text-slate-700 mb-2">
                                         {bill.billToAddress}
                                     </p>
                                     {bill.billToGstin && (
                                         <p className="text-xs mt-2 text-slate-700">
                                             <strong className="font-semibold">GSTIN:</strong> <span className="font-mono text-slate-800">{bill.billToGstin}</span>
                                         </p>
                                     )}
                                 </div>
                             </div>

                            {/* Items Table */}
                            <div className="mb-8">
                                 <h3 className="font-bold mb-4 text-slate-900 flex items-center gap-2">
                                     <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                                     PARTICULARS
                                 </h3>
                                <table className="w-full border border-slate-300">
                                    <thead>
                                        <tr className="bg-slate-100 border-b border-slate-300">
                                            <th className="border border-slate-300 px-4 py-3 text-left text-sm font-bold text-slate-900">
                                                Particulars
                                            </th>
                                            <th className="border border-slate-300 px-4 py-3 text-left text-sm font-bold text-slate-900">
                                                HSN/SAC
                                            </th>
                                            <th className="border border-slate-300 px-4 py-3 text-right text-sm font-bold text-slate-900">
                                                Amount
                                            </th>
                                            <th className="border border-slate-300 px-4 py-3 text-right text-sm font-bold text-slate-900">
                                                GST %
                                            </th>
                                            <th className="border border-slate-300 px-4 py-3 text-right text-sm font-bold text-slate-900">
                                                CGST
                                            </th>
                                            <th className="border border-slate-300 px-4 py-3 text-right text-sm font-bold text-slate-900">
                                                SGST
                                            </th>
                                            <th className="border border-slate-300 px-4 py-3 text-right text-sm font-bold text-slate-900">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bill.items?.map((item, index) => (
                                             <tr key={index} className="border-b border-slate-200 hover:bg-slate-50 transition-colors duration-200">
                                                 <td className="border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">
                                                     {item.particulars}
                                                 </td>
                                                 <td className="border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">{item.hsn}</td>
                                                 <td className="border border-slate-300 px-4 py-3 text-right text-sm font-semibold text-slate-700">
                                                     ₹{item.amount?.toFixed(2) || "0.00"}
                                                 </td>
                                                 <td className="border border-slate-300 px-4 py-3 text-right text-sm font-semibold text-slate-700">
                                                     {item.gstRate}%
                                                 </td>
                                                 <td className="border border-slate-300 px-4 py-3 text-right text-sm font-semibold text-slate-700">
                                                     ₹{item.cgst?.toFixed(2) || "0.00"}
                                                 </td>
                                                 <td className="border border-slate-300 px-4 py-3 text-right text-sm font-semibold text-slate-700">
                                                     ₹{item.sgst?.toFixed(2) || "0.00"}
                                                 </td>
                                                 <td className="border border-slate-300 px-4 py-3 text-right text-sm font-bold text-blue-600">
                                                     ₹{item.itemTotal?.toFixed(2) || "0.00"}
                                                 </td>
                                             </tr>
                                         ))}
                                        {/* Totals Row */}
                                        <tr className="bg-slate-100 border-t-2 border-slate-400">
                                            <td colSpan="2" className="border border-slate-300 px-4 py-3 text-right text-sm font-bold text-slate-900">
                                                TOTAL
                                            </td>
                                            <td className="border border-slate-300 px-4 py-3 text-right text-sm font-bold text-slate-900">
                                                ₹{calculatedTotals?.totalAmount.toFixed(2) || "0.00"}
                                            </td>
                                            <td className="border border-slate-300 px-4 py-3 text-right text-sm font-bold text-slate-900">
                                                -
                                            </td>
                                            <td className="border border-slate-300 px-4 py-3 text-right text-sm font-bold text-slate-900">
                                                ₹{calculatedTotals?.totalCgst.toFixed(2) || "0.00"}
                                            </td>
                                            <td className="border border-slate-300 px-4 py-3 text-right text-sm font-bold text-slate-900">
                                                ₹{calculatedTotals?.totalSgst.toFixed(2) || "0.00"}
                                            </td>
                                            <td className="border border-slate-300 px-4 py-3 text-right text-sm font-bold text-blue-600">
                                                ₹{calculatedTotals?.totalItemTotal.toFixed(2) || "0.00"}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Tax Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* Left side - empty for layout */}
                                <div></div>

                                {/* Tax Summary Table */}
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <h3 className="font-bold mb-4 text-slate-900 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                                        TAX SUMMARY
                                    </h3>
                                    <table className="w-full">
                                        <tbody>
                                            <tr className="border-b border-slate-200">
                                                <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                                                    Total Amount
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                                                    ₹{totalAmount?.toFixed(2) || "0.00"}
                                                </td>
                                            </tr>
                                            <tr className="border-b border-slate-200">
                                                <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                                                    CGST (9%)
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                                                    ₹{totalCgst?.toFixed(2)}
                                                </td>
                                            </tr>
                                            <tr className="border-b border-slate-200">
                                                <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                                                    SGST (9%)
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                                                    ₹{totalSgst?.toFixed(2)}
                                                </td>
                                            </tr>
                                            <tr className="border-b border-slate-200">
                                                <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                                                    IGST (18%)
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                                                    ₹{totalIgst?.toFixed(2)}
                                                </td>
                                            </tr>
                                            <tr className="bg-blue-500">
                                                <td className="px-4 py-3 text-sm font-bold text-white">GRAND TOTAL</td>
                                                <td className="px-4 py-3 text-right text-lg font-bold text-white">
                                                    ₹{grandTotal?.toFixed(2) || "0.00"}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Bank Details */}
                             {bill.bankDetails?.bankName && (
                                 <div className="border-t pt-6 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                     <h3 className="font-bold mb-4 text-slate-900 flex items-center gap-2">
                                         <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                                         BANK DETAILS
                                     </h3>
                                     <table className="text-sm w-full">
                                         <tbody>
                                             {bill.bankDetails?.beneficiary && (
                                                 <tr className="border-b border-slate-200">
                                                     <td className="font-semibold pr-4 py-2 text-slate-700">Beneficiary</td>
                                                     <td className="py-2 text-slate-700">{bill.bankDetails.beneficiary}</td>
                                                 </tr>
                                             )}
                                             {bill.bankDetails?.bankName && (
                                                 <tr className="border-b border-slate-200">
                                                     <td className="font-semibold pr-4 py-2 text-slate-700">Bank Name</td>
                                                     <td className="py-2 text-slate-700">{bill.bankDetails.bankName}</td>
                                                 </tr>
                                             )}
                                             {bill.bankDetails?.accountNo && (
                                                 <tr className="border-b border-slate-200">
                                                     <td className="font-semibold pr-4 py-2 text-slate-700">Account No.</td>
                                                     <td className="py-2 text-slate-700 font-mono">{bill.bankDetails.accountNo}</td>
                                                 </tr>
                                             )}
                                             {bill.bankDetails?.ifscCode && (
                                                 <tr>
                                                     <td className="font-semibold pr-4 py-2 text-slate-700">IFSC Code</td>
                                                     <td className="py-2 text-slate-700 font-mono">{bill.bankDetails.ifscCode}</td>
                                                 </tr>
                                             )}
                                         </tbody>
                                     </table>
                                 </div>
                             )}

                            {/* Declaration */}
                             {bill.declaration && (
                                 <div className="border-t pt-6 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                     <p className="text-sm italic text-slate-700 font-semibold">
                                         <strong className="text-slate-900">Declaration:</strong> {bill.declaration}
                                     </p>
                                 </div>
                             )}

                            {/* Selected Records Table */}
                             {bill.selectedRecords && bill.selectedRecords.length > 0 && (
                                 <div className="mt-8 pt-6 border-t border-slate-200">
                                     <h3 className="font-bold mb-4 text-slate-900 flex items-center gap-2">
                                         <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                                         SELECTED RECORDS
                                     </h3>
                                     <table className="w-full border border-slate-300">
                                         <thead>
                                             <tr className="bg-slate-100 border-b border-slate-300">
                                                 <th className="border border-slate-300 px-4 py-3 text-left text-sm font-bold text-slate-900">
                                                     Clnt
                                                 </th>
                                                 <th className="border border-slate-300 px-4 py-3 text-left text-sm font-bold text-slate-900">
                                                     Lead Number
                                                 </th>
                                                 <th className="border border-slate-300 px-4 py-3 text-left text-sm font-bold text-slate-900">
                                                     Addr
                                                 </th>
                                                 <th className="border border-slate-300 px-4 py-3 text-left text-sm font-bold text-slate-900">
                                                     Mobile
                                                 </th>
                                                 <th className="border border-slate-300 px-4 py-3 text-left text-sm font-bold text-slate-900">
                                                     Bank
                                                 </th>
                                                 <th className="border border-slate-300 px-4 py-3 text-left text-sm font-bold text-slate-900">
                                                     City
                                                 </th>
                                                 <th className="border border-slate-300 px-4 py-3 text-right text-sm font-bold text-slate-900">
                                                     Fee
                                                 </th>
                                             </tr>
                                         </thead>
                                         <tbody>
                                             {bill.selectedRecords.map((record, index) => (
                                                 <tr key={index} className="border-b border-slate-200 hover:bg-slate-50 transition-colors duration-200">
                                                     <td className="border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">
                                                         {record.clnt}
                                                     </td>
                                                     <td className="border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">
                                                         {record.leadNumber}
                                                     </td>
                                                     <td className="border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 max-w-xs truncate">
                                                         {record.addr}
                                                     </td>
                                                     <td className="border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">
                                                         {record.mobile}
                                                     </td>
                                                     <td className="border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">
                                                         {record.bank}
                                                     </td>
                                                     <td className="border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">
                                                         {record.city}
                                                     </td>
                                                     <td className="border border-slate-300 px-4 py-3 text-right text-sm font-semibold text-slate-700">
                                                         ₹{parseFloat(record.fee || 0).toFixed(2)}
                                                     </td>
                                                 </tr>
                                             ))}
                                             {/* Total Fee Row */}
                                             <tr className="bg-slate-100 border-t-2 border-slate-400">
                                                 <td colSpan="6" className="border border-slate-300 px-4 py-3 text-right text-sm font-bold text-slate-900">
                                                     TOTAL FEE
                                                 </td>
                                                 <td className="border border-slate-300 px-4 py-3 text-right text-sm font-bold text-blue-600">
                                                     ₹{bill.selectedRecords.reduce((sum, record) => sum + (parseFloat(record.fee || 0)), 0).toFixed(2)}
                                                 </td>
                                             </tr>
                                         </tbody>
                                     </table>
                                 </div>
                             )}

                            {/* Signature Section */}
                            <div className="border-t pt-6 grid grid-cols-3 gap-8 mt-8">
                                <div></div>
                                <div></div>
                                <div className="text-center">
                                    <div className="border-t-2 border-black pt-2 mb-2">
                                        Seal & Signature
                                    </div>
                                    {bill.signerName && (
                                        <p className="text-sm font-semibold">{bill.signerName}</p>
                                    )}
                                    {bill.place && <p className="text-xs text-gray-600">{bill.place}</p>}
                                    {bill.signatureDate && (
                                        <p className="text-xs text-gray-600">{bill.signatureDate}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0.4in;
                        margin-top: 0;
                        margin-bottom: 0;
                    }
                    
                    /* Hide browser header, footer, and default print elements */
                    @page {
                        @top-left {
                            content: '';
                        }
                        @top-center {
                            content: '';
                        }
                        @top-right {
                            content: '';
                        }
                        @bottom-left {
                            content: '';
                        }
                        @bottom-center {
                            content: '';
                        }
                        @bottom-right {
                            content: '';
                        }
                    }
                    
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    html {
                        width: 100%;
                        height: 100%;
                        margin: 0;
                        padding: 0;
                    }
                    
                    body {
                        background: white !important;
                        color: #1f2937;
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        font-size: 11px;
                        line-height: 1.4;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: flex-start;
                    }
                    
                    /* Main container with outer border */
                     div.min-h-screen.bg-slate-50.p-4 {
                         width: 100%;
                         height: auto;
                         background: white !important;
                         padding: 20px !important;
                         margin: 0;
                         display: block;
                         border: 2px solid #000;
                         box-sizing: border-box;
                         page-break-inside: avoid;
                     }
                    
                    /* Hide all print headers and footers */
                    body::before,
                    body::after {
                        display: none !important;
                    }
                    
                    /* Hide header and navigation */
                    .flex.items-center.gap-3.mb-4,
                    header {
                        display: none !important;
                    }
                    
                    /* Hide sidebar on print */
                    .col-span-12.sm\\:col-span-3.lg\\:col-span-2 {
                        display: none !important;
                    }
                    
                    /* Main content full width */
                    .col-span-12.sm\\:col-span-9.lg\\:col-span-10 {
                        grid-column: span 12 !important;
                        max-width: 100%;
                    }
                    
                    /* Grid layout */
                    .grid.grid-cols-12 {
                        display: block !important;
                        height: auto !important;
                        gap: 0 !important;
                    }
                    
                    .grid {
                        display: block !important;
                    }
                    
                    .grid.grid-cols-3 {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr 1fr !important;
                        gap: 12px !important;
                        margin-bottom: 20px !important;
                    }
                    
                    .grid.grid-cols-1.md\\:grid-cols-2 {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr !important;
                        gap: 20px !important;
                    }
                    
                    /* Card styling */
                    [class*="Card"] {
                        break-inside: avoid;
                        page-break-inside: avoid;
                        box-shadow: none !important;
                        border: 1px solid #d1d5db !important;
                        margin-bottom: 0 !important;
                    }
                    
                    .bg-white {
                        background: white !important;
                    }
                    
                    .overflow-y-auto,
                    .h-full,
                    .h-\\[calc\\(100vh-140px\\)\\],
                    .flex-1 {
                        overflow: visible !important;
                        height: auto !important;
                    }
                    
                    /* Invoice heading - hide in print */
                    h2.text-3xl {
                        display: none !important;
                    }
                    
                    h3 {
                        font-size: 13px !important;
                        font-weight: 800 !important;
                        margin-bottom: 16px !important;
                        margin-top: 0 !important;
                        text-transform: uppercase;
                        letter-spacing: 0.8px;
                        color: #000 !important;
                    }
                    
                    /* Detail boxes */
                     .bg-slate-50 {
                         background-color: #f3f4f6 !important;
                     }
                     
                     .border-slate-200 {
                         border-color: #d1d5db !important;
                     }
                    
                    .rounded-lg {
                        border-radius: 4px !important;
                    }
                    
                    .p-4 {
                        padding: 14px !important;
                    }
                    
                    .p-6 {
                        padding: 18px !important;
                    }
                    
                    /* Section dividers */
                    .border-b-2 {
                        border-bottom: 2px solid #000 !important;
                        padding-bottom: 16px !important;
                        margin-bottom: 24px !important;
                    }
                    
                    .border-t {
                        border-top: 2px solid #000 !important;
                        page-break-inside: avoid;
                        margin-top: 24px !important;
                        padding-top: 24px !important;
                    }
                    
                    .border-b {
                        border-bottom: 1px solid #d1d5db !important;
                    }
                    
                    /* Table styling - professional appearance */
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        break-inside: avoid;
                        page-break-inside: avoid;
                        margin: 20px 0;
                        border: 1px solid #000 !important;
                    }
                    
                    table.w-full {
                        width: 100%;
                    }
                    
                    th {
                        background-color: #2d3748 !important;
                        color: white !important;
                        font-weight: 700 !important;
                        text-align: left;
                        padding: 12px 10px !important;
                        border: 1px solid #000 !important;
                        font-size: 11px;
                        letter-spacing: 0.3px;
                    }
                    
                    td {
                        border: 1px solid #d1d5db !important;
                        padding: 10px !important;
                        text-align: left;
                        font-size: 10px;
                        line-height: 1.5;
                    }
                    
                    thead {
                        background-color: #2d3748 !important;
                    }
                    
                    tbody tr {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                    
                    tbody tr:nth-child(even) {
                        background-color: #f9fafb !important;
                    }
                    
                    .bg-slate-100 {
                         background-color: #f3f4f6 !important;
                         font-weight: 600;
                     }
                    
                    .bg-blue-500 {
                        background-color: #1f2937 !important;
                        color: white !important;
                    }
                    
                    /* Text alignment for amounts */
                    td.text-right {
                        text-align: right !important;
                    }
                    
                    th.text-right {
                        text-align: right !important;
                    }
                    
                    /* Font weights and colors */
                    .font-bold {
                        font-weight: 700 !important;
                    }
                    
                    .font-semibold {
                        font-weight: 600 !important;
                    }
                    
                    .text-slate-900,
                     .text-black {
                         color: #000 !important;
                     }
                     
                     .text-slate-700 {
                         color: #374151 !important;
                     }
                    
                    .text-blue-600,
                    .text-blue-500 {
                        color: #1f2937 !important;
                    }
                    
                    .text-white {
                        color: white !important;
                    }
                    
                    /* Spacing adjustments */
                    .mb-8 {
                        margin-bottom: 24px !important;
                    }
                    
                    .mb-6 {
                        margin-bottom: 20px !important;
                    }
                    
                    .mb-4 {
                        margin-bottom: 12px !important;
                    }
                    
                    .mb-3 {
                        margin-bottom: 10px !important;
                    }
                    
                    .mb-2 {
                        margin-bottom: 6px !important;
                    }
                    
                    .mt-8 {
                        margin-top: 24px !important;
                    }
                    
                    .pt-6 {
                        padding-top: 20px !important;
                    }
                    
                    .pb-6 {
                        padding-bottom: 20px !important;
                    }
                    
                    /* Signature section */
                    .grid.grid-cols-3 {
                        grid-template-columns: 1fr 1fr 1fr !important;
                        gap: 24px !important;
                        margin-top: 40px !important;
                    }
                    
                    /* Content visibility */
                    .whitespace-pre-wrap {
                        white-space: pre-wrap !important;
                    }
                    
                    .max-w-xs {
                        max-width: 100% !important;
                    }
                    
                    .truncate {
                        overflow: visible !important;
                        text-overflow: clip !important;
                        white-space: normal !important;
                    }
                    
                    /* Icon styling - hide or simplify */
                    svg {
                        display: none !important;
                    }
                    
                    /* Flex containers */
                    .flex {
                        display: block !important;
                    }
                    
                    .flex-1 {
                        flex: auto !important;
                    }
                    
                    /* Gaps */
                    .gap-3, .gap-2, .gap-6, .gap-8 {
                        gap: 0 !important;
                    }
                    
                    /* Print optimization */
                     .border-slate-300 {
                         border-color: #d1d5db !important;
                     }
                    
                    /* Ensure declaration is visible */
                    .italic {
                        font-style: italic !important;
                    }
                    
                    /* Page break handling */
                    .mt-8 {
                        page-break-inside: avoid;
                    }
                }
            `}</style>
        </div>
    );
};

export default BillDetailPage;
