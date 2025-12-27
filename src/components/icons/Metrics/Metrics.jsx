import React from "react";
import "./style.css";
import vector from "./vector.svg";

export const Metrics = ({ className }) => {
    return (
        <div className={`metrics-screen ${className || ""}`}>
            <img className="vector" alt="Vector" src={vector} />
        </div>
    );
};

