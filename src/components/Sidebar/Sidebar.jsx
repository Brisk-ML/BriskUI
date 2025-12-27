import PropTypes from "prop-types";
import React from "react";
import { useReducer } from "react";
import { Algorithms, Database, Edit, Experiments, Files, Home, IconComponentNode, Metrics, Results, Save } from "../icons";
import divider from "../icons/divider.svg";
import image from "../icons/image.svg";
import { useModal } from "../../contexts/ModalContext";
import "./Sidebar.css";

export const Sidebar = ({ stateProp, className }) => {
    const { openEditProjectModal } = useModal();
    const [state, dispatch] = useReducer(reducer, {
        state: stateProp || "collapsed",
    });

    return (
        <div
            className={`sidebar state-${state.state} ${className}`}
            onMouseEnter={() => {
                dispatch("mouse_enter");
            }}
            onMouseLeave={() => {
                dispatch("mouse_leave");
            }}
        >
            {(state.state === "algorithms" ||
                state.state === "datasets" ||
                state.state === "edit" ||
                state.state === "experiments" ||
                state.state === "files" ||
                state.state === "home" ||
                state.state === "metrics" ||
                state.state === "results" ||
                state.state === "save") && (
                <>
                    <div className="icons">
                        <div className="text-wrapper">Brisk</div>
                        <div className="project-buttons">
                            <img
                                className="divider"
                                alt="Divider"
                                src={divider}
                            />
                            <div className="div">
                                <Home className="instance-node" />
                                <div className="text-wrapper-2">Home</div>
                            </div>
                            <div className="div" onClick={openEditProjectModal} style={{ cursor: 'pointer' }}>
                                <Edit className="instance-node" />
                                <div className="text-wrapper-2">Edit</div>
                            </div>
                        </div>
                        <div className="configuration">
                            <img
                                className="divider"
                                alt="Divider"
                                src={divider}
                            />
                            <div className="div-2">
                                <Experiments className="instance-node" />
                                <div className="text-wrapper-2">Experiments</div>
                            </div>
                            <div className="div-2">
                                <Database className="instance-node" />
                                <div className="text-wrapper-2">Datasets</div>
                            </div>
                            <div className="div-2">
                                <Algorithms className="instance-node" />
                                <div className="text-wrapper-2">Algorithms</div>
                            </div>
                            <div className="div-2">
                                <Metrics className="instance-node" />
                                <div className="text-wrapper-2">Metrics</div>
                            </div>
                        </div>
                        <div className="files-2">
                            <img
                                className="divider"
                                alt="Divider"
                                src={divider}
                            />
                            <div className="div-3">
                                <Results className="instance-node" />
                                <div className="text-wrapper-2">Results</div>
                            </div>
                            <div className="div-3">
                                <Files className="instance-node" />
                                <div className="text-wrapper-2">Files</div>
                            </div>
                            <div className="div-3">
                                <Save className="instance-node" />
                                <div className="text-wrapper-2">Save</div>
                            </div>
                        </div>
                    </div>
                    <div className="highlight">
                        <div className="vertical-divider">
                            <div className="background-blur" />
                        </div>
                        <div className="gradient" />
                    </div>
                </>
            )}

            {["collapsed", "hover"].includes(state.state) && (
                <div className="icons-2">
                    <div className="text-wrapper-3">Brisk</div>
                    <div className="project-buttons-2">
                        <img
                            className="img"
                            alt="Divider"
                            src={divider}
                        />
                        {state.state === "hover" && (
                            <>
                                <div className="div">
                                    <Home className="instance-node" />
                                    <div className="text-wrapper-2">Home</div>
                                </div>
                                <div className="div" onClick={openEditProjectModal} style={{ cursor: 'pointer' }}>
                                    <Edit className="instance-node" />
                                    <div className="text-wrapper-2">Edit</div>
                                </div>
                            </>
                        )}
                        {state.state === "collapsed" && (
                            <>
                                <Home className="instance-node-2" />
                                <div onClick={openEditProjectModal} style={{ cursor: 'pointer' }}>
                                    <Edit className="instance-node-2" />
                                </div>
                            </>
                        )}
                    </div>
                    <div className="configuration-2">
                        {state.state === "hover" && (
                            <>
                                <img className="divider" alt="Divider" src={divider} />
                                <div className="div-2">
                                    <IconComponentNode className="instance-node" />
                                    <div className="text-wrapper-2">Experiments</div>
                                </div>
                                <div className="div-2">
                                    <Database className="instance-node" />
                                    <div className="text-wrapper-2">Datasets</div>
                                </div>
                                <div className="div-2">
                                    <Algorithms className="instance-node" />
                                    <div className="text-wrapper-2">Algorithms</div>
                                </div>
                                <div className="div-2">
                                    <Metrics className="instance-node" />
                                    <div className="text-wrapper-2">Metrics</div>
                                </div>
                            </>
                        )}
                        {state.state === "collapsed" && (
                            <>
                                <img className="divider-2" alt="Divider" src={image} />
                                <IconComponentNode className="instance-node-2" />
                                <Database className="instance-node-2" />
                                <Algorithms className="instance-node-2" />
                                <Metrics className="instance-node-2" />
                            </>
                        )}
                    </div>
                    <div className="files-3">
                        <img
                            className="divider-3"
                            alt="Divider"
                            src={divider}
                        />
                        {state.state === "hover" && (
                            <>
                                <div className="div-3">
                                    <Results className="instance-node" />
                                    <div className="text-wrapper-2">Results</div>
                                </div>
                                <div className="div-3">
                                    <Files className="instance-node" />
                                    <div className="text-wrapper-2">Files</div>
                                </div>
                                <div className="div-3">
                                    <Save className="instance-node" />
                                    <div className="text-wrapper-2">Save</div>
                                </div>
                            </>
                        )}
                        {state.state === "collapsed" && (
                            <>
                                <Results className="instance-node-2" />
                                <Files className="instance-node-2" />
                                <Save className="instance-node-2" />
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

function reducer(state, action) {
    switch (action) {
        case "mouse_enter":
            return {
                ...state,
                state: "hover",
            };
        case "mouse_leave":
            return {
                ...state,
                state: "collapsed",
            };
    }
    return state;
}

Sidebar.propTypes = {
    stateProp: PropTypes.oneOf([
        "results",
        "algorithms",
        "experiments",
        "edit",
        "metrics",
        "save",
        "home",
        "files",
        "hover",
        "collapsed",
        "datasets",
    ]),
    className: PropTypes.string,
};

export default Sidebar;
