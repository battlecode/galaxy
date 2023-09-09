import React from "react";

interface PageTitleProps {
  children?: React.ReactNode;
}

export const PageTitle: React.FC<PageTitleProps> = ({
  children,
}: PageTitleProps) => {
  return (
    <h1 className="mb-2 text-3xl font-bold leading-7 text-gray-900">
      {children}
    </h1>
  );
};
