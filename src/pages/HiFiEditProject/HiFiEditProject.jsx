import React from "react";
import { Algorithms } from "../../components/icons/Algorithms/Algorithms";
import { Cross } from "../../components/Cross";
import { Database } from "../../components/icons/Database/Database";
import DeleteButton from "../../components/DeleteButton";
import Documentation from "../../components/ProjectHeader/Documentation";
import { Edit } from "../../components/icons/Edit/Edit";
import { Experiments } from "../../components/icons/Experiments/Experiments";
import { Files } from "../../components/icons/Files/Files";
import Github from "../../components/ProjectHeader/Github";
import { Home } from "../../components/icons/Home/Home";
import { Metrics } from "../../components/icons/Metrics/Metrics";
import { Results } from "../../components/icons/Results/Results";
import { Save } from "../../components/icons/Save/Save";
import { StatCard } from "../../components/StatCard";
import divider2 from "./divider-2.svg";
import divider3 from "./divider-3.svg";
import divider from "./divider.svg";
import image from "../../assets/image.svg";
import line9 from "../../assets/line-9.svg";
import line12 from "../../assets/line-12.svg";
import "./style.css";

export const HiFiEditProject = () => {
    return (
        <div className="hi-fi-edit-project">
            <div className="div-2">
                <div className="dashboard">
                    <div className="result-summary">
                        <div className="text-wrapper-2">Coming Soon...</div>
                        <img className="img" alt="Line" src={line12} />
                        <div className="text-wrapper-3">Result Summary</div>
                    </div>
                    <div className="recent-runs">
                        <img className="line-2" alt="Line" src={image} />
                        <div className="text-wrapper-4">Recent Activity</div>
                        <div className="text-wrapper-5">Coming Soon...</div>
                    </div>
                </div>
                <div className="project-header">
                    <div className="proect-name">My Project</div>
                    <div className="project-stats">
                        <StatCard
                            className="stat-card-instance"
                            divClassName="design-component-instance-node"
                            state="default"
                            text1="40"
                            text="Experiments"
                        />
                        <StatCard
                            className="stat-card-instance"
                            state="default"
                            text1="3"
                            text="Groups"
                        />
                        <StatCard
                            className="stat-card-instance"
                            state="default"
                            text1="2"
                            text="Datasets"
                        />
                        <StatCard
                            className="stat-card-instance"
                            state="default"
                            text1="7"
                            text="Algorithms"
                        />
                        <StatCard
                            className="stat-card-instance"
                            state="default"
                            text1="10"
                            text="Metrics"
                        />
                    </div>
                    <div className="links">
                        <Github className="icon-instance-node" />
                        <Documentation className="icon-instance-node" />
                    </div>
                </div>
                <div className="sidebar">
                    <div className="icons">
                        <div className="text-wrapper-6">Brisk</div>
                        <div className="div-3">
                            <img className="divider" alt="Divider" src={divider} />
                            <Home className="icon-instance-node-2" />
                            <Edit className="icon-instance-node-2" />
                        </div>
                        <div className="div-3">
                            <img className="divider-2" alt="Divider" src={divider2} />
                            <Experiments className="icon-instance-node-2" />
                            <Database className="icon-instance-node-2" />
                            <Algorithms className="icon-instance-node-2" />
                            <Metrics className="icon-instance-node-2" />
                        </div>
                        <div className="files-2">
                            <img className="divider" alt="Divider" src={divider3} />
                            <Results className="icon-instance-node-2" />
                            <Files className="icon-instance-node-2" />
                            <Save className="icon-instance-node-2" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="blur" />
            <div className="div-2">
                <div className="background" />
                <div className="description-input">
                    <div className="text-wrapper-7">Description</div>
                    <div className="input">
                        <p className="p">
                            Project description...
                        </p>
                    </div>
                </div>
                <div className="path-input">
                    <div className="text-wrapper-7">Project Path</div>
                    <div className="input-2">
                        <div className="input-3" />
                        <div className="text-wrapper-8">path/to/project</div>
                    </div>
                </div>
                <header className="header">
                    <Cross className="cross-instance" />
                    <img className="line-3" alt="Line" src={line9} />
                    <div className="text-wrapper-9">Edit Project</div>
                </header>
                <DeleteButton className="delete-button-instance" />
            </div>
        </div>
    );
};

export default HiFiEditProject;

