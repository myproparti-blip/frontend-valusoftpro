import React, { useState, useEffect, useLayoutEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { createBill, updateBill, getBillById } from "../services/billService";
import { useNotification } from "../context/NotificationContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { FaFileInvoice, FaArrowLeft } from "react-icons/fa";

const BillForm = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { showError, showSuccess } = useNotification();
    const role = user?.role || "";
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState("");
    const [formErrors, setFormErrors] = useState({});
    const [selectedRows, setSelectedRows] = useState([]);

    // Check authorization
    useLayoutEffect(() => {
        if (role !== "manager" && role !== "admin") {
            setAuthError("You do not have permission to create or edit bills. Only managers and admin can access this feature.");
        }
    }, [role]);

    // Load selected rows from navigation state or localStorage
    useLayoutEffect(() => {
        const rows = location.state?.selectedRows ||
            JSON.parse(localStorage.getItem('selectedValuationForms')) || [];
        setSelectedRows(rows);
    }, [location.state]);

    // State to track fee and lead number for each selected row
    const [selectedRowsData, setSelectedRowsData] = useState({});
    const [items, setItems] = useState([
        {
            particulars: "",
            hsn: "",
            gstRate: 9,
            amount: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            itemTotal: 0,
        },
    ]);

    const [billData, setBillData] = useState({
        billNumber: "",
        billMonth: "",
        billDate: new Date().toISOString().split("T")[0],
        vendorName: "",
        vendorAddress: "",
        vendorPan: "",
        vendorGst: "",
        billToName: "",
        billToAddress: "",
        billToGstin: "",
        billToPan: "",
        otherReference: "",
        billFinancialYear: "",
        bankDetails: {
            beneficiary: "",
            bankName: "",
            accountNo: "",
            ifscCode: "",
        },
        declaration: "",
        signerName: "",
        signatureDate: "",
        place: "",
    });

    // Load bill if editing
    useLayoutEffect(() => {
        if (id) {
            loadBill();
        }
    }, [id]);

    const loadBill = async () => {
        try {
            setLoading(true);
            const response = await getBillById(id);
            if (response.success) {
                setBillData(response.data);
                setItems(response.data.items || []);

                // Load selectedRecords if they exist
                if (response.data.selectedRecords && Array.isArray(response.data.selectedRecords)) {
                    setSelectedRows(response.data.selectedRecords);

                    // Populate selectedRowsData with fee and leadNumber from loaded records
                    const rowsData = {};
                    response.data.selectedRecords.forEach(record => {
                        rowsData[record._id] = {
                            fee: record.fee || "",
                            leadNumber: record.leadNumber || ""
                        };
                    });
                    setSelectedRowsData(rowsData);

                    ("[BillForm] Loaded selectedRecords:", response.data.selectedRecords);
                }
            }
        } catch (err) {
            showError(
                err.response?.data?.message || "Error loading bill"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleBillChange = (e) => {
        const { name, value } = e.target;
        setBillData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleBankDetailsChange = (e) => {
        const { name, value } = e.target;
        setBillData((prev) => ({
            ...prev,
            bankDetails: {
                ...prev.bankDetails,
                [name]: value,
            },
        }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        // Calculate tax amounts
        if (field === "amount" || field === "gstRate") {
            const amount = parseFloat(newItems[index].amount) || 0;
            const gstRate = parseFloat(newItems[index].gstRate) || 0;
            const gstAmount = (amount * gstRate) / 100;

            newItems[index].cgst = gstAmount / 2;
            newItems[index].sgst = gstAmount / 2;
            newItems[index].igst = 0;
            newItems[index].itemTotal = amount + gstAmount;
        }

        setItems(newItems);
    };

    const addItem = () => {
        setItems([
            ...items,
            {
                particulars: "",
                hsn: "",
                gstRate: 9,
                amount: 0,
                cgst: 0,
                sgst: 0,
                igst: 0,
                itemTotal: 0,
            },
        ]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleSelectedRowDataChange = (rowId, field, value) => {
        setSelectedRowsData(prev => ({
            ...prev,
            [rowId]: {
                ...prev[rowId],
                [field]: value
            }
        }));
    };

    // Sync total fee to first item's amount whenever selectedRowsData changes
    useLayoutEffect(() => {
        if (items.length > 0 && selectedRows.length > 0) {
            const totalFee = selectedRows.reduce((sum, row) => {
                return sum + (parseFloat(selectedRowsData[row._id]?.fee) || 0);
            }, 0);

            // Only update if the amount actually changed
            if (items[0].amount !== totalFee) {
                // Update first item's amount with total fee
                const newItems = [...items];
                newItems[0].amount = totalFee;

                // Recalculate tax for first item
                const amount = totalFee;
                const gstRate = parseFloat(newItems[0].gstRate) || 0;
                const gstAmount = (amount * gstRate) / 100;
                newItems[0].cgst = gstAmount / 2;
                newItems[0].sgst = gstAmount / 2;
                newItems[0].igst = 0;
                newItems[0].itemTotal = amount + gstAmount;

                setItems(newItems);
            }
        }
    }, [selectedRowsData, selectedRows]);

    const validateForm = () => {
        const errors = {};
        const errorMessages = [];

        // Validate bill number
        if (!billData.billNumber.trim()) {
            errors.billNumber = "Bill Number is required";
            errorMessages.push("Bill Number is required");
        }

        // Validate bill month
        if (!billData.billMonth.trim()) {
            errors.billMonth = "Bill Month is required";
            errorMessages.push("Bill Month is required");
        }

        // Validate vendor details
        if (!billData.vendorName.trim()) {
            errors.vendorName = "Vendor Name is required";
            errorMessages.push("Vendor Name is required");
        }
        if (!billData.vendorAddress.trim()) {
            errors.vendorAddress = "Vendor Address is required";
            errorMessages.push("Vendor Address is required");
        }

        // Validate bill to details
        if (!billData.billToName.trim()) {
            errors.billToName = "Bill To Name is required";
            errorMessages.push("Bill To Name is required");
        }
        if (!billData.billToAddress.trim()) {
            errors.billToAddress = "Bill To Address is required";
            errorMessages.push("Bill To Address is required");
        }

        // Validate items
        if (!items || items.length === 0) {
            errors.items = "At least one bill item is required";
            errorMessages.push("At least one bill item is required");
        } else {
            const itemErrors = {};
            items.forEach((item, index) => {
                if (!item.particulars.trim()) {
                    itemErrors[index] = "Particulars is required";
                    errorMessages.push(`Item ${index + 1}: Particulars is required`);
                }
                if (item.amount <= 0) {
                    itemErrors[index] = "Amount must be greater than 0";
                    errorMessages.push(`Item ${index + 1}: Amount must be greater than 0`);
                }
            });
            if (Object.keys(itemErrors).length > 0) {
                errors.items = itemErrors;
            }
        }

        setFormErrors(errors);
        return { errors, errorMessages };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const { errors, errorMessages } = validateForm();
        if (errorMessages.length > 0) {
            errorMessages.forEach(error => showError(error));
            return;
        }

        try {
            setLoading(true);

            const submitData = {
                ...billData,
                items,
                selectedRecords: selectedRows.map(row => ({
                    ...row,
                    fee: selectedRowsData[row._id]?.fee || "",
                    leadNumber: selectedRowsData[row._id]?.leadNumber || ""
                }))
            };

            ("[BillForm] Submitting data with selectedRecords:", submitData.selectedRecords);

            let response;
            if (id) {
                response = await updateBill(id, submitData);
            } else {
                response = await createBill(submitData);
            }

            if (response && response.success) {
                showSuccess(id ? "Bill updated successfully!" : "Bill created successfully!");
                navigate("/bills");
            } else {
                showError(response?.message || "Error saving bill");
            }
        } catch (err) {
            console.error("Error saving bill:", err);
            showError(
                err.response?.data?.message || err.message || "Error saving bill"
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading && id) {
        return <div className="text-center py-8">Loading bill...</div>;
    }

    if (authError) {
        return (
            <div className="min-h-screen bg-slate-50 p-4 md:p-6">
                <div className="max-w-7xl mx-auto flex flex-col gap-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate("/bills")}
                            className="h-9 w-9 border border-slate-300 hover:bg-slate-100 hover:border-blue-400 rounded-lg p-0 transition-colors"
                        >
                            <FaArrowLeft className="h-4 w-4 text-slate-700" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                {id ? "Edit Bill" : "Create New Bill"}
                            </h1>
                            <p className="text-xs text-slate-500 mt-1">{id ? "Update bill details" : "Add a new bill to the system"}</p>
                        </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-lg mb-6 shadow-sm">
                        <p className="font-semibold">Authorization Error</p>
                        <p className="text-sm mt-1">{authError}</p>
                    </div>
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
                    onClick={() => navigate("/bills")}
                    className="h-9 w-9 border border-slate-300 hover:bg-slate-100 hover:border-blue-400 rounded-lg p-0 transition-colors"
                >
                    <FaArrowLeft className="h-4 w-4 text-slate-700" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {id ? "Edit Bill" : "Create New Bill"}
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        {id ? "Update bill details" : "Add a new bill to the system"}
                    </p>
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
                                Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            {Object.keys(formErrors).length > 0 ? (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs space-y-2">
                                    <p className="font-semibold">Errors Found:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        {Object.entries(formErrors).map(([key, error]) => (
                                            <li key={key} className="text-xs">
                                                {typeof error === "string"
                                                    ? error
                                                    : `${key}`}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-xs">
                                    <p className="font-semibold">✓ No Errors</p>
                                </div>
                            )}
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
                </div>

                {/* Right Column - Form */}
                <div className="col-span-12 sm:col-span-9 lg:col-span-10">
                    <Card className="border border-slate-200 shadow-sm bg-white rounded-lg overflow-hidden h-full flex flex-col">
                        <CardHeader className="bg-slate-50 text-slate-900 p-4 border-b border-slate-200">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <FaFileInvoice className="h-4 w-4 text-blue-500" />
                                Bill Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 overflow-y-auto flex-1">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Bill Header */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Bill Number
                                        </label>
                                        <Input
                                            type="text"
                                            name="billNumber"
                                            value={billData.billNumber}
                                            onChange={handleBillChange}
                                            placeholder="Auto-generated"
                                            disabled={!!id}
                                            className={formErrors.billNumber ? "border-red-500" : ""}
                                        />
                                        {formErrors.billNumber && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.billNumber}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Bill Month
                                        </label>
                                        <Input
                                            type="text"
                                            name="billMonth"
                                            value={billData.billMonth}
                                            onChange={handleBillChange}
                                            placeholder="e.g., OCTOBER-2025"
                                            className={formErrors.billMonth ? "border-red-500" : ""}
                                        />
                                        {formErrors.billMonth && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.billMonth}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Bill Date
                                        </label>
                                        <Input
                                            type="date"
                                            name="billDate"
                                            value={billData.billDate}
                                            onChange={handleBillChange}
                                        />
                                    </div>
                                </div>

                                {/* Vendor Details */}
                                <div className="border-t pt-4">
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
                                        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                                        Vendor Details
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Vendor Name
                                            </label>
                                            <Input
                                                type="text"
                                                name="vendorName"
                                                value={billData.vendorName}
                                                onChange={handleBillChange}
                                                className={formErrors.vendorName ? "border-red-500" : ""}
                                            />
                                            {formErrors.vendorName && (
                                                <p className="text-red-500 text-xs mt-1">{formErrors.vendorName}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                PAN Number
                                            </label>
                                            <Input
                                                type="text"
                                                name="vendorPan"
                                                value={billData.vendorPan}
                                                onChange={handleBillChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                GST Number
                                            </label>
                                            <Input
                                                type="text"
                                                name="vendorGst"
                                                value={billData.vendorGst}
                                                onChange={handleBillChange}
                                            />
                                        </div>
                                        <div className="md:col-span-1" />
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-1">
                                                Address
                                            </label>
                                            <Textarea
                                                name="vendorAddress"
                                                value={billData.vendorAddress}
                                                onChange={handleBillChange}
                                                rows="3"
                                                className={formErrors.vendorAddress ? "border-red-500" : ""}
                                            />
                                            {formErrors.vendorAddress && (
                                                <p className="text-red-500 text-xs mt-1">{formErrors.vendorAddress}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Bill To Details */}
                                <div className="border-t pt-4">
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
                                        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                                        Bill To (Receiver)
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Name</label>
                                            <Input
                                                type="text"
                                                name="billToName"
                                                value={billData.billToName}
                                                onChange={handleBillChange}
                                                className={formErrors.billToName ? "border-red-500" : ""}
                                            />
                                            {formErrors.billToName && (
                                                <p className="text-red-500 text-xs mt-1">{formErrors.billToName}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">GSTIN</label>
                                            <Input
                                                type="text"
                                                name="billToGstin"
                                                value={billData.billToGstin}
                                                onChange={handleBillChange}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-1">
                                                Address
                                            </label>
                                            <Textarea
                                                name="billToAddress"
                                                value={billData.billToAddress}
                                                onChange={handleBillChange}
                                                rows="3"
                                                className={formErrors.billToAddress ? "border-red-500" : ""}
                                            />
                                            {formErrors.billToAddress && (
                                                <p className="text-red-500 text-xs mt-1">{formErrors.billToAddress}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Bill Items */}
                                <div className="border-t pt-4">
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
                                        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                                        Bill Items
                                    </h2>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-100 border-b border-slate-300">
                                                <tr>
                                                    <th className="px-3 py-2 text-left font-bold text-slate-900">Particulars</th>
                                                    <th className="px-3 py-2 text-left font-bold text-slate-900">HSN/SAC</th>
                                                    <th className="px-3 py-2 text-right font-bold text-slate-900">Amount</th>
                                                    <th className="px-3 py-2 text-right font-bold text-slate-900">GST %</th>
                                                    <th className="px-3 py-2 text-right font-bold text-slate-900">CGST</th>
                                                    <th className="px-3 py-2 text-right font-bold text-slate-900">SGST</th>
                                                    <th className="px-3 py-2 text-right font-bold text-slate-900">Total</th>
                                                    <th className="px-3 py-2 font-bold text-slate-900">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((item, index) => (
                                                    <tr key={index} className="border-b hover:bg-slate-50">
                                                        <td className="px-3 py-2">
                                                            <Input
                                                                type="text"
                                                                value={item.particulars}
                                                                onChange={(e) =>
                                                                    handleItemChange(
                                                                        index,
                                                                        "particulars",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-full"
                                                                placeholder="Service description"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <Input
                                                                type="text"
                                                                value={item.hsn}
                                                                onChange={(e) =>
                                                                    handleItemChange(index, "hsn", e.target.value)
                                                                }
                                                                className="w-full"
                                                                placeholder="HSN/SAC"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <Input
                                                                type="number"
                                                                value={item.amount}
                                                                onChange={(e) =>
                                                                    handleItemChange(
                                                                        index,
                                                                        "amount",
                                                                        parseFloat(e.target.value) || 0
                                                                    )
                                                                }
                                                                className="w-full text-right"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <select
                                                                value={item.gstRate}
                                                                onChange={(e) =>
                                                                    handleItemChange(
                                                                        index,
                                                                        "gstRate",
                                                                        parseFloat(e.target.value) || 0
                                                                    )
                                                                }
                                                                className="w-full border rounded px-2 py-1"
                                                            >
                                                                <option value="0">0%</option>
                                                                <option value="5">5%</option>
                                                                <option value="9">9%</option>
                                                                <option value="12">12%</option>
                                                                <option value="18">18%</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-3 py-2 text-right">
                                                            ₹{item.cgst.toFixed(2)}
                                                        </td>
                                                        <td className="px-3 py-2 text-right">
                                                            ₹{item.sgst.toFixed(2)}
                                                        </td>
                                                        <td className="px-3 py-2 text-right font-semibold">
                                                            ₹{item.itemTotal.toFixed(2)}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeItem(index)}
                                                                className="text-red-600 hover:text-red-800"
                                                                disabled={items.length === 1}
                                                            >
                                                                Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={addItem}
                                        className="mt-4"
                                        variant="outline"
                                    >
                                        Add Item
                                    </Button>
                                </div>

                                {/* Bank Details */}
                                <div className="border-t pt-4">
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
                                        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                                        Bank Details
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Beneficiary Name
                                            </label>
                                            <Input
                                                type="text"
                                                name="beneficiary"
                                                value={billData.bankDetails.beneficiary}
                                                onChange={handleBankDetailsChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Bank Name
                                            </label>
                                            <Input
                                                type="text"
                                                name="bankName"
                                                value={billData.bankDetails.bankName}
                                                onChange={handleBankDetailsChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Account Number
                                            </label>
                                            <Input
                                                type="text"
                                                name="accountNo"
                                                value={billData.bankDetails.accountNo}
                                                onChange={handleBankDetailsChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                IFSC Code
                                            </label>
                                            <Input
                                                type="text"
                                                name="ifscCode"
                                                value={billData.bankDetails.ifscCode}
                                                onChange={handleBankDetailsChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Declaration & Signature */}
                                <div className="border-t pt-4">
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
                                        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                                        Declaration & Signature
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Signer Name
                                            </label>
                                            <Input
                                                type="text"
                                                name="signerName"
                                                value={billData.signerName}
                                                onChange={handleBillChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Signature Date
                                            </label>
                                            <Input
                                                type="date"
                                                name="signatureDate"
                                                value={billData.signatureDate}
                                                onChange={handleBillChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Place</label>
                                            <Input
                                                type="text"
                                                name="place"
                                                value={billData.place}
                                                onChange={handleBillChange}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-1">
                                                Declaration
                                            </label>
                                            <Textarea
                                                name="declaration"
                                                value={billData.declaration}
                                                onChange={handleBillChange}
                                                rows="4"
                                                placeholder="Declaration text..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Selected Rows Table */}
                                {selectedRows.length > 0 && (
                                    <div className="border-t pt-4">
                                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
                                            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                                            Selected Records ({selectedRows.length})
                                        </h2>
                                        <div className="overflow-x-auto rounded-lg border border-slate-300">
                                            <table className="w-full text-sm">
                                                <thead className="bg-slate-100 border-b border-slate-300">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left font-bold text-slate-900">Clnt</th>
                                                        <th className="px-4 py-3 text-left font-bold text-slate-900">Lead Number</th>
                                                        <th className="px-4 py-3 text-left font-bold text-slate-900">Addr</th>
                                                        <th className="px-4 py-3 text-left font-bold text-slate-900">Mobile</th>
                                                        <th className="px-4 py-3 text-left font-bold text-slate-900">Bank</th>
                                                        <th className="px-4 py-3 text-left font-bold text-slate-900">City</th>
                                                        <th className="px-4 py-3 text-left font-bold text-slate-900">Fee</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedRows.map((row, index) => (
                                                        <tr key={index} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                                            <td className="px-4 py-2 font-semibold text-slate-900">{row.clnt}</td>
                                                            <td className="px-4 py-2">
                                                                <input
                                                                    type="text"
                                                                    value={selectedRowsData[row._id]?.leadNumber || ""}
                                                                    onChange={(e) => handleSelectedRowDataChange(row._id, "leadNumber", e.target.value)}
                                                                    placeholder="Enter lead number"
                                                                    className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-2 font-semibold text-slate-700 max-w-xs truncate">{row.addr}</td>
                                                            <td className="px-4 py-2 font-semibold text-slate-700">{row.mobile}</td>
                                                            <td className="px-4 py-2 font-semibold text-slate-700">{row.bank}</td>
                                                            <td className="px-4 py-2 font-semibold text-slate-700">{row.city}</td>
                                                            <td className="px-4 py-2">
                                                                <input
                                                                    type="number"
                                                                    value={selectedRowsData[row._id]?.fee || ""}
                                                                    onChange={(e) => handleSelectedRowDataChange(row._id, "fee", e.target.value)}
                                                                    placeholder="0.00"
                                                                    className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500"
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-slate-100 border-t-2 border-slate-300">
                                                        <td colSpan="6" className="px-4 py-3 text-right font-bold text-slate-900">Total Fee:</td>
                                                        <td className="px-4 py-3 font-bold text-slate-900 bg-blue-50">
                                                            ₹{selectedRows.reduce((sum, row) => sum + (parseFloat(selectedRowsData[row._id]?.fee) || 0), 0).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="border-t pt-6 flex gap-4">
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-md transition-all duration-300"
                                    >
                                        {loading ? "Saving..." : id ? "Update Bill" : "Create Bill"}
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => navigate("/bills")}
                                        variant="outline"
                                        className="font-semibold border border-slate-300 text-slate-900 hover:border-slate-400 hover:bg-slate-50 transition-all duration-300"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BillForm;
