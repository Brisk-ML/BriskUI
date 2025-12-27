import React from "react";
import "./style.css";
import vector from "./vector.svg";

export const Edit = ({ className }) => {
    return (
        <div className={`edit-screen ${className || ""}`}>
            <img className="vector" alt="Vector" src={vector} />
        </div>
    );
};

