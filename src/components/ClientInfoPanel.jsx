import React, { useCallback } from "react";
import {
    FaBuilding,
    FaUser
} from "react-icons/fa";
import {
    Input,
    Label,
    RadioGroup,
    RadioGroupItem
} from "./ui";

const ClientInfoPanel = ({
    formData,
    bankName,
    city,
    canEdit,
    canEditField,
    handleInputChange,
    handleIntegerInputChange,
    handleLettersOnlyInputChange,
    setBankName,
    setCity,
    setFormData,
    banks = [],
    cities = [],
    dsaNames = [],
    dsa,
    setDsa,
    engineerName,
    setEngineerName,
    engineerNames = []
}) => {
    return (
        <>
            {/* Client Information Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="space-y-1.5">
                    <Label htmlFor="clientName" className="text-xs font-bold text-neutral-900">Name *</Label>
                    <Input
                        id="clientName"
                        placeholder="Client name"
                        name="clientName"
                        value={formData.clientName || ""}
                        onChange={handleInputChange}
                        disabled={!canEditField("clientName")}
                        className="h-8 text-xs rounded-lg border border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="mobileNumber" className="text-xs font-bold text-neutral-900">Mobile *</Label>
                    <Input
                        id="mobileNumber"
                        placeholder="10 digits"
                        name="mobileNumber"
                        value={formData.mobileNumber || ""}
                        onChange={(e) => {
                            handleIntegerInputChange(e, (value) => {
                                setFormData(prev => ({ ...prev, mobileNumber: value }));
                            });
                        }}
                        maxLength={10}
                        inputMode="numeric"
                        disabled={!canEditField("mobileNumber")}
                        className="h-8 text-xs rounded-lg border border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                    />
                </div>

                <div className="lg:col-span-2 space-y-1.5">
                    <Label htmlFor="address" className="text-xs font-bold text-neutral-900">Address *</Label>
                    <Input
                        id="address"
                        placeholder="Complete address"
                        name="address"
                        value={formData.address || ""}
                        onChange={handleInputChange}
                        disabled={!canEditField("address")}
                        className="h-8 text-xs w-full rounded-lg border border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                    />
                </div>
            </div>

            {/* Bank Section */}
            <div className="space-y-2">
                <Label className="text-sm font-bold text-neutral-900">Bank *</Label>
                <div className="grid grid-cols-4 gap-1.5">
                    {banks.map(bank => (
                        <div key={bank} className="relative group">
                            <button
                                type="button"
                                className={`h-8 w-full text-xs font-semibold rounded-lg transition-all ${bankName === bank
                                    ? "bg-blue-500 text-white border border-blue-600 shadow-md hover:bg-blue-600"
                                    : "border border-neutral-300 bg-white text-neutral-900 hover:border-blue-400 hover:bg-blue-50"
                                    }`}
                                onClick={() => setBankName(bank)}
                                disabled={!canEditField("bankName")}
                            >
                                {bank}
                            </button>
                        </div>
                    ))}
                    <div className="relative">
                        {!banks.includes(bankName) && bankName ? (
                            <Input
                                type="text"
                                placeholder="Name"
                                name="customBankName"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                className="h-8 text-xs rounded-lg border border-blue-600 bg-blue-500 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-semibold placeholder-blue-100"
                                disabled={!canEditField("bankName")}
                            />
                        ) : (
                            <button
                                type="button"
                                className="h-8 w-full text-xs font-semibold rounded-lg border border-neutral-300 bg-white text-neutral-900 hover:border-blue-400 hover:bg-blue-50"
                                onClick={() => setBankName("")}
                                disabled={!canEditField("bankName")}
                            >
                                Other
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* City Section */}
            <div className="space-y-2">
                <Label className="text-sm font-bold text-neutral-900">City *</Label>
                <div className="grid grid-cols-4 gap-1.5">
                    {cities.map(c => (
                        <div key={c} className="relative group">
                            <button
                                type="button"
                                className={`h-8 w-full text-xs font-semibold rounded-lg transition-all ${city === c
                                    ? "bg-blue-500 text-white border border-blue-600 shadow-md hover:bg-blue-600"
                                    : "border border-neutral-300 bg-white text-neutral-900 hover:border-blue-400 hover:bg-blue-50"
                                    }`}
                                onClick={() => setCity(c)}
                                disabled={!canEditField("city")}
                            >
                                {c}
                            </button>
                        </div>
                    ))}
                    <div className="relative">
                        {!cities.includes(city) && city ? (
                            <Input
                                type="text"
                                placeholder="Name"
                                name="customCity"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="h-8 text-xs rounded-lg border border-blue-600 bg-blue-500 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-semibold placeholder-blue-100"
                                disabled={!canEditField("city")}
                            />
                        ) : (
                            <button
                                type="button"
                                className="h-8 w-full text-xs font-semibold rounded-lg border border-neutral-300 bg-white text-neutral-900 hover:border-blue-400 hover:bg-blue-50"
                                onClick={() => setCity("")}
                                disabled={!canEditField("city")}
                            >
                                Other
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* DSA Section */}
            <div className="space-y-2">
                <Label className="text-sm font-bold text-neutral-900">Sales Agent (DSA) *</Label>
                <div className="grid grid-cols-4 gap-1.5">
                    {dsaNames.map(dsaName => (
                        <div key={dsaName} className="relative group">
                            <button
                                type="button"
                                className={`h-8 w-full text-xs font-semibold rounded-lg transition-all ${dsa === dsaName
                                    ? "bg-blue-500 text-white border border-blue-600 shadow-md hover:bg-blue-600"
                                    : "border border-neutral-300 bg-white text-neutral-900 hover:border-blue-400 hover:bg-blue-50"
                                    }`}
                                onClick={() => setDsa(dsaName)}
                                disabled={!canEditField("dsa")}
                            >
                                {dsaName}
                            </button>
                        </div>
                    ))}
                    <div className="relative">
                        {!dsaNames.includes(dsa) && dsa ? (
                            <Input
                                type="text"
                                placeholder="Name"
                                name="customDsa"
                                value={dsa}
                                onChange={(e) => setDsa(e.target.value)}
                                className="h-8 text-xs rounded-lg border border-blue-600 bg-blue-500 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-semibold placeholder-blue-100"
                                disabled={!canEditField("dsa")}
                            />
                        ) : (
                            <button
                                type="button"
                                className="h-8 w-full text-xs font-semibold rounded-lg border border-neutral-300 bg-white text-neutral-900 hover:border-blue-400 hover:bg-blue-50"
                                onClick={() => setDsa("")}
                                disabled={!canEditField("dsa")}
                            >
                                Other
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Engineer Name Section */}
            <div className="space-y-2">
                <Label className="text-sm font-bold text-neutral-900">Engineer *</Label>
                <div className="grid grid-cols-4 gap-1.5">
                    {engineerNames.map(engineer => (
                        <div key={engineer} className="relative group">
                            <button
                                type="button"
                                className={`h-8 w-full text-xs font-semibold rounded-lg transition-all ${engineerName === engineer
                                    ? "bg-blue-500 text-white border border-blue-600 shadow-md hover:bg-blue-600"
                                    : "border border-neutral-300 bg-white text-neutral-900 hover:border-blue-400 hover:bg-blue-50"
                                    }`}
                                onClick={() => setEngineerName(engineer)}
                                disabled={!canEditField("engineerName")}
                            >
                                {engineer}
                            </button>
                        </div>
                    ))}
                    <div className="relative">
                        {!engineerNames.includes(engineerName) && engineerName ? (
                            <Input
                                type="text"
                                placeholder="Name"
                                name="customEngineerName"
                                value={engineerName}
                                onChange={(e) => setEngineerName(e.target.value)}
                                className="h-8 text-xs rounded-lg border border-blue-600 bg-blue-500 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-semibold placeholder-blue-100"
                                disabled={!canEditField("engineerName")}
                            />
                        ) : (
                            <button
                                type="button"
                                className="h-8 w-full text-xs font-semibold rounded-lg border border-neutral-300 bg-white text-neutral-900 hover:border-blue-400 hover:bg-blue-50"
                                onClick={() => setEngineerName("")}
                                disabled={!canEditField("engineerName")}
                            >
                                Other
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Property Basic Details Section */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FaBuilding className="h-5 w-5 text-orange-600" />
                        Property Basic Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="elevation" className="text-sm font-bold text-gray-900">Elevation</Label>
                            <Input
                                id="elevation"
                                placeholder="Enter elevation details"
                                name="elevation"
                                value={formData.elevation || ""}
                                onChange={handleInputChange}
                                disabled={!canEdit}
                                className="h-11 text-sm rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-200 font-medium"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="lg:col-span-1 space-y-1.5">
                    <Label className="text-xs font-bold text-neutral-900">Payment *</Label>
                    <RadioGroup value={formData.payment} onValueChange={!canEditField("payment") ? undefined : (val) => setFormData(prev => ({ ...prev, payment: val }))} className="flex gap-4 pt-0.5">
                        <div className="flex items-center gap-1.5 cursor-pointer">
                            <RadioGroupItem value="yes" id="payment-yes" className="w-4 h-4 border border-neutral-400 accent-blue-500" disabled={!canEditField("payment")} />
                            <Label htmlFor="payment-yes" className="text-xs font-medium cursor-pointer text-neutral-900">Collected</Label>
                        </div>
                        <div className="flex items-center gap-1.5 cursor-pointer">
                            <RadioGroupItem value="no" id="payment-no" className="w-4 h-4 border border-neutral-400 accent-blue-500" disabled={!canEditField("payment")} />
                            <Label htmlFor="payment-no" className="text-xs font-medium cursor-pointer text-neutral-900">Pending</Label>
                        </div>
                    </RadioGroup>
                </div>

                {formData.payment === "yes" && (
                    <div className="lg:col-span-2 space-y-1.5">
                        <Label htmlFor="collectedBy" className="text-xs font-bold text-neutral-900">Collected By *</Label>
                        <Input
                            id="collectedBy"
                            placeholder="Collector name"
                            name="collectedBy"
                            value={formData.collectedBy}
                            onChange={handleInputChange}
                            className="h-8 text-xs w-full rounded-lg border border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                            disabled={!canEditField("collectedBy")}
                        />
                    </div>
                )}
            </div>
        </>
    );
};

export default ClientInfoPanel;