import React, { useState, memo, useCallback } from "react";
import { FaXmark } from "react-icons/fa6";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, Button, Textarea, Label } from "./ui";

const ReworkModal = memo(({ isOpen, onClose, onSubmit, isLoading = false }) => {
    const [reworkComments, setReworkComments] = useState("");

    const handleSubmit = () => {
        onSubmit(reworkComments);
        setReworkComments("");
    };

    const handleClose = () => {
        setReworkComments("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] bg-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black text-slate-900">Request Rework</DialogTitle>
                    <DialogDescription className="text-slate-600">
                        Enter optional rework comments for the user to review and update the valuation details.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="rework-comments" className="text-sm font-bold text-slate-700">
                            Rework Comments (Optional)
                        </Label>
                        <Textarea
                            id="rework-comments"
                            placeholder="Enter any comments or instructions for the user regarding what needs to be reworked..."
                            value={reworkComments}
                            onChange={(e) => setReworkComments(e.target.value)}
                            className="min-h-[120px] resize-none border-2 border-slate-300 focus:border-[#F36E21] focus:ring-2 focus:ring-orange-200 rounded-lg p-3 font-medium"
                        />
                        <p className="text-xs text-slate-500">
                            {reworkComments.length} characters
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-3">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-bold"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-[#F36E21] to-[#EC5E25] hover:from-[#EC5E25] hover:to-[#D94A1E] text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                    >
                        {isLoading ? "Submitting..." : "Submit Rework Request"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});

ReworkModal.displayName = "ReworkModal";

export default ReworkModal;
