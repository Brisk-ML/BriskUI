import { create } from "zustand";

interface DatasetsModalState {
  addDatasetModal: boolean;
  editSplittingModal: boolean;
  editDefaultSplitModal: boolean;
  openAddDatasetModal: () => void;
  closeAddDatasetModal: () => void;
  openEditSplittingModal: () => void;
  closeEditSplittingModal: () => void;
  openEditDefaultSplitModal: () => void;
  closeEditDefaultSplitModal: () => void;
  closeAllModals: () => void;
}

export const useDatasetsModalStore = create<DatasetsModalState>((set) => ({
  addDatasetModal: false,
  editSplittingModal: false,
  editDefaultSplitModal: false,
  openAddDatasetModal: () => set({ addDatasetModal: true }),
  closeAddDatasetModal: () => set({ addDatasetModal: false }),
  openEditSplittingModal: () => set({ editSplittingModal: true }),
  closeEditSplittingModal: () => set({ editSplittingModal: false }),
  openEditDefaultSplitModal: () => set({ editDefaultSplitModal: true }),
  closeEditDefaultSplitModal: () => set({ editDefaultSplitModal: false }),
  closeAllModals: () =>
    set({
      addDatasetModal: false,
      editSplittingModal: false,
      editDefaultSplitModal: false,
    }),
}));
