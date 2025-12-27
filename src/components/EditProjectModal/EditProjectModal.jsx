import React from "react";
import { Cross } from "../Cross";
import DeleteButton from "../DeleteButton";
import { useModal } from "../../contexts/ModalContext";
import line9 from "../../assets/line-9.svg";
import "./EditProjectModal.css";

export const EditProjectModal = ({ isOpen, onClose }) => {
    const { openDeleteProjectModal } = useModal();
    
    if (!isOpen) return null;

    return (
        <>
            <div className="edit-modal-blur" onClick={onClose} />
            <div className="edit-modal-container">
                <div className="edit-modal-background" />
                <div className="edit-modal-description-input">
                    <div className="edit-modal-text-wrapper-7">Description</div>
                    <div className="edit-modal-input">
                        <p className="edit-modal-p">
                            Project description...
                        </p>
                    </div>
                </div>
                <div className="edit-modal-path-input">
                    <div className="edit-modal-text-wrapper-7">Project Path</div>
                    <div className="edit-modal-input-2">
                        <div className="edit-modal-input-3" />
                        <div className="edit-modal-text-wrapper-8">path/to/project</div>
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

