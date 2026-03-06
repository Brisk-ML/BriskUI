import { create } from "zustand";

interface DatasetsModalState {
  addDatasetModalOpen: boolean;
  editSplittingModalOpen: boolean;
  editDefaultSplitModalOpen: boolean;

  openAddDatasetModal: () => void;
  closeAddDatasetModal: () => void;
  openEditSplittingModal: () => void;
  closeEditSplittingModal: () => void;
  openEditDefaultSplitModal: () => void;
  closeEditDefaultSplitModal: () => void;
}

export const useDatasetsModalStore = create<DatasetsModalState>()((set) => ({
  addDatasetModalOpen: false,
  editSplittingModalOpen: false,
  editDefaultSplitModalOpen: false,

  openAddDatasetModal: () => set({ addDatasetModalOpen: true }),
  closeAddDatasetModal: () => set({ addDatasetModalOpen: false }),
  openEditSplittingModal: () => set({ editSplittingModalOpen: true }),
  closeEditSplittingModal: () => set({ editSplittingModalOpen: false }),
  openEditDefaultSplitModal: () => set({ editDefaultSplitModalOpen: true }),
  closeEditDefaultSplitModal: () => set({ editDefaultSplitModalOpen: false }),
}));
