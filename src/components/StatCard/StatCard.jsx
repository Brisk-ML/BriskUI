import PropTypes from "prop-types";
import React from "react";
import image from "./image.svg";
import line from "./line.svg";
import "./style.css";

export const StatCard = ({ state, className, text, text1, onMouseEnter, onMouseLeave }) => {
    return (
        <div 
            className={`stat-card ${state} ${className || ""}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="text-wrapper">{text1 || "##"}</div>
            <div className="div">{text || "Name"}</div>
            <img className="line" alt="Line" src={state === "hover" ? image : line} />
        </div>
    );
};

StatCard.propTypes = {
    state: PropTypes.oneOf(["hover", "default"]),
    className: PropTypes.string,
    text: PropTypes.string,
    text1: PropTypes.string,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
};

export default StatCard;
