import React, { useMemo } from "react";

interface TableBottomProps {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  onPage: (page: number) => void;
}

const BattlecodeTableBottomElement: React.FC<TableBottomProps> = ({
  totalCount,
  pageSize,
  currentPage,
  onPage,
}) => {
  const first = (currentPage - 1) * pageSize + 1;
  const last = Math.min(currentPage * pageSize, totalCount);
  const pageCount = Math.ceil(totalCount / pageSize);

  const backDisabled = currentPage <= 1;
  const forwardDisabled = currentPage >= pageCount;

  return (
    <nav
      className="flex items-center justify-between pt-4"
      aria-label="Table navigation"
    >
      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
        Showing{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {first}-{last}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {totalCount}
        </span>
      </span>
      <ul className="inline-flex -space-x-px text-sm h-8">
        <li>
          <button
            type="button"
            onClick={(ev) => {
              ev.stopPropagation();
              if (!backDisabled) {
                onPage(currentPage - 1);
              }
            }}
            className={
              backDisabled
                ? "flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                : "flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 cursor-not-allowed"
            }
            disabled={backDisabled}
          >
            Previous
          </button>
        </li>
        {Array.from({ length: pageCount }, (_, idx) => (
          <li key={idx}>
            {idx + 1 === currentPage ? (
              <button
                type="button"
                onClick={(ev) => {
                  ev.stopPropagation();
                  onPage(idx + 1);
                }}
                className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                {idx + 1}
              </button>
            ) : (
              <button
                type="button"
                onClick={(ev) => {
                  ev.stopPropagation();
                  onPage(idx + 1);
                }}
                aria-current="page"
                className="flex items-center justify-center px-3 h-8 text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
              >
                {idx + 1}
              </button>
            )}
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={(ev) => {
              ev.stopPropagation();
              if (!forwardDisabled) {
                onPage(currentPage + 1);
              }
            }}
            className={
              backDisabled
                ? "flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                : "flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 cursor-not-allowed"
            }
            disabled={forwardDisabled}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default BattlecodeTableBottomElement;
