import React, { useState } from "react";
import { Cross } from "../Cross";
import DeleteButton from "../DeleteButton";
import { useModal } from "../../contexts/ModalContext";
import line9 from "../../assets/line-9.svg";
import "./EditProjectModal.css";

export const EditProjectModal = ({ isOpen, onClose }) => {
    const { openDeleteProjectModal } = useModal();
    const [description, setDescription] = useState("Project description...");
    const [projectPath, setProjectPath] = useState("path/to/project");
    
    if (!isOpen) return null;

    return (
        <>
            <div className="edit-modal-blur" onClick={onClose} />
            <div className="edit-modal-container">
                <div className="edit-modal-background" />
                <div className="edit-modal-description-input">
                    <div className="edit-modal-text-wrapper-7">Description</div>
                    <div className="edit-modal-input">
                        <textarea
                            className="edit-modal-textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Project description..."
                        />
                    </div>
                </div>
                <div className="edit-modal-path-input">
                    <div className="edit-modal-text-wrapper-7">Project Path</div>
                    <div className="edit-modal-input-2">
                        <div className="edit-modal-input-3" />
                        <input
                            type="text"
                            className="edit-modal-input-field"
                            value={projectPath}
                            onChange={(e) => setProjectPath(e.target.value)}
                            placeholder="path/to/project"
                        />
                    </div>
                </div>
                <header className="edit-modal-header">
                    <Cross className="edit-modal-cross-instance" onClick={onClose} />
                    <img className="edit-modal-line-3" alt="Line" src={line9} />
                    <div className="edit-modal-text-wrapper-9">Edit Project</div>
                </header>
                <DeleteButton 
                    className="edit-modal-delete-button-instance" 
                    onClick={openDeleteProjectModal}
                />
            </div>
        </>
    );
};

export default EditProjectModal;

