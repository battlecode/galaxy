import type React from "react";
import Icon from "./elements/Icon";
import { useCallback, useMemo, useRef } from "react";

interface TableBottomProps {
  querySuccess: boolean;
  totalCount: number;
  pageSize: number;
  currentPage: number;
  onPage: (page: number) => void;
}

type Breakpoint = "sm" | "md";

const BREAKPOINTS: Record<Breakpoint, { max: number; end: number }> = {
  sm: { max: 5, end: 1 },
  md: { max: 13, end: 3 },
};

const TableBottom: React.FC<TableBottomProps> = ({
  querySuccess,
  totalCount,
  pageSize,
  currentPage,
  onPage,
}) => {
  const prevCount = useRef(totalCount);

  const stabilizedDisplayCount: number = useMemo(() => {
    // While we are reloading the query, we want to display the previous count.
    if (!querySuccess) {
      return prevCount.current;
    } else {
      prevCount.current = totalCount; // Update the previous count
      return totalCount;
    }
  }, [totalCount, querySuccess]);

  const first = (currentPage - 1) * pageSize + 1;
  const last = Math.min(currentPage * pageSize, stabilizedDisplayCount);

  return (
    <nav
      className="flex h-full w-full flex-row items-center justify-between gap-2 px-3 py-2 md:px-10"
      aria-label="Table navigation"
    >
      {/* Pagination progress that displays on wider screens */}
      <span className="hidden h-full items-center gap-1 text-sm font-normal text-gray-500 md:flex md:flex-row">
        Showing{" "}
        <span className="font-semibold text-gray-900">
          {first}-{last}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-gray-900">
          {stabilizedDisplayCount}
        </span>
      </span>

      {/* Pagination progress that displays on smaller screens */}
      <span className="flex h-full flex-col items-center gap-1 text-sm font-normal text-gray-500 md:hidden">
        <span className="font-semibold text-gray-900">
          {first}-{last}
        </span>{" "}
        /{" "}
        <span className="font-semibold text-gray-900">
          {stabilizedDisplayCount}
        </span>
      </span>

      <PageButtonsList
        recordCount={stabilizedDisplayCount}
        pageSize={pageSize}
        currentPage={currentPage}
        onPage={onPage}
      />
    </nav>
  );
};

export const PageButtonsList: React.FC<{
  recordCount: number;
  pageSize: number;
  currentPage: number;
  onPage: (page: number) => void;
}> = ({ recordCount, pageSize, currentPage, onPage }) => {
  const pageCount = Math.max(1, Math.ceil(recordCount / pageSize));

  const backDisabled = currentPage <= 1;
  const forwardDisabled = currentPage >= pageCount;

  /**
   *
   * @returns an array of page numbers, each of which will be rendered as a button.
   * The strings in the array, such as the ellipses will be rendered as disabled buttons.
   */
  const getPageNumbers = useCallback(
    (sizeBreakpoint: Breakpoint): Array<string | number> => {
      // The maximum number of pages to show in the pagination bar.
      const MAX_PAGES = BREAKPOINTS[sizeBreakpoint].max;
      // The number of pages to show on either side of the "..."
      const END_PAGES = BREAKPOINTS[sizeBreakpoint].end;
      // The start/end buttons when we have lots of pages
      const START_BUTTONS = [1, "..."];
      const END_BUTTONS = ["...", pageCount];

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
              (_, idx) =>
                Math.round(
                  idx +
                    currentPage -
                    (MAX_PAGES - START_BUTTONS.length - END_BUTTONS.length) / 2,
                ),
            ),
          ).concat(END_BUTTONS);
        }
      } else if (pageCount < 1) {
        // If we have no data, return this non-clickable placeholder.
        return ["1"];
      } else {
        return Array.from({ length: pageCount }, (_, idx) => idx + 1);
      }
    },
    [currentPage, pageCount],
  );

  return (
    <div
      className="flex h-8 flex-row text-sm"
      key={pageCount.toString() + currentPage.toString()}
    >
      <DirectionPageButton
        forward={false}
        disabled={backDisabled}
        currentPage={currentPage}
        onPage={onPage}
      />
      {/* Page numbers that display on wider screens */}
      <div className="hidden md:flex">
        {getPageNumbers("md").map((page, idx) => (
          <PageButton
            key={page.toString() + idx.toString()}
            page={page}
            currentPage={currentPage}
            onPage={onPage}
          />
        ))}
      </div>
      {/* Page numbers that display on smaller screens */}
      <div className="flex md:hidden">
        {getPageNumbers("sm").map((page, idx) => (
          <PageButton
            key={page.toString() + idx.toString()}
            page={page}
            currentPage={currentPage}
            onPage={onPage}
          />
        ))}
      </div>
      <DirectionPageButton
        forward={true}
        disabled={forwardDisabled}
        currentPage={currentPage}
        onPage={onPage}
      />
    </div>
  );
};

const DirectionPageButton: React.FC<{
  forward: boolean;
  disabled: boolean;
  currentPage: number;
  onPage: (page: number) => void;
}> = ({ forward, disabled, currentPage, onPage }) => {
  const className = `flex items-center justify-center px-2 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 ${
    forward ? "rounded-r-md border-l-0" : "rounded-l-md"
  } ${
    disabled ? "cursor-not-allowed" : ""
  } hover:bg-gray-100 hover:text-gray-700`;

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
      <Icon size="sm" name={forward ? "chevron_right" : "chevron_left"} />
    </button>
  );
};

const PageButton: React.FC<{
  page: number | string;
  onPage: (page: number) => void;
  currentPage: number;
}> = ({ page, onPage, currentPage }) => {
  const clickable = typeof page === "number";

  const baseClassName =
    "flex items-center justify-center px-3 h-8 border border-l-0 border-gray-300 hover:bg-blue-100 hover:text-blue-700";
  const pageClassName =
    page === currentPage
      ? "text-blue-600 bg-blue-50"
      : "leading-tight text-gray-500 bg-white";
  const clickableClassName = clickable ? "cursor-pointer" : "cursor-auto";

  return (
    <button
      type="button"
      onClick={(ev) => {
        ev.stopPropagation();
        if (clickable) {
          onPage(page);
        }
      }}
      aria-current="page"
      className={`${baseClassName} ${pageClassName} ${clickableClassName}`}
    >
      {page}
    </button>
  );
};

export default TableBottom;
