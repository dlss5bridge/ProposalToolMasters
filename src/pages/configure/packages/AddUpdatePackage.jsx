/* global $ */
import React, { useContext, useEffect, useState, lazy, Suspense } from "react";
import "./Package.css";
import "../../proposals/proposal-ui.css";
import "./AddUpdatePackage-redesign.css";
import Select from "react-select";
import SuccessModal from "../../../components/SuccessModal";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import { useNavigate } from "react-router";
import { useLocation } from "react-router-dom";
import ErrorModel from "../../../components/ErrorModel";
import {
  GetAdditionalInformationList,
  GetPackageServicesList,
  GetAddUpdatePackage,
  GetServicePackageModel,
} from "../../../redux/Services/Config/PackageApi";
import { PackageHeader } from "../../../Middleware/enums";
import { ERROR_MESSAGES } from "../../../components/GlobalMessage";
import { useSelector } from "react-redux";
import { GetProfessionTypeLookupList } from "../../../redux/Services/Master/ProfessionTypeApi";
// import { SelectServices } from "../../../components/SelectServices";
// import { AdditionalInformation } from "../../../components/AdditionalInformation";
import { GetCalculatedServicesPrice, GetCalculatedServicesPriceByPackages } from "../../../redux/Services/Config/ServicesApi";
import { GetClientLookupList } from "../../../redux/Services/client/clientAPI";
import { GetNOBTypeLookupList } from "../../../redux/Services/Master/NOBTypeLookupListApi";
import {
  GetBusinessTypeLookupList,
  GetProspectTypeVariationLookupList,
} from "../../../redux/Services/Master/BusinessTypeLookupListApi";
import BackButtonSvg from "../../../components/BackButtonSvg";
import InvalidFormIcon from "../../../components/InvalidFormIcon";
import AcceptSuperAdminChangesConfirmation from "../../../components/AcceptSuperAdminChangesConfirmation";
import { NotifySuperAdminPredefinedChangesToAdmin } from "../../../redux/Services/Setting/NotificationApi";
import { DeclineSuperAdminChanges } from "../../../redux/Services/Config/ServiceCategoryApi";
import SAPredefinedChangesNotifyMessageModel from "../../../components/SAPredefinedChangesNotifyMessageModel";
import RecordsAvailablePopupModel from "../../../components/RecordsAvailablePopupModel";
import { Message } from "@mui/icons-material";
import PriceAdjustedToZeroFloorValue from "../../../components/PriceAdjustedToZeroFloorValue";
const SelectServices = lazy(() => import("../../../components/SelectServices"));
const AdditionalInformation = lazy(() => import("../../../components/AdditionalInformation"));

export const BasicInformationComponent = (props) => {
  return (
    <>
      <div className="scrollbar">
        <div className="tab-content">
          <div className="tab-pane p-3 active">
            <div className="basicinfo-card">
              <div className="basicinfo-card__head">
                <div className="basicinfo-card__icon">
                  <i className="bi-box-seam"></i>
                </div>
                <div className="basicinfo-card__head-text">
                  <p className="basicinfo-card__title">
                    Basic Information
                    <span className="basicinfo-card__badge">Required</span>
                  </p>
                  <p className="basicinfo-card__desc">
                    Name the package and choose which businesses it is offered
                    to.
                  </p>
                </div>
              </div>

              <div className="basicinfo-card__body">
                <SAPredefinedChangesNotifyMessageModel Params={{ moduleName: props.moduleName, SAChanges: props.modelRequestData.Type }} />
                <div className="bi-field-grid">
                  {(props.common.professionTypeLists?.length > 1 ||
                    props.common.organisationKeyID === null) && (
                      <div className="bi-field">
                        <label className="bi-field__label">
                          Profession Type
                          <span class="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          {props.common.professionTypeLists?.length > 1 ||
                            props.common.organisationKeyID === null ? (
                            <Select
                              isMulti={
                                props.common.organisationKeyID === null
                                  ? false
                                  : true
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
                        {props.requireMessage &&
                          (props.common.professionTypeLists?.length > 1 ||
                            props.common.organisationKeyID === null) &&
                          props.packageObj.professionTypeList?.length === 0 ? (
                          <span className="validation">{ERROR_MESSAGES}</span>
                        ) : (
                          ""
                        )}
                      </div>
                    )}

                  <div className="bi-field">
                    <label className="bi-field__label">
                      Package Name
                      <span class="text-danger">*</span>
                    </label>
                    <div class="input-group">
                      <input
                        type="text"
                        placeholder="Package Name"
                        class="input-text"
                        maxLength={100}
                        value={props.packageObj.servicePackageName}
                        onChange={(e) => {
                          let trimmedValue = e.target.value.trimStart();
                          const capitalizedValue =
                            trimmedValue.charAt(0).toUpperCase() +
                            trimmedValue.slice(1);
                          props.setPackageObj({
                            ...props.packageObj,
                            servicePackageName: capitalizedValue,
                          });
                          props.DisableTabOnChange();
                        }}
                      />
                      {props.requireMessage &&
                        (props.packageObj.servicePackageName === null ||
                          props.packageObj.servicePackageName === "") ? (
                        <span className="validation">{ERROR_MESSAGES}</span>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>

                  <div className="bi-field">
                    <label className="bi-field__label">
                      Nature Of Business
                      <span class="text-danger">*</span>
                    </label>
                    <div className="input-group ">
                      <Select
                        isMulti
                        className="user-role-select"
                        style={{ padding: "5px", width: "20%" }}
                        options={
                          props.packageObj.businessNatureID.length + 1 ===
                            props.NatureOfBusinessTypeLookupList.length
                            ? props.NatureOfBusinessTypeLookupList.slice(1)
                            : props.NatureOfBusinessTypeLookupList
                        }
                        value={props.NOBTypeValue.filter(
                          (item) => item.value !== null
                        )}
                        onChange={(e) => {
                          props.OnNOBChange(e);
                        }}
                      />
                      {props.requireMessage &&
                        props.packageObj.businessNatureID.length === 0 ? (
                        <span className="validation">{ERROR_MESSAGES}</span>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>

                  <div className="bi-field">
                    <label className="bi-field__label">
                      {props.prospectName} Type
                      <span class="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <Select
                        isMulti
                        className="user-role-select"
                        style={{ padding: "5px", width: "20%" }}
                        options={
                          props.packageObj.clientBusinessTypeID.length ===
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
                      {props.requireMessage &&
                        props.packageObj.clientBusinessTypeID.length === 0 ? (
                        <span className="validation">{ERROR_MESSAGES}</span>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="separator"></div>
      <div class="row fieldset modal-footer">
        <div class="col-lg-12 hstack gap-2 justify-content-end text-right mt-3">
          {props.getSAChanges ?
            <button class="btn btn-md btn-success declined-item-btn pf-btn--decline" onClick={() => props.DeclineSuperAdminChangesData("Decline")}>
              <span>Decline</span>
            </button> : <button class="btn btn-md  btn-light pf-btn--cancel" onClick={props.handleCancel}>
              <span>{props.getCrudButtonTextName("Cancel")}</span>
            </button>
          }
          <button
            class="btn btn-md btn-primary create-item-btn pf-btn--next"
            onClick={() => props.HandleTabChange(2)}
          >
            <span>Next</span>
          </button>
        </div>
      </div>
    </>
  );
};

export const PricingInformation = (props) => {
  //Handle One-Off Min Price 
  const handleOneOffMinPrice = (e) => {
    const oneOffPrice = Number(props.OneOffPricingInfo.OriginalPrice);
    const inputValue = e.target.value.replace(/[^0-9.-]/g, ""); // Allow only numeric, dot, comma, and hyphen characters

    const sanitizedInput = inputValue;
    // Split the input into integer and decimal parts
    const [integerPart, decimalPart] = sanitizedInput.split(".");

    let formattedInput;
    if (decimalPart !== undefined) {
      if (integerPart.includes("-")) {
        // For negative values, ensure 5 digits after the negative sign
        formattedInput = `-${integerPart.slice(1, 13)}.${decimalPart.slice(
          0,
          2
        )}`;
      } else {
        // For positive values, limit to 5 digits before the decimal point
        formattedInput = `${integerPart.slice(0, 12)}.${decimalPart.slice(
          0,
          2
        )}`;
      }
    } else {
      // No decimal part, limit to 5 digits
      formattedInput = integerPart.includes("-")
        ? `-${integerPart.slice(1, 13)}`
        : `${integerPart.slice(0, 12)}`;
    }
    let decrease = oneOffPrice - Number(formattedInput);

    const percentage =
      oneOffPrice !== 0 ? ((decrease / oneOffPrice) * 100).toFixed(2) : 0;
    const percentageCopy =
      oneOffPrice !== 0 ? ((decrease / oneOffPrice) * 100) : 0;
    if (formattedInput !== "") {
      props.setOneOffPricingInfo({
        ...props.OneOffPricingInfo,
        MinPrice: formattedInput,
        MaxDiscount: percentage,
        MaxDiscountWithDecimal: percentageCopy,
      });
    } else {
      props.setOneOffPricingInfo({
        ...props.OneOffPricingInfo,
        MinPrice: "",
        MaxDiscount: 0.0,
        MaxDiscountWithDecimal: 0.00
      });
    }
  };
  // handle One-off Price 
  const handleOneOffDefaultPrice = (e) => {
    const inputValue = e.target.value.replace(/[^0-9.-]/g, ""); // Allow only numeric, dot, comma, and hyphen characters

    const sanitizedInput = inputValue;
    // Split the input into integer and decimal parts
    const [integerPart, decimalPart] = sanitizedInput.split(".");

    // Combine integer and decimal parts with appropriate precision
    let formattedInput;
    if (decimalPart !== undefined) {
      if (integerPart.includes("-")) {
        // For negative values, ensure 5 digits after the negative sign
        formattedInput = `-${integerPart.slice(1, 13)}.${decimalPart.slice(
          0,
          2
        )}`;
      } else {
        // For positive values, limit to 5 digits before the decimal point
        formattedInput = `${integerPart.slice(0, 12)}.${decimalPart.slice(
          0,
          2
        )}`;
      }
    } else {
      // No decimal part, limit to 5 digits
      formattedInput = integerPart.includes("-")
        ? `-${integerPart.slice(1, 13)}`
        : `${integerPart.slice(0, 12)}`;
    }
    const recurringServicesTotal = Number(
      props.OneOffPricingInfo.OriginalPrice
    );
    let decrease = recurringServicesTotal - formattedInput;

    const percentage = (
      (Number(decrease) / Number(recurringServicesTotal)) *
      100
    ).toFixed(2);
    const percentageCopy = (
      (Number(decrease) / Number(recurringServicesTotal)) *
      100
    );
    const TotalDiscount = Number(recurringServicesTotal) - Number(decrease);
    const VatPrice =
      Number(formattedInput) * (Number(props.vatPercentage) / 100);
    const FinalPrice = Number(VatPrice) + Number(TotalDiscount);
    if (formattedInput !== "") {
      props.setOneOffPricingInfo({
        ...props.OneOffPricingInfo,
        DefaultPrice: formattedInput,
        DefaultDiscount: percentage,
        DefaultDiscountWithDecimal: percentageCopy,
        Discount: decrease,
        DiscountedTotal: TotalDiscount,
        VATPrice: VatPrice,
        GrandTotal: FinalPrice,
      });
    } else {
      props.setOneOffPricingInfo({
        ...props.OneOffPricingInfo,
        DefaultPrice: "",
        DefaultDiscount: 0.0,
        DefaultDiscountWithDecimal: 0.0,
        Discount: 0.0,
        DiscountedTotal: props.OneOffPricingInfo.OriginalPrice,
        VATPrice: VatPrice,
        GrandTotal: FinalPrice,
      });
    }
  };
  // Handle Recurring min Price 
  const handleRecurringMinPrice = (e) => {
    const inputValue = e.target.value.replace(/[^0-9.-]/g, ""); // Allow only numeric, dot, comma, and hyphen characters

    const sanitizedInput = inputValue;
    // Split the input into integer and decimal parts
    const [integerPart, decimalPart] = sanitizedInput.split(".");

    let formattedInput;
    if (decimalPart !== undefined) {
      if (integerPart.includes("-")) {
        // For negative values, ensure 5 digits after the negative sign
        formattedInput = `-${integerPart.slice(1, 13)}.${decimalPart.slice(
          0,
          2
        )}`;
      } else {
        // For positive values, limit to 5 digits before the decimal point
        formattedInput = `${integerPart.slice(0, 12)}.${decimalPart.slice(
          0,
          2
        )}`;
      }
    } else {
      // No decimal part, limit to 5 digits
      formattedInput = integerPart.includes("-")
        ? `-${integerPart.slice(1, 13)}`
        : `${integerPart.slice(0, 12)}`;
    }
    const recurringServicesTotal = Number(
      props.RecurringPricingInfo.OriginalPrice
    );
    let decrease = recurringServicesTotal - Number(formattedInput);

    const percentage =
      recurringServicesTotal !== 0
        ? ((decrease / recurringServicesTotal) * 100).toFixed(2)
        : 0;
    const percentageCopy =
      recurringServicesTotal !== 0
        ? ((decrease / recurringServicesTotal) * 100)
        : 0;
    if (formattedInput !== "") {
      props.setRecurringPricingInfo({
        ...props.RecurringPricingInfo,
        MinPrice: formattedInput,
        MaxDiscount: percentage,
        MaxDiscountWithDecimal: percentageCopy,
      });
    } else {
      props.setRecurringPricingInfo({
        ...props.RecurringPricingInfo,
        MinPrice: "",
        MaxDiscount: 0.0,
        MaxDiscountWithDecimal: 0.00,
      });
    }
  };
  // Handle Recurring Default Price 
  const handleRecurringDefaultPrice = (e) => {
    const inputValue = e.target.value.replace(/[^0-9.-]/g, ""); // Allow only numeric, dot, comma, and hyphen characters

    const sanitizedInput = inputValue;
    // Split the input into integer and decimal parts
    const [integerPart, decimalPart] = sanitizedInput.split(".");
    // Combine integer and decimal parts with appropriate precision
    let formattedInput;
    if (decimalPart !== undefined) {
      if (integerPart.includes("-")) {
        // For negative values, ensure 5 digits after the negative sign
        formattedInput = `-${integerPart.slice(1, 13)}.${decimalPart.slice(
          0,
          2
        )}`;
      } else {
        // For positive values, limit to 5 digits before the decimal point
        formattedInput = `${integerPart.slice(0, 12)}.${decimalPart.slice(
          0,
          2
        )}`;
      }
    } else {
      // No decimal part, limit to 5 digits
      formattedInput = integerPart.includes("-")
        ? `-${integerPart.slice(1, 13)}`
        : `${integerPart.slice(0, 12)}`;
    }

    const recurringServicesTotal = Number(
      props.RecurringPricingInfo.OriginalPrice
    );
    const defaultPrice = formattedInput;

    let decrease = recurringServicesTotal - Number(defaultPrice);
    // if (decrease < 0) {
    //   return;
    // }

    const percentage = (
      (Number(decrease) / Number(recurringServicesTotal)) *
      100
    ).toFixed(2);
    const percentageCopy = (
      (Number(decrease) / Number(recurringServicesTotal)) *
      100
    );
    const TotalDiscount =
      Number(props.RecurringPricingInfo.OriginalPrice) - Number(decrease);
    const VatPrice =
      Number(formattedInput) * (Number(props.vatPercentage) / 100);
    const FinalPrice = Number(VatPrice) + Number(TotalDiscount);
    if (formattedInput !== "") {
      props.setRecurringPricingInfo({
        ...props.RecurringPricingInfo,
        DefaultPrice: formattedInput,
        DefaultDiscount: percentage,
        DefaultDiscountWithDecimal: percentageCopy,
        Discount: decrease,
        DiscountedTotal: TotalDiscount,
        VATPrice: VatPrice,
        GrandTotal: FinalPrice,
      });
    } else {
      props.setRecurringPricingInfo({
        ...props.RecurringPricingInfo,
        DefaultPrice: "",
        DefaultDiscount: 0.0,
        Discount: 0.0,
        DefaultDiscountWithDecimal: 0.00,
        DiscountedTotal: props.RecurringPricingInfo.OriginalPrice,
        VATPrice: VatPrice,
        GrandTotal: FinalPrice,
      });
    }
  };

  return (
    <>
      <div className="create-practice-height scrollbar">
        {props.selectedRecurringServiceList?.length !== 0 && (
          <div className="tab-content">
            <div class="tab-pane p-3 active">
              <div className="basicinfo-card pkg-pricing-card">
                <div className="basicinfo-card__head">
                  <div className="basicinfo-card__icon">
                    <i className="bi-arrow-repeat"></i>
                  </div>
                  <div className="basicinfo-card__head-text">
                    <p className="basicinfo-card__title">Recurring Services</p>
                    <p className="basicinfo-card__desc">
                      Set the default and minimum price for the recurring services in this package.
                    </p>
                  </div>
                </div>
                <div className="basicinfo-card__body">
              <div class="row">
                <div class="col-12">
                  <div className="row fieldset">
                    <div class="col-md-2 col-sm-12 text-start text-md-end">
                      <label class="fieldset-label required">
                        Original Price ({props.currencySymbol})
                      </label>
                    </div>
                    <div className="col-md-10 col-sm-12">
                      <div class="mb-1 ">
                        <div className="input-group">
                          <input
                            readonly=""
                            type="text"
                            class="input-text"
                            value={Number(
                              props.RecurringPricingInfo.OriginalPrice
                            )
                              .toFixed(2)
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="row" id="recurring_Default">
                    <div
                      style={{ padding: "0px" }}
                      class="col-lg-2 col-md-2 col-sm-12 text-md-end"
                    >
                      <label class="fieldset-label mt-2 required">
                        Default Discount (%)
                      </label>
                    </div>
                    <div class="col-lg-4 col-md-4 col-sm-12">
                      <div class="mb-1">
                        <div className="input-group">
                          <input
                            readonly=""
                            class="input-text"
                            type="text"
                            placeholder="Default Discount (%)"
                            value={props.RecurringPricingInfo.DefaultDiscount.toString().replace(
                              /\B(?=(\d{3})+(?!\d))/g,
                              ","
                            )}
                            onChange={(e) => {
                              props.setRecurringPricingInfo({
                                ...props.RecurringPricingInfo,
                                DefaultDiscount: e.target.value,
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div class="col-lg-2 col-md-2 col-sm-12 text-md-end">
                      <label class="fieldset-label mt-2 required">
                        Default Price ({props.currencySymbol})
                        <span class="text-danger">*</span>
                      </label>
                    </div>
                    <div class="col-lg-4 col-md-4 col-sm-12">
                      <div class="mb-1">
                        <div className="input-group">
                          <input
                            class="input-text"
                            type="text"
                            placeholder={`Default Price (${props.currencySymbol})`}
                            value={props.RecurringPricingInfo.DefaultPrice.toString().replace(
                              /\B(?=(\d{3})+(?!\d))/g,
                              ","
                            )}
                            onChange={(e) => {
                              handleRecurringDefaultPrice(e);
                            }}
                          />
                          {props.requireMessage &&
                            (props.RecurringPricingInfo.DefaultPrice ===
                              undefined ||
                              props.RecurringPricingInfo.DefaultPrice ===
                              null ||
                              props.RecurringPricingInfo.DefaultPrice === "" ||
                              isNaN(props.RecurringPricingInfo.DefaultPrice) ||
                              Number(props.RecurringPricingInfo.DefaultPrice) <=
                              0 ||
                              Number(props.RecurringPricingInfo.OriginalPrice) <
                              Number(
                                props.RecurringPricingInfo.DefaultPrice
                              )) && (
                              <span className="validation">
                                {props.RecurringPricingInfo.DefaultPrice ===
                                  undefined ||
                                  props.RecurringPricingInfo.DefaultPrice ===
                                  null ||
                                  props.RecurringPricingInfo.DefaultPrice === ""
                                  ? ERROR_MESSAGES
                                  : isNaN(
                                    props.RecurringPricingInfo.DefaultPrice
                                  )
                                    ? "Invalid Price"
                                    : Number(
                                      props.RecurringPricingInfo.OriginalPrice
                                    ) <
                                      Number(
                                        props.RecurringPricingInfo.DefaultPrice

                                      )
                                      ? `The recurring default price has to be less than  ${Number(
                                        props.RecurringPricingInfo.OriginalPrice
                                      )
                                        .toFixed(2)
                                        .toString()
                                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                                      : Number(
                                        props.RecurringPricingInfo.DefaultPrice
                                      ) <= 0
                                        ? "The recurring default price has to be greater than 0"
                                        : ""}
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="row " id="recurring_Min">
                    <div class="col-lg-2 col-md-2 col-sm-12 text-md-end">
                      <div class="mb-1">
                        <label class="fieldset-label mt-2 required">
                          Max Discount (%)
                        </label>
                      </div>
                    </div>
                    <div class="col-lg-4 col-md-4 col-sm-12">
                      <input
                        readonly=""
                        class="input-text"
                        type="text"
                        placeholder="Max Discount (%)"
                        value={props.RecurringPricingInfo.MaxDiscount.toString().replace(
                          /\B(?=(\d{3})+(?!\d))/g,
                          ","
                        )}
                        onChange={(e) => {
                          props.setRecurringPricingInfo({
                            ...props.RecurringPricingInfo,
                            MaxDiscount: e.target.value,
                          });
                        }}
                      />
                    </div>
                    <div class="col-lg-2 col-md-2 col-sm-12 text-md-end">
                      <label class="fieldset-label mt-2 required">
                        Min Price ({props.currencySymbol})
                        <span class="text-danger">*</span>
                      </label>
                    </div>
                    <div class="col-lg-4 col-md-4 col-sm-12">
                      <input
                        class="input-text"
                        type="text"
                        placeholder={`Min Price (${props.currencySymbol})`}
                        value={props.RecurringPricingInfo.MinPrice.toString().replace(
                          /\B(?=(\d{3})+(?!\d))/g,
                          ","
                        )}
                        onChange={(e) => {
                          handleRecurringMinPrice(e);
                        }}
                      />
                      {props.requireMessage &&
                        (props.RecurringPricingInfo.MinPrice === undefined ||
                          props.RecurringPricingInfo.MinPrice === null ||
                          props.RecurringPricingInfo.MinPrice === "" ||
                          isNaN(props.RecurringPricingInfo.MinPrice) ||
                          Number(props.RecurringPricingInfo.DefaultPrice) <
                          Number(props.RecurringPricingInfo.MinPrice) ||
                          Number(props.RecurringPricingInfo.MinPrice) <= 0) && (
                          <span className="validation">
                            {props.RecurringPricingInfo.MinPrice ===
                              undefined ||
                              props.RecurringPricingInfo.MinPrice === null ||
                              props.RecurringPricingInfo.MinPrice === ""
                              ? ERROR_MESSAGES
                              : Number(props.RecurringPricingInfo.MinPrice) <= 0
                                ? "The recurring min price has to be greater than 0"
                                : isNaN(props.RecurringPricingInfo.MinPrice)
                                  ? "Invalid Price"
                                  : props.RecurringPricingInfo.DefaultPrice !==
                                    undefined &&
                                    props.RecurringPricingInfo.DefaultPrice !==
                                    null &&
                                    props.RecurringPricingInfo.DefaultPrice !==
                                    "" &&
                                    Number(
                                      props.RecurringPricingInfo.DefaultPrice
                                    ) < Number(props.RecurringPricingInfo.MinPrice)
                                    ? `The recurring min price has to be less than  
                                   ${Number(
                                      props.RecurringPricingInfo.DefaultPrice
                                    )
                                      .toFixed(2)
                                      .toString()
                                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                                    : ""}
                          </span>
                        )}
                    </div>
                  </div>
                  <div class="mb-3"></div>
                  <table class="table align-middle table-nowrap">
                    <thead class="table-light table-header-font">
                      <tr class="head-row">
                        <td className="tr-table-class  font-14 text-white">Services</td>
                        <td className="tr-table-class font-14 text-white text-right">
                          Fees ({props.currencySymbol})
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      {props.selectedRecurringServiceList.map((item) => {
                        return (
                          <>
                            <tr className="a-la-carte-services-review-head-row">
                              <th colSpan="2">{item.serviceCatName}</th>
                            </tr>
                            {item.servicesList.map((service) => {
                              // Add the return statement here
                              return (
                                <tr key={service.serviceID}>
                                  <td>
                                    <div>{service.serviceName}</div>
                                    <div className="package-variables"></div>
                                  </td>
                                  <td className="text-right">
                                    {props.currencySymbol}
                                    {Number(service.price)
                                      .toFixed(2)
                                      .toString()
                                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                  </td>
                                </tr>
                              );
                            })}
                          </>
                        );
                      })}
                      <tr className="head-row">
                        <td className="tr-table-class font-14 text-white">Net Total</td>
                        <td className="tr-table-class  font-14 text-white text-right">
                          {props.currencySymbol}
                          {Number(props.RecurringPricingInfo.OriginalPrice) <
                            Number(props.RecurringPricingInfo.DefaultPrice)
                            ? Number(props.RecurringPricingInfo.DefaultPrice)
                              .toFixed(2)
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            : Number(props.RecurringPricingInfo.OriginalPrice)
                              .toFixed(2)
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </td>
                      </tr>
                      {Number(props.RecurringPricingInfo.Discount) > 0 && (
                        <>
                          <tr class="head-grey-row">
                            <td className="tr-table-class font-14 text-white">
                              Discount
                            </td>
                            <td className="tr-table-class font-14 text-white text-right">
                              (-) {props.currencySymbol}
                              {Number(props.RecurringPricingInfo.Discount)
                                .toFixed(2)
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            </td>
                          </tr>
                          <tr class="head-row">
                            <td className="tr-table-class  font-14 text-white">
                              Discounted Total
                            </td>
                            <td className="tr-table-class font-14 text-white text-right">
                              {props.currencySymbol}
                              {Number(
                                props.RecurringPricingInfo.DiscountedTotal
                              )
                                .toFixed(2)
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            </td>
                          </tr>
                        </>
                      )}

                      {props.vatPercentage && (
                        <>
                          <tr class="head-grey-row">
                            <td className="tr-table-class font-14 text-white">{props.taxName}</td>
                            <td className="tr-table-class font-14 text-white text-right">
                              {props.currencySymbol}
                              {Number(props.RecurringPricingInfo.VATPrice)
                                .toFixed(2)
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            </td>
                          </tr>
                          <tr className="head-row">
                            <td className="tr-table-class font-14 text-white">
                              Grand Total
                            </td>
                            <td className="tr-table-class font-14 text-white text-right">
                              {props.currencySymbol}
                              {Number(props.RecurringPricingInfo.GrandTotal)
                                .toFixed(2)
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {props.selectedOneOffServiceList.length !== 0 && (
          <div className="tab-content">
            <div class="tab-pane p-3 active">
              <div className="basicinfo-card pkg-pricing-card">
                <div className="basicinfo-card__head">
                  <div className="basicinfo-card__icon">
                    <i className="bi-lightning-charge"></i>
                  </div>
                  <div className="basicinfo-card__head-text">
                    <p className="basicinfo-card__title">One-Off Services</p>
                    <p className="basicinfo-card__desc">
                      Set the default and minimum price for the one-off services in this package.
                    </p>
                  </div>
                </div>
                <div className="basicinfo-card__body">
              <div class="row">
                <div class="col-12">
                  <div className="row fieldset">
                    <div class="col-md-2 col-sm-12 text-md-end">
                      <label class="form-label">Original Price ({props.currencySymbol})</label>
                    </div>
                    <div className="col-md-10 col-sm-12">
                      <div class="mb-1">
                        <div className="input-group">
                          <input
                            readonly=""
                            type="text"
                            class="input-text"
                            value={Number(props.OneOffPricingInfo.OriginalPrice)
                              .toFixed(2)
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="row" id="OneOff_Default">
                    <div
                      style={{ padding: "0px" }}
                      class="col-lg-2 col-md-2 col-sm-12 text-md-end"
                    >
                      <label class="fieldset-label mt-2 required">
                        Default Discount (%)
                      </label>
                    </div>
                    <div class="col-lg-4 col-md-4 col-sm-12">
                      <div class="mb-1">
                        <div className="input-group">
                          <input
                            readonly=""
                            class="input-text"
                            type="text"
                            placeholder="Default Discount (%)"
                            value={props.OneOffPricingInfo.DefaultDiscount.toString().replace(
                              /\B(?=(\d{3})+(?!\d))/g,
                              ","
                            )}
                            onChange={(e) => {
                              props.setOneOffPricingInfo({
                                ...props.OneOffPricingInfo,
                                DefaultDiscount: e.target.value,
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div class="col-lg-2 col-md-2 col-sm-12 text-md-end">
                      <label class="fieldset-label mt-2 required">
                        Default Price ({props.currencySymbol})
                        <span class="text-danger">*</span>
                      </label>
                    </div>
                    <div class="col-lg-4 col-md-4 col-sm-12">
                      <div class="mb-1">
                        <div className="input-group">
                          <input
                            class="input-text"
                            type="text"
                            placeholder={`Default Price (${props.currencySymbol})`}
                            value={props.OneOffPricingInfo.DefaultPrice.toString().replace(
                              /\B(?=(\d{3})+(?!\d))/g,
                              ","
                            )}
                            onChange={(e) => {
                              handleOneOffDefaultPrice(e);
                            }}
                          />
                          {props.requireMessage &&
                            (props.OneOffPricingInfo.DefaultPrice ===
                              undefined ||
                              props.OneOffPricingInfo.DefaultPrice === null ||
                              props.OneOffPricingInfo.DefaultPrice === "" ||
                              isNaN(props.OneOffPricingInfo.DefaultPrice) ||
                              Number(props.OneOffPricingInfo.DefaultPrice) <=
                              0 ||
                              Number(props.OneOffPricingInfo.OriginalPrice) <
                              Number(
                                props.OneOffPricingInfo.DefaultPrice
                              )) && (
                              <span className="validation">
                                {props.OneOffPricingInfo.DefaultPrice ===
                                  undefined ||
                                  props.OneOffPricingInfo.DefaultPrice === null ||
                                  props.OneOffPricingInfo.DefaultPrice === ""
                                  ? ERROR_MESSAGES
                                  : isNaN(props.OneOffPricingInfo.DefaultPrice)
                                    ? "Invalid Price"
                                    : Number(
                                      props.OneOffPricingInfo.OriginalPrice
                                    ) <
                                      Number(props.OneOffPricingInfo.DefaultPrice)
                                      ? `The recurring default price has to be less than ${Number(
                                        props.OneOffPricingInfo.OriginalPrice
                                      )
                                        .toFixed(2)
                                        .toString()
                                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                                      : Number(
                                        props.OneOffPricingInfo.DefaultPrice
                                      ) <= 0
                                        ? "The  One-Off default price has to be greater than 0"
                                        : ""}
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="row " id="OneOff_min">
                    <div class="col-lg-2 col-md-2 col-sm-12 text-md-end">
                      <label class="fieldset-label mt-2 required">
                        Max Discount (%)
                      </label>
                    </div>
                    <div class="col-lg-4 col-md-4 col-sm-12">
                      <input
                        readonly=""
                        class="input-text"
                        type="text"
                        placeholder="Max Discount (%)"
                        value={props.OneOffPricingInfo.MaxDiscount.toString().replace(
                          /\B(?=(\d{3})+(?!\d))/g,
                          ","
                        )}
                        onChange={(e) => {
                          props.setOneOffPricingInfo({
                            ...props.OneOffPricingInfo,
                            MaxDiscount: e.target.value,
                          });
                        }}
                      />
                    </div>
                    <div class="col-lg-2 col-md-2 col-sm-12 text-md-end">
                      <label class="fieldset-label mt-2 required">
                        Min Price ({props.currencySymbol})
                        <span class="text-danger">*</span>
                      </label>
                    </div>
                    <div class="col-lg-4 col-md-4 col-sm-12">
                      <input
                        class="input-text"
                        type="text"
                        placeholder="Min Price (£)"
                        value={props.OneOffPricingInfo.MinPrice.toString().replace(
                          /\B(?=(\d{3})+(?!\d))/g,
                          ","
                        )}
                        onChange={(e) => {
                          handleOneOffMinPrice(e);
                        }}
                      />
                      {props.requireMessage &&
                        (props.OneOffPricingInfo.MinPrice === undefined ||
                          props.OneOffPricingInfo.MinPrice === null ||
                          props.OneOffPricingInfo.MinPrice === "" ||
                          isNaN(props.OneOffPricingInfo.MinPrice) ||
                          Number(props.OneOffPricingInfo.DefaultPrice) <
                          Number(props.OneOffPricingInfo.MinPrice) ||
                          Number(props.OneOffPricingInfo.MinPrice) <= 0) && (
                          <span className="validation">
                            {props.OneOffPricingInfo.MinPrice === undefined ||
                              props.OneOffPricingInfo.MinPrice === null ||
                              props.OneOffPricingInfo.MinPrice === ""
                              ? ERROR_MESSAGES
                              : Number(props.OneOffPricingInfo.MinPrice) <= 0
                                ? "The One-Off min price has to be greater than 0"
                                : isNaN(props.OneOffPricingInfo.MinPrice)
                                  ? "Invalid Price"
                                  : props.OneOffPricingInfo.DefaultPrice !==
                                    undefined &&
                                    props.OneOffPricingInfo.DefaultPrice !== null &&
                                    props.OneOffPricingInfo.DefaultPrice !== "" &&
                                    Number(props.OneOffPricingInfo.DefaultPrice) <
                                    Number(props.OneOffPricingInfo.MinPrice)
                                    ? "The One-Off min price has to be less than " +
                                    Number(props.OneOffPricingInfo.DefaultPrice)
                                      .toFixed(2)
                                      .toString()
                                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    : ""}
                          </span>
                        )}
                    </div>
                  </div>
                  <div class="mb-3"></div>
                  <table class="table align-middle table-nowrap">
                    <thead class="table-light table-header-font">
                      <tr class="head-row">
                        <td className="tr-table-class font-14 text-white">Services</td>
                        <td className="tr-table-class font-14 text-white text-right">
                          Fees ({props.currencySymbol})
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      {props.selectedOneOffServiceList.map((item) => {
                        return (
                          <>
                            <tr className="a-la-carte-services-review-head-row">
                              <th colSpan="2">{item.serviceCatName}</th>
                            </tr>
                            {item.servicesList.map((service) => {
                              // Add the return statement here
                              return (
                                <tr key={service.serviceID}>
                                  <td>
                                    <div>{service.serviceName}</div>
                                    <div className="package-variables"></div>
                                  </td>
                                  <td className="text-right">
                                    {props.currencySymbol}
                                    {Number(service.price)
                                      .toFixed(2)
                                      .toString()
                                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                  </td>
                                </tr>
                              );
                            })}
                          </>
                        );
                      })}
                      <tr className="head-row">
                        <td className="tr-table-class font-14 text-white">Net Total</td>
                        <td className="tr-table-class font-14 text-white text-right">
                          {props.currencySymbol}
                          {Number(props.OneOffPricingInfo.OriginalPrice) <
                            Number(props.OneOffPricingInfo.DefaultPrice)
                            ? Number(props.OneOffPricingInfo.DefaultPrice)
                              .toFixed(2)
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            : Number(props.OneOffPricingInfo.OriginalPrice)
                              .toFixed(2)
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </td>
                      </tr>
                      {Number(props.OneOffPricingInfo.Discount) > 0 && (
                        <>
                          {" "}
                          <tr class="head-grey-row">
                            <td className="tr-table-class font-14 text-white">
                              Discount
                            </td>
                            <td className="tr-table-class font-14 text-white text-right">
                              (-) {props.currencySymbol}
                              {Number(props.OneOffPricingInfo.Discount)
                                .toFixed(2)
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            </td>
                          </tr>
                          <tr class="head-row">
                            <td className="tr-table-class text-white">
                              Discounted Total
                            </td>
                            <td className="tr-table-class text-white text-right">
                              {props.currencySymbol}
                              {Number(props.OneOffPricingInfo.DiscountedTotal)
                                .toFixed(2)
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            </td>
                          </tr>
                        </>
                      )}
                      {props.vatPercentage && (
                        <>
                          <tr class="head-grey-row">
                            <td className="tr-table-class font-14 text-white">{props.taxName}</td>
                            <td className="tr-table-class font-14 text-white text-right">
                              £{" "}
                              {Number(props.OneOffPricingInfo.VATPrice)
                                .toFixed(2)
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            </td>
                          </tr>
                          <tr className="head-row">
                            <td className="tr-table-class font-14 text-white">
                              Grand Total
                            </td>
                            <td className="tr-table-class font-14 text-white text-right">
                              {props.currencySymbol}
                              {Number(props.OneOffPricingInfo.GrandTotal)
                                .toFixed(2)
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <span
        style={{ display: "flex", justifyContent: "center" }}
        className="validation"
      >
        {props.errorMessage}
      </span>
      <div class="separator"></div>
      <div class="row fieldset">
        <div class="col-lg-12 hstack gap-2 justify-content-end text-right mt-3">
          {props.getSAChanges ?
            <button class="btn btn-md btn-success declined-item-btn pf-btn--decline" onClick={() => props.DeclineSuperAdminChangesData("Decline")}>
              <span>Decline</span>
            </button> : <button class="btn btn-md  btn-light pf-btn--cancel" onClick={props.handleCancel}>
              <span>{props.getCrudButtonTextName("Cancel")}</span>
            </button>
          }
          {/* <button class="btn btn-md  btn-light" onClick={props.handleCancel}>
            <span>{props.getCrudButtonTextName("Cancel")}</span>
          </button> */}
          <button
            onClick={() => {
              props.TabHide ? props.HandleBack(3) : props.HandleBack(2);
            }}
            style={{ paddingTop: "5px", marginRight: "5px" }}
            className="btn btn-md btn-success create-item-btn pf-btn--back"
          >
            <span>Back</span>
          </button>
          {props.getSAChanges ?
            <button
              class="btn btn-md btn-success accept-item-btn pf-btn--save"
              onClick={() => props.HandleTabChange(5, "Accept")}
            >
              <span>
                Accept
              </span>
            </button> : <button
              class="btn btn-md btn-success create-item-btn pf-btn--save"
              onClick={() => props.HandleTabChange(5)}
            >
              <span>
                {props.modelAction === "Add"
                  ? props.getCrudButtonTextName("Add", props.moduleName)
                  : props.getCrudButtonTextName("Update", props.moduleName)}
              </span>
            </button>
          }

        </div>
      </div>
    </>
  );
};

const AddUpdatePackage = (props) => {
  // A] States Declaration :
  const moduleName = "Package";
  const location = useLocation();
  const navigate = useNavigate();
  const {
    setTopbar,
    isMobile,
    getCrudButtonTextName,
    getCrudPopUpTitleName,
    setLoader,
    scrollUpDownByElementID,
    isValidNumber
  } = useContext(AuthContextProvider);
  const common = useSelector((state) => state.Storage);
  const [errorMessage, setErrorMessage] = useState("");

  const [modelRequestData, setModelRequestData] = useState({
    Action: null,
    message: "",
    DriverName: null
  })
  const [activeTab, setActiveTab] = useState(1);
  const [modelAction, setModelAction] = useState(null);
  const [getSAChanges, isGetSAChanges] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [isCheck, setIsCheck] = useState(false);
  const [Status, setStatus] = React.useState(false);
  const [professionTypeLookupList, setProfessionTypeLookupList] = useState([]);
  const [requireMessage, setRequireMessage] = useState(false);
  const [recurringObj, setRecurringObj] = useState([]);
  const [recurringError, setRecurringError] = useState(false);
  const [oneOffObj, setOneOffObj] = useState([]);
  const [ServiceElementId, setServiceElementId] = useState([]);
  const [BusinessTypeLookupList, setBusinessTypeLookupList] = useState([]);
  const [recurringServicesObj, setRecurringServicesObj] = useState([]);
  const [oneOffServiceObj, setOneOffServiceObj] = useState([]);
  const [priceAdjustedServices, setPriceAdjustedServices] = useState([]);
  const [openPriceAdjustedModal, setOpenPriceAdjustedModal] = useState(false);
  const [TabHide, setTabHide] = useState(false);
  const [additionalInformationList, setAdditionalInformationList] = useState(
    []
  );
  const [selectedRecurringServiceList, setSelectedRecurringServiceList] =
    useState([]);
  const [selectedOneOffServiceList, setSelectedOneOffServiceList] = useState(
    []
  );
  const [packageObj, setPackageObj] = useState({
    servicePackageKeyID: null,
    isVatReg: 0.0,
    professionTypeList: [],
    servicePackageName: null,
    clientBusinessTypeID: [],
    businessNatureID: [],
  });
  const [vatPercentage, setVATPercentage] = useState("");
    const [preferredCurrencyId, setPreferredCurrencyId] = useState(null);
  const [taxName,setTaxName] = useState("");
  const [currencySymbol,setCurrencySymbol] = useState("£");
  const [RecurringPricingInfo, setRecurringPricingInfo] = useState({
    OriginalPrice: 0.0,
    DefaultDiscount: 0.0,
    DefaultDiscountWithDecimal: 0.00,
    MaxDiscountWithDecimal: 0.00,
    DefaultPrice: "",
    MaxDiscount: 0.0,
    MinPrice: "",
    NetTotal: 0.0,
    Services: null,
    ServicePrice: 0.0,
    Discount: 0.0,
    DiscountedTotal: 0.0,
    VATPrice: 0.0,
    GrandTotal: 0.0,
  });
  const [OneOffPricingInfo, setOneOffPricingInfo] = useState({
    OriginalPrice: 0.0,
    DefaultDiscount: 0.0,
    DefaultDiscountWithDecimal: 0.00,
    MaxDiscountWithDecimal: 0.00,
    DefaultPrice: 0.0, // Initialize with a numerical value
    MaxDiscount: 0.0,
    MinPrice: 0,
    NetTotal: 0.0,
    Services: null,
    ServicePrice: 0.0,
    Discount: 0.0,
    DiscountedTotal: 0.0,
    VATPrice: 0.0,
    GrandTotal: 0.0,
  });

  const [isValidForm, setIsValidForm] = useState({
    BasicForm: false,
    SelectService: false,
    AdditionalInfo: false,
    PricingInfo: false,
  });

  // ...........Start select service tab..............
  const [NatureOfBusinessTypeLookupList, setNatureOfBusinessTypeLookupList] =
    useState([]);
  const [recurringServiceList, setRecurringServiceList] = useState([]);
  const [oneOffServiceList, setOneOffServiceList] = useState([]);

  // A]  useEffect : Will call when Add/Update button click from list page
  useEffect(() => {
    setModelAction(
      location.state?.servicePackageKeyID === null ? "Add" : "Update"
    ); //Do not change this naming convention
    if (location.state?.servicePackageKeyID !== null) {
      isGetSAChanges(location.state?.Type)
      GetServicePackageModelData(location.state?.servicePackageKeyID, location.state?.Type);
    }
    setTopbar("none");
  }, [location.state]);

  const { prospectName } = useContext(AuthContextProvider);
  // B] Initial useEffect :
  // 1) Will Call Initial Api Like List Api
  useEffect(() => {
    GetProfessionTypeLookupListData();
    GetBusinessTypeLookupListData();
    GetNOBTypeLookUpListData();
  }, [common.organisationKeyID]);

  useEffect(() => {
    setTopbar("none");
  }, []);

  // B] Calling All Api's like List and other Here :
  const loadServiceLists = async () => {
    setLoader(true);
    try {
      await Promise.all([
        GetRecurringServiceListData(),
        GetOneOffServiceListData(),
      ]);
    } catch (e) {
      setErrorMessage("Failed to load services");
    } finally {
      setLoader(false);
    }
  };
  // 1) Get Service Category List Data
  const GetRecurringServiceListData = async () => {
    // setLoader(true);
    try {
      const data = await GetPackageServicesList({
        userKeyID: common.userKeyID,
        GetSAChanges: location.state.Type ? true : false,
        organisationKeyID: common.organisationKeyID, //common.organisationKeyID,//common.organisationKeyID,
        ServiceChargeTypeID: 1,
        moduleKeyID: packageObj.servicePackageKeyID,
        moduleName: "ServicePackage",
        ProfessionTypeIDs:
          common.professionTypeLists?.length > 1 ||
            common.organisationKeyID === null
            ? packageObj.professionTypeList.map((item) => item.professionTypeId)
            : common.professionTypeLists,
        BusinessTypeIDs:
          packageObj.clientBusinessTypeID.length === 0
            ? null
            : packageObj.clientBusinessTypeID,
        BusinessNatureIDs:
          packageObj.businessNatureID.length === 0
            ? null
            : packageObj.businessNatureID,
        ClientKeyID: null,
        ServicePackageIDs: null,
        QuoteKeyID: null,
      });
      if (data) {
        if (data?.data?.statusCode === 200) {
          // setLoader(false);
          if (data?.data?.responseData?.data) {
            let PackageServiceListData = data.data.responseData.data;

            if (PackageServiceListData.length > 0) {
              PackageServiceListData = PackageServiceListData.map((item) => {
                // Check if the item has servicesList array
                if (item.servicesList && item.servicesList.length > 0) {
                  // Iterate through each service in servicesList
                  item.servicesList = item.servicesList.map((service) => {
                    // Check if pricingDriverList array exists and has elements
                    if (
                      service.pricingDriverList &&
                      service.pricingDriverList.length > 0
                    ) {
                      //Iterate through pricingDriverList array
                      service.pricingDriverList = service.pricingDriverList.map(
                        (driver) => {
                          // Check if driverTypeID is 3 and driverValue, variationID, and slabID are null
                          if (driver.driverTypeID === 3) {
                            // Find the default variation
                            const defaultVariation = driver.variation.find(
                              (variation) => variation.isDefault === true
                            );
                            // Update driverValue and variationID if defaultVariation exists
                            if (defaultVariation) {
                              driver.driverValue =
                                defaultVariation.variationValue;
                              driver.variationID = defaultVariation.variationID;
                            }
                          }
                          // Check if driverTypeID is 4 and driverValue, variationID, and slabID are null
                          else if (driver.driverTypeID === 4) {
                            // Find the default slab
                            const defaultSlab = driver.slab.find(
                              (slab) => slab.isDefault === true
                            );
                            // Update driverValue and slabID if defaultSlab exists
                            if (defaultSlab) {
                              driver.driverValue = defaultSlab.slabValue;
                              driver.slabID = defaultSlab.slabID;
                            }
                          }
                          else if (driver.driverTypeID === 5) {
                            // Find the default date
                              driver.driverValue = driver.text[0].textValue;
                              driver.textID = driver.text[0].textID;
                          }
                          else if (driver.driverTypeID === 6) {
                            // Find the default date
                            const defaultDate = driver.date.find(
                              (date) => date.dateValue === driver.driverValue
                            );
                            // Update driverValue and dateID if defaultDate exists
                            if (defaultDate) {
                              driver.driverValue = defaultDate.dateValue;
                              driver.dateID = defaultDate.dateID;
                            }
                          }

                          // Check if dependsOnGlobalPricingDriverID and dependsOnVariationID are not null
                          if (
                            driver.dependsOnGlobalPricingDriverID !== null &&
                            driver.dependsOnVariationID !== null
                          ) {
                            // Find the globalPricingDriverID with value of dependsOnGlobalPricingDriverID
                            const dependsOnGlobalDriver =
                              service.pricingDriverList.find(
                                (driver2) =>
                                  driver2.globalPricingDriverID ===
                                  driver.dependsOnGlobalPricingDriverID
                              );
                            // Check if dependsOnGlobalDriver exists and has variationID equal to dependsOnVariationID
                            if (
                              dependsOnGlobalDriver &&
                              dependsOnGlobalDriver.variationID ===
                              driver.dependsOnVariationID &&
                              dependsOnGlobalDriver.driverVisibility === true
                            ) {
                              driver.driverVisibility = true;
                            }
                          }

                          return driver; // Return the modified or unchanged driver object
                        }
                      );
                    }
                    return service; // Return the modified or unchanged service object
                  });
                }
                return item; // Return the modified or unchanged item object
              });
            }
            PackageServiceListData.forEach((recServices) => {
              const matchingCatOne = recurringServiceList.find(
                (catOne) => catOne.serviceCatID === recServices.serviceCatID
              );

              if (matchingCatOne) {
                matchingCatOne.servicesList.forEach((serviceOne) => {
                  const matchingService = recServices.servicesList.find(
                    (service) => service.serviceID === serviceOne.serviceID
                  );

                  if (matchingService) {
                    // Update existing service
                    Object.assign(matchingService, serviceOne);
                  }
                  // else if (serviceOne.isSelected) {
                  //   // Add new service if isSelected is true
                  //   recServices.servicesList.push(serviceOne);
                  // }
                });
              }
            });

            await setRecurringServiceList(PackageServiceListData);
          }
        } else {
          // setLoader(false);
          setErrorMessage(data?.data?.errorMessage);
        }
      } else {
        // setLoader(false);
        setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      // setLoader(false);
      console.log(error);
    }
  };

  const GetOneOffServiceListData = async () => {
    // setLoader(true);
    try {
      const data = await GetPackageServicesList({
        userKeyID: common.userKeyID,
        GetSAChanges: location.state.Type ? true : false,
        organisationKeyID: common.organisationKeyID, //common.organisationKeyID,//common.organisationKeyID,
        ServiceChargeTypeID: 2,
        moduleKeyID: packageObj.servicePackageKeyID,
        moduleName: "ServicePackage",
        ProfessionTypeIDs:
          common.professionTypeLists?.length > 1 ||
            common.organisationKeyID === null
            ? packageObj.professionTypeList.map((item) => item.professionTypeId)
            : common.professionTypeLists,
        BusinessTypeIDs:
          packageObj.clientBusinessTypeID.length === 0
            ? null
            : packageObj.clientBusinessTypeID,
        BusinessNatureIDs:
          packageObj.businessNatureID.length === 0
            ? null
            : packageObj.businessNatureID,
        ClientKeyID: null,
        ServicePackageIDs: null,
        QuoteKeyID: null,
      });
      if (data) {
        // setLoader(false);
        if (data?.data?.statusCode === 200) {
          if (data?.data?.responseData?.data) {
            let PackageServiceListData = data.data.responseData.data;
            if (PackageServiceListData.length > 0) {
              PackageServiceListData = PackageServiceListData.map((item) => {
                // Check if the item has servicesList array
                if (item.servicesList && item.servicesList.length > 0) {
                  // Iterate through each service in servicesList
                  item.servicesList = item.servicesList.map((service) => {
                    // Check if pricingDriverList array exists and has elements
                    if (
                      service.pricingDriverList &&
                      service.pricingDriverList.length > 0
                    ) {
                      //Iterate through pricingDriverList array
                      service.pricingDriverList = service.pricingDriverList.map(
                        (driver) => {
                          // Check if driverTypeID is 3 and driverValue, variationID, and slabID are null
                          if (driver.driverTypeID === 3) {
                            // Find the default variation
                            const defaultVariation = driver.variation.find(
                              (variation) => variation.isDefault === true
                            );
                            // Update driverValue and variationID if defaultVariation exists
                            if (defaultVariation) {
                              driver.driverValue =
                                defaultVariation.variationValue;
                              driver.variationID = defaultVariation.variationID;
                            }
                          }
                          // Check if driverTypeID is 4 and driverValue, variationID, and slabID are null
                          else if (driver.driverTypeID === 4) {
                            // Find the default slab
                            const defaultSlab = driver.slab.find(
                              (slab) => slab.isDefault === true
                            );
                            // Update driverValue and slabID if defaultSlab exists
                            if (defaultSlab) {
                              driver.driverValue = defaultSlab.slabValue;
                              driver.slabID = defaultSlab.slabID;
                            }
                          }
                          else if (driver.driverTypeID === 5) {
                            // Find the default date
                              driver.driverValue = driver.text[0].textValue;
                              driver.textID = driver.text[0].textID;
                          }
                          else if (driver.driverTypeID === 6) {
                            // Find the default date
                            const defaultDate = driver.date.find(
                              (date) => date.dateValue === driver.driverValue
                            );
                            // Update driverValue and dateID if defaultDate exists
                            if (defaultDate) {
                              driver.driverValue = defaultDate.dateValue;
                              driver.dateID = defaultDate.dateID;
                            }
                          }
                          // Check if dependsOnGlobalPricingDriverID and dependsOnVariationID are not null
                          if (
                            driver.dependsOnGlobalPricingDriverID !== null &&
                            driver.dependsOnVariationID !== null
                          ) {
                            // Find the globalPricingDriverID with value of dependsOnGlobalPricingDriverID
                            const dependsOnGlobalDriver =
                              service.pricingDriverList.find(
                                (driver2) =>
                                  driver2.globalPricingDriverID ===
                                  driver.dependsOnGlobalPricingDriverID
                              );
                            // Check if dependsOnGlobalDriver exists and has variationID equal to dependsOnVariationID
                            if (
                              dependsOnGlobalDriver &&
                              dependsOnGlobalDriver.variationID ===
                              driver.dependsOnVariationID &&
                              dependsOnGlobalDriver.driverVisibility === true
                            ) {
                              driver.driverVisibility = true;
                            }
                          }
                          return driver; // Return the modified or unchanged driver object
                        }
                      );
                    }
                    return service; // Return the modified or unchanged service object
                  });
                }
                return item; // Return the modified or unchanged item object
              });
            }
            PackageServiceListData.forEach((item) => {
              const matchingCatOne = oneOffServiceList.find(
                (catOne) => catOne.serviceCatID === item.serviceCatID
              );
              if (matchingCatOne) {
                matchingCatOne.servicesList.forEach((serviceOne) => {
                  const matchingService = item.servicesList.find(
                    (service) => service.serviceID === serviceOne.serviceID
                  );
                  if (matchingService) {
                    // Update existing service
                    Object.assign(matchingService, serviceOne);
                  }
                  // else if (serviceOne.isSelected) {
                  //   // Add new service if isSelected is true
                  //   item.servicesList.push(serviceOne);
                  // }
                });
              }
            });
            await setOneOffServiceList(PackageServiceListData);
          }
        } else {
          // setLoader(false);
          setErrorMessage(data?.data?.errorMessage);
        }
      } else {
        // setLoader(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //Nature of business type lookup list
  const GetNOBTypeLookUpListData = async () => {
    try {
      const data = await GetNOBTypeLookupList(
        common.organisationKeyID,
        common.userKeyID
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
    } catch (error) { }
  };

  const GetAdditionalInformationListData = async (
    ServicesIDs = ServiceElementId
  ) => {
    setLoader(true);
    try {
      const data = await GetAdditionalInformationList({
        userKeyID: common.userKeyID,
        organisationKeyID: common.organisationKeyID,
        ServicesIDs,
        moduleKeyID: packageObj.servicePackageKeyID,
        moduleName: "ServicePackage", // "ServicePackage / Quotation / Contract"
        GetSAChanges: location.state.Type ? true : false,
      });

      if (data && data.data) {
        const { statusCode, responseData } = data.data;
        setLoader(false);
        if (statusCode === 200) {
          setLoader(false);

          if (responseData && responseData.data) {
            let additionalInformationListData = responseData.data;
            // additionalInformationListData = additionalInformationListData
            additionalInformationListData.forEach((dataObject) => {
              if (dataObject.driverTypeID == 4) {
                // Access the slab array within each object
                const slabArray = dataObject.slab;

                // Find the default slab object
                const defaultSlab = slabArray.find(
                  (item) => item.isDefault == true
                );

                // Update the driverValue property with the slabValue of the default slab
                if (defaultSlab) {
                  dataObject.driverValue = defaultSlab.slabValue;
                }
              } else if (dataObject.driverTypeID == 3) {
                // Access the variation array within each object
                const variationArray = dataObject.variation;

                // Find the default variation object
                const defaultVariation = variationArray.find(
                  (item) => item.isDefault == true
                );

                // Update the driverValue property with the variationValue of the default variation
                if (defaultVariation) {
                  dataObject.driverValue = defaultVariation.variationValue;
                }
              }
            });
            additionalInformationListData = additionalInformationListData.map(
              (itemTwo) => {
                // Check if there exists a corresponding entry in ArrayOne
                const matchingItem = additionalInformationList.find(
                  (itemOne) =>
                    itemOne.serviceID === itemTwo.serviceID &&
                    itemOne.globalPricingDriverID ===
                    itemTwo.globalPricingDriverID
                );

                // If a matching item is found, copy all data from ArrayOne to ArrayTwo
                if (matchingItem) {
                  // Delete the existing slab array from ArrayTwo item if it exists
                  delete itemTwo.slab;

                  // Copy all properties from matchingItem to itemTwo
                  return Object.assign({}, itemTwo, matchingItem);
                }

                // If no matching item is found, return the original itemTwo
                return itemTwo;
              }
            );

            setAdditionalInformationList(additionalInformationListData);

            if (
              additionalInformationListData.filter(
                (item) => (item.driverTypeID !== 1)
              ).length === 0
            ) {
              setTabHide(false);
              setAdditionalInformationList([]);
              const ServicePricing = await handleSetCalculatedPackageData();
              GetCalculatedServicesPriceData(ServicePricing, 4);
            } else {
              setTabHide(true);
              setIsValidForm({
                ...isValidForm,
                AdditionalInfo: true,
              });
            }
          }
        } else {
          setLoader(false);
          setErrorMessage(responseData?.errorMessage || "Error occurred");
          setActiveTab(activeTab);
          return;
        }
      } else {
        setLoader(false);
      }
    } catch (error) {
      setLoader(false);
      console.error(error);
    }
  };

  const GetBusinessTypeLookupListData = async () => {
    try {
      const data = await GetProspectTypeVariationLookupList(
        common.organisationKeyID,
        common.userKeyID
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

  const GetProfessionTypeLookupListData = async () => {
    try {
      const data = await GetProfessionTypeLookupList();

      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const professionTypeLookupListData = data?.data?.responseData?.data;
          setProfessionTypeLookupList(professionTypeLookupListData);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const ProfessionalTypeLookeupListOptions = professionTypeLookupList.map(
    (ptype) => ({
      value: ptype.professionTypeId,
      label: ptype.professionTypeName,
    })
  );

  const ProfessionTypeValue = packageObj?.professionTypeList?.map((item) => ({
    value: item.professionTypeId,
    label: item.professionTypeName,
  }));

  const professionTypeInputValue = professionTypeLookupList.filter(
    (item) => common.professionTypeLists[0] === item.professionTypeId
  );

  const SelectedService = [
    ...selectedRecurringServiceList,
    ...selectedOneOffServiceList,
  ];

  const modifiedArray = {
    selectedServicesList: SelectedService.flatMap((category) =>
      category.servicesList.map((service) => {
        const moduleServicesGPDList = service.pricingDriverList
          .filter((item) => item.driverVisibility === true)
          .map((driver) => ({
            driverValue:
              driver.variation !== null
                ? driver.variation?.filter((item) => item.isDefault === true)[0]
                  ?.variationValue
                : driver.slab !== null
                  ? driver.slab?.filter((item) => item.isDefault === true)[0]
                    ?.slabValue
                    : driver.date !== null
                    ? driver.date?.length > 0
                      ? driver.date.find(d => d.dateValue === driver.driverValue)?.dateValue
                      ?? driver.date[0].defaultDateValue
                      ?? 0
                      : 0
                    : driver.text !== null
                    ? driver.driverValue ?? driver.text?.find(d => d.textID === driver.textID)?.textValue ?? 0
                  : driver.driverValue,
            msgMapID: driver.msgMapID || null,
            msMapID: driver.msMapID || null,
            globalPricingDriverID: driver.globalPricingDriverID,
            variationID: driver.variation
              ? driver.variation.filter((item) => item.isDefault === true)[0]
                ?.variationID
              : null,
            slabID: driver.slab
              ? driver.slab.filter((item) => item.isDefault === true)[0]?.slabID
              : null,
            textID: driver.driverTypeID === 5
                ? driver.textID || driver.text?.find(d => d.textValue === driver.driverValue)?.textID || null
                : null,
            dateID: driver.date
                ? driver.date.filter((item) => item.isDefault === true)?.dateID
                : null,
            enteredText: driver.enteredText || null,
            enteredDate: driver.enteredDate || null,
            enteredDateFormat: driver.enteredDateFormat || null
          }));

        return {
          driverValue: null,
          msMapID: service.msMapID || null,
          serviceID: service.serviceID,
          serviceCatID: category.serviceCatID,
          serviceChargeTypeID:
            service.serviceChargeTypeName === "One Off" ? 2 : 1,
          servicePackageID: null,
          moduleServicesGPDList:
            moduleServicesGPDList.length === 0 ? null : moduleServicesGPDList,
        };
      })
    ),
  };

  const modifiedAdditionalServiceArray =
    additionalInformationList !== null &&
    additionalInformationList
      .filter(
        (AddItem) =>
          AddItem.driverTypeID !== 1 && AddItem.driverVisibility === true
      )
      ?.map((item) => {
        let driverValue;
        let slabID;
        let dateID;
        let textID;
        let variationID;
        let msgMapID;
        let msMapID;
        if (item.slab && item.slab.some((slabItem) => slabItem.isDefault)) {
          const defaultSlab = item.slab.find((slabItem) => slabItem.isDefault);
          driverValue = defaultSlab.slabValue;
          slabID = defaultSlab.slabID;
          msgMapID = item.msgMapID;
          msMapID = item.msMapID;
        } else if (
          item.variation &&
          item.variation.some((variationItem) => variationItem.isDefault)
        ) {
          const defaultVariation = item.variation.find(
            (variationItem) => variationItem.isDefault
          );
          driverValue = defaultVariation.variationValue;
          variationID = defaultVariation.variationID;
          msgMapID = item.msgMapID;
          msMapID = item.msMapID;
        } else if (
          item.date &&
          item.date.some((dateItem) => dateItem.isDefault)
        ) {
          const defaultDate = item.date.find(
            (dateItem) => dateItem.isDefault
          );
          driverValue = defaultDate.dateValue ?? defaultDate.defaultDateValue ?? 0;
          dateID = defaultDate.dateID;
          msgMapID = item.msgMapID;
          msMapID = item.msMapID;
        } else if (
          item.text !== null
        ) {
          driverValue = item.text?.[0]?.textValue ?? 0;
          textID = item.text?.[0].textID;
          msgMapID = item.msgMapID;
          msMapID = item.msMapID;
        } else if (item.driverTypeID === 2) {
          driverValue = item.driverValue;
          slabID = item.slabID;
          variationID = item.variationID;
          msgMapID = item.msgMapID;
          msMapID = item.msMapID;
        }
        return {
          msgMapID,
          msMapID,
          globalPricingDriverID: item.globalPricingDriverID,
          driverValue,
          variationID,
          slabID,
          dateID,
          textID,
          enteredText: item.enteredText,
          enteredDate: item.enteredDate,
          enteredDateFormat: item.enteredDateFormat
        };
      })
      .filter((item) => item.driverTypeID !== 1)
      .flat();
      console.log(additionalInformationList);
  // profession Type value
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

    setPackageObj({
      ...packageObj,
      professionTypeList: updatedPfList,
    });
    DisableTabOnChange();
  };

  //on change Nature of business type
  const OnNOBChange = (selectedOptions) => {
    if (selectedOptions.filter((item) => item.value === null).length > 0) {
      // If "All" is selected, select all options except "All"
      const updatedNOBList = NatureOfBusinessTypeLookupList.filter(
        (option) => option.value !== null
      ).map((option) => option.value);
      setPackageObj({
        ...packageObj,
        businessNatureID: updatedNOBList,
      });
    } else {
      // Otherwise, select the options the user has chosen
      const updatedNOBList = selectedOptions.map((option) => option.value);
      setPackageObj({
        ...packageObj,
        businessNatureID: updatedNOBList,
      });
    }
    DisableTabOnChange();
  };

  const NOBTypeValue = packageObj?.businessNatureID
    ?.map((businessNatureID) => {
      const matchingNature = NatureOfBusinessTypeLookupList.find(
        (nature) => nature.value === businessNatureID
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
      const updatedClientTypeList = BusinessTypeLookupList.filter(
        (option) => option.value !== null
      ).map((option) => option.value);
      setPackageObj({
        ...packageObj,
        clientBusinessTypeID: updatedClientTypeList,
      });
    } else {
      const updatedClientTypeList = ClientTypeId.map((option) => option.value);
      setPackageObj({
        ...packageObj,
        clientBusinessTypeID: updatedClientTypeList,
      });
    }
    DisableTabOnChange();
  };

  const ClientTypeValue = packageObj?.clientBusinessTypeID
    ?.map((clientBusinessID) => {
      const matchingNature = BusinessTypeLookupList.find(
        (client) => client.value === clientBusinessID
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


  const showModal = (message, driverNamesSet) => {
    setModelRequestData({
      ...modelRequestData,
      Action: "LargePriceValueWarning",
      message: message,
      DriverName: driverNamesSet,
    });
    $("#" + "RecordsAvailablePopupModel").modal("show");
  };

  const GetCalculatedServicesPriceData = async (obj, tab) => {
    setLoader(true);
    if (obj.calculateServicesGPDList.length === 0) {
      return;
    }

    try {
      const data = await GetCalculatedServicesPriceByPackages(obj);

      if (data?.data?.statusCode === 200) {
        setLoader(false);
        if (data?.data?.responseData?.data) {
          const PricingData = data?.data?.responseData?.data;
          const adjustedServiceNames = PricingData
                .filter((s) => s.isPriceAdjustedToZero)
                .map((s) => s.serviceName);
          const vatPercentage = data?.data?.responseData?.vatPercentage;
          const currencyId = data?.data?.responseData?.currencyID;  
          setVATPercentage(vatPercentage);
          setPreferredCurrencyId(currencyId);
          //route additional information to  calculate page
          const RecurringServicePrices = {};
          const OneOffServicePrices = {};
          let hasError = false
          const oneOffService = []
          const RecurringService = []
          // Populate the service prices object with service IDs as keys and prices as values
          PricingData.filter(item => item.serviceChargeTypeID === 1).forEach((service) => {
            if (!RecurringServicePrices[service.serviceCatID]) {
              RecurringServicePrices[service.serviceCatID] = {};
            }
            const ValidPrice = isValidNumber(service.price)
            if (!ValidPrice) {
              hasError = true
              RecurringService.push(service)
            }

            RecurringServicePrices[service.serviceCatID][service.serviceID] = service.price;
          });

          PricingData.filter(item => item.serviceChargeTypeID === 2).forEach((service) => {
            if (!OneOffServicePrices[service.serviceCatID]) {
              OneOffServicePrices[service.serviceCatID] = {};
            }
            const ValidPrice = isValidNumber(service.price)
            if (!ValidPrice) {
              hasError = true
              oneOffService.push(service)
            }
            OneOffServicePrices[service.serviceCatID][service.serviceID] = service.price;
          });
          if (currencyId === 1) {
            setTaxName("VAT");
            setCurrencySymbol("£");
          } else if (currencyId === 2) {
            setTaxName("EU VAT");
            setCurrencySymbol("€");
          } else if (currencyId === 3) {
            setTaxName("Salex Tax");
            setCurrencySymbol("$");
          } else if (currencyId === 4) {
            setTaxName("GST");
            setCurrencySymbol("₹");
          }
          if (hasError) {
            showModal(
              `The result of this operation is too large to be processed. Please check the following services.`,
              [...RecurringService, ...oneOffService]
            );
            return;
          } else {
            setModelRequestData({
              ...modelRequestData,
              Action: null,
              DriverName: [],
              message: ""
            })
          }

          const recArray = recurringServiceList
            .filter((category) =>
              category.servicesList.some((service) => service.isSelected)
            )
            .map((category) => ({
              serviceCatID: category.serviceCatID,
              serviceCatName: category.serviceCatName,
              servicesList: category.servicesList.filter(
                (service) => service.isSelected
              ),
            }));

          const OneArray = oneOffServiceList
            .filter((category) =>
              category.servicesList.some((service) => service.isSelected)
            )
            .map((category) => ({
              serviceCatID: category.serviceCatID,
              serviceCatName: category.serviceCatName,
              servicesList: category.servicesList.filter(
                (service) => service.isSelected
              ),
            }));

          const recArrayWithPrice = await recArray.map((category) => ({
            serviceCatID: category.serviceCatID,
            serviceCatName: category.serviceCatName,
            servicesList: category.servicesList.map((service) => ({
              ...service,
              price: RecurringServicePrices[category.serviceCatID][service.serviceID], // Add the price corresponding to the service ID
            })),
          }));

          const OneArrayWithPrice = await OneArray.map((category) => ({
            serviceCatID: category.serviceCatID,
            serviceCatName: category.serviceCatName,
            servicesList: category.servicesList.map((service) => ({
              ...service,
              price: OneOffServicePrices[category.serviceCatID][service.serviceID], // Add the price corresponding to the service ID
            })),
          }));
          setSelectedRecurringServiceList(recArrayWithPrice);
          setSelectedOneOffServiceList(OneArrayWithPrice);
          const RecTotal = recArrayWithPrice.reduce((acc, category) => {
            return (
              acc +
              category.servicesList.reduce((subtotal, service) => {
                return subtotal + service.price;
              }, 0)
            );
          }, 0);
          const OneOffTotal = OneArrayWithPrice.reduce((acc, category) => {
            return (
              acc +
              category.servicesList.reduce((subtotal, service) => {
                return subtotal + service.price;
              }, 0)
            );
          }, 0);

          // Initialize recurring price variables
          let recOriginalPrice = 0.0;
          let recDefaultPrice = 0.0;
          let recMinPrice = 0.0;
          let recVATPrice = 0.0;
          let recDiscount = 0.0;
          let recDefaultDiscount = 0.0;
          let recMaxDiscount = 0.0;
          let recGrandTotal = 0.0;

          // Calculate recurring prices
          let Decrease = (RecTotal * (Number(RecurringPricingInfo.DefaultDiscountWithDecimal) / 100)).toFixed(2);
          Decrease = Number(Decrease);
          recDiscount = Decrease;
          recDefaultPrice = (RecTotal - Decrease).toFixed(2);
          let MaxDecrease = (RecTotal * (Number(RecurringPricingInfo.MaxDiscountWithDecimal) / 100)).toFixed(2);
          MaxDecrease = Number(MaxDecrease);
          recMinPrice = (RecTotal - MaxDecrease).toFixed(2);
          recOriginalPrice = RecTotal.toFixed(2);

          if (RecurringPricingInfo.OriginalPrice && Number(RecTotal).toFixed(2) !== Number(RecurringPricingInfo.OriginalPrice).toFixed(2)) {
            recVATPrice = Number(recDefaultPrice) * (vatPercentage / 100);
            recGrandTotal = Number(recVATPrice) + Number(recDefaultPrice);
            recMaxDiscount = RecurringPricingInfo.MaxDiscount;
            recDefaultDiscount = RecurringPricingInfo.DefaultDiscount;
          } else {
            recVATPrice = Number(recDefaultPrice) * (vatPercentage / 100);
            recGrandTotal = Number(recVATPrice) + Number(recDefaultPrice);
            recDiscount = RecurringPricingInfo.Discount;
            recDefaultDiscount = RecurringPricingInfo.DefaultDiscount;
            recMaxDiscount = RecurringPricingInfo.MaxDiscount;
          }

          setRecurringPricingInfo({
            ...RecurringPricingInfo,
            OriginalPrice: recOriginalPrice,
            DiscountedTotal: recDefaultPrice,
            DefaultPrice: recDefaultPrice,
            MinPrice: recMinPrice,
            VATPrice: recVATPrice,
            Discount: recDiscount,
            DefaultDiscount: Number(recDefaultDiscount).toFixed(2),
            MaxDiscount: Number(recMaxDiscount).toFixed(2),
            GrandTotal: recGrandTotal,
          });

          // Initialize one-off price variables
          let oneOffOriginalPrice = 0.0;
          let oneOffDefaultPrice = 0.0;
          let oneOffMinPrice = 0.0;
          let oneOffVATPrice = 0.0;
          let oneOffDiscount = 0.0;
          let oneOffDefaultDiscount = 0.0;
          let oneOffMaxDiscount = 0.0;
          let oneOffGrandTotal = 0.0;

          // Calculate one-off prices
          let OneOffDecrease = (OneOffTotal * (Number(OneOffPricingInfo.DefaultDiscountWithDecimal) / 100)).toFixed(2);
          OneOffDecrease = Number(OneOffDecrease);
          oneOffDefaultPrice = (OneOffTotal - OneOffDecrease).toFixed(2);
          let OneOffMaxDecrease = (OneOffTotal * (Number(OneOffPricingInfo.MaxDiscountWithDecimal) / 100)).toFixed(2);
          OneOffMaxDecrease = Number(OneOffMaxDecrease);
          oneOffMinPrice = (OneOffTotal - OneOffMaxDecrease).toFixed(2);
          oneOffOriginalPrice = OneOffTotal.toFixed(2);
          oneOffDiscount = OneOffDecrease
          if (OneOffPricingInfo.OriginalPrice && Number(OneOffTotal).toFixed(2) !== Number(OneOffPricingInfo.OriginalPrice).toFixed(2)) {
            oneOffVATPrice = Number(oneOffDefaultPrice) * (vatPercentage / 100);
            oneOffGrandTotal = Number(oneOffVATPrice) + Number(oneOffDefaultPrice);
            oneOffDefaultDiscount = OneOffPricingInfo.DefaultDiscount;
            oneOffMaxDiscount = OneOffPricingInfo.MaxDiscount;
          } else {
            oneOffVATPrice = Number(oneOffDefaultPrice) * (vatPercentage / 100);
            oneOffGrandTotal = Number(oneOffVATPrice) + Number(oneOffDefaultPrice);
            oneOffDiscount = OneOffPricingInfo.Discount;
            oneOffDefaultDiscount = OneOffPricingInfo.DefaultDiscount;
            oneOffMaxDiscount = OneOffPricingInfo.MaxDiscount;
          }

          setOneOffPricingInfo({
            ...OneOffPricingInfo,
            OriginalPrice: oneOffOriginalPrice,
            DefaultPrice: oneOffDefaultPrice,
            DiscountedTotal: oneOffDefaultPrice,
            MinPrice: oneOffMinPrice,
            VATPrice: oneOffVATPrice,
            Discount: oneOffDiscount,
            DefaultDiscount: Number(oneOffDefaultDiscount).toFixed(2),
            MaxDiscount: Number(oneOffMaxDiscount).toFixed(2),
            GrandTotal: oneOffGrandTotal,
          });
          if (adjustedServiceNames.length > 0) {
            setPriceAdjustedServices(adjustedServiceNames);
            setOpenPriceAdjustedModal(true);
          }
          setLoader(false);
          setActiveTab(tab);
          setIsValidForm({
            ...isValidForm,
            AdditionalInfo: true,
            SelectService: true,
          });
        } else {
          HandleTabChange(3);
          setIsValidForm({
            ...isValidForm,
            AdditionalInfo: true,
            SelectService: true,
          });
          setTabHide(true);
          setLoader(false);
        }
      } else {
        setTabHide(true);
        setOpenErrorModal(true)
        setErrorMessage("The result of this operation is too large to be processed. Please check the input values and try again.")
        setLoader(false);
        setActiveTab(activeTab);
        return;
      }
    } catch (error) {
      setLoader(false);
      setIsValidForm({
        ...isValidForm,
        AdditionalInfo: true,
      });
      setTabHide(true);
      setLoader(false);
      console.log(error);
    }
  };

  const GetServicePackageModelData = async (id, GetSAChanges) => {
    setLoader(true);
    if (!id) {
      return;
    }
    try {
      const response = await GetServicePackageModel(id, GetSAChanges);
      if (response) {
        if (response?.data?.statusCode === 200) {
          setLoader(false);
          if (response?.data?.responseData?.data) {
            const ModelData = response?.data?.responseData?.data;
            // setIsValidForm({
            //   BasicForm: true,
            //   SelectService: true,
            //   AdditionalInfo: true,
            //   PricingInfo: true,
            // })

            loadServiceLists();
            // await GetRecurringServiceListData();
            // await GetOneOffServiceListData();
            setPackageObj({
              ...packageObj,
              servicePackageKeyID: ModelData.servicePackageKeyID,
              professionTypeList: ModelData.professionTypeList,
              servicePackageName: ModelData.servicePackageName,
              businessNatureID:
                ModelData.businessNatureID === null
                  ? []
                  : ModelData.businessNatureID,
              clientBusinessTypeID:
                ModelData.businessTypeID === null
                  ? []
                  : ModelData.businessTypeID,
            });

            const RecOg = ModelData.recurringOriginalPrice == null ? 0 : ModelData.recurringOriginalPrice;
            const recDefault = ModelData.recurringDefaultPrice === null ? 0 : ModelData.recurringDefaultPrice;
            const recMin = ModelData.recurringMinPrice == null ? 0 : ModelData.recurringMinPrice;
            const recDefaultDecrease = Number(RecOg) - Number(recDefault);
            const recMaxDecrease = Number(RecOg) - Number(recMin);
            const recDefaultPercentage = (
              (recDefaultDecrease / RecOg) *
              100
            ).toFixed(2);
            const recDefaultPercentageCopy = (
              (recDefaultDecrease / RecOg) *
              100
            )
            const recMaxPercentage = ((recMaxDecrease / RecOg) * 100).toFixed(
              2
            );
            const recMaxPercentageCopy = ((recMaxDecrease / RecOg) * 100)

            setRecurringPricingInfo({
              ...RecurringPricingInfo,
              OriginalPrice: ModelData.recurringOriginalPrice?.toFixed(2),
              DefaultDiscount: (RecOg == null || RecOg == 0) ? 0 : recDefaultPercentage,
              DefaultPrice: ModelData.recurringDefaultPrice?.toFixed(2),
              DefaultDiscountWithDecimal: (RecOg == null || RecOg == 0) ? 0 : recDefaultPercentageCopy,
              MaxDiscountWithDecimal: (RecOg == null || RecOg == 0) ? 0 : recMaxPercentageCopy,
              MaxDiscount: (RecOg == null || RecOg == 0) ? 0 : recMaxPercentage,
              MinPrice: ModelData.recurringMinPrice?.toFixed(2),
              NetTotal: 0,
              Services: null,
              ServicePrice: 0,
              Discount: recDefaultDecrease,
              DiscountedTotal: recDefault,
            });

            const OneOffOg = ModelData.oneOffOriginalPrice == null ? 0 : ModelData.oneOffOriginalPrice;
            const OneDefault = ModelData.oneOffDefaultPrice == null ? 0 : ModelData.oneOffDefaultPrice;
            const OneMin = ModelData.oneOffMinPrice == null ? 0 : ModelData.oneOffMinPrice;
            const OneDefaultDecrease = Number(OneOffOg) - Number(OneDefault);
            const OneMaxDecrease = Number(OneOffOg) - Number(OneMin);
            const OneDefaultPercentage = (
              (OneDefaultDecrease / OneOffOg) *
              100
            ).toFixed(2);
            const OneMaxPercentage = (
              (OneMaxDecrease / OneOffOg) *
              100
            ).toFixed(2);
            const OneDefaultPercentageCopy = (
              (OneDefaultDecrease / OneOffOg) *
              100
            )
            const OneMaxPercentageCopy = (
              (OneMaxDecrease / OneOffOg) *
              100
            )

            setOneOffPricingInfo({
              ...OneOffPricingInfo,
              OriginalPrice: ModelData.oneOffOriginalPrice?.toFixed(2),
              DefaultDiscount: (OneOffOg == null || OneOffOg == 0) ? 0 : OneDefaultPercentage,
              DefaultPrice: ModelData.oneOffDefaultPrice?.toFixed(2),
              MaxDiscount: (OneOffOg == null || OneOffOg == 0) ? 0 : OneMaxPercentage,
              DefaultDiscountWithDecimal: (OneOffOg == null || OneOffOg == 0) ? 0 : OneDefaultPercentageCopy,
              MaxDiscountWithDecimal: (OneOffOg == null || OneOffOg == 0) ? 0 : OneMaxPercentageCopy,
              MinPrice: ModelData.oneOffMinPrice?.toFixed(2),
              NetTotal: 0,
              Services: null,
              ServicePrice: 0,
              Discount: OneDefaultDecrease,
              DiscountedTotal: OneDefault,
            });
          }
        } else {
          setLoader(false);
          setErrorMessage(response?.data?.errorMessage);
        }
      } else {
        setLoader(false);
        setErrorMessage(response?.data?.errorMessage);
      }
    } catch (error) {
      setLoader(false);
      console.log(error);
    }
  };

  const AddUpdatePackageData = async (ApiRequest_ParamsObj) => {
    setLoader(true);

    try {
      let URL = "/AddUpdateServicesPackage"; //Api URL For Add Data
      if (ApiRequest_ParamsObj.Action !== null) {
        URL = `/AddUpdateServicesPackage?Action=${ApiRequest_ParamsObj.Action}`; //Api URL For Update Data
      }
      const response = await GetAddUpdatePackage(URL, ApiRequest_ParamsObj);
      if (response) {
        setLoader(false);
        if (response?.data?.statusCode === 200) {
          if (ApiRequest_ParamsObj.Action === null) {
            setOpenSuccessModal(true);
            props.setIsAddUpdateActionDone(true);
            $("#" + "ConfirmSAChangesModel").modal("hide");
          } else {
            setOpenSuccessModal(true);
            props.setIsAddUpdateActionDone(true);
            $("#" + "ConfirmSAChangesModel").modal("hide");
          }
        } else {
          setErrorMessage(response?.response?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  async function handleSetCalculatedPackageData() {
    setRequireMessage(false);

    const extractServiceData = (serviceList, serviceChargeTypeID) => {
      return serviceList
        ?.flatMap((recurringItem) =>
          recurringItem?.servicesList
            .filter((i) => i.isSelected === true)
            .map((MapItem) => {
              const pricingDriverList = MapItem.pricingDriverList;
              if (pricingDriverList.length !== 0) {
                return pricingDriverList
                  .filter((item) => item.driverVisibility === true)
                  .map((driver) => ({
                    serviceID: MapItem.serviceID,
                    globalPricingDriverID: driver.globalPricingDriverID,
                    driverValue:
                      (
                        driver.variation?.find(
                          (item) => item.isDefault === true
                        ) || {}
                      ).variationValue ||
                      (
                        driver.slab?.find((item) => item.isDefault === true) ||
                        {}
                      ).slabValue ||
                      (Array.isArray(driver.text) ? driver.text[0].textValue : 0) ||
                        driver.date !== null
                        ? driver.date?.length > 0
                        ? driver.date.find(d => d.dateValue === driver.driverValue)?.dateValue ?? driver.date[0].defaultDateValue : 0
                        : driver.driverValue,
                    variationID:
                      (
                        driver.variation?.find(
                          (item) => item.isDefault === true
                        ) || {}
                      ).variationID || null,
                    slabID:
                      (
                        driver.slab?.find((item) => item.isDefault === true) ||
                        {}
                      ).slabID || null,
                    textID:
                      (
                        (Array.isArray(driver.text) && driver.text.length > 0)
                          ? driver.text[0].textID
                          : null
                      ),
                    dateID: driver.date
                      ? driver.date.filter((item) => item.isDefault === true)
                        ?.dateID
                      : null,
                    serviceChargeTypeID: serviceChargeTypeID,
                    serviceCatID: recurringItem.serviceCatID,
                  }));
              } else {
                return {
                  serviceID: MapItem.serviceID,
                  globalPricingDriverID: null,
                  serviceChargeTypeID: serviceChargeTypeID,
                  serviceCatID: recurringItem.serviceCatID,
                  driverValue: null,
                  variationID: null,
                  slabID: null,
                  textID: null,
                  dateID: null
                };
              }
            })
        )
        .flat();
    };

    const recurringServicesObj = await extractServiceData(recurringServiceList, 1);

    const oneOffServicesObj = await extractServiceData(oneOffServiceList, 2);

    const AdditionalData = additionalInformationList
      ?.filter((item) => {
        if (item.driverTypeID === 2) {
          return true;
        } else if (item.slab !== null) {
          return item.slab.some((slab) => slab.isDefault);
        } else if (item.variation !== null) {
          return item.variation.some((variation) => variation.isDefault);
        }  else if (item.date !== null) {
          return item.date.some((date) => date.isDefault);
        } else if (item.text !== null) {
          return true;
        }else {
          return false;
        }
      })
      .map((item) => ({
        serviceID: item.serviceID,
        globalPricingDriverID: item.globalPricingDriverID,
        driverValue:
          (item.variation?.find((item) => item.isDefault === true) || {})
            .variationValue ||
          (item.slab?.find((item) => item.isDefault === true) || {})
            .slabValue ||
          (item.date?.find((item) => item.isDefault === true) || {})
            .dateValue ||
          (item.text?.[0].textValue ?? 0) ||
          item.driverValue,
        variationID:
          item.variation !== null
            ? item.variation.find((variation) => variation.isDefault)
              ?.variationID
            : null,
        slabID:
          item.slab !== null
            ? item.slab.find((slab) => slab.isDefault)?.slabID
            : null,
        dateID:
          item.date !== null
            ? item.date.find((date) => date.isDefault)?.dateID
            : null,
        textID:
          item.text !== null
            ? item.text?.[0]?.textID ?? null
            : null
      }))
      .flat();

    const ServicePricing = {
      userKeyID: common.userKeyID,
      organisationKeyID: common.organisationKeyID,
      GetValueOf: "Yearly",
      calculateServicesGPDList: [
        ...oneOffServicesObj,
        ...recurringServicesObj,
        ...AdditionalData,
      ],
    };

    return ServicePricing;
  }

  const HandleTabChange = async (NextTab, Pricing) => {

    const ApiRequest_ParamsObj = {
      Action: modelAction === "Add" ? null : "Update",
      organisationKeyID: common.organisationKeyID,
      acceptSAChanges: Pricing === true ? Pricing : undefined,
      businessTypeID: packageObj.clientBusinessTypeID,
      businessNatureID: packageObj.businessNatureID,
      userKeyID: common.userKeyID, //admin : 23C889F3-21DD-4E10-955D-F05B93EB217B , admin : 23DEDB11-2A1B-4A81-84ED-4C565F5E8521
      servicePackageKeyID: packageObj.servicePackageKeyID,
      servicePackageName: packageObj.servicePackageName,
      recurringOriginalPrice:
        selectedRecurringServiceList.length !== 0
          ? RecurringPricingInfo.OriginalPrice
          : null,
      recurringDefaultPrice:
        selectedRecurringServiceList.length !== 0
          ? RecurringPricingInfo.DefaultPrice
          : null,
      recurringMinPrice:
        selectedRecurringServiceList.length !== 0
          ? RecurringPricingInfo.MinPrice
          : null,
      oneOffOriginalPrice:
        selectedOneOffServiceList.length !== 0
          ? OneOffPricingInfo.OriginalPrice
          : null,
      oneOffDefaultPrice:
        selectedOneOffServiceList.length !== 0
          ? OneOffPricingInfo.DefaultPrice
          : null,
      oneOffMinPrice:
        selectedOneOffServiceList.length !== 0
          ? OneOffPricingInfo.MinPrice
          : null,
      isPredefined: true,
      professionTypeList:
        common.professionTypeLists?.length > 1 ||
          common.organisationKeyID === null
          ? packageObj.professionTypeList
          : [
            {
              professionTypeId: professionTypeInputValue[0]?.professionTypeId,
              professionTypeName:
                professionTypeInputValue[0]?.professionTypeName,
            },
          ],
      selectedServicesList: modifiedArray.selectedServicesList || null,
      additionalInformationList: modifiedAdditionalServiceArray || null,
    };
    const RecurringServiceListCheck = recurringServiceList.map((i) =>
      i.servicesList.some((item) => item.isSelected === true)
    );
    const RecurringServiceListLength = RecurringServiceListCheck.filter(
      (i) => i === true
    );
    const OnOffServiceListCheck = oneOffServiceList.map((i) =>
      i.servicesList.some((item) => item.isSelected === true)
    );
    const OnOffServiceListLength = OnOffServiceListCheck.filter(
      (i) => i === true
    );
    const recurringServicesIDsElement = await recurringServiceList?.flatMap(
      (item) =>
        item?.servicesList
          .filter((i) => i.isSelected === true)
          .map((newT) => newT.serviceID)
    );

    const oneOffServicesIDsElement = await oneOffServiceList?.flatMap((item) =>
      item?.servicesList
        .filter((i) => i.isSelected === true)
        .map((newT) => newT.serviceID)
    );

    const ServicesIDsElement = await recurringServicesIDsElement.concat(
      oneOffServicesIDsElement
    );
    setServiceElementId(ServicesIDsElement);
    if (NextTab === PackageHeader.AdditionalInformation) {
      if (ServicesIDsElement.length === 0) {
        setIsValidForm({
          ...isValidForm,
          AdditionalInfo: false,
          SelectService: false,
        });
        setRequireMessage(true);
        return false;
      } else {
        let hasUndefinedDriver = false;
        let hasUndefinedDriver2 = false;

        recurringServiceList.some((rService) => {
          return rService.servicesList?.some((service) => {
            if (service.isSelected === true) {
              for (let i = 0; i < service.pricingDriverList.length; i++) {
                const pricingList = service.pricingDriverList[i];
                if (
                  pricingList.driverVisibility &&
                  (pricingList.driverValue === undefined ||
                    pricingList.driverValue === null ||
                    pricingList.driverValue === "")
                ) {
                  hasUndefinedDriver = true;
                  const elementId = `SelectServiceQuantity_${pricingList.driverName}`; // Generate unique ID for the element
                  scrollUpDownByElementID(elementId);
                  setIsValidForm({
                    ...isValidForm,
                    BasicForm: true,
                    AdditionalInfo: false,
                    PricingInfo: false,
                  });
                  return true; // Break out of the inner loop and stop iterating
                } else {
                  hasUndefinedDriver = false;
                  setIsValidForm({
                    ...isValidForm,
                    BasicForm: true,
                    PricingInfo: true,
                  });
                }
              }
            }
          });
        });
        oneOffServiceList.some((rService) => {
          return rService.servicesList?.some((service) => {
            if (service.isSelected === true) {
              for (let i = 0; i < service.pricingDriverList.length; i++) {
                const pricingList = service.pricingDriverList[i];
                let count = 0; // Initialize count to zero
                count++; // Increment count by one

                if (
                  pricingList.driverVisibility &&
                  (pricingList.driverValue === undefined ||
                    pricingList.driverValue === null ||
                    pricingList.driverValue === "")
                ) {
                  hasUndefinedDriver2 = true;
                  setRequireMessage(true);
                  const elementId = `SelectServiceQuantity_${pricingList.driverName}`; // Generate unique ID for the element
                  scrollUpDownByElementID(elementId);
                  setIsValidForm({
                    ...isValidForm,
                    BasicForm: true,
                    AdditionalInfo: false,
                    PricingInfo: false,
                  });
                  return true; // Break out of the inner loop and stop iterating
                } else {
                  hasUndefinedDriver2 = false;
                  setRequireMessage(true);
                  setIsValidForm({
                    ...isValidForm,
                    BasicForm: true,
                    PricingInfo: true,
                  });
                }
              }
            }
          });
        });

        if (hasUndefinedDriver || hasUndefinedDriver2) {
          setRequireMessage(true);
          setIsValidForm({
            ...isValidForm,
            SelectService: false,
            PricingInfo: false,
          });
        } else if (
          RecurringServiceListLength.length >= 1 ||
          OnOffServiceListLength.length >= 1
        ) {
          setIsValidForm({
            ...isValidForm,
            BasicForm: true,
            SelectService: true,
            PricingInfo: true,
          });
          setRequireMessage(false);
          await GetAdditionalInformationListData(ServicesIDsElement);
        }
      }
    }
    if (activeTab === PackageHeader.BasicInformation) {
      if (
        ((common.professionTypeLists?.length > 1 ||
          common.organisationKeyID === null) &&
          packageObj.professionTypeList?.length === 0) ||
        packageObj.servicePackageName === null ||
        packageObj.servicePackageName === "" ||
        packageObj.businessNatureID.length === 0 ||
        packageObj.clientBusinessTypeID.length === 0
      ) {
        setIsValidForm({
          ...isValidForm,
          BasicForm: false,
          SelectService: false,
          AdditionalInfo: false,
        });
        setRequireMessage(true);
      } else {
        // if (isBack) {
        loadServiceLists();
        // GetRecurringServiceListData();
        // GetOneOffServiceListData();
        // }
        setIsValidForm({
          ...isValidForm,
          BasicForm: true,
        });
        if (NextTab === 4) {
          return;
        }
        setActiveTab(NextTab);
        setRequireMessage(false);
      }
    } else if (activeTab === PackageHeader.SelectServices) {
      let hasUndefinedDriver = false;
      let hasUndefinedDriver2 = false;
      let hasUndefinedTextOrDateorquantityDriver = false;

      recurringServiceList.some((rService) => {
        return rService.servicesList?.some((service) => {
          if (service.isSelected === true) {
            for (let i = 0; i < service.pricingDriverList.length; i++) {
              const pricingList = service.pricingDriverList[i];
              if (
                service.pricingDriverList[i].driverVisibility &&
                service.pricingDriverList[i].driverTypeID !== 5 && service.pricingDriverList[i].driverTypeID !== 6 &&
                (service.pricingDriverList[i].driverValue === undefined ||
                  service.pricingDriverList[i].driverValue === null ||
                  service.pricingDriverList[i].driverValue === "")
              ) {
                hasUndefinedDriver = true;
                const elementId = `SelectServiceQuantity_${pricingList.driverName}`; // Generate unique ID for the element
                scrollUpDownByElementID(elementId);
                setIsValidForm({
                  ...isValidForm,
                  BasicForm: true,
                  AdditionalInfo: false,
                  PricingInfo: false,
                });
                return true; // Break out of the inner loop and stop iterating
              } else {
                hasUndefinedDriver = false;
                setIsValidForm({
                  ...isValidForm,
                  BasicForm: true,
                  PricingInfo: true,
                });
              }
              if (
                pricingList.driverVisibility &&
                pricingList.driverTypeID === 6 &&
                (pricingList.enteredDate === undefined ||
                  pricingList.enteredDate === null ||
                  pricingList.enteredDate === "")
              ) {
                hasUndefinedTextOrDateorquantityDriver = true;
              }
              if (
                pricingList.driverVisibility &&
                (pricingList.driverTypeID === 5) &&
                (pricingList.enteredText === undefined ||
                  pricingList.enteredText === null ||
                  pricingList.enteredText === "")
              ) {
                hasUndefinedTextOrDateorquantityDriver = true;
              }
              if (
                pricingList.driverVisibility &&
                pricingList.driverTypeID === 2 &&
                Number(pricingList.driverValue)
              ) {
                const value = Number(pricingList.driverValue);
                const from = pricingList.quantity?.[0]?.quantityFrom;
                const to = pricingList.quantity?.[0]?.quantityTo;

                const parsedFrom = Number(from);
                const parsedTo = Number(to);

                const hasFrom = from !== undefined && from !== null && from !== '' && !isNaN(parsedFrom);
                const hasTo = to !== undefined && to !== null && to !== '' && !isNaN(parsedTo);

                if (
                  (hasFrom && hasTo && (value < parsedFrom || value > parsedTo)) ||
                  (hasFrom && !hasTo && value < parsedFrom) ||
                  (!hasFrom && hasTo && value > parsedTo)
                ) {
                  hasUndefinedTextOrDateorquantityDriver = true;
                }
              }
            }
          }
        });
      });
      oneOffServiceList.some((rService) => {
        return rService.servicesList?.some((service) => {
          if (service.isSelected === true) {
            for (let i = 0; i < service.pricingDriverList.length; i++) {
              const pricingList = service.pricingDriverList[i];
              if (
                service.pricingDriverList[i].driverVisibility &&
                service.pricingDriverList[i].driverTypeID !== 5 && service.pricingDriverList[i].driverTypeID !== 6 &&
                (service.pricingDriverList[i].driverValue === undefined ||
                  service.pricingDriverList[i].driverValue === null ||
                  service.pricingDriverList[i].driverValue === "")
              ) {
                hasUndefinedDriver2 = true;
                setRequireMessage(true);
                const elementId = `SelectServiceQuantity_${pricingList.driverName}`; // Generate unique ID for the element
                scrollUpDownByElementID(elementId);
                setIsValidForm({
                  ...isValidForm,
                  BasicForm: true,
                  AdditionalInfo: false,
                  PricingInfo: false,
                });
                return true; // Break out of the inner loop and stop iterating
              } else {
                hasUndefinedDriver2 = false;
                setRequireMessage(true);
                setIsValidForm({
                  ...isValidForm,
                  BasicForm: true,
                  PricingInfo: true,
                });
              }
              if (
                pricingList.driverVisibility &&
                pricingList.driverTypeID === 6 &&
                (pricingList.enteredDate === undefined ||
                  pricingList.enteredDate === null ||
                  pricingList.enteredDate === "")
              ) {
                hasUndefinedTextOrDateorquantityDriver = true;
              }
              if (
                pricingList.driverVisibility &&
                (pricingList.driverTypeID === 5) &&
                (pricingList.enteredText === undefined ||
                  pricingList.enteredText === null ||
                  pricingList.enteredText === "")
              ) {
                hasUndefinedTextOrDateorquantityDriver = true;
              }
              if (
                pricingList.driverVisibility &&
                pricingList.driverTypeID === 2 &&
                Number(pricingList.driverValue)
              ) {
                const value = Number(pricingList.driverValue);
                const from = pricingList.quantity?.[0]?.quantityFrom;
                const to = pricingList.quantity?.[0]?.quantityTo;

                const parsedFrom = Number(from);
                const parsedTo = Number(to);

                const hasFrom = from !== undefined && from !== null && from !== '' && !isNaN(parsedFrom);
                const hasTo = to !== undefined && to !== null && to !== '' && !isNaN(parsedTo);

                if (
                  (hasFrom && hasTo && (value < parsedFrom || value > parsedTo)) ||
                  (hasFrom && !hasTo && value < parsedFrom) ||
                  (!hasFrom && hasTo && value > parsedTo)
                ) {
                  hasUndefinedTextOrDateorquantityDriver = true;
                }
              }
            }
          }
        });
      });

      if (hasUndefinedDriver || hasUndefinedDriver2 || hasUndefinedTextOrDateorquantityDriver) {
        setRequireMessage(true);
        setIsValidForm({
          ...isValidForm,
          SelectService: false,
          PricingInfo: false,
        });
      } else if (
        RecurringServiceListLength.length >= 1 ||
        OnOffServiceListLength.length >= 1
      ) {
        setIsValidForm({
          ...isValidForm,
          BasicForm: true,
          SelectService: true,
          PricingInfo: true,
        });
        setActiveTab(NextTab);
        setRequireMessage(false);
        await GetAdditionalInformationListData(ServicesIDsElement);
      } else {
        setIsValidForm({
          ...isValidForm,
          SelectService: false,
          AdditionalInfo: false,
          PricingInfo: false,
        });
        setRequireMessage(true);
      }
    } else if (activeTab === PackageHeader.AdditionalInformation) {
      // Filter the list based on driverTypeID being either 2 or 4
      const filteredList = additionalInformationList.filter(
        (item) => item.driverTypeID === 2 || item.driverTypeID === 4 || item.driverTypeID === 3 || item.driverTypeID === 6 || item.driverTypeID === 5
      );
      // Check if any of the filtered items have driverValue as null, empty string, or undefined
      const hasInvalidValues = filteredList.some(
        (i) =>
          i.driverValue === null ||
          i.driverValue === "" ||
          i.driverValue === undefined
      );

      if (hasInvalidValues) {
        setRequireMessage(true);
        setIsValidForm({
          ...isValidForm,
          PricingInfo: false,
        });
        return
      } else {
        setRequireMessage(false);
        const ServicePricing = await handleSetCalculatedPackageData();
        GetCalculatedServicesPriceData(ServicePricing, 4);
      }
    } else if (activeTab === PackageHeader.PricingInformation) {
      let hasError = true;
      if (
        (selectedRecurringServiceList.length !== 0 &&
          (RecurringPricingInfo.DefaultPrice === "" ||
            RecurringPricingInfo.DefaultPrice === null ||
            RecurringPricingInfo.DefaultPrice === undefined ||
            RecurringPricingInfo.MinPrice === undefined ||
            RecurringPricingInfo.MinPrice === null ||
            RecurringPricingInfo.MinPrice === "")) ||
        (selectedOneOffServiceList.length !== 0 &&
          (OneOffPricingInfo.DefaultPrice === "" ||
            OneOffPricingInfo.DefaultPrice === null ||
            OneOffPricingInfo.DefaultPrice === undefined ||
            OneOffPricingInfo.MinPrice === undefined ||
            OneOffPricingInfo.MinPrice === null ||
            OneOffPricingInfo.MinPrice === ""))
      ) {
        setRequireMessage(true);
        if (
          RecurringPricingInfo.DefaultPrice === "" ||
          RecurringPricingInfo.DefaultPrice === null ||
          RecurringPricingInfo.DefaultPrice === undefined
        ) {
          scrollUpDownByElementID("recurring_Default");
        } else if (
          RecurringPricingInfo.MinPrice === undefined ||
          RecurringPricingInfo.MinPrice === null ||
          RecurringPricingInfo.MinPrice === ""
        ) {
          scrollUpDownByElementID("recurring_Min");
        } else if (
          OneOffPricingInfo.DefaultPrice === "" ||
          OneOffPricingInfo.DefaultPrice === null ||
          OneOffPricingInfo.DefaultPrice === undefined
        ) {
          scrollUpDownByElementID("OneOff_Default");
        } else if (
          OneOffPricingInfo.MinPrice === undefined ||
          OneOffPricingInfo.MinPrice === null ||
          OneOffPricingInfo.MinPrice === ""
        ) {
          scrollUpDownByElementID("OneOff_min");
        }
        hasError = false;
        return false;
      } else if (
        (selectedRecurringServiceList.length !== 0 &&
          (isNaN(RecurringPricingInfo.DefaultPrice) ||
            isNaN(RecurringPricingInfo.MinPrice))) ||
        (selectedOneOffServiceList.length !== 0 &&
          (isNaN(OneOffPricingInfo.DefaultPrice) ||
            isNaN(OneOffPricingInfo.MinPrice)))
      ) {
        hasError = false;
        if (
          isNaN(RecurringPricingInfo.DefaultPrice) ||
          isNaN(RecurringPricingInfo.MinPrice)
        ) {
          setRequireMessage(true);
          scrollUpDownByElementID("recurring_Default");
          return false;
        } else {
          setRequireMessage(true);
          scrollUpDownByElementID("OneOff_Default");
          return false;
        }
      }
      if (selectedRecurringServiceList.length !== 0) {
        if (
          RecurringPricingInfo.DefaultPrice !== "" &&
          RecurringPricingInfo.DefaultPrice !== null &&
          RecurringPricingInfo.DefaultPrice !== undefined
        ) {
          if (
            Number(RecurringPricingInfo.DefaultPrice) <= 0 ||
            Number(RecurringPricingInfo.MinPrice) <= 0 ||
            Number(RecurringPricingInfo.DefaultPrice) >
            Number(RecurringPricingInfo.OriginalPrice)
          ) {
            setRequireMessage(true);
            scrollUpDownByElementID("recurring_Default");
            hasError = false;
            return false;
          } else if (
            RecurringPricingInfo.MinPrice !== undefined ||
            RecurringPricingInfo.MinPrice !== null ||
            RecurringPricingInfo.MinPrice !== ""
          ) {
            if (
              Number(RecurringPricingInfo.MinPrice) >
              Number(RecurringPricingInfo.DefaultPrice)
            ) {
              setRequireMessage(true);
              scrollUpDownByElementID("recurring_Min");
              hasError = false;
              return false;
            }
          }
        }
      }

      if (selectedOneOffServiceList.length !== 0) {
        if (
          OneOffPricingInfo.DefaultPrice !== "" &&
          OneOffPricingInfo.DefaultPrice !== null &&
          OneOffPricingInfo.DefaultPrice !== undefined
        ) {
          if (
            Number(OneOffPricingInfo.DefaultPrice) <= 0 ||
            Number(OneOffPricingInfo.MinPrice) <= 0 ||
            Number(OneOffPricingInfo.DefaultPrice) >
            Number(OneOffPricingInfo.OriginalPrice)
          ) {
            setRequireMessage(true);
            scrollUpDownByElementID("OneOff_Default");
            hasError = false;
            return false;
          } else if (
            OneOffPricingInfo.MinPrice !== undefined ||
            OneOffPricingInfo.MinPrice !== null ||
            OneOffPricingInfo.MinPrice !== ""
          ) {
            if (
              Number(OneOffPricingInfo.MinPrice) >
              Number(OneOffPricingInfo.DefaultPrice)
            ) {
              setRequireMessage(true);
              scrollUpDownByElementID("OneOff_min");
              hasError = false;
              return false;
            }
          } else {
            setRequireMessage(false);
            hasError = true;
          }
        }
      }
      if (Pricing === "Accept") {
        $("#" + "ConfirmSAChangesModel").modal("show");
        setStatus(true)
        return
      }
      if (hasError) {

        AddUpdatePackageData(ApiRequest_ParamsObj);
      }
    }
  };

  const handleChangeTab = async (newTab, clickedTabID) => {
    let clickedTabClasses = $("#" + clickedTabID).attr("class");
    if (clickedTabClasses.includes("disabled")) {
      return false;
    }
    if (newTab <= activeTab) {
      setActiveTab(newTab);
    } else {
      if (newTab === 4) {
        await HandleTabChange(newTab, "Pricing");
      }
      HandleTabChange(newTab);
    }
  };

  const HandleOk = () => {
    setTopbar("block");
    navigate("/packages");
  };

  const handleClose = async () => {
    const closeModal = modelRequestData.message.includes("The result of this operation")
    if (closeModal) {
      setOpenErrorModal(false)
      $("#" + "RecordsAvailablePopupModel").modal("hide");
      setModelRequestData({
        ...modelRequestData,
        Action: null,
        DriverName: [],
        message: ""
      })
      return false
    }
    if (isCheck) {
      setLoader(true)
      const Notification = await NotifySuperAdminPredefinedChangesToAdmin({
        userKeyID: common.userKeyID,
        moduleKeyID: location.state?.servicePackageKeyID,
        moduleName: "Predefined-ServicePackage"
      })
      if (Notification?.data?.statusCode === 200) {
        setLoader(false)
        setModelAction("NotificationSend")
        setOpenSuccessModal(true)
        setIsCheck(false)
      }
    } else {
      $("#" + "ConfirmSAChangesModel").modal("hide");
      setOpenSuccessModal(false);
      navigate("/packages");
    }
  };

  const HandleBack = (NextTab) => {
    if (activeTab === PackageHeader.SelectServices) {
      setActiveTab(NextTab);
      setRequireMessage(false);
    }
    if (activeTab === PackageHeader.SelectServices) {
      setActiveTab(NextTab);
      setRequireMessage(false);
    }

    setActiveTab(NextTab);
    setRequireMessage(false);
  };

  const handleCancel = () => {
    navigate("/packages");
  };

  const DisableTabOnChange = () => {
    if (activeTab == PackageHeader.BasicInformation) {
      setIsValidForm({
        ...isValidForm,
        BasicForm: false,
        SelectService: false,
        AdditionalInfo: false,
        PricingInfo: false,
      });
    } else if (activeTab == PackageHeader.SelectServices) {
      setIsValidForm({
        ...isValidForm,
        SelectService: false,
        AdditionalInfo: false,
        PricingInfo: false,
      });
    } else if (activeTab == PackageHeader.AdditionalInformation) {
      setIsValidForm({
        ...isValidForm,
        AdditionalInfo: false,
        PricingInfo: false,
      });
    }
  };
  const DeclineSuperAdminChangesData = async (Decline) => {
    if (Decline === "Decline") {
      // $('#' + props.id).modal('hide')

      setStatus(false)
      $("#" + "ConfirmSAChangesModel").modal("show");
      return
    }
    setLoader(true);
    try {
      const apiRequestParams = {
        organisationKeyID: common.organisationKeyID,
        userKeyID: common.userKeyID,
        moduleKeyID: packageObj.servicePackageKeyID,
        moduleName: "Predefined-ServicePackage"
        //Predefined-ServiceCategory, Predefined-GlobalConstant, Predefined-GlobalPricingDriver,
        //Predefined-PL-EL-Template, Predefined-TnC-Template, Predefined-Email-Template,
        //Predefined-Service, Predefined-ServicePackage
      }
      const response = await DeclineSuperAdminChanges(apiRequestParams);
      if (response) {
        setLoader(false);
        if (response?.data?.statusCode === 200) {
          if (apiRequestParams.Action === null) {
            $("#" + "ConfirmSAChangesModel").modal("hide");
            // setOpenSuccessModal(true);
            navigate("/packages")
            props.setIsAddUpdateActionDone(true);
          } else {
            $("#" + "ConfirmSAChangesModel").modal("hide");
            // setOpenSuccessModal(true);
            navigate("/packages")
            props.setIsAddUpdateActionDone(true);
          }
        } else {
          setOpenErrorModal(true)
          $("#" + "ConfirmSAChangesModel").modal("hide");
          setErrorMessage(response?.response?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  const handleConfirmButton = () => {
    $("#" + "ConfirmSAChangesModel").modal("hide");
    if (Status) {
      HandleTabChange(5, true)
    } else {
      DeclineSuperAdminChangesData()
    }
  }
  //E] Designing part:
  // Stepper colours only: PackageHeader values are in step order.
  const getPackageStepState = (tabValue) => {
    if (activeTab === tabValue) return " is-active";
    if (tabValue < activeTab) return " is-complete";
    return "";
  };

  return (
    <div>
      {" "}
      <div className="container-fluid proposal-ui proposal-ui--fluid pkg-form">
        <div>
          <div className="row form-row">
            <div className="col-12">
              <div className="proposal-header">
              <h3 class="modal-title">
                <BackButtonSvg onClick={handleCancel} />
                {modelAction === "Add"
                  ? getCrudPopUpTitleName("Add", moduleName)
                  : getCrudPopUpTitleName("Update", moduleName)}
                {modelAction !== "Add" ? ` : ` : ""}{" "}
                {isMobile
                  ? packageObj.servicePackageName?.length > 10
                    ? `${packageObj.servicePackageName.substring(0, 10)}...`
                    : packageObj.servicePackageName
                  : packageObj.servicePackageName?.length > 35
                    ? `${packageObj.servicePackageName.substring(0, 35)}...`
                    : packageObj.servicePackageName}
              </h3>

              <div
                className="steps proposal-header__steps"
                style={{ pointerEvents: "all" }}
              >
                <ul className="steps-list">
                  <li>
                    <div
                      id="PackageBasicInformation"
                      onClick={() =>
                        handleChangeTab(1, "PackageBasicInformation")
                      }
                      class={`${
                        activeTab === PackageHeader.BasicInformation
                          ? "step tab-field-center"
                          : isValidForm.BasicForm === true
                            ? "step tab-field-center"
                            : "step disabled cursor-not-allowed tab-field-center"
                      } w-90${getPackageStepState(PackageHeader.BasicInformation)}`}
                    >
                      <span class="stepCount">1</span>
                      <span class="stepTitle">Basic Information</span>
                      &nbsp;
                      {activeTab == PackageHeader.BasicInformation &&
                        requireMessage && (
                          <span className="validation">
                            <InvalidFormIcon />
                          </span>
                        )}
                    </div>
                  </li>
                  <li>
                    <div
                      id="PackageSelectService"
                      onClick={() => handleChangeTab(2, "PackageSelectService")}
                      class={`${
                        activeTab === PackageHeader.SelectServices
                          ? "step tab-field-center"
                          : isValidForm.BasicForm === true
                            ? "step tab-field-center"
                            : "step disabled cursor-not-allowed tab-field-center"
                      } w-90${getPackageStepState(PackageHeader.SelectServices)}`}
                    >
                      <span class="stepCount">2</span>
                      <span class="stepTitle">Select Services</span>
                      &nbsp;
                      {activeTab == PackageHeader.SelectServices &&
                        requireMessage && (
                          <span className="validation">
                            <InvalidFormIcon />
                          </span>
                        )}
                    </div>
                  </li>
                  <li style={{ display: TabHide ? "list-item" : "none" }}>
                    <div
                      id="PackageAdditionalInfo"
                      onClick={() =>
                        handleChangeTab(3, "PackageAdditionalInfo")
                      }
                      className={`${
                        activeTab === PackageHeader.AdditionalInformation
                          ? "step tab-field-center"
                          : isValidForm.SelectService === true
                            ? "step tab-field-center"
                            : "step disabled cursor-not-allowed tab-field-center"
                      } w-90${getPackageStepState(PackageHeader.AdditionalInformation)}`}
                    >
                      <span className="stepCount">3</span>
                      <span className="stepTitle">Additional Information</span>
                      &nbsp;
                      {activeTab == PackageHeader.AdditionalInformation &&
                        requireMessage && (
                          <span className="validation">
                            <InvalidFormIcon />
                          </span>
                        )}
                    </div>
                  </li>
                  <li>
                    <div
                      id="PackagePricingInfo"
                      onClick={() => handleChangeTab(4, "PackagePricingInfo")}
                      class={`${
                        activeTab === PackageHeader.PricingInformation
                          ? "step tab-field-center"
                          : (
                                TabHide
                                  ? isValidForm.AdditionalInfo === true
                                  : isValidForm.SelectService === true
                              )
                            ? "step tab-field-center"
                            : "step disabled cursor-not-allowed tab-field-center"
                      } w-90${getPackageStepState(PackageHeader.PricingInformation)}`}
                    >
                      <span class="stepCount">{TabHide ? `4` : `3`}</span>
                      <span class="stepTitle">Pricing Information</span>
                      &nbsp;
                      {activeTab == PackageHeader.PricingInformation &&
                        requireMessage && (
                          <span className="validation">
                            <InvalidFormIcon />
                          </span>
                        )}
                    </div>
                  </li>
                </ul>
              </div>
              </div>
              {activeTab === PackageHeader.BasicInformation && (
                <BasicInformationComponent
                  DisableTabOnChange={DisableTabOnChange}
                  requireMessage={requireMessage}
                  DeclineSuperAdminChangesData={DeclineSuperAdminChangesData}
                  moduleName={moduleName}
                  modelRequestData={location.state}
                  getSAChanges={getSAChanges}
                  setPackageObj={setPackageObj}
                  isValidForm={isValidForm}
                  setIsValidForm={setIsValidForm}
                  professionTypeInputValue={professionTypeInputValue}
                  NOBTypeValue={NOBTypeValue}
                  ClientTypeValue={ClientTypeValue}
                  OnClientTypeChange={OnClientTypeChange}
                  ProfessionTypeValue={ProfessionTypeValue}
                  packageObj={packageObj}
                  common={common}
                  getCrudButtonTextName={getCrudButtonTextName}
                  getCrudPopUpTitleName={getCrudPopUpTitleName}
                  prospectName={prospectName}
                  OnProfessionTypeChange={OnProfessionTypeChange}
                  OnNOBChange={OnNOBChange}
                  ProfessionalTypeLookeupListOptions={
                    ProfessionalTypeLookeupListOptions
                  }
                  NatureOfBusinessTypeLookupList={
                    NatureOfBusinessTypeLookupList
                  }
                  setNatureOfBusinessTypeLookupList={
                    setNatureOfBusinessTypeLookupList
                  }
                  BusinessTypeLookupList={BusinessTypeLookupList}
                  handleCancel={handleCancel}
                  HandleTabChange={HandleTabChange}
                  HandleBack={HandleBack}
                />
              )}
              {activeTab === PackageHeader.SelectServices && (
                <SelectServices
                  DisableTabOnChange={DisableTabOnChange}
                  oneOffObj={oneOffObj}
                  requireMessage={requireMessage}
                  setOneOffObj={setOneOffObj}
                  isValidForm={isValidForm}
                  DeclineSuperAdminChangesData={DeclineSuperAdminChangesData}
                  setIsValidForm={setIsValidForm}
                  recurringObj={recurringObj}
                  setOneOffPricingInfo={setOneOffPricingInfo}
                  OneOffPricingInfo={OneOffPricingInfo}
                  setRecurringPricingInfo={setRecurringPricingInfo}
                  RecurringPricingInfo={RecurringPricingInfo}
                  setRecurringObj={setRecurringObj}
                  recurringServiceList={recurringServiceList}
                  setRecurringServiceList={setRecurringServiceList}
                  GetAdditionalInformationListData={
                    GetAdditionalInformationListData
                  }
                  getCrudButtonTextName={getCrudButtonTextName}
                  getCrudPopUpTitleName={getCrudPopUpTitleName}
                  moduleName={moduleName}
                  getSAChanges={getSAChanges}
                  setOneOffServiceList={setOneOffServiceList}
                  oneOffServiceList={oneOffServiceList}
                  recurringError={recurringError}
                  setRecurringError={setRecurringError}
                  HandleTabChange={HandleTabChange}
                  handleCancel={handleCancel}
                  HandleBack={HandleBack}
                />
              )}
              {activeTab === PackageHeader.AdditionalInformation && (
                <Suspense>
                  <AdditionalInformation
                    DisableTabOnChange={DisableTabOnChange}
                    getCrudButtonTextName={getCrudButtonTextName}
                    getCrudPopUpTitleName={getCrudPopUpTitleName}
                    HandleTabChange={HandleTabChange}
                    HandleBack={HandleBack}
                    getSAChanges={getSAChanges}
                    DeclineSuperAdminChangesData={DeclineSuperAdminChangesData}
                    isValidForm={isValidForm}
                    setIsValidForm={setIsValidForm}
                    requireMessage={requireMessage}
                    additionalInformationList={additionalInformationList}
                    setAdditionalInformationList={setAdditionalInformationList}
                    recurringError={recurringError}
                    handleCancel={handleCancel}
                    moduleName={moduleName}
                  />
                </Suspense>
              )}
              {activeTab === PackageHeader.PricingInformation && (
                <PricingInformation
                  DisableTabOnChange={DisableTabOnChange}
                  TabHide={TabHide}
                  getSAChanges={getSAChanges}
                  isValidForm={isValidForm}
                  setIsValidForm={setIsValidForm}
                  packageObj={packageObj}
                  DeclineSuperAdminChangesData={DeclineSuperAdminChangesData}
                  moduleName={moduleName}
                  getCrudButtonTextName={getCrudButtonTextName}
                  getCrudPopUpTitleName={getCrudPopUpTitleName}
                  requireMessage={requireMessage}
                  modelAction={modelAction}
                  HandleTabChange={HandleTabChange}
                  RecurringPricingInfo={RecurringPricingInfo}
                  setRecurringPricingInfo={setRecurringPricingInfo}
                  OneOffPricingInfo={OneOffPricingInfo}
                  setOneOffPricingInfo={setOneOffPricingInfo}
                  recurringServicesObj={recurringServicesObj}
                  setRecurringServicesObj={setRecurringServicesObj}
                  oneOffServiceObj={oneOffServiceObj}
                  setOneOffServiceObj={setOneOffServiceObj}
                  setVATPercentage={setVATPercentage}
                  vatPercentage={vatPercentage}
                  taxName={taxName}
                  currencySymbol={currencySymbol}
                  preferredCurrencyId={preferredCurrencyId}
                  // HandleSubmission={HandleSubmission}
                  errorMessage={errorMessage}
                  selectedRecurringServiceList={selectedRecurringServiceList}
                  selectedOneOffServiceList={selectedOneOffServiceList}
                  HandleBack={HandleBack}
                  handleCancel={handleCancel}
                  HandleOk={HandleOk}
                />
              )}
            </div>
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
      <ErrorModel
        ErrorModel={openErrorModal}
        handleClose={handleClose}
        ErrorMessage={errorMessage}
      />
      <RecordsAvailablePopupModel
        handleClose={handleClose}
        openErrorModal={openErrorModal}
        openSuccessModal={openSuccessModal}
        modelRequestData={modelRequestData}
      />
      <SuccessModal
        message={`${moduleName} ${packageObj.servicePackageName}`}
        modelAction={modelAction}
        onClick={HandleOk}
        setIsCheck={setIsCheck}
        isCheck={isCheck}
        openSuccessModal={openSuccessModal}
        handleClose={handleClose}
      />
      <PriceAdjustedToZeroFloorValue
        open={openPriceAdjustedModal}
        serviceNames={priceAdjustedServices}
        currencySymbol={currencySymbol}
        handleClose={() => setOpenPriceAdjustedModal(false)}
      />
    </div>
  );
};

export default AddUpdatePackage;
