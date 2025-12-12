import type React from "react";

interface PageTitleProps {
  children?: React.ReactNode;
}

export const PageTitle: React.FC<PageTitleProps> = ({
  children,
}: PageTitleProps) => (
  <h1 className="mb-2 text-3xl font-bold leading-7 text-gray-900">
    {children}
  </h1>
);

interface PageContainerProps {
  children?: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = "",
}: PageContainerProps) => (
  <div className={`flex h-full w-full flex-col overflow-auto p-6 ${className}`}>
    {children}
  </div>
);
