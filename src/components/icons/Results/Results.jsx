import React from "react";
import "./style.css";
import vector from "./vector.svg";

export const Results = ({ className }) => {
    return (
        <div className={`results-screen ${className || ""}`}>
            <img className="vector" alt="Vector" src={vector} />
        </div>
    );
};

