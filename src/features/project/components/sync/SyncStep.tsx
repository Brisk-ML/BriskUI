import { Check, RefreshCw, Upload } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function SyncStep() {
  return (
    <div className="w-full max-w-[800px] px-4 xl:px-0 mx-auto">
      {/* Main Container */}
      <div className="bg-[#181818] border-2 border-[#404040] p-6 sm:p-8">
        {/* Header */}
        <div className="mb-8 sm:mb-10 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-white font-display relative inline-block">
            Sync Project
            <div className="absolute bottom-0 left-0 w-full h-[4px] bg-white" />
          </h1>
        </div>

        {/* Status */}
        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#00a878] flex items-center justify-center">
            <Check className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
          <p className="text-white text-xl sm:text-2xl font-display text-center">
            Your project is ready to sync!
          </p>
          <p className="text-white/60 text-base sm:text-lg font-display text-center max-w-md">
            All configurations have been saved. Click the button below to sync
            your project to the server.
          </p>
        </div>

        {/* Summary */}
        <div className="border border-[#404040] p-4 sm:p-6 mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-white font-display mb-4">
            Project Summary
          </h2>
          <div className="space-y-2 text-white/80 font-display">
            <p>• Project Information: Configured</p>
            <p>• Datasets: Added</p>
            <p>• Data Processing: Configured</p>
            <p>• Algorithms: Selected</p>
            <p>• Experiments: Created</p>
            <p>• Workflow: Defined</p>
            <p>• Report Settings: Customized</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            className="border-[#404040] bg-[#282828] text-white hover:bg-[#383838] h-[50px] px-8 text-lg font-display"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Review Settings
          </Button>
          <Button className="bg-[#006b4c] hover:bg-[#005a3f] text-white h-[50px] px-8 text-lg font-display">
            <Upload className="w-5 h-5 mr-2" />
            Sync Now
          </Button>
        </div>
      </div>
    </div>
  );
}
