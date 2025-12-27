import PropTypes from "prop-types";
import React from "react";
import { useReducer } from "react";

export const ProjectHeader = ({ stateProp, className }) => {
    const [state, dispatch] = useReducer(reducer, {
        state: stateProp || "default",
    });

    return (
        <div 
            style={{ 
                backgroundColor: '#181818', 
                color: '#ffffff',
                position: 'relative',
                width: '100%',
                padding: '20px',
                minHeight: '214px'
            }}
        >
            <div style={{ color: '#ffffff', fontSize: '48px', marginBottom: '20px', fontWeight: 'bold' }}>My Project</div>
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                <div style={{ width: '175px', height: '175px', border: '1px solid #363636', backgroundColor: '#121212', color: 'white', padding: '20px' }}>
                    <div style={{ fontSize: '56px' }}>40</div>
                    <div style={{ fontSize: '25px' }}>Experiments</div>
                </div>
                <div style={{ width: '175px', height: '175px', border: '1px solid #363636', backgroundColor: '#121212', color: 'white', padding: '20px' }}>
                    <div style={{ fontSize: '56px' }}>3</div>
                    <div style={{ fontSize: '25px' }}>Groups</div>
                </div>
                <div style={{ width: '175px', height: '175px', border: '1px solid #363636', backgroundColor: '#121212', color: 'white', padding: '20px' }}>
                    <div style={{ fontSize: '56px' }}>2</div>
                    <div style={{ fontSize: '25px' }}>Datasets</div>
                </div>
                <div style={{ width: '175px', height: '175px', border: '1px solid #363636', backgroundColor: '#121212', color: 'white', padding: '20px' }}>
                    <div style={{ fontSize: '56px' }}>7</div>
                    <div style={{ fontSize: '25px' }}>Algorithms</div>
                </div>
                <div style={{ width: '175px', height: '175px', border: '1px solid #363636', backgroundColor: '#121212', color: 'white', padding: '20px' }}>
                    <div style={{ fontSize: '56px' }}>10</div>
                    <div style={{ fontSize: '25px' }}>Metrics</div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', color: 'white' }}>
                <div>Github Icon</div>
                <div>Documentation Icon</div>
            </div>
        </div>
    );
};

function reducer(state, action) {
    if (state.state === "default") {
        switch (action) {
            case "mouse_enter":
                return {
                    state: "groups-hover",
                };
            case "mouse_enter_228":
                return {
                    state: "dataset-hover",
                };
            case "mouse_enter_232":
                return {
                    state: "algorithm-hover",
                };
            case "mouse_enter_236":
                return {
                    state: "metric-hover",
                };
        }
    }

    if (state.state === "groups-hover") {
        switch (action) {
            case "mouse_leave":
                return {
                    state: "default",
                };
        }
    }

    if (state.state === "dataset-hover") {
        switch (action) {
            case "mouse_leave_228":
                return {
                    state: "default",
                };
        }
    }

    if (state.state === "algorithm-hover") {
        switch (action) {
            case "mouse_leave_232":
                return {
                    state: "default",
                };
        }
    }

    if (state.state === "metric-hover") {
        switch (action) {
            case "mouse_leave_236":
                return {
                    state: "default",
                };
        }
    }

    return state;
}

ProjectHeader.propTypes = {
    stateProp: PropTypes.oneOf([
        "default",
        "experiment-hover",
        "dataset-hover",
        "metric-hover",
        "groups-hover",
        "algorithm-hover",
        "github",
        "documentation",
    ]),
    className: PropTypes.string,
};

export default ProjectHeader;
