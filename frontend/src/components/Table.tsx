import type React from "react";
import Spinner from "./Spinner";

export interface Column<T> {
  header: React.ReactNode;
  key: string;
  value: (data: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Array<Column<T>>;
  loading: boolean;
  keyFromValue: (data: T) => React.Key;
  onRowClick?: (data: T) => void;
  bottomElement?: React.JSX.Element;
}

/*
 * Generic function prop types don't work with React.FC.
 * For more, see https://stackoverflow.com/questions/68757395/how-to-make-a-functional-react-component-with-generic-type
 */
function Table<T>({
  data,
  columns,
  loading,
  keyFromValue,
  onRowClick,
  bottomElement,
}: TableProps<T>): React.ReactElement {
  return (
    <div className="pl-50 w-full overflow-auto rounded-lg shadow-md">
      {/* MOBILE PAGINATION */}
      <div className="rounded-t-lg border-b-2 border-cyan-700 bg-gray-50 md:hidden">
        {bottomElement}
      </div>

      {/* MOBILE TABLE */}
      <div className="flex w-full flex-col md:hidden">
        <table className="w-full border-collapse overflow-hidden rounded-b-lg border-b-0 text-left text-sm text-gray-500">
          {!loading &&
            data.map((row, rowIdx) => (
              <tbody
                key={"mobile" + "rowbody" + keyFromValue(row).toString()}
                onClick={(ev) => {
                  ev.stopPropagation();
                  onRowClick?.(row);
                }}
                className={` border-gray-400  hover:text-gray-700 ${
                  rowIdx % 2 === 0 ? "bg-white" : "bg-gray-100"
                }`}
              >
                {columns.map((col, colIdx) => (
                  <tr
                    key={
                      "mobile" + "row" + col.key + keyFromValue(row).toString()
                    }
                  >
                    <th
                      key={"mobile" + "header" + col.key}
                      scope="col"
                      className={`bg-cyan-700 py-3 pl-4 pr-3 font-bold text-white ${
                        colIdx === columns.length - 1 &&
                        rowIdx < data.length - 1
                          ? "border-b border-white"
                          : ""
                      }`}
                    >
                      {col.header}
                    </th>
                    <td
                      key={
                        "mobile" +
                        "cell" +
                        col.key +
                        keyFromValue(row).toString()
                      }
                      scope="row"
                      className="text-ellipsis whitespace-normal px-8 py-3 font-medium text-gray-900"
                    >
                      {col.value(row)}
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
        </table>
      </div>

      {/* WIDESCREEN TABLE */}
      <div className="hidden w-full md:flex md:flex-col">
        <table className="w-full border-collapse overflow-hidden rounded-t-lg text-left text-sm text-gray-500">
          <thead className="bg-cyan-700 font-bold text-white">
            <tr>
              {columns.map((col) => (
                <th key={"header" + col.key} scope="col" className="px-8 py-3">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!loading &&
              data.map((row, idx) => (
                <tr
                  key={"row" + keyFromValue(row).toString()}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onRowClick?.(row);
                  }}
                  className={` border-gray-400  hover:text-gray-700 ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-100"
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={"cell" + col.key + keyFromValue(row).toString()}
                      scope="row"
                      className="text-ellipsis whitespace-normal px-8 py-3 font-medium text-gray-900"
                    >
                      {col.value(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className="flex h-64 w-full flex-row items-center justify-center">
          <Spinner size="xl" />
        </div>
      )}
      <div className="hidden rounded-b-lg bg-white md:flex">
        {bottomElement}
      </div>
    </div>
  );
}

export default Table;
