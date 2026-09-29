import React, { useContext, useState } from "react";
import { AuthContextProvider } from "../AuthContext/AuthContext";
import { ERROR_MESSAGES } from "./GlobalMessage";
import NoResultFoundModel from "./NoResultFoundModel";
import { Tooltip } from "@mui/material";

export const SelectedProposalCustomize = (props) => {
  const { isMobile, formatValue } = useContext(AuthContextProvider);
  const moduleNameForSaveAsDraft = "SelectPackages";
  const statusId = 1;
  const { ProposalObject } = props;
  return (
    <>
      <div className="tab-content create-practice-height">
        <div className="tab-pane p-3 active selected-Packages-Table mb-3 ">
          <div className="row">
            <div className="col-12 ">
              {ProposalObject &&
                ProposalObject.selectedProposalTypeValue === 1 && (
                  <h6>Packaged (Customizable) </h6>
                )}
              {ProposalObject &&
                ProposalObject.selectedProposalTypeValue === 2 && (
                  <h6>Packaged (Standard)</h6>
                )}

              <div className="separator mb-2"></div>
              <div className="table-responsive package-select-table">
              <table
                className="table align-middle table-nowrap"
                id="customerTable"
              >
                <thead className="table-light table-header-font">
                  <tr className="head-row">
                    <td
                      className="tr-table-class text-white"
                      style={{ width: "50%" }}
                    >
                      Packages
                    </td>
                    <td className="tr-table-class text-white">
                      Recurring Fees (£)
                    </td>
                    <td className="tr-table-class text-white text-right">
                      One-Off Fees (£)
                    </td>
                  </tr>
                </thead>
                <tbody className="list form-check-all">
                  {props?.getServicePackageLookupList && props?.getServicePackageLookupList.length === 0 && (
                    <tr>
                      <td colspan={3}>
                        <NoResultFoundModel name={`Package List`} />
                      </td>
                    </tr>
                  )}
                  {props?.getServicePackageLookupList.map(
                    (servicePackage, index) => {
                      const isSelected =
                        Array.isArray(props.selectedPackages) &&
                        servicePackage &&
                        props.selectedPackages.includes(
                          servicePackage.servicePackageID
                        );
                      const handleToggle = () => {
                        if (servicePackage) {
                          props.handlePackageCheckboxClick(servicePackage);
                        }
                      };
                      return (
                      <tr
                        key={servicePackage.servicePackageID}
                        className={`table_new table-content-font package-row${
                          isSelected ? " is-selected" : ""
                        }`}
                        onClick={handleToggle}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleToggle();
                          }
                        }}
                      >
                        <td>
                          <div className="select-row package-row__name-cell">
                            <input
                              type="checkbox"
                              className="check check_tick package-row__checkbox"
                              id={`packageCheckbox_${servicePackage?.servicePackageID}`}
                              onChange={handleToggle}
                              checked={isSelected}
                              tabIndex={-1}
                              aria-hidden="true"
                            />
                            {
                              servicePackage.needToUpdate && (
                                <span class="text-danger pe-1">*</span>
                              )}
                            <label
                              htmlFor={`packageCheckbox_${servicePackage.servicePackageID}`}
                              className="fieldset-label required client-font package-row__name"
                            >
                              {isMobile ? (
                                <>
                                  <Tooltip
                                    title={
                                      servicePackage.servicePackageName
                                    }
                                  >
                                    {servicePackage.servicePackageName.length > 20
                                      ? servicePackage.servicePackageName
                                        .substring(0, 20)
                                        .replace(/\b\w/g, (l) =>
                                          l.toUpperCase()
                                        ) + "..."
                                      : servicePackage.servicePackageName
                                        .replace(/\b\w/g, (l) =>
                                          l.toUpperCase()
                                        )}
                                  </Tooltip>
                                </>
                              ) : (
                                <>
                                  {/* <Tooltip
                                              title={
                                                servicePackage.servicePackageName
                                              }
                                            >

                                            </Tooltip> */}

                                  <>
                                    <Tooltip
                                      title={
                                        servicePackage.servicePackageName
                                      }
                                    >
                                      {isMobile ? (
                                        <>
                                          {servicePackage.servicePackageName.length > 20
                                            ? servicePackage.servicePackageName
                                              .substring(0, 20)
                                              .replace(/\b\w/g, (l) =>
                                                l.toUpperCase()
                                              ) + "..."
                                            : servicePackage.servicePackageName
                                              .replace(/\b\w/g, (l) =>
                                                l.toUpperCase()
                                              )}
                                        </>
                                      ) : (
                                        <>
                                          {servicePackage.servicePackageName.length >
                                            45 ? (
                                            <Tooltip
                                              title={servicePackage.servicePackageName}
                                            >
                                              {servicePackage.servicePackageName
                                                .substring(0, 45)
                                                .replace(/\b\w/g, (l) =>
                                                  l.toUpperCase()
                                                ) + "..."}
                                            </Tooltip>
                                          ) : (
                                            <>
                                              {servicePackage.servicePackageName
                                                .replace(/\b\w/g, (l) =>
                                                  l.toUpperCase()
                                                )}
                                            </>
                                          )}
                                        </>
                                      )}

                                    </Tooltip>
                                  </>
                                </>
                              )}
                            </label>
                            {isSelected && (
                              <span className="package-row__badge">
                                Selected
                              </span>
                            )}

                          </div>
                        </td>
                        <td>
                          <span className="fieldset-label required client-font">
                            {servicePackage.recurringOriginalPrice ? (
                              <del>
                                {" "}
                                {formatValue(
                                  servicePackage.recurringOriginalPrice
                                )}
                              </del>
                            ) : (
                              <del>£0.00</del>
                            )}
                          </span>{" "}
                          <span className="fieldset-label required client-font">
                            <b>
                              {" "}
                              {servicePackage.recurringDefaultPrice
                                ? formatValue(
                                  servicePackage.recurringDefaultPrice
                                )
                                : "£0.00"}
                            </b>
                          </span>
                        </td>
                        <td className="text-right">
                          <span className="fieldset-label required client-font">
                            {servicePackage.oneOffOriginalPrice ? (
                              <del>
                                {" "}
                                {formatValue(
                                  servicePackage.oneOffOriginalPrice
                                )}
                              </del>
                            ) : (
                              <del> £0.00</del>
                            )}
                          </span>{" "}
                          <span className="fieldset-label required client-font ">
                            <b>
                              {" "}
                              {servicePackage.oneOffDefaultPrice
                                ? formatValue(servicePackage.oneOffDefaultPrice)
                                : "£0.00"}
                            </b>
                          </span>
                        </td>
                      </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {props.showValidationForMax && (
        <div className="text-center">
          <span className="validation">
            {" "}
            You can only select maximum 3 packages
          </span>
        </div>
      )}
      {props.showValidationForMin && (
        <div className="text-center">
          <span className="validation">Please select at least 1 package</span>
        </div>
      )}
      <div className="separator mt-3 mb-3"></div>
      <div className="row fieldset modal-footer">
        <div className="col-lg-12 hstack gap-2 justify-content-end text-right">
          <button
            className="btn btn-md btn-light pf-btn--cancel me-auto"
            onClick={props.handleCancelBtn}
          >
            <span>Cancel</span>
          </button>
          <button
            onClick={() => props.HandleBack(1)}
            style={{ marginRight: "5px" }}
            className="btn btn-md btn-success create-item-btn pf-btn--back"
          >
            <span>Back</span>
          </button>
          {ProposalObject && ProposalObject.selectedProposalTypeValue === 1 && (
            <button
              className="btn btn-md btn-success create-item-btn pf-btn--next"
              onClick={async () => {
                await props.HandleTabChange(2);
              }}
            >
              <span>Next</span>
            </button>
          )}
          {ProposalObject && ProposalObject.selectedProposalTypeValue === 2 && (
            <button
              className="btn btn-md btn-success create-item-btn pf-btn--next"
              onClick={async () => {
                await props.HandleTabChange(7);
              }}
            >
              <span>Next</span>
            </button>
          )}

          <button
            type="submit"
            class="btn btn-md btn-success create-item-btn text-nowrap pf-btn--draft"
            onClick={() =>
              props.handleSaveAsDraft(5, moduleNameForSaveAsDraft, statusId)
            }
            style={{ marginLeft: "5px" }}
          >
            <span>Save as a Draft</span>
          </button>
        </div>
      </div>
    </>
  );
};
