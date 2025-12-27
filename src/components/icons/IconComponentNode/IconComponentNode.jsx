import React from "react";
import "./style.css";
import vector from "./vector.svg";

export const IconComponentNode = ({ className }) => {
    return (
        <div className={`icon-component-node ${className || ""}`}>
            <img className="vector" alt="Vector" src={vector} />
        </div>
    );
};

