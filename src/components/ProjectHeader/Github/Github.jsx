import React from "react";
import "./style.css";
import vector from "./vector.svg";

export const Github = ({ className }) => {
    return (
        <div className={`github ${className || ""}`}>
            <img className="vector" alt="Vector" src={vector} />
        </div>
    );
};

export default Github;

