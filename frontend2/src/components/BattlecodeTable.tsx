import React from "react";
import Spinner from "./Spinner";

interface Column<T> {
  header: React.ReactNode;
  value: (data: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Array<Column<T>>;
  loading: boolean;
  onRowClick?: (data: T) => void;
  bottomElement?: JSX.Element;
}

/*
 * Generic function prop types don't work with React.FC.
 * For more, see https://stackoverflow.com/questions/68757395/how-to-make-a-functional-react-component-with-generic-type
 */
function BattlecodeTable<T>({
  data,
  columns,
  loading,
  onRowClick,
  bottomElement,
}: TableProps<T>): React.ReactElement {
  return (
    <div className="w-5/6 pl-50">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} scope="col" className="px-8 py-3">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!loading &&
            data.map((row, idx) => (
              <tr
                key={idx}
                onClick={(ev) => {
                  ev.stopPropagation();
                  onRowClick?.(row);
                }}
                className={
                  idx % 2 === 0
                    ? `bg-white border-b ${
                        onRowClick !== undefined
                          ? "cursor-pointer hover:bg-gray-100 hover:text-gray-700"
                          : ""
                      }}`
                    : `bg-gray-50 border-b ${
                        onRowClick !== undefined
                          ? "cursor-pointer hover:bg-gray-100 hover:text-gray-700"
                          : ""
                      }`
                }
              >
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    scope="row"
                    className="px-8 py-3 font-medium text-gray-900 whitespace-nowrap"
                  >
                    {col.value(row)}
                  </th>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
      {loading && (
        <div className="w-full h-64 flex flex-row items-center justify-center">
          <Spinner />
        </div>
      )}
      <div className="mx-10 text-center">{bottomElement}</div>
    </div>
  );
}

export default BattlecodeTable;
