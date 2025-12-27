import React from "react";
import "./style.css";
import vector from "./vector.svg";

export const Home = ({ className }) => {
    return (
        <div className={`home-screen ${className || ""}`}>
            <img className="vector" alt="Vector" src={vector} />
        </div>
    );
};

