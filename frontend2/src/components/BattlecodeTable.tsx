import React from "react";

interface Column<T> {
  header: React.ReactNode;
  value: (data: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
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
  onRowClick,
  bottomElement,
}: TableProps<T>) {
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} scope="col" className="px-6 py-3">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              onClick={(ev) => {
                ev.stopPropagation();
                onRowClick?.(row);
              }}
              className={
                idx % 2 === 0
                  ? "bg-white border-b dark:bg-gray-900 dark:border-gray-700"
                  : "bg-gray-50 border-b dark:bg-gray-800 dark:border-gray-700"
              }
            >
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {col.value(row)}
                </th>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {bottomElement}
    </div>
  );
}

export default BattlecodeTable;
