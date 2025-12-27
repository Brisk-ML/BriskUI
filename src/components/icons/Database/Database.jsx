import React from "react";
import "./style.css";
import vector from "./vector.svg";

export const Database = ({ className }) => {
    return (
        <div className={`database-screen ${className || ""}`}>
            <img className="vector" alt="Vector" src={vector} />
        </div>
    );
};

