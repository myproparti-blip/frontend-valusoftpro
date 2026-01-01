import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAllBills, deleteBill } from "../services/billService";
import { invalidateCache } from "../services/axios";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "../components/ui/dialog";
import Pagination from "../components/Pagination";
import Badge from "../components/ui/badge";
import { AiOutlineEye, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { FaSyncAlt, FaPlus, FaFileInvoice, FaArrowLeft, FaFilePdf } from "react-icons/fa";

const BillsPage = ({ user }) => {
    const navigate = useNavigate();
    const role = useMemo(() => user?.role || "", [user?.role]);
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, billNumber: null });

    const itemsPerPage = 10;

    const loadBills = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            invalidateCache("/bills");
            const response = await getAllBills();
            if (response.success === true && response.data) {
                setBills(response.data);
            } else if (response.success === true) {
                setBills([]);
            } else {
                setError(response.message || "Error loading bills");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Error loading bills");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBills();
    }, [loadBills]);

    const handleDeleteClick = useCallback((billNumber) => {
        setDeleteModal({ isOpen: true, billNumber });
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        try {
            const response = await deleteBill(deleteModal.billNumber);
            if (response.success) {
                setDeleteModal({ isOpen: false, billNumber: null });
                await loadBills();
            } else {
                alert(response.message || "Error deleting bill");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Error deleting bill");
        }
    }, [deleteModal.billNumber, loadBills]);

    const handleDeleteCancel = useCallback(() => {
        setDeleteModal({ isOpen: false, billNumber: null });
    }, []);

    const handleDownloadPDF = useCallback((billNumber) => {
        window.open(`/api/bills/${billNumber}/pdf`, "_blank");
    }, []);





    // Pagination
    const totalPages = Math.ceil(bills.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedBills = bills.slice(startIndex, endIndex);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block p-3 bg-slate-100 rounded-full mb-4">
                        <FaFileInvoice className="h-8 w-8 text-blue-500" />
                    </div>
                    <p className="text-slate-600 font-semibold">Loading bills...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate("/")}
                    className="h-9 w-9 border border-slate-300 hover:bg-slate-100 hover:border-blue-500 rounded-lg p-0 transition-colors"
                >
                    <FaArrowLeft className="h-4 w-4 text-slate-700" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bills Management</h1>
                    <p className="text-xs text-slate-500 mt-1">View and manage all bills</p>
                </div>
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
                                 Stats
                             </CardTitle>
                         </CardHeader>
                         <CardContent className="p-4 space-y-3">
                             <div className="space-y-1">
                                 <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Total Bills</p>
                                 <p className="text-lg font-bold text-slate-900">{bills.length}</p>
                             </div>
                             <div className="border-t border-slate-200"></div>
                             <div className="space-y-1">
                                 <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Page Items</p>
                                 <p className="text-lg font-bold text-slate-900">{paginatedBills.length}</p>
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
                                     FORM-{Math.random().toString(36).substr(2, 8).toUpperCase()}
                                 </p>
                             </div>
                         </CardContent>
                     </Card>

                     {error && (
                         <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                             <p className="font-semibold mb-1">Error</p>
                             <p className="text-xs">{error}</p>
                         </div>
                     )}
                 </div>

                            {/* Right Column - Bills Table */}
                            <div className="col-span-12 sm:col-span-9 lg:col-span-10">
                            <Card className="border border-slate-200 shadow-sm bg-white rounded-lg overflow-hidden h-full flex flex-col">
                            <CardHeader className="bg-slate-50 text-slate-900 p-4 border-b border-slate-200">
                             {/* Title */}
                             <CardTitle className="text-sm font-bold flex items-center gap-2 mb-3">
                                 <FaFileInvoice className="h-4 w-4 text-blue-500" />
                                 Bills List
                             </CardTitle>

                             {/* Action Buttons */}
                             <div className="flex gap-2">
                                 <Button
                                     onClick={loadBills}
                                     className="border border-slate-300 text-slate-900 hover:bg-slate-100 font-semibold transition-all duration-300 whitespace-nowrap"
                                     size="sm"
                                 >
                                     <FaSyncAlt className="h-4 w-4 mr-2" />
                                     Refresh
                                 </Button>
                                 {(role === "manager" || role === "admin") && (
                                     <Button
                                         onClick={() => navigate("/bills/create")}
                                         className="bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-300 whitespace-nowrap"
                                         size="sm"
                                     >
                                         <FaPlus className="h-4 w-4 mr-2" />
                                         Create
                                     </Button>
                                 )}
                            </div>
                        </CardHeader>
                        <CardContent className="overflow-y-auto flex-1">
                        {paginatedBills.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead className="bg-slate-100 border border-slate-300">
                                            <tr>
                                                <th className="border border-slate-300 px-4 py-3 text-center text-xs font-bold text-slate-900">
                                                    Sr.No
                                                </th>
                                                <th className="border border-slate-300 px-4 py-3 text-center text-xs font-bold text-slate-900">
                                                    Date
                                                </th>
                                                <th className="border border-slate-300 px-4 py-3 text-center text-xs font-bold text-slate-900">
                                                    Bill Number
                                                </th>
                                                <th className="border border-slate-300 px-4 py-3 text-center text-xs font-bold text-slate-900">
                                                    Vendor Name
                                                </th>
                                                <th className="border border-slate-300 px-4 py-3 text-center text-xs font-bold text-slate-900">
                                                    Bill To
                                                </th>
                                                <th className="border border-slate-300 px-4 py-3 text-center text-xs font-bold text-slate-900">
                                                    Amount
                                                </th>
                                                <th className="border border-slate-300 px-4 py-3 text-center text-xs font-bold text-slate-900">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedBills.map((bill, index) => (
                                                <tr
                                                    key={bill._id}
                                                    className="border border-slate-300 hover:bg-slate-50 transition-colors duration-200"
                                                >
                                                    <td className="border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-900">
                                                        {startIndex + index + 1}
                                                    </td>
                                                    <td className="border border-slate-300 px-4 py-3 text-center text-sm text-slate-700">
                                                        {bill.billDate || bill.billMonth || "-"}
                                                    </td>
                                                    <td className="border border-slate-300 px-4 py-3 text-center text-sm font-bold text-slate-900">
                                                        <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 rounded border border-slate-300">
                                                            {bill.billNumber}
                                                        </span>
                                                    </td>
                                                    <td className="border border-slate-300 px-4 py-3 text-center text-sm text-slate-700">
                                                        {bill.vendorName}
                                                    </td>
                                                    <td className="border border-slate-300 px-4 py-3 text-center text-sm text-slate-700">
                                                        {bill.billToName}
                                                    </td>
                                                    <td className="border border-slate-300 px-4 py-3 text-center text-sm font-bold text-slate-900">
                                                        ₹{bill.grandTotal?.toFixed(2) || "0.00"}
                                                    </td>
                                                    <td className="border border-slate-300 px-4 py-3 text-center text-sm">
                                                         <div className="flex gap-2 items-center justify-center flex-wrap">
                                                             <button
                                                                 onClick={() =>
                                                                     navigate(`/bills/${bill.billNumber}`)
                                                                 }
                                                                 className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                                                 title="View"
                                                             >
                                                                 <AiOutlineEye size={16} />
                                                             </button>
                                                             {(role === "manager" || role === "admin") && (
                                                                 <>
                                                                     <button
                                                                         onClick={() =>
                                                                             navigate(`/bills/edit/${bill.billNumber}`)
                                                                         }
                                                                         className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all duration-200"
                                                                         title="Review and Update"
                                                                     >
                                                                         <AiOutlineEdit size={16} />
                                                                     </button>
                                                                     <button
                                                                         onClick={() => handleDeleteClick(bill.billNumber)}
                                                                         className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                                         title="Delete"
                                                                     >
                                                                         <AiOutlineDelete size={16} />
                                                                     </button>
                                                                 </>
                                                             )}
                                                         </div>
                                                     </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                                            {totalPages > 1 && (
                                                            <div className="border-t border-slate-300 bg-slate-50 mt-4">
                                                            <Pagination
                                                            currentPage={currentPage}
                                                            totalPages={totalPages}
                                                            onPageChange={setCurrentPage}
                                                            />
                                                            </div>
                                                            )}
                                                            </>
                                                            ) : (
                                                            <div className="text-center py-16">
                                                            <div className="mb-4 flex justify-center">
                                                            <div className="p-4 bg-slate-100 rounded-full">
                                                            <FaFileInvoice className="h-12 w-12 text-blue-500" />
                                                            </div>
                                                            </div>
                                                            <p className="text-slate-600 font-semibold text-lg">No bills found</p>
                                                            <p className="text-slate-500 text-sm mt-1">Try adjusting your search or create a new bill</p>
                                {(role === "manager" || role === "admin") && (
                                    <Button
                                        onClick={() => navigate("/bills/create")}
                                        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-300"
                                    >
                                        <FaPlus className="h-4 w-4 mr-2" />
                                        Create First Bill
                                    </Button>
                                )}
                                </div>
                                )}
                                </CardContent>
                                </Card>
                    </div>
                    </div>

                    {/* Delete Confirmation Modal */}
                    <Dialog open={deleteModal.isOpen} onOpenChange={handleDeleteCancel}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Bill</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this bill? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleDeleteCancel}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BillsPage;
