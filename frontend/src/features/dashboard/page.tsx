import { StatsCard } from "@/features/dashboard/components/StatsCard";
import { useProjectModalStore } from "@/shared/stores/useProjectModalStore";
import { useProjectStore } from "@/shared/stores/useProjectStore";

export default function Home() {
  const { projectName } = useProjectStore();
  const { openEditModal } = useProjectModalStore();

  const statsCards = [
    { label: "Experiments", value: 40, href: "/experiments" },
    { label: "Groups", value: 3 },
    { label: "Datasets", value: 2, href: "/datasets" },
    { label: "Algorithms", value: 7, href: "/algorithms" },
    { label: "Metrics", value: 10 },
  ];

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden pb-20 md:pb-0">
      {/* Project Header */}
      <header className="bg-bg-secondary px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-5 md:py-6 lg:py-[20px]">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6 sm:gap-8 lg:gap-12">
          <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 lg:min-w-[400px]">
            <button
              type="button"
              className="relative group cursor-pointer py-2 -my-2 px-2 -mx-2 rounded-lg w-full text-left bg-transparent border-none"
              onClick={() => openEditModal()}
            >
              <div className="absolute -left-[1px] top-0 bottom-0 w-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-t from-transparent via-50% via-[#1175d5] to-transparent rounded-l-lg">
                  <div className="absolute -left-[3px] top-[20%] bottom-[20%] w-[8px] bg-[#1175d5] blur-[5px]" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,155,252,0.3)] via-[rgba(10,155,252,0.1)] to-transparent rounded-lg" />
              </div>
              <h1 className="relative z-10 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[48px] font-bold text-white font-display leading-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
                {projectName}
              </h1>
            </button>

            <div className="flex gap-6 sm:gap-8 md:gap-12 lg:gap-[75px] items-center pl-1 sm:pl-2 lg:pl-[13px]">
              <button
                type="button"
                className="relative flex items-center gap-2 sm:gap-3 cursor-pointer py-2 px-2 -my-2 -mx-2 rounded-lg group/link bg-transparent border-none"
                title="GitHub"
              >
                <div className="absolute -left-[1px] top-0 bottom-0 w-full pointer-events-none opacity-0 group-hover/link:opacity-100 transition-opacity duration-300 rounded-lg">
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-t from-transparent via-50% via-[#1175d5] to-transparent rounded-l-lg">
                    <div className="absolute -left-[3px] top-[20%] bottom-[20%] w-[8px] bg-[#1175d5] blur-[5px]" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,155,252,0.3)] via-[rgba(10,155,252,0.1)] to-transparent rounded-lg" />
                </div>
                <img
                  src="/gthub.svg"
                  alt=""
                  className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 opacity-80 group-hover/link:opacity-100 transition-opacity"
                />
                <span className="relative z-10 text-white text-base sm:text-lg font-display opacity-0 group-hover/link:opacity-100 transition-opacity">
                  GitHub
                </span>
              </button>
              <button
                type="button"
                className="relative flex items-center gap-2 sm:gap-3 cursor-pointer py-2 px-2 -my-2 -mx-2 rounded-lg group/link bg-transparent border-none"
                title="Documentation"
              >
                <div className="absolute -left-[1px] top-0 bottom-0 w-full pointer-events-none opacity-0 group-hover/link:opacity-100 transition-opacity duration-300 rounded-lg">
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-t from-transparent via-50% via-[#1175d5] to-transparent rounded-l-lg">
                    <div className="absolute -left-[3px] top-[20%] bottom-[20%] w-[8px] bg-[#1175d5] blur-[5px]" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,155,252,0.3)] via-[rgba(10,155,252,0.1)] to-transparent rounded-lg" />
                </div>
                <img
                  src="/documentation.svg"
                  alt=""
                  className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 opacity-80 group-hover/link:opacity-100 transition-opacity"
                />
                <span className="relative z-10 text-white text-base sm:text-lg font-display opacity-0 group-hover/link:opacity-100 transition-opacity">
                  Documentation
                </span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex-1 w-full min-w-0 overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-3 xl:gap-4 2xl:gap-[24px]">
              {statsCards.map((stat) => (
                <StatsCard key={stat.label} {...stat} />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Container */}
      <main className="flex-1 flex flex-col overflow-y-auto px-4 sm:px-6 md:px-8 lg:pl-[15px] lg:pr-[19px] pt-1 sm:pt-1.5 lg:pt-[6px] pb-1 sm:pb-1.5 lg:pb-[6px]">
      <div className="flex-1 border-2 border-border-primary px-4 sm:px-5 md:px-6 lg:px-[26px] py-4 sm:py-5 md:py-6 lg:py-[29px] flex flex-col bg-bg-dashboard">
          <div className="flex-1 flex flex-col xl:flex-row gap-4 sm:gap-5 md:gap-6 lg:gap-[35px]">
            {/* Result Summary */}
            <div className="flex-1 xl:flex-[2.5] 2xl:flex-[2.93] border-2 border-border-secondary p-4 sm:p-5 md:p-4 lg:p-[18px] flex flex-col bg-bg-secondary">
              <div className="w-fit mb-8 sm:mb-12 lg:mb-16">
                <h2 className="h1-underline text-2xl sm:text-3xl md:text-4xl lg:text-[36px] font-bold text-white mb-2 sm:mb-3 lg:mb-[16px] tracking-tight leading-none font-display">
                  Result Summary
                </h2>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] font-normal text-white font-display leading-none text-center">
                  Coming Soon...
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="flex-1 border-2 border-border-secondary p-4 sm:p-5 md:p-4 lg:p-[18px] flex flex-col bg-bg-secondary">
              <div className="w-fit mb-8 sm:mb-12 lg:mb-16">
                <h2 className="h1-underline text-xl sm:text-2xl md:text-3xl lg:text-[28px] font-normal text-white mb-2 sm:mb-3 lg:mb-[22px] tracking-tight leading-none font-display">
                  Recent Activity
                </h2>
              </div>

              <div className="flex-1 flex items-center justify-center text-center">
                <p className="text-lg sm:text-xl md:text-2xl lg:text-[28px] font-normal text-white font-display leading-none">
                  Coming Soon...
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
