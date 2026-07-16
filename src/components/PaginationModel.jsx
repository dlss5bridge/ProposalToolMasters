import React from "react";
import "./PaginationCss.css";

function PaginationComponent({ totalPages, currentPage, onPageChange }) {
  const getDisplayedPageNumbers = () => {
    const maxPagesToShow = 3; // Desired number of page numbers to display
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, currentPage - halfPagesToShow);
    let endPage = Math.min(totalPages, currentPage + halfPagesToShow);

    // Adjust start and end pages if necessary to show exactly maxPagesToShow
    if (endPage - startPage + 1 < maxPagesToShow) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
    }

    const displayedPageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      displayedPageNumbers.push(i);
    }

    return displayedPageNumbers;
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber !== currentPage) {
      onPageChange(pageNumber);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const goToFirstPage = () => {
    if (currentPage !== 1) {
      onPageChange(1);
    }
  };

  const goToLastPage = () => {
    if (currentPage !== totalPages) {
      onPageChange(totalPages);
    }
  };

  const displayedPageNumbers = getDisplayedPageNumbers();

  return (
    <div className="fixed-bottom container" style={{ bottom: "30px" }}>
      <div className="row align-items-center gy-2 text-center text-sm-start mb-4">
        <div className="col-sm-auto">
          <ul className="pagination pagination-separated pagination-sm gap-1 justify-content-center justify-content-sm-start">
            {totalPages > 3 && (
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                onClick={goToFirstPage}
              >
                <a href="#" className="page-link">
                  <b>
                    <i className="mdi mdi-chevron-double-left"></i>
                  </b>
                </a>
              </li>
            )}
            <li
              className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              onClick={previousPage}
            >
              <a href="#" className="page-link">
                <b>
                  <i className="mdi mdi-chevron-left"></i>
                </b>
              </a>
            </li>
            {displayedPageNumbers.map((pageNumber) => (
              <li
                className={`page-item ${
                  currentPage === pageNumber ? "active" : ""
                }`}
                onClick={() => handlePageChange(pageNumber)}
                key={pageNumber}
              >
                <a href="#" className="page-link">
                  {pageNumber}
                </a>
              </li>
            ))}
            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
              onClick={nextPage}
            >
              <a href="#" className="page-link">
                <b>
                  <i className="mdi mdi-chevron-right"></i>
                </b>
              </a>
            </li>
            {totalPages > 3 && (
              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
                onClick={goToLastPage}
              >
                <a href="#" className="page-link">
                  <b>
                    <i className="mdi mdi-chevron-double-right"></i>
                  </b>
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PaginationComponent;

// import React from "react";
// import "./PaginationCss.css";

// function PaginationComponent({ totalPages, currentPage, onPageChange }) {
//   const getDisplayedPageNumbers = () => {
//     const maxPagesToShow = 3; // Desired number of page numbers to display
//     const halfPagesToShow = Math.floor(maxPagesToShow / 2);

//     let startPage = Math.max(1, currentPage - halfPagesToShow);
//     let endPage = Math.min(totalPages, currentPage + halfPagesToShow);

//     // Adjust start and end pages if necessary to show exactly maxPagesToShow
//     if (endPage - startPage + 1 < maxPagesToShow) {
//       if (startPage === 1) {
//         endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
//       } else if (endPage === totalPages) {
//         startPage = Math.max(1, endPage - maxPagesToShow + 1);
//       }
//     }

//     const displayedPageNumbers = [];
//     for (let i = startPage; i <= endPage; i++) {
//       displayedPageNumbers.push(i);
//     }

//     return displayedPageNumbers;
//   };

//   const handlePageChange = (pageNumber) => {
//     if (pageNumber !== currentPage) {
//       onPageChange(pageNumber);
//     }
//   };

//   const previousPage = () => {
//     if (currentPage > 1) {
//       onPageChange(currentPage - 1);
//     }
//   };

//   const nextPage = () => {
//     if (currentPage < totalPages) {
//       onPageChange(currentPage + 1);
//     }
//   };

//   const goToFirstPage = () => {
//     if (currentPage !== 1) {
//       onPageChange(1);
//     }
//   };

//   const goToLastPage = () => {
//     if (currentPage !== totalPages) {
//       onPageChange(totalPages);
//     }
//   };

//   const displayedPageNumbers = getDisplayedPageNumbers();

//   return (
//     <div className="fixed-bottom container">
//       <div className="row align-items-center gy-2 text-center text-sm-start mb-4">
//         <div className="col-sm-auto">
//           <ul className="pagination pagination-separated pagination-sm gap-1 justify-content-center justify-content-sm-start">
//             {totalPages > 3 && <li
//               className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
//               onClick={goToFirstPage}
//             >
//               <a href="#" className="page-link">
//                 <b>
//                   <i className="mdi mdi-chevron-double-left"></i>
//                 </b>
//               </a>
//             </li>
//             }
//             <li
//               className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
//               onClick={previousPage}
//             >
//               <a href="#" className="page-link">
//                 <b>
//                   <i className="mdi mdi-chevron-left"></i>
//                 </b>
//               </a>
//             </li>
//             {displayedPageNumbers.map((pageNumber) => (
//               <li
//                 className={`page-item ${currentPage === pageNumber ? "active" : ""
//                   }`}
//                 onClick={() => handlePageChange(pageNumber)}
//                 key={pageNumber}
//               >
//                 <a href="#" className="page-link">
//                   {pageNumber}
//                 </a>
//               </li>
//             ))}
//             <li
//               className={`page-item ${currentPage === totalPages ? "disabled" : ""
//                 }`}
//               onClick={nextPage}
//             >
//               <a href="#" className="page-link">
//                 <b>
//                   <i className="mdi mdi-chevron-right"></i>
//                 </b>
//               </a>
//             </li>
//             {totalPages > 3 && <li
//               className={`page-item ${currentPage === totalPages ? "disabled" : ""
//                 }`}
//               onClick={goToLastPage}
//             >
//               <a href="#" className="page-link">
//                 <b>
//                   <i className="mdi mdi-chevron-double-right"></i>
//                 </b>
//               </a>
//             </li>}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default PaginationComponent;
