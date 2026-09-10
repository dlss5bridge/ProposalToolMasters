/* global $ */
import React, { useContext, useEffect, useRef, useState } from "react";
import "../packages/Package.css";
import "./ServiceStyle.css";
import AddDeleteGlobalPricingDriver from "./AddDeleteGlobalPricingDriver";
import Select from "react-select";
import SuccessModal from "../../../components/SuccessModal";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import DropDown from "../../../components/DropDown";
import AcceptSuperAdminChangesConfirmation from "../../../components/AcceptSuperAdminChangesConfirmation";
import BackButtonSvg from "../../../components/BackButtonSvg";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { GetProfessionTypeLookupList } from "../../../redux/Services/Master/ProfessionTypeApi";
import {
  DriverTypeList,
  GetPricingDriverUsedInModules,
  SlabTypeList,
} from "../../../redux/Services/Config/GlobalPricingDriverApi"; // api calling driver Type
import {
  AddUpdateService,
  GetServiceModel,
  ServiceCategoryList,
  GetServiceDependencyList,
  DeleteServiceFeeInflation,
  GetServiceFeeInflationActiveForService,
} from "../../../redux/Services/Config/ServicesApi";
import { useDispatch, useSelector } from "react-redux";
import { ServiceChargeTypeList } from "../../../redux/Services/Master/ServiceChargeTypeLookupList";
import { PricingTypeList } from "../../../redux/Services/Master/PricingTypeLookupList";
import ServicesCategoryModel from "../service_categories/ServicesCategoriesModel";
import Description from "./Description";
import TagIfy from "./Tagify";
import { ServiceHeader } from "../../../Middleware/enums";
import { ERROR_MESSAGES } from "../../../components/GlobalMessage";
import { updateState } from "../../../redux/Persist";
import ErrorModel from "../../../components/ErrorModel";
import { GetGlobalConstantList } from "../../../redux/Services/Config/GlobalConstantApi";
import VariationDragDrop from "./VariationDragDrop";
import ConfirmModel from "../../../components/ConfirmationBox";
import { GetNOBTypeLookupList } from "../../../redux/Services/Master/NOBTypeLookupListApi";
import {
  GetBusinessTypeLookupList,
  GetProspectTypeVariationLookupList,
} from "../../../redux/Services/Master/BusinessTypeLookupListApi";
import RecordsAvailablePopupModel from "../../../components/RecordsAvailablePopupModel";
import InvalidFormIcon from "../../../components/InvalidFormIcon";
import DeleteDriverModal from "../../../components/DeleteDriverModel";
import { NotifySuperAdminPredefinedChangesToAdmin } from "../../../redux/Services/Setting/NotificationApi";
import { DeclineSuperAdminChanges } from "../../../redux/Services/Config/ServiceCategoryApi";
import SAPredefinedChangesNotifyMessageModel from "../../../components/SAPredefinedChangesNotifyMessageModel";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  parse,
  format,
  isValid,
  differenceInCalendarDays,
  addDays,
  getTime,
} from "date-fns";
import Utils from "../../../Middleware/Utils";
import FeeInflationTab from "./FeeInflationTab";
//Tab Custom Component Created
const BasicInformationComponent = (props) => {
  const ServiceDivContainerRef = useRef(null);
  console.log("dropDown: ", props.ServiceDependencyValue);
  console.log("dropDown: ", props.isDropdownEnabled);
  const { scrollUptoCurrentPosition } = useContext(AuthContextProvider);
  const serviceChargeTypeFilter = props.serviceChargeTypeList?.find(
    (item) =>
      item.serviceChargeTypeID === props.servicesObj.serviceChargeTypeID,
  );
  const serviceChargeTypeValue = serviceChargeTypeFilter
    ? {
        value: serviceChargeTypeFilter.serviceChargeTypeID,
        label: serviceChargeTypeFilter.serviceChargeTypeName,
      }
    : null;

  const pricingTypeFilter = props.pricingTypeList?.find(
    (item) => item.pricingTypeID === props.servicesObj.pricingTypeID,
  );

  const pricingTypeValue = pricingTypeFilter
    ? {
        value: pricingTypeFilter.pricingTypeID,
        label: pricingTypeFilter.pricingTypeName,
      }
    : null;
  // const handleChangePricingType = async (selectedOption) => {
  //   let shouldExecuteElse = true;
  //   props.setLoader(true)
  //   for (let i = 0; i < props.pricingDriver.length; i++) {
  //     const item = props.pricingDriver[i];

  //     // Extract variationKeyIDs and slabKeyIDs for the current item
  //     let variationKeyIDs = [];
  //     let slabKeyIDs = [];
  //     let dateKeyIDs = [];
  //     let textKeyIDs = [];
  //     if (item.variation && item.variation.length > 0) {
  //       item.variation.forEach(variation => {
  //         variationKeyIDs.push(variation.variationKeyID);
  //       });
  //     }

  //     if (item.slab && item.slab.length > 0) {
  //       item.slab.forEach(slab => {
  //         slabKeyIDs.push(slab.slabKeyID);
  //       });
  //     }

  //     if (item.date && item.date.length > 0) {
  //       item.date.forEach(date => {
  //         dateKeyIDs.push(date.dateKeyID);
  //       });
  //     }

  //     if (item.text && item.text.length > 0) {
  //       item.text.forEach(text => {
  //         textKeyIDs.push(text.textKeyID);
  //       });
  //     }

  //     // Join arrays into comma-separated strings
  //     variationKeyIDs = variationKeyIDs.join(',');
  //     slabKeyIDs = slabKeyIDs.join(',');
  //     dateKeyIDs = dateKeyIDs.join(',');
  //     textKeyIDs = textKeyIDs.join(',');

  //     const pricingDriverDelete = await GetPricingDriverUsedInModules(
  //       item.globalPricingDriverKeyID,
  //       props.common.userKeyID,
  //       props.servicesObj.serviceKeyID,
  //       variationKeyIDs,
  //       slabKeyIDs,
  //       dateKeyIDs,
  //       textKeyIDs
  //     );

  //     if (pricingDriverDelete.data.statusCode === 200) {
  //       props.setLoader(false);
  //       let moduleList = pricingDriverDelete.data.responseData.moduleList;
  //       if (moduleList.length > 0) {
  //         shouldExecuteElse = false;

  //         props.setModelRequestData({
  //           ...props.modelRequestData,
  //           Action: "PricingDriverDelete",
  //           message: `This service is being used in the module below and cannot be changed. Please remove it from there first.`,
  //           ServiceName: moduleList,
  //         });
  //         $("#" + "DeleteDriverModel").modal("show");
  //         props.setLoader(false)
  //         break;
  //       }
  //     }
  //   }

  //   if (shouldExecuteElse) {
  //     props.setLoader(false)
  //     props.setPricingDriver([]);
  //     props.setserviceError({
  //       ...props.serviceError,
  //       priceError: false,
  //     });
  //     props.setServicesObj({
  //       ...props.servicesObj,
  //       pricingTypeID: selectedOption.value,
  //       price: null, // Resetting the price here
  //       description: null,
  //       pricingFormula: null,
  //       isPredefined: true,
  //       pricingDriverList: [],
  //       pricingFormulaGlobalPricingDriverList: [],
  //     });
  //   }
  //   props.setLoader(false)
  // }

  const mergeModuleLists = (existing, incoming) => {
    const merged = existing.map((m) => ({
      ...m,
      recordList: [...m.recordList],
    }));
    incoming.forEach((incomingModule) => {
      const match = merged.find(
        (m) => m.moduleName === incomingModule.moduleName,
      );
      if (match) {
        const existingKeyIDs = new Set(match.recordList.map((r) => r.keyID));
        const newRecords = incomingModule.recordList.filter(
          (r) => !existingKeyIDs.has(r.keyID),
        );
        match.recordList = [...match.recordList, ...newRecords];
      } else {
        merged.push({
          ...incomingModule,
          recordList: [...incomingModule.recordList],
        });
      }
    });
    return merged;
  };

  const handleChangePricingType = async (selectedOption) => {
    let shouldExecuteElse = true;
    props.setLoader(true);

    // 1) SFI check - unconditional, runs regardless of direction or whether
    // props.pricingDriver has any entries.
    const sfiCheck = await GetServiceFeeInflationActiveForService(
      props.servicesObj.serviceKeyID,
    );
    const sfiRuleList = sfiCheck?.data?.responseData?.ruleList || [];
    const distinctBatches = [...new Set(sfiRuleList.map((r) => r.batchID))];

    // 2) GPD-usage loop - checks EVERY driver (no early break, so both
    // checks can be reported together), but now MERGES results instead of
    // naively concatenating, so the same proposal/quote referenced by
    // multiple drivers of this service only shows up once.
    let moduleList = [];
    for (let i = 0; i < props.pricingDriver.length; i++) {
      const item = props.pricingDriver[i];

      let variationKeyIDs = [];
      let slabKeyIDs = [];
      let dateKeyIDs = [];
      let textKeyIDs = [];
      if (item.variation && item.variation.length > 0) {
        item.variation.forEach((variation) => {
          variationKeyIDs.push(variation.variationKeyID);
        });
      }
      if (item.slab && item.slab.length > 0) {
        item.slab.forEach((slab) => {
          slabKeyIDs.push(slab.slabKeyID);
        });
      }
      if (item.date && item.date.length > 0) {
        item.date.forEach((date) => {
          dateKeyIDs.push(date.dateKeyID);
        });
      }
      if (item.text && item.text.length > 0) {
        item.text.forEach((text) => {
          textKeyIDs.push(text.textKeyID);
        });
      }

      variationKeyIDs = variationKeyIDs.join(",");
      slabKeyIDs = slabKeyIDs.join(",");
      dateKeyIDs = dateKeyIDs.join(",");
      textKeyIDs = textKeyIDs.join(",");

      const pricingDriverDelete = await GetPricingDriverUsedInModules(
        item.globalPricingDriverKeyID,
        props.common.userKeyID,
        props.servicesObj.serviceKeyID,
        variationKeyIDs,
        slabKeyIDs,
        dateKeyIDs,
        textKeyIDs,
      );

      if (pricingDriverDelete?.data?.statusCode === 200) {
        const thisModuleList =
          pricingDriverDelete?.data?.responseData?.moduleList || [];
        if (thisModuleList.length > 0) {
          moduleList = mergeModuleLists(moduleList, thisModuleList);
        }
      }
    }

    // 3) Decide, with BOTH results in hand
    if (sfiRuleList.length > 0 || moduleList.length > 0) {
      shouldExecuteElse = false;
      props.setLoader(false);

      const messageLines = [];
      if (sfiRuleList.length > 0) {
        messageLines.push(
          `This service has ${distinctBatches.length} fee inflation rule${
            distinctBatches.length > 1 ? "s" : ""
          } configured. Please delete ${
            distinctBatches.length > 1 ? "them" : "it"
          } from the Fee Inflation settings before changing the pricing type.`,
        );
      }
      if (moduleList.length > 0) {
        messageLines.push(
          `This service is being used in the module below and cannot be changed. Please remove it from there first.`,
        );
      }

      props.setModelRequestData({
        ...props.modelRequestData,
        Action: "PricingDriverDelete",
        message: messageLines.join("\n\n"),
        ServiceName: moduleList,
      });
      $("#" + "DeleteDriverModel").modal("show");
    }

    if (shouldExecuteElse) {
      props.setLoader(false);
      props.setPricingDriver([]);
      props.setserviceError({
        ...props.serviceError,
        priceError: false,
      });
      props.setServicesObj({
        ...props.servicesObj,
        pricingTypeID: selectedOption.value,
        price: null,
        description: null,
        pricingFormula: null,
        isPredefined: true,
        pricingDriverList: [],
        pricingFormulaGlobalPricingDriverList: [],
      });
    }
    props.setLoader(false);
  };

  return (
    <>
      <div
        className="create-practice-height scrollbar"
        ref={ServiceDivContainerRef}
        onClick={(e) => scrollUptoCurrentPosition(e, ServiceDivContainerRef)}
      >
        <div class="tab-content mt-2">
          <div className="row">
            <SAPredefinedChangesNotifyMessageModel
              Params={{
                moduleName: props.moduleName,
                SAChanges: props.modelRequestData.Type,
              }}
            />
            {(props.common.professionTypeLists?.length > 1 ||
              props.common.organisationKeyID === null) && (
              <div className="col-lg-6" id="Profession_Div">
                <div className="mb-3 ">
                  <label className="form-label">
                    Profession Type <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    {props.common.professionTypeLists?.length > 1 ||
                    props.common.organisationKeyID === null ? (
                      <Select
                        isMulti={
                          props.common.organisationKeyID === null ? false : true
                        }
                        style={{ padding: "5px" }}
                        className="user-role-select"
                        options={props.ProfessionalTypeLookeupListOptions}
                        value={props.ProfessionTypeValue}
                        onChange={props.OnProfessionTypeChange}
                      />
                    ) : (
                      ""
                    )}
                  </div>
                  {props.serviceError.basicInformationError &&
                  (props.common.professionTypeLists?.length > 1 ||
                    props.common.organisationKeyID === null) &&
                  props.servicesObj.professionTypeList?.length === 0 ? (
                    <label className="validation">{ERROR_MESSAGES}</label>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            )}

            <div className="col-lg-6" id="Service_Div">
              <div className="mb-3 ">
                <label className="form-label">
                  Service Name <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    className="input-text"
                    id="customerName-field "
                    placeholder="Enter Service Name"
                    value={props.servicesObj.serviceName}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      const trimmedValue = inputValue.replace(/^\s+/g, ""); // Remove leading spaces
                      // Handle consecutive spaces
                      const singleSpaceValue = trimmedValue.replace(
                        /\s{2,}/g,
                        " ",
                      );
                      // Remove dot if it follows a space
                      const sanitizedValue = singleSpaceValue.replace(
                        / \./g,
                        " ",
                      );
                      const capitalizedValue =
                        sanitizedValue.charAt(0).toUpperCase() +
                        sanitizedValue.slice(1);
                      props.setServicesObj({
                        ...props.servicesObj,
                        serviceName: capitalizedValue,
                      });
                    }}
                    required
                    maxLength={100}
                  />
                </div>
                {props.serviceError.basicInformationError &&
                (props.servicesObj.serviceName === "" ||
                  props.servicesObj.serviceName === undefined) ? (
                  <label className="validation">{ERROR_MESSAGES}</label>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="col-lg-6" id="ServiceCat_Div">
              <div className="mb-3 ">
                <div className="row">
                  <div className="col-lg-6 col-md-6 col-sm-6 col-xsm-12">
                    <label className="form-label">
                      Service Category <span className="text-danger">*</span>
                    </label>
                  </div>
                  <div className="col-lg-6 col-md-6 col-sm-6 col-xsm-12">
                    <button
                      style={{
                        fontSize: "12px",
                        float: "right",
                        border: "none",
                        background: "transparent",
                        color: "#626ed4",
                      }}
                      className="float-sm-end"
                      data-bs-toggle="modal"
                      data-bs-target="#serviceCategoryModel"
                      onClick={() => props.ServiceCategoryAddBtnClicked()}
                    >
                      + Create New Category
                    </button>
                  </div>
                </div>
                <div className="input-group">
                  <Select
                    isMulti
                    className="crete-new-category-link Select-value-label"
                    options={props.ServiceCategoryLookeupListOptions}
                    value={props.ServiceCategoryValue}
                    onChange={props.OnServiceCategoryChange}
                  />
                </div>
                {props.serviceError.basicInformationError &&
                (props.servicesObj.serviceCategoryList.length === 0 ||
                  props.servicesObj.serviceCategoryList === null) ? (
                  <label className="validation">{ERROR_MESSAGES}</label>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="col-lg-6" id="ServiceCharge_Div">
              <div className="mb-3 ">
                <label className="form-label">
                  Service Charge Type <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <Select
                    //
                    className="user-role-select"
                    value={serviceChargeTypeValue}
                    onChange={(selectedOption) => {
                      props.setServicesObj((prev) => ({
                        ...prev,
                        serviceChargeTypeID: selectedOption.value,
                      }));
                    }}
                    options={props.serviceChargeTypeList?.map((item) => ({
                      value: item.serviceChargeTypeID,
                      label: item.serviceChargeTypeName,
                    }))}
                    placeholder="Select..."
                  />
                </div>
                {props.serviceError.basicInformationError &&
                (props.servicesObj.serviceChargeTypeID === "" ||
                  props.servicesObj.serviceChargeTypeID === null) ? (
                  <label className="validation">{ERROR_MESSAGES}</label>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="col-lg-6" id="Prospect_Div">
              <div class="mb-3">
                <label class="form-label">
                  {props.prospectName} Type
                  <span class="text-danger">*</span>
                </label>
                <div className="input-group ">
                  <Select
                    isMulti
                    className="user-role-select"
                    style={{ padding: "5px", width: "20%" }}
                    options={
                      props.servicesObj.clientBusinessTypeID.length ===
                      props.BusinessTypeLookupList.length
                        ? props.BusinessTypeLookupList
                        : [
                            {
                              value: null,
                              label: "All",
                            },
                            ...props.BusinessTypeLookupList,
                          ]
                    }
                    value={props.ClientTypeValue}
                    onChange={(e) => {
                      props.OnClientTypeChange(e);
                    }}
                  />
                </div>
                {props.serviceError.basicInformationError &&
                props.servicesObj.clientBusinessTypeID.length === 0 ? (
                  <label className="validation">{ERROR_MESSAGES}</label>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="col-lg-6" id="NOB_Div">
              <div class="mb-3">
                <label class="form-label">
                  Nature Of Business
                  <span class="text-danger">*</span>
                </label>
                <div className="mb-1 input-group ">
                  <Select
                    isMulti
                    className="user-role-select"
                    style={{ padding: "5px", width: "20%" }}
                    options={
                      props.servicesObj.businessNatureID.length + 1 ===
                      props.NatureOfBusinessTypeLookupList.length
                        ? props.NatureOfBusinessTypeLookupList.slice(1)
                        : props.NatureOfBusinessTypeLookupList
                    }
                    value={props.NOBTypeValue.filter(
                      (item) => item.value !== null,
                    )}
                    onChange={(e) => {
                      props.OnNOBChange(e);
                    }}
                  />
                  {props.serviceError.basicInformationError &&
                  props.servicesObj.businessNatureID.length === 0 ? (
                    <label className="validation">{ERROR_MESSAGES}</label>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-6" id="PricingType_Div">
              <div className="mb-3 ">
                <label className="form-label">
                  Pricing Type <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <Select
                    value={pricingTypeValue}
                    className="user-role-select"
                    onChange={(selectedOption) => {
                      handleChangePricingType(selectedOption);
                    }}
                    options={props.pricingTypeList?.map((item) => ({
                      value: item.pricingTypeID,
                      label: item.pricingTypeName,
                    }))}
                    placeholder="Select..."
                  />
                </div>
                {props.serviceError.basicInformationError &&
                (props.servicesObj.pricingTypeID === "" ||
                  props.servicesObj.pricingTypeID === null) ? (
                  <label className="validation">{ERROR_MESSAGES}</label>
                ) : (
                  ""
                )}
                <div className="invalid-feedback">Please enter email</div>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-sm-6 col-xsm-12">
              {props.common.organisationKeyID !== null &&
                props.ServiceDependencyLookupList.length > 0 && (
                  <>
                    <div id="ServiceDependency_Div">
                      <div className="mb-3 ">
                        <label
                          className="form-label"
                          style={{ paddingRight: "4px" }}
                        >
                          Depends on Services
                        </label>
                        <input
                          type="checkbox"
                          id="enableDropdown"
                          checked={props.isDropdownEnabled}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            props.setIsDropdownEnabled(isChecked);
                            if (
                              !isChecked ||
                              props.ServiceDependencyValue.length === 0
                            ) {
                              props.OnServiceDependencyChange([]);
                              props.setServicesObj((prev) => ({
                                ...prev,
                                prerequisiteServicesID: [],
                              }));
                            }
                          }}
                          style={{ verticalAlign: "middle", cursor: "pointer" }}
                        />

                        {(props.isDropdownEnabled ||
                          props.ServiceDependencyValue.length > 0) && (
                          <>
                            <div className="input-group">
                              <Select
                                isMulti
                                value={props.ServiceDependencyValue}
                                options={props.ServiceDependencyLookupList}
                                className="user-role-select"
                                onChange={props?.OnServiceDependencyChange}
                                styles={{
                                  option: (styles) => ({
                                    ...styles,
                                    cursor: "pointer",
                                  }),
                                }}
                                placeholder="Select..."
                              />
                            </div>
                            {props.serviceError.basicInformationError &&
                              (!props.ServiceDependencyList ||
                                props.ServiceDependencyList === "") && (
                                <label className="validation">
                                  {ERROR_MESSAGES}
                                </label>
                              )}
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
            </div>
            <div className="col-lg-6">
              {props.servicesObj.pricingTypeID === 1 && (
                <div id="Price_Div">
                  <div className="mb-3 ">
                    <label className="form-label">
                      Price <span className="text-danger">*</span>
                    </label>
                    <div className="input-group input-height">
                      <input
                        type="text"
                        className="input-text"
                        value={props.servicesObj.price
                          ?.toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        onChange={(e) => {
                          // Ensure that the input only contains numeric and dot characters
                          const sanitizedInput = e.target.value
                            .replace(/[^0-9.]/g, "") // Allow only numeric and dot characters
                            .slice(0, 16); // Limit to 7 characters (5 digits + 1 dot + 1 decimal)

                          // Split the input into integer and decimal parts
                          const [integerPart, decimalPart] =
                            sanitizedInput.split(".");

                          // Combine integer and decimal parts with appropriate precision
                          const formattedInput =
                            decimalPart !== undefined
                              ? `${integerPart.slice(0, 13)}.${decimalPart.slice(
                                  0,
                                  2,
                                )}`
                              : integerPart.slice(0, 12);
                          props.setServicesObj({
                            ...props.servicesObj,
                            price: formattedInput,
                          });
                        }}
                        placeholder="Enter a Price"
                        required
                      />
                    </div>
                    {props.serviceError.priceError &&
                    (props.servicesObj.price === "" ||
                      props.servicesObj.price === undefined ||
                      props.servicesObj.price === null) ? (
                      <label className="validation">{ERROR_MESSAGES}</label>
                    ) : (
                      ""
                    )}
                    {/* Inflation breakdown */}
                    {props.servicesObj.serviceFeeInflationList?.length > 0 &&
                      (() => {
                        const basePrice =
                          parseFloat(props.servicesObj.price) || 0;
                        const effectivePrice =
                          props.servicesObj.serviceFeeInflationList.reduce(
                            (price, rule) => {
                              switch (rule.operator) {
                                case "+":
                                  return price + (rule.value || 0);
                                case "-":
                                  return price - (rule.value || 0);
                                case "*":
                                  return price * (1 + (rule.value || 0) / 100);
                                case "/":
                                  return price * (1 - (rule.value || 0) / 100);
                                default:
                                  return price;
                              }
                            },
                            basePrice,
                          );

                        return (
                          <div className="mb-3">
                            <label className="form-label">Inflation</label>
                            <div className="input-group input-height">
                              <input
                                type="text"
                                className="input-text"
                                value={props.servicesObj.serviceFeeInflationList
                                  .map((r) => {
                                    switch (r.operator) {
                                      case "+":
                                        return `Addition by ${r.value}`;
                                      case "-":
                                        return `Subtraction by ${r.value}`;
                                      case "*":
                                        return `Markup by ${r.value}%`;
                                      case "/":
                                        return `Discount by ${r.value}%`;
                                      default:
                                        return `${r.operator} ${r.value}`;
                                    }
                                  })
                                  .join(" | ")}
                                disabled
                              />
                            </div>
                            <label className="form-label mt-2">
                              Effective Price
                            </label>
                            <div className="input-group input-height">
                              <input
                                type="text"
                                className="input-text"
                                value={effectivePrice
                                  .toFixed(2)
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                disabled
                              />
                            </div>
                          </div>
                        );
                      })()}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* <!-- end tab row --> */}
        </div>
      </div>
      <div>
        <div class="separator"></div>
        <div class="row fieldset modal-footer">
          <div class="col-lg-12 hstack gap-2 justify-content-end text-right mt-3">
            {props.modelRequestData.Type ? (
              <>
                <button
                  type="submit"
                  class="btn btn-md btn-success declined-item-btn"
                  // data-bs-dismiss="modal"
                  onClick={() => props.DeclineSuperAdminChangesData("Decline")}
                >
                  <span>Decline</span>
                </button>
              </>
            ) : (
              <>
                <button
                  class="btn btn-md  btn-light"
                  onClick={props.handleCancelButton}
                >
                  <span>{props.getCrudButtonTextName("Cancel")}</span>
                </button>
              </>
            )}
            <button
              class="btn btn-md btn-success create-item-btn"
              onClick={() =>
                props.GlobalPricingDriverAddUpdateBtnClicked(
                  ServiceHeader.Description,
                )
              }
            >
              <span>Next</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const DescriptionComponent = (props) => {
  return (
    <>
      <div className="create-practice-height scrollbar">
        <div className="tab-content">
          <div className="tab-pane active">
            {/* <div class="row"> */}
            {/* <div className="separator mb-3"> */}{" "}
            <Description
              template={props.servicesObj.description}
              servicesObj={props.servicesObj}
              setTemplate={props.setServicesObj}
            />
            {/* </div> */}
            {/* </div> */}
          </div>
        </div>
      </div>
      <div>
        <div className="text-center">
          {props.errorMessage && (
            <label className="validation text-center">
              {props.errorMessage}
            </label>
          )}

          <div class="row fieldset modal-footer">
            <div class="col-lg-12 hstack gap-2 justify-content-end text-right mt-3">
              {props.modelRequestData.Type ? (
                <>
                  <button
                    type="submit"
                    class="btn btn-md btn-success declined-item-btn"
                    // data-bs-dismiss="modal"
                    onClick={() =>
                      props.DeclineSuperAdminChangesData("Decline")
                    }
                  >
                    <span>Decline</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    class="btn btn-md  btn-light"
                    onClick={props.handleCancelButton}
                  >
                    <span>{props.getCrudButtonTextName("Cancel")}</span>
                  </button>
                </>
              )}
              <button
                onClick={() => props.handleBackButton(1)}
                style={{ paddingTop: "5px", marginRight: "4px" }}
                className="btn btn-md btn-success create-item-btn"
              >
                <span>Back</span>
              </button>
              {props.servicesObj.pricingTypeID === 2 ? (
                <button
                  class="btn btn-md btn-success create-item-btn"
                  onClick={() =>
                    props.GlobalPricingDriverAddUpdateBtnClicked(
                      ServiceHeader.PricingDrivers,
                    )
                  }
                >
                  <span>Next</span>
                </button>
              ) : props.modelRequestData.Type ? (
                <>
                  <button
                    type="submit"
                    class="btn btn-md btn-success accept-item-btn"
                    onClick={() => {
                      props.GlobalPricingDriverAddUpdateBtnClicked(
                        "create service",
                        "Accept",
                      );
                    }}
                  >
                    <span>Accept</span>
                  </button>
                </>
              ) : (
                <button
                  class="btn btn-md btn-success create-item-btn"
                  onClick={() =>
                    props.GlobalPricingDriverAddUpdateBtnClicked(
                      "create service",
                    )
                  }
                >
                  <span>
                    {props.modelAction === "Add"
                      ? "Add Service"
                      : "Update Service"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const PricingDriversComponent = (props) => {
  const [dragOverData, setDragOverData] = useState({});
  const ServicesDivContainerRef = useRef(null);
  const [dragOverStart, setDragOverStart] = useState({});
  const [DuplicateName, seDuplicateName] = useState(false);
  const { isMobile } = useContext(AuthContextProvider);
  const [visibleIndexes, setVisibleIndexes] = useState([]);
  const [visibleIndexesGlobal, setVisibleIndexesGlobal] = useState([]);
  // Handle Content Visibility
  const toggleContentVisibility = (mainIndex) => {
    if (visibleIndexes.includes(mainIndex)) {
      setVisibleIndexes(visibleIndexes.filter((index) => index !== mainIndex));
    } else {
      setVisibleIndexes([...visibleIndexes, mainIndex]);
    }
  };

  useEffect(() => {
    // Initialize default decimal places and format existing slabs
    const updatedSlabs = [...props.pricingDriver];
    let hasChanges = false;

    updatedSlabs.forEach((driver, mainIndex) => {
      // Set default decimal places if not set
      // if (driver.slab[0]?.decimalPlaces === undefined || driver.slab[0]?.decimalPlaces === null) {
      //   driver.decimalPlaces = 2;
      //   hasChanges = true;
      // }

      // Format existing slabs and set defaults
      if (driver.slab && driver.slab.length > 0) {
        driver.slab.forEach((slab, index) => {
          const decimalPlaces = Number(driver.slab[index].decimalPlaces);
          // Set default values if empty
          if (
            (slab.slabFrom === "" ||
              slab.slabFrom === null ||
              slab.slabFrom === undefined) &&
            index === 0
          ) {
            slab.slabFrom = (0).toFixed(decimalPlaces);
            hasChanges = true;
          }
          if (
            slab.slabTo === "" ||
            slab.slabTo === null ||
            slab.slabTo === undefined
          ) {
            slab.slabTo = (0).toFixed(decimalPlaces);
            hasChanges = true;
          }

          // Format existing values
          if (slab.slabFrom && slab.slabFrom !== "") {
            const numFrom = parseFloat(slab.slabFrom);
            if (!isNaN(numFrom)) {
              const formatted = numFrom.toFixed(decimalPlaces);
              if (formatted !== slab.slabFrom.toString()) {
                slab.slabFrom = formatted;
                hasChanges = true;
              }
            }
          }

          if (slab.slabTo && slab.slabTo !== "") {
            const numTo = parseFloat(slab.slabTo);
            if (!isNaN(numTo)) {
              const formatted = numTo.toFixed(decimalPlaces);
              if (formatted !== slab.slabTo.toString()) {
                slab.slabTo = formatted;
                hasChanges = true;
              }
            }
          }
        });
      }
    });

    if (hasChanges) {
      props.setPricingDriver(updatedSlabs);
    }
  }, []);

  useEffect(() => {
    const updated = [...props.pricingDriver];
    let changed = false;

    updated.forEach((driver, index) => {
      if (
        driver?.driverTypeID === 6 &&
        (!driver.date || driver.date.length === 0)
      ) {
        updated[index].date = [
          {
            dateFormat: dateFormats[3].value,
            defaultDateValue: null,
            blocks: [],
          },
        ];
        changed = true;
      }
      if (
        driver?.driverTypeID === 2 &&
        !(driver?.quantity || driver?.quantity?.length === 0)
      ) {
        updated[index].quantity = [
          {
            quantityDecimalPlaces: 0,
            quantityFrom: "",
            quantityTo: "",
          },
        ];
        changed = true;
      }
    });

    if (changed) {
      props.setPricingDriver(updated);
    }
  }, [props.pricingDriver]);

  // handle Content Visibility for Global
  const toggleContentVisibilityForGlobal = (mainIndex) => {
    if (visibleIndexesGlobal.includes(mainIndex)) {
      setVisibleIndexesGlobal(
        visibleIndexesGlobal.filter((index) => index !== mainIndex),
      );
    } else {
      setVisibleIndexesGlobal([...visibleIndexesGlobal, mainIndex]);
    }
  };

  const specialCharOptions = Utils.specialCharOptions;

  const dateFormats = Utils.dateFormats;

  const findDriverTypeIndex = props.pricingDriver?.findIndex(
    (i) => i.driverTypeID === 3,
  );

  const OnAddPeriodBlock = (mainIndex, dateGroupIndex = 0) => {
    const updatedDrivers = [...props.pricingDriver];
    const currentDriver = updatedDrivers[mainIndex];

    const dateGroup = currentDriver.date?.[dateGroupIndex];
    if (!dateGroup) return;

    const blocks = dateGroup.blocks || [];
    const lastBlock = blocks.at(-1);
    const dateFormat = dateGroup.dateFormat;

    const lastToDate = lastBlock?.toDate
      ? props.parseStoredDate(lastBlock.toDate, dateFormat)
      : null;

    const newFromDate = lastToDate
      ? props.formatToDisplay(addDays(lastToDate, 1), dateFormat)
      : null;

    blocks.push({
      fromDate: newFromDate,
      toDate: "",
      dateValue: null,
    });

    props.setPricingDriver(updatedDrivers);
  };

  const OnDeletePeriodBlock = (mainIndex, dateGroupIndex, blockIndex) => {
    const updated = [...props.pricingDriver];

    const dateGroups = updated[mainIndex]?.date;
    if (!dateGroups) return;

    const dateGroup = dateGroups[dateGroupIndex];
    if (!dateGroup) return;

    dateGroup.blocks = dateGroup.blocks || [];

    // Remove the block
    dateGroup.blocks.splice(blockIndex, 1);

    // If no blocks remain, remove the group entirely
    if (dateGroup.blocks.length === 0) {
      dateGroups.splice(dateGroupIndex, 1);
    }

    props.setPricingDriver(updated);
  };

  // const OnPeriodBlockChange = (mainIndex, blockIndex, field, value) => {
  //   console.log(value);
  //   const updated = [...props.pricingDriver];
  //   const dateData = updated[mainIndex]?.date?.[0];

  //   if (!dateData || !Array.isArray(dateData.blocks)) return;

  //   if (!dateData.blocks[blockIndex]) return;

  //   if (field === "dateValue") {
  //     const cleanValue = value?.replace(/[^0-9]/g, '');
  //     dateData.blocks[blockIndex].dateValue = cleanValue;
  //   } else {
  //     dateData.blocks[blockIndex][field] = value;
  //   }

  //   props.setPricingDriver(updated);
  // };

  const OnPeriodBlockChange = (
    mainIndex,
    dateGroupIndex,
    blockIndex,
    field,
    value,
  ) => {
    const updated = [...props.pricingDriver];
    const dateGroup = updated[mainIndex]?.date?.[dateGroupIndex];

    if (!dateGroup || !Array.isArray(dateGroup.blocks)) return;
    if (!dateGroup.blocks[blockIndex]) return;

    if (field === "dateValue") {
      let cleanValue = value?.replace(/[^0-9]/g, "");
      if (cleanValue === "") {
        cleanValue = null;
      }
      dateGroup.blocks[blockIndex].dateValue = cleanValue;
    } else {
      dateGroup.blocks[blockIndex][field] = value;
    }

    props.setPricingDriver(updated);
  };

  const formatDecimal = (value, decimalPlaces) => {
    if (value === null || value === undefined || value === "") return "";

    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "";

    return num.toFixed(decimalPlaces).toString(); // Returns a string
  };

  const safelyConvertDate = (dateStr, fromFormat, toFormat) => {
    const parsed = parse(dateStr, fromFormat, new Date());
    return isValid(parsed) ? format(parsed, toFormat) : dateStr;
  };

  const lastPricingDriver = props.pricingDriver[props.pricingDriver.length - 1];

  const slabTypeFilter =
    lastPricingDriver?.slab?.length > 0
      ? props.slabType?.find(
          (item) =>
            item.slabTypeId ===
            lastPricingDriver.slab[lastPricingDriver.slab.length - 1]
              .slabTypeID,
        )
      : null;

  const slabTypeValue = slabTypeFilter
    ? { value: slabTypeFilter.slabTypeId, label: slabTypeFilter.slabTypeName }
    : null;
  const slabTypeOptions = props.slabType?.map((item) => ({
    value: item.slabTypeId,
    label: item.slabTypeName,
  }));

  // Add Total Variation
  const TotalVariationsAddedBeforeMe = (pricingDriver, mainIndex) => {
    let arrayList = pricingDriver.slice(0, mainIndex);
    let variationList = arrayList.filter((x) => x.driverTypeID == 3);
    return variationList.length;
  };

  const DriverValue = (e, mainIndex, index, Type) => {
    const inputValue = e.target.value;
    const decimalPlaces =
      props.pricingDriver?.[mainIndex]?.slab?.[index]?.decimalPlaces ?? 2;

    // Allow empty input
    if (inputValue === "") {
      if (Type === "variationValue") {
        props.OnVariationChange(mainIndex, index, "variationValue", "");
      } else if (Type === "slabValue") {
        props.OnSlabChange(mainIndex, index, "slabValue", "");
      } else if (Type === "slabFrom") {
        props.OnSlabChange(mainIndex, index, "slabFrom", "");
      } else if (Type === "slabTo") {
        props.OnSlabChange(mainIndex, index, "slabTo", "");
      }
      return;
    }

    // Clean input - only allow numbers and one decimal point
    let cleanValue = inputValue.replace(/[^0-9.]/g, "");

    // Handle multiple decimal points
    const decimalCount = (cleanValue.match(/\./g) || []).length;
    if (decimalCount > 1) {
      const firstDecimalIndex = cleanValue.indexOf(".");
      cleanValue =
        cleanValue.substring(0, firstDecimalIndex + 1) +
        cleanValue.substring(firstDecimalIndex + 1).replace(/\./g, "");
    }

    // For zero decimal places, remove decimal point
    if (decimalPlaces === 0) {
      cleanValue = cleanValue.replace(/\./g, "");
    }

    // Limit decimal places as user types
    if (cleanValue.includes(".")) {
      const parts = cleanValue.split(".");
      if (parts[1] && parts[1].length > decimalPlaces) {
        parts[1] = parts[1].substring(0, decimalPlaces);
        cleanValue = parts[0] + "." + parts[1];
      }
    }

    // Update with cleaned value
    if (Type === "variationValue") {
      props.OnVariationChange(mainIndex, index, "variationValue", cleanValue);
    } else if (Type === "slabValue") {
      props.OnSlabChange(mainIndex, index, "slabValue", cleanValue);
    } else if (Type === "slabFrom") {
      props.OnSlabChange(mainIndex, index, "slabFrom", cleanValue);
    } else if (Type === "slabTo") {
      props.OnSlabChange(mainIndex, index, "slabTo", cleanValue);
    }
  };

  // Helper function to initialize default slab values
  const initializeSlabWithDefaults = (mainIndex) => {
    const decimalPlaces = Number(
      props.pricingDriver[mainIndex]?.decimalPlaces ?? 2,
    );
    const defaultFrom = (0).toFixed(decimalPlaces);
    const defaultTo = (0).toFixed(decimalPlaces);

    return {
      slabFrom: defaultFrom,
      slabTo: defaultTo,
      slabValue: "",
      slabTypeID: null,
      // ... other default properties
    };
  };

  return (
    <>
      <div
        ref={ServicesDivContainerRef}
        onClick={(e) =>
          props.scrollUptoCurrentPosition(e, ServicesDivContainerRef)
        }
        className="create-practice-height scrollbar"
      >
        <div className="tab-content mt-2">
          <div class="row">
            <div
              style={{ padding: isMobile && "0px" }}
              class="col-xl-12 col-lg-12"
            >
              {/* end Add pricing Driver Function */}
              {/* ADD Global Pricing Driver */}
              {props.pricingDriver?.map((i, mainIndex) => {
                return (
                  <div
                    id={`Driver_${mainIndex}`}
                    class="card-1 pricing-box p-4 mt-3"
                    draggable="true"
                    onDragStart={(e) => {
                      e.dataTransfer.setData("Drivers", "DriverDatatype"); // Set a data type for the drag
                      e.dataTransfer.setData("index", mainIndex);
                      setDragOverStart(i);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverData(i);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const dataType = e.dataTransfer.getData("Drivers");
                      if (dataType == "DriverDatatype") {
                        const dragOverGlobalPricingDriverKeyId =
                          dragOverData?.dependant_GlobalPricingDriverKeyID?.includes(
                            dragOverStart?.globalPricingDriverKeyID,
                          );

                        const dragOverDriverId =
                          dragOverData?.dependant_GlobalPricingDriverKeyID?.includes(
                            dragOverStart?.temp_GlobalPricingDriverID_ForDependancy,
                          );

                        const dragOverDependsOnDriverId =
                          dragOverData?.globalPricingDriverKeyID?.includes(
                            dragOverStart.dependsOn_GlobalPricingDriverKeyID,
                          );
                        const dragOverStartDependsOnDriverId =
                          dragOverData?.dependsOn_GlobalPricingDriverKeyID?.includes(
                            dragOverStart.globalPricingDriverKeyID,
                          );

                        const dragOverDependsKeyId =
                          dragOverStart?.dependant_GlobalPricingDriverKeyID?.includes(
                            dragOverData?.globalPricingDriverKeyID,
                          );

                        const dragOverDependsId =
                          dragOverStart?.dependant_GlobalPricingDriverKeyID?.includes(
                            dragOverData?.temp_GlobalPricingDriverID_ForDependancy,
                          );

                        const sourceIndex = e.dataTransfer.getData("index");
                        const targetIndex = mainIndex;
                        if (
                          dragOverGlobalPricingDriverKeyId === true ||
                          dragOverDriverId === true ||
                          dragOverDependsId === true ||
                          dragOverDependsKeyId === true ||
                          dragOverDependsOnDriverId === true ||
                          dragOverStartDependsOnDriverId === true
                        ) {
                          props.setErrorMessageTitle("Sorry!");
                          props.setErrorMessage(
                            "You can't move dependant driver",
                          );
                          props.setOpenErrorModal(true);
                          props.setIsDriverDelete(true);
                          return false;
                        } else {
                          if (sourceIndex !== targetIndex) {
                            const updatedList = [...props.pricingDriver];
                            const [draggedItem] = updatedList.splice(
                              sourceIndex,
                              1,
                            );
                            updatedList.splice(targetIndex, 0, draggedItem);
                            props.setPricingDriver(updatedList);
                          }
                        }
                      }
                    }}
                  >
                    {/* Assuming this code is part of a React component or JSX context */}

                    <div
                      className="gpd-title text-nowrap"
                      style={{ cursor: "pointer" }}
                    >
                      {i.parentGlobalPricingDriverKeyID === null && (
                        <div onClick={() => toggleContentVisibility(mainIndex)}>
                          Local Pricing Driver{" "}
                          {props.pricingDriver
                            .filter(
                              (item) =>
                                item.parentGlobalPricingDriverKeyID === null,
                            )
                            .indexOf(i) + 1}
                          {visibleIndexes.includes(mainIndex) ? (
                            <span
                              style={{
                                backgroundColor: "white",
                                color: "#00afef",
                              }}
                            >
                              {" "}
                              <KeyboardArrowUpIcon />
                            </span>
                          ) : (
                            <span
                              style={{
                                backgroundColor: "white",
                                color: "#00afef",
                              }}
                            >
                              <ExpandMoreIcon />
                            </span>
                          )}
                        </div>
                      )}
                      {i.parentGlobalPricingDriverKeyID !== null && (
                        <div
                          onClick={() =>
                            toggleContentVisibilityForGlobal(mainIndex)
                          }
                        >
                          Global Pricing Driver{" "}
                          {props.pricingDriver
                            .filter(
                              (item) =>
                                item.parentGlobalPricingDriverKeyID !== null,
                            )
                            .indexOf(i) + 1}
                          {visibleIndexesGlobal.includes(mainIndex) ? (
                            <span
                              style={{
                                backgroundColor: "white",
                                color: "#00afef",
                              }}
                            >
                              {" "}
                              <KeyboardArrowUpIcon />
                            </span>
                          ) : (
                            <span
                              style={{
                                backgroundColor: "white",
                                color: "#00afef",
                              }}
                            >
                              <ExpandMoreIcon />
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      className="btn btn-sm btn-danger  gpd-title-1 left-responsive"
                      onClick={() => props.OnDeletePricingDriver(mainIndex)}
                    >
                      {" "}
                      <i
                        class="bi bi-trash3 margin-right"
                        style={{ marginRight: isMobile ? "0px" : "5px" }}
                      ></i>
                      <span class="d-none d-sm-inline-block">
                        Delete Pricing Driver
                      </span>
                    </button>
                    <div class="modal-body">
                      <div class="tab-content">
                        <div className="row" id={`DriverName_${mainIndex}`}>
                          <div className="col-lg-6">
                            <div className="mb-1">
                              <label className="form-label">
                                Driver Name{" "}
                                <span className="text-danger">*</span>
                              </label>
                              <div className="input-group input-height">
                                <input
                                  type="text"
                                  className="input-text"
                                  placeholder="Enter Driver Name"
                                  value={
                                    props.pricingDriver[mainIndex]
                                      ? props.pricingDriver[mainIndex]
                                          .driverName
                                      : ""
                                  }
                                  disabled={
                                    props.pricingDriver[mainIndex]
                                      .parentGlobalPricingDriverKeyID
                                      ? true
                                      : false
                                  }
                                  onChange={(e) => {
                                    const inputValue = e.target.value;
                                    const trimmedValue = inputValue.replace(
                                      /^\s+/g,
                                      "",
                                    ); // Remove leading spaces
                                    const capitalizedValue =
                                      trimmedValue.charAt(0).toUpperCase() +
                                      trimmedValue.slice(1);
                                    const isDuplicate =
                                      props.pricingDriver.some(
                                        (item, index) =>
                                          index !== mainIndex &&
                                          item.driverName.toUpperCase() ===
                                            capitalizedValue.toUpperCase(),
                                      );
                                    // if (isDuplicate) {
                                    //   seDuplicateName(true)
                                    // } else {
                                    //   seDuplicateName(false)
                                    // }
                                    props.OnPricingDriverChange(
                                      mainIndex,
                                      "driverName",
                                      capitalizedValue,
                                    );
                                  }}
                                  maxLength={75}
                                />
                              </div>
                              {props.gdrivererror.drivernameError &&
                              props.pricingDriver[mainIndex].driverName ===
                                "" ? (
                                <label className="validation">
                                  {ERROR_MESSAGES}
                                </label>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>
                          <div className="col-lg-6">
                            <div className="mb-1">
                              <label className="form-label">
                                Driver Type{" "}
                                <span className="text-danger">*</span>
                              </label>
                              <div className="input-group">
                                <DropDown
                                  className="phone-input-country-code selectDropDown Drop-down-width driver-type-cls"
                                  options={props.DriverTypeValue}
                                  value={props.DriverTypeValue.filter(
                                    (i) =>
                                      i.value ===
                                      props.pricingDriver[mainIndex]
                                        .driverTypeID,
                                  )}
                                  onChange={(e) =>
                                    props.OnDriverTypeChange(mainIndex, e)
                                  }
                                  placeholder="Select..."
                                  disabled={
                                    props.pricingDriver[mainIndex]
                                      .parentGlobalPricingDriverKeyID
                                      ? true
                                      : false
                                  }
                                />
                              </div>
                              {props.gdrivererror.drivernameError &&
                              props.pricingDriver[mainIndex].driverTypeID ===
                                "" ? (
                                <label className="validation">
                                  {ERROR_MESSAGES}
                                </label>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>
                          {i.driverTypeID === 5 && (
                            <>
                              <div className="col-lg-6">
                                <div className="mb-1">
                                  <label className="form-label">
                                    Text Value
                                  </label>
                                  <div className="input-group input-height">
                                    <input
                                      type="text"
                                      className="input-text"
                                      placeholder="Enter Text Value"
                                      value={i.text?.[0]?.textValue || null}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        props.OnPricingDriverChange(
                                          mainIndex,
                                          "TextValue",
                                          value,
                                        );
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="col-lg-6">
                                <div className="mb-1">
                                  <label className="form-label">
                                    Text Length{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                  <div className="input-group input-height">
                                    <input
                                      type="text"
                                      className="input-text"
                                      placeholder="Enter Text Length"
                                      value={i.text?.[0]?.textLength || ""}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        props.OnPricingDriverChange(
                                          mainIndex,
                                          "TextLength",
                                          value,
                                        );
                                      }}
                                      min="5"
                                      max="500"
                                      step="1"
                                    />
                                  </div>
                                  {props.gdrivererror.textLengthError &&
                                  !i.text[0]?.textLength ? (
                                    <label className="validation">
                                      {ERROR_MESSAGES}
                                    </label>
                                  ) : null}
                                </div>
                              </div>
                              <div className="col-lg-6">
                                <div className="mb-1">
                                  <label className="form-label">
                                    Allowed Special Characters
                                  </label>
                                  <Select
                                    isMulti
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                    options={specialCharOptions}
                                    value={specialCharOptions.filter((opt) =>
                                      (
                                        i.text?.[0]?.allowedSpecialCharacters ||
                                        ""
                                      )
                                        .split(",")
                                        .includes(opt.value),
                                    )}
                                    onChange={(selected) => {
                                      const chars = selected
                                        .map((s) => s.value)
                                        .join(",");
                                      props.OnPricingDriverChange(
                                        mainIndex,
                                        "AllowedSpecialCharacters",
                                        chars,
                                      );
                                    }}
                                    placeholder="Select special characters..."
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          {props.pricingDriver[mainIndex].driverTypeID ===
                            6 && (
                            <>
                              <div className="col-lg-6">
                                <div className="mb-1">
                                  <label className="form-label">
                                    Date Format{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                  <Select
                                    isDisabled={
                                      props.pricingDriver[mainIndex]
                                        .parentGlobalPricingDriverKeyID
                                        ? true
                                        : false
                                    }
                                    options={dateFormats}
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                    value={dateFormats.find(
                                      (f) =>
                                        f.value ===
                                          props.pricingDriver[mainIndex]
                                            .date?.[0]?.dateFormat ||
                                        f.value === dateFormats[3].value,
                                    )}
                                    onChange={(selected) => {
                                      const format = selected
                                        ? selected.value
                                        : null;
                                      props.OnPricingDriverChange(
                                        mainIndex,
                                        "DateFormat",
                                        format,
                                      );
                                    }}
                                  />
                                </div>
                                {props.gdrivererror.dateError && (
                                  <label className="validation">
                                    {ERROR_MESSAGES}
                                  </label>
                                )}
                              </div>

                              <div className="col-lg-6">
                                <div className="mb-1">
                                  <label className="form-label">
                                    Default Date Value
                                  </label>
                                  <input
                                    type="text"
                                    className="input-text"
                                    value={
                                      props.pricingDriver[mainIndex].date?.[0]
                                        ?.defaultDateValue
                                    }
                                    onChange={(e) =>
                                      props.OnPricingDriverChange(
                                        mainIndex,
                                        "defaultDateValue",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                              </div>

                              <div className="col-xl-12">
                                {/* {props.gdrivererror.dateError && (
                                  <div className="text-center">
                                    <label className="validation">At least 1 Period Block is required.</label>
                                  </div>
                                )} */}
                                {/* {props.pricingDriver[mainIndex].date?.map((item, index) => {
                                  console.log(item);
                                  return (
                                  <div className="card-1 pricing-box p-4 mt-3"
                                       key={index}
                                       id={`PeriodDiv_${mainIndex}${index}`}  >
                                    <div className="col-lg-6 col-md-6">
                                      <p
                                        className="office-name font-weight"
                                        style={{
                                          width: "auto",
                                          zIndex: "0",
                                        }}
                                      >
                                        Period Block {index + 1}
                                      </p>
                                    </div>

                                    {props.pricingDriver[mainIndex].date.length > 0 && (
                                      <button
                                        style={{ marginTop: "-34px" }}
                                        className="btn btn-sm btn-danger gpd-title-1"
                                        onClick={() => OnDeletePeriodBlock(mainIndex, index)}
                                      >
                                        <i
                                          className="bi bi-trash3"
                                          style={{ marginRight: isMobile ? "0px" : "5px" }}
                                        ></i>
                                        <span className="d-none d-sm-inline-block">Delete Period</span>
                                      </button>
                                    )}
                                    <div className="row">
                                      <div className="row">
                                      <div className="col-lg-6">
                                          <div className="mb-1">
                                            <label className="form-label">
                                              From Date{" "}
                                            </label>
                                            <div className="input-group input-height">
                                                <DatePicker
                                                  selected={props.parseStoredDate(
                                                    item.block[index].fromDate,
                                                    item.dateFormat || props.pricingDriver[mainIndex].date?.[0]?.dateFormat || dateFormats[0]?.value || "dd/MM/yyyy"
                                                  )}
                                                  disabled={
                                                    (index > 0 && props.pricingDriver[mainIndex].date?.[index - 1]?.toDate !== "") ||
                                                      props.pricingDriver[mainIndex].parentGlobalPricingDriverKeyID
                                                      ? true
                                                      : index !== 0
                                                  }
                                                  maxDate={
                                                    item.block[index].toDate
                                                      ? addDays(
                                                          props.parseStoredDate(
                                                            item.block[0].toDate,
                                                            item.dateFormat || props.pricingDriver[mainIndex].date?.[0]?.dateFormat || dateFormats[0]?.value || "dd/MM/yyyy"
                                                          ),
                                                          -1
                                                        )
                                                      : null
                                                  }
                                                  onChange={(date) =>
                                                    OnPeriodBlockChange(
                                                      mainIndex,
                                                      index,
                                                      "fromDate",
                                                      props.formatToDisplay(
                                                        date,
                                                        item.dateFormat || props.pricingDriver[mainIndex].date?.[0]?.dateFormat || dateFormats[0]?.value || "dd/MM/yyyy"
                                                      )
                                                    )
                                                  }
                                                  placeholderText={
                                                    item.dateFormat || props.pricingDriver[mainIndex].date?.[0]?.dateFormat || dateFormats[0]?.value || "dd/MM/yyyy"
                                                  }
                                                  dateFormat={
                                                    item.dateFormat || props.pricingDriver[mainIndex].date?.[0]?.dateFormat || dateFormats[0]?.value || "dd/MM/yyyy"
                                                  }
                                                  className="input-text"
                                                />
                                            </div>
                                          </div>
                                        </div>

                                        <div className="col-lg-6">
                                          <div className="mb-1">
                                            <label className="form-label">
                                              To Date{" "}
                                            </label>
                                            <div className="input-group input-height">
                                                <DatePicker
                                                  selected={props.parseStoredDate(
                                                    item.block[index].toDate,
                                                    item.dateFormat || props.pricingDriver[mainIndex].date?.[0]?.dateFormat || dateFormats[0]?.value || "dd/MM/yyyy"
                                                  )}
                                                  disabled={
                                                    props.pricingDriver[mainIndex].parentGlobalPricingDriverKeyID ? true : false
                                                  }
                                                  minDate={
                                                    item.fromDate
                                                      ? addDays(
                                                        item.block[index].fromDate instanceof Date
                                                          ? item.block[index].fromDate
                                                          : parse(
                                                            item.fromDate,
                                                            item.dateFormat || props.pricingDriver[mainIndex].date?.[0]?.dateFormat || dateFormats[0]?.value || "dd/MM/yyyy",
                                                            new Date()
                                                          ),
                                                        1
                                                      )
                                                      : null
                                                  }
                                                  onChange={(date) =>
                                                    OnPeriodBlockChange(
                                                      mainIndex,
                                                      index,
                                                      "toDate",
                                                      props.formatToDisplay(
                                                        date,
                                                        item.dateFormat || props.pricingDriver[mainIndex].date?.[0]?.dateFormat || dateFormats[0]?.value || "dd/MM/yyyy"
                                                      )
                                                    )
                                                  }
                                                  placeholderText={
                                                    item.dateFormat || props.pricingDriver[mainIndex].date?.[0]?.dateFormat || dateFormats[0]?.value || "dd/MM/yyyy"
                                                  }
                                                  dateFormat={
                                                    item.dateFormat || props.pricingDriver[mainIndex].date?.[0]?.dateFormat || dateFormats[0]?.value || "dd/MM/yyyy"
                                                  }
                                                  className="input-text"
                                                />
                                            </div>
                                          </div>
                                            {props.gdrivererror?.toDateError?.[mainIndex]?.[index] && (
                                              <label className="text-danger mt-1 text-center">
                                                To Date cannot be earlier than From Date.
                                              </label>
                                            )}
                                        </div>
                                          {props.gdrivererror?.dateValueError?.[mainIndex]?.[index] && (
                                            <label className="text-danger mt-1 text-center">
                                              Either From date or To date is required
                                            </label>
                                          )}
                                    </div>
                                    <div className="row input-group input-height mt-1">
                                      <div className="col-lg-6">
                                        <label className="form-label">Date Value </label>
                                        <input
                                          type="text"
                                          className="input-text"
                                          value={item.dateValue}
                                          onChange={(e) =>
                                            OnPeriodBlockChange(mainIndex, index, "dateValue", e.target.value)
                                          }
                                        />
                                      </div>
                                    </div>
                                      </div>
                                    </div>
                                  )
                                })} */}
                                {props.pricingDriver[mainIndex]?.date?.map(
                                  (dateItem, dateGroupIndex) =>
                                    dateItem?.blocks?.map(
                                      (blockItem, blockIndex, arr) => {
                                        // const isBlockEmpty =
                                        //   (blockItem.fromDate === null || blockItem.fromDate === "") &&
                                        //   (blockItem.toDate === null || blockItem.toDate === "");
                                        // const isOnlyBlock = arr.length === 1;

                                        // // Only show if it has a date or is a newly added block
                                        // if (isBlockEmpty && isOnlyBlock) {
                                        //   return null;
                                        // }
                                        return (
                                          <div
                                            className="card-1 pricing-box p-4 mt-3"
                                            key={`PeriodDiv_${mainIndex}_${dateGroupIndex}_${blockIndex}`}
                                            id={`PeriodDiv_${mainIndex}_${dateGroupIndex}_${blockIndex}`}
                                          >
                                            <div className="col-lg-6 col-md-6">
                                              <p
                                                className="office-name font-weight"
                                                style={{
                                                  width: "auto",
                                                  zIndex: "0",
                                                }}
                                              >
                                                Period Block{" "}
                                                {dateGroupIndex + 1}
                                              </p>
                                            </div>

                                            {dateItem.blocks.length > 0 && (
                                              <button
                                                disabled={
                                                  props.pricingDriver[
                                                    mainIndex
                                                  ] &&
                                                  props.pricingDriver[mainIndex]
                                                    .parentGlobalPricingDriverKeyID
                                                    ? true
                                                    : false
                                                }
                                                style={{ marginTop: "-34px" }}
                                                className="btn btn-sm btn-danger gpd-title-1"
                                                onClick={() =>
                                                  OnDeletePeriodBlock(
                                                    mainIndex,
                                                    dateGroupIndex,
                                                    blockIndex,
                                                  )
                                                }
                                              >
                                                <i
                                                  className="bi bi-trash3"
                                                  style={{
                                                    marginRight: isMobile
                                                      ? "0px"
                                                      : "5px",
                                                  }}
                                                ></i>
                                                <span className="d-none d-sm-inline-block">
                                                  Delete Period
                                                </span>
                                              </button>
                                            )}

                                            <div className="row">
                                              {/* From Date */}
                                              <div className="col-lg-6">
                                                <div className="mb-1">
                                                  <label className="form-label">
                                                    From Date
                                                  </label>
                                                  <div className="input-group input-height">
                                                    <DatePicker
                                                      selected={props.parseStoredDate(
                                                        blockItem.fromDate,
                                                        dateItem.dateFormat,
                                                      )}
                                                      disabled={
                                                        (dateGroupIndex > 0 &&
                                                          dateItem.blocks?.[
                                                            dateGroupIndex - 1
                                                          ]?.toDate !== "") ||
                                                        props.pricingDriver[
                                                          mainIndex
                                                        ]
                                                          .parentGlobalPricingDriverKeyID
                                                          ? true
                                                          : blockIndex !== 0
                                                      }
                                                      maxDate={
                                                        blockItem.toDate
                                                          ? addDays(
                                                              props.parseStoredDate(
                                                                blockItem.toDate,
                                                                dateItem.dateFormat,
                                                              ),
                                                              -1,
                                                            )
                                                          : null
                                                      }
                                                      onChange={(date) =>
                                                        OnPeriodBlockChange(
                                                          mainIndex,
                                                          dateGroupIndex,
                                                          blockIndex,
                                                          "fromDate",
                                                          props.formatToDisplay(
                                                            date,
                                                            dateItem.dateFormat,
                                                          ),
                                                        )
                                                      }
                                                      placeholderText={dateItem.dateFormat?.toUpperCase()}
                                                      dateFormat={
                                                        dateItem.dateFormat
                                                      }
                                                      className="input-text"
                                                    />
                                                  </div>
                                                </div>
                                              </div>

                                              {/* To Date */}
                                              <div className="col-lg-6">
                                                <div className="mb-1">
                                                  <label className="form-label">
                                                    To Date
                                                  </label>
                                                  <div className="input-group input-height">
                                                    <DatePicker
                                                      selected={props.parseStoredDate(
                                                        blockItem.toDate,
                                                        dateItem.dateFormat,
                                                      )}
                                                      disabled={
                                                        props.pricingDriver[
                                                          mainIndex
                                                        ]
                                                          .parentGlobalPricingDriverKeyID
                                                      }
                                                      minDate={
                                                        blockItem.fromDate
                                                          ? addDays(
                                                              typeof blockItem.fromDate ===
                                                                "string"
                                                                ? parse(
                                                                    blockItem.fromDate,
                                                                    dateItem.dateFormat,
                                                                    new Date(),
                                                                  )
                                                                : blockItem.fromDate,
                                                              1,
                                                            )
                                                          : null
                                                      }
                                                      onChange={(date) =>
                                                        OnPeriodBlockChange(
                                                          mainIndex,
                                                          dateGroupIndex,
                                                          blockIndex,
                                                          "toDate",
                                                          props.formatToDisplay(
                                                            date,
                                                            dateItem.dateFormat,
                                                          ),
                                                        )
                                                      }
                                                      placeholderText={dateItem.dateFormat?.toUpperCase()}
                                                      dateFormat={
                                                        dateItem.dateFormat
                                                      }
                                                      className="input-text"
                                                    />
                                                  </div>
                                                </div>

                                                {props.gdrivererror
                                                  ?.toDateError?.[mainIndex]?.[
                                                  blockIndex
                                                ] && (
                                                  <label className="text-danger mt-1 text-center">
                                                    To Date cannot be earlier
                                                    than From Date.
                                                  </label>
                                                )}
                                              </div>

                                              {props.gdrivererror
                                                ?.dateValueError?.[mainIndex]?.[
                                                blockIndex
                                              ] && (
                                                <label className="text-danger mt-1 text-center">
                                                  Either From date or To date is
                                                  required
                                                </label>
                                              )}
                                            </div>

                                            <div className="row input-group input-height mt-1">
                                              <div className="col-lg-6">
                                                <label className="form-label">
                                                  Date Value{" "}
                                                </label>
                                                <input
                                                  type="text"
                                                  className="input-text"
                                                  value={blockItem.dateValue}
                                                  onChange={(e) =>
                                                    OnPeriodBlockChange(
                                                      mainIndex,
                                                      dateGroupIndex,
                                                      blockIndex,
                                                      "dateValue",
                                                      e.target.value,
                                                    )
                                                  }
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      },
                                    ),
                                )}
                                <span className="delete-right align-right mt-1">
                                  <button
                                    onClick={() => {
                                      const dateGroups =
                                        props.pricingDriver[mainIndex]?.date ||
                                        [];
                                      const lastGroupIndex =
                                        dateGroups.length - 1;
                                      OnAddPeriodBlock(
                                        mainIndex,
                                        lastGroupIndex,
                                      );
                                    }}
                                    disabled={(() => {
                                      const driver =
                                        props.pricingDriver[mainIndex];
                                      if (
                                        driver &&
                                        driver.parentGlobalPricingDriverKeyID
                                      )
                                        return true;
                                      const lastGroup = driver?.date?.at(-1);
                                      const lastBlock =
                                        lastGroup?.blocks?.at(-1);
                                      return lastBlock && !lastBlock.toDate;
                                    })()}
                                    className="btn btn-sm create-item-btn d-flex gap-1"
                                  >
                                    <i className="bi bi-plus-circle"></i>
                                    <span>Add Period Block</span>
                                  </button>
                                </span>
                              </div>
                            </>
                          )}
                          {(TotalVariationsAddedBeforeMe(
                            props.pricingDriver,
                            mainIndex,
                          ) > 0 &&
                            visibleIndexes.includes(mainIndex)) ||
                            visibleIndexesGlobal.includes(mainIndex) ||
                            (props.pricingDriver[mainIndex].driverTypeID && (
                              <>
                                {props.pricingDriver
                                  .slice(0, 1)
                                  .map((i, index) => {
                                    return (
                                      <>
                                        {i.variation !== "" && (
                                          <>
                                            {props.pricingDriver.some(
                                              (item) => item.driverTypeID === 3,
                                            ) &&
                                            findDriverTypeIndex < mainIndex ? (
                                              <>
                                                <div
                                                  id={`Depends_${mainIndex}`}
                                                  className="col-lg-12"
                                                  style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                  }}
                                                >
                                                  <input
                                                    style={{
                                                      marginRight: "1rem",
                                                      // marginBottom: "25px",
                                                    }}
                                                    type="checkbox"
                                                    id={`slab block${mainIndex}`}
                                                    checked={
                                                      props.pricingDriver[
                                                        mainIndex
                                                      ].dependServer ||
                                                      props.pricingDriver[
                                                        mainIndex
                                                      ]
                                                        .dependsOn_GlobalPricingDriverKeyID !==
                                                        null
                                                    }
                                                    name="slab"
                                                    onChange={(e) => {
                                                      props.OnPricingDriverChange(
                                                        mainIndex,
                                                        "dependServer",
                                                        e.target.checked,
                                                      );
                                                    }}
                                                  />
                                                  <label
                                                    className="toggle"
                                                    name="slab"
                                                    style={{
                                                      cursor: "pointer",
                                                      marginBottom: "-2px",
                                                    }}
                                                    htmlFor={`slab block${mainIndex}`}
                                                  >
                                                    Depends on Previous Driver
                                                  </label>
                                                </div>
                                                {(props.pricingDriver[mainIndex]
                                                  .dependServer === true ||
                                                  props.pricingDriver[mainIndex]
                                                    .dependsOn_GlobalPricingDriverKeyID !==
                                                    null) && (
                                                  <>
                                                    <div
                                                      className="col-lg-6"
                                                      id={`SelectDriver${mainIndex}`}
                                                    >
                                                      <div className="mb-1">
                                                        <label
                                                          htmlFor="useremail"
                                                          className="form-label"
                                                        >
                                                          Select Driver
                                                          <span className="text-danger">
                                                            *
                                                          </span>
                                                        </label>
                                                        <div className="input-group">
                                                          <Select
                                                            className="user-role-select"
                                                            // value={(props.pricingDriver[mainIndex].dependsOn_GlobalPricingDriverKeyID === null || props.pricingDriver[mainIndex].dependsOn_DriverID === null) ? "" : props.pricingDriver[mainIndex].dependsOn_GlobalPricingDriverKeyID !== null ? props.pricingDriver.filter((i) => i.globalPricingDriverKeyID === props.pricingDriver[mainIndex].dependsOn_GlobalPricingDriverKeyID).map((item) => ({ value: item.globalPricingDriverKeyID, label: item.driverName })) : props.pricingDriver.filter((i) => i.temp_GlobalPricingDriverID_ForDependancy === props.pricingDriver[mainIndex].dependsOn_DriverID).map((item) => ({ value: item.globalPricingDriverKeyID, label: item.driverName }))}
                                                            value={
                                                              (props
                                                                .pricingDriver[
                                                                mainIndex
                                                              ]
                                                                .dependsOn_DriverID &&
                                                                props.pricingDriver
                                                                  .filter(
                                                                    (i) =>
                                                                      i.temp_GlobalPricingDriverID_ForDependancy ===
                                                                      props
                                                                        .pricingDriver[
                                                                        mainIndex
                                                                      ]
                                                                        .dependsOn_DriverID,
                                                                  )
                                                                  .map(
                                                                    (item) => ({
                                                                      value:
                                                                        item.globalPricingDriverKeyID,
                                                                      label:
                                                                        item.driverName,
                                                                    }),
                                                                  )) ||
                                                              (props
                                                                .pricingDriver[
                                                                mainIndex
                                                              ]
                                                                .dependsOn_GlobalPricingDriverKeyID &&
                                                              props
                                                                .pricingDriver[
                                                                mainIndex
                                                              ]
                                                                .dependsOn_GlobalPricingDriverKeyID !==
                                                                null
                                                                ? props.pricingDriver
                                                                    .filter(
                                                                      (i) =>
                                                                        i.globalPricingDriverKeyID ===
                                                                        props
                                                                          .pricingDriver[
                                                                          mainIndex
                                                                        ]
                                                                          .dependsOn_GlobalPricingDriverKeyID,
                                                                    )
                                                                    .map(
                                                                      (
                                                                        item,
                                                                      ) => ({
                                                                        value:
                                                                          item.globalPricingDriverKeyID,
                                                                        label:
                                                                          item.driverName,
                                                                      }),
                                                                    )
                                                                : undefined) // add appropriate default value or handle undefined as needed
                                                            }
                                                            onChange={(
                                                              selectedOption,
                                                            ) => {
                                                              // Finding the index of the selected option in pricingDriver array
                                                              const index =
                                                                props.pricingDriver.findIndex(
                                                                  (item) =>
                                                                    item.globalPricingDriverKeyID ===
                                                                    selectedOption.value,
                                                                );

                                                              // Finding the index of the selected option based on temp_GlobalPricingDriverID_ForDependancy
                                                              const Temp_Index =
                                                                props.pricingDriver.findIndex(
                                                                  (item) =>
                                                                    item.temp_GlobalPricingDriverID_ForDependancy ===
                                                                    selectedOption.value,
                                                                );

                                                              if (
                                                                index !== -1
                                                              ) {
                                                                // Handling when index is found

                                                                props.OnPricingDriverChange(
                                                                  mainIndex,
                                                                  "dependsOn_GlobalPricingDriverKeyID", // Adjusted property name based on your logic, you might need to modify it
                                                                  selectedOption.value,
                                                                );

                                                                props.OnDependantOnDriver(
                                                                  index == -1
                                                                    ? Temp_Index
                                                                    : index,
                                                                  "dependant_GlobalPricingDriverKeyID", // Adjusted property name based on your logic, you might need to modify it
                                                                  props
                                                                    .pricingDriver[
                                                                    mainIndex
                                                                  ]
                                                                    .globalPricingDriverKeyID,
                                                                );
                                                              } else {
                                                                {
                                                                  props.OnPricingDriverChange(
                                                                    mainIndex,
                                                                    "dependsOn_DriverID", // Adjusted property name based on your logic, you might need to modify it
                                                                    selectedOption.value,
                                                                  );

                                                                  props.OnDependantOnDriver(
                                                                    index == -1
                                                                      ? Temp_Index
                                                                      : index,
                                                                    "dependant_GlobalPricingDriverKeyID", // Adjusted property name based on your logic, you might need to modify it
                                                                    props
                                                                      .pricingDriver[
                                                                      mainIndex
                                                                    ]
                                                                      .temp_GlobalPricingDriverID_ForDependancy,
                                                                  );
                                                                }
                                                              }
                                                            }}
                                                            options={
                                                              props
                                                                .pricingDriver[
                                                                mainIndex
                                                              ].driverTypeID ===
                                                                2 ||
                                                              props
                                                                .pricingDriver[
                                                                mainIndex
                                                              ].driverTypeID ===
                                                                4
                                                                ? props.pricingDriver
                                                                    .filter(
                                                                      (
                                                                        item,
                                                                        index,
                                                                      ) =>
                                                                        index <
                                                                          mainIndex &&
                                                                        item.driverTypeID ===
                                                                          3,
                                                                    )
                                                                    .map(
                                                                      (
                                                                        filteredDriver,
                                                                        index,
                                                                      ) => ({
                                                                        value:
                                                                          filteredDriver.temp_GlobalPricingDriverID_ForDependancy !==
                                                                          null
                                                                            ? filteredDriver.temp_GlobalPricingDriverID_ForDependancy
                                                                            : filteredDriver.globalPricingDriverKeyID,
                                                                        label:
                                                                          filteredDriver.driverName,
                                                                      }),
                                                                    )
                                                                : // If dependsOn_DriverID is not 2 or 4, use a different set of options
                                                                  props.pricingDriver
                                                                    .filter(
                                                                      (
                                                                        item,
                                                                        index,
                                                                      ) =>
                                                                        index <
                                                                          mainIndex &&
                                                                        item.driverTypeID ===
                                                                          3,
                                                                    )
                                                                    //.slice(0, -1)
                                                                    .map(
                                                                      (
                                                                        filteredDriver,
                                                                        index,
                                                                      ) => ({
                                                                        value:
                                                                          filteredDriver.temp_GlobalPricingDriverID_ForDependancy !==
                                                                          null
                                                                            ? filteredDriver.temp_GlobalPricingDriverID_ForDependancy
                                                                            : filteredDriver.globalPricingDriverKeyID,
                                                                        label:
                                                                          filteredDriver.driverName,
                                                                      }),
                                                                    )
                                                            }
                                                          />
                                                          {props.gdrivererror
                                                            .SelectDriver &&
                                                          (props.pricingDriver[
                                                            mainIndex
                                                          ]
                                                            .dependsOn_GlobalPricingDriverKeyID ===
                                                            undefined ||
                                                            props.pricingDriver[
                                                              mainIndex
                                                            ]
                                                              .dependsOn_GlobalPricingDriverKeyID ===
                                                              null ||
                                                            props.pricingDriver[
                                                              mainIndex
                                                            ]
                                                              .dependsOn_GlobalPricingDriverKeyID ===
                                                              "") &&
                                                          (props.pricingDriver[
                                                            mainIndex
                                                          ]
                                                            .dependsOn_DriverID ===
                                                            undefined ||
                                                            props.pricingDriver[
                                                              mainIndex
                                                            ]
                                                              .dependsOn_DriverID ===
                                                              null ||
                                                            props.pricingDriver[
                                                              mainIndex
                                                            ]
                                                              .dependsOn_DriverID ===
                                                              "") ? (
                                                            <label className="validation">
                                                              {ERROR_MESSAGES}
                                                            </label>
                                                          ) : (
                                                            ""
                                                          )}
                                                        </div>
                                                      </div>
                                                    </div>
                                                    {(props.pricingDriver[
                                                      mainIndex
                                                    ].dependsOn_DriverID ||
                                                      props.pricingDriver[
                                                        mainIndex
                                                      ]
                                                        .dependsOn_GlobalPricingDriverKeyID !==
                                                        null) && (
                                                      <div
                                                        className="col-lg-6"
                                                        id={`SelectVariation${mainIndex}`}
                                                      >
                                                        <div className="mb-1">
                                                          <label className="form-label">
                                                            Select Variation
                                                            <span className="text-danger">
                                                              *
                                                            </span>
                                                          </label>
                                                          <div className="input-group">
                                                            <Select
                                                              className="user-role-select"
                                                              value={
                                                                props
                                                                  .pricingDriver[
                                                                  mainIndex
                                                                ]
                                                                  .dependsOn_GlobalPricingDriverKeyID
                                                                  ? props.pricingDriver
                                                                      .filter(
                                                                        (i) =>
                                                                          i.globalPricingDriverKeyID ===
                                                                          props
                                                                            .pricingDriver[
                                                                            mainIndex
                                                                          ]
                                                                            .dependsOn_GlobalPricingDriverKeyID,
                                                                      )[0]
                                                                      ?.variation?.filter(
                                                                        (
                                                                          variation,
                                                                        ) =>
                                                                          variation.variationKeyID ===
                                                                          props
                                                                            .pricingDriver[
                                                                            mainIndex
                                                                          ]
                                                                            .dependsOn_VariationKeyID,
                                                                      )
                                                                      .map(
                                                                        (
                                                                          item,
                                                                        ) => ({
                                                                          value:
                                                                            item.variationKeyID,
                                                                          label:
                                                                            item.variationName,
                                                                        }),
                                                                      )
                                                                  : props
                                                                        .pricingDriver[
                                                                        mainIndex
                                                                      ]
                                                                        .variationKeyID
                                                                    ? props
                                                                        .pricingDriver[
                                                                        mainIndex
                                                                      ]
                                                                        .variationKeyID !==
                                                                      null
                                                                      ? props.pricingDriver
                                                                          .filter(
                                                                            (
                                                                              i,
                                                                            ) =>
                                                                              i.globalPricingDriverKeyID ===
                                                                              props
                                                                                .pricingDriver[
                                                                                mainIndex
                                                                              ]
                                                                                .dependsOn_GlobalPricingDriverKeyID,
                                                                          )[0]
                                                                          .variation.filter(
                                                                            (
                                                                              variation,
                                                                            ) =>
                                                                              variation.variationKeyID ===
                                                                              props
                                                                                .pricingDriver[
                                                                                mainIndex
                                                                              ]
                                                                                .dependsOn_VariationKeyID,
                                                                          )
                                                                          .map(
                                                                            (
                                                                              item,
                                                                            ) => ({
                                                                              value:
                                                                                item.variationKeyID,
                                                                              label:
                                                                                item.variationName,
                                                                            }),
                                                                          )
                                                                      : undefined
                                                                    : props
                                                                        .pricingDriver[
                                                                        mainIndex
                                                                      ]
                                                                        .dependsOn_VariationID &&
                                                                      props.pricingDriver
                                                                        .filter(
                                                                          (i) =>
                                                                            i.temp_GlobalPricingDriverID_ForDependancy ===
                                                                            props
                                                                              .pricingDriver[
                                                                              mainIndex
                                                                            ]
                                                                              .dependsOn_DriverID,
                                                                        )[0]
                                                                        ?.variation?.filter(
                                                                          (
                                                                            variation,
                                                                          ) =>
                                                                            variation.temp_VariationID_ForDependancy ===
                                                                            props
                                                                              .pricingDriver[
                                                                              mainIndex
                                                                            ]
                                                                              .dependsOn_VariationID,
                                                                        )
                                                                        ?.map(
                                                                          (
                                                                            item,
                                                                          ) => ({
                                                                            value:
                                                                              item.variationKeyID,
                                                                            label:
                                                                              item.variationName,
                                                                          }),
                                                                        )
                                                              }
                                                              onChange={(
                                                                selectedOption,
                                                              ) => {
                                                                let recordsFoundCount = 0;
                                                                for (const obj of props.pricingDriver) {
                                                                  for (const variation of obj.variation) {
                                                                    if (
                                                                      variation.variationKeyID ===
                                                                      selectedOption.value
                                                                    ) {
                                                                      recordsFoundCount =
                                                                        recordsFoundCount +
                                                                        1;
                                                                    }
                                                                  }
                                                                }
                                                                //if (index !== -1) {
                                                                if (
                                                                  recordsFoundCount >
                                                                  0
                                                                ) {
                                                                  props.OnPricingDriverChange(
                                                                    mainIndex,
                                                                    "dependsOn_VariationKeyID",
                                                                    selectedOption.value,
                                                                  );
                                                                } else {
                                                                  props.OnPricingDriverChange(
                                                                    mainIndex,
                                                                    "dependsOn_VariationID",
                                                                    selectedOption.value,
                                                                  );
                                                                }
                                                              }}
                                                              options={
                                                                props
                                                                  .pricingDriver[
                                                                  mainIndex
                                                                ]
                                                                  .dependsOn_GlobalPricingDriverKeyID !==
                                                                null
                                                                  ? props.pricingDriver
                                                                      .filter(
                                                                        (
                                                                          item,
                                                                        ) =>
                                                                          item.globalPricingDriverKeyID ===
                                                                          props
                                                                            .pricingDriver[
                                                                            mainIndex
                                                                          ]
                                                                            .dependsOn_GlobalPricingDriverKeyID,
                                                                      )[0]
                                                                      ?.variation.map(
                                                                        (
                                                                          i,
                                                                        ) => ({
                                                                          value:
                                                                            i.variationKeyID,
                                                                          label:
                                                                            i.variationName,
                                                                        }),
                                                                      )
                                                                  : props.pricingDriver
                                                                      .filter(
                                                                        (
                                                                          item,
                                                                        ) =>
                                                                          item.temp_GlobalPricingDriverID_ForDependancy ===
                                                                          Number(
                                                                            props
                                                                              .pricingDriver[
                                                                              mainIndex
                                                                            ]
                                                                              .dependsOn_DriverID,
                                                                          ),
                                                                      )
                                                                      .map(
                                                                        (
                                                                          filteredDriver,
                                                                          index,
                                                                        ) =>
                                                                          filteredDriver.variation.map(
                                                                            (
                                                                              item,
                                                                            ) => ({
                                                                              value:
                                                                                item.temp_VariationID_ForDependancy !==
                                                                                null
                                                                                  ? item.temp_VariationID_ForDependancy
                                                                                  : item.variationKeyID,
                                                                              label:
                                                                                item.variationName,
                                                                            }),
                                                                          ),
                                                                      )
                                                                      .flat() // Flatten the nested array
                                                              }
                                                            />

                                                            {props.gdrivererror
                                                              .SelectVariation &&
                                                            (props
                                                              .pricingDriver[
                                                              mainIndex
                                                            ]
                                                              .dependsOn_VariationKeyID ===
                                                              undefined ||
                                                              props
                                                                .pricingDriver[
                                                                mainIndex
                                                              ]
                                                                .dependsOn_VariationKeyID ===
                                                                null ||
                                                              props
                                                                .pricingDriver[
                                                                mainIndex
                                                              ]
                                                                .dependsOn_VariationKeyID ===
                                                                "") &&
                                                            (props
                                                              .pricingDriver[
                                                              mainIndex
                                                            ]
                                                              .dependsOn_VariationID ===
                                                              undefined ||
                                                              props
                                                                .pricingDriver[
                                                                mainIndex
                                                              ]
                                                                .dependsOn_VariationID ===
                                                                null ||
                                                              props
                                                                .pricingDriver[
                                                                mainIndex
                                                              ]
                                                                .dependsOn_VariationID ===
                                                                "") ? (
                                                              <label className="validation">
                                                                {ERROR_MESSAGES}
                                                              </label>
                                                            ) : (
                                                              ""
                                                            )}
                                                          </div>
                                                        </div>
                                                      </div>
                                                    )}
                                                  </>
                                                )}
                                              </>
                                            ) : (
                                              <></>
                                            )}
                                          </>
                                        )}
                                      </>
                                    );
                                  })}
                              </>
                            ))}
                        </div>
                        {/* <!-- end tab row --> */}
                        {/* <!-- Start tab row --> */}

                        {visibleIndexes.includes(mainIndex) ||
                          visibleIndexesGlobal.includes(mainIndex) ||
                          (props.pricingDriver[mainIndex].driverTypeID ===
                            3 && (
                            <VariationDragDrop
                              setPricingDriver={props.setPricingDriver}
                              driverTypeValue1={props.driverTypeValue1}
                              OnVariationsRadioChange={
                                props.OnVariationsRadioChange
                              }
                              isMobile={isMobile}
                              DuplicateName={DuplicateName}
                              seDuplicateName={seDuplicateName}
                              OnDeleteVariations={props.OnDeleteVariations}
                              globalPricingDrivers={props.globalPricingDrivers}
                              gdrivererror={props.gdrivererror}
                              GlobalPricingDriverAddUpdateBtnClicked={
                                props.GlobalPricingDriverAddUpdateBtnClicked
                              }
                              DriverValue={DriverValue}
                              pricingDriver={props.pricingDriver}
                              OnAddVariations={props.OnAddVariations}
                              DriverTypeValue={props.DriverTypeValue}
                              OnDriverTypeChange={props.OnDriverTypeChange}
                              OnVariationChange={props.OnVariationChange}
                              mainIndex={mainIndex}
                              i={i}
                              OnDependantOnDriver={props.OnDependantOnDriver}
                            />
                          ))}

                        {/* <!-- end tab row --> */}
                        {visibleIndexes.includes(mainIndex) ||
                          visibleIndexesGlobal.includes(mainIndex) ||
                          (props.pricingDriver[mainIndex].driverTypeID ===
                            2 && (
                            <>
                              <div className="row mb-3">
                                <div className="col-lg-6">
                                  <div className="mb-1">
                                    <label className="form-label">
                                      Quantity Decimal Places{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
                                      <Select
                                        className="user-role-select"
                                        onChange={(selectedOption) =>
                                          props.OnDecimalPlacesChange(
                                            selectedOption,
                                            mainIndex,
                                          )
                                        }
                                        isDisabled={
                                          props.pricingDriver[mainIndex]
                                            .parentGlobalPricingDriverKeyID
                                        }
                                        value={{
                                          value:
                                            props.pricingDriver[mainIndex]
                                              ?.quantity?.[0]
                                              ?.quantityDecimalPlaces ?? 0,
                                          label: (() => {
                                            const decimalPlaces =
                                              props.pricingDriver[mainIndex]
                                                ?.quantity?.[0]
                                                ?.quantityDecimalPlaces ?? 0;
                                            if (decimalPlaces === 0) {
                                              return "No decimal places";
                                            } else if (decimalPlaces === 1) {
                                              return "1 decimal place";
                                            } else {
                                              return `${decimalPlaces} decimal places`;
                                            }
                                          })(),
                                        }}
                                        options={[
                                          {
                                            value: 2,
                                            label: "2 decimal places",
                                          },
                                          {
                                            value: 1,
                                            label: "1 decimal place",
                                          },
                                          {
                                            value: 0,
                                            label: "No decimal places",
                                          },
                                        ]}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="row">
                                <div className="col-12">
                                  <label>Allowed Range</label>
                                </div>
                              </div>
                              <div className="row fieldset mt-1">
                                <div className="col-lg-6">
                                  <div className="mb-1">
                                    <label className="form-label">From</label>
                                    <div className="input-group">
                                      <input
                                        type="text"
                                        className="input-text"
                                        value={
                                          props.pricingDriver[mainIndex]
                                            .quantity?.[0]?.quantityFrom || ""
                                        }
                                        onChange={(e) =>
                                          props.OnQuantityChange(
                                            e.target.value,
                                            "from",
                                            mainIndex,
                                          )
                                        }
                                        onBlur={() => {
                                          const updatedDrivers = [
                                            ...props.pricingDriver,
                                          ];
                                          const currentValue =
                                            updatedDrivers[mainIndex]
                                              ?.quantity?.[0]?.quantityFrom;
                                          const decimalPlaces =
                                            updatedDrivers[mainIndex]
                                              ?.quantity?.[0]
                                              ?.quantityDecimalPlaces ?? 0;

                                          if (
                                            currentValue &&
                                            currentValue !== ""
                                          ) {
                                            const numValue =
                                              parseFloat(currentValue);
                                            if (!isNaN(numValue)) {
                                              const formattedValue =
                                                decimalPlaces === 0
                                                  ? Math.floor(
                                                      numValue,
                                                    ).toString()
                                                  : numValue.toFixed(
                                                      decimalPlaces,
                                                    );

                                              const updatedQuantities = [
                                                ...(updatedDrivers[mainIndex]
                                                  .quantity || []),
                                              ];
                                              updatedQuantities[0] = {
                                                ...updatedQuantities[0],
                                                quantityFrom: formattedValue,
                                              };

                                              updatedDrivers[mainIndex] = {
                                                ...updatedDrivers[mainIndex],
                                                quantity: updatedQuantities,
                                              };

                                              props.setPricingDriver(
                                                updatedDrivers,
                                              );
                                            }
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-lg-6">
                                  <div className="mb-1">
                                    <label className="form-label">To</label>
                                    <div className="input-group">
                                      <input
                                        type="text"
                                        className="input-text"
                                        value={
                                          props.pricingDriver[mainIndex]
                                            .quantity?.[0]?.quantityTo || ""
                                        }
                                        onChange={(e) =>
                                          props.OnQuantityChange(
                                            e.target.value,
                                            "to",
                                            mainIndex,
                                          )
                                        }
                                        onBlur={() => {
                                          const updatedDrivers = [
                                            ...props.pricingDriver,
                                          ];
                                          const currentValue =
                                            updatedDrivers[mainIndex]
                                              ?.quantity?.[0]?.quantityTo;
                                          const decimalPlaces =
                                            updatedDrivers[mainIndex]
                                              ?.quantity?.[0]
                                              ?.quantityDecimalPlaces ?? 0;

                                          if (
                                            currentValue &&
                                            currentValue !== ""
                                          ) {
                                            const numValue =
                                              parseFloat(currentValue);
                                            if (!isNaN(numValue)) {
                                              const formattedValue =
                                                decimalPlaces === 0
                                                  ? Math.floor(
                                                      numValue,
                                                    ).toString()
                                                  : numValue.toFixed(
                                                      decimalPlaces,
                                                    );

                                              const updatedQuantities = [
                                                ...(updatedDrivers[mainIndex]
                                                  .quantity || []),
                                              ];
                                              updatedQuantities[0] = {
                                                ...updatedQuantities[0],
                                                quantityTo: formattedValue,
                                              };

                                              updatedDrivers[mainIndex] = {
                                                ...updatedDrivers[mainIndex],
                                                quantity: updatedQuantities,
                                              };

                                              props.setPricingDriver(
                                                updatedDrivers,
                                              );
                                            }
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                                {props.gdrivererror.quantityTypeError && (
                                  <label className="text-danger">
                                    Invalid Range
                                  </label>
                                )}
                              </div>
                            </>
                          )) ||
                          (props.pricingDriver[mainIndex].driverTypeID == 4 && (
                            <div class="row" id={`Slab_${mainIndex}`}>
                              <div
                                style={{ padding: isMobile && "0px" }}
                                class="col-xl-12 col-lg-12"
                              >
                                <div className="row mb-3">
                                  <div className="col-lg-6">
                                    <div className="mb-1">
                                      <label className="form-label">
                                        Decimal Places{" "}
                                        <span className="text-danger">*</span>
                                      </label>
                                      <div className="input-group">
                                        <Select
                                          className="user-role-select"
                                          onChange={(selectedOption) =>
                                            props.OnSlabChange(
                                              mainIndex,
                                              null,
                                              "decimalPlaces",
                                              selectedOption.value,
                                            )
                                          }
                                          isDisabled={
                                            props.pricingDriver[mainIndex]
                                              .parentGlobalPricingDriverKeyID
                                          }
                                          value={{
                                            value:
                                              props.pricingDriver[mainIndex]
                                                .slab?.[0]?.decimalPlaces ?? 2,
                                            label: Utils.getDecimalPlaceLabel(
                                              props.pricingDriver[mainIndex]
                                                .slab?.[0]?.decimalPlaces ?? 2,
                                            ),
                                          }}
                                          options={Utils.DECIMAL_PLACE_OPTIONS}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {props.gdrivererror.slabDecimalError &&
                                props.pricingDriver[mainIndex]
                                  ?.decimalPlaces === "" ? (
                                  <label className="validation">
                                    {ERROR_MESSAGES}
                                  </label>
                                ) : (
                                  ""
                                )}
                                {props.gdrivererror.slabError &&
                                props.pricingDriver[mainIndex].slab.length ===
                                  0 ? (
                                  <div className="text-center">
                                    <label className="validation">
                                      At least 1 Slab is required.
                                    </label>
                                  </div>
                                ) : (
                                  ""
                                )}
                                {props.pricingDriver[mainIndex].slab.length ===
                                  0 && (
                                  <span className="delete-right align-right mt-1">
                                    <button
                                      onClick={() => {
                                        if (
                                          props.pricingDriver[mainIndex]
                                            .parentGlobalPricingDriverKeyID ===
                                          null
                                        ) {
                                          props.OnAddSlab(mainIndex);
                                        }
                                      }}
                                      class={`btn btn-sm ${
                                        props.pricingDriver[mainIndex]
                                          .parentGlobalPricingDriverKeyID
                                          ? "create-item-btn-2"
                                          : "create-item-btn"
                                      } d-flex gap-1`}
                                    >
                                      <i class="bi bi-plus-circle"></i>
                                      <span>Add Slab</span>
                                    </button>
                                  </span>
                                )}
                                {props.pricingDriver[mainIndex].slab?.map(
                                  (i, index) => {
                                    const decimalPlaces =
                                      props.pricingDriver[mainIndex]
                                        .decimalPlaces || 2;
                                    const pattern =
                                      decimalPlaces === 0
                                        ? /^\d+$/
                                        : new RegExp(
                                            `^\\d+(\\.\\d{0,${decimalPlaces}})?$`,
                                          );
                                    return (
                                      <div
                                        id={`SlabDiv_${mainIndex}${index}`}
                                        class="card-1 pricing-box p-4 mt-3"
                                        key={index}
                                      >
                                        {/* Decimal Places Dropdown - Add at the top */}
                                        <div class="col-lg-6 col-md-6">
                                          <p
                                            class="office-name font-weight"
                                            style={{
                                              width: "auto",
                                              zIndex: "0",
                                            }}
                                          >
                                            Slab{index + 1}
                                          </p>
                                        </div>
                                        <button
                                          style={{ marginTop: "-34px" }}
                                          className="btn btn-sm btn-danger  gpd-title-1"
                                          disabled={
                                            props.pricingDriver[mainIndex]
                                              .parentGlobalPricingDriverKeyID
                                              ? true
                                              : false
                                          }
                                          onClick={() => {
                                            if (
                                              props.pricingDriver[mainIndex]
                                                .parentGlobalPricingDriverKeyID ===
                                              null
                                            ) {
                                              props.OnDeleteSlabs(
                                                mainIndex,
                                                index,
                                              );
                                            }
                                          }}
                                        >
                                          {" "}
                                          <i
                                            class="bi bi-trash3"
                                            style={{
                                              marginRight: isMobile
                                                ? "0px"
                                                : "5px",
                                            }}
                                          ></i>
                                          <span class="d-none d-sm-inline-block">
                                            Delete Slab
                                          </span>
                                        </button>
                                        <div class="row mt-1">
                                          <div className="col-lg-6">
                                            <div className="mb-1">
                                              <label className="form-label">
                                                Slab Type{" "}
                                                <span className="text-danger">
                                                  *
                                                </span>
                                              </label>
                                              <div className="input-group">
                                                <Select
                                                  className="user-role-select"
                                                  onChange={(selectedOption) =>
                                                    props.OnSlabChange(
                                                      mainIndex,
                                                      index,
                                                      "slabTypeID",
                                                      selectedOption.value,
                                                    )
                                                  }
                                                  isDisabled={
                                                    props.pricingDriver[
                                                      mainIndex
                                                    ]
                                                      .parentGlobalPricingDriverKeyID
                                                      ? true
                                                      : false
                                                  }
                                                  value={slabTypeOptions?.filter(
                                                    (i) =>
                                                      i.value ===
                                                      props.pricingDriver[
                                                        mainIndex
                                                      ].slab[index].slabTypeID,
                                                  )}
                                                  options={slabTypeOptions}
                                                  placeholder="Select..."
                                                />
                                              </div>
                                              {props.gdrivererror.slabTypeID &&
                                              props.pricingDriver[mainIndex]
                                                .slab[index].slabTypeID ===
                                                "" ? (
                                                <label className="validation">
                                                  {ERROR_MESSAGES}
                                                </label>
                                              ) : (
                                                ""
                                              )}
                                            </div>
                                          </div>
                                          {props.pricingDriver[mainIndex]
                                            .slab &&
                                            props.pricingDriver[mainIndex].slab[
                                              index
                                            ]?.slabTypeID == "1" && (
                                              <>
                                                <div className="col-lg-6">
                                                  <div className="mb-1">
                                                    <label className="form-label">
                                                      Value{" "}
                                                      <span className="text-danger">
                                                        *
                                                      </span>
                                                    </label>
                                                    <div className="input-group input-height">
                                                      <input
                                                        type="text"
                                                        className="input-text"
                                                        placeholder="Value"
                                                        value={
                                                          props.pricingDriver[
                                                            mainIndex
                                                          ].slab[index]
                                                            .slabValue === ""
                                                            ? ""
                                                            : props.pricingDriver[
                                                                mainIndex
                                                              ].slab[
                                                                index
                                                              ].slabValue
                                                                .toString()
                                                                .replace(
                                                                  /\B(?=(\d{3})+(?!\d))/g,
                                                                  ",",
                                                                )
                                                        }
                                                        onChange={(e) => {
                                                          DriverValue(
                                                            e,
                                                            mainIndex,
                                                            index,
                                                            "slabValue",
                                                          );
                                                        }}
                                                      />
                                                    </div>
                                                    {props.gdrivererror
                                                      .slabtypevalueError &&
                                                    props.pricingDriver[
                                                      mainIndex
                                                    ].slab[index].slabValue ===
                                                      "" ? (
                                                      <label className="validation">
                                                        {ERROR_MESSAGES}
                                                      </label>
                                                    ) : (
                                                      ""
                                                    )}
                                                  </div>
                                                </div>
                                                <div className="col-lg-6">
                                                  <div className="mb-1">
                                                    <label className="form-label">
                                                      From{" "}
                                                      <span className="text-danger">
                                                        *
                                                      </span>
                                                    </label>
                                                    <div className="input-group input-height">
                                                      {/* <input
                                                        type="text"
                                                        className="input-text"
                                                        placeholder="From"
                                                        disabled={
                                                          props.pricingDriver[
                                                            mainIndex
                                                          ]
                                                            .parentGlobalPricingDriverKeyID
                                                            ? true
                                                            : index === 0
                                                              ? false
                                                              : true
                                                        }
                                                        // disabled={index === 0 ? false : true}
                                                        value={
                                                          props.pricingDriver[
                                                            mainIndex
                                                          ].slab[index]
                                                            .slabFrom === ""
                                                            ? ""
                                                            : props.pricingDriver[
                                                              mainIndex
                                                            ].slab[
                                                              index
                                                            ].slabFrom
                                                              .toString()
                                                              .replace(
                                                                /\B(?=(\d{3})+(?!\d))/g,
                                                                ","
                                                              )
                                                        }
                                                        onChange={(e) => {
                                                          DriverValue(
                                                            e,
                                                            mainIndex,
                                                            index,
                                                            "slabFrom"
                                                          );
                                                        }}
                                                      /> */}
                                                      <input
                                                        type="text"
                                                        className="input-text"
                                                        placeholder="From"
                                                        disabled={
                                                          props.pricingDriver[
                                                            mainIndex
                                                          ]
                                                            .parentGlobalPricingDriverKeyID
                                                            ? true
                                                            : index !== 0
                                                        }
                                                        value={
                                                          props.pricingDriver[
                                                            mainIndex
                                                          ].slab[index]
                                                            .slabFrom !== "" &&
                                                          props.pricingDriver[
                                                            mainIndex
                                                          ].slab[index]
                                                            .slabFrom !==
                                                            null &&
                                                          props.pricingDriver[
                                                            mainIndex
                                                          ].slab[index]
                                                            .slabFrom !==
                                                            undefined
                                                            ? props.pricingDriver[
                                                                mainIndex
                                                              ].slab[
                                                                index
                                                              ].slabFrom.toString()
                                                            : ""
                                                        }
                                                        onChange={(e) => {
                                                          DriverValue(
                                                            e,
                                                            mainIndex,
                                                            index,
                                                            "slabFrom",
                                                          );
                                                        }}
                                                        onBlur={(e) => {
                                                          const rawValue =
                                                            e.target.value;
                                                          if (
                                                            rawValue &&
                                                            rawValue !== ""
                                                          ) {
                                                            const decimalPlaces =
                                                              props
                                                                .pricingDriver[
                                                                mainIndex
                                                              ].slab[index]
                                                                ?.decimalPlaces ??
                                                              2;
                                                            let numeric =
                                                              parseFloat(
                                                                rawValue,
                                                              );

                                                            if (
                                                              !isNaN(numeric)
                                                            ) {
                                                              const formatted =
                                                                numeric.toFixed(
                                                                  decimalPlaces,
                                                                );
                                                              DriverValue(
                                                                {
                                                                  target: {
                                                                    value:
                                                                      formatted,
                                                                  },
                                                                },
                                                                mainIndex,
                                                                index,
                                                                "slabFrom",
                                                              );
                                                            }
                                                          }
                                                        }}
                                                      />
                                                    </div>
                                                    {props.gdrivererror
                                                      .slabtypevalueError &&
                                                    props.pricingDriver[
                                                      mainIndex
                                                    ].slab[index].slabFrom ===
                                                      "" ? (
                                                      <label className="validation">
                                                        {ERROR_MESSAGES}
                                                      </label>
                                                    ) : (
                                                      ""
                                                    )}
                                                  </div>
                                                </div>
                                                <div className="col-lg-6">
                                                  <div className="mb-1">
                                                    <label className="form-label">
                                                      To{" "}
                                                      <span className="text-danger">
                                                        *
                                                      </span>
                                                    </label>
                                                    <div className="input-group input-height">
                                                      {/* <input
                                                        type="text"
                                                        className="input-text"
                                                        placeholder="To"
                                                        disabled={
                                                          props.pricingDriver[
                                                            mainIndex
                                                          ]
                                                            .parentGlobalPricingDriverKeyID
                                                            ? true
                                                            : false
                                                        }
                                                        value={
                                                          props.pricingDriver[
                                                            mainIndex
                                                          ].slab[index]
                                                            .slabTo === ""
                                                            ? ""
                                                            : props.pricingDriver[
                                                              mainIndex
                                                            ].slab[
                                                              index
                                                            ].slabTo
                                                              .toString()
                                                              .replace(
                                                                /\B(?=(\d{3})+(?!\d))/g,
                                                                ","
                                                              )
                                                        }
                                                        onChange={(e) => {
                                                          DriverValue(
                                                            e,
                                                            mainIndex,
                                                            index,
                                                            "slabTo"
                                                          );
                                                        }}
                                                      /> */}
                                                      <input
                                                        type="text"
                                                        className="input-text"
                                                        placeholder="To"
                                                        disabled={
                                                          props.pricingDriver[
                                                            mainIndex
                                                          ]
                                                            .parentGlobalPricingDriverKeyID
                                                            ? true
                                                            : false
                                                        }
                                                        value={
                                                          props.pricingDriver[
                                                            mainIndex
                                                          ].slab[index]
                                                            .slabTo !== "" &&
                                                          props.pricingDriver[
                                                            mainIndex
                                                          ].slab[index]
                                                            .slabTo !== null &&
                                                          props.pricingDriver[
                                                            mainIndex
                                                          ].slab[index]
                                                            .slabTo !==
                                                            undefined
                                                            ? props.pricingDriver[
                                                                mainIndex
                                                              ].slab[
                                                                index
                                                              ].slabTo.toString()
                                                            : ""
                                                        }
                                                        onChange={(e) => {
                                                          DriverValue(
                                                            e,
                                                            mainIndex,
                                                            index,
                                                            "slabTo",
                                                          );
                                                        }}
                                                        onBlur={(e) => {
                                                          const rawValue =
                                                            e.target.value;
                                                          if (
                                                            rawValue &&
                                                            rawValue !== ""
                                                          ) {
                                                            const decimalPlaces =
                                                              props
                                                                .pricingDriver[
                                                                mainIndex
                                                              ].slab[index]
                                                                ?.decimalPlaces ??
                                                              2;
                                                            let numeric =
                                                              parseFloat(
                                                                rawValue,
                                                              );

                                                            if (
                                                              !isNaN(numeric)
                                                            ) {
                                                              const formatted =
                                                                numeric.toFixed(
                                                                  decimalPlaces,
                                                                );
                                                              DriverValue(
                                                                {
                                                                  target: {
                                                                    value:
                                                                      formatted,
                                                                  },
                                                                },
                                                                mainIndex,
                                                                index,
                                                                "slabTo",
                                                              );
                                                            }
                                                          }
                                                        }}
                                                      />
                                                    </div>
                                                    {props.gdrivererror
                                                      .slabToMinValue &&
                                                    parseFloat(
                                                      props.pricingDriver[
                                                        mainIndex
                                                      ].slab[index].slabTo,
                                                    ) <
                                                      parseFloat(
                                                        props.pricingDriver[
                                                          mainIndex
                                                        ].slab[index].slabFrom,
                                                      ) ? (
                                                      <label className="validation">
                                                        The field must not be
                                                        less than{" "}
                                                        {
                                                          props.pricingDriver[
                                                            mainIndex
                                                          ].slab[index].slabFrom
                                                        }
                                                        .
                                                      </label>
                                                    ) : (
                                                      ""
                                                    )}

                                                    {props.gdrivererror
                                                      .slabtypevalueError &&
                                                    props.pricingDriver[
                                                      mainIndex
                                                    ].slab[index].slabTo ===
                                                      "" ? (
                                                      <label className="validation">
                                                        {ERROR_MESSAGES}
                                                      </label>
                                                    ) : (
                                                      ""
                                                    )}
                                                  </div>
                                                </div>
                                                <div
                                                  className="col-lg-12 col-12"
                                                  style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                  }}
                                                >
                                                  <input
                                                    style={{
                                                      marginRight: "1rem",
                                                    }}
                                                    type="radio"
                                                    id={`slab block${mainIndex}${index}`}
                                                    disabled={
                                                      props.pricingDriver[
                                                        mainIndex
                                                      ]
                                                        .parentGlobalPricingDriverKeyID
                                                        ? true
                                                        : false
                                                    }
                                                    checked={
                                                      props.pricingDriver[
                                                        mainIndex
                                                      ].slab[index]?.isDefault
                                                    }
                                                    name={`slab${mainIndex}`}
                                                    onChange={(e) =>
                                                      props.OnSlabsRadioChange(
                                                        mainIndex,
                                                        index,
                                                      )
                                                    }
                                                  />
                                                  <label
                                                    className="toggle"
                                                    name={`slab${mainIndex}`}
                                                    style={{
                                                      cursor: "pointer",
                                                      marginBottom: "0",
                                                    }}
                                                    htmlFor={`slab block${mainIndex}${index}`}
                                                  >
                                                    Set to Default
                                                  </label>
                                                </div>{" "}
                                              </>
                                            )}
                                          {props.pricingDriver[mainIndex]
                                            .slab &&
                                            props.pricingDriver[mainIndex]
                                              ?.slab[index]?.slabTypeID ==
                                              "2" && (
                                              <>
                                                <div className="col-lg-6">
                                                  <div className="mb-1">
                                                    <label className="form-label">
                                                      Increment Value By{" "}
                                                      <span className="text-danger">
                                                        *
                                                      </span>
                                                    </label>
                                                    <div className="input-group input-height">
                                                      <input
                                                        type="text"
                                                        className="input-text"
                                                        placeholder="Increment Value By"
                                                        value={
                                                          props.pricingDriver[
                                                            mainIndex
                                                          ].slab[index]
                                                            .slabValue === ""
                                                            ? ""
                                                            : props.pricingDriver[
                                                                mainIndex
                                                              ].slab[
                                                                index
                                                              ].slabValue
                                                                .toString()
                                                                .replace(
                                                                  /\B(?=(\d{3})+(?!\d))/g,
                                                                  ",",
                                                                )
                                                        }
                                                        onChange={(e) => {
                                                          DriverValue(
                                                            e,
                                                            mainIndex,
                                                            index,
                                                            "slabValue",
                                                          );
                                                        }}
                                                      />
                                                    </div>
                                                    {props.gdrivererror
                                                      .slabtypevalueError &&
                                                    props.pricingDriver[
                                                      mainIndex
                                                    ].slab[index].slabValue ===
                                                      "" ? (
                                                      <label className="validation">
                                                        {ERROR_MESSAGES}
                                                      </label>
                                                    ) : (
                                                      ""
                                                    )}
                                                  </div>
                                                </div>
                                                <div className="col-lg-6">
                                                  <div className="mb-1">
                                                    <label className="form-label">
                                                      From{" "}
                                                      <span className="text-danger">
                                                        *
                                                      </span>
                                                    </label>
                                                    <div className="input-group input-height">
                                                      <input
                                                        type="text"
                                                        className="input-text"
                                                        placeholder="From"
                                                        disabled={
                                                          props.pricingDriver[
                                                            mainIndex
                                                          ]
                                                            .parentGlobalPricingDriverKeyID
                                                            ? true
                                                            : index === 0
                                                              ? false
                                                              : true
                                                        }
                                                        value={
                                                          props.pricingDriver[
                                                            mainIndex
                                                          ].slab[index]
                                                            .slabFrom === ""
                                                            ? ""
                                                            : props.pricingDriver[
                                                                mainIndex
                                                              ].slab[
                                                                index
                                                              ].slabFrom
                                                                .toString()
                                                                .replace(
                                                                  /\B(?=(\d{3})+(?!\d))/g,
                                                                  ",",
                                                                )
                                                        }
                                                        onChange={(e) => {
                                                          DriverValue(
                                                            e,
                                                            mainIndex,
                                                            index,
                                                            "slabFrom",
                                                          );
                                                        }}
                                                      />
                                                    </div>

                                                    {props.gdrivererror
                                                      .slabtypevalueError &&
                                                    props.pricingDriver[
                                                      mainIndex
                                                    ].slab[index].slabFrom ===
                                                      "" ? (
                                                      <label className="validation">
                                                        {ERROR_MESSAGES}
                                                      </label>
                                                    ) : (
                                                      ""
                                                    )}
                                                  </div>
                                                </div>
                                                <div className="col-lg-6">
                                                  <div className="mb-1">
                                                    <label className="form-label">
                                                      Increment Slab By{" "}
                                                      <span className="text-danger">
                                                        *
                                                      </span>
                                                    </label>
                                                    <div className="input-group input-height">
                                                      <input
                                                        type="text"
                                                        className="input-text"
                                                        placeholder="Increment Slab By"
                                                        disabled={
                                                          props.pricingDriver[
                                                            mainIndex
                                                          ]
                                                            .parentGlobalPricingDriverKeyID
                                                            ? true
                                                            : false
                                                        }
                                                        value={
                                                          props.pricingDriver[
                                                            mainIndex
                                                          ].slab[index]
                                                            .slabTo === ""
                                                            ? ""
                                                            : props.pricingDriver[
                                                                mainIndex
                                                              ].slab[
                                                                index
                                                              ].slabTo
                                                                .toString()
                                                                .replace(
                                                                  /\B(?=(\d{3})+(?!\d))/g,
                                                                  ",",
                                                                )
                                                        }
                                                        onChange={(e) => {
                                                          DriverValue(
                                                            e,
                                                            mainIndex,
                                                            index,
                                                            "slabTo",
                                                          );
                                                        }}
                                                      />
                                                    </div>
                                                    {props.gdrivererror
                                                      .slabtypevalueError &&
                                                    props.pricingDriver[
                                                      mainIndex
                                                    ].slab[index].slabTo ===
                                                      "" ? (
                                                      <label className="validation">
                                                        {ERROR_MESSAGES}
                                                      </label>
                                                    ) : (
                                                      ""
                                                    )}
                                                  </div>
                                                </div>
                                                <div
                                                  className="col-lg-12 col-12"
                                                  style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                  }}
                                                >
                                                  {" "}
                                                  <input
                                                    style={{
                                                      marginRight: "1rem",
                                                    }}
                                                    type="radio"
                                                    id={`incremental slab${mainIndex}${index}`}
                                                    disabled={
                                                      props.pricingDriver[
                                                        mainIndex
                                                      ]
                                                        ?.parentGlobalPricingDriverKeyID
                                                        ? true
                                                        : false
                                                    }
                                                    checked={
                                                      props.pricingDriver[
                                                        mainIndex
                                                      ].slab[index]?.isDefault
                                                    }
                                                    name={`slab${mainIndex}`}
                                                    onChange={(e) =>
                                                      props.OnSlabsRadioChange(
                                                        mainIndex,
                                                        index,
                                                      )
                                                    }
                                                  />
                                                  <label
                                                    className="toggle"
                                                    name={`slab${mainIndex}`}
                                                    style={{
                                                      cursor: "pointer",
                                                      marginBottom: "0",
                                                    }}
                                                    htmlFor={`incremental slab${mainIndex}${index}`}
                                                  >
                                                    Set to Default
                                                  </label>
                                                </div>
                                              </>
                                            )}
                                        </div>
                                      </div>
                                    );
                                  },
                                )}
                                {props.pricingDriver[mainIndex].slab &&
                                  props.pricingDriver[mainIndex]?.slab[
                                    props.pricingDriver[mainIndex].slab
                                      ?.length - 1
                                  ]?.slabTypeID == "1" && (
                                    <span className="delete-right align-right mt-1">
                                      <button
                                        onClick={() => {
                                          if (
                                            props.pricingDriver[mainIndex]
                                              .parentGlobalPricingDriverKeyID ===
                                            null
                                          ) {
                                            props.OnAddSlab(mainIndex);
                                          }
                                        }}
                                        class={`btn btn-sm ${
                                          props.pricingDriver[mainIndex]
                                            .parentGlobalPricingDriverKeyID
                                            ? "create-item-btn-2"
                                            : "create-item-btn"
                                        } d-flex gap-1`}
                                      >
                                        <i class="bi bi-plus-circle"></i>
                                        <p className="delete-margin">
                                          Add Slab
                                        </p>
                                      </button>
                                    </span>
                                  )}
                              </div>
                            </div>
                          ))}
                        <label
                          className="validation"
                          style={{
                            fontSize: "15px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {props.errorMessage ===
                            "Driver Name Already Exists" &&
                            `Global Pricing Driver with name ${props.servicesObj.driverName} already exists!`}
                        </label>
                        {/* <!-- end tab row --> */}
                      </div>
                    </div>
                    {/* End Slab Function */}
                  </div>
                );
              })}{" "}
              {/* End Global Pricing Driver */}
              {/* Fee Inflation Indexes */}
              {/* Fee inflation list moved to its own tab when applicable */}
            </div>
          </div>
        </div>
      </div>
      <div>
        <div class="separator"></div>
        <div
          className="mt-3"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          {isMobile && (
            <>
              <button
                onClick={(e) => {
                  props.OnAdd("PricingDriver", props.pricingDriver.length);
                }}
                className="btn btn-md btn-success create-item-btn mb-2 mb-md-0 mr-md-2"
              >
                <i className="bi bi-plus-circle mr-3"></i>
                <span>Add Local Pricing Driver</span>
              </button>
              <button
                className="btn create-item btn btn-md btn-success create-item-btn mb-2 mb-md-0 mr-md-2 add-global-driver-price"
                onClick={() => {
                  props.setTitle("Add Global Pricing Driver");
                }}
                data-bs-toggle="modal"
                data-bs-target="#addDeleteGlobalPricingDriverModal"
              >
                <i className="bi bi-plus-circle mr-3"></i>
                <span>Add Global Pricing Driver</span>
              </button>
            </>
          )}
        </div>
        <div class="row fieldset modal-footer">
          <div class="col-lg-12 hstack gap-2 justify-content-end text-right mt-3">
            {!isMobile && (
              <>
                <button
                  onClick={() => {
                    props.OnAdd("PricingDriver", props.pricingDriver.length);
                  }}
                  className="btn btn-md btn-success create-item-btn"
                >
                  <i className="bi bi-plus-circle mr-3"></i>
                  <span>Add Local Pricing Driver</span>
                </button>
                <button
                  className="btn create-item btn btn-md btn-success create-item-btn mr-3 add-global-driver-price"
                  onClick={() => {
                    props.setTitle("Add Global Pricing Driver");
                  }}
                  data-bs-toggle="modal"
                  data-bs-target="#addDeleteGlobalPricingDriverModal"
                >
                  <i className="bi bi-plus-circle mr-3"></i>
                  <span>Add Global Pricing Driver</span>
                </button>
              </>
            )}
            {props.modelRequestData.Type ? (
              <>
                <button
                  type="submit"
                  class="btn btn-md btn-success declined-item-btn"
                  // data-bs-dismiss="modal"
                  onClick={() => props.DeclineSuperAdminChangesData("Decline")}
                >
                  <span>Decline</span>
                </button>
              </>
            ) : (
              <>
                <button
                  class="btn btn-md  btn-light"
                  onClick={props.handleCancelButton}
                >
                  <span>{props.getCrudButtonTextName("Cancel")}</span>
                </button>
              </>
            )}
            <button
              onClick={() => props.handleBackButton(2)}
              style={{ paddingTop: "5px", marginRight: "4px" }}
              className="btn btn-md btn-success create-item-btn"
            >
              <span>Back</span>
            </button>
            <button
              class="btn btn-md btn-success create-item-btn"
              onClick={() =>
                props.GlobalPricingDriverAddUpdateBtnClicked(
                  props.servicesObj.pricingTypeID === 2 &&
                    props.servicesObj?.serviceFeeInflationList?.length > 0
                    ? ServiceHeader.FeeInflation
                    : ServiceHeader.PricingFormula,
                )
              }
            >
              <span>Next</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const PricingFormulaComponent = (props) => {
  return (
    <>
      <div className="scrollbar">
        <div className="tab-content">
          <div class="tab-pane p-3 active">
            <div class="row">
              <div className="col-12">
                <div className="mb-3 ">
                  <label className="form-label">
                    Pricing Formula <span className="text-danger">*</span>
                    <span
                      style={{ fontSize: "10px" }}
                    >{` (Please type @ to see global pricing driver list)`}</span>
                  </label>
                  <div className="input-group">
                    <TagIfy
                      PricingFormulaValue={props.PricingFormulaValue}
                      setEditPricingFormulaValue={
                        props.setEditPricingFormulaValue
                      }
                      EditPricingFormulaValue={props.EditPricingFormulaValue}
                      PricingFormula={props.PricingFormula}
                      setserviceError={props.setserviceError}
                      handleChange={props.handleChange}
                      tagifyRef={props.tagifyRef}
                      servicesObj={props.servicesObj}
                      setServicesObj={props.setServicesObj}
                    />
                  </div>
                  {}
                  {props.serviceError.pricingFormula &&
                    (props.EditPricingFormulaValue === undefined ||
                      props.EditPricingFormulaValue === "" ||
                      props.EditPricingFormulaValue === null) && (
                      <label className="validation">{ERROR_MESSAGES}</label>
                    )}
                  {props.pricingFormulaError && (
                    <label className="validation">
                      {props.pricingFormulaError}
                    </label>
                  )}
                </div>
              </div>
              <div className="col-12">
                <div className="mb-1 mt-2">
                  <label className="form-label">
                    Floor Value ({props.currencySymbol})
                  </label>
                </div>
              </div>
              <div className="col-4 col-sm-8">
                <div className="input-group input-height">
                  <input
                    type="text"
                    inputMode="decimal"
                    className="input-text"
                    placeholder="Enter Floor Value"
                    value={props.servicesObj?.floorValue ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;

                      // no leading zero, optional decimal with up to 2 digits
                      if (!/^[1-9]\d*(\.\d{0,2})?$/.test(value) && value !== "")
                        return;

                      // enforce max 10000
                      const num = parseFloat(value);
                      if (value !== "" && !isNaN(num) && num > 10000) return;

                      props.setServicesObj((prev) => ({
                        ...prev,
                        floorValue: value,
                      }));
                    }}
                    max={999}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center">
        {props.errorMessage && (
          <label className="validation text-center">{props.errorMessage}</label>
        )}
        <div class="separator"></div>
        <div class="row fieldset modal-footer">
          <div class="col-lg-12 hstack gap-2 justify-content-end text-right mt-3">
            {props.modelRequestData.Type ? (
              <>
                <button
                  type="submit"
                  class="btn btn-md btn-success declined-item-btn"
                  // data-bs-dismiss="modal"
                  onClick={() => props.DeclineSuperAdminChangesData("Decline")}
                >
                  <span>Decline</span>
                </button>
              </>
            ) : (
              <>
                <button
                  class="btn btn-md  btn-light"
                  onClick={props.handleCancelButton}
                >
                  <span>{props.getCrudButtonTextName("Cancel")}</span>
                </button>
              </>
            )}
            <button
              onClick={() => {
                const prev =
                  props.servicesObj.pricingTypeID === 2 &&
                  props.servicesObj?.serviceFeeInflationList?.length > 0
                    ? props.ServiceHeader.FeeInflation
                    : props.ServiceHeader.PricingDrivers;
                props.handleBackButton(prev);
                // props.setActiveTab(prev)
              }}
              style={{ paddingTop: "5px", marginRight: "4px" }}
              className="btn btn-md btn-success create-item-btn"
            >
              <span>Back</span>
            </button>
            {props.modelRequestData.Type ? (
              <>
                <button
                  type="submit"
                  class="btn btn-md btn-success accept-item-btn"
                  onClick={() => {
                    props.GlobalPricingDriverAddUpdateBtnClicked(
                      "GetConfirmationBeforeSaveForGPD",
                      "Accept",
                    );
                  }}
                >
                  <span>Accept</span>
                </button>
              </>
            ) : (
              <>
                <button
                  class="btn btn-md btn-success create-item-btn"
                  onClick={() =>
                    props.GlobalPricingDriverAddUpdateBtnClicked(
                      "GetConfirmationBeforeSaveForGPD",
                    )
                  }
                >
                  <span>
                    {props.modelAction === "Add"
                      ? props.getCrudButtonTextName("Add", props.moduleName)
                      : props.getCrudButtonTextName("Update", props.moduleName)}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const Add_Update_Service = (props) => {
  // Handle Local Storage Redux Throw
  const moduleName = "Service";
  const common = useSelector((state) => state.Storage);
  const {
    prospectName,
    isMobile,
    getCrudButtonTextName,
    getCrudPopUpTitleName,
    setLoader,
    setTopbar,
    scrollUptoCurrentPosition,
    scrollUpDownByElementID,
    getCurrencySymbol,
  } = useContext(AuthContextProvider);
  const currencySymbol = getCurrencySymbol(common.currency);
  //Data Get On Another Component
  const location = useLocation();
  const dispatch = useDispatch();
  // A] States Declaration :
  const [serviceCategoryList, setServiceCategoryList] = useState([]);
  const [serviceChargeTypeList, setServiceChargeTypeList] = useState([]);
  const [ServiceDependencyList, setServiceDependencyList] = useState([]);
  const [pricingTypeList, setPricingTypeList] = useState([]);
  const [NatureOfBusinessTypeLookupList, setNatureOfBusinessTypeLookupList] =
    useState([]);
  const [BusinessTypeLookupList, setBusinessTypeLookupList] = useState([]);
  const [pricingDriver, setPricingDriver] = useState([]); // Add for Pricing Driver
  const [isAddUpdateActionDone, setIsAddUpdateActionDone] = useState(false);
  const [professionTypeLookupList, setProfessionTypeLookupList] = useState([]);
  const [modelAction, setModelAction] = useState("");
  const tagifyRef = useRef(null);
  const [gdrivererror, setGdriverError] = useState({
    pfError: false,
    variationError: false,
    slabError: false,
    drivernameError: false,
    drivertypeError: false,
    variationnameError: false,
    variationvalueError: false,
    slabtypeError: false,
    slabDecimalError: false,
    slabtypevalueError: false,
    slabtypefromError: false,
    slabTypeToError: false,
    slabToMinValue: false,
    SelectDriver: false,
    slabTypeID: false,
    SelectVariation: false,
    SelectTempDriver: false,
    SelectTempVariation: false,
    dateError: false,
    toDateError: false,
    dateValueError: false,
    textValueError: false,
    textLengthError: false,
    quantityTypeError: false,
  });

  const [isServiceDependentandModified, setIsServiceDependentandModified] =
    useState(false);
  const [slabType, setSlabType] = useState([]);
  const [slabTypeVal, SetSlabTypeVal] = useState("");
  const [disable, setDisable] = useState(false);
  const [globalPricingDrivers, setGlobalPricingDrivers] = useState([]);
  const [addGBP, setAddGBP] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorMessageTitle, setErrorMessageTitle] = useState("");
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [isDriverDelete, setIsDriverDelete] = useState(false);
  const [isDeclined, setIsDeclined] = useState(false);
  const [Status, setStatus] = React.useState(false);
  const [driverType, setDriverType] = useState([]);
  const [driverTypeValue1, setDriverTypeValue1] = useState([]);
  const [count, setCount] = useState(0);
  const [professionType, setProfessionType] = useState([]);
  const [serviceError, setserviceError] = useState({
    basicInformationError: false,
    pricingDrivers: false,
    priceError: false,
    pricingFormula: false,
  });
  const [activeTabForm, setActiveTabForm] = useState({
    activeBasicInformationForm: false,
    activeDescriptionForm: false,
    activePricingDrivers: false,
    activePricingFormula: false,
  });

  const [modelRequestData, setModelRequestData] = useState({
    Action: null,
    message: "",
    DriverName: [],
    index: null,
    serviceCatID: null,
    globalPricingDriverKeyID: null,
    SearchKeyword: "",
    globalPricingDriver: [],
    ServiceName: [],
    name: null,
    Type: null,
  });

  const [servicesObj, setServicesObj] = useState({
    userKeyID: common.userKeyID,
    organisationKeyID: common.organisationKeyID,
    // serviceKeyID: location.state?.globalPricingDriverKeyID,
    clientBusinessTypeID: [],
    businessNatureID: [],
    prerequisiteServicesID: [],
    dependingServicesID: [],
    serviceKeyID: null,
    serviceName: "",
    serviceChargeTypeID: null,
    pricingTypeID: null,
    price: null,
    description: null,
    pricingFormula: "",
    floorValue: null,
    isPredefined: true,
    professionTypeList: [],
    serviceCategoryList: [],
    pricingDriverList: [],
    pricingFormulaGlobalPricingDriverList: [],
    serviceFeeInflationList: [],
  });

  const [originalServicesObj, setOriginalServicesObj] = useState({});
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [isCheck, setIsCheck] = useState(false);
  const [openDeleteDriverModel, setOpenDeleteDriverModel] =
    React.useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [title, setTitle] = useState("");
  const [pricingDriverCount, setPricingDriverCount] = useState(1);
  const [globalConstantList, setGlobalConstantList] = useState([]);
  const [saveLocationState, setSaveLocationState] = useState(location.state);
  const navigate = useNavigate();
  const [EditPricingFormulaValue, setEditPricingFormulaValue] = useState(null);
  const [pricingFormulaError, setPricingFormulaError] = useState("");
  const [pendingInflationDelete, setPendingInflationDelete] = useState(null);
  const [isDropdownEnabled, setIsDropdownEnabled] = useState(false);
  // Get Service Category Type Lookup List Data
  const professionTypeInputValue = professionTypeLookupList.filter(
    (item) => common.professionTypeLists[0] === item.professionTypeId,
  );
  //Get Service Category List data
  const GetServiceCategoryListData = async (id, professionTypeList) => {
    let response;
    if (id) {
      const ids = id.map((item) => item.professionTypeId);
      if (!ids) {
        return;
      }
      response = await ServiceCategoryList(common.organisationKeyID, ids);
      const serviceCategoryListData = response?.data?.responseData?.data;
      setServiceCategoryList(serviceCategoryListData);
    } else if (common.professionTypeLists.length === 1) {
      response = await ServiceCategoryList(
        common.organisationKeyID,
        common.professionTypeLists,
      );
      const serviceCategoryListData = response?.data?.responseData?.data;
      setServiceCategoryList(serviceCategoryListData);
    } else if (saveLocationState.ProfessionTypeId !== null) {
      response = await ServiceCategoryList(
        common.organisationKeyID,
        saveLocationState.ProfessionTypeId,
      );
      const serviceCategoryListData = response?.data?.responseData?.data;
      setServiceCategoryList(serviceCategoryListData);
    }
  };

  // B] Initial useEffect :
  // 1) Will Call Initial Api Like List Api
  useEffect(() => {
    GetProfessionTypeLookupListData();
    GetDriverTypeData();
    GetProfessionTypeData();
    GetServiceChargeTypeLookupList();
    GetPricingTypeLookupList();
    getSlabTypeData();
    GetBusinessTypeLookupListData();
    GetNOBTypeLookUpListData();
  }, [isAddUpdateActionDone, common.organisationKeyID]);

  useEffect(() => {
    setModelAction(saveLocationState?.Action === null ? "Add" : "Update"); //Do not change this naming convention
    if (
      saveLocationState?.Action !== undefined &&
      saveLocationState?.Action !== null
    ) {
      setModelRequestData({
        ...modelRequestData,
        Type: location.state.Type,
      });
      GetServiceModelData(
        saveLocationState.serviceKeyID,
        saveLocationState.Type,
      );
    } else {
      // SetInitialModelData();
    }
    if (saveLocationState.ProfessionTypeId !== null) {
    }
    GetServiceCategoryListData();
  }, [saveLocationState]);

  useEffect(() => {
    const {
      serviceChargeTypeID,
      professionTypeList,
      clientBusinessTypeID,
      businessNatureID,
    } = servicesObj;

    // Only call if all required fields have valid values
    const canCallDependencyAPI =
      serviceChargeTypeID &&
      clientBusinessTypeID.length > 0 &&
      businessNatureID.length > 0;
    const professionTypeParameter =
      Array.isArray(professionTypeList) && professionTypeList.length > 0
        ? servicesObj.professionTypeList.map((pt) => ({
            professionTypeId: pt.professionTypeId,
            professionTypeName: pt.professionTypeName,
          }))
        : common.professionTypeLists.length > 0
          ? professionTypeLookupList
              .filter((x) =>
                common.professionTypeLists.includes(x.professionTypeId),
              )
              .map((x) => ({
                professionTypeId: x.professionTypeId,
                professionTypeName: x.professionTypeName,
              }))
          : [];

    if (canCallDependencyAPI && common.organisationKeyID) {
      const params = {
        OrganisationKeyID: common.organisationKeyID,
        UserKeyID: common.userKeyID,
        ServiceKeyID: servicesObj.serviceKeyID ?? null,
        ServiceName: servicesObj.serviceName ?? "",
        ServiceChargeTypeID: servicesObj.serviceChargeTypeID ?? null,
        professionTypeList: professionTypeParameter,
        // serviceCategoryList: (servicesObj.serviceCategoryList || []).map((sc) => ({
        //   serviceCatKeyID: sc.serviceCatKeyID,
        //   serviceCatName: sc.serviceCatName,
        // })),
        BusinessTypeID: servicesObj.clientBusinessTypeID ?? [],
        BusinessNatureID: servicesObj.businessNatureID ?? [],
      };
      console.log(params);
      GetServiceDependencyListData(params);
    } else {
      setServiceDependencyList([]);
    }
  }, [
    servicesObj.serviceChargeTypeID,
    servicesObj.professionTypeList,
    servicesObj.clientBusinessTypeID,
    servicesObj.businessNatureID,
    servicesObj.serviceKeyID,
  ]);

  useEffect(() => {
    if (ServiceDependencyList.length === 0) {
      setServicesObj((prev) => ({
        ...prev,
        prerequisiteServicesID: [],
      }));
      setIsDropdownEnabled(false);
      OnServiceDependencyChange([]);
    }
  }, [ServiceDependencyList]);

  useEffect(() => {
    if (
      servicesObj?.prerequisiteServicesID?.length > 0 &&
      ServiceDependencyList.length > 0
    ) {
      setIsDropdownEnabled(true);
    }
  }, [servicesObj?.prerequisiteServicesID, ServiceDependencyList]);

  //2) This useEffect will trigger when Global Pricing Driver state Changed
  useEffect(() => {
    if (globalPricingDrivers) {
      console.log(pricingDriver);
      setServicesObj({
        ...servicesObj,
        pricingDriverList: pricingDriver,
      });
    }
    if (pricingDriver.length !== 0) {
      if (
        pricingDriver[0].driverName === "" &&
        pricingDriver[0].driverTypeID === ""
      ) {
        setServicesObj({
          ...servicesObj,
          pricingDriverList: null,
        });
      } else {
        setServicesObj({
          ...servicesObj,
          pricingDriverList: pricingDriver,
        });
      }
    }
    // setModelAction(location.state == null ? "Add" : "Update");
  }, [globalPricingDrivers, pricingDriver]);

  //3) This useEffect will trigger when topbar is none
  useEffect(() => {
    GetGlobalConstantListData();
    setTopbar("none");
  }, []);

  useEffect(() => {
    if (common.professionTypeLists.length === 1) {
      GetServiceCategoryListData(
        null,
        professionTypeInputValue[0]?.professionTypeId,
      );
      setIsAddUpdateActionDone(false);
    } else {
      GetServiceCategoryListData(servicesObj.professionTypeList, null);
      setIsAddUpdateActionDone(false);
    }
  }, [isAddUpdateActionDone, common.professionTypeLists]);

  // C] Calling All Api's like List and other Here :
  // 1) Add Service Category Data
  const ServiceCategoryAddBtnClicked = () => {
    {
      setModelRequestData({
        ...modelRequestData,
        serviceCatKeyID: null,
        Action: null,
      });
    }
  };
  // Get Global Constant List Data
  const GetGlobalConstantListData = async () => {
    try {
      const data = await GetGlobalConstantList({
        pageSize: 30,
        pageNo: 0,
        organisationKeyID: common.organisationKeyID,
        SearchKeyword: "",
      });

      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const GlobalConstantListData = data.data.responseData.data;
          setGlobalConstantList(GlobalConstantListData);
        }
      } else {
        setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  };
  // Get GLobal pricing Driver List

  const formatQuantityValue = (value, decimalPlaces) => {
    if (!value || value === "") return value;

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;

    if (decimalPlaces === 0) {
      return Math.floor(numValue).toString();
    } else {
      return numValue.toFixed(decimalPlaces);
    }
  };

  //Get Service Model
  const GetServiceModelData = async (id, GetSAChanges) => {
    if (!id) {
      return;
    }
    setLoader(true);
    try {
      const data = await GetServiceModel(id, GetSAChanges);
      if (data) {
        setLoader(false);
        if (data?.data?.statusCode === 200) {
          if (data?.data?.responseData?.data) {
            const ModelData = data?.data?.responseData?.data;
            setActiveTabForm({
              activeBasicInformationForm: true,
              activeDescriptionForm: true,
              activePricingDrivers: true,
              activePricingFormula: true,
            });
            GetServiceCategoryListData(ModelData.professionTypeList);
            setEditPricingFormulaValue(ModelData.pricingFormula);
            const updatedData = ModelData.pricingDriverList.map((item) => {
              const updatedItem = { ...item };

              // Set variation to an empty array if it's null
              if (updatedItem.variation === null) {
                updatedItem.variation = [];
              }

              // Set slab to an empty array if it's null
              if (updatedItem.slab === null) {
                updatedItem.slab = [];
              }
              return updatedItem;
            });
            const DependencyParams = {
              OrganisationKeyID: common.organisationKeyID,
              UserKeyID: common.userKeyID,
              serviceKeyID: ModelData.serviceKeyID,
              ServiceName: ModelData.serviceName,
              serviceChargeTypeID: ModelData.serviceChargeTypeID,
              professionTypeList: ModelData.professionTypeList,
              // serviceCategoryList: ModelData.serviceCategoryList,
              businessNatureID: ModelData.businessNatureID,
              businessTypeID: ModelData.businessTypeID,
            };
            // setServicesObj({
            //   userKeyID: common.userKeyID,
            //   organisationKeyID: common.organisationKeyID,
            //   businessNatureID:
            //     ModelData.businessNatureID === null
            //       ? []
            //       : ModelData.businessNatureID,
            //   clientBusinessTypeID:
            //     ModelData.businessTypeID === null
            //       ? []
            //       : ModelData.businessTypeID,
            //   serviceKeyID: ModelData.serviceKeyID,
            //   serviceName: ModelData.serviceName,
            //   serviceChargeTypeID: ModelData.serviceChargeTypeID,
            //   pricingTypeID: ModelData.pricingTypeID,
            //   price: ModelData.price,
            //   description: ModelData.description,
            //   pricingFormula: ModelData.pricingFormula,
            //   isPredefined: true,
            //   professionTypeList: ModelData.professionTypeList,
            //   serviceCategoryList: ModelData.serviceCategoryList,
            //   pricingDriverList: updatedData,
            //   pricingFormulaGlobalPricingDriverList:
            //     ModelData.pricingFormulaGlobalPricingDriverList,
            // });
            const newServiceObj = {
              userKeyID: common.userKeyID,
              organisationKeyID: common.organisationKeyID,
              businessNatureID: ModelData.businessNatureID ?? [],
              clientBusinessTypeID: ModelData.businessTypeID ?? [],
              serviceKeyID: ModelData.serviceKeyID,
              serviceName: ModelData.serviceName,
              serviceChargeTypeID: ModelData.serviceChargeTypeID,
              prerequisiteServicesID: ModelData.prerequisiteServicesID,
              dependingServicesID: ModelData.dependingServicesID,
              pricingTypeID: ModelData.pricingTypeID,
              price: ModelData.price,
              description: ModelData.description,
              pricingFormula: ModelData.pricingFormula,
              floorValue: ModelData.floorValue,
              isPredefined: true,
              professionTypeList: ModelData.professionTypeList,
              serviceCategoryList: ModelData.serviceCategoryList,
              pricingDriverList: updatedData,
              pricingFormulaGlobalPricingDriverList:
                ModelData.pricingFormulaGlobalPricingDriverList,
              serviceFeeInflationList: ModelData.serviceFeeInflationList,
            };

            setServicesObj(newServiceObj);
            setOriginalServicesObj(JSON.parse(JSON.stringify(newServiceObj)));

            const ModalDataPricingDriverList = updatedData.map((i) => ({
              globalPricingDriverID: i.globalPricingDriverID,
              parentGlobalPricingDriverKeyID: i.parentGlobalPricingDriverKeyID,
              driverValue: i.driverValue,
              textValue: i.textValue,
              driverTypeID: i.driverTypeID,
              temp_GlobalPricingDriverID_ForDependancy:
                i.temp_GlobalPricingDriverID_ForDependancy,
              dependsOn_DriverID: i.dependsOn_DriverID,
              dependsOn_GlobalPricingDriverKeyID:
                i.dependsOn_GlobalPricingDriverKeyID,
              dependsOn_VariationID: i.dependsOn_VariationID,
              dependsOn_VariationKeyID: i.dependsOn_VariationKeyID,
              dependant_GlobalPricingDriverKeyID:
                i.dependant_GlobalPricingDriverKeyID,
              variation: i.variation,
              slab: i.slab,
              text: i.text,
              date: i.date,
              quantity:
                Array.isArray(i.quantity) && i.quantity.length === 0
                  ? [
                      {
                        quantityDecimalPlaces: 0,
                        quantityFrom: "",
                        quantityTo: "",
                      },
                    ]
                  : i.quantity,
              globalPricingDriverKeyID: i.globalPricingDriverKeyID,
              driverName: i.driverName,
              isPredefined: i.isPredefined,
              addedFor: i.addedFor,
              professionTypeList: i.professionTypeList,
              organisationKeyID: i.organisationKeyID,
              status: i.status,
              statusName: i.statusName,
              userKeyID: common.userKeyID,
              createdBy: i.createdBy,
              createdOn: i.createdOn,
              lastUpdatedBy: i.lastUpdatedBy,
              lastUpdatedOn: i.lastUpdatedOn,
              keyID: i.keyID,
              createdByID: i.createdByID,
              organisationID: i.organisationID,
              dependServer:
                i.dependsOn_GlobalPricingDriverKeyID !== null ? true : false,
            }));
            const pricingDriverList = ModalDataPricingDriverList.map(
              (driver) => ({
                ...driver,
                slab: driver.slab.map((slabItem) => ({
                  ...slabItem,
                  slabValue: slabItem.slabValue,
                })),
                variation: driver.variation?.map((varItem) => ({
                  ...varItem,
                  variationValue: varItem.variationValue,
                })),
                text: driver.text?.map((txt) => ({
                  ...txt,
                  textValue: txt.textValue,
                })),
                date: driver.date?.map((dt) => ({
                  ...dt,
                  dateValue: dt.dateValue,
                })),
              }),
            );
            {
              common.organisationKeyID &&
                GetServiceDependencyListData(DependencyParams);
            }
            setPricingDriver(pricingDriverList);
          }
        } else {
          setErrorMessage(data?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getChangedDependencies = () => {
    if (
      !originalServicesObj ||
      Object.keys(originalServicesObj).length === 0 ||
      !servicesObj ||
      Object.keys(servicesObj).length === 0
    ) {
      return { hasChanges: false, changedNames: [] };
    }
    const safeArray = (arr) => (Array.isArray(arr) ? arr : []);

    const arraysEqual = (a, b) =>
      JSON.stringify([...safeArray(a)].sort()) ===
      JSON.stringify([...safeArray(b)].sort());

    let hasChanges = false;
    const changed = [];

    if (
      servicesObj.serviceChargeTypeID !==
      originalServicesObj.serviceChargeTypeID
    ) {
      changed.push("Service Charge Type");
      hasChanges = true;
    }

    if (
      !arraysEqual(
        servicesObj.serviceCategoryList?.map((x) => x.serviceCatKeyID),
        originalServicesObj.serviceCategoryList?.map((x) => x.serviceCatKeyID),
      )
    ) {
      changed.push("Service Category");
      hasChanges = true;
    }

    if (
      !arraysEqual(
        servicesObj.clientBusinessTypeID,
        originalServicesObj.clientBusinessTypeID,
      )
    ) {
      changed.push("Prospect Type");
      hasChanges = true;
    }

    if (
      !arraysEqual(
        servicesObj.businessNatureID,
        originalServicesObj.businessNatureID,
      )
    ) {
      changed.push("Nature of Business");
      hasChanges = true;
    }

    // Clean handling of dependent services
    const dependentServiceNames = Array.isArray(
      originalServicesObj.dependingServicesID,
    )
      ? originalServicesObj.dependingServicesID.map((x) => x.serviceName)
      : [];

    const preRequisiteServiceNames = Array.isArray(
      originalServicesObj.prerequisiteServicesID,
    )
      ? originalServicesObj.prerequisiteServicesID.map((x) => x.serviceName)
      : [];

    return {
      hasChanges,
      dependingServices: dependentServiceNames,
      prerequisiteServices: preRequisiteServiceNames,
    };
  };

  // 2) Global Pricing Driver Edit Data
  const GlobalPricingDriverEditBtnClicked = (GlobalPricingDriver, index) => {
    dispatch(
      updateState({
        globalPricingDriver: GlobalPricingDriver,
      }),
    );
    {
      setModelRequestData({
        ...modelRequestData,
        Action: "Update",
        index: index,
        globalPricingDriver: GlobalPricingDriver,
      });
    }
  };

  // 3) Global Pricing Driver Add And Update Data
  const GlobalPricingDriverAddUpdateBtnClicked = (NextTab, SAChanges) => {
    if (SAChanges === "Accept") {
      $("#" + "ConfirmSAChangesModel").modal("show");
      setStatus(true);
      return;
    }
    setErrorMessage("");
    // If currently on Fee Inflation tab just navigate to NextTab (no extra validation)
    if (activeTab === ServiceHeader.FeeInflation) {
      setActiveTab(NextTab);
      return;
    }
    const pricingDriverCopy = pricingDriver;
    const pricingDriverList = servicesObj.pricingDriverList?.map((driver) => ({
      ...driver,
      dependant_GlobalPricingDriverKeyID: undefined,
      slab: driver.slab.map((slabItem) => ({
        ...slabItem,
        slabValue:
          typeof slabItem.slabValue === "string"
            ? slabItem.slabValue
            : slabItem.slabValue,
      })),
      variation: driver.variation.map((VarItem) => ({
        ...VarItem,
        variationValue:
          typeof VarItem.variationValue === "string"
            ? VarItem.variationValue
            : VarItem.variationValue,
      })),
      text:
        driver.text && driver.text.length > 0
          ? driver.text.map((textItem) => ({
              ...textItem,
              // Ensure both are converted to decimal/float
              textValue: parseFloat(textItem.textValue),
              textLength: parseFloat(textItem.textLength || 0),
            }))
          : [],
    }));
    console.log(servicesObj.pricingDriverList);

    const ApiRequest_ParamsObj = {
      organisationKeyID: common.organisationKeyID,
      userKeyID: common.userKeyID,
      serviceKeyID: servicesObj.serviceKeyID,
      businessTypeID: servicesObj.clientBusinessTypeID,
      businessNatureID: servicesObj.businessNatureID,
      serviceName: servicesObj.serviceName,
      serviceChargeTypeID: servicesObj.serviceChargeTypeID,
      prerequisiteServicesID: ServiceDependencyValue.map((item) => ({
        serviceID: item.value,
        serviceCatID: item.serviceCatID,
      })),
      pricingTypeID: servicesObj.pricingTypeID,
      price: servicesObj.price,
      description: servicesObj.description,
      pricingFormula: EditPricingFormulaValue,
      floorValue: servicesObj.floorValue,
      isPredefined: true,
      isServiceDependentandModified:
        common.organisationKeyID !== null
          ? isServiceDependentandModified
          : null,
      acceptSAChanges: SAChanges === true ? SAChanges : undefined,
      professionTypeList:
        common.professionTypeLists?.length > 1 ||
        common.organisationKeyID === null
          ? servicesObj.professionTypeList
          : [
              {
                professionTypeId: professionTypeInputValue[0]?.professionTypeId,
                professionTypeName:
                  professionTypeInputValue[0]?.professionTypeName,
              },
            ],
      serviceCategoryList:
        servicesObj.serviceCategoryList.length === 0
          ? null
          : servicesObj.serviceCategoryList,
      pricingDriverList: pricingDriverList,
      pricingFormulaGlobalPricingDriverList:
        servicesObj.pricingFormulaGlobalPricingDriverList.length === 0
          ? null
          : servicesObj.pricingFormulaGlobalPricingDriverList,
    };

    //Check Validations if any
    //Return false if validation fails

    if (activeTab === ServiceHeader.BasicInformation) {
      if (
        (common.professionTypeLists?.length > 1 ||
          common.organisationKeyID === null) &&
        servicesObj.professionTypeList?.length === 0
      ) {
        setActiveTabForm({
          ...activeTabForm,
          activeBasicInformationForm: false,
          activeDescriptionForm: false,
          activePricingDrivers: false,
        });
        scrollUpDownByElementID(`Profession_Div`);
        setserviceError({
          ...serviceError,
          basicInformationError: true,
          priceError: true,
        });
        return false;
      } else if (
        servicesObj.serviceName === undefined ||
        servicesObj.serviceName === "" ||
        servicesObj.serviceName === null ||
        servicesObj.clientBusinessTypeID.length === 0 ||
        servicesObj.businessNatureID.length === 0 ||
        servicesObj.serviceCategoryList.length === 0 ||
        servicesObj.serviceCategoryList === null ||
        servicesObj.serviceChargeTypeID === "" ||
        servicesObj.serviceChargeTypeID === null ||
        servicesObj.pricingTypeID === "" ||
        servicesObj.pricingTypeID === null ||
        (servicesObj.pricingTypeID === 1 && // Check if pricingTypeID is 1
          (servicesObj.price === "" || // Check if price is empty
            servicesObj.price === undefined || // Check if price is undefined
            servicesObj.price === null)) // Check if price is null
      ) {
        setserviceError({
          ...serviceError,
          basicInformationError: true,
          priceError: true,
        });
        if (
          servicesObj.serviceName === undefined ||
          servicesObj.serviceName === "" ||
          servicesObj.serviceName === null
        ) {
          scrollUpDownByElementID(`Service_Div`);
        } else if (servicesObj.clientBusinessTypeID.length === 0) {
          scrollUpDownByElementID(`Prospect_Div`);
        } else if (servicesObj.businessNatureID.length === 0) {
          scrollUpDownByElementID(`NOB_Div`);
        } else if (servicesObj.serviceCategoryList.length === 0) {
          scrollUpDownByElementID(`ServiceCat_Div`);
        } else if (
          servicesObj.serviceChargeTypeID === "" ||
          servicesObj.serviceChargeTypeID === null
        ) {
          scrollUpDownByElementID(`ServiceCharge_Div`);
        } else if (
          servicesObj.pricingTypeID === "" ||
          servicesObj.pricingTypeID === null
        ) {
          scrollUpDownByElementID(`PricingType_Div`);
        } else if (
          servicesObj.pricingTypeID === 1 && // Check if pricingTypeID is 1
          (servicesObj.price === "" || // Check if price is empty
            servicesObj.price === undefined || // Check if price is undefined
            servicesObj.price === null)
        ) {
          scrollUpDownByElementID(`Price_Div`);
        } else if (
          servicesObj.prerequisiteServicesID.length === 0 ||
          servicesObj.prerequisiteServicesID === null
        ) {
          scrollUpDownByElementID(`ServiceDependency_Div`);
        }
        setActiveTabForm({
          ...activeTabForm,
          activeBasicInformationForm: false,
          activeDescriptionForm: false,
          activePricingDrivers: false,
        });
        return false;
      } else if (servicesObj.pricingTypeID === 1) {
        if (
          servicesObj.price === "" ||
          servicesObj.price === undefined ||
          servicesObj.price === null
        ) {
          setserviceError({ priceError: true });
          setActiveTabForm({
            ...activeTabForm,
            activeBasicInformationForm: false,
            activeDescriptionForm: false,
            activePricingDrivers: false,
          });
          return false;
        } else {
          setserviceError({
            ...serviceError,
            basicInformationError: false,
            priceError: false,
          });
          setActiveTabForm({
            ...activeTabForm,
            activeBasicInformationForm: true,
          });
          setActiveTab(NextTab);
        }
      } else {
        setActiveTabForm({
          ...activeTabForm,
          activeBasicInformationForm: true,
        });
        setserviceError({
          ...serviceError,
          basicInformationError: false,
          priceError: false,
        });
        setActiveTab(NextTab);
      }
    } else if (activeTab === ServiceHeader.Description) {
      if (NextTab == ServiceHeader.BasicInformation) {
        setActiveTabForm({
          ...activeTabForm,
          activeBasicInformationForm: true,
          activeDescriptionForm: true,
          activePricingDrivers: false,
        });
        setActiveTab(NextTab);
      } else if (NextTab === "create service") {
        let dependingMessage = "";
        let prerequisiteMessage = "";
        let dependingList = [];
        let prerequisiteList = [];
        let hasAnyChanges = false;
        if (common.organisationKeyID) {
          const { hasChanges, dependingServices, prerequisiteServices } =
            getChangedDependencies();
          var combinedMessage = ``;
          var combinedDriverNameList = [];

          if (hasChanges && dependingServices.length > 0) {
            setIsServiceDependentandModified(true);
            dependingMessage = `The following services depend on this service. Updating it will remove all dependencies:`;
            dependingList = [...dependingServices];
            hasAnyChanges = true;
          }

          // if (hasChanges && prerequisiteServices.length > 0) {
          //   setIsServiceDependentandModified(true);
          //   prerequisiteMessage = `This service depends on other services. Updating it will remove all dependencies:`;
          //   prerequisiteList = [...prerequisiteServices];
          //   hasAnyChanges = true;
          // }

          if (hasAnyChanges) {
            setModelRequestData({
              ...modelRequestData,
              Action: "Warning",
              message: "", // no pricing driver message here, so keep empty or remove
              DriverName: [], // same here, or handle if needed
              dependingMessage,
              dependingList,
              prerequisiteMessage,
              prerequisiteList,
            });
            $("#ConfirmModel").modal("show");
          } else {
            AddUpdateServiceData(ApiRequest_ParamsObj);
          }
        } else AddUpdateServiceData(ApiRequest_ParamsObj);
      } else if (NextTab == "ConfirmedToSave") {
        AddUpdateServiceData(ApiRequest_ParamsObj);
      } else {
        setActiveTabForm({
          ...activeTabForm,
          activeBasicInformationForm: true,
          activeDescriptionForm: true,
          activePricingDrivers: false,
        });
        setActiveTab(NextTab);
      }
    } else if (activeTab === ServiceHeader.PricingDrivers) {
      if (NextTab === ServiceHeader.Description) {
        setActiveTabForm({
          ...activeTabForm,
          activeBasicInformationForm: true,
          activeDescriptionForm: true,
          activePricingDrivers: true,
        });
        setserviceError({
          ...serviceError,
          pricingFormula: false,
        });
        setGdriverError({
          pfError: false,
          variationError: false,
          slabError: false,
          drivernameError: false,
          drivertypeError: false,
          variationnameError: false,
          variationvalueError: false,
          slabtypeError: false,
          slabtypevalueError: false,
          slabtypefromError: false,
          slabTypeToError: false,
          slabToMinValue: false,
          textValueError: false,
          quantityTypeError: false,
        });
        setActiveTab(NextTab);
      }
      setserviceError({
        ...serviceError,
        pricingFormula: false,
      });
      let hasError = false;

      if (pricingDriver.length > 0) {
        for (let index = 0; index < pricingDriver.length; index++) {
          if (pricingDriverCopy[index]?.dependServer === true) {
            if (
              pricingDriverCopy[index]?.dependsOn_DriverID === null &&
              pricingDriverCopy[index]?.dependsOn_GlobalPricingDriverKeyID ===
                null
            ) {
              setGdriverError((prevState) => ({
                ...prevState,
                SelectDriver: true,
              }));
              scrollUpDownByElementID(`Depends_${index}`);
              hasError = true;
            }
            if (
              pricingDriverCopy[index]?.dependsOn_VariationID === null &&
              pricingDriverCopy[index]?.dependsOn_VariationKeyID === null
            ) {
              setGdriverError((prevState) => ({
                ...prevState,
                SelectVariation: true,
              }));
              scrollUpDownByElementID(`SelectVariation${index}`);
              hasError = true;
            }
          }
          if (pricingDriverCopy[index].driverName !== "") {
            const findDuplicateDriverNames = () => {
              const uniqueDriverNames = new Set();
              const duplicateDriverNames = [];

              pricingDriverCopy
                .filter((item) => item.parentGlobalPricingDriverKeyID === null)
                .forEach((item) => {
                  if (uniqueDriverNames.has(item.driverName.toUpperCase())) {
                    duplicateDriverNames.push(item.driverName);
                  } else {
                    uniqueDriverNames.add(item.driverName.toUpperCase());
                  }
                });

              return duplicateDriverNames;
            };
            const duplicates = findDuplicateDriverNames();
            if (duplicates.length > 0) {
              // Construct the error message
              const duplicateNames = duplicates.join(", ");
              setErrorMessage(
                `Local pricing driver with name ${duplicateNames} already exist. Please choose different name.`,
              );
              setActiveTabForm({
                ...activeTabForm,
                activeBasicInformationForm: true,
                activeDescriptionForm: true,
                activePricingDrivers: false,
              });
              hasError = true;
              setOpenErrorModal(true);
              setIsDriverDelete(true);
            }
          }
          if (
            pricingDriverCopy[index].driverName === "" ||
            pricingDriverCopy[index].driverName === undefined
          ) {
            setGdriverError({ drivernameError: true });
            scrollUpDownByElementID(`DriverName_${index}`);
            hasError = true;
            setActiveTabForm({
              ...activeTabForm,
              activeBasicInformationForm: true,
              activeDescriptionForm: true,
              activePricingDrivers: false,
            });
            return false;
          } else if (
            pricingDriverCopy[index].driverTypeID === "" ||
            pricingDriverCopy[index].driverTypeID === undefined
          ) {
            setGdriverError({ drivernameError: true });
            scrollUpDownByElementID(`DriverName_${index}`);
            hasError = true;
            setActiveTabForm({
              ...activeTabForm,
              activeBasicInformationForm: true,
              activeDescriptionForm: true,
              activePricingDrivers: false,
            });
            return false;
          } else if (pricingDriverCopy[index].driverTypeID === 2) {
            const hasQuantity = pricingDriverCopy[index].quantity?.length !== 0;
            const quantityDecimalMissing =
              pricingDriverCopy[index].quantity?.[0]?.quantityDecimalPlaces ==
              null;

            if (hasQuantity && quantityDecimalMissing) {
              setGdriverError({ quantityTypeError: true });
              scrollUpDownByElementID(`Quantity_${index}`);
              setActiveTabForm({
                ...activeTabForm,
                activeBasicInformationForm: true,
                activeDescriptionForm: true,
                activePricingDrivers: false,
              });

              hasError = true;
            }

            // (Optional) Keep this check if needed for future logic
            else if (
              Array.isArray(pricingDriverCopy[index].quantity) &&
              pricingDriverCopy[index].quantity.length === 0
            ) {
              pricingDriverCopy[index].quantity = [
                {
                  quantityDecimalPlaces: 0,
                  quantityFrom: "",
                  quantityTo: "",
                },
              ];
            }
          } else if (pricingDriverCopy[index].driverTypeID === 3) {
            if (pricingDriverCopy[index].variation.length === 0) {
              setGdriverError({ variationError: true });
              scrollUpDownByElementID(`Variation_${index}`);
              setActiveTabForm({
                ...activeTabForm,
                activeBasicInformationForm: true,
                activeDescriptionForm: true,
                activePricingDrivers: false,
              });

              hasError = true;
            } else if (
              pricingDriverCopy[index].variation !== undefined ||
              pricingDriverCopy[index].variation !== null
            ) {
              for (
                let VarIndex = 0;
                VarIndex < pricingDriverCopy[index].variation.length;
                VarIndex++
              ) {
                if (
                  pricingDriverCopy[index].variation[VarIndex].variationName ===
                    "" &&
                  pricingDriverCopy[index].variation[VarIndex]
                    .variationValue === ""
                ) {
                  setGdriverError({
                    ...gdrivererror,
                    variationvalueError: true,
                    variationnameError: true,
                  });
                  scrollUpDownByElementID(`VariationDiv_${index}${VarIndex}`);
                  setActiveTabForm({
                    ...activeTabForm,
                    activeBasicInformationForm: true,
                    activeDescriptionForm: true,
                    activePricingDrivers: false,
                  });
                  hasError = true;
                  break;
                } else if (
                  pricingDriverCopy[index].variation[VarIndex].variationName ===
                  ""
                ) {
                  setGdriverError({
                    ...gdrivererror,
                    variationnameError: true,
                  });

                  scrollUpDownByElementID(`VariationDiv_${index}${VarIndex}`);
                  setActiveTabForm({
                    ...activeTabForm,
                    activeBasicInformationForm: true,
                    activeDescriptionForm: true,
                    activePricingDrivers: false,
                  });
                  hasError = true;
                  break;
                } else if (
                  pricingDriverCopy[index].variation[VarIndex]
                    .variationValue === ""
                ) {
                  setGdriverError({
                    ...gdrivererror,
                    variationvalueError: true,
                  });
                  scrollUpDownByElementID(`VariationDiv_${index}${VarIndex}`);
                  setActiveTabForm({
                    ...activeTabForm,
                    activeBasicInformationForm: true,
                    activeDescriptionForm: true,
                    activePricingDrivers: false,
                  });
                  hasError = true;
                  break;
                } else if (
                  pricingDriverCopy[index].variation[VarIndex]
                    ?.variationName !== ""
                ) {
                  const duplicateVariationFound = pricingDriverCopy[
                    index
                  ].variation.filter((item, innerIndex) => {
                    // Check if there is any item with the same variationName before the current inner index
                    return pricingDriverCopy[index].variation
                      .slice(0, innerIndex)
                      .some(
                        (prevItem) =>
                          prevItem.variationName.toUpperCase() ===
                          item.variationName.toUpperCase(),
                      );
                  });
                  if (duplicateVariationFound.length > 0) {
                    // Remove duplicates from the array
                    const uniqueVariations = Array.from(
                      new Set(
                        duplicateVariationFound.map(
                          (item) => item.variationName,
                        ),
                      ),
                    );
                    // Construct the error message
                    const duplicateNames = uniqueVariations.join(", ");
                    setErrorMessage(
                      `Variation with name ${duplicateNames} already exist. Please choose different name.`,
                    );
                    setActiveTabForm({
                      ...activeTabForm,
                      activeBasicInformationForm: true,
                      activeDescriptionForm: true,
                      activePricingDrivers: false,
                    });
                    hasError = true;
                    setOpenErrorModal(true);
                    setIsDriverDelete(true);
                  }
                }
              }
            }
          } else if (pricingDriverCopy[index].driverTypeID === 4) {
            if (pricingDriverCopy[index].slab.length === 0) {
              setGdriverError({ slabError: true });
              setActiveTabForm({
                ...activeTabForm,
                activeBasicInformationForm: true,
                activeDescriptionForm: true,
                activePricingDrivers: false,
              });
              scrollUpDownByElementID(`Slab_${index}`);
              hasError = true;
            } else if (pricingDriverCopy[index].slab.length !== 0) {
              for (
                let slabIndex = 0;
                slabIndex < pricingDriverCopy[index].slab.length;
                slabIndex++
              ) {
                if (
                  pricingDriverCopy[index].slab[slabIndex]?.slabTypeID === ""
                ) {
                  setGdriverError({
                    ...gdrivererror,
                    slabTypeID: true,
                  });
                  scrollUpDownByElementID(`SlabDiv_${index}${slabIndex}`);
                  setActiveTabForm({
                    ...activeTabForm,
                    activeBasicInformationForm: true,
                    activeDescriptionForm: true,
                    activePricingDrivers: false,
                  });
                  hasError = true;
                } else if (
                  pricingDriverCopy[index].slab[slabIndex]?.slabTypeID === "" &&
                  pricingDriverCopy[index].slab[slabIndex]?.slabValue === "" &&
                  pricingDriverCopy[index].slab[slabIndex]?.slabTo === "" &&
                  pricingDriverCopy[index].slab[slabIndex]?.decimalPlaces ===
                    null
                ) {
                  setGdriverError({
                    ...gdrivererror,
                    slabtypevalueError: true,
                    slabtypeError: true,
                    slabDecimalError: true,
                  });
                  scrollUpDownByElementID(`SlabDiv_${index}${slabIndex}`);
                  setActiveTabForm({
                    ...activeTabForm,
                    activeBasicInformationForm: true,
                    activeDescriptionForm: true,
                    activePricingDrivers: false,
                  });
                  hasError = true;
                } else if (
                  pricingDriverCopy[index].slab[slabIndex]?.slabValue === "" ||
                  pricingDriverCopy[index].slab[slabIndex]?.slabFrom === "" ||
                  pricingDriverCopy[index].slab[slabIndex]?.slabTo === ""
                ) {
                  setGdriverError({ slabtypevalueError: true });
                  scrollUpDownByElementID(`SlabDiv_${index}${slabIndex}`);
                  setActiveTabForm({
                    ...activeTabForm,
                    activeBasicInformationForm: true,
                    activeDescriptionForm: true,
                    activePricingDrivers: false,
                  });
                  hasError = true;
                } else if (
                  pricingDriverCopy[index].slab[slabIndex]?.slabTypeID === 1 &&
                  parseFloat(pricingDriverCopy[index].slab[slabIndex].slabTo) <
                    parseFloat(
                      pricingDriverCopy[index].slab[slabIndex].slabFrom,
                    )
                ) {
                  scrollUpDownByElementID(`SlabDiv_${index}${slabIndex}`);
                  setActiveTabForm({
                    ...activeTabForm,
                    activeBasicInformationForm: true,
                    activeDescriptionForm: true,
                    activePricingDrivers: false,
                  });
                  setGdriverError({ slabToMinValue: true });
                  hasError = true;
                } else if (pricingDriverCopy[index].driverTypeID === 5) {
                  // Text Driver Validation
                  if (pricingDriverCopy[index].text.length === 0) {
                    setGdriverError({ textError: true, textLengthError: true });
                    scrollUpDownByElementID(`Text_${index}`);
                    hasError = true;
                    setActiveTabForm({
                      ...activeTabForm,
                      activeBasicInformationForm: true,
                      activeDescriptionForm: true,
                      activePricingDrivers: false,
                    });
                    return false;
                  } else {
                    for (
                      let textIndex = 0;
                      textIndex < pricingDriverCopy[index].text.length;
                      textIndex++
                    ) {
                      const textItem = pricingDriverCopy[index].text[textIndex];
                      // if (
                      //   textItem.textValue === "" ||
                      //   textItem.textValue === null ||
                      //   textItem.textValue === undefined
                      // ) {
                      //   setGdriverError({ textValueError: true });
                      //   scrollUpDownByElementID(`TextDiv_${index}${textIndex}`);
                      //   hasError = true;
                      // }
                      if (
                        textItem.textLength === "" ||
                        textItem.textLength === null ||
                        textItem.textLength === undefined
                      ) {
                        console.log(textItem);
                        setGdriverError({ textLengthError: true });
                        scrollUpDownByElementID(`TextDiv_${index}${textIndex}`);
                        hasError = true;
                      }
                      // Check for duplicate text values
                      // const duplicateText = pricingDriverCopy[index].text
                      //   .slice(0, textIndex)
                      //   .some(prevItem => prevItem.textValue === textItem.textValue);
                      // if (duplicateText) {
                      //   setErrorMessage(`Duplicate text value: ${textItem.textValue}`);
                      //   setOpenErrorModal(true);
                      //   hasError = true;
                      //   break;
                      // }
                    }
                  }
                } else if (pricingDriverCopy[index].driverTypeID === 6) {
                  const dateGroups = pricingDriverCopy[index].date;
                  console.log(dateGroups);
                  if (
                    dateGroups == [] ||
                    dateGroups === null ||
                    dateGroups === undefined
                  ) {
                    setGdriverError((prev) => ({
                      ...prev,
                      dateError: true,
                    }));
                    hasError = true;
                    return;
                  }

                  const newErrors = { dateValueError: {}, toDateError: {} };

                  for (
                    let groupIndex = 0;
                    groupIndex < dateGroups.length;
                    groupIndex++
                  ) {
                    const group = dateGroups[groupIndex];
                    const blocks = group.blocks || [];

                    for (
                      let blockIndex = 0;
                      blockIndex < blocks.length;
                      blockIndex++
                    ) {
                      const block = blocks[blockIndex];

                      const fromDate = block.fromDate
                        ? parseStoredDate(block.fromDate, group.dateFormat)
                        : null;
                      const toDate = block.toDate
                        ? parseStoredDate(block.toDate, group.dateFormat)
                        : null;

                      // To Date earlier than From Date
                      if (toDate && fromDate && toDate < fromDate) {
                        if (!newErrors.toDateError[index])
                          newErrors.toDateError[index] = {};
                        newErrors.toDateError[index][blockIndex] = true;
                        scrollUpDownByElementID(
                          `DateDiv_${index}${blockIndex}`,
                        );
                        hasError = true;
                      }
                      // Both dates missing
                      if (!block.fromDate && !block.toDate) {
                        if (!newErrors.dateValueError[index])
                          newErrors.dateValueError[index] = {};
                        newErrors.dateValueError[index][blockIndex] = true;
                        scrollUpDownByElementID(
                          `DateDiv_${index}${blockIndex}`,
                        );
                        hasError = true;
                      }
                      if (
                        blockIndex > 0 &&
                        blocks[blockIndex - 1].toDate !== null &&
                        !toDate
                      ) {
                        if (!newErrors.toDateError[index])
                          newErrors.toDateError[index] = {};
                        newErrors.toDateError[index][blockIndex] = true;
                        scrollUpDownByElementID(
                          `DateDiv_${index}${blockIndex}`,
                        );
                        hasError = true;
                      }
                    }
                  }

                  setGdriverError((prev) => ({
                    ...prev,
                    ...newErrors,
                  }));
                }
              }
            }
          }
        }
        if (!hasError) {
          setActiveTabForm({
            ...activeTabForm,
            activeBasicInformationForm: true,
            activeDescriptionForm: true,
            activePricingDrivers: true,
          });
          setGdriverError({
            pfError: false,
            variationError: false,
            slabError: false,
            drivernameError: false,
            drivertypeError: false,
            variationnameError: false,
            variationvalueError: false,
            slabtypeError: false,
            slabtypevalueError: false,
            slabtypefromError: false,
            slabTypeToError: false,
            slabToMinValue: false,
            slabDecimalPlaces: false,
            textValueError: false,
          });
          setActiveTab(NextTab);
        }
      }
      if (!hasError) {
        setActiveTabForm({
          ...activeTabForm,
          activeBasicInformationForm: true,
          activeDescriptionForm: true,
          activePricingDrivers: true,
        });
        setGdriverError({
          pfError: false,
          variationError: false,
          slabError: false,
          drivernameError: false,
          drivertypeError: false,
          variationnameError: false,
          variationvalueError: false,
          slabtypeError: false,
          slabtypevalueError: false,
          slabtypefromError: false,
          slabTypeToError: false,
          slabToMinValue: false,
          slabDecimalError: false,
          textValueError: false,
        });
        setActiveTab(NextTab);
      }
    } else if (activeTab === ServiceHeader.PricingFormula) {
      debugger;
      if (NextTab === ServiceHeader.PricingDrivers) {
        setActiveTabForm({
          ...activeTabForm,
          activeBasicInformationForm: true,
          activeDescriptionForm: true,
          activePricingDrivers: true,
        });
        setActiveTab(NextTab);
      } else {
        const updatedPricingDriver = pricingDriver
          .map((driver) => {
            const isVariationEmpty =
              driver.variation &&
              driver.variation[0] &&
              driver.variation[0].variationName === "" &&
              driver.variation[0]?.variationValue === "";

            const isSlabEmpty =
              driver.slab &&
              driver.slab[0] &&
              driver.slab[0].slabValue === "" &&
              driver.slab[0].slabFrom === "" &&
              driver.slab[0].slabTo === "";

            if (isVariationEmpty) {
              driver.variation = null;
            }

            if (isSlabEmpty) {
              driver.slab = null;
            }
            return { ...driver };
          })
          .filter(Boolean); // Filter out the null values
        setPricingDriver(updatedPricingDriver);
      }
      if (
        EditPricingFormulaValue === undefined ||
        EditPricingFormulaValue === null ||
        EditPricingFormulaValue.replace(/\s/g, "").trim() === "" ||
        EditPricingFormulaValue.trim().length === 0
      ) {
        setserviceError({
          ...serviceError,
          pricingFormula: true,
        });
        return false;
      } else if (
        EditPricingFormulaValue !== undefined &&
        EditPricingFormulaValue !== null &&
        EditPricingFormulaValue !== "" &&
        tagifyRef.current &&
        !isValidPricingFormula(EditPricingFormulaValue)
      ) {
        setPricingFormulaError("Please enter a valid Pricing Formula.");
        setserviceError({
          ...serviceError,
          pricingFormula: true,
        });
        return false;
      } else {
        let trimPricingFormula = EditPricingFormulaValue.replace(
          /\s/g,
          "",
        ).trim();
        if (trimPricingFormula.length === 1) {
          let trimValue = parseInt(trimPricingFormula, 10);
          if (!isNaN(trimValue)) {
            // If parsedInt is a valid number, set the parsed value
            setserviceError({
              ...serviceError,
              pricingFormula: false,
            });
          } else {
            setEditPricingFormulaValue(null);
            setserviceError({
              ...serviceError,
              pricingFormula: true,
            });
            return false;
          }
        }
        const checkGlobalDriver = EditPricingFormulaValue?.split(" ");
        let GlobalDriverId = [];
        let localDriverId = [];
        let notMatched = [];
        let remainingDriverNames = [];
        let varElements = checkGlobalDriver.filter(function (element) {
          return element.startsWith("var");
        });

        let newArray = varElements.map(function (element) {
          // Check if the element matches the pattern 'var("number")'
          let match = element.match(/var\("(\d+)"\)/);
          // If there's a match, return the extracted number, otherwise return the element as is
          return match ? match[1] : element;
        });

        newArray = newArray.map(function (element) {
          // Check if the element starts with 'var'
          if (element.startsWith("var")) {
            // If it does, remove the 'var' substring
            return element.substring(3);
          } else {
            // If it doesn't, return the element unchanged
            return element;
          }
        });

        newArray.forEach((key) => {
          const globalDriverMatch = pricingDriver.some(
            (globalDriver) =>
              globalDriver.globalPricingDriverKeyID?.toUpperCase() ===
                key?.toUpperCase() ||
              globalDriver.temp_GlobalPricingDriverID_ForDependancy === key,
          );
          const localDriverMatch = pricingDriver.some(
            (globalDriver) =>
              globalDriver.temp_GlobalPricingDriverID_ForDependancy === key,
          );
          if (globalDriverMatch) {
            GlobalDriverId.push(key);
          } else if (localDriverMatch) {
            localDriverId.push(key);
          } else {
            notMatched.push(key);
          }
        });

        pricingDriver.forEach((driver) => {
          const matched = newArray.some(
            (key) =>
              key.toUpperCase() ==
                driver.globalPricingDriverKeyID?.toUpperCase() ||
              key == driver.temp_GlobalPricingDriverID_ForDependancy ||
              key.toUpperCase() ==
                driver.parentGlobalPricingDriverKeyID?.toUpperCase(),
          );
          if (!matched) {
            remainingDriverNames.push(driver.driverName);
          }
        });
        if (
          remainingDriverNames.length > 0 ||
          servicesObj.dependingServicesID != null ||
          servicesObj.prerequisiteServicesID != null
        ) {
          // setModelRequestData({
          //   ...modelRequestData,
          //   Action: "Warning",
          //   message: `Below Pricing Drivers are not included in the Pricing Formulae : `,
          //   DriverName: remainingDriverNames,
          // });
          let combinedMessage = ``; // Initialize as empty
          let combinedDriverNameList = [];
          let dependingMessage = "";
          let prerequisiteMessage = "";
          let dependingList = [];
          let prerequisiteList = [];
          let hasAnyChanges = false;
          if (remainingDriverNames.length > 0) {
            combinedMessage += `Below Pricing Drivers are not included in the Pricing Formulae : `;
            combinedDriverNameList.push(...remainingDriverNames);
          }

          if (common.organisationKeyID) {
            const { hasChanges, dependingServices, prerequisiteServices } =
              getChangedDependencies();
            console.log(dependingServices);

            if (hasChanges && dependingServices.length > 0) {
              setIsServiceDependentandModified(true);
              dependingMessage = `The following services depend on this service. Updating it will remove all dependencies:`;
              dependingList = [...dependingServices];
              hasAnyChanges = true;
            }

            // if (hasChanges && prerequisiteServices.length > 0) {
            //   setIsServiceDependentandModified(true);
            //   prerequisiteMessage = `This service depends on other services. Updating it will remove all dependencies:`;
            //   prerequisiteList = [...prerequisiteServices];
            //   hasAnyChanges = true;
            // }
          }
          if (hasAnyChanges) {
            setModelRequestData({
              ...modelRequestData,
              Action: "Warning",
              message: combinedMessage,
              DriverName: combinedDriverNameList,
              dependingMessage,
              dependingList,
              prerequisiteMessage,
              prerequisiteList,
            });

            if (NextTab === "ConfirmedToSave") {
              setserviceError({ pricingFormula: false });
              AddUpdateServiceData(ApiRequest_ParamsObj);
            } else {
              $("#" + "ConfirmModel").modal("show");
              setserviceError({ pricingFormula: false });
            }
          } else {
            setserviceError({ pricingFormula: false });
            AddUpdateServiceData(ApiRequest_ParamsObj);
          }
        } else {
          setserviceError({ pricingFormula: false });

          AddUpdateServiceData(ApiRequest_ParamsObj);
        }
      }
    }
  };

  // 4) Add And Update Service Data
  const AddUpdateServiceData = async (Params) => {
    const apiRequestParams = Params;
    //Object.keys(apiRequestParam).length === 0 ? Params : apiRequestParam;
    $("#" + "ConfirmModel").modal("hide");
    setLoader(true);
    try {
      let url = "/AddUpdateServices"; // Default URL for Adding Data
      if (servicesObj.serviceKeyID !== null) {
        url = "/AddUpdateServices?Action=Update";
      }
      const response = await AddUpdateService(url, apiRequestParams);
      if (response) {
        $("#" + "ConfirmSAChangesModel").modal("hide");
        setLoader(false);
        if (response?.data?.statusCode === 200) {
          const services =
            response?.data.responseData?.globalConstantExistsInServices;

          if (services.length > 0) {
            const serviceName = services.map((item) => item.servicePackageName);
            setModelRequestData({
              Action: "Update",
              message: `This Service being used in the below packages:`,
              ServiceName: serviceName,
              name: "packages",
            });
            setOpenSuccessModal(true);
            props.setIsAddUpdateActionDone(true);
          } else {
            setModelRequestData({
              ServiceName: [],
            });
            setOpenSuccessModal(true);
            props.setIsAddUpdateActionDone(true);
          }

          $("#" + "ConfirmModel").modal("hide");
          $("#" + "ConfirmSAChangesModel").modal("hide");
        } else {
          const ErrorMessage = response?.response?.data?.errorMessage;
          if (ErrorMessage.includes("Pricing formula is required.")) {
            setEditPricingFormulaValue(null);
            setserviceError({
              ...serviceError,
              pricingFormula: true,
            });
          } else {
            // setOpenErrorModal(true);
            if (ErrorMessage.includes("Service Name Already Exists")) {
              const professionTypeName = apiRequestParams.professionTypeList
                .map((item) => item.professionTypeName)
                .join(", ");
              const ErrorMessageReplace = `A service with the name ${servicesObj.serviceName} already exist for profession type ${professionTypeName}. Please choose a different name.`;
              setErrorMessage(ErrorMessageReplace);
            } else {
              setErrorMessage(ErrorMessage);
            }
          }
          $("#" + "ConfirmSAChangesModel").modal("hide");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 5) Get Driver Type Lookup List Data
  const GetDriverTypeData = async () => {
    try {
      const data = await DriverTypeList();
      const driverTypeData = data.data.responseData.data;
      setDriverType(driverTypeData);
    } catch (error) {
      console.log(error);
    }
  };

  // 6) Get Slab Type Lookup List Data
  const getSlabTypeData = async () => {
    try {
      const response = await SlabTypeList();
      if (response) {
        const slabTypeData = response?.data?.responseData.data;
        setSlabType(slabTypeData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // 7) Get Profession Type Lookup List Data
  const GetProfessionTypeData = async () => {
    try {
      const data = await GetProfessionTypeLookupList();
      const professionTypeData = data.data.responseData.data;
      setProfessionType(professionTypeData);
    } catch (error) {
      console.log(error);
    }
  };

  // 9) Get Service Charge Type Lookup List Data
  const GetServiceChargeTypeLookupList = async () => {
    try {
      const response = await ServiceChargeTypeList();
      const serviceChargeTypeListData = response?.data?.responseData?.data;
      setServiceChargeTypeList(serviceChargeTypeListData);
    } catch (error) {
      console.log(error);
    }
  };

  // 10) Get Pricing Type Lookup List Data
  const GetPricingTypeLookupList = async () => {
    try {
      const response = await PricingTypeList();
      const pricingTypeListData = response?.data?.responseData?.data;
      setPricingTypeList(pricingTypeListData);
    } catch (error) {
      console.log(error);
    }
  };

  // 11) Get Service Charge Type Lookup List Data
  const GetProfessionTypeLookupListData = async () => {
    try {
      const response = await GetProfessionTypeLookupList();
      if (response) {
        if (response?.data?.statusCode === 200) {
          if (response?.data?.responseData?.data) {
            const ProfessionTypeLookupListData =
              response?.data?.responseData?.data;
            setProfessionTypeLookupList(ProfessionTypeLookupListData);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  //12] Get ClientBusinessType lookup list
  const GetBusinessTypeLookupListData = async () => {
    try {
      const data = await GetProspectTypeVariationLookupList(
        common.organisationKeyID,
        common.userKeyID,
      );
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          let BusinessTypeListData = data?.data?.responseData?.data;
          BusinessTypeListData = BusinessTypeListData.map((BusinessType) => ({
            value: BusinessType.businessTypeID,
            label: BusinessType.businessTypeName,
          }));

          setBusinessTypeLookupList(BusinessTypeListData);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  //13] //Nature of business type lookup list
  const GetNOBTypeLookUpListData = async () => {
    try {
      const data = await GetNOBTypeLookupList(
        common.organisationKeyID,
        common.userKeyID,
      );
      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          let NoBTypeListData = data?.data?.responseData?.data;
          // Map the fetched data to include only value and label
          NoBTypeListData = NoBTypeListData.map((NOB) => ({
            value: NOB.businessNatureID,
            label: NOB.businessNatureName,
          }));
          // Add the "All" option to the beginning of the array
          NoBTypeListData.unshift({
            value: null,
            label: "All",
          });
          // Set the state with the updated array
          setNatureOfBusinessTypeLookupList(NoBTypeListData);
        }
      }
    } catch (error) {}
  };

  //14) // Service Dependency List
  const GetServiceDependencyListData = async (params) => {
    try {
      setLoader(true);
      const data = await GetServiceDependencyList(params);
      if (data?.data?.statusCode === 200) {
        setLoader(false);
        if (data?.data?.responseData?.data) {
          const List = data?.data?.responseData?.data;
          console.log(List);
          setServiceDependencyList(List);
        }
      }
    } catch (error) {
      console.error(error);
      setLoader(false);
    }
  };
  //on change Nature of business type
  const OnNOBChange = (selectedOptions) => {
    if (selectedOptions.filter((item) => item.value === null).length > 0) {
      // If "All" is selected, select all options except "All"
      const updatedNOBList = NatureOfBusinessTypeLookupList.filter(
        (option) => option.value !== null,
      ).map((option) => option.value);
      setServicesObj({
        ...servicesObj,
        businessNatureID: updatedNOBList,
      });
    } else {
      // Otherwise, select the options the user has chosen
      const updatedNOBList = selectedOptions.map((option) => option.value);
      setServicesObj({
        ...servicesObj,
        businessNatureID: updatedNOBList,
      });
    }
  };

  const NOBTypeValue = servicesObj?.businessNatureID
    ?.map((businessNatureID) => {
      const matchingNature = NatureOfBusinessTypeLookupList.find(
        (nature) => nature.value === businessNatureID,
      );

      if (matchingNature) {
        return {
          value: matchingNature.value,
          label: matchingNature.label,
        };
      } else {
        return null; // or handle the case where there's no match
      }
    })
    .filter((item) => item !== null);

  //Client type Onchange
  const OnClientTypeChange = (ClientTypeId) => {
    if (ClientTypeId.filter((item) => item.value === null).length > 0) {
      const updatedClientTypeList = BusinessTypeLookupList.map(
        (option) => option.value,
      );
      setServicesObj({
        ...servicesObj,
        clientBusinessTypeID: updatedClientTypeList,
      });
    } else {
      const updatedClientTypeList = ClientTypeId.map((option) => option.value);
      setServicesObj({
        ...servicesObj,
        clientBusinessTypeID: updatedClientTypeList,
      });
    }
  };

  const ClientTypeValue = servicesObj?.clientBusinessTypeID
    ?.map((clientBusinessID) => {
      const matchingNature = BusinessTypeLookupList.find(
        (client) => client.value === clientBusinessID,
      );

      if (matchingNature) {
        return {
          value: matchingNature.value,
          label: matchingNature.label,
        };
      } else {
        return null; // or handle the case where there's no match
      }
    })
    .filter((item) => item !== null);
  // D] Lookup List Mapping Function Here :
  const ProfessionTypeValue = servicesObj.professionTypeList?.map((item) => ({
    value: item.professionTypeId,
    label: item.professionTypeName,
  }));

  const ServiceCategoryValue = servicesObj.serviceCategoryList?.map((item) => ({
    value: item.serviceCatKeyID,
    label: item.serviceCatName,
  }));

  const DriverTypeValue = driverType.map((driverType) => ({
    value: driverType.driverTypeId,
    label: driverType.driverTypeName,
  }));

  const ProfessionalTypeLookeupListOptions = professionTypeLookupList.map(
    (ProfessionType) => ({
      value: ProfessionType.professionTypeId,
      label: ProfessionType.professionTypeName,
    }),
  );

  const ServiceCategoryLookeupListOptions = serviceCategoryList?.map(
    (ServiceCategoryType) => ({
      value: ServiceCategoryType.serviceCatKeyID,
      label: ServiceCategoryType.serviceCatName,
    }),
  );

  const ServiceDependencyLookupList = ServiceDependencyList?.map((item) => ({
    value: item.serviceID,
    label: `${item.serviceName} (${item.serviceCatName})`,
    serviceCatID: item.serviceCatID,
  }));
  const ServiceDependencyValue = (servicesObj?.prerequisiteServicesID || [])
    .map((prerequisiteID) => {
      const matchingService = ServiceDependencyLookupList?.find(
        (service) =>
          service.value === prerequisiteID.serviceID &&
          service.serviceCatID === prerequisiteID.serviceCatID,
      );
      return matchingService || null;
    })
    .filter(Boolean);
  console.log("List", ServiceDependencyLookupList);
  console.log("Final ServiceDependencyValue:", ServiceDependencyValue);
  // D] handle Function :
  const HandleClose = async () => {
    if (modelAction === "DeleteFeeInflation") {
      setOpenSuccessModal(false);
      setModelAction(null);
      return;
    }
    if (isCheck) {
      setLoader(true);
      const Notification = await NotifySuperAdminPredefinedChangesToAdmin({
        userKeyID: common.userKeyID,
        moduleKeyID: saveLocationState.serviceKeyID,
        moduleName: "Predefined-Service",
      });
      if (Notification?.data?.statusCode === 200) {
        setLoader(false);
        setModelAction("NotificationSend");
        setOpenSuccessModal(true);
        setIsCheck(false);
      }
    } else {
      if (isDeclined && !isDriverDelete) {
        setOpenSuccessModal(false);
        setOpenDeleteDriverModel(false);
        setIsDriverDelete(false);
        $("#" + "ConfirmSAChangesModel").modal("hide");
        navigate("/services");
      } else if (openErrorModal === true && isDriverDelete) {
        setOpenErrorModal(false);
        setIsDriverDelete(false);
        setOpenDeleteDriverModel(false);
      } else {
        setOpenSuccessModal(false);
        setIsDriverDelete(false);
        setOpenDeleteDriverModel(false);
        navigate("/services");
      }
    }
  };
  // Handle Close delete Driver model
  const handleCloseDeleteDriverModel = () => {
    $("#" + "DeleteDriverModel").modal("hide");

    setOpenDeleteDriverModel(false);
  };
  const OnShowGPD = () => {
    setGlobalPricingDrivers([]);
  };

  const OnAdd = (count, index) => {
    setGdriverError({
      pfError: false,
      variationError: false,
      slabError: false,
      drivernameError: false,
      drivertypeError: false,
      variationnameError: false,
      variationvalueError: false,
      slabtypeError: false,
      slabtypevalueError: false,
      slabtypefromError: false,
      slabTypeToError: false,
      slabToMinValue: false,
      textValueError: false,
      textLengthError: false,
    });
    if (count === "PricingDriver") {
      const pricingDriverCopy = pricingDriver[pricingDriver.length - 1];
      setPricingDriverCount(pricingDriverCount + 1);

      const AddPricingDriver = {
        userKeyID: common.userKeyID,
        globalPricingDriverID: null,
        globalPricingDriverKeyID: null,
        parentGlobalPricingDriverKeyID: null,
        driverName: "",
        driverTypeID: "",
        isPredefined: null,
        dependant_GlobalPricingDriverKeyID: null,
        temp_GlobalPricingDriverID_ForDependancy:
          pricingDriver.length === 0 ? 1 : pricingDriver.length + 1,
        dependsOn_DriverID: null,
        dependsOn_GlobalPricingDriverKeyID: null,
        dependsOn_VariationID: null,
        dependsOn_VariationKeyID: null,
        addedFor: "Services",
        pfList: null,
        variation: [],
        slab: [],
        text: [],
        textValue: "",
        dateValue: null,
      };

      const updatedPricingDriver = [...pricingDriver]; // Create a copy of the array
      updatedPricingDriver.push(
        pricingDriverCount === 0 ? 1 : AddPricingDriver,
      );
      if (pricingDriver.length > 0) {
        if (
          (pricingDriverCopy.driverName === "") |
          (pricingDriverCopy.driverName === undefined)
        ) {
          setGdriverError({ drivernameError: true });
        } else if (
          (pricingDriverCopy.driverTypeID === "") |
          (pricingDriverCopy.driverTypeID === undefined)
        ) {
          setGdriverError({ drivernameError: true });
        } else if (pricingDriverCopy.driverTypeID === 3) {
          if (pricingDriverCopy.variation.length === 0) {
            setGdriverError({ variationError: true });
          } else if (
            pricingDriver[pricingDriver.length - 1].variation[
              pricingDriverCopy.variation.length - 1
            ].variationName === "" ||
            pricingDriver[pricingDriver.length - 1].variation[
              pricingDriverCopy.variation.length - 1
            ]?.variationValue === ""
          ) {
            setGdriverError({ variationnameError: true });
            return false;
          } else if (
            pricingDriverCopy.variation[pricingDriverCopy.variation.length - 1]
              ?.variationName !== ""
          ) {
            const duplicateVariationFound = pricingDriverCopy.variation.filter(
              (item, index) => {
                // Check if there is any item with the same variationName before the current index
                return pricingDriverCopy.variation
                  .slice(0, index)
                  .some(
                    (prevItem) => prevItem.variationName === item.variationName,
                  );
              },
            );

            if (duplicateVariationFound.length > 0) {
              // Remove duplicates from the array
              const uniqueVariations = Array.from(
                new Set(
                  duplicateVariationFound.map((item) => item.variationName),
                ),
              );
              // Construct the error message
              const duplicateNames = uniqueVariations.join(", ");
              setErrorMessage(
                `Variation with name ${duplicateNames} already exist. Please choose different name.`,
              );
              setOpenErrorModal(true);
              setIsDriverDelete(true);
              return false;
            } else {
              setPricingDriver(updatedPricingDriver);
            }
          }
        } else if (pricingDriverCopy.driverTypeID === 4) {
          if (pricingDriverCopy.slab.length === 0) {
            setGdriverError({ slabError: true });
          } else if (
            pricingDriver[pricingDriver.length - 1].slab[
              pricingDriverCopy.slab.length - 1
            ].slabTypeID === ""
          ) {
            setGdriverError({ slabtypeError: true });
          } else if (
            pricingDriver[pricingDriver.length - 1].slab[
              pricingDriverCopy.slab.length - 1
            ].slabValue === "" ||
            pricingDriver[pricingDriver.length - 1].slab[
              pricingDriverCopy.slab.length - 1
            ].slabFrom === "" ||
            pricingDriver[pricingDriver.length - 1].slab[
              pricingDriverCopy.slab.length - 1
            ].slabTo === ""
          ) {
            setGdriverError({ slabtypevalueError: true });
          } else if (
            pricingDriver[pricingDriver.length - 1].slab[
              pricingDriverCopy.slab.length - 1
            ].slabTypeID === 1 &&
            parseFloat(
              pricingDriver[pricingDriver.length - 1].slab[
                pricingDriverCopy.slab.length - 1
              ].slabTo,
            ) <
              parseFloat(
                pricingDriver[pricingDriver.length - 1].slab[
                  pricingDriverCopy.slab.length - 1
                ].slabFrom,
              )
          ) {
            setGdriverError({ slabToMinValue: true });
          } else {
            setPricingDriver(updatedPricingDriver);
          }
        } else if (pricingDriverCopy.driverTypeID === 5) {
          console.log(pricingDriverCopy.text);
          // *** use the copy’s text array, not the outer array ***
          if (pricingDriverCopy.text.length === 0) {
            setGdriverError({ textValueError: true });
            return;
          }
          const lastText = pricingDriverCopy.text[0];
          // if (!lastText.textValue || lastText.textValue === "" || Number(lastText.textValue) == null) {
          //   setGdriverError({ textValueError: true });
          //   return;
          // }
          if (
            !lastText.textLength ||
            lastText.textLength === "" ||
            Number(lastText.textLength) == null
          ) {
            setGdriverError({ textLengthError: true });
            return;
          }
          // everything okay, now push the new driver
          setPricingDriver(updatedPricingDriver);
        } else {
          setPricingDriver(updatedPricingDriver);
        }
      } else {
        setPricingDriver(updatedPricingDriver);
      }
    }
    setTimeout(function () {
      scrollUpDownByElementID(`Driver_${pricingDriver.length}`);
    }, 200);
  };

  // Delete Pricing Driver
  const OnDeletePricingDriver = async (mainIndex) => {
    const driverNamesSet = [];

    // Collect driver names based on dependencies
    pricingDriver.forEach((obj) => {
      if (
        obj.globalPricingDriverKeyID &&
        pricingDriver[mainIndex]?.dependant_GlobalPricingDriverKeyID?.includes(
          obj.globalPricingDriverKeyID,
        )
      ) {
        driverNamesSet.push(obj.driverName);
      }
      if (
        obj.temp_GlobalPricingDriverID_ForDependancy &&
        pricingDriver[mainIndex]?.dependant_GlobalPricingDriverKeyID?.includes(
          obj.temp_GlobalPricingDriverID_ForDependancy,
        )
      ) {
        driverNamesSet.push(obj.driverName);
      }
    });

    if (EditPricingFormulaValue) {
      const ExistInFormulaRecords = EditPricingFormulaValue?.split(" ");
      const matches = ExistInFormulaRecords.map((item) =>
        item.match(
          /Var\("?(.*?)"?\)|var\("?.*?"?\)|Var\("?.*?"?\)|var\("([^"]+)"\)|var([a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12})/gi,
        ),
      )
        .filter(Boolean)
        .flat();

      let getId = [];
      if (matches.length > 0) {
        getId = matches.map((item) => {
          if (item.startsWith("Var(") || item.startsWith("var(")) {
            return item.replace(/Var|var|VAR|\(|\)|"/g, "").toUpperCase();
          } else if (item.startsWith("var") || item.startsWith("Var")) {
            return item.replace(/^var|^VAR|\(|\)/g, "").toUpperCase();
          } else {
            return item;
          }
        });
      } else {
        getId = [];
      }

      const GetIdFromFormula = getId;

      let MatchID_Global = GetIdFromFormula.filter(
        (formulaId) =>
          formulaId ==
          pricingDriver[mainIndex].globalPricingDriverKeyID?.toUpperCase(),
      );
      let MatchID_Temp = GetIdFromFormula.filter(
        (formulaId) =>
          formulaId ==
          pricingDriver[mainIndex].temp_GlobalPricingDriverID_ForDependancy,
      );

      const isDependant =
        pricingDriver[mainIndex]?.dependant_GlobalPricingDriverKeyID?.length ||
        0;

      if (
        (MatchID_Temp.length !== 0 || MatchID_Global.length !== 0) &&
        isDependant > 0
      ) {
        showModal(
          "This driver is included in the pricing formula, please remove it from there first.",
          driverNamesSet,
        );
        return false;
      } else if (MatchID_Temp.length !== 0 || MatchID_Global.length !== 0) {
        showModal(
          "This driver is included in the pricing formula, please remove it from there first.",
          driverNamesSet,
        );
        return false;
      } else if (isDependant > 0) {
        showModal(
          "This driver is included in the pricing formula, please remove it from there first.",
          driverNamesSet,
        );
        return false;
      } else {
        if (pricingDriver[mainIndex].globalPricingDriverKeyID === null) {
          removePricingDriver(mainIndex);
        } else {
          setLoader(true);
          const pricingDriverDelete = await GetPricingDriverUsedInModules(
            pricingDriver[mainIndex].globalPricingDriverKeyID,
            common.userKeyID,
            saveLocationState.serviceKeyID,
            null,
            null,
            null,
            null,
          );
          if (pricingDriverDelete.data.statusCode === 200) {
            setLoader(false);
            let moduleList = pricingDriverDelete.data.responseData.moduleList;
            if (moduleList.length > 0) {
              // moduleList.map()
              setModelRequestData({
                ...modelRequestData,
                Action: "PricingDriverDelete",
                message: `Cannot delete pricing driver already exist in following`,
                ServiceName: moduleList,
              });
              $("#" + "DeleteDriverModel").modal("show");
              // $("#" + "RecordsAvailablePopupModel").modal("show");
              // setOpenDeleteDriverModel(true)
            } else {
              removePricingDriver(mainIndex);
            }
          }
        }
      }
    } else {
      const isDependant =
        pricingDriver[mainIndex]?.dependant_GlobalPricingDriverKeyID?.length ||
        0;
      if (isDependant > 0) {
        showModal(
          "This driver is included in the pricing formula, please remove it from there first.",
          driverNamesSet,
        );
        return false;
      }
      if (pricingDriver[mainIndex].globalPricingDriverKeyID === null) {
        removePricingDriver(mainIndex);
      } else {
        setLoader(true);
        const pricingDriverDelete = await GetPricingDriverUsedInModules(
          pricingDriver[mainIndex].globalPricingDriverKeyID,
          common.userKeyID,
          saveLocationState.serviceKeyID,
          null,
          null,
          null,
          null,
        );
        if (pricingDriverDelete.data.statusCode === 200) {
          setLoader(false);
          let moduleList = pricingDriverDelete.data.responseData.moduleList;
          if (moduleList.length > 0) {
            // moduleList.map()
            setModelRequestData({
              ...modelRequestData,
              Action: "PricingDriverDelete",
              message: `Cannot delete pricing driver already exist in following`,
              ServiceName: moduleList,
            });
            $("#" + "DeleteDriverModel").modal("show");
            // $("#" + "RecordsAvailablePopupModel").modal("show");
            // setOpenDeleteDriverModel(true)
          } else {
            removePricingDriver(mainIndex);
          }
        }
      }
    }
  };

  // Function to remove pricing driver
  const removePricingDriver = (index) => {
    let updatedPricingDriver = [...pricingDriver];

    // Extract the target driver ID and target driver GPD ID
    const targetDriverId =
      updatedPricingDriver[index].temp_GlobalPricingDriverID_ForDependancy;
    const targetDriverGPDId =
      updatedPricingDriver[index].globalPricingDriverKeyID;

    // Define the filter function
    const filterFunction = (item) => {
      let updatedDependant;
      if (targetDriverId !== null) {
        // If targetDriverId is not null, filter it out from dependant_GlobalPricingDriverKeyID
        updatedDependant = item.dependant_GlobalPricingDriverKeyID?.filter(
          (num) => num !== targetDriverId,
        );
      } else {
        // If targetDriverId is null, search for targetDriverGPDId and filter it out
        updatedDependant = item.dependant_GlobalPricingDriverKeyID?.filter(
          (num) => num !== targetDriverGPDId,
        );
      }
      return {
        ...item,
        dependant_GlobalPricingDriverKeyID: updatedDependant,
      };
    };

    // Apply the filter function to each item in the array
    updatedPricingDriver = updatedPricingDriver.map(filterFunction);
    if (index >= 0 && index < updatedPricingDriver.length) {
      updatedPricingDriver.splice(index, 1);
      setPricingDriver(updatedPricingDriver); // Update the state
      if (pricingDriver.length === 0) {
        setPricingDriver([]);
        setAddGBP(false);
      }
    }
  };
  // Function to show modal
  const showModal = (message, driverNamesSet) => {
    setModelRequestData({
      ...modelRequestData,
      Action: "DeleteDriverWarning",
      message: message,
      DriverName: driverNamesSet,
    });
    $("#" + "RecordsAvailablePopupModel").modal("show");
  };

  const handleCancelButton = () => {
    setPricingFormulaError("");
    setTopbar("block");
    navigate("/services");
  };

  const handleBackButton = (PrevTab) => {
    setErrorMessage("");
    setActiveTab(PrevTab);
  };
  const OnProfessionTypeChange = (ProfessionType) => {
    let updatedPfList;
    if (Array.isArray(ProfessionType)) {
      // If ProfessionType is an array, map over it to create updatedPfList
      updatedPfList = ProfessionType.map((option) => ({
        professionTypeId: option.value,
        professionTypeName: option.label,
      }));
    } else {
      // If ProfessionType is an object, create an array with a single object
      updatedPfList = [
        {
          professionTypeId: ProfessionType.value,
          professionTypeName: ProfessionType.label,
        },
      ];
    }

    // Update servicesObj with professionTypeList
    setServicesObj({
      ...servicesObj,
      professionTypeList: updatedPfList,
    });

    // Call GetServiceCategoryListData with updatedPfList and null
    GetServiceCategoryListData(updatedPfList, null);
  };
  // Service Category change
  const OnServiceCategoryChange = (ServiceCategoryType) => {
    const updatedServiceCategoryList = ServiceCategoryType.map((option) => ({
      serviceCatKeyID: option.value,
      serviceCatName: option.label,
    }));
    setServicesObj({
      ...servicesObj,
      serviceCategoryList: updatedServiceCategoryList,
    });
  };

  // Service Dependencies Change
  const OnServiceDependencyChange = (selectedOptions) => {
    if (selectedOptions.some((item) => item.value === null)) {
      // "All" selected
      const updatedServiceDependencyList = ServiceDependencyList.map(
        (option) => ({
          serviceID: option.serviceID,
          serviceCatID: option.serviceCatID,
        }),
      );
      console.log(updatedServiceDependencyList);
      setServicesObj({
        ...servicesObj,
        prerequisiteServicesID: updatedServiceDependencyList,
      });
    } else {
      const updatedServiceDependencyList = selectedOptions.map((option) => ({
        serviceID: option.value,
        serviceCatID: option.serviceCatID,
      }));
      console.log(updatedServiceDependencyList);
      setServicesObj({
        ...servicesObj,
        prerequisiteServicesID: updatedServiceDependencyList,
      });
    }
  };

  // Driver Type change
  const OnDriverTypeChange = async (index, DriverType) => {
    // return false
    const driverNamesSet = [];
    pricingDriver.forEach((obj) => {
      if (
        obj.globalPricingDriverKeyID &&
        pricingDriver[index]?.dependant_GlobalPricingDriverKeyID?.includes(
          obj.globalPricingDriverKeyID,
        )
      ) {
        driverNamesSet.push(obj.driverName);
      }
      if (
        obj.temp_GlobalPricingDriverID_ForDependancy &&
        pricingDriver[index]?.dependant_GlobalPricingDriverKeyID?.includes(
          obj.temp_GlobalPricingDriverID_ForDependancy,
        )
      ) {
        driverNamesSet.push(obj.driverName);
      }
    });
    if (
      pricingDriver[index].driverTypeID === 3 &&
      pricingDriver[index].dependant_GlobalPricingDriverKeyID?.length > 0
    ) {
      setModelRequestData({
        ...modelRequestData,
        Action: "DeleteDriverWarning",
        message:
          "This driver is included in the pricing formula, please remove it from there first.",
        DriverName: driverNamesSet,
      });
      $("#" + "RecordsAvailablePopupModel").modal("show");
      // OnPricingDriverChange(index, "driverTypeID", DriverType.value);
    } else {
      let variationKeyIDs = null;
      let slabKeyIDs = null;
      let textKeyIDs = null;
      let dateKeyIDs = null;
      if (pricingDriver[index].driverTypeID === 4) {
        if (pricingDriver[index].slab.length > 0) {
          slabKeyIDs = pricingDriver[index].slab
            .map((slab) => slab.slabKeyID)
            .join(",");
        }
      }
      if (pricingDriver[index].driverTypeID === 3) {
        if (pricingDriver[index].variation.length > 0) {
          variationKeyIDs = pricingDriver[index].variation
            .map((variation) => variation.variationKeyID)
            .join(",");
        }
      }
      if (pricingDriver[index].driverTypeID === 5) {
        if (pricingDriver[index].text.length > 0) {
          textKeyIDs = pricingDriver[index].text
            .map((text) => text.textKeyID)
            .join(",");
        }
      }
      if (pricingDriver[index].driverTypeID === 6) {
        if (pricingDriver[index].date.length > 0) {
          dateKeyIDs = pricingDriver[index].date
            .map((date) => date.dateKeyID)
            .join(",");
        }
      }
      if (
        pricingDriver[index].driverTypeID !== null &&
        pricingDriver[index].globalPricingDriverKeyID !== null
      ) {
        setLoader(true);
        const pricingDriverDelete = await GetPricingDriverUsedInModules(
          pricingDriver[index].globalPricingDriverKeyID,
          common.userKeyID,
          servicesObj.serviceKeyID,
          variationKeyIDs,
          slabKeyIDs,
          dateKeyIDs,
          textKeyIDs,
        );
        if (pricingDriverDelete.data.statusCode === 200) {
          setLoader(false);
          let moduleList = pricingDriverDelete.data.responseData.moduleList;
          if (moduleList.length > 0) {
            // moduleList.map()
            setModelRequestData({
              ...modelRequestData,
              Action: "PricingDriverDelete",
              message:
                slabKeyIDs !== null
                  ? `Cannot delete slab already exist in following`
                  : `Cannot delete variation already exist in following`,
              ServiceName: moduleList,
            });
            $("#" + "DeleteDriverModel").modal("show");
            // setTimeout(() => {

            // }, 1000);

            // setOpenDeleteDriverModel(true)
          } else {
            setLoader(false);
            OnPricingDriverChange(index, "driverTypeID", DriverType.value);
          }
        }
      } else {
        setLoader(false);
        OnPricingDriverChange(index, "driverTypeID", DriverType.value);
      }
    }
    // setDriverTypeValue1(DriverType)
    // setDriverTypeValue1((prevValues) => {
    //   const newValues = [...prevValues];
    //   newValues[index] = DriverType;
    //   return newValues;
    // });
  };
  // Delete variation
  const OnDeleteVariations = async (mainIndex, index) => {
    // Filter variations that depend on the variation being deleted
    const MatchVariationID_Global = pricingDriver.filter(
      (variation, VarIndex) =>
        variation.dependsOn_GlobalPricingDriverKeyID ===
          pricingDriver[mainIndex].globalPricingDriverKeyID &&
        variation.dependsOn_VariationKeyID !== null &&
        variation.dependsOn_VariationKeyID ===
          pricingDriver[mainIndex].variation[index].variationKeyID,
    );

    const MatchVariationID_Temp = pricingDriver.filter(
      (variation, VarIndex) =>
        variation.dependsOn_DriverID ===
          pricingDriver[mainIndex].temp_GlobalPricingDriverID_ForDependancy &&
        variation.dependsOn_VariationID !== null &&
        variation.dependsOn_VariationID ===
          pricingDriver[mainIndex].variation[index]
            .temp_VariationID_ForDependancy,
    );

    if (
      MatchVariationID_Global.length !== 0 ||
      MatchVariationID_Temp.length !== 0
    ) {
      // Display warning if there are dependent variations
      setModelRequestData({
        ...modelRequestData,
        Action: "DeleteDriverWarning",
        message:
          "This variation is added as dependency, please remove it from this first.",
      });
      $("#" + "RecordsAvailablePopupModel").modal("show");
      return false;
    } else {
      // Create a copy of pricingDriver array to avoid modifying it directly
      const pricingDriverCopy = [...pricingDriver];
      if (
        pricingDriverCopy[mainIndex].variation[index].variationKeyID !== null
      ) {
        setLoader(true);
        const pricingDriverDelete = await GetPricingDriverUsedInModules(
          pricingDriverCopy[mainIndex].globalPricingDriverKeyID,
          common.userKeyID,
          saveLocationState.serviceKeyID,
          pricingDriverCopy[mainIndex].variation[index].variationKeyID,
          null,
        );
        if (pricingDriverDelete.data.statusCode === 200) {
          setLoader(false);
          let moduleList = pricingDriverDelete.data.responseData.moduleList;
          if (moduleList.length > 0) {
            // moduleList.map()
            setModelRequestData({
              ...modelRequestData,
              Action: "PricingDriverDelete",
              message: `Cannot delete variation already exist in following`,
              ServiceName: moduleList,
            });
            $("#" + "DeleteDriverModel").modal("show");
            // setOpenDeleteDriverModel(true)
          } else {
            if (mainIndex >= 0 && mainIndex < pricingDriverCopy.length) {
              const variationsCopy = [
                ...pricingDriverCopy[mainIndex].variation,
              ];

              // Check if the provided index for the variation is within the valid range
              if (index >= 0 && index < variationsCopy.length) {
                // Use splice to remove the variation at the specified index
                variationsCopy.splice(index, 1);

                // If there are remaining variations, mark the first one as default
                if (variationsCopy.length > 0) {
                  variationsCopy[0].isDefault = true;
                }

                // Update the variation array within pricingDriver
                pricingDriverCopy[mainIndex].variation = variationsCopy;

                // Update the pricingDriver state with the modified array
                setPricingDriver(pricingDriverCopy);
              }
            }
          }
        }
      } else {
        if (mainIndex >= 0 && mainIndex < pricingDriverCopy.length) {
          const variationsCopy = [...pricingDriverCopy[mainIndex].variation];

          // Check if the provided index for the variation is within the valid range
          if (index >= 0 && index < variationsCopy.length) {
            // Use splice to remove the variation at the specified index
            variationsCopy.splice(index, 1);

            // If there are remaining variations, mark the first one as default
            if (variationsCopy.length > 0) {
              variationsCopy[0].isDefault = true;
            }

            // Update the variation array within pricingDriver
            pricingDriverCopy[mainIndex].variation = variationsCopy;

            // Update the pricingDriver state with the modified array
            setPricingDriver(pricingDriverCopy);
          }
        }
      }

      // Check if the provided index is within the valid range
    }
  };
  // Variation change
  const OnVariationChange = (mainIndex, index, field, value) => {
    const updatedVariations = [...pricingDriver];
    if (
      updatedVariations[mainIndex] &&
      updatedVariations[mainIndex].variation &&
      updatedVariations[mainIndex].variation[index]
    ) {
      updatedVariations[mainIndex].variation[index][field] = value;
      setPricingDriver(updatedVariations);
    }
  };
  //  Pricing Driver Change
  const OnPricingDriverChange = (index, field, value) => {
    // Clone the pricingDriver array
    let updatedVariations = [...pricingDriver];
    switch (updatedVariations[index].driverTypeID) {
      case 2:
        updatedVariations[index].variation = [];
        updatedVariations[index].slab = [];
        updatedVariations[index].text = [];
        updatedVariations[index].date = [];
        break;
      case 3:
        updatedVariations[index].slab = [];
        updatedVariations[index].text = [];
        updatedVariations[index].date = [];
        break;
      case 4:
        updatedVariations[index].variation = [];
        updatedVariations[index].text = [];
        updatedVariations[index].date = [];
        break;
      case 5:
        updatedVariations[index].variation = [];
        updatedVariations[index].slab = [];
        updatedVariations[index].date = [];
        break;
      case 6:
        updatedVariations[index].variation = [];
        updatedVariations[index].slab = [];
        updatedVariations[index].text = [];
        break;
      default:
        break;
    }

    if (
      field === "TextValue" ||
      field === "TextLength" ||
      field === "AllowedSpecialCharacters"
    ) {
      // Ensure text array and first object exist
      if (
        !updatedVariations[index].text ||
        !Array.isArray(updatedVariations[index].text)
      ) {
        updatedVariations[index].text = [{}];
      } else if (!updatedVariations[index].text[0]) {
        updatedVariations[index].text[0] = {};
      }

      let cleanValue = value?.replace(/[^0-9.]/g, "");
      const numericValue = parseFloat(value);

      if (field === "TextLength") {
        updatedVariations[index].text[0].textLength = isNaN(cleanValue)
          ? ""
          : cleanValue;
      } else if (field === "TextValue") {
        updatedVariations[index].text[0].textValue = isNaN(cleanValue)
          ? ""
          : cleanValue;
      } else if (field === "AllowedSpecialCharacters") {
        updatedVariations[index].text[0].allowedSpecialCharacters = value;
      }

      setPricingDriver(updatedVariations);
      return;
    }
    if (
      field === "DateValue" ||
      field === "DateFormat" ||
      field === "defaultDateValue"
    ) {
      // Ensure text array and first object exist
      if (
        !updatedVariations[index].date ||
        !Array.isArray(updatedVariations[index].date)
      ) {
        updatedVariations[index].date = [{}];
      } else if (!updatedVariations[index].date[0]) {
        updatedVariations[index].date[0] = {};
      }

      let cleanValue = value?.replace(/[^0-9.]/g, "");
      if (field === "DateValue") {
        updatedVariations[index].date[0].blocks[0].dateValue = cleanValue;
      } else if (!updatedVariations[index].date[0]) {
        updatedVariations[index].date[0] = {};
      } else if (field === "DateFormat") {
        const newFormat = value;
        const oldFormat =
          updatedVariations[index].date?.[0]?.dateFormat ||
          Utils.dateFormats[0]?.value;
        updatedVariations[index].date[0].blocks =
          updatedVariations[index].date[0].blocks || [];

        updatedVariations[index].date = (
          updatedVariations[index].date || []
        ).map((group) => {
          const hasBlocks =
            Array.isArray(group.blocks) && group.blocks.length > 0;

          let updatedGroup = {
            ...group,
            dateFormat: newFormat,
          };

          // Only convert blocks if they exist
          if (hasBlocks) {
            const newBlocks = group.blocks.map((block) => {
              const fromDateObj = parseStoredDate(block.fromDate, oldFormat);
              const toDateObj = parseStoredDate(block.toDate, oldFormat);

              return {
                ...block,
                fromDate: fromDateObj
                  ? formatToDisplay(fromDateObj, newFormat)
                  : "",
                toDate: toDateObj ? formatToDisplay(toDateObj, newFormat) : "",
              };
            });

            updatedGroup.blocks = newBlocks;
          }

          return updatedGroup;
        });

        setPricingDriver(updatedVariations);
        return;
      } else if (field === "defaultDateValue") {
        if (cleanValue === "") {
          cleanValue = null;
        }
        if (
          Array.isArray(updatedVariations[index].date) &&
          updatedVariations[index].date.length > 0
        ) {
          updatedVariations[index].date = updatedVariations[index].date.map(
            (group) => ({
              ...group,
              defaultDateValue: cleanValue,
            }),
          );
        } else {
          // fallback for empty or undefined
          updatedVariations[index].date = [
            {
              defaultDateValue: cleanValue,
              blocks: [],
            },
          ];
        }

        setPricingDriver(updatedVariations);
        return;
      }
      setPricingDriver(updatedVariations);
      return;
    }
    // Check if the value is false
    if (value === false) {
      // Extract the target driver ID and target driver GPD ID
      const targetDriverId =
        updatedVariations[index].temp_GlobalPricingDriverID_ForDependancy;
      const targetDriverGPDId =
        updatedVariations[index].globalPricingDriverKeyID;

      // Define the filter function
      const filterFunction = (item) => {
        let updatedDependant;
        if (targetDriverId !== null) {
          // If targetDriverId is not null, filter it out from dependant_GlobalPricingDriverKeyID
          updatedDependant = item.dependant_GlobalPricingDriverKeyID?.filter(
            (num) => num !== targetDriverId,
          );
        } else {
          // If targetDriverId is null, search for targetDriverGPDId and filter it out
          updatedDependant = item.dependant_GlobalPricingDriverKeyID?.filter(
            (num) => num !== targetDriverGPDId,
          );
        }
        return {
          ...item,
          dependant_GlobalPricingDriverKeyID: updatedDependant,
        };
      };

      // Apply the filter function to each item in the array
      updatedVariations = updatedVariations.map(filterFunction);
      updatedVariations[index].dependsOn_VariationID = null;
      updatedVariations[index].dependsOn_DriverID = null;
      updatedVariations[index].dependsOn_VariationKeyID = null;
      updatedVariations[index].dependsOn_GlobalPricingDriverKeyID = null;
      updatedVariations[index][field] = value;
      // Update the state with the filtered array
      setPricingDriver(updatedVariations);
    }
    // Handle different driver types

    // Update the state with the modified array
    // setPricingDriver(updatedVariations);

    // Update the specific field if pricingDriver[index] is an object
    if (
      updatedVariations[index] &&
      typeof updatedVariations[index] === "object"
    ) {
      updatedVariations[index][field] = value;
      setPricingDriver(updatedVariations);
    } else {
      console.error(`Invalid index: ${index}`);
    }
  };

  //Dependant Driver
  const OnDependantOnDriver = (index, field, value) => {
    if (pricingDriver[index] && typeof pricingDriver[index] === "object") {
      let updatedVariations = [...pricingDriver];
      if (
        updatedVariations[index]?.dependant_GlobalPricingDriverKeyID === null ||
        updatedVariations[index]?.dependant_GlobalPricingDriverKeyID ===
          undefined
      ) {
        updatedVariations[index].dependant_GlobalPricingDriverKeyID = []; // Assign an empty array if it's null
      }

      // Check if the value already exists in the array
      if (
        !updatedVariations[index].dependant_GlobalPricingDriverKeyID.includes(
          value,
        )
      ) {
        // Remove the value from other indices
        updatedVariations.forEach((item, i) => {
          if (i !== index && item.dependant_GlobalPricingDriverKeyID !== null) {
            const valueIndex =
              item.dependant_GlobalPricingDriverKeyID?.indexOf(value);
            if (valueIndex !== -1) {
              item.dependant_GlobalPricingDriverKeyID?.splice(valueIndex, 1);
            }
          }
        });

        // Push the value only if it doesn't already exist
        updatedVariations[index].dependant_GlobalPricingDriverKeyID.push(value);
        setPricingDriver(updatedVariations);
      }
    }
  };
  //Handle Variation Chnage
  function OnVariationsRadioChange(mainIndex, selectedIndex) {
    const updatedPricingDriver = [...pricingDriver]; // Create a copy of the state array
    updatedPricingDriver[mainIndex].variation.forEach((variation, index) => {
      // Update the isDefault property based on the selectedIndex
      variation.isDefault = index === selectedIndex;
    });

    // Update the state with the modified array
    setPricingDriver(updatedPricingDriver);
  }

  function OnDateRadioChange(mainIndex, selectedIndex) {
    const updatedPricingDriver = [...pricingDriver]; // Create a copy of the state array
    updatedPricingDriver[mainIndex].date.forEach((date, index) => {
      // Update the isDefault property based on the selectedIndex
      date.isDefault = index === selectedIndex;
    });

    // Update the state with the modified array
    setPricingDriver(updatedPricingDriver);
  }
  //find largest Variation Id
  const findLargest_Temp_VariationID_ForDependancy = (variationArray) => {
    let largest = 0;
    for (const variation of variationArray) {
      if (variation.temp_VariationID_ForDependancy > largest) {
        largest = variation.temp_VariationID_ForDependancy;
      }
    }
    return largest;
  };

  // Add Variation
  const OnAddVariations = (mainIndex) => {
    // let variationCount = 1;

    const largest_Temp_VariationID_ForDependancy = pricingDriver[mainIndex]
      .variation
      ? findLargest_Temp_VariationID_ForDependancy(
          pricingDriver[mainIndex].variation,
        )
      : 0;

    setCount(count + 1);
    const lastVariation =
      pricingDriver[mainIndex].variation[
        pricingDriver[mainIndex]?.variation.length - 1
      ];
    const newVariations = {
      variationID: null,
      variationKeyID: null,
      parentVariationKeyID: null,
      variationName: "",
      variationValue: "",
      isDefault: pricingDriver[mainIndex].variation.length === 0 ? true : false,
      // temp_VariationID_ForDependancy:
      //   pricingDriver[mainIndex].variation.length === 0
      //     ? variationCount
      //     : variationCount + 1,
      temp_VariationID_ForDependancy:
        largest_Temp_VariationID_ForDependancy + 1,
    };

    // if (pricingDriver[mainIndex] && pricingDriver[mainIndex].variation) {
    if (
      lastVariation &&
      (lastVariation.variationName === "" ||
        lastVariation.variationName === null ||
        lastVariation.variationName === undefined) &&
      (lastVariation.variationValue === "" ||
        lastVariation.variationValue === null ||
        lastVariation.variationValue === undefined)
    ) {
      setGdriverError({
        variationnameError: true,
        variationvalueError: true,
      });
      return false;
    } else {
      setGdriverError({
        variationnameError: false,
        variationvalueError: false,
      });
      pricingDriver[mainIndex].variation.push(newVariations);
    }
    setTimeout(function () {
      scrollUpDownByElementID(
        `VariationDiv_${pricingDriver.length - 1}${
          pricingDriver[mainIndex].variation.length - 1
        }`,
      );
    }, 200);
    // }
  };

  // Delete Slab
  const OnDeleteSlabs = async (mainIndex, index) => {
    // First, create a copy of the pricingDriver array to avoid modifying it directly
    const pricingDriverCopy = [...pricingDriver];

    if (pricingDriverCopy[mainIndex].slab[index].slabKeyID !== null) {
      setLoader(true);
      const pricingDriverDelete = await GetPricingDriverUsedInModules(
        pricingDriverCopy[mainIndex].globalPricingDriverKeyID,
        common.userKeyID,
        saveLocationState.serviceKeyID,
        null,
        pricingDriverCopy[mainIndex].slab[index].slabKeyID,
      );
      if (pricingDriverDelete.data.statusCode === 200) {
        setLoader(false);
        let moduleList = pricingDriverDelete.data.responseData.moduleList;
        if (moduleList.length > 0) {
          // moduleList.map()
          setModelRequestData({
            ...modelRequestData,
            Action: "PricingDriverDelete",
            message: `Cannot delete slab already exist in following`,
            ServiceName: moduleList,
          });
          $("#" + "DeleteDriverModel").modal("show");
          // setOpenDeleteDriverModel(true)
        } else {
          if (mainIndex >= 0 && mainIndex < pricingDriverCopy.length) {
            const slabsCopy = [...pricingDriverCopy[mainIndex].slab];
            if (index >= 0 && index < slabsCopy.length) {
              // Use splice to remove the element at the specified index
              slabsCopy.splice(index, 1);
              for (let i = 1; i < slabsCopy.length; i++) {
                var fromValueForNewSlab =
                  Number(slabsCopy[i - 1].slabTo) + 0.01;
                fromValueForNewSlab =
                  Math.round(fromValueForNewSlab * 100) / 100;
                slabsCopy[i].slabFrom = fromValueForNewSlab; //Number(slabsCopy[i - 1].slabTo) + 0.01;
              }

              if (slabsCopy.length > 0) {
                slabsCopy[0].isDefault = true;
              }
              // Update the slab array within pricingDriver
              pricingDriverCopy[mainIndex].slab = slabsCopy;

              // Update the pricingDriver state with the modified array
              setPricingDriver(pricingDriverCopy);
            }
          }
        }
        // Check if the provided index is within the valid range
      }
    } else {
      if (mainIndex >= 0 && mainIndex < pricingDriverCopy.length) {
        const slabsCopy = [...pricingDriverCopy[mainIndex].slab];
        if (index >= 0 && index < slabsCopy.length) {
          // Use splice to remove the element at the specified index
          slabsCopy.splice(index, 1);
          for (let i = 1; i < slabsCopy.length; i++) {
            var fromValueForNewSlab = Number(slabsCopy[i - 1].slabTo) + 0.01;
            fromValueForNewSlab = Math.round(fromValueForNewSlab * 100) / 100;
            slabsCopy[i].slabFrom = fromValueForNewSlab; //Number(slabsCopy[i - 1].slabTo) + 0.01;
          }

          if (slabsCopy.length > 0) {
            slabsCopy[0].isDefault = true;
          }
          // Update the slab array within pricingDriver
          pricingDriverCopy[mainIndex].slab = slabsCopy;

          // Update the pricingDriver state with the modified array
          setPricingDriver(pricingDriverCopy);
        }
      }
    }
  };

  //Handle change slab
  // const OnSlabChange = (mainIndex, index, field, value) => {
  //   const updatedSlabs = [...pricingDriver];
  //   if (
  //     updatedSlabs[mainIndex] &&
  //     updatedSlabs[mainIndex].slab &&
  //     updatedSlabs[mainIndex].slab[index]
  //   ) {
  //     updatedSlabs[mainIndex].slab[index][field] = value;
  //     setPricingDriver(updatedSlabs);
  //   }
  //   const slabTypeFilter = slabType.find(
  //     (item) =>
  //       item.slabTypeId === pricingDriver[mainIndex].slab[index]?.slabTypeID
  //   );
  //   const slabTypeValue = slabTypeFilter
  //     ? { value: slabTypeFilter.slabTypeId, label: slabTypeFilter.slabTypeName }
  //     : null;
  //   SetSlabTypeVal(slabTypeValue);
  // };
  const OnSlabChange = (mainIndex, index, field, value) => {
    const updatedSlabs = [...pricingDriver];

    // Ensure the structure exists
    if (
      updatedSlabs[mainIndex] &&
      updatedSlabs[mainIndex].slab &&
      updatedSlabs[mainIndex].slab[index]
    ) {
      updatedSlabs[mainIndex].slab[index][field] = value;
    }

    if (field === "decimalPlaces") {
      const decimalPlaces = Number(value);

      const step = parseFloat(
        (1 / Math.pow(10, decimalPlaces)).toFixed(decimalPlaces),
      );

      // Format all existing slabs according to new decimal places
      updatedSlabs[mainIndex].slab = updatedSlabs[mainIndex].slab.map(
        (slab, i) => {
          const format = (num) => {
            if (num === "" || num === null || num === undefined) return "";
            const val =
              typeof num === "string" ? parseFloat(num.replace(/,/g, "")) : num;
            if (isNaN(val)) return "";
            return val.toFixed(decimalPlaces).toString();
          };

          const formattedSlab = {
            ...slab,
            slabFrom: format(slab.slabFrom),
            slabTo: format(slab.slabTo),
            decimalPlaces: decimalPlaces,
          };

          return formattedSlab;
        },
      );

      // Recalculate all slabFrom values based on previous slab's slabTo
      for (let i = 1; i < updatedSlabs[mainIndex].slab.length; i++) {
        const prevSlab = updatedSlabs[mainIndex].slab[i - 1];
        if (prevSlab.slabTo && prevSlab.slabTo !== "") {
          const prevTo = parseFloat(prevSlab.slabTo);
          if (!isNaN(prevTo)) {
            updatedSlabs[mainIndex].slab[i].slabFrom = (prevTo + step).toFixed(
              decimalPlaces,
            );
          }
        }
      }

      setPricingDriver(updatedSlabs);
      return;
    }

    // Handle slabTo changes - update next slab's slabFrom
    if (field === "slabTo") {
      const decimalPlaces = Number(
        updatedSlabs[mainIndex].slab[index].decimalPlaces ?? 2,
      );
      const step = parseFloat(
        (1 / Math.pow(10, decimalPlaces)).toFixed(decimalPlaces),
      );
      const numericTo = parseFloat(value);

      if (
        !isNaN(numericTo) &&
        index + 1 < updatedSlabs[mainIndex].slab.length
      ) {
        const nextSlabFrom = parseFloat(
          (numericTo + step).toFixed(decimalPlaces),
        );
        updatedSlabs[mainIndex].slab[index + 1].slabFrom =
          nextSlabFrom.toFixed(decimalPlaces);
      }
    }

    setPricingDriver(updatedSlabs);

    // Handle slab type selection
    const slabTypeFilter = slabType.find(
      (item) =>
        item.slabTypeId === updatedSlabs[mainIndex].slab[index]?.slabTypeID,
    );
    const slabTypeValue = slabTypeFilter
      ? { value: slabTypeFilter.slabTypeId, label: slabTypeFilter.slabTypeName }
      : null;
    SetSlabTypeVal(slabTypeValue);
  };

  const OnQuantityChange = (e, field, mainIndex) => {
    let rawValue = e;
    // Allow only digits and one dot
    rawValue = rawValue.replace(/[^0-9.]/g, "");

    // If multiple dots, keep only the first
    const firstDotIndex = rawValue.indexOf(".");
    if (firstDotIndex !== -1) {
      const beforeDot = rawValue.slice(0, firstDotIndex + 1);
      const afterDot = rawValue.slice(firstDotIndex + 1).replace(/\./g, "");
      rawValue = beforeDot + afterDot;
    }

    // Get allowed decimal places from quantity[0]
    const decimalPlaces =
      pricingDriver[mainIndex]?.quantity?.[0]?.quantityDecimalPlaces ?? 0;

    if (decimalPlaces === 0) {
      // No dot allowed
      rawValue = rawValue.replace(/\./g, "");
    } else {
      // Allow only first dot
      const parts = rawValue.split(".");
      rawValue = parts[0];
      if (parts.length > 1) {
        rawValue += "." + parts[1].replace(/\./g, "").slice(0, decimalPlaces);
      }
    }

    // Update
    const updatedDrivers = [...pricingDriver];
    const updatedQuantities = [...(updatedDrivers[mainIndex].quantity || [])];
    if (field === "to") {
      updatedQuantities[0] = {
        ...updatedQuantities[0],
        quantityTo: rawValue,
      };
    }
    if (field === "from") {
      updatedQuantities[0] = {
        ...updatedQuantities[0],
        quantityFrom: rawValue,
      };
    }
    updatedDrivers[mainIndex] = {
      ...updatedDrivers[mainIndex],
      quantity: updatedQuantities,
    };

    setPricingDriver(updatedDrivers);
  };

  const OnDecimalPlacesChange = (selectedOption, mainIndex) => {
    const newDecimalPlaces = selectedOption.value;
    const updatedDrivers = [...pricingDriver];
    const updatedQuantities = [...(updatedDrivers[mainIndex].quantity || [])];

    // Ensure quantity object exists
    if (!updatedQuantities[0]) {
      updatedQuantities[0] = {};
    }

    // Get current values
    const currentQuantityFrom = updatedQuantities[0].quantityFrom || "";
    const currentQuantityTo = updatedQuantities[0].quantityTo || "";

    // Update decimal places and format existing values
    updatedQuantities[0] = {
      ...updatedQuantities[0],
      quantityDecimalPlaces: newDecimalPlaces,
      quantityFrom: formatQuantityValue(currentQuantityFrom, newDecimalPlaces),
      quantityTo: formatQuantityValue(currentQuantityTo, newDecimalPlaces),
    };

    updatedDrivers[mainIndex] = {
      ...updatedDrivers[mainIndex],
      quantity: updatedQuantities,
    };

    setPricingDriver(updatedDrivers);
  };

  //   const updatedDrivers = [...pricingDriver];

  //   // 1. Fix decimal places handling
  //   if (field === "decimalPlaces") {
  //     const decimalPlaces = Number(value);

  //     // Update driver-level decimal setting
  //     updatedDrivers[mainIndex].decimalPlaces = decimalPlaces;

  //     // Format existing values without converting to strings
  //     updatedDrivers[mainIndex].slab = updatedDrivers[mainIndex].slab.map(slab => ({
  //       ...slab,
  //       slabFrom: formatNumber(slab.slabFrom, decimalPlaces),
  //       slabTo: formatNumber(slab.slabTo, decimalPlaces),
  //       slabValue: formatNumber(slab.slabValue, decimalPlaces)
  //     }));

  //     setPricingDriver(updatedDrivers);
  //     return;
  //   }

  //   // 2. Preserve existing slab update logic with number fix
  //   if (updatedDrivers[mainIndex]?.slab?.[index]) {
  //     const decimalPlaces = updatedDrivers[mainIndex].decimalPlaces || 2;

  //     // Update value with proper decimal handling
  //     updatedDrivers[mainIndex].slab[index][field] = formatNumber(value, decimalPlaces);

  //     // 3. Add auto-update for next slab's from value
  //     if (field === "slabTo" && index < updatedDrivers[mainIndex].slab.length - 1) {
  //       const step = 1 / Math.pow(10, decimalPlaces);
  //       updatedDrivers[mainIndex].slab[index + 1].slabFrom =
  //         formatNumber(Number(value) + step, decimalPlaces);
  //     }
  //   }

  //   // Keep existing slab type logic
  //   const slabTypeFilter = slabType.find(
  //     item => item.slabTypeId === updatedDrivers[mainIndex].slab[index]?.slabTypeID
  //   );
  //   SetSlabTypeVal(slabTypeFilter ? {
  //     value: slabTypeFilter.slabTypeId,
  //     label: slabTypeFilter.slabTypeName
  //   } : null);

  //   setPricingDriver(updatedDrivers);
  // };

  //Slab Radio Change
  function OnSlabsRadioChange(mainIndex, selectedIndex) {
    const updatedPricingDriver = [...pricingDriver]; // Create a copy of the state array
    updatedPricingDriver[mainIndex].slab.forEach((slab, index) => {
      // Update the isDefault property based on the selectedIndex
      slab.isDefault = index === selectedIndex;
    });

    // Update the state with the modified array
    setPricingDriver(updatedPricingDriver);
  }

  // Add slab
  // const OnAddSlab = (mainIndex) => {
  //   const pricingDriverCopy = pricingDriver[mainIndex];
  //   var fromValueForNewSlab =
  //     Number(
  //       pricingDriver[mainIndex].slab[pricingDriver[mainIndex].slab.length - 1]
  //         ?.slabTo
  //     ) + 0.01;
  //   fromValueForNewSlab = Math.round(fromValueForNewSlab * 100) / 100;
  //   setCount(count + 1);
  //   const newSlabs = {
  //     slabKeyID: null,
  //     slabTypeID: "",
  //     parentSlabKeyID: null,
  //     slabTypeName: null,
  //     slabValue: "",
  //     slabFrom:
  //       pricingDriver[mainIndex]?.slab.length === 0 ? 0 : fromValueForNewSlab, //Number( pricingDriver[mainIndex].slab[pricingDriver[mainIndex].slab.length - 1].slabTo) + 0.01,
  //     slabTo: pricingDriver[mainIndex]?.slab.length === 0 ? 0 : "",
  //     isDefault: pricingDriver[mainIndex]?.slab.length === 0 ? true : false,
  //   };

  //   if (pricingDriverCopy?.slab?.length > 0) {
  //     if (pricingDriverCopy?.slab?.length === 0) {
  //       setGdriverError({ slabError: true });
  //       return false;
  //     } else if (
  //       pricingDriver[mainIndex]?.slab[
  //         pricingDriverCopy?.slab?.length - 1
  //       ].slabTypeID === ""
  //     ) {
  //       setGdriverError({ slabtypeError: true });
  //       return false;
  //     } else if (
  //       pricingDriver[mainIndex]?.slab[
  //         pricingDriverCopy?.slab?.length - 1
  //       ].slabValue === "" ||
  //       pricingDriver[mainIndex]?.slab[
  //         pricingDriverCopy?.slab.length - 1
  //       ].slabFrom === "" ||
  //       pricingDriver[mainIndex]?.slab[
  //         pricingDriverCopy?.slab?.length - 1
  //       ].slabTo === ""
  //     ) {
  //       setGdriverError({ slabtypevalueError: true });
  //       return false;
  //     } else if (
  //       parseFloat(
  //         pricingDriver[mainIndex]?.slab[
  //           pricingDriverCopy.slab.length - 1
  //         ]?.slabTo
  //       ) <
  //       parseFloat(
  //         pricingDriver[mainIndex]?.slab[
  //           pricingDriverCopy.slab.length - 1
  //         ]?.slabFrom
  //       )
  //     ) {
  //       setGdriverError({ slabToMinValue: true });
  //       return false;
  //     } else {
  //       setGdriverError({ slabError: false });
  //       setGdriverError({ slabtypeError: false });
  //       setGdriverError({ slabtypevalueError: false });
  //       setGdriverError({ slabToMinValue: false });
  //       pricingDriver[mainIndex].slab.push(newSlabs);
  //     }
  //   } else {
  //     setGdriverError({ slabError: false });
  //     setGdriverError({ slabtypeError: false });
  //     setGdriverError({ slabtypevalueError: false });
  //     setGdriverError({ slabToMinValue: false });
  //     pricingDriver[mainIndex].slab.push(newSlabs);
  //   }
  //   setTimeout(function () {
  //     scrollUpDownByElementID(
  //       `SlabDiv_${pricingDriver.length - 1}${pricingDriver[mainIndex].slab.length - 1
  //       }`
  //     );
  //   }, 200);
  // };
  const OnAddSlab = (mainIndex) => {
    const pricingDriverCopy = pricingDriver[mainIndex];

    // Get the decimal places for this driver (default to 2 if not set)
    const decimalPlaces = Number(
      pricingDriver[mainIndex]?.slab?.[0]?.decimalPlaces ?? 2,
    );

    // Calculate the step based on decimal places
    const step = parseFloat(
      (1 / Math.pow(10, decimalPlaces)).toFixed(decimalPlaces),
    );

    // Calculate fromValueForNewSlab based on decimal places
    let fromValueForNewSlab;
    if (pricingDriver[mainIndex]?.slab.length === 0) {
      fromValueForNewSlab = (0).toFixed(decimalPlaces);
    } else {
      const lastSlabTo =
        pricingDriver[mainIndex].slab[pricingDriver[mainIndex].slab.length - 1]
          ?.slabTo;
      if (lastSlabTo && lastSlabTo !== "" && !isNaN(parseFloat(lastSlabTo))) {
        const lastToValue = parseFloat(lastSlabTo);
        fromValueForNewSlab = (lastToValue + step).toFixed(decimalPlaces);
      } else {
        fromValueForNewSlab = (0).toFixed(decimalPlaces);
      }
    }

    setCount(count + 1);

    const newSlabs = {
      slabKeyID: null,
      slabTypeID: "",
      decimalPlaces: decimalPlaces,
      parentSlabKeyID: null,
      slabTypeName: null,
      slabValue: "",
      slabFrom:
        pricingDriver[mainIndex]?.slab.length === 0
          ? (0).toFixed(decimalPlaces)
          : fromValueForNewSlab,
      slabTo:
        pricingDriver[mainIndex]?.slab.length === 0
          ? (0).toFixed(decimalPlaces)
          : (0).toFixed(decimalPlaces),
      isDefault: pricingDriver[mainIndex]?.slab.length === 0 ? true : false,
    };

    if (pricingDriverCopy?.slab?.length > 0) {
      if (pricingDriverCopy?.slab?.length === 0) {
        setGdriverError({ slabError: true });
        return false;
      } else if (
        pricingDriver[mainIndex]?.slab[pricingDriverCopy?.slab?.length - 1]
          .slabTypeID === ""
      ) {
        setGdriverError({ slabtypeError: true });
        return false;
      } else if (
        pricingDriver[mainIndex]?.slab[pricingDriverCopy?.slab?.length - 1]
          .slabValue === "" ||
        pricingDriver[mainIndex]?.slab[pricingDriverCopy?.slab.length - 1]
          .slabFrom === "" ||
        pricingDriver[mainIndex]?.slab[pricingDriverCopy?.slab?.length - 1]
          .slabTo === ""
      ) {
        setGdriverError({ slabtypevalueError: true });
        return false;
      } else if (
        parseFloat(
          pricingDriver[mainIndex]?.slab[pricingDriverCopy.slab.length - 1]
            ?.slabTo,
        ) <
        parseFloat(
          pricingDriver[mainIndex]?.slab[pricingDriverCopy.slab.length - 1]
            ?.slabFrom,
        )
      ) {
        setGdriverError({ slabToMinValue: true });
        return false;
      } else {
        setGdriverError({ slabError: false });
        setGdriverError({ slabtypeError: false });
        setGdriverError({ slabtypevalueError: false });
        setGdriverError({ slabToMinValue: false });

        // Create a copy of the pricingDriver array and update it properly
        const updatedPricingDriver = [...pricingDriver];
        updatedPricingDriver[mainIndex].slab.push(newSlabs);
        setPricingDriver(updatedPricingDriver);
      }
    } else {
      setGdriverError({ slabError: false });
      setGdriverError({ slabtypeError: false });
      setGdriverError({ slabtypevalueError: false });
      setGdriverError({ slabToMinValue: false });

      // Create a copy of the pricingDriver array and update it properly
      const updatedPricingDriver = [...pricingDriver];
      updatedPricingDriver[mainIndex].slab.push(newSlabs);
      setPricingDriver(updatedPricingDriver);
    }

    setTimeout(function () {
      scrollUpDownByElementID(
        `SlabDiv_${pricingDriver.length - 1}${pricingDriver[mainIndex].slab.length - 1}`,
      );
    }, 200);
  };

  // Handle Delete
  const handleDeleteClick = (item) => {
    const updatedGlobalPricingDrivers = [...globalPricingDrivers];
    const itemIndex = updatedGlobalPricingDrivers.findIndex(
      (globalPricingDriver) =>
        globalPricingDriver.globalPricingDriverID ===
        item.globalPricingDriverID,
    );
    if (itemIndex !== -1) {
      updatedGlobalPricingDrivers.splice(itemIndex, 1);
      setGlobalPricingDrivers(updatedGlobalPricingDrivers);
    }
  };

  // Handle Delete Fee Inflation
  const handleDeleteFeeInflation = (serviceID, inflationIndex) => {
    const inflationToken = `feeInflation(${inflationIndex})`;

    if (EditPricingFormulaValue?.includes(inflationToken)) {
      setModelRequestData({
        ...modelRequestData,
        Action: "ServiceFeeInflation",
        message: `Fee Inflation ${inflationIndex} is currently being used in the Pricing Formula. Please remove it from the formula before deleting.`,
      });
      $("#DeleteDriverModel").modal("show");
      return;
    }

    // Store what needs to be deleted, don't call API yet
    setPendingInflationDelete({
      serviceID,
      inflationIndex,
      remainingAfterDelete:
        (servicesObj?.serviceFeeInflationList?.length || 0) - 1,
    });

    setModelRequestData({
      ...modelRequestData,
      Action: "FeeInflationWarning",
      message: "Are you sure you want to delete this Fee Inflation?",
    });
    $("#ConfirmModel").modal("show");
  };

  const handleConfirmAction = () => {
    if (modelRequestData.Action === "FeeInflationWarning") {
      if (pendingInflationDelete) {
        DeleteServiceFeeInflationData(
          pendingInflationDelete.serviceID,
          pendingInflationDelete.inflationIndex,
          pendingInflationDelete.remainingAfterDelete,
        );
        setPendingInflationDelete(null);
      }
      return;
    }
    // existing confirm logic
    GlobalPricingDriverAddUpdateBtnClicked(ServiceHeader.FeeInflation);
  };

  const DeleteServiceFeeInflationData = async (
    serviceID,
    inflationIndex,
    remainingAfterDelete,
  ) => {
    try {
      setLoader(true);
      const response = await DeleteServiceFeeInflation(
        serviceID,
        inflationIndex,
      );
      if (response?.data?.statusCode === 200) {
        setLoader(false);
        setServicesObj((prev) => ({
          ...prev,
          serviceFeeInflationList: (prev.serviceFeeInflationList || []).filter(
            (x) => x.inflationIndex !== inflationIndex,
          ),
        }));

        $("#ConfirmModel").one("hidden.bs.modal", () => {
          setModelAction("DeleteFeeInflation");
          setOpenSuccessModal(true);
          if (remainingAfterDelete <= 0) {
            setActiveTab(ServiceHeader.PricingFormula);
          }
        });
        $("#ConfirmModel").modal("hide");
        setModelRequestData((prev) => ({ ...prev, Action: null, message: "" }));
      } else {
        setErrorMessage(response?.data?.errorMessage);
      }
    } catch (error) {
      console.error(error);
      setLoader(false);
    }
  };
  const findDriverTypeID = pricingDriver?.filter((i) => i.driverTypeID === 3);

  // E] Sorting & handle Function
  let parseFormula;
  const handleChange = (e, eventName) => {
    console.log("eventName", eventName);
    console.log("tags", e?.detail?.tagify?.value);
    // debugger
    // console.log("eventName : ", eventName)
    setPricingFormulaError("");
    let isValidFormula = true;
    const TagTextContent = e?.detail?.tagify?.value;
    if (TagTextContent === "" || TagTextContent.length === 0) {
      isValidFormula = false;
    }

    // let GetKey = e.detail.tagify.state.lastOriginalValueReported
    //   ?.split(" ")
    //   ?.join("");

    // let GetKey2 = e.detail.tagify.state.lastOriginalValueReported
    // let GetKey = e.detail.textContent
    //   ?.split(" ")
    //   ?.join("");
    let modifiedValue = e.detail.tagify.state.lastOriginalValueReported;
    if (eventName === "Input") {
      modifiedValue = e.detail.textContent;
    }
    if (modifiedValue === undefined) {
      modifiedValue = "";
    }
    // else if(eventName === "remove")
    // {
    //   modifiedValue = e.detail.tagify.state.lastOriginalValueReported
    // }
    let GetKey = modifiedValue?.split(" ")?.join("");

    if (isValidFormula) {
      const regex = /"key":"var(.+?)"/gm;
      let m;
      let driverCodes = [];
      while ((m = regex.exec(GetKey)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }
        isValidFormula =
          driverCodes.includes(m[1]) ||
          globalConstantList.map((item) => item._id).includes(m[1]) ||
          globalConstantList.map((item) => item._id).includes(m[1]);
      }
    }

    if (isValidFormula) {
      GetKey = GetKey.split(" ").join("");
      GetKey = GetKey.split("[[{").join(" _[[{_").split("}]]").join("_}]]_ ");
      let formulaParse = GetKey.split(" ");
      formulaParse = formulaParse.filter((elem) => elem != "");
      formulaParse = formulaParse.map((elem) => elem.trim());
      formulaParse = formulaParse.filter((elem) => elem !== "");
      // const GetKeyId = TagTextContent.map((i) =>
      //   i.key === null ? i.tempId : i.key
      // );
      const FormulaTags = [...TagTextContent];

      parseFormula = GetKey;
      // Replace placeholders with GetKeyId values
      while (
        parseFormula.indexOf("_[[{_") >= 0 &&
        parseFormula.indexOf("_}]]_") > 0
      ) {
        const startIndex = parseFormula.indexOf("_[[{_");
        const endIndex = parseFormula.indexOf("_}]]_") + 5;
        const placeholder = parseFormula.substring(startIndex, endIndex);
        // const keyId = GetKeyId.shift(); // Get and remove the first keyId from the array
        const tag = FormulaTags.shift();
        // const isKeyIdInteger = Number.isInteger(keyId);

        // let KeyFormat = null;
        // if (isKeyIdInteger) {
        //   KeyFormat = `var("${keyId}")`;
        // } else {
        //   KeyFormat = `var${keyId}`;
        // }
        let KeyFormat = null;
        if (!tag) break;
        if (tag.type === "Inflation") {
          KeyFormat = `${tag.operator} feeInflation(${tag.key})`;
        } else {
          const keyId = tag.key === null ? tag.tempId : tag.key;

          const isKeyIdInteger = Number.isInteger(keyId);

          if (isKeyIdInteger) {
            KeyFormat = `var("${keyId}")`;
          } else {
            KeyFormat = `var${keyId}`;
          }
        }
        parseFormula = parseFormula.replace(
          placeholder,
          " " + KeyFormat.replace(/\\/g, "") + " ",
        );
        parseFormula = parseFormula.replace("varUndefined", "");
      }
    } else {
      parseFormula = GetKey;
      while (
        parseFormula.indexOf("[[{") >= 0 &&
        parseFormula.indexOf("}]]") > 0
      ) {
        const startIndex = parseFormula.indexOf("[[{");
        const endIndex = parseFormula.indexOf("}]]") + 5;
        const placeholder = parseFormula.substring(startIndex, endIndex);
        //const keyId = GetKeyId.shift(); // Get and remove the first keyId from the array
        //const isKeyIdInteger = Number.isInteger(keyId);
        parseFormula = parseFormula.replace(placeholder, "");
      }
    }

    const selectedGlobalConstant = e.detail.tagify.value
      .filter((item) => item.type !== "Inflation")
      .map((item) => ({
        globalPricingDriverKeyID: item.key,
        temp_GlobalPricingDriverID_ForDependancy: item.tempId,
      }));

    // setServicesObj({
    //   ...servicesObj,
    //   pricingFormulaGlobalPricingDriverList: selectedGlobalConstant,
    //   pricingFormula: parseFormula,
    // });
    if (parseFormula === undefined) {
      if (e.detail.value === undefined) {
        // setEditPricingFormulaValue(
        //   e.detail.tagify.state.lastOriginalValueReported
        // );

        TagTextContent.forEach((tag) => {
          const isKeyIdInteger = Number.isInteger(
            tag.key == null ? tag.tempId : tag.key,
          );
          let KeyFormat = null;
          if (isKeyIdInteger) {
            KeyFormat = `var("${tag.tempId}")`;
          } else {
            KeyFormat = `var${tag.key}`;
          }
          modifiedValue = modifiedValue.replace(
            tag.value,
            " " + KeyFormat + " ",
          );
          modifiedValue = modifiedValue.replace("varUndefined", "");
        });

        setEditPricingFormulaValue(modifiedValue);
        setServicesObj({
          ...servicesObj,
          pricingFormulaGlobalPricingDriverList: selectedGlobalConstant,
          // pricingFormula: e.detail.tagify.state.lastOriginalValueReported,
        });
      } else {
        setEditPricingFormulaValue(e.detail.value);
        setServicesObj({
          ...servicesObj,
          pricingFormulaGlobalPricingDriverList: selectedGlobalConstant,
          // pricingFormula: e.detail.value,
        });
      }
    } else {
      console.log(parseFormula);
      TagTextContent.forEach((tag) => {
        // if (tag.type === "Inflation") {

        //   parseFormula = parseFormula.replace(
        //     tag.value,
        //     `feeInflation(${tag.inflationIndex})`
        //   );

        //   return;
        // }
        const isKeyIdInteger = Number.isInteger(
          tag.key == null ? tag.tempId : tag.key,
        );
        let KeyFormat = null;
        if (isKeyIdInteger) {
          KeyFormat = `var("${tag.tempId}")`;
        } else {
          KeyFormat = `var${tag.key}`;
        }
        parseFormula = parseFormula.replace(tag.value, " " + KeyFormat + " ");
        parseFormula = parseFormula.replace("varUndefined", "");
      });
      console.log("parseFormula", parseFormula);
      setEditPricingFormulaValue(parseFormula);
      setServicesObj({
        ...servicesObj,
        pricingFormulaGlobalPricingDriverList: selectedGlobalConstant,
        // pricingFormula: parseFormula,
      });
    }
  };

  // handle valid Pricing Formula
  const isValidPricingFormula = (pricingFormula) => {
    const cleanedFormula = pricingFormula.replace(/[^\x20-\x7E]/g, "");
    const trimmedFormula = cleanedFormula.trim();

    // Define a constant value to replace variables for validation
    const constantValue = 1;

    // Replace variables with the constant value
    // const formulaToEvaluate = trimmedFormula.replace(
    //   /var\("[^"]+"\)|var[0-9A-Fa-f-]+/g,
    //   constantValue
    // );
    const formulaToEvaluate = trimmedFormula
      .replace(/var\("[^"]+"\)|var[0-9A-Fa-f-]+/g, "(1)")
      .replace(/feeInflation\(\d+\)/g, "(1)");

    try {
      // Attempt to evaluate the formula using eval()
      // If there's a syntax error, it's an invalid formula

      eval(formulaToEvaluate);
      setPricingFormulaError("");
      return true;
    } catch (error) {
      setPricingFormulaError("Please enter a valid Pricing Formula.");
      return false;
    }
  };

  const parseStoredDate = (dateStr, formatStr) => {
    if (!dateStr) return null;
    try {
      const parsed = parse(dateStr, formatStr, new Date());
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };

  // 2. Format Date object back to string using selected format
  const formatToDisplay = (date, formatStr) => {
    if (!isValid(date)) return "";
    return format(date, formatStr);
  };
  const showFeeInflationTab = servicesObj?.serviceFeeInflationList?.length > 0;

  const getStepNumber = (tabValue) => {
    if (tabValue === ServiceHeader.FeeInflation) {
      return showFeeInflationTab ? 4 : null;
    }

    if (tabValue === ServiceHeader.PricingFormula) {
      return showFeeInflationTab ? 5 : 4;
    }

    return tabValue;
  };

  // Handle Tab Change
  const handleChangeTab = (newTab, clickedTabID) => {
    setserviceError({
      ...serviceError,
      pricingFormula: false,
    });
    let clickedTabClasses = $("#" + clickedTabID).attr("class");
    if (clickedTabClasses.includes("disabled")) {
      return false;
    }
    if (newTab <= activeTab) {
      setActiveTab(newTab);
    } else {
      GlobalPricingDriverAddUpdateBtnClicked(newTab);
    }
  };

  // Handle close
  const handleClose = () => {
    $("#" + "ConfirmModel").modal("hide");
    $("#" + "RecordsAvailablePopupModel").modal("hide");
    $("#" + "ConfirmSAChangesModel").modal("hide");
    setOpenSuccessModal(false);
    setOpenErrorModal(false);
    setIsDriverDelete(false);
  };

  const DeclineSuperAdminChangesData = async (Decline) => {
    if (Decline === "Decline") {
      // $('#' + props.id).modal('hide')

      setStatus(false);
      $("#" + "ConfirmSAChangesModel").modal("show");
      return;
    }
    setLoader(true);
    try {
      const apiRequestParams = {
        organisationKeyID: common.organisationKeyID,
        userKeyID: common.userKeyID,
        moduleKeyID: servicesObj.serviceKeyID,
        moduleName: "Predefined-Service",
        //Predefined-ServiceCategory, Predefined-GlobalConstant, Predefined-GlobalPricingDriver,
        //Predefined-PL-EL-Template, Predefined-TnC-Template, Predefined-Email-Template,
        //Predefined-Service, Predefined-ServicePackage
      };
      const response = await DeclineSuperAdminChanges(apiRequestParams);
      if (response) {
        setLoader(false);
        if (response?.data?.statusCode === 200) {
          if (apiRequestParams.Action === null) {
            $("#" + "ConfirmSAChangesModel").modal("hide");
            navigate("/services");
            // setOpenSuccessModal(true);
            props.setIsAddUpdateActionDone(true);
          } else {
            $("#" + "ConfirmSAChangesModel").modal("hide");
            navigate("/services");
            // setOpenSuccessModal(true);
            props.setIsAddUpdateActionDone(true);
          }
        } else {
          setOpenErrorModal(true);
          setIsDeclined(true);
          setErrorMessage(response?.response?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleConfirmButton = () => {
    $("#" + "ConfirmSAChangesModel").modal("hide");
    if (Status) {
      if (servicesObj.pricingTypeID !== 2) {
        GlobalPricingDriverAddUpdateBtnClicked("create service", true);
      } else {
        GlobalPricingDriverAddUpdateBtnClicked(
          "GetConfirmationBeforeSaveForGPD",
          true,
        );
      }
    } else {
      DeclineSuperAdminChangesData();
    }
  };
  return (
    <div>
      <div className="container-fluid">
        <div className="new-item-page-content">
          <div className="row form-row">
            <div className="col-lg-12">
              <div className="container ">
                <h3 className="modal-title">
                  <BackButtonSvg onClick={handleCancelButton} />
                  {modelAction === "Add"
                    ? getCrudPopUpTitleName("Add", moduleName)
                    : getCrudPopUpTitleName("Update", moduleName)}
                  {modelAction !== "Add" ? ` : ` : ""}
                  {isMobile
                    ? saveLocationState.serviceName !== null &&
                      saveLocationState.serviceName?.length > 10
                      ? ` ${saveLocationState.serviceName.substring(0, 10)}...`
                      : saveLocationState.serviceName
                    : saveLocationState.serviceName?.length > 35
                      ? `${saveLocationState.serviceName.substring(0, 35)}...`
                      : saveLocationState.serviceName}
                </h3>
              </div>
              <div
                className="steps overflow-auto"
                style={{ pointerEvents: "all" }}
              >
                <ul className="steps-list">
                  <li>
                    <div
                      id="ServiceBasicInformation"
                      onClick={() =>
                        handleChangeTab(1, "ServiceBasicInformation")
                      }
                      className={`${
                        activeTab === ServiceHeader.BasicInformation
                          ? "step tab-field-center"
                          : activeTabForm.activeBasicInformationForm === true
                            ? "step tab-field-center"
                            : "step disabled cursor-not-allowed tab-field-center"
                      } w-90`}
                    >
                      <span className="stepCount">1</span>
                      <span className="stepTitle">Basic Information</span>
                      &nbsp;
                      {activeTab == ServiceHeader.BasicInformation &&
                        (serviceError.basicInformationError ||
                          serviceError.priceError) && (
                          <span className="validation">
                            <InvalidFormIcon />
                          </span>
                        )}
                    </div>
                  </li>
                  <li>
                    <div
                      id="ServiceDescription"
                      onClick={() => handleChangeTab(2, "ServiceDescription")}
                      className={`${
                        activeTab === ServiceHeader.Description
                          ? "step tab-field-center"
                          : activeTabForm.activeBasicInformationForm === true
                            ? "step tab-field-center"
                            : "step disabled cursor-not-allowed tab-field-center"
                      } w-90`}
                    >
                      <span className="stepCount">2</span>
                      <span className="stepTitle">Description</span>
                    </div>
                  </li>
                  {servicesObj.pricingTypeID === 2 && (
                    <>
                      <li>
                        <div
                          id="ServicePricingDriver"
                          onClick={() =>
                            handleChangeTab(3, "ServicePricingDriver")
                          }
                          className={`${
                            activeTab == ServiceHeader.PricingDrivers
                              ? "step tab-field-center"
                              : activeTabForm.activeDescriptionForm === true
                                ? "step tab-field-center"
                                : "step disabled cursor-not-allowed tab-field-center"
                          } w-90`}
                        >
                          <span className="stepCount">3</span>
                          <span className="stepTitle">Pricing Drivers</span>
                          &nbsp;
                          {activeTab == ServiceHeader.PricingDrivers &&
                            (gdrivererror.pfError ||
                              gdrivererror.slabError ||
                              gdrivererror.drivernameError ||
                              gdrivererror.variationError ||
                              gdrivererror.drivertypeError ||
                              gdrivererror.textValueError ||
                              gdrivererror.textLengthError ||
                              gdrivererror.dateValueError ||
                              gdrivererror.variationnameError ||
                              gdrivererror.variationvalueError ||
                              gdrivererror.slabtypeError ||
                              gdrivererror.slabtypevalueError ||
                              gdrivererror.slabtypefromError ||
                              gdrivererror.slabTypeToError ||
                              gdrivererror.slabToMinValue ||
                              gdrivererror.SelectDriver ||
                              gdrivererror.SelectVariation ||
                              gdrivererror.slabTypeID) && (
                              <span className="validation">
                                <InvalidFormIcon />
                              </span>
                            )}
                        </div>
                      </li>
                      {servicesObj?.serviceFeeInflationList?.length > 0 && (
                        <li>
                          <div
                            id="ServiceFeeInflation"
                            onClick={() =>
                              handleChangeTab(4, "ServiceFeeInflation")
                            }
                            className={`${
                              activeTab == ServiceHeader.FeeInflation
                                ? "step tab-field-center"
                                : activeTabForm.activePricingDrivers === true
                                  ? "step tab-field-center"
                                  : "step disabled cursor-not-allowed tab-field-center"
                            } w-90`}
                          >
                            <span className="stepCount">
                              {getStepNumber(ServiceHeader.FeeInflation)}
                            </span>
                            <span className="stepTitle">Fee Inflation</span>
                          </div>
                        </li>
                      )}
                      <li>
                        <div
                          id="ServicePricingFormula"
                          onClick={() =>
                            handleChangeTab(5, "ServicePricingFormula")
                          }
                          className={`${
                            activeTab === ServiceHeader.PricingFormula
                              ? "step tab-field-center"
                              : activeTabForm.activePricingDrivers === true
                                ? "step tab-field-center"
                                : "step disabled cursor-not-allowed tab-field-center"
                          } w-90`}
                        >
                          <span className="stepCount">
                            {getStepNumber(ServiceHeader.PricingFormula)}
                          </span>
                          <span className="stepTitle">Pricing Formula</span>
                          {activeTab == ServiceHeader.PricingFormula &&
                            serviceError.pricingFormula && (
                              <span className="validation">
                                <InvalidFormIcon />
                              </span>
                            )}
                        </div>
                      </li>
                    </>
                  )}
                </ul>
              </div>
              {activeTab === ServiceHeader.BasicInformation && (
                <BasicInformationComponent
                  servicesObj={servicesObj}
                  isDropdownEnabled={isDropdownEnabled}
                  setIsDropdownEnabled={setIsDropdownEnabled}
                  ServiceDependencyList={ServiceDependencyList}
                  setServiceDependencyList={setServiceDependencyList}
                  OnServiceDependencyChange={OnServiceDependencyChange}
                  ServiceDependencyLookupList={ServiceDependencyLookupList}
                  ServiceDependencyValue={ServiceDependencyValue}
                  setModelRequestData={setModelRequestData}
                  modelRequestData={modelRequestData}
                  setServicesObj={setServicesObj}
                  errorMessage={errorMessage}
                  setErrorMessage={setErrorMessage}
                  openErrorModal={openErrorModal}
                  setOpenErrorModal={setOpenErrorModal}
                  setIsDriverDelete={setIsDriverDelete}
                  setserviceError={setserviceError}
                  setPricingDriver={setPricingDriver}
                  pricingTypeList={pricingTypeList}
                  common={common}
                  setLoader={setLoader}
                  pricingDriver={pricingDriver}
                  OnNOBChange={OnNOBChange}
                  NOBTypeValue={NOBTypeValue}
                  OnClientTypeChange={OnClientTypeChange}
                  ClientTypeValue={ClientTypeValue}
                  professionTypeInputValue={professionTypeInputValue}
                  ProfessionalTypeLookeupListOptions={
                    ProfessionalTypeLookeupListOptions
                  }
                  moduleName={moduleName}
                  NatureOfBusinessTypeLookupList={
                    NatureOfBusinessTypeLookupList
                  }
                  getCrudButtonTextName={getCrudButtonTextName}
                  getCrudPopUpTitleName={getCrudPopUpTitleName}
                  prospectName={prospectName}
                  setNatureOfBusinessTypeLookupList={
                    setNatureOfBusinessTypeLookupList
                  }
                  BusinessTypeLookupList={BusinessTypeLookupList}
                  ProfessionTypeValue={ProfessionTypeValue}
                  OnProfessionTypeChange={OnProfessionTypeChange}
                  serviceError={serviceError}
                  ServiceCategoryLookeupListOptions={
                    ServiceCategoryLookeupListOptions
                  }
                  DeclineSuperAdminChangesData={DeclineSuperAdminChangesData}
                  handleBackButton={handleBackButton}
                  ServiceCategoryValue={ServiceCategoryValue}
                  OnServiceCategoryChange={OnServiceCategoryChange}
                  ServiceCategoryAddBtnClicked={ServiceCategoryAddBtnClicked}
                  serviceChargeTypeList={serviceChargeTypeList}
                  handleCancelButton={handleCancelButton}
                  GlobalPricingDriverAddUpdateBtnClicked={
                    GlobalPricingDriverAddUpdateBtnClicked
                  }
                />
              )}
              {activeTab === ServiceHeader.Description && (
                <DescriptionComponent
                  modelAction={modelAction}
                  setActiveTab={setActiveTab}
                  servicesObj={servicesObj}
                  setServicesObj={setServicesObj}
                  pricingTypeList={pricingTypeList}
                  common={common}
                  moduleName={moduleName}
                  ProfessionalTypeLookeupListOptions={
                    ProfessionalTypeLookeupListOptions
                  }
                  getCrudButtonTextName={getCrudButtonTextName}
                  getCrudPopUpTitleName={getCrudPopUpTitleName}
                  ProfessionTypeValue={ProfessionTypeValue}
                  OnProfessionTypeChange={OnProfessionTypeChange}
                  serviceError={serviceError}
                  ServiceCategoryLookeupListOptions={
                    ServiceCategoryLookeupListOptions
                  }
                  DeclineSuperAdminChangesData={DeclineSuperAdminChangesData}
                  modelRequestData={location.state}
                  errorMessage={errorMessage}
                  handleBackButton={handleBackButton}
                  ServiceCategoryValue={ServiceCategoryValue}
                  OnServiceCategoryChange={OnServiceCategoryChange}
                  ServiceCategoryAddBtnClicked={ServiceCategoryAddBtnClicked}
                  serviceChargeTypeList={serviceChargeTypeList}
                  handleCancelButton={handleCancelButton}
                  GlobalPricingDriverAddUpdateBtnClicked={
                    GlobalPricingDriverAddUpdateBtnClicked
                  }
                />
              )}
              {activeTab === ServiceHeader.PricingDrivers && (
                <PricingDriversComponent
                  servicesObj={servicesObj}
                  setModelRequestData={setModelRequestData}
                  modelRequestData={modelRequestData}
                  handleDeleteFeeInflation={handleDeleteFeeInflation}
                  setOpenErrorModal={setOpenErrorModal}
                  setIsDriverDelete={setIsDriverDelete}
                  setActiveTab={setActiveTab}
                  setPricingDriver={setPricingDriver}
                  driverTypeValue1={driverTypeValue1}
                  setOpenSuccessModal={setOpenSuccessModal}
                  OnAddSlab={OnAddSlab}
                  slabTypeVal={slabTypeVal}
                  OnDateRadioChange={OnDateRadioChange}
                  moduleName={moduleName}
                  OnVariationsRadioChange={OnVariationsRadioChange}
                  OnDeleteVariations={OnDeleteVariations}
                  globalPricingDrivers={globalPricingDrivers}
                  OnShowGPD={OnShowGPD}
                  GlobalPricingDriverEditBtnClicked={
                    GlobalPricingDriverEditBtnClicked
                  }
                  DeclineSuperAdminChangesData={DeclineSuperAdminChangesData}
                  // modelRequestData={location.state}
                  getCrudButtonTextName={getCrudButtonTextName}
                  getCrudPopUpTitleName={getCrudPopUpTitleName}
                  setErrorMessage={setErrorMessage}
                  setGDriverError={setGdriverError}
                  parseStoredDate={parseStoredDate}
                  formatToDisplay={formatToDisplay}
                  setDisable={setDisable}
                  handleDeleteClick={handleDeleteClick}
                  addGBP={addGBP}
                  pricingDriver={pricingDriver}
                  OnDeletePricingDriver={OnDeletePricingDriver}
                  OnPricingDriverChange={OnPricingDriverChange}
                  gdrivererror={gdrivererror}
                  findDriverTypeID={findDriverTypeID}
                  setTitle={setTitle}
                  handleCancelButton={handleCancelButton}
                  GlobalPricingDriverAddUpdateBtnClicked={
                    GlobalPricingDriverAddUpdateBtnClicked
                  }
                  handleBackButton={handleBackButton}
                  scrollUptoCurrentPosition={scrollUptoCurrentPosition}
                  setErrorMessageTitle={setErrorMessageTitle}
                  OnAdd={OnAdd}
                  OnSlabsRadioChange={OnSlabsRadioChange}
                  OnSlabChange={OnSlabChange}
                  OnQuantityChange={OnQuantityChange}
                  OnDecimalPlacesChange={OnDecimalPlacesChange}
                  slabType={slabType}
                  OnAddVariations={OnAddVariations}
                  DriverTypeValue={DriverTypeValue}
                  OnDriverTypeChange={OnDriverTypeChange}
                  OnVariationChange={OnVariationChange}
                  OnDeleteSlabs={OnDeleteSlabs}
                  OnDependantOnDriver={OnDependantOnDriver}
                />
              )}
              {servicesObj?.serviceFeeInflationList?.length > 0 &&
                activeTab === ServiceHeader.FeeInflation && (
                  <FeeInflationTab
                    servicesObj={servicesObj}
                    handleDeleteFeeInflation={handleDeleteFeeInflation}
                    handleBackButton={handleBackButton}
                    handleCancelButton={handleCancelButton}
                    GlobalPricingDriverAddUpdateBtnClicked={
                      GlobalPricingDriverAddUpdateBtnClicked
                    }
                    getCrudButtonTextName={getCrudButtonTextName}
                    ServiceHeader={ServiceHeader}
                  />
                )}
              {activeTab === ServiceHeader.PricingFormula && (
                <PricingFormulaComponent
                  modelAction={modelAction}
                  setActiveTab={setActiveTab}
                  servicesObj={servicesObj}
                  setserviceError={setserviceError}
                  serviceError={serviceError}
                  setServicesObj={setServicesObj}
                  handleCancelButton={handleCancelButton}
                  GlobalPricingDriverAddUpdateBtnClicked={
                    GlobalPricingDriverAddUpdateBtnClicked
                  }
                  DeclineSuperAdminChangesData={DeclineSuperAdminChangesData}
                  modelRequestData={location.state}
                  handleBackButton={handleBackButton}
                  ServiceHeader={ServiceHeader}
                  moduleName={moduleName}
                  getCrudButtonTextName={getCrudButtonTextName}
                  getCrudPopUpTitleName={getCrudPopUpTitleName}
                  handleChange={handleChange}
                  tagifyRef={tagifyRef}
                  pricingDriver={pricingDriver}
                  pricingFormulaError={pricingFormulaError}
                  EditPricingFormulaValue={EditPricingFormulaValue}
                  PricingFormulaValue={servicesObj.pricingFormula?.replace(
                    /\[\[{"value":"​","key":"","class":"private-tag","type":"Private","prefix":"@"}\]\]/g,
                    "",
                  )}
                  setEditPricingFormulaValue={setEditPricingFormulaValue}
                  PricingFormula={servicesObj?.pricingFormula}
                  currencySymbol={currencySymbol}
                  errorMessage={errorMessage}
                />
              )}
            </div>
          </div>
        </div>
        <AcceptSuperAdminChangesConfirmation
          openErrorModal={openErrorModal}
          ModelId={props.id}
          Status={Status}
          openSuccessModal={openSuccessModal}
          modelRequestData={location.state}
          UpdatedChanges={handleConfirmButton}
        />
      </div>
      {/* {errorMessage} */}
      <ErrorModel
        ErrorModel={openErrorModal}
        handleClose={HandleClose}
        ErrorMessage={errorMessage}
        errorMessageTitle={errorMessageTitle}
      />

      <ConfirmModel
        openErrorModal={openErrorModal}
        openSuccessModal={openSuccessModal}
        modelRequestData={modelRequestData}
        // UpdatedStatus={() =>
        //   GlobalPricingDriverAddUpdateBtnClicked("ConfirmedToSave")
        // }
        UpdatedStatus={handleConfirmAction}
        modelAction={modelAction}
      />

      <ServicesCategoryModel
        class="modal fade"
        id="serviceCategoryModel"
        tabIndex="-1"
        aria_labelledby="serviceCategoryModel"
        aria_hidden="true"
        setIsAddUpdateActionDone={setIsAddUpdateActionDone}
        modelRequestData={modelRequestData}
      />
      <AddDeleteGlobalPricingDriver
        class="modal fade"
        id="addDeleteGlobalPricingDriverModal"
        tabIndex="-1"
        aria_labelledby="addDeleteGlobalPricingDriverModal"
        aria_hidden="true"
        title={title}
        globalPricingDrivers={globalPricingDrivers}
        setGlobalPricingDrivers={setGlobalPricingDrivers}
        setPricingDriver={setPricingDriver}
        pricingDriver={pricingDriver}
        setAddGBP={setAddGBP}
        SetSlabTypeVal={SetSlabTypeVal}
        slabType={slabType}
      />

      <RecordsAvailablePopupModel
        handleClose={handleClose}
        openErrorModal={openErrorModal}
        openSuccessModal={openSuccessModal}
        modelRequestData={modelRequestData}
      />
      <SuccessModal
        handleClose={HandleClose}
        setOpenSuccessModal={setOpenSuccessModal}
        setIsCheck={setIsCheck}
        isCheck={isCheck}
        openSuccessModal={openSuccessModal}
        modelAction={modelAction}
        modelRequestData={modelRequestData}
        message={
          modelAction === "DeleteFeeInflation"
            ? "Fee Inflation"
            : `${moduleName} ${servicesObj.serviceName}`
        }
      />
      <DeleteDriverModal
        handleClose={handleCloseDeleteDriverModel}
        setOpenSuccessModal={setOpenDeleteDriverModel}
        openDeleteDriverModel={openDeleteDriverModel}
        modelRequestData={modelRequestData}
      />
    </div>
  );
};

export default Add_Update_Service;
