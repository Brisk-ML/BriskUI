import React, { useState } from "react";
import { useReducer } from "react";
import Documentation from "../../components/ProjectHeader/Documentation";
import Github from "../../components/ProjectHeader/Github";
import Sidebar from "../../components/Sidebar";
import { StatCard } from "../../components/StatCard";
import EditProjectModal from "../../components/EditProjectModal";
import DeleteProjectModal from "../../components/DeleteProjectModal";
import { useModal } from "../../contexts/ModalContext";
import line122 from "../../assets/line-12-2.svg";
import line12 from "../../assets/line-12.svg";
import "./style.css";

export const HiFiHome = () => {
    const { 
        isEditProjectModalOpen, 
        closeEditProjectModal,
        isDeleteProjectModalOpen,
        closeDeleteProjectModal 
    } = useModal();
    const [state, dispatch] = useReducer(reducer, {
        hoveredCard: null,
    });

    const [stats] = useState({
        experiments: 40,
        groups: 3,
        datasets: 2,
        algorithms: 7,
        metrics: 10,
    });

    return (
        <div className="hi-fi-home">
            <Sidebar
                className="sidebar-instance"
                stateProp="collapsed"
            />
            <div className="project-header">
                <div className="proect-name">My Project</div>
                <div className="project-stats">
                    <StatCard
                        className="stat-card-instance"
                        state={state.hoveredCard === "experiments" ? "hover" : "default"}
                        text1={String(stats.experiments)}
                        text="Experiments"
                        onMouseEnter={() => dispatch({ type: "hover", card: "experiments" })}
                        onMouseLeave={() => dispatch({ type: "unhover" })}
                    />
                    <StatCard
                        className="stat-card-instance"
                        state={state.hoveredCard === "groups" ? "hover" : "default"}
                        text1={String(stats.groups)}
                        text="Groups"
                        onMouseEnter={() => dispatch({ type: "hover", card: "groups" })}
                        onMouseLeave={() => dispatch({ type: "unhover" })}
                    />
                    <StatCard
                        className="stat-card-instance"
                        state={state.hoveredCard === "datasets" ? "hover" : "default"}
                        text1={String(stats.datasets)}
                        text="Datasets"
                        onMouseEnter={() => dispatch({ type: "hover", card: "datasets" })}
                        onMouseLeave={() => dispatch({ type: "unhover" })}
                    />
                    <StatCard
                        className="stat-card-instance"
                        state={state.hoveredCard === "algorithms" ? "hover" : "default"}
                        text1={String(stats.algorithms)}
                        text="Algorithms"
                        onMouseEnter={() => dispatch({ type: "hover", card: "algorithms" })}
                        onMouseLeave={() => dispatch({ type: "unhover" })}
                    />
                    <StatCard
                        className="stat-card-instance"
                        state={state.hoveredCard === "metrics" ? "hover" : "default"}
                        text1={String(stats.metrics)}
                        text="Metrics"
                        onMouseEnter={() => dispatch({ type: "hover", card: "metrics" })}
                        onMouseLeave={() => dispatch({ type: "unhover" })}
                    />
                </div>
                <div className="links">
                    <Github className="icon-instance-node" />
                    <Documentation className="icon-instance-node" />
                </div>
            </div>
            <div className="dashboard">
                <div className="result-summary">
                    <div className="text-wrapper-4">Result Summary</div>
                    <img className="line-2" alt="Line" src={line12} />
                    <div className="text-wrapper-3">Coming Soon...</div>
                </div>
                <div className="recent-runs">
                    <div className="text-wrapper-5">Recent Activity</div>
                    <img className="line-3" alt="Line" src={line122} />
                    <div className="text-wrapper-6">Coming Soon...</div>
                </div>
            </div>
            <EditProjectModal isOpen={isEditProjectModalOpen} onClose={closeEditProjectModal} />
            <DeleteProjectModal 
                isOpen={isDeleteProjectModalOpen} 
                onClose={closeDeleteProjectModal}
                projectName="My Project"
            />
        </div>
    );
};

function reducer(state, action) {
    switch (action.type) {
        case "hover":
            return {
                hoveredCard: action.card,
            };
        case "unhover":
            return {
                hoveredCard: null,
            };
        default:
            return state;
    }
}

export default HiFiHome;
