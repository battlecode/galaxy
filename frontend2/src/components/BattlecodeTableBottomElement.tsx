import React from "react";

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

  function getPageNumbers(): Array<string | number> {
    const MAX_PAGES = 15;
    if (pageCount > MAX_PAGES) {
      if (currentPage <= MAX_PAGES - 2) {
        const pages: Array<string | number> = ["", 0]
          .concat(Array.from({ length: MAX_PAGES - 2 }, (_, idx) => idx + 1))
          .concat(["...", pageCount]);
        return pages.slice(2);
      } else if (currentPage >= pageCount - MAX_PAGES + 3) {
        return [1, "..."].concat(
          Array.from(
            { length: MAX_PAGES - 2 },
            (_, idx) => pageCount - MAX_PAGES + idx + 3
          )
        );
      } else {
        return [1, "..."]
          .concat(
            Array.from(
              { length: MAX_PAGES - 4 },
              (_, idx) => idx + currentPage - 5
            )
          )
          .concat(["...", pageCount]);
      }
    } else if (pageCount < 1) {
      return ["1"];
    } else {
      return Array.from({ length: pageCount }, (_, idx) => idx + 1);
    }
  }

  return (
    <nav
      className="flex items-center justify-between pt-4"
      aria-label="Table navigation"
    >
      <span className="text-sm font-normal text-gray-500">
        Showing{" "}
        <span className="font-semibold text-gray-900">
          {first}-{last}
        </span>{" "}
        of <span className="font-semibold text-gray-900">{totalCount}</span>
      </span>
      <ul className="inline-flex -space-x-px text-sm h-8">
        <li>
          <DirectionPageButton
            forward={false}
            disabled={backDisabled}
            currentPage={currentPage}
            onPage={onPage}
          />
        </li>
        {getPageNumbers().map((page, idx) => (
          <li key={idx}>
            <PageButton page={page} currentPage={currentPage} onPage={onPage} />
          </li>
        ))}
        <li>
          <DirectionPageButton
            forward={true}
            disabled={forwardDisabled}
            currentPage={currentPage}
            onPage={onPage}
          />
        </li>
      </ul>
    </nav>
  );
};

const DirectionPageButton: React.FC<{
  forward: boolean;
  disabled: boolean;
  currentPage: number;
  onPage: (page: number) => void;
}> = ({ forward, disabled, currentPage, onPage }) => {
  const className = disabled
    ? `flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-${
      forward ? "r" : "l"
    }-lg cursor-not-allowed`
    : `flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-${
      forward ? "r" : "l"
    }-lg hover:bg-gray-100 hover:text-gray-700`;

  return (
    <button
      type="button"
      onClick={(ev) => {
        if (!disabled) {
          onPage(forward ? currentPage + 1 : currentPage - 1);
        }
        ev.stopPropagation();
      }}
      className={className}
      disabled={disabled}
    >
      {forward ? "Next" : "Previous"}
    </button>
  );
};

const PageButton: React.FC<{
  page: number | string;
  onPage: (page: number) => void;
  currentPage: number;
}> = ({ page, onPage, currentPage }) => {
  const className =
    page === currentPage
      ? "flex items-center justify-center px-3 h-8 text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700"
      : "flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700";

  return (
    <button
      type="button"
      onClick={(ev) => {
        ev.stopPropagation();
        if (typeof page === "number") {
          onPage(page);
        }
      }}
      aria-current="page"
      className={className}
    >
      {page}
    </button>
  );
};

export default BattlecodeTableBottomElement;
