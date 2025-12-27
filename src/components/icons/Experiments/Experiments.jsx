import React from "react";
import "./style.css";
import vector from "./vector.svg";

export const Experiments = ({ className }) => {
    return (
        <div className={`experiments-screen ${className || ""}`}>
            <img className="vector" alt="Vector" src={vector} />
        </div>
    );
};

