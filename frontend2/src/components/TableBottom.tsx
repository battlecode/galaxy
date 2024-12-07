import type React from "react";

interface TableBottomProps {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  onPage: (page: number) => void;
}

const TableBottom: React.FC<TableBottomProps> = ({
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

  /**
   *
   * @returns an array of page numbers, each of which will be rendered as a button.
   * The strings in the array, such as the ellipses will be rendered as disabled buttons.
   */
  function getPageNumbers(): Array<string | number> {
    // The maximum number of pages to show in the pagination bar.
    const MAX_PAGES = 15;
    // The number of pages to show on either side of the "..."
    const END_PAGES = 3;
    // The start/end buttons when we have lots of pages
    const START_BUTTONS = [1, "..."];
    const END_BUTTONS = ["...", pageCount];
    // The number of pages to show around the

    if (pageCount > MAX_PAGES) {
      // Determines where the ellipses should go based on the current page.
      if (currentPage <= MAX_PAGES - 2) {
        // TS hack: gets the array not to throw a type error.
        const pages: Array<string | number> = ["", 0]
          .concat(Array.from({ length: MAX_PAGES - 2 }, (_, idx) => idx + 1))
          .concat(END_BUTTONS);
        return pages.slice(2);
      } else if (currentPage >= pageCount - MAX_PAGES + END_PAGES) {
        return START_BUTTONS.concat(
          Array.from(
            { length: MAX_PAGES - START_BUTTONS.length },
            (_, idx) => pageCount - MAX_PAGES + idx + END_PAGES,
          ),
        );
      } else {
        return START_BUTTONS.concat(
          Array.from(
            { length: MAX_PAGES - START_BUTTONS.length - END_BUTTONS.length },
            (_, idx) => idx + currentPage - (END_PAGES + START_BUTTONS.length),
          ),
        ).concat(END_BUTTONS);
      }
    } else if (pageCount < 1) {
      // If we have no data, return this non-clickable placeholder.
      return ["1"];
    } else {
      return Array.from({ length: pageCount }, (_, idx) => idx + 1);
    }
  }

  return (
    <nav
      className="flex items-center justify-between"
      aria-label="Table navigation"
    >
      <span className="text-sm font-normal text-gray-500">
        Showing{" "}
        <span className="font-semibold text-gray-900">
          {first}-{last}
        </span>{" "}
        of <span className="font-semibold text-gray-900">{totalCount}</span>
      </span>
      <div className="inline-flex h-8 -space-x-px text-sm">
        <DirectionPageButton
          forward={false}
          disabled={backDisabled}
          currentPage={currentPage}
          onPage={onPage}
        />
        {getPageNumbers().map((page, idx) => (
          <PageButton
            key={idx}
            page={page}
            currentPage={currentPage}
            onPage={onPage}
          />
        ))}
        <DirectionPageButton
          forward={true}
          disabled={forwardDisabled}
          currentPage={currentPage}
          onPage={onPage}
        />
      </div>
    </nav>
  );
};

const DirectionPageButton: React.FC<{
  forward: boolean;
  disabled: boolean;
  currentPage: number;
  onPage: (page: number) => void;
}> = ({ forward, disabled, currentPage, onPage }) => {
  const className = `flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 ${
    forward ? "rounded-r-md " : "rounded-l-md "
  }${
    disabled ? "cursor-not-allowed " : ""
  }hover:bg-gray-100 hover:text-gray-700`;

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

export default TableBottom;
