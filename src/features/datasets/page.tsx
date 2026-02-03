import { Search, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { Feature } from "@/types";
import { AddDatasetModal } from "./components/AddDatasetModal";
import { EditDefaultSplitModal } from "./components/EditDefaultSplitModal";
import { EditSplittingModal } from "./components/EditSplittingModal";
import { useDatasetsModalStore } from "./stores/useDatasetsModalStore";
import { useDatasetsStore } from "./stores/useDatasetsStore";

const PREPROCESSING_TABS = [
  "Missing Data",
  "Scaling",
  "Encoding",
  "Feature Selection",
] as const;

type PreprocessingTab = (typeof PREPROCESSING_TABS)[number];

export default function DatasetsPage() {
  const { datasets, selectedDatasetId, selectDataset } = useDatasetsStore();
  const {
    openAddDatasetModal,
    openEditSplittingModal,
    openEditDefaultSplitModal,
  } = useDatasetsModalStore();

  const [fileName, setFileName] = useState("File name");
  const [tableName, setTableName] = useState("Optional");
  const [fileType, setFileType] = useState<string>("");
  const [groupColumn, setGroupColumn] = useState("Optional");
  const [targetFeature, setTargetFeature] = useState("Name");
  const [featuresCount, setFeaturesCount] = useState("Ex. 10");
  const [observationsCount, setObservationsCount] = useState("Ex. 500");

  const [featureName, setFeatureName] = useState("");
  const [dataType, setDataType] = useState<string>("");
  const [features, setFeatures] = useState<Feature[]>([
    { id: "1", name: "Feature 1", type: "str" },
    { id: "2", name: "Feature 2", type: "int" },
    { id: "3", name: "Feature 3", type: "float" },
    { id: "4", name: "Feature 4", type: "str" },
  ]);
  const [searchQuery, setSearchQuery] = useState("");

  const [activeTab, setActiveTab] = useState<PreprocessingTab>("Missing Data");

  const handleAddFeature = () => {
    if (featureName.trim()) {
      setFeatures([
        ...features,
        {
          id: crypto.randomUUID(),
          name: featureName,
          type: (dataType as Feature["type"]) || "str",
        },
      ]);
      setFeatureName("");
      setDataType("");
    }
  };

  const handleDeleteFeature = (id: string) => {
    setFeatures(features.filter((f) => f.id !== id));
  };

  const handleSelectDataset = (id: string) => {
    selectDataset(id);
    const dataset = datasets.find((d) => d.id === id);
    if (dataset) {
      setFileName(dataset.fileName);
      setTableName(dataset.tableName || "Optional");
      setFileType(dataset.fileType);
      setGroupColumn(dataset.groupColumn || "Optional");
      setTargetFeature(dataset.targetFeature || "Name");
      setFeaturesCount(dataset.featuresCount.toString());
      setObservationsCount(dataset.observationsCount.toString());
      setFeatures([...dataset.features]);
    }
  };

  const filteredFeatures = features.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div
      className="min-h-screen flex flex-col overflow-x-hidden pb-20 md:pb-0"
      style={{
        background:
          "linear-gradient(180deg, rgba(18, 18, 18, 1) 39%, rgba(40, 40, 40, 1) 100%)",
      }}
    >
      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="mx-auto w-full max-w-[1400px]">
          <div className="flex flex-col xl:flex-row gap-3 sm:gap-4">
            {/* Left Panel - Edit Dataset */}
            <div className="flex-1 bg-[#181818] border-2 border-[#404040] p-4 sm:p-6">
              {/* Header */}
              <div className="mb-4 sm:mb-6">
                <h2 className="h1-underline text-xl sm:text-2xl md:text-3xl lg:text-[36px] font-bold text-white font-display">
                  Edit Dataset
                </h2>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                {/* File Name */}
                <div>
                  <Label className="text-white text-sm sm:text-base lg:text-lg font-display mb-1 sm:mb-2 block">
                    File Name
                  </Label>
                  <Input
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="bg-[#282828] border-[#404040] text-white h-[32px] sm:h-[36px] text-sm sm:text-base placeholder:text-white/60"
                  />
                </div>

                {/* Table Name */}
                <div>
                  <Label className="text-white text-sm sm:text-base lg:text-lg font-display mb-1 sm:mb-2 block">
                    Table Name
                  </Label>
                  <Input
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    className="bg-[#282828] border-[#404040] text-white h-[32px] sm:h-[36px] text-sm sm:text-base placeholder:text-white/60"
                  />
                </div>

                {/* File Type */}
                <div>
                  <Label className="text-white text-sm sm:text-base lg:text-lg font-display mb-1 sm:mb-2 block">
                    File Type
                  </Label>
                  <Select value={fileType} onValueChange={setFileType}>
                    <SelectTrigger className="bg-[#282828] border-[#404040] text-white h-[32px] sm:h-[36px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#282828] border-[#404040]">
                      <SelectItem value="csv" className="text-white">
                        CSV
                      </SelectItem>
                      <SelectItem value="parquet" className="text-white">
                        Parquet
                      </SelectItem>
                      <SelectItem value="json" className="text-white">
                        JSON
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Group Column */}
                <div>
                  <Label className="text-white text-sm sm:text-base lg:text-lg font-display mb-1 sm:mb-2 block">
                    Group Column
                  </Label>
                  <Input
                    value={groupColumn}
                    onChange={(e) => setGroupColumn(e.target.value)}
                    className="bg-[#282828] border-[#404040] text-white h-[32px] sm:h-[36px] text-sm sm:text-base placeholder:text-white/60"
                  />
                </div>

                {/* Target Feature */}
                <div>
                  <Label className="text-white text-sm sm:text-base lg:text-lg font-display mb-1 sm:mb-2 block">
                    Target Feature
                  </Label>
                  <Input
                    value={targetFeature}
                    onChange={(e) => setTargetFeature(e.target.value)}
                    className="bg-[#282828] border-[#404040] text-white h-[32px] sm:h-[36px] text-sm sm:text-base placeholder:text-white/60"
                  />
                </div>

                {/* Features (#) */}
                <div>
                  <Label className="text-white text-sm sm:text-base lg:text-lg font-display mb-1 sm:mb-2 block">
                    Features (#)
                  </Label>
                  <Input
                    value={featuresCount}
                    onChange={(e) => setFeaturesCount(e.target.value)}
                    className="bg-[#282828] border-[#404040] text-white h-[32px] sm:h-[36px] text-sm sm:text-base placeholder:text-white/60"
                  />
                </div>

                {/* Observations (#) */}
                <div>
                  <Label className="text-white text-sm sm:text-base lg:text-lg font-display mb-1 sm:mb-2 block">
                    Observations (#)
                  </Label>
                  <Input
                    value={observationsCount}
                    onChange={(e) => setObservationsCount(e.target.value)}
                    className="bg-[#282828] border-[#404040] text-white h-[32px] sm:h-[36px] text-sm sm:text-base placeholder:text-white/60"
                  />
                </div>
              </div>

              {/* Feature Table Section */}
              <div className="flex flex-col md:flex-row border-2 border-[#404040]">
                {/* Left - Feature Input */}
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 border-b md:border-b-0 md:border-r border-[#404040] bg-[#181818] w-full md:w-[180px] lg:w-[200px]">
                  <div>
                    <Label className="text-white text-sm sm:text-base lg:text-lg font-display mb-1 sm:mb-2 block">
                      Feature Name
                    </Label>
                    <Input
                      value={featureName}
                      onChange={(e) => setFeatureName(e.target.value)}
                      placeholder="Name"
                      onKeyDown={(e) => e.key === "Enter" && handleAddFeature()}
                      className="bg-[#282828] border-[#404040] text-white h-[32px] sm:h-[36px] text-sm sm:text-base placeholder:text-white/60"
                    />
                  </div>
                  <div>
                    <Label className="text-white text-sm sm:text-base lg:text-lg font-display mb-1 sm:mb-2 block">
                      Data Type
                    </Label>
                    <Select value={dataType} onValueChange={setDataType}>
                      <SelectTrigger className="bg-[#282828] border-[#404040] text-white h-[32px] sm:h-[36px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#282828] border-[#404040]">
                        <SelectItem value="str" className="text-white">
                          str
                        </SelectItem>
                        <SelectItem value="int" className="text-white">
                          int
                        </SelectItem>
                        <SelectItem value="float" className="text-white">
                          float
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleAddFeature}
                    className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-[#181818] hover:bg-[#282828] text-white p-2"
                  >
                    <img src="/add.svg" alt="Add" className="w-full h-full" />
                  </Button>
                </div>

                {/* Right - Feature Table */}
                <div className="flex-1 flex flex-col min-h-[150px] sm:min-h-[200px]">
                  {/* Table Header */}
                  <div className="bg-[#121212] flex items-center px-3 sm:px-4 h-[32px] sm:h-[36px] border-b border-[#404040]">
                    <span className="flex-1 text-white text-sm sm:text-base lg:text-lg font-display">
                      Name
                    </span>
                    <span className="w-12 sm:w-16 text-white text-sm sm:text-base lg:text-lg font-display">
                      Type
                    </span>
                    <div className="w-6 sm:w-8" />
                  </div>

                  {/* Table Body */}
                  <div className="flex-1 overflow-y-auto max-h-[150px] sm:max-h-[200px]">
                    {filteredFeatures.map((feature, index) => (
                      <div
                        key={feature.id}
                        className={cn(
                          "flex items-center px-3 sm:px-4 h-[32px] sm:h-[36px]",
                          index % 2 === 0 ? "bg-[#181818]" : "bg-[#282828]",
                        )}
                      >
                        <span className="flex-1 text-white text-sm sm:text-base font-display truncate">
                          {feature.name}
                        </span>
                        <span className="w-12 sm:w-16 text-white text-sm sm:text-base font-display">
                          {feature.type}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteFeature(feature.id)}
                          className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-white hover:text-red-500"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Search */}
                  <div className="border-t border-[#404040] bg-[#282828] p-2">
                    <div className="relative">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search"
                        className="bg-[#282828] border-[#404040] text-white h-[26px] sm:h-[28px] pr-8 text-sm sm:text-base placeholder:text-white/60"
                      />
                      <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Edit Data Processing */}
            <div className="flex-1 bg-[#181818] border-2 border-[#404040] p-3 sm:p-4 lg:p-6">
              {/* Header */}
              <div className="mb-4 sm:mb-6">
                <h2 className="h1-underline text-xl sm:text-2xl md:text-3xl lg:text-[36px] font-bold text-white font-display">
                  Edit Data Processing
                </h2>
              </div>

              {/* Tabs - Scrollable on mobile */}
              <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
                {PREPROCESSING_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "card-hover-fade px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 border text-white font-display text-xs sm:text-sm lg:text-base transition-all duration-300 whitespace-nowrap relative",
                      activeTab === tab
                        ? "bg-[#282828] border-white"
                        : "bg-[#121212] border-[#404040] hover:bg-[#282828]",
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="border-2 border-[#404040] h-[200px] sm:h-[250px] lg:h-[300px] flex items-center justify-center">
                <p className="text-white/60 text-base sm:text-lg lg:text-xl font-display text-center px-4">
                  Select a preprocessor to configure
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4 sm:mt-6">
                <Button
                  onClick={openEditSplittingModal}
                  variant="outline"
                  className="border-[#404040] bg-[#121212] text-white hover:bg-[#282828] h-[36px] sm:h-[40px] lg:h-[44px] px-4 sm:px-6 text-sm sm:text-base lg:text-lg font-display"
                >
                  Edit Splitting
                </Button>
                <Button
                  onClick={openEditDefaultSplitModal}
                  variant="outline"
                  className="border-[#404040] bg-[#121212] text-white hover:bg-[#282828] h-[36px] sm:h-[40px] lg:h-[44px] px-4 sm:px-6 text-sm sm:text-base lg:text-lg font-display"
                >
                  Edit Default Split
                </Button>
              </div>
            </div>
          </div>

          {/* Datasets Bar */}
          <div className="bg-[#282828] border-2 border-[#363636] mt-3 sm:mt-4 overflow-hidden">
            <div className="flex gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 lg:p-4 overflow-x-auto items-center">
              {/* Existing Dataset Cards */}
              {datasets.length > 0 ? (
                datasets.map((dataset) => {
                  const isSelected = selectedDatasetId === dataset.id;
                  return (
                    <button
                      key={dataset.id}
                      type="button"
                      onClick={() => handleSelectDataset(dataset.id)}
                      className={cn(
                        "card-hover-fade shrink-0 w-[140px] sm:w-[160px] lg:w-[200px] h-[130px] sm:h-[150px] lg:h-[180px] p-2 sm:p-3 flex flex-col gap-1 sm:gap-2 border transition-colors duration-300 text-left relative",
                        isSelected
                          ? "bg-gradient-to-b from-[#1175d5] via-[#181818] via-[40%] to-[#121212] border-[#404040]"
                          : "bg-[#121212] border-[#363636] hover:bg-[#181818]",
                      )}
                    >
                      <div className="text-white text-base sm:text-lg lg:text-xl font-display truncate">
                        {dataset.name || "Dataset Name"}
                      </div>
                      <div className="h-[1px] bg-white/40 w-full" />
                      <div className="text-white/70 text-sm sm:text-base lg:text-lg font-display">
                        {dataset.observationsCount} x {dataset.featuresCount}
                      </div>
                      <div className="text-white/70 text-sm sm:text-base lg:text-lg font-display">
                        Group: {dataset.groupColumn || "None"}
                      </div>
                      <div className="text-white/70 text-sm sm:text-base lg:text-lg font-display">
                        File Type: {dataset.fileType?.toUpperCase() || "CSV"}
                      </div>
                    </button>
                  );
                })
              ) : (
                <>
                  {/* Mock cards when no datasets */}
                  <div className="shrink-0 w-[140px] sm:w-[160px] lg:w-[200px] h-[130px] sm:h-[150px] lg:h-[180px] p-2 sm:p-3 flex flex-col gap-1 sm:gap-2 border border-[#363636] bg-[#121212]">
                    <div className="text-white text-base sm:text-lg lg:text-xl font-display">
                      Dataset Name
                    </div>
                    <div className="h-[1px] bg-white/40 w-full" />
                    <div className="text-white/70 text-sm sm:text-base lg:text-lg font-display">
                      518 x 24
                    </div>
                    <div className="text-white/70 text-sm sm:text-base lg:text-lg font-display">
                      Group: None
                    </div>
                    <div className="text-white/70 text-sm sm:text-base lg:text-lg font-display">
                      File Type: CSV
                    </div>
                  </div>
                  <div className="shrink-0 w-[140px] sm:w-[160px] lg:w-[200px] h-[130px] sm:h-[150px] lg:h-[180px] p-2 sm:p-3 flex flex-col gap-1 sm:gap-2 border border-[#363636] bg-[#121212]">
                    <div className="text-white text-base sm:text-lg lg:text-xl font-display">
                      Testing
                    </div>
                    <div className="h-[1px] bg-white/40 w-full" />
                    <div className="text-white/70 text-sm sm:text-base lg:text-lg font-display">
                      447 x 10
                    </div>
                    <div className="text-white/70 text-sm sm:text-base lg:text-lg font-display">
                      Group: ID
                    </div>
                    <div className="text-white/70 text-sm sm:text-base lg:text-lg font-display">
                      File Type: SQL
                    </div>
                  </div>
                </>
              )}

              {/* Add Button */}
              <button
                type="button"
                onClick={openAddDatasetModal}
                className="shrink-0 w-[140px] sm:w-[160px] lg:w-[200px] h-[130px] sm:h-[150px] lg:h-[180px] border-2 border-dashed border-[#404040] flex items-center justify-center hover:bg-[#181818] transition-colors"
              >
                <img
                  src="/add.svg"
                  alt="Add Dataset"
                  className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 opacity-40"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddDatasetModal />
      <EditSplittingModal />
      <EditDefaultSplitModal />
    </div>
  );
}
