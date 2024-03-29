import React, { Component } from "react";

class PaginationControl extends Component {
  render() {
    const { props } = this;

    if (!props.pageLimit || props.pageLimit <= 1) {
      return null;
    }

    const items = [];
    const isFirst = props.page === 1;
    const isLast = props.page === props.pageLimit;

    items.push(
      <li className={isFirst ? "page-item disabled" : "page-item"} key="prev">
        <a
          className="page-link"
          onClick={() => {
            if (!isFirst) {
              props.onPageClick(props.page - 1);
            }
          }}
          disabled={isFirst}
        >
          Previous
        </a>
      </li>
    );

    for (let i = 1; i <= props.pageLimit; i++) {
      items.push(
        <li
          className={i === props.page ? "page-item active" : "page-item"}
          key={i}
        >
          <a className="page-link" onClick={() => props.onPageClick(i)}>
            {i}
          </a>
        </li>
      );
    }

    items.push(
      <li className={isLast ? "page-item disabled" : "page-item"} key="next">
        <a
          className="page-link"
          onClick={() => {
            if (!isLast) {
              props.onPageClick(props.page + 1);
            }
          }}
          disabled={isLast}
        >
          Next
        </a>
      </li>
    );

    return (
      <div className="pagination-control">
        <ul className="pagination">{items}</ul>
      </div>
    );
  }
}

export default PaginationControl;
