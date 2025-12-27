import React from "react";
import "./Cross.css";

export const Cross = ({ className, onClick }) => {
    return (
        <div className={`cross ${className || ""}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="12" y1="12" x2="36" y2="36" stroke="white" strokeWidth="2"/>
                <line x1="36" y1="12" x2="12" y2="36" stroke="white" strokeWidth="2"/>
            </svg>
        </div>
    );
};

export default Cross;

