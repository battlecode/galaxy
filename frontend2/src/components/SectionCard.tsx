import React from "react";

interface SectionCardProps {
  children?: React.ReactNode;
  title?: string;
  className?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({
  children,
  title,
  className = "",
}) => {
  return (
    <div className={className}>
      {title !== undefined && (
        <div className="mb-2 text-xl font-semibold tracking-wide">{title}</div>
      )}
      <div className={`relative overflow-auto rounded bg-white p-6 shadow-md`}>
        <div className="absolute inset-0 h-full w-1 rounded-l bg-cyan-600" />
        {children}
      </div>
    </div>
  );
};

export default SectionCard;
