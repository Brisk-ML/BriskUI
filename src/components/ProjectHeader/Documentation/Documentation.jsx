import React from "react";
import "./style.css";
import vector from "./vector.svg";

export const Documentation = ({ className }) => {
    return (
        <div className={`documentation ${className || ""}`}>
            <img className="vector" alt="Vector" src={vector} />
        </div>
    );
};

export default Documentation;

