import React from "react";

const ChipSelect = ({ options, value, onChange, disabled = false, placeholder = "Select option" }) => {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map((option) => (
                <button
                    key={option}
                    type="button"
                    onClick={() => {
                        if (!disabled) {
                            onChange(value === option ? "" : option);
                        }
                    }}
                    disabled={disabled}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                        value === option
                            ? "bg-blue-500 text-white shadow-md"
                            : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                    } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                >
                    {option}
                </button>
            ))}
        </div>
    );
};

export default ChipSelect;
