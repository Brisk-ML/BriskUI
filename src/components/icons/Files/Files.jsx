import React from "react";
import "./style.css";
import vector from "./vector.svg";

export const Files = ({ className }) => {
    return (
        <div className={`files-screen ${className || ""}`}>
            <img className="vector" alt="Vector" src={vector} />
        </div>
    );
};

