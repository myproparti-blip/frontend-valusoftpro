import React, { useState, useRef, useEffect, memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTimes } from "react-icons/fa";
import { getFormRouteForBank, isBofMaharashtraBank } from "../config/bankFormMapping";

const SearchBar = memo(({ data = [] }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    // Generate searchable items from table data - includes ALL table columns
    const getSearchableItems = () => {
        return data.map(item => ({
            id: item._id,
            uniqueId: item.uniqueId,
            clientName: item.clientName,
            city: item.city,
            bankName: item.bankName,
            engineerName: item.engineerName,
            address: item.address,
            status: item.status,
            mobileNumber: item.mobileNumber,
            payment: item.payment,
            notes: item.notes,
            createdAt: item.createdAt,
            dateTime: item.dateTime,
            lastUpdatedBy: item.lastUpdatedBy,
            managerFeedback: item.managerFeedback,
            selectedForm: item.selectedForm
        }));
    };

    // Real-time search and filtering
    const handleSearch = (value) => {
        setSearchTerm(value);

        if (value.trim().length === 0) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        const searchableItems = getSearchableItems();
        const searchLower = value.toLowerCase();

        // Filter items based on search term matching ANY field in the table
        const filtered = searchableItems.filter(item => {
            return (
                item.clientName?.toLowerCase().includes(searchLower) ||
                item.city?.toLowerCase().includes(searchLower) ||
                item.bankName?.toLowerCase().includes(searchLower) ||
                item.engineerName?.toLowerCase().includes(searchLower) ||
                item.address?.toLowerCase().includes(searchLower) ||
                item.mobileNumber?.toLowerCase().includes(searchLower) ||
                item.payment?.toLowerCase().includes(searchLower) ||
                item.notes?.toLowerCase().includes(searchLower) ||
                item.status?.toLowerCase().includes(searchLower) ||
                item.createdAt?.toLowerCase().includes(searchLower) ||
                item.dateTime?.toLowerCase().includes(searchLower) ||
                item.lastUpdatedBy?.toLowerCase().includes(searchLower) ||
                item.managerFeedback?.toLowerCase().includes(searchLower)
            );
        });

        // Limit to top 8 suggestions
        setSuggestions(filtered.slice(0, 8));
        setIsOpen(filtered.length > 0);
    };

    // Navigate to record details
    const handleSelectSuggestion = (item) => {
        // Find the full record from data to get selectedForm or bankName
        const fullRecord = data.find(r => r._id === item.id || r.uniqueId === item.uniqueId);

        let formRoute = '/valuationeditform'; // Default to ubiShop

        if (fullRecord) {
            // First priority: use selectedForm if explicitly set
            if (fullRecord.selectedForm === 'bomFlat') {
                formRoute = '/valuationeditformbomaharastra';
            } else if (fullRecord.selectedForm === 'ubiShop') {
                formRoute = '/valuationeditform';
            } else if (fullRecord.selectedForm === 'ubiApf') {
                formRoute = '/valuationeditformubiapf';
            } else if (fullRecord.selectedForm === 'rajeshhouse') {
                formRoute = '/valuationeditformrajeshhouse';
            } else if (fullRecord.selectedForm === 'rajeshbank') {
                formRoute = '/valuationeditformrajeshbank';
            } else if (fullRecord.selectedForm === 'rajeshrowhouse') {
                formRoute = '/valuationeditformrajeshrowhouse';
            } else {
                // If no selectedForm, use bank-based routing
                if (isBofMaharashtraBank(fullRecord?.bankName)) {
                    formRoute = '/valuationeditformbomaharastra';
                } else {
                    formRoute = getFormRouteForBank(fullRecord?.bankName) || '/valuationeditform';
                }
            }
        }

        navigate(`${formRoute}/${item.uniqueId}`);

        setSearchTerm("");
        setSuggestions([]);
        setIsOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Clear search
    const handleClear = () => {
        setSearchTerm("");
        setSuggestions([]);
        setIsOpen(false);
    };

    const getHighlightedText = (text, highlight) => {
        if (!text) return text;
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === highlight.toLowerCase()
                ? <mark key={index} className="bg-[#FFC547] font-semibold text-[#3A3A3A]">{part}</mark>
                : part
        );
    };

    return (
        <div className="relative w-1/2" ref={searchRef}>
            <div className="relative flex items-center">
                <FaSearch className="absolute left-3 h-4 w-4 text-blue-500 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search client, city, bank..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => searchTerm.trim().length > 0 && setIsOpen(true)}
                    className="w-full pl-10 pr-10 py-2 rounded-lg bg-blue-50 text-neutral-900 placeholder-neutral-500 border border-blue-300 focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-sm font-medium shadow-sm"
                    aria-label="Search valuations"
                />
                {searchTerm && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 text-neutral-400 hover:text-neutral-600 transition-colors"
                        aria-label="Clear search"
                    >
                        <FaTimes className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Suggestions Dropdown */}
            {isOpen && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#F5E6D3] rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {suggestions.map((item, index) => (
                        <button
                            key={`${item.id}-${index}`}
                            onClick={() => handleSelectSuggestion(item)}
                            className="w-full px-4 py-3 text-left hover:bg-[#FFF5F0] border-b border-[#E5E7EB] last:border-b-0 transition-colors group"
                        >
                            <div className="flex flex-col gap-1">
                                <p className="font-semibold text-[#3A3A3A] group-hover:text-[#F36E21]">
                                    {getHighlightedText(item.clientName, searchTerm)}
                                </p>
                                <div className="flex flex-wrap gap-2 text-xs text-[#6B7280]">
                                    {item.address && (
                                        <span className="flex items-center gap-1">
                                            📍 {getHighlightedText(item.address.substring(0, 30), searchTerm)}
                                        </span>
                                    )}
                                    {item.city && (
                                        <span className="flex items-center gap-1">
                                            🏙️ {getHighlightedText(item.city, searchTerm)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs text-[#6B7280] mt-1">
                                    {item.bankName && (
                                        <span className="px-2 py-0.5 bg-[#FFF5F0] text-[#F36E21] rounded">
                                            {getHighlightedText(item.bankName, searchTerm)}
                                        </span>
                                    )}
                                    {item.engineerName && (
                                        <span className="px-2 py-0.5 bg-[#FFF5F0] text-[#7A1F14] rounded">
                                            {getHighlightedText(item.engineerName, searchTerm)}
                                        </span>
                                    )}
                                    <span className={`px-2 py-0.5 rounded text-white ${item.status === "approved" ? "bg-green-600" :
                                        item.status === "pending" ? "bg-[#F36E21]" :
                                            item.status === "on-progress" ? "bg-[#EC5E25]" :
                                                "bg-red-600"
                                        }`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* No Results Message */}
            {isOpen && searchTerm.trim().length > 0 && suggestions.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#F5E6D3] rounded-lg shadow-lg z-50 p-4 text-center text-sm text-[#6B7280]">
                    No results found for "{searchTerm}"
                </div>
            )}
        </div>
    );
});

SearchBar.displayName = "SearchBar";

export default SearchBar;
