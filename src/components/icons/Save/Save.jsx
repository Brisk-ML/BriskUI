import React from "react";
import "./style.css";
import vector from "./vector.svg";

export const Save = ({ className }) => {
    return (
        <div className={`save-screen ${className || ""}`}>
            <img className="vector" alt="Vector" src={vector} />
        </div>
    );
};

