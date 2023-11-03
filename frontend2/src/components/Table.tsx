import React from "react";
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
  keyFromValue: (data: T) => string;
  onRowClick?: (data: T) => void;
  bottomElement?: JSX.Element;
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
    <div className="pl-50 w-full">
      <table className="w-full text-left text-sm text-gray-500">
        <thead className="border-b bg-cyan-400 text-xs uppercase text-gray-700">
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col" className="px-8 py-3">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!loading &&
            data.map((row, idx) => (
              <tr
                key={keyFromValue(row)}
                onClick={(ev) => {
                  ev.stopPropagation();
                  onRowClick?.(row);
                }}
                className={
                  idx % 2 === 0
                    ? `${
                        onRowClick !== undefined ? "cursor-pointer" : ""
                      } border-b bg-white hover:bg-cyan-600 hover:text-gray-700`
                    : `${
                        onRowClick !== undefined ? "cursor-pointer" : ""
                      } border-b bg-gray-50 hover:bg-cyan-600 hover:text-gray-700`
                }
              >
                {columns.map((col) => (
                  <th
                    key={keyFromValue(row)}
                    scope="row"
                    className="whitespace-nowrap px-8 py-3 font-medium text-gray-900"
                  >
                    {col.value(row)}
                  </th>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
      {loading && (
        <div className="flex h-64 w-full flex-row items-center justify-center">
          <Spinner />
        </div>
      )}
      <div className="mx-10 text-center">{bottomElement}</div>
    </div>
  );
}

export default Table;
