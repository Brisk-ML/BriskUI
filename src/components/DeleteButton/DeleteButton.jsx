import React from "react";
import "./DeleteButton.css";

export const DeleteButton = ({ className, disabled, onClick }) => {
    return (
        <button 
            className={`delete-button ${className}`} 
            disabled={disabled}
            onClick={onClick}
        >
            <div className="text-wrapper">Delete</div>
        </button>
    );
};

export default DeleteButton;

