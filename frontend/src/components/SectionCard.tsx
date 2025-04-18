import type React from "react";
import Spinner from "./Spinner";

interface SectionCardProps {
  loading?: boolean;
  children?: React.ReactNode;
  title?: string;
  className?: string;
  allowOverflow?: boolean;
}

const SectionCard: React.FC<SectionCardProps> = ({
  children,
  title,
  loading = false,
  className = "",
  allowOverflow = false,
}) => (
  <div className={className}>
    <div
      className={`relative ${
        allowOverflow ? "" : "overflow-auto"
      } rounded-lg bg-white px-6 pb-6 pt-4 shadow-md`}
    >
      {title !== undefined && (
        <div>
          <div className=" mb-4 inline-block rounded-sm border-b-2 border-cyan-600 pb-0 text-xl font-semibold tracking-wide text-black ">
            {title}
          </div>
        </div>
      )}
      {loading ? <LoadingContent /> : children}
    </div>
  </div>
);

const LoadingContent: React.FC = () => (
  <div className="flex h-32 flex-row items-center justify-center gap-2">
    <span className="text-lg font-semibold">Loading</span>
    <Spinner size="lg" />
  </div>
);

export default SectionCard;
