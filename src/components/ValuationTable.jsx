/**
 * Valuation Table Component
 * 
 * Displays valuations in a table format with actions including PDF download
 * 
 * Features:
 * - Display valuation list in table
 * - Download PDF button for each row
 * - Show loading state while downloading
 * - Error handling and notifications
 * - Responsive design
 */

import React, { useState, useEffect, useCallback, memo } from "react";
import "./ValuationTable.css"; // Styling

/**
 * Memoized Table Row Component - Prevents unnecessary re-renders
 */
const ValuationTableRow = memo(({ valuation, downloadingIds, onDownload, onPreview }) => (
    <tr key={valuation._id} className={`row-${valuation.status}`}>
        {/* Client Name */}
        <td className="cell-client">
            <strong>{valuation.clientName}</strong>
        </td>

        {/* Property Address */}
        <td className="cell-address">
            <span title={valuation.address}>
                {valuation.address?.substring(0, 40)}...
            </span>
        </td>

        {/* City */}
        <td className="cell-city">
            {valuation.city}
        </td>

        {/* Fair Market Value */}
        <td className="cell-fmv">
            <strong className="fmv-amount">
                ₹ {valuation.pdfDetails?.fairMarketValue || "N/A"}
            </strong>
        </td>

        {/* Status Badge */}
        <td className="cell-status">
            <span className={`badge badge-${valuation.status}`}>
                {valuation.status?.toUpperCase() || "N/A"}
            </span>
        </td>

        {/* Valuation Date */}
        <td className="cell-date">
            {valuation.createdAt
                ? new Date(valuation.createdAt).toLocaleDateString()
                : "N/A"}
        </td>

        {/* Actions Column */}
        <td className="cell-actions">
            <div className="action-buttons">
                {/* Download PDF Button */}
                <button
                    className={`btn btn-download ${downloadingIds.has(valuation._id) ? "loading" : ""
                        }`}
                    onClick={() => onDownload(valuation)}
                    disabled={downloadingIds.has(valuation._id)}
                    title="Download PDF Report"
                >
                    {downloadingIds.has(valuation._id) ? (
                        <>
                            <span className="spinner"></span>
                            Downloading...
                        </>
                    ) : (
                        <>
                            📥 Download
                        </>
                    )}
                </button>

                {/* Preview Button */}
                <button
                    className="btn btn-preview"
                    onClick={() => onPreview(valuation)}
                    title="Preview PDF in new tab"
                >
                    👁️ Preview
                </button>

                {/* View Details Button */}
                <a
                    href={`/valuation/${valuation._id}`}
                    className="btn btn-view"
                    title="View full details"
                >
                    🔍 View
                </a>
            </div>
        </td>
    </tr>
));

ValuationTableRow.displayName = 'ValuationTableRow';

/**
 * ValuationTable Component
 * 
 * @param {Array} valuations - Array of valuation objects
 * @param {Function} onRefresh - Callback to refresh data after actions
 * 
 * @returns {JSX.Element} - Table component with download functionality
 */
const ValuationTable = ({ valuations = [], onRefresh }) => {
    // State for tracking which PDFs are currently downloading
    const [downloadingIds, setDownloadingIds] = useState(new Set());

    // State for error messages
    const [error, setError] = useState(null);

    // State for success messages
    const [success, setSuccess] = useState(null);

    /**
     * Handle PDF Download (Client-side generation)
     * 
     * @param {Object} valuation - Full valuation object
     */
    const handleDownloadPDF = useCallback(async (valuation) => {
        try {
            // Clear previous messages
            setError(null);
            setSuccess(null);

            // Add to downloading set to show loading state
            setDownloadingIds((prev) => new Set([...prev, valuation._id]));

            (`📥 Starting PDF download for: ${valuation.clientName}`);

            // Import and use client-side PDF service
            const { generateRecordPDF } = await import("../services/ubiShopPdf.js");
            const filename = await generateRecordPDF(valuation);

            // Show success message
            setSuccess(`✓ PDF downloaded successfully: ${filename}`);
            ("✓ PDF download completed successfully");

        } catch (error) {
            // Handle any errors that occurred
            console.error("❌ PDF download error:", error);
            setError(`Error downloading PDF: ${error.message}`);

        } finally {
            // Remove from downloading set
            setDownloadingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(valuation._id);
                return newSet;
            });

            // Auto-clear messages after 5 seconds
            setTimeout(() => {
                setError(null);
                setSuccess(null);
            }, 5000);
        }
    }, []);

    /**
     * Handle Preview PDF in new tab (Client-side generation)
     * 
     * @param {Object} valuation - Full valuation object
     */
    const handlePreviewPDF = useCallback(async (valuation) => {
        try {
            const { previewValuationPDF } = await import("../services/ubiShopPdf.js");
            await previewValuationPDF(valuation);
        } catch (error) {
            console.error("Error previewing PDF:", error);
            setError("Error fetching PDF information");
        }
    }, []);

    // If no valuations, show empty state
    if (!valuations || valuations.length === 0) {
        return (
            <div className="valuation-table-empty">
                <p>No valuations found</p>
            </div>
        );
    }

    return (
        <div className="valuation-table-container">
            {/* Error Message Display */}
            {error && (
                <div className="alert alert-error">
                    ⚠️ {error}
                </div>
            )}

            {/* Success Message Display */}
            {success && (
                <div className="alert alert-success">
                    ✓ {success}
                </div>
            )}

            {/* Table Wrapper */}
            <div className="table-wrapper">
                <table className="valuation-table">
                    <thead>
                        <tr>
                            <th>Client Name</th>
                            <th>Property Address</th>
                            <th>City</th>
                            <th>Fair Market Value</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {valuations.map((valuation) => (
                            <ValuationTableRow
                                key={valuation._id}
                                valuation={valuation}
                                downloadingIds={downloadingIds}
                                onDownload={handleDownloadPDF}
                                onPreview={handlePreviewPDF}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Table Footer with Info */}
            <div className="table-footer">
                <p>Showing {valuations.length} valuation(s)</p>
                <p className="download-info">
                    💡 Click "Download" to generate and download PDF report
                </p>
            </div>
        </div>
    );
};

export default ValuationTable;
