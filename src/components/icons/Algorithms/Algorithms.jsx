import React from "react";
import "./style.css";
import vector from "./vector.svg";

export const Algorithms = ({ className }) => {
    return (
        <div className={`algorithms-screen ${className || ""}`}>
            <img className="vector" alt="Vector" src={vector} />
        </div>
    );
};

