/* global $ */
import React, { useContext, useEffect, useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker.entry";
import { lazy, Suspense } from "react";
import "../../pages/configure/packages/Package.css";
import Select from "react-select";
import ReactDOMServer from "react-dom/server";
import SuccessModal from "../../components/SuccessModal";
import { AuthContextProvider } from "../../AuthContext/AuthContext";
import { useNavigate } from "react-router";
import Utils from "../../Middleware/Utils";
import { useLocation } from "react-router-dom";
import EditableCell from "../../components/EditableCell";
import "./Engagement_Letter.css";
import {
  ChangeDefaultPaymentGatewaysTypes,
  EngagementLetterHeader,
  fieldToIdMap,
  Payment_Frequency,
  ServiceChargeTypeEnum,
  servicePackageTypeID,
  statusID,
} from "../../Middleware/enums";
import {
  AddUpdateEngagement,
  GetContractModel,
} from "../../redux/Services/EngagementLetter/EngagementLetterApi";
import { useSelector } from "react-redux";
import {
  GetAdditionalInformationList,
  GetPackageServicesList,
  GetServicePackageLookupList,
} from "../../redux/Services/Config/PackageApi";
import {
  GetClientLookupList,
  GetOfficersForQuoteAndContract,
} from "../../redux/Services/client/clientAPI";
import {
  GetCalculatedServicesPrice,
  GetCalculatedServicesPriceByPackages,
} from "../../redux/Services/Config/ServicesApi";
import { ERROR_MESSAGES } from "../../components/GlobalMessage";
import {
  GetTemplateListLookupList,
  GetTemplateModelData,
} from "../../redux/Services/Config/TemplateApi";
// import { SelectServices } from "../../components/SelectServices";
// import { AdditionalInformation } from "../../components/AdditionalInformation";
// import PreviewComponentPdf from "../../components/PreviewComponentpdf";
import { GetOrganisationInformationModel } from "../../redux/Services/Setting/Organisation";
import BackButtonSvg from "../../components/BackButtonSvg";
import {
  GetTermsAndConditionsLookupList,
  GetTermsAndConditionsModel,
} from "../../redux/Services/Config/TermAndConditionApi";
import {
  GetQuoteLookupList,
  GetSelectedServicePackageAccept,
} from "../../redux/Services/Proposal/ProposalApi";
import { GetPricingSettingModel } from "../../redux/Services/Setting/PricingSettingApi";
import PricingModel from "../../components/PricingModel";
import InvalidFormIcon from "../../components/InvalidFormIcon";
import { GetSendToSignEasy } from "../../redux/Services/SignEasy";
import { GetVariableValuesForTnCTemplate } from "../../redux/Services/ReplaceVariables";
import ViewPlan from "../../components/ViewPlan";
import ErrorModel from "../../components/ErrorModel";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { GetPaymentGatewayModel } from "../../redux/Services/Setting/PaymentGatewayApi";
import PaymentGatewayModel from "../../components/PaymentGatewayModel";
import RecordsAvailablePopupModel from "../../components/RecordsAvailablePopupModel";
import Text_Editor from "../../components/Text_Editor";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import PricingTableTemplatesModal from "../../components/PricingTableTemplatesModal";
import {
  calculateCustomOneOffPackageFooter,
  calculateCustomPackageRow,
  calculateCustomRecurringPackageFooter,
  calculateCustomServiceFooter,
  calculateCustomServiceRow,
  hasCalculationValue,
} from "../../Middleware/helpers";
import { getServiceScopeDriverList } from "../../lib/utils";
import PriceAdjustedToZeroFloorValue from "../../components/PriceAdjustedToZeroFloorValue";
const SelectServices = lazy(() => import("../../components/SelectServices"));
const PreviewComponentPdf = lazy(
  () => import("../../components/PreviewComponentpdf"),
);
const AdditionalInformation = lazy(
  () => import("../../components/AdditionalInformation"),
);
// const PricingTableTemplatesModal = lazy(
//   () => import("../../components/PricingTableTemplatesModal"),
// );
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const BasicInformationComponent = (props) => {
  const navigate = useNavigate();
  const handleAddClient = () => {
    navigate("/create-new-client", { state: { ModuleName: "EL" } });
  };
  useEffect(() => {
    if (props.engagementObj.QuoteKeyID) {
      const defaultProposal = props.proposalLookUpOptions.find(
        (item) => item.value === props.engagementObj.QuoteKeyID,
      );
      if (defaultProposal) {
        props.handleChangeProposal(defaultProposal);
      }
    }
  }, [props.engagementObj.QuoteKeyID, props.proposalLookUpOptions]);

  return (
    <>
      <div className="create-practice-height scrollbar">
        <div className="tab-content">
          <div className="tab-pane p-3 active">
            <div className="row fieldset">
              <div class="col-md-3  text-start text-md-end">
                <label class="form-label">Select Source</label>
                <span class="text-danger">*</span>
              </div>
              <div className="col-md-9">
                <div>
                  <div className="mb-1 input-group">
                    <Select
                      className="phone-input-country-code selectDropDown"
                      value={props.SelectSourceValue}
                      options={props.updatedData}
                      onChange={(e) => {
                        props.handleChangeSourceType(e);
                      }}
                    />
                    {props.requireMessage &&
                    (props.engagementObj.selectSourceId === undefined ||
                      props.engagementObj.selectSourceId === null ||
                      props.engagementObj.selectSourceId === "") ? (
                      <span className="validation">{ERROR_MESSAGES}</span>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            </div>
            {(props.engagementObj.selectSourceId === 1 ||
              props.engagementObj.selectSourceId === 3 ||
              props.engagementObj.selectSourceId === 4) && (
              <div className="row fieldset">
                <div class="col-md-3  text-start margin-prospect text-md-end">
                  <label class="form-label">Select {props.prospectName}</label>
                  <span class="text-danger">*</span>
                </div>
                <div className="col-md-9">
                  <div>
                    <button
                      style={{
                        fontSize: "12px",
                        float: "right",
                        border: "none",
                        background: "transparent",
                        color: "#626ed4",
                      }}
                      className="float-sm-end"
                      onClick={handleAddClient}
                    >
                      + Add New {props.prospectName}
                    </button>
                    <div className="mb-1 input-group ">
                      <Select
                        className="phone-input-country-code selectDropDown"
                        value={
                          props.ClientValue === undefined
                            ? null
                            : props.ClientValue
                        }
                        options={props.clientLookUpOptions}
                        onChange={(e) => {
                          props.handleChangeClient(e);
                        }}
                      />
                      {props.requireMessage &&
                      (props.engagementObj.ClientID === undefined ||
                        props.engagementObj.ClientID === null ||
                        props.engagementObj.ClientID === "") ? (
                        <span className="validation">{ERROR_MESSAGES}</span>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {props.engagementObj.selectSourceId === 2 && (
              <div className="row fieldset">
                <div class="col-md-3  text-start text-md-end">
                  <label class="form-label">Select {props.proposalName}</label>
                  <span class="text-danger">*</span>
                </div>
                <div className="col-md-9">
                  <div>
                    <div className="mb-1 input-group ">
                      <Select
                        className="phone-input-country-code selectDropDown"
                        value={props.SelectProposalTypeValue}
                        options={props.proposalLookUpOptions}
                        onChange={(e) => {
                          props.handleChangeProposal(e);
                        }}
                      />
                      {props.requireMessage &&
                      (props.engagementObj.QuoteKeyID === undefined ||
                        props.engagementObj.QuoteKeyID === null ||
                        props.engagementObj.QuoteKeyID === "") ? (
                        <span className="validation">{ERROR_MESSAGES}</span>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(props.getServicePackageLookupList?.length > 0 ||
              props.engagementObj.selectSourceId === 3 ||
              props.engagementObj.selectSourceId === 4) && (
              <div className="row fieldset">
                <div class="col-md-3  text-start text-md-end">
                  <label class="form-label">Select Package</label>
                  <span class="text-danger">*</span>
                </div>
                <div className="col-md-9">
                  <div>
                    <div className="mb-1 input-group ">
                      <Select
                        className="phone-input-country-code selectDropDown"
                        value={
                          props.SelectPackagesTypeValue === undefined
                            ? null
                            : props.SelectPackagesTypeValue
                        }
                        options={props.getServicePackageLookupList.map(
                          (item) => ({
                            value: item.value,
                            label: item.label,
                            servicePackageKeyID: item.servicePackageKeyID,
                            needToUpdate: item.needToUpdate,
                          }),
                        )}
                        formatOptionLabel={(data) => (
                          <div>
                            {data.needToUpdate && (
                              <span className="text-danger">*</span>
                            )}{" "}
                            {data.label}
                          </div>
                        )}
                        onChange={(e) => {
                          props.handleChangePackage(e);
                        }}
                      />
                      {props.requireMessage &&
                      (props.engagementObj.acceptedServicePackageID ===
                        undefined ||
                        props.engagementObj.acceptedServicePackageID === null ||
                        props.engagementObj.acceptedServicePackageID === "") ? (
                        <span className="validation">{ERROR_MESSAGES}</span>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div class="row fieldset">
              <div class="col-md-3  text-start text-md-end">
                <label class="form-label">Select Template</label>
                <span class="text-danger">*</span>
              </div>
              <div class="col-md-9">
                <div>
                  <div className="mb-1 input-group ">
                    <Select
                      className="user-role-select"
                      options={props.templateLookUpOptions}
                      value={
                        props.TemplateValue == undefined
                          ? null
                          : props.TemplateValue
                      }
                      onChange={(e) => {
                        props.DisableTabOnChange();
                        props.setTemplateElementList([]);
                        props.setEngagementObj({
                          ...props.engagementObj,
                          templateKeyID: e.value,
                          templateID: e.templateID,
                        });
                        const selectedTemplate =
                          props.templateLookUpOptions.find(
                            (item) => item.templateID === e.templateID,
                          );
                        if (selectedTemplate) {
                          props.setHeaderContent(
                            selectedTemplate.headerContent,
                          );
                          props.setFooterContent(
                            selectedTemplate.footerContent,
                          );
                          props.setHeaderImage(selectedTemplate.headerImage);
                          props.setFooterImage(selectedTemplate.footerImage);
                          props.setHeaderHeight(selectedTemplate.headerHeight);
                          props.setFooterHeight(selectedTemplate.footerHeight);
                          props.setOrientationID(
                            selectedTemplate?.orientationID,
                          );
                          props.setFontFamily(
                            props.getFontNameById(
                              selectedTemplate.fontFamilyID,
                            ),
                          );
                          props.setShowSeparatorLines(
                            selectedTemplate.showSeparatorLines,
                          );
                          props.updateVisibleFieldsFromIds(
                            selectedTemplate.pricingTableColumnIDs,
                          );
                          props.setServiceDescriptionObj((prev) => ({
                            ...prev,
                            mainHeading: selectedTemplate?.mainHeadingSD,
                            recurringOnGoingHeading:
                              selectedTemplate?.recurringOnGoingHeadingSD,
                            oneOffAdhocHeading:
                              selectedTemplate?.oneOffAdhocHeadingSD,
                            mainHeadingFontSize:
                              selectedTemplate?.mainHeadingFontSizeSD,
                            recurringOnGoingHeadingFontSize:
                              selectedTemplate?.recurringOnGoingHeadingFontSizeSD,
                            oneOffAdhocFontSize:
                              selectedTemplate?.oneOffAdhocFontSizeSD,
                            mainHeadingIsBold:
                              selectedTemplate?.mainHeadingIsBoldSD,
                            mainHeadingIsItalic:
                              selectedTemplate?.mainHeadingIsItalicSD,
                            recurringOnGoingHeadingIsBold:
                              selectedTemplate?.recurringOnGoingHeadingIsBoldSD,
                            recurringOnGoingHeadingIsItalic:
                              selectedTemplate?.recurringOnGoingHeadingIsItalicSD,
                            oneOffAdhocHeadingIsBold:
                              selectedTemplate?.oneOffAdhocHeadingIsBoldSD,
                            oneOffAdhocHeadingIsItalic:
                              selectedTemplate?.oneOffAdhocHeadingIsItalicSD,
                          }));
                          props.setStatementOfFactsObj((prev) => ({
                            ...prev,
                            mainHeading: selectedTemplate?.mainHeadingSOF,
                            recurringOnGoingHeading:
                              selectedTemplate?.recurringOnGoingHeadingSOF,
                            oneOffAdhocHeading:
                              selectedTemplate?.oneOffAdhocHeadingSOF,
                            mainHeadingFontSize:
                              selectedTemplate?.mainHeadingFontSizeSOF,
                            recurringOnGoingHeadingFontSize:
                              selectedTemplate?.recurringOnGoingHeadingFontSizeSOF,
                            oneOffAdhocFontSize:
                              selectedTemplate?.oneOffAdhocFontSizeSOF,
                            mainHeadingIsBold:
                              selectedTemplate?.mainHeadingIsBoldSOF,
                            mainHeadingIsItalic:
                              selectedTemplate?.mainHeadingIsItalicSOF,
                            recurringOnGoingHeadingIsBold:
                              selectedTemplate?.recurringOnGoingHeadingIsBoldSOF,
                            recurringOnGoingHeadingIsItalic:
                              selectedTemplate?.recurringOnGoingHeadingIsItalicSOF,
                            oneOffAdhocHeadingIsBold:
                              selectedTemplate?.oneOffAdhocHeadingIsBoldSOF,
                            oneOffAdhocHeadingIsItalic:
                              selectedTemplate?.oneOffAdhocHeadingIsItalicSOF,
                          }));
                        }
                        props.setIsTemplateManuallySelected(true);
                      }}
                    />
                    {props.requireMessage &&
                    (props.engagementObj.templateKeyID === undefined ||
                      props.engagementObj.templateKeyID === null ||
                      props.engagementObj.templateKeyID === "") ? (
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
      <div class="separator"></div>
      <div class="row fieldset">
        <div class="col-lg-12 hstack  gap-2 justify-content-end text-right mt-3">
          <div class="d-flex" style={{ overflowX: "auto" }}>
            <button
              class="btn btn-md btn-light mr-1"
              onClick={() => props.handleCancel()}
            >
              <span>{props.getCrudButtonTextName("Cancel")}</span>
            </button>
            <button
              type="submit"
              class="btn btn-md btn-success create-item-btn"
              onClick={() => props.HandleTabChange(2)}
            >
              <span>Next</span>
            </button>
            <button
              type="submit"
              class="btn btn-md btn-success create-item-btn "
              onClick={() => props.HandleTabChange(2, statusID.Draft)}
              style={{ marginLeft: "5px" }}
            >
              <span>Save as a Draft</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const ReviewServicesComponent = (props) => {
  const isInitialMount = useRef(true);
  const modifiedFeesType = Utils.feeInProposal.map((option) =>
    option.value === 1 && props.disableCondition
      ? { ...option, isDisabled: true }
      : option,
  );

  const modifiedPaymentGatewayType = Utils.payment_gateway.map((option) => {
    const isGoCardlessTokenInvalid =
      props.paymentGatewayObj.goCardlessAccessToken === null ||
      props.paymentGatewayObj.goCardlessAccessToken === undefined ||
      props.paymentGatewayObj.goCardlessAccessToken === "";

    const isStripeKeysInvalid =
      (props.paymentGatewayObj.stripePublishableKey === null ||
        props.paymentGatewayObj.stripePublishableKey === undefined ||
        props.paymentGatewayObj.stripePublishableKey === "") &&
      (props.paymentGatewayObj.stripeSecretKey === null ||
        props.paymentGatewayObj.stripeSecretKey === undefined ||
        props.paymentGatewayObj.stripeSecretKey === "");
    const isBankTransferInvalid =
      (props.paymentGatewayObj.AccountNumber === null ||
        props.paymentGatewayObj.AccountNumber === undefined ||
        props.paymentGatewayObj.AccountNumber === "") &&
      (props.paymentGatewayObj.bankTransferName === null ||
        props.paymentGatewayObj.bankTransferName === undefined ||
        props.paymentGatewayObj.bankTransferName === "") &&
      (props.paymentGatewayObj.sortCode === null ||
        props.paymentGatewayObj.sortCode === undefined ||
        props.paymentGatewayObj.sortCode === "");
    if (option.value === 3 && isGoCardlessTokenInvalid) {
      return { ...option, isDisabled: true }; // Disable this option
    } else if (option.value === 2 && isStripeKeysInvalid) {
      return { ...option, isDisabled: true }; // Disable this option
    } else if (option.value === 4 && isBankTransferInvalid) {
      return { ...option, isDisabled: true }; // Disable this option
    } else {
      return option; // Keep this option as is
    }
  });

  const feeTypeValue = modifiedFeesType.find(
    (item) => props.engagementObj.feeTypeId == item.value,
  );
  const PaymentGatewayValue = Utils.payment_gateway.find(
    (item) => props.engagementObj.paymentGatewayID == item.value,
  );
  const selectedFrequency = Utils.Payment_Frequency.find(
    (item) => props.engagementObj.Payment_Frequency == item.value,
  );
  const [RecurringPackageCalculation, setRecurringPackageCalculation] =
    useState({
      //Net Total :
      PackageOneNetTotal: null,

      //Net Total Add On Value :
      PackageOneNetTotalAddOnValue: 0,

      //Vat Total Amount :
      VatPercentage: null,
      PackageOneVatTotalAmount: null,

      //Discount :
      PackageOneDiscountAmount: null,

      //Discounted Total Amount :
      PackageOneDiscountedTotalAmount: null,

      //Grand Total Amount :
      PackageOneGrandTotalAmount: null,
    });

  const [OneOffPackageCalculation, setOneOffPackageCalculation] = useState({
    //Net Total :
    PackageOneNetTotal: null,

    //Net Total Add On Value :
    PackageOneNetTotalAddOnValue: 0,

    //Vat Total Amount :
    VatPercentage: null,
    PackageOneVatTotalAmount: null,

    //Discount :
    PackageOneDiscountAmount: null,

    //Discounted Total Amount :
    PackageOneDiscountedTotalAmount: null,

    //Grand Total Amount :
    PackageOneGrandTotalAmount: null,
  });

  const [
    lastPaymentFrequencyAndDiscountedPrice,
    setLastPaymentFrequencyAndDiscountedPrice,
  ] = useState({
    YearlyOriginalPrice: props.RecurringFrequencyPricingInfo.OriginalPrice,
    ChangeableYearlyPrice:
      props.RecurringFrequencyPricingInfo.DefaultDiscount !== null
        ? props.RecurringFrequencyPricingInfo.DiscountedPrice
        : props.RecurringFrequencyPricingInfo.OriginalPrice,
    PaymentFrequencyID: props.engagementObj.Payment_Frequency,
    DiscountedPrice: props.RecurringFrequencyPricingInfo.OriginalPrice,
    DefaultRecYearlyDiscount: props.RecurringPricingInfo.DefaultDiscount,
    DefaultOneOfPYearlyDiscount: props.OneOffPricingInfo.DefaultDiscount,
  });

  useEffect(() => {
    CalculateRecurringPackageNetTotal();
    CalculateOneOffPackageNetTotal();
  }, [props]);
  useEffect(() => {
    const htmlContent = generateCombinedServicesHTML();
    props.setServiceDescriptionHTML(htmlContent);
  }, []);

  useEffect(() => {
    const htmlContent = generateSOFHTML();
    props.setStatementOfFactsHTML(htmlContent);
  }, []);
  useEffect(() => {
    const isRecurringDiscounted =
      Number(props.RecurringPricingInfo.DiscountedPrice) >
      Number(props.RecurringPricingInfo.OriginalPrice);
    const isOneOffDiscounted =
      Number(props.OneOffPricingInfo.DiscountedPrice) >
      Number(props.OneOffPricingInfo.OriginalPrice);
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (isRecurringDiscounted || isOneOffDiscounted) {
        props.setDisableCondition(true);
      } else {
        props.setDisableCondition(false);
      }
      return;
    }
    if (isRecurringDiscounted || isOneOffDiscounted) {
      props.setDisableCondition(true);
      props.setEngagementObj({
        ...props.engagementObj,
        feeTypeId: 2,
        DiscountLines: false,
      });
    } else {
      props.setDisableCondition(false);
      props.setEngagementObj({
        ...props.engagementObj,
        feeTypeId: 1,
        DiscountLines: true,
      });
    }
  }, [
    props.RecurringPricingInfo.DiscountedPrice,
    props.RecurringPricingInfo.OriginalPrice,
    props.OneOffPricingInfo.DiscountedPrice,
    props.OneOffPricingInfo.OriginalPrice,
  ]);
  const handleOneOffDefaultPrice = (e) => {
    e.preventDefault();
    props.DisableTabOnChange();
    const inputValue = e.target.value.replace(/[^0-9.-]/g, ""); // Allow only numeric, dot, comma, and hyphen characters

    let sanitizedInput = inputValue;
    sanitizedInput = props.hasHyphenAfterNumber(sanitizedInput);
    // Split the input into integer and decimal parts
    const [integerPart, decimalPart] = sanitizedInput.split(".");

    // Combine integer and decimal parts with appropriate precision
    let formattedInput;
    if (decimalPart !== undefined) {
      if (integerPart.includes("-")) {
        // For negative values, ensure 5 digits after the negative sign
        formattedInput = `-${integerPart.slice(1, 13)}.${decimalPart.slice(
          0,
          2,
        )}`;
      } else {
        // For positive values, limit to 5 digits before the decimal point
        formattedInput = `${integerPart.slice(0, 12)}.${decimalPart.slice(
          0,
          2,
        )}`;
      }
    } else {
      // No decimal part, limit to 5 digits
      formattedInput = integerPart.includes("-")
        ? `-${integerPart.slice(1, 13)}`
        : `${integerPart.slice(0, 12)}`;
    }
    const recurringServicesTotal = Number(
      props.OneOffPricingInfo.OriginalPrice,
    );
    let decrease = Number(recurringServicesTotal) - Number(formattedInput);

    let percentage = (decrease / recurringServicesTotal) * 100;
    if (percentage === -Infinity || percentage === NaN) {
      percentage = 0;
    }

    percentage = percentage.toFixed(2);
    let percentageCopy = (decrease / recurringServicesTotal) * 100;
    if (percentageCopy === -Infinity || percentageCopy === NaN) {
      percentageCopy = 0;
    }
    const TotalDiscount = recurringServicesTotal - decrease;
    const VatPrice = (
      Number(formattedInput) *
      (Number(props.vatPercentage) / 100)
    ).toFixed(2);
    let FinalPrice = Number(VatPrice) + Number(TotalDiscount);
    FinalPrice = (Math.floor(FinalPrice * 100) / 100).toFixed(2);
    if (formattedInput !== "") {
      props.setOneOffPricingInfo({
        ...props.OneOffPricingInfo,
        DiscountedPrice: formattedInput,
        DefaultDiscount: percentage,
        Discount: decrease,
        DiscountedTotal: TotalDiscount,
        VATPrice: VatPrice,
        GrandTotal: FinalPrice,
      });
      props.setOneOffPricingInfoCopy({
        ...props.OneOffPricingInfoCopy,
        DiscountedPrice: formattedInput,
        DefaultDiscount: percentageCopy,
        Discount: decrease,
        DiscountedTotal: TotalDiscount,
        VATPrice: VatPrice,
        GrandTotal: FinalPrice,
      });
    } else {
      props.setOneOffPricingInfo({
        ...props.OneOffPricingInfo,
        DiscountedPrice: formattedInput,
        DefaultDiscount: percentage,
        Discount: decrease,
        DiscountedTotal: TotalDiscount,
        VATPrice: VatPrice,
        GrandTotal: FinalPrice,
      });
      props.setOneOffPricingInfoCopy({
        ...props.OneOffPricingInfoCopy,
        DiscountedPrice: formattedInput,
        DefaultDiscount: percentageCopy,
        Discount: decrease,
        DiscountedTotal: TotalDiscount,
        VATPrice: VatPrice,
        GrandTotal: FinalPrice,
      });
    }
  };

  const handleRecurringDefaultPrice = (e) => {
    e.preventDefault();
    props.DisableTabOnChange();
    const inputValue = e.target.value.replace(/[^0-9.-]/g, ""); // Allow only numeric, dot, comma, and hyphen characters
    let sanitizedInput = inputValue;
    sanitizedInput = props.hasHyphenAfterNumber(sanitizedInput);
    // Split the input into integer and decimal parts
    const [integerPart, decimalPart] = sanitizedInput.split(".");
    // Combine integer and decimal parts with appropriate precision
    let formattedInput;
    if (decimalPart !== undefined) {
      if (integerPart.includes("-")) {
        // For negative values, ensure 5 digits after the negative sign
        formattedInput = `-${integerPart.slice(1, 13)}.${decimalPart.slice(
          0,
          2,
        )}`;
      } else {
        // For positive values, limit to 5 digits before the decimal point
        formattedInput = `${integerPart.slice(0, 12)}.${decimalPart.slice(
          0,
          2,
        )}`;
      }
    } else {
      // No decimal part, limit to 5 digits
      formattedInput = integerPart.includes("-")
        ? `-${integerPart.slice(1, 13)}`
        : `${integerPart.slice(0, 12)}`;
    }

    const recurringServicesTotal = Number(
      props.RecurringPricingInfo.OriginalPrice,
    );
    const defaultPrice = Number(formattedInput);

    let CalculatedYearlyPrice = 0.0;
    if (
      lastPaymentFrequencyAndDiscountedPrice.PaymentFrequencyID ===
      Payment_Frequency.Yearly
    ) {
      CalculatedYearlyPrice = defaultPrice;
    } else if (
      lastPaymentFrequencyAndDiscountedPrice.PaymentFrequencyID ===
      Payment_Frequency.HalfYearly
    ) {
      CalculatedYearlyPrice = defaultPrice * 2;
    } else if (
      lastPaymentFrequencyAndDiscountedPrice.PaymentFrequencyID ===
      Payment_Frequency.Quarterly
    ) {
      CalculatedYearlyPrice = defaultPrice * 4;
    }
    if (
      lastPaymentFrequencyAndDiscountedPrice.PaymentFrequencyID ===
      Payment_Frequency.Monthly
    ) {
      CalculatedYearlyPrice = defaultPrice * 12;
    }
    setLastPaymentFrequencyAndDiscountedPrice({
      ...lastPaymentFrequencyAndDiscountedPrice,
      ChangeableYearlyPrice: CalculatedYearlyPrice,
    });

    let decrease = recurringServicesTotal - Number(defaultPrice);
    // if (decrease < 0) {
    //   return;
    // }
    let percentage = (decrease / recurringServicesTotal) * 100;
    if (percentage === -Infinity || percentage === NaN) {
      percentage = 0;
    }
    percentage = percentage.toFixed(2);
    let percentageCopy = (decrease / recurringServicesTotal) * 100;
    if (percentageCopy === -Infinity || percentageCopy === NaN) {
      percentageCopy = 0;
    }
    const TotalDiscount =
      Number(props.RecurringPricingInfo.OriginalPrice) - Number(decrease);
    const VatPrice = (
      Number(formattedInput) *
      (Number(props.vatPercentage) / 100)
    ).toFixed(2);
    let FinalPrice = Number(VatPrice) + Number(TotalDiscount);
    FinalPrice = (Math.floor(FinalPrice * 100) / 100).toFixed(2);

    if (formattedInput !== "") {
      props.setRecurringPricingInfo({
        ...props.RecurringPricingInfo,
        DiscountedPrice: formattedInput,
        DefaultDiscount: percentage,
        Discount: decrease,
        DiscountedTotal: TotalDiscount,
        VATPrice: VatPrice,
        GrandTotal: FinalPrice,
      });
      props.setRecurringFrequencyPricingInfo({
        ...props.RecurringFrequencyPricingInfo,
        DiscountedPrice: formattedInput,
        DefaultDiscount: percentageCopy,
        Discount: decrease,
        DiscountedTotal: TotalDiscount,
        VATPrice: VatPrice,
        GrandTotal: FinalPrice,
      });
    } else {
      props.setRecurringPricingInfo({
        ...props.RecurringPricingInfo,
        DiscountedPrice: formattedInput,
        DefaultDiscount: percentage,
        Discount: decrease,
        DiscountedTotal: TotalDiscount,
        VATPrice: VatPrice,
        GrandTotal: FinalPrice,
      });
      props.setRecurringFrequencyPricingInfo({
        ...props.RecurringFrequencyPricingInfo,
        DiscountedPrice: formattedInput,
        DefaultDiscount: percentage,
        Discount: decrease,
        DiscountedTotal: TotalDiscount,
        VATPrice: VatPrice,
        GrandTotal: FinalPrice,
      });
    }
  };
  const handlePaymentFrequencyChange = (e) => {
    props.DisableTabOnChange();
    setLastPaymentFrequencyAndDiscountedPrice({
      ...lastPaymentFrequencyAndDiscountedPrice,
      PaymentFrequencyID: e.value,
    });
    const data =
      props.RecurringFrequencyPricingInfo.DefaultDiscount !== null
        ? props.RecurringFrequencyPricingInfo.DiscountedPrice
        : props.RecurringFrequencyPricingInfo.OriginalPrice;
    let DiscountedPrice = props.RecurringFrequencyPricingInfo.DiscountedPrice;
    let DefaultDiscount = props.RecurringFrequencyPricingInfo.DefaultDiscount;
    let Discount = props.RecurringFrequencyPricingInfo.Discount;
    let DiscountedTotal = props.RecurringFrequencyPricingInfo.DiscountedTotal;
    let VATPrice = props.RecurringFrequencyPricingInfo.VATPrice;
    let GrandTotal = props.RecurringFrequencyPricingInfo.GrandTotal;

    const updatedData = JSON.parse(
      JSON.stringify(props.selectedRecurringServiceListCopy),
    );
    // Store original price
    let OriginalPrice = props.RecurringFrequencyPricingInfo.OriginalPrice;

    // Calculate price based on payment frequency

    let calculatedOriginalPriceFromServices = 0;
    if (e.value === Payment_Frequency.Yearly) {
      props.setEngagementObj((prevState) => ({
        ...prevState,
        Payment_Frequency: e.value,
      }));

      updatedData.forEach((category) => {
        category.servicesList.forEach((service) => {
          // Perform the percentage calculation for each value
          let currentServicePrice =
            service.originalServicePrice === undefined
              ? (service.quotationPrice = Number(service.quotationPrice))
              : (service.originalServicePrice = Number(
                  service.originalServicePrice,
                ));

          let currentServicePriceWithToFixed =
            Number(currentServicePrice)?.toFixed(2);
          service.price = currentServicePriceWithToFixed;
          service.quotationPrice = currentServicePriceWithToFixed;
          calculatedOriginalPriceFromServices = Number(
            Number(calculatedOriginalPriceFromServices) +
              Number(currentServicePriceWithToFixed),
          )?.toFixed(2);

          // service.price === undefined
          //   ? (service.quotationPrice = Number(service.quotationPrice))
          //   : (service.price = Number(service.price));
        });
      });
      DiscountedPrice = calculatedOriginalPriceFromServices;
      if (props.RecurringPricingInfo.DefaultDiscount > 0) {
        DiscountedPrice =
          lastPaymentFrequencyAndDiscountedPrice.ChangeableYearlyPrice;
      }
      //lastPaymentFrequencyAndDiscountedPrice.ChangeableYearlyPrice; //DiscountedPrice / 2; // Divide yearly price by 2 for half-yearly
      //OriginalPrice = OriginalPrice;
      OriginalPrice = calculatedOriginalPriceFromServices;
    } else if (e.value === Payment_Frequency.HalfYearly) {
      props.setEngagementObj((prevState) => ({
        ...prevState,
        Payment_Frequency: e.value,
      }));
      updatedData.forEach((category) => {
        category.servicesList.forEach((service) => {
          // Perform the percentage calculation for each value

          let currentServicePrice =
            service.originalServicePrice === undefined
              ? (service.quotationPrice = Number(service.quotationPrice) / 2)
              : (service.originalServicePrice =
                  Number(service.originalServicePrice) / 2);

          let currentServicePriceWithToFixed =
            Number(currentServicePrice)?.toFixed(2);
          service.price = currentServicePriceWithToFixed;
          service.quotationPrice = currentServicePriceWithToFixed;
          calculatedOriginalPriceFromServices = Number(
            Number(calculatedOriginalPriceFromServices) +
              Number(currentServicePriceWithToFixed),
          )?.toFixed(2);
        });
      });
      DiscountedPrice = calculatedOriginalPriceFromServices;
      if (props.RecurringPricingInfo.DefaultDiscount > 0) {
        DiscountedPrice =
          lastPaymentFrequencyAndDiscountedPrice.ChangeableYearlyPrice / 2;
      }

      OriginalPrice = calculatedOriginalPriceFromServices;
    } else if (e.value === Payment_Frequency.Quarterly) {
      props.setEngagementObj((prevState) => ({
        ...prevState,
        Payment_Frequency: e.value,
      }));
      updatedData.forEach((category) => {
        category.servicesList.forEach((service) => {
          // Perform the percentage calculation for each value
          let currentServicePrice =
            service.originalServicePrice === undefined
              ? (service.quotationPrice = Number(service.quotationPrice) / 4)
              : (service.originalServicePrice =
                  Number(service.originalServicePrice) / 4);

          let currentServicePriceWithToFixed =
            Number(currentServicePrice)?.toFixed(2);
          service.price = currentServicePriceWithToFixed;
          service.quotationPrice = currentServicePriceWithToFixed;
          calculatedOriginalPriceFromServices = Number(
            Number(calculatedOriginalPriceFromServices) +
              Number(currentServicePriceWithToFixed),
          )?.toFixed(2);
        });
      });
      DiscountedPrice = calculatedOriginalPriceFromServices;
      if (props.RecurringPricingInfo.DefaultDiscount > 0) {
        DiscountedPrice =
          lastPaymentFrequencyAndDiscountedPrice.ChangeableYearlyPrice / 4;
      }

      OriginalPrice = calculatedOriginalPriceFromServices;
    } else if (e.value === Payment_Frequency.Monthly) {
      props.setEngagementObj((prevState) => ({
        ...prevState,
        Payment_Frequency: e.value,
      }));
      updatedData.forEach((category) => {
        category.servicesList.forEach((service) => {
          // Perform the percentage calculation for each value
          let currentServicePrice =
            service.originalServicePrice === undefined
              ? (service.quotationPrice = Number(service.quotationPrice) / 12)
              : (service.originalServicePrice =
                  Number(service.originalServicePrice) / 12);

          let currentServicePriceWithToFixed =
            Number(currentServicePrice)?.toFixed(2);
          service.price = currentServicePriceWithToFixed;
          service.quotationPrice = currentServicePriceWithToFixed;
          calculatedOriginalPriceFromServices = Number(
            Number(calculatedOriginalPriceFromServices) +
              Number(currentServicePriceWithToFixed),
          )?.toFixed(2);

          // service.price === undefined
          //   ? (service.quotationPrice = Number(service.quotationPrice) / 12)
          //   : (service.price = Number(service.price) / 12);
        });
      });
      DiscountedPrice = calculatedOriginalPriceFromServices;
      if (props.RecurringPricingInfo.DefaultDiscount > 0) {
        DiscountedPrice =
          lastPaymentFrequencyAndDiscountedPrice.ChangeableYearlyPrice / 12;
      }

      OriginalPrice = calculatedOriginalPriceFromServices;
    }

    // Calculate discount and other pricing details
    const decrease = Number(OriginalPrice) - Number(DiscountedPrice);

    Discount = Number(decrease);
    const TotalDiscount = Number(OriginalPrice) - decrease;
    DiscountedTotal = Number(TotalDiscount);
    const VatPrice =
      Number(DiscountedPrice) * (Number(props.vatPercentage) / 100);
    const FinalPrice = Number(VatPrice) + Number(TotalDiscount);
    VATPrice = Number(VatPrice);
    GrandTotal = Number(FinalPrice);

    props.setRecurringPricingInfo({
      ...props.RecurringPricingInfo,
      OriginalPrice: OriginalPrice,
      DiscountedPrice: Number(DiscountedPrice)?.toFixed(2),
      DefaultDiscount: Number(DefaultDiscount).toFixed(2),
      Discount: Discount,
      DiscountedTotal: DiscountedTotal,
      VATPrice: VATPrice,
      GrandTotal: GrandTotal,
    });
    props.setSelectedRecurringServiceList(updatedData);
  };

  const handleRecurringChangeDiscount = (e) => {
    e.preventDefault();
    props.DisableTabOnChange();
    let sanitizedInput = e.target.value
      .replace(/[^0-9.-]/g, "") // Allow only numeric, dot, and negative sign characters
      .slice(0, 8); // Limit to 8 characters (4 digits + 1 dot + 2 decimal + 1 negative sign)

    sanitizedInput = props.hasHyphenAfterNumber(sanitizedInput);
    // Split the input into integer and decimal parts
    const [integerPart, decimalPart] = sanitizedInput.split(".");
    let formattedInput;
    if (
      sanitizedInput === "-" ||
      (parseFloat(sanitizedInput) >= -999.0 &&
        parseFloat(sanitizedInput) <= 100)
    ) {
      if (decimalPart !== undefined) {
        if (integerPart.includes("-")) {
          // For negative values, ensure 4 digits after the negative sign
          formattedInput = `-${integerPart.slice(1, 4)}.${decimalPart.slice(
            0,
            2,
          )}`;
        } else {
          // For positive values, limit to 4 digits before the decimal point
          formattedInput = `${integerPart.slice(0, 3)}.${decimalPart.slice(
            0,
            2,
          )}`;
        }
      } else {
        // No decimal part, limit to 4 digits
        formattedInput = integerPart.includes("-")
          ? `-${integerPart.slice(1, 4)}`
          : `${integerPart.slice(0, 3)}`;
      }
    }

    // Parse the formatted input to a number
    let parsedValue =
      formattedInput == undefined
        ? sanitizedInput === ""
          ? sanitizedInput
          : props.RecurringPricingInfo.DefaultDiscount
        : formattedInput;

    let percentage = isNaN(parsedValue) ? 0 : parsedValue;
    // Calculate discounted price
    const originalPrice = Number(props.RecurringPricingInfo.OriginalPrice);
    let discountedPrice = originalPrice * (1 - percentage / 100);
    let CalculatePriceFrequency = discountedPrice;
    // Update discounted price based on payment frequency
    // const paymentFrequency = lastPaymentFrequencyAndDiscountedPrice.PaymentFrequencyID;
    // if (paymentFrequency === Payment_Frequency.HalfYearly) {
    //   CalculatePriceFrequency = discountedPrice * 2;
    // } else if (paymentFrequency === Payment_Frequency.Quarterly) {
    //   CalculatePriceFrequency = discountedPrice * 4;
    // } else if (paymentFrequency === Payment_Frequency.Monthly) {
    //   CalculatePriceFrequency = discountedPrice * 12;
    // }

    // Calculate VAT and Final Price
    const vatPrice = discountedPrice * (Number(props.vatPercentage) / 100);
    const finalPrice = Number(vatPrice) + discountedPrice;

    let CalculatedYearlyPrice = 0.0;
    if (
      lastPaymentFrequencyAndDiscountedPrice.PaymentFrequencyID ===
      Payment_Frequency.Yearly
    ) {
      CalculatedYearlyPrice = discountedPrice;
    } else if (
      lastPaymentFrequencyAndDiscountedPrice.PaymentFrequencyID ===
      Payment_Frequency.HalfYearly
    ) {
      CalculatedYearlyPrice = discountedPrice * 2;
    } else if (
      lastPaymentFrequencyAndDiscountedPrice.PaymentFrequencyID ===
      Payment_Frequency.Quarterly
    ) {
      CalculatedYearlyPrice = discountedPrice * 4;
    }
    if (
      lastPaymentFrequencyAndDiscountedPrice.PaymentFrequencyID ===
      Payment_Frequency.Monthly
    ) {
      CalculatedYearlyPrice = discountedPrice * 12;
    }
    setLastPaymentFrequencyAndDiscountedPrice({
      ...lastPaymentFrequencyAndDiscountedPrice,
      ChangeableYearlyPrice: CalculatedYearlyPrice,
    });

    // Update state
    props.setRecurringPricingInfo({
      ...props.RecurringPricingInfo,
      DiscountedPrice: (Math.floor(discountedPrice * 100) / 100).toFixed(2),
      // DiscountedPrice: discountedPrice?.toFixed(2),
      DefaultDiscount: parsedValue,
      Discount: originalPrice - discountedPrice,
      DiscountedTotal: discountedPrice,
      VATPrice: vatPrice,
      GrandTotal: finalPrice,
    });

    props.setRecurringFrequencyPricingInfo({
      ...props.RecurringFrequencyPricingInfo,
      DiscountedPrice: discountedPrice,
      DefaultDiscount: parsedValue,
      Discount: originalPrice - discountedPrice,
      DiscountedTotal: discountedPrice,
      VATPrice: vatPrice,
      GrandTotal: finalPrice,
    });
  };

  const handleOneOffChangeDiscount = (e) => {
    e.preventDefault();
    props.DisableTabOnChange();
    let sanitizedInput = e.target.value
      .replace(/[^0-9.-]/g, "") // Allow only numeric, dot, and negative sign characters
      .slice(0, 8); // Limit to 8 characters (4 digits + 1 dot + 2 decimal + 1 negative sign)

    sanitizedInput = props.hasHyphenAfterNumber(sanitizedInput);
    // Split the input into integer and decimal parts
    const [integerPart, decimalPart] = sanitizedInput.split(".");

    // Combine integer and decimal parts with appropriate precision
    let formattedInput;
    if (
      sanitizedInput === "-" ||
      (parseFloat(sanitizedInput) >= -999.0 &&
        parseFloat(sanitizedInput) <= 100)
    ) {
      if (decimalPart !== undefined) {
        if (integerPart.includes("-")) {
          // For negative values, ensure 4 digits after the negative sign
          formattedInput = `-${integerPart.slice(1, 4)}.${decimalPart.slice(
            0,
            2,
          )}`;
        } else {
          // For positive values, limit to 4 digits before the decimal point
          formattedInput = `${integerPart.slice(0, 3)}.${decimalPart.slice(
            0,
            2,
          )}`;
        }
      } else {
        // No decimal part, limit to 4 digits
        formattedInput = integerPart.includes("-")
          ? `-${integerPart.slice(1, 4)}`
          : `${integerPart.slice(0, 3)}`;
      }
    }

    // Parse the formatted input to a number
    let parsedValue =
      formattedInput == undefined
        ? sanitizedInput === ""
          ? sanitizedInput
          : props.OneOffPricingInfo.DefaultDiscount
        : formattedInput;

    let percentage = isNaN(parsedValue) ? 0 : parsedValue;

    // Calculate discounted price
    const originalPrice = Number(props.OneOffPricingInfo.OriginalPrice);
    let discountedPrice = originalPrice * (1 - percentage / 100);

    // Calculate VAT and Final Price
    const vatPrice = discountedPrice * (Number(props.vatPercentage) / 100);
    const finalPrice = Number(vatPrice) + discountedPrice;

    // Update state
    props.setOneOffPricingInfo({
      ...props.OneOffPricingInfo,
      DiscountedPrice: (Math.floor(discountedPrice * 100) / 100).toFixed(2),
      // DiscountedPrice: discountedPrice?.toFixed(2),
      DefaultDiscount: parsedValue,
      Discount: originalPrice - discountedPrice,
      DiscountedTotal: discountedPrice,
      VATPrice: vatPrice,
      GrandTotal: finalPrice,
    });
    props.setOneOffPricingInfoCopy({
      ...props.OneOffPricingInfo,
      // DiscountedPrice: discountedPrice?.toFixed(2),
      DiscountedPrice: (Math.floor(discountedPrice * 100) / 100).toFixed(2),
      DefaultDiscount: parsedValue,
      Discount: originalPrice - discountedPrice,
      DiscountedTotal: discountedPrice,
      VATPrice: vatPrice,
      GrandTotal: finalPrice,
    });
  };

  const handleCheckboxChange = (e) => {
    props.DisableTabOnChange();
    const newValue = e.target.checked ? true : false; // Set to 1 if checked, null otherwise
    props.setEngagementObj((prevEngagementObj) => ({
      ...prevEngagementObj,
      DiscountLines: newValue,
    }));
  };

  const CalculateRecurringPackageNetTotal = () => {
    let packageOneNetTotalObj = GetNetTotalValueByRecurringPackage();

    props.setRecurringPricingInfo({
      ...props.RecurringPricingInfo,
      Discount: packageOneNetTotalObj.discountAmount,
      DiscountedTotal: packageOneNetTotalObj.discountedTotalAmount,
      VATPrice: packageOneNetTotalObj.vatTotalAmount,
      GrandTotal: packageOneNetTotalObj.grandTotalAmount,
    });

    setRecurringPackageCalculation({
      ...RecurringPackageCalculation,
      //Package One :
      PackageOneNetTotal: packageOneNetTotalObj.netTotal,
      PackageOneNetTotalAddOnValue: packageOneNetTotalObj.addOnValue,
      VatPercentage: packageOneNetTotalObj.vatPercentage,
      PackageOneVatTotalAmount: packageOneNetTotalObj.vatTotalAmount,
      PackageOneDiscountAmount: packageOneNetTotalObj.discountAmount,
      PackageOneDiscountedTotalAmount:
        packageOneNetTotalObj.discountedTotalAmount,
      PackageOneGrandTotalAmount: packageOneNetTotalObj.grandTotalAmount,
    }); //return packageOneNetTotal
  };

  const GetNetTotalValueByRecurringPackage = (packageName) => {
    let netTotal = 0;
    let addOnValue = 0;
    let vatPercentage = null;
    let vatTotalAmount = null;
    let discountAmount = 0;
    let discountedTotalAmount = null;
    let grandTotalAmount = null;

    //Calculate netTotal :
    props.selectedRecurringServiceList.forEach((category) => {
      category.servicesList.forEach((service) => {
        // Check if either price or quotationPrice is not null or undefined before adding
        if (
          (service.price !== null && service.price !== undefined) ||
          (service.quotationPrice !== null &&
            service.quotationPrice !== undefined)
        ) {
          // If price is available, use it; otherwise, use quotationPrice
          const price =
            service.price !== undefined
              ? Number(service.price)
              : Number(service.quotationPrice);
          netTotal += price;
          netTotal = Math.round(netTotal * 100) / 100;
        }
      });
    });

    //props.selectedPackagesList
    let DiscountedPriceWithoutRoundOff =
      props.GetTwoDecimalValueWithoutRoundOff(
        props.RecurringPricingInfo.DiscountedPrice,
      ); //
    let netTotalWithoutRoundOff =
      props.GetTwoDecimalValueWithoutRoundOff(netTotal);

    // //Calculate : addOnValue,discountAmount

    if (
      !isNaN(props.RecurringFrequencyPricingInfo.DefaultDiscount) &&
      props.RecurringFrequencyPricingInfo.DefaultDiscount !== undefined &&
      props.RecurringFrequencyPricingInfo.DefaultDiscount !== null &&
      props.RecurringFrequencyPricingInfo.DefaultDiscount !== ""
    ) {
      if (Number(props.RecurringFrequencyPricingInfo.DefaultDiscount) === 0) {
        addOnValue = 0;
        discountAmount = 0;
        //discountedTotalAmount = null;//Number(netTotal);
      } else if (props.RecurringFrequencyPricingInfo.DefaultDiscount < 0) {
        // addOnValue =
        //   Number(netTotal) *
        //   (Math.abs(props.RecurringFrequencyPricingInfo.DefaultDiscount) / 100);

        addOnValue = DiscountedPriceWithoutRoundOff - netTotalWithoutRoundOff;
      } else if (props.RecurringFrequencyPricingInfo.DefaultDiscount > 0) {
        discountAmount =
          netTotalWithoutRoundOff - DiscountedPriceWithoutRoundOff;
        discountAmount = Number(discountAmount)?.toFixed(2);
        //   props.RecurringFrequencyPricingInfo.DefaultDiscount) /
        // 100;

        //discountedTotalAmount = (Number(netTotal) + Number(addOnValue)) - discountAmount
      }
    }

    //Calculate discountedTotalAmount
    discountedTotalAmount = DiscountedPriceWithoutRoundOff;
    //Number(netTotal) + Number(addOnValue) - discountAmount;

    //Calculate : vatPercentage,vatTotalAmount
    if (
      !isNaN(props.vatPercentage) &&
      props.vatPercentage !== undefined &&
      props.vatPercentage !== null
    ) {
      if (props.vatPercentage > 0) {
        vatPercentage = props.vatPercentage;
        vatTotalAmount = (Number(discountedTotalAmount) * vatPercentage) / 100;
        vatTotalAmount =
          props.GetTwoDecimalValueWithoutRoundOff(vatTotalAmount);
      }
    }

    //Calculate : grandTotalAmount
    if (
      !isNaN(props.vatPercentage) &&
      props.vatPercentage !== undefined &&
      props.vatPercentage !== null
    ) {
      if (props.vatPercentage > 0) {
        grandTotalAmount = discountedTotalAmount + vatTotalAmount;
        grandTotalAmount = Number(grandTotalAmount)?.toFixed(2);
      }
    }

    return {
      netTotal: netTotal,
      addOnValue: addOnValue,
      vatPercentage: vatPercentage,
      vatTotalAmount: vatTotalAmount,
      discountAmount: discountAmount,
      discountedTotalAmount: discountedTotalAmount,
      grandTotalAmount: grandTotalAmount,
    };
  };

  const CalculateOneOffPackageNetTotal = () => {
    let packageOneNetTotalObj = GetNetTotalValueByOneOffPackage();

    props.setOneOffPricingInfo({
      ...props.OneOffPricingInfo,
      Discount: packageOneNetTotalObj.discountAmount,
      DiscountedTotal: packageOneNetTotalObj.discountedTotalAmount,
      VATPrice: packageOneNetTotalObj.vatTotalAmount,
      GrandTotal: packageOneNetTotalObj.grandTotalAmount,
    });

    setOneOffPackageCalculation({
      ...OneOffPackageCalculation,
      //Package One :
      PackageOneNetTotal: packageOneNetTotalObj.netTotal,
      PackageOneNetTotalAddOnValue: packageOneNetTotalObj.addOnValue,
      VatPercentage: packageOneNetTotalObj.vatPercentage,
      PackageOneVatTotalAmount: packageOneNetTotalObj.vatTotalAmount,
      PackageOneDiscountAmount: packageOneNetTotalObj.discountAmount,
      PackageOneDiscountedTotalAmount:
        packageOneNetTotalObj.discountedTotalAmount,
      PackageOneGrandTotalAmount: packageOneNetTotalObj.grandTotalAmount,
    }); //return packageOneNetTotal
  };

  const GetNetTotalValueByOneOffPackage = (packageName) => {
    let netTotal = 0;
    let addOnValue = 0;
    let vatPercentage = null;
    let vatTotalAmount = null;
    let discountAmount = 0;
    let discountedTotalAmount = null;
    let grandTotalAmount = null;
    //Calculate netTotal :
    props.selectedOneOffServiceList.forEach((category) => {
      category.servicesList.forEach((service) => {
        // Check if the value is not null before adding
        if (
          (service.price !== null && service.price !== undefined) ||
          (service.quotationPrice !== null &&
            service.quotationPrice !== undefined)
        ) {
          // If price is available, use it; otherwise, use quotationPrice
          const price =
            service.price !== undefined
              ? Number(service.price)
              : Number(service.quotationPrice);
          netTotal += price;
        }
      });
    });

    //props.selectedPackagesList
    let DiscountedPriceWithoutRoundOff =
      props.GetTwoDecimalValueWithoutRoundOff(
        props.OneOffPricingInfo.DiscountedPrice,
      ); //
    let netTotalWithoutRoundOff =
      props.GetTwoDecimalValueWithoutRoundOff(netTotal);

    // //Calculate : addOnValue,discountAmount
    if (
      !isNaN(props.OneOffPricingInfoCopy.DefaultDiscount) &&
      props.OneOffPricingInfoCopy.DefaultDiscount !== undefined &&
      props.OneOffPricingInfoCopy.DefaultDiscount !== null &&
      props.OneOffPricingInfoCopy.DefaultDiscount !== ""
    ) {
      if (Number(props.OneOffPricingInfoCopy.DefaultDiscount) === 0) {
        addOnValue = 0;
        discountAmount = 0;
        //discountedTotalAmount = null;//Number(netTotal);
      } else if (props.OneOffPricingInfoCopy.DefaultDiscount < 0) {
        // addOnValue =
        //   Number(netTotal) *
        //   (Math.abs(props.OneOffPricingInfoCopy.DefaultDiscount) / 100);
        addOnValue = DiscountedPriceWithoutRoundOff - netTotalWithoutRoundOff;
      } else if (props.OneOffPricingInfoCopy.DefaultDiscount > 0) {
        discountAmount =
          netTotalWithoutRoundOff - DiscountedPriceWithoutRoundOff;
        discountAmount = Number(discountAmount)?.toFixed(2);
        // discountAmount =
        //   ((Number(netTotal) + Number(addOnValue)) *
        //     parseFloat(props.OneOffPricingInfoCopy.DefaultDiscount)) /
        //   100;

        //discountedTotalAmount = (Number(netTotal) + Number(addOnValue)) - discountAmount
      }
    }

    //Calculate discountedTotalAmount
    discountedTotalAmount = DiscountedPriceWithoutRoundOff;

    //Calculate : vatPercentage,vatTotalAmount
    if (
      !isNaN(props.vatPercentage) &&
      props.vatPercentage !== undefined &&
      props.vatPercentage !== null
    ) {
      if (props.vatPercentage > 0) {
        vatPercentage = props.vatPercentage;
        vatTotalAmount = (Number(discountedTotalAmount) * vatPercentage) / 100;
        vatTotalAmount =
          props.GetTwoDecimalValueWithoutRoundOff(vatTotalAmount);
      }
    }

    //Calculate : grandTotalAmount
    if (
      !isNaN(props.vatPercentage) &&
      props.vatPercentage !== undefined &&
      props.vatPercentage !== null
    ) {
      if (props.vatPercentage > 0) {
        grandTotalAmount = discountedTotalAmount + vatTotalAmount;
        grandTotalAmount = Number(grandTotalAmount)?.toFixed(2);
      }
    }
    //Calculate : vatPercentage,vatTotalAmount
    // if (!isNaN(props.vatPercentage) && props.vatPercentage !== undefined && props.vatPercentage !== null) {
    //   if (props.vatPercentage > 0) {
    //     vatPercentage = props.vatPercentage;
    //     if (discountedTotalAmount !== null) {
    //       vatTotalAmount = (Number(discountedTotalAmount) * (vatPercentage) / 100)
    //     }
    //     else {
    //       vatTotalAmount = ((Number(netTotal) + Number(addOnValue)) * (vatPercentage) / 100)
    //     }

    //   }
    // }

    // //Calculate : grandTotalAmount
    // if (!isNaN(props.vatPercentage) && props.vatPercentage !== undefined && props.vatPercentage !== null) {
    //   if (props.vatPercentage > 0) {
    //     if (discountedTotalAmount !== null) {
    //       grandTotalAmount = discountedTotalAmount + vatTotalAmount;
    //     }
    //     else {
    //       grandTotalAmount = ((Number(netTotal) + Number(addOnValue)) + vatTotalAmount);
    //     }
    //   }
    // }

    return {
      netTotal: netTotal,
      addOnValue: addOnValue,
      vatPercentage: vatPercentage,
      vatTotalAmount: vatTotalAmount,
      discountAmount: discountAmount,
      discountedTotalAmount: discountedTotalAmount,
      grandTotalAmount: grandTotalAmount,
    };
  };

  const handleChangeFeesType = (e) => {
    const {
      RecurringPricingInfo,
      OneOffPricingInfo,
      setEngagementObj,
      engagementObj,
    } = props;

    const isRecurringDiscounted =
      Number(RecurringPricingInfo.DiscountedPrice) ===
      Number(RecurringPricingInfo.OriginalPrice);
    const isOneOffDiscounted =
      Number(OneOffPricingInfo.DiscountedPrice) ===
      Number(OneOffPricingInfo.OriginalPrice);

    const updatedEngagementObj = {
      ...engagementObj,
      feeTypeId: e.value,
    };

    if (e.value == 2 && isRecurringDiscounted && isOneOffDiscounted) {
      updatedEngagementObj.DiscountLines = false;
    } else {
      updatedEngagementObj.DiscountLines = true;
    }

    setEngagementObj(updatedEngagementObj);
  };

  const minPrice =
    props.engagementObj.Payment_Frequency === 4
      ? props.pricingSettingObj.minMonthlyPriceForQC
      : props.engagementObj.Payment_Frequency === 3
        ? props.pricingSettingObj.minQuarterlyPriceForQC
        : props.engagementObj.Payment_Frequency === 2
          ? props.pricingSettingObj.minHalfYearlyPriceForQC
          : props.pricingSettingObj.minYearlyPriceForQC;

  const priceFrequency =
    props.engagementObj.Payment_Frequency === 4
      ? "monthly"
      : props.engagementObj.Payment_Frequency === 3
        ? "quarterly"
        : props.engagementObj.Payment_Frequency === 2
          ? "half-yearly"
          : "yearly";

  const generateCombinedServicesHTML = () => {
    const fontFamily = "Arial, sans-serif";
    const fontSizeHeading = "18px";
    const recurringHeadingFontSize = props?.serviceDescriptionObj
      ?.recurringOnGoingHeadingFontSize
      ? `${props?.serviceDescriptionObj?.recurringOnGoingHeadingFontSize}px`
      : "18px";
    const oneOffHeadingFontSize = props?.serviceDescriptionObj
      ?.oneOffAdhocFontSize
      ? `${props?.serviceDescriptionObj?.oneOffAdhocFontSize}px`
      : "18px";
    const fontSizeContent = "14px";
    const newColorCode = "#b4aba6";

    return `
  <div style="padding-left: 40px; padding-right: 40px;">
    ${
      props?.selectedRecurringServiceList?.length
        ? props?.serviceDescriptionObj?.recurringOnGoingHeading !== null &&
          props?.serviceDescriptionObj?.recurringOnGoingHeading !== undefined &&
          props?.serviceDescriptionObj?.recurringOnGoingHeading !== ""
          ? `<p style="font-family:${fontFamily}; font-size: ${recurringHeadingFontSize}; color: ${newColorCode}; font-weight: ${
              props?.serviceDescriptionObj?.recurringOnGoingHeadingIsBold
                ? "bold"
                : "normal"
            }; font-style: ${
              props?.serviceDescriptionObj?.recurringOnGoingHeadingIsItalic
                ? "italic"
                : undefined
            };">
             ${props?.serviceDescriptionObj?.recurringOnGoingHeading}
           </p>`
          : ""
        : ""
    }

    ${props?.selectedRecurringServiceList
      ?.map(
        (serviceCat) => `
        <div>
          <p style="color: black; font-weight: bold; font-family:${fontFamily}; font-size: ${fontSizeHeading};">
            ${serviceCat.serviceCatName}
          </p>
          <hr style="color: gray; margin-top: -15px;" />
          ${serviceCat.servicesList
            .map(
              (subService) => `
                <p style="color: black; font-family:${fontFamily}; font-size: ${fontSizeContent};">
                  ${subService.serviceName}
                </p>
                <p style="color: black; font-family:${fontFamily}; font-size: ${fontSizeContent};">
                  ${
                    subService.serviceDescription?.trim()
                      ? subService.serviceDescription
                      : ""
                  }
                </p>
              `,
            )
            .join("")}
        </div>
      `,
      )
      .join("")}

    ${
      props?.selectedOneOffServiceList?.length
        ? props?.serviceDescriptionObj?.oneOffAdhocHeading !== null &&
          props?.serviceDescriptionObj?.oneOffAdhocHeading !== undefined &&
          props?.serviceDescriptionObj?.oneOffAdhocHeading !== ""
          ? `<p style="font-family:${fontFamily}; font-size: ${oneOffHeadingFontSize}; color: ${newColorCode}; font-weight: ${
              props?.serviceDescriptionObj?.oneOffAdhocHeadingIsBold
                ? "bold"
                : "normal"
            }; font-style: ${
              props?.serviceDescriptionObj?.oneOffAdhocHeadingIsItalic
                ? "italic"
                : undefined
            };">
             ${props?.serviceDescriptionObj?.oneOffAdhocHeading}
           </p>`
          : ""
        : ""
    }

    ${props?.selectedOneOffServiceList
      ?.map(
        (serviceCat) => `
        <div>
          <p style="color: black; font-weight: bold; font-family:${fontFamily}; font-size: ${fontSizeHeading};">
            ${serviceCat.serviceCatName}
          </p>
          <hr style="color: gray; margin-top: -15px;" />
          ${serviceCat.servicesList
            .map(
              (subService) => `
                <p style="color: black; font-family:${fontFamily}; font-size: ${fontSizeContent};">
                  ${subService.serviceName}
                </p>
                <p style="color: black; font-family:${fontFamily}; font-size: ${fontSizeContent};">
                  ${
                    subService.serviceDescription?.trim()
                      ? subService.serviceDescription
                      : ""
                  }
                </p>
              `,
            )
            .join("")}
        </div>
      `,
      )
      .join("")}
  </div>
  `;
  };

  function generateSOFHTML() {
    const fontFamily = "Arial, sans-serif";
    const fontSizeHeading = "18px";
    const rucurringHeadingFontSize = props?.statementOfFactsObj
      .recurringOnGoingHeadingFontSize
      ? props?.statementOfFactsObj.recurringOnGoingHeadingFontSize
      : "18px";
    const oneOffHeadingFontSize = props?.statementOfFactsObj.oneOffAdhocFontSize
      ? props?.statementOfFactsObj.oneOffAdhocFontSize
      : "18px";
    const fontSizeContent = "14px";
    const newColorCode = "#b4aba6";

    const formatCurrency = props.formatValueWithoutCurrencySymbol;

    if (
      props.moduleName === "Quote" &&
      props?.ProposalObject?.selectedProposalTypeValue === 2
    ) {
      return props.StatementOfFact.map(
        (SelectedPackage) => `
      <div style="padding-left: 40px; padding-right: 40px; font-family:${fontFamily};">
        <p style="color: ${newColorCode}; font-size: ${fontSizeHeading}; font-weight: bold;">
          Package Name: ${SelectedPackage.servicePackageName}
        </p>
        <hr style="color: gray; margin-top: -15px;">
        
        ${
          SelectedPackage.reccuring.length
            ? props?.statementOfFactsObj?.recurringOnGoingHeading !== null &&
              props?.statementOfFactsObj?.recurringOnGoingHeading !==
                undefined &&
              props?.statementOfFactsObj?.recurringOnGoingHeading !== ""
              ? `<p style="font-size: ${rucurringHeadingFontSize}; color: ${newColorCode}; font-weight: ${
                  props?.statementOfFactsObj?.recurringOnGoingHeadingIsBold
                    ? "bold"
                    : "normal"
                }; font-style: ${
                  props?.statementOfFactsObj?.recurringOnGoingHeadingIsItalic
                    ? "italic"
                    : undefined
                };">${props?.statementOfFactsObj?.recurringOnGoingHeading}</p>`
              : ""
            : ""
        }

        ${SelectedPackage.reccuring
          .map(
            (cat) => `
          <p style="color: black; font-size: ${fontSizeHeading}; font-weight: bold;">${
            cat.serviceCategoryName
          }</p>
          ${cat.servicesList
            .map(
              (srv) => `
            <p style="color: black; font-size: ${fontSizeContent};">${
              srv.serviceName
            }</p>
            ${(srv?.gpdList || [])
              ?.filter((d) => d.driverTypeID !== 1)
              .map(
                (d) => `
                <li style="color: black; font-size: ${fontSizeContent}; margin-top:5px;">
                  ${d.driverName}: <strong>${
                    d.driverTypeID === 2
                      ? formatCurrency(d.value)
                      : d.driverTypeID === 3
                        ? d.variationName
                        : d.driverTypeID === 4
                          ? d.slabTypeID === 2
                            ? formatCurrency(d.value)
                            : `${d.slabFrom}-${d.slabTo}`
                          : ""
                  }</strong>
                </li>
              `,
              )
              .join("")}
          `,
            )
            .join("")}
        `,
          )
          .join("")}

        ${
          SelectedPackage.oneOff.length
            ? props?.statementOfFactsObj?.oneOffAdhocHeading !== null &&
              props?.statementOfFactsObj?.oneOffAdhocHeading !== undefined &&
              props?.statementOfFactsObj?.oneOffAdhocHeading !== ""
              ? `<p style="font-size: ${fontSizeHeading}; color: ${newColorCode}; font-weight: ${
                  props?.statementOfFactsObj?.oneOffAdhocHeadingIsBold
                    ? "bold"
                    : "normal"
                }; font-style: ${
                  props?.statementOfFactsObj?.oneOffAdhocHeadingIsItalic
                    ? "italic"
                    : undefined
                };">${props?.statementOfFactsObj?.oneOffAdhocHeading}</p>`
              : ""
            : ""
        }

        ${SelectedPackage.oneOff
          .map(
            (cat) => `
          <p style="color: black; font-size: ${fontSizeHeading}; font-weight: bold;">${
            cat.serviceCategoryName
          }</p>
          ${cat.servicesList
            .map(
              (srv) => `
            <p style="color: black; font-size: ${fontSizeContent};">${
              srv.serviceName
            }</p>
            ${(srv?.gpdList || [])
              ?.filter((d) => d.driverTypeID !== 1)
              .map(
                (d) => `
                <li style="color: black; font-size: ${fontSizeContent}; margin-top:5px;">
                  ${d.driverName}: <strong>${
                    d.driverTypeID === 2
                      ? formatCurrency(d.value)
                      : d.driverTypeID === 3
                        ? d.variationName
                        : d.driverTypeID === 4
                          ? d.slabTypeID === 2
                            ? formatCurrency(d.value)
                            : `${d.slabFrom}-${d.slabTo}`
                          : ""
                  }</strong>
                </li>
              `,
              )
              .join("")}
          `,
            )
            .join("")}
        `,
          )
          .join("")}

        ${
          SelectedPackage.additionalInformationList?.length
            ? `<p style="color: ${newColorCode}; font-size: ${fontSizeHeading}; font-weight: bold;">Additional Information</p>
             <hr style="color: gray; margin-top: -15px;" />
             ${SelectedPackage.additionalInformationList
               ?.filter((d) => d.driverTypeID !== 1)
               .map(
                 (d) => `
                 <p style="font-size: ${fontSizeContent}; color: black;">
                   ${d.driverName}: <strong>${
                     d.driverTypeID === 2
                       ? formatCurrency(d.value)
                       : d.driverTypeID === 3
                         ? d.variationName
                         : d.driverTypeID === 4
                           ? d.slabTypeID === 2
                             ? formatCurrency(d.value)
                             : `${formatCurrency(d.slabFrom)}-${formatCurrency(
                                 d.slabTo,
                               )}`
                           : ""
                   }</strong>
                 </p>
               `,
               )
               .join("")}`
            : ""
        }
      </div>
    `,
      ).join(" ");
    } else {
      return `
      <div style="padding-left: 40px; padding-right: 40px; font-family:${fontFamily};">
        ${
          props?.selectedRecurringServiceList?.length
            ? props?.statementOfFactsObj?.recurringOnGoingHeading !== null &&
              props?.statementOfFactsObj?.recurringOnGoingHeading !==
                undefined &&
              props?.statementOfFactsObj?.recurringOnGoingHeading !== ""
              ? `<p style="font-size: ${rucurringHeadingFontSize}; color: ${newColorCode}; font-weight: ${
                  props?.statementOfFactsObj?.recurringOnGoingHeadingIsBold
                    ? "bold"
                    : "normal"
                }; font-style: ${
                  props?.statementOfFactsObj?.recurringOnGoingHeadingIsItalic
                    ? "italic"
                    : undefined
                };">${props?.statementOfFactsObj?.recurringOnGoingHeading}</p>`
              : ""
            : ""
        }

        ${props?.selectedRecurringServiceList
          ?.map(
            (cat) => `
          <div>
            <p style="color: black; font-size: ${fontSizeHeading}; font-weight: bold;">${
              cat.serviceCatName
            }</p>
            <hr style="color: gray; margin-top: -15px;">
            ${cat.servicesList
              .map(
                (srv) => `
              <p style="color: black; font-size: ${fontSizeContent};">${
                srv.serviceName
              }</p>
              ${(srv.pricingDriverList || srv.gpdList || [])
                ?.filter((d) =>
                  srv.pricingDriverList ? d.driverVisibility : true,
                )
                ?.filter((d) => d.driverTypeID !== 1)
                .map(
                  (d) => `
                  <li style="color: black; font-size: ${fontSizeContent}; margin-top:5px;">
                    ${d.driverName}: <strong>${
                      d.driverTypeID === 2
                        ? formatCurrency(d.driverValue)
                        : d.driverTypeID === 3
                          ? srv.pricingDriverList
                            ? d.variation.find((v) => v.isDefault)
                                ?.variationName
                            : d.variationName
                          : d.driverTypeID === 4
                            ? srv.pricingDriverList
                              ? (() => {
                                  const slab = d.slab.find((s) => s.isDefault);
                                  return slab.slabTypeID === 2
                                    ? formatCurrency(slab.slabValue)
                                    : `${formatCurrency(
                                        slab.slabFrom,
                                      )}-${formatCurrency(slab.slabTo)}`;
                                })()
                              : d.slabTypeID === 2
                                ? formatCurrency(d.driverValue)
                                : `${formatCurrency(d.slabFrom)}-${formatCurrency(
                                    d.slabTo,
                                  )}`
                            : ""
                    }</strong>
                  </li>
                `,
                )
                .join("")}
            `,
              )
              .join("")}
          </div>
        `,
          )
          .join("")}

        ${
          props?.selectedOneOffServiceList?.length
            ? props?.statementOfFactsObj?.oneOffAdhocHeading !== null &&
              props?.statementOfFactsObj?.oneOffAdhocHeading !== undefined &&
              props?.statementOfFactsObj?.oneOffAdhocHeading !== ""
              ? `<p style="font-size: ${oneOffHeadingFontSize}; color: ${newColorCode}; font-weight: ${
                  props?.statementOfFactsObj?.oneOffAdhocHeadingIsBold
                    ? "bold"
                    : "normal"
                }; font-style: ${
                  props?.statementOfFactsObj?.oneOffAdhocHeadingIsItalic
                    ? "italic"
                    : undefined
                };">${props?.statementOfFactsObj?.oneOffAdhocHeading}</p>`
              : ""
            : ""
        }

        ${props?.selectedOneOffServiceList
          ?.map(
            (cat) => `
          <div>
            <p style="color: black; font-size: ${fontSizeHeading}; font-weight: bold;">${
              cat.serviceCatName
            }</p>
            <hr style="color: gray; margin-top: -15px;">
            ${cat.servicesList
              .map(
                (srv) => `
              <p style="color: black; font-size: ${fontSizeContent};">${
                srv.serviceName
              }</p>
              ${(srv.pricingDriverList || srv.gpdList || [])
                ?.filter((d) =>
                  srv.pricingDriverList ? d.driverVisibility : true,
                )
                ?.filter((d) => d.driverTypeID !== 1)
                .map(
                  (d) => `
                  <li style="color: black; font-size: ${fontSizeContent}; margin-top:5px;">
                    ${d.driverName}: <strong>${
                      d.driverTypeID === 2
                        ? formatCurrency(d.driverValue)
                        : d.driverTypeID === 3
                          ? srv.pricingDriverList
                            ? d.variation.find((v) => v.isDefault)
                                ?.variationName
                            : d.variationName
                          : d.driverTypeID === 4
                            ? srv.pricingDriverList
                              ? (() => {
                                  const slab = d.slab.find((s) => s.isDefault);
                                  return slab.slabTypeID === 2
                                    ? formatCurrency(slab.slabValue)
                                    : `${formatCurrency(
                                        slab.slabFrom,
                                      )}-${formatCurrency(slab.slabTo)}`;
                                })()
                              : d.slabTypeID === 2
                                ? formatCurrency(d.driverValue)
                                : `${formatCurrency(d.slabFrom)}-${formatCurrency(
                                    d.slabTo,
                                  )}`
                            : ""
                    }</strong>
                  </li>
                `,
                )
                .join("")}
            `,
              )
              .join("")}
          </div>
        `,
          )
          .join("")}

        ${
          props?.additionalInformationList?.filter((d) => d.driverTypeID !== 1)
            .length
            ? `<p style="font-size: ${fontSizeHeading}; color: ${newColorCode}; font-weight: bold;">Additional Information</p>
             <hr style="color: gray; margin-top: -15px;" />
             ${props.additionalInformationList
               .map((d) => {
                 if (
                   d.driverTypeID === 2 &&
                   d.variation === null &&
                   d.slab === null
                 ) {
                   return `<p style="color: black; font-size: ${fontSizeContent};">${
                     d.driverName
                   }: <strong>${formatCurrency(d.driverValue)}</strong></p>`;
                 } else {
                   const source = d.driverTypeID === 4 ? d.slab : d.variation;
                   return source
                     ?.filter((item) => item.isDefault)
                     .map(
                       (sub) => `
                   <p style="color: black; font-size: ${fontSizeContent};">
                     ${d.driverName}: ${
                       d.driverTypeID === 4
                         ? sub.slabTypeID === 2
                           ? `<strong>${formatCurrency(sub.slabValue)}</strong>`
                           : `<strong>${formatCurrency(
                               sub.slabFrom,
                             )}-${formatCurrency(sub.slabTo)}</strong>`
                         : `<strong>${sub.variationName}</strong>`
                     }
                   </p>
                 `,
                     )
                     .join("");
                 }
               })
               .join("")}`
            : ""
        }

        ${
          props?.quoteAdditionalInfoGlobalPricingDriver?.filter(
            (d) => d.driverTypeID !== 1,
          ).length
            ? `<p style="font-size: ${fontSizeHeading}; color: ${newColorCode}; font-weight: bold;">Additional Information</p>
             <hr style="color: gray; margin-top: -15px;" />
             ${props.quoteAdditionalInfoGlobalPricingDriver
               .map(
                 (d) => `
               <p style="color: black; font-size: ${fontSizeContent};">
                 ${d.driverName}: <strong>${
                   d.driverTypeID === 2
                     ? formatCurrency(d.driverValue)
                     : d.driverTypeID === 3
                       ? d.variationName
                       : d.driverTypeID === 4
                         ? d.slabTypeID === 2
                           ? formatCurrency(d.driverValue)
                           : `${formatCurrency(d.slabFrom)} - ${formatCurrency(
                               d.slabTo,
                             )}`
                         : ""
                 }</strong>
               </p>
             `,
               )
               .join("")}`
            : ""
        }
      </div>
    `;
    }
  }

  const handleSOFChange = (newContent) => {
    props.setStatementOfFactsHTML(newContent);
  };

  const handleSDChange = (newContent) => {
    props.setServiceDescriptionHTML(newContent);
  };

  const hasRecurringServiceRows = (
    props.selectedRecurringServiceList || []
  ).some((service) => (service?.servicesList || []).length > 0);
  const hasOneOffServiceRows = (props.selectedOneOffServiceList || []).some(
    (service) => (service?.servicesList || []).length > 0,
  );

  const openGlobalServiceTemplatePicker = () => {
    props.setShowSelectTemplateModal(true);
    props.setServiceTypeID(
      hasRecurringServiceRows
        ? servicePackageTypeID.RecurringServiceTypeID
        : servicePackageTypeID.OneOffServiceTypeID,
    );
  };

  const recurringEngagementDiscountPercentage =
    props.RecurringFrequencyPricingInfo?.DefaultDiscount ??
    props.RecurringPricingInfoCopy?.DefaultDiscount ??
    props.RecurringPricingInfo?.DefaultDiscount ??
    null;

  const recurringEngagementServiceFooter = calculateCustomServiceFooter({
    serviceGroups: props.selectedRecurringServiceList || [],

    discountPercentage: recurringEngagementDiscountPercentage,

    // Compatibility fallback for old engagement letters
    discountAmount: props.RecurringPricingInfo?.Discount ?? null,

    fallbackVatPercentage: props.vatPercentage || 0,
  });

  const hasRecurringEngagementVAT = Number(props.vatPercentage || 0) > 0;

  const showRecurringEngagementDiscount =
    props.engagementObj?.DiscountLines &&
    recurringEngagementServiceFooter.hasPositiveDiscount;

  const recurringEngagementLabelColSpan =
    [
      props.visibleFieldsCustomTemp?.serviceCategory,
      props.visibleFieldsCustomTemp?.serviceName,
    ].filter(Boolean).length || 1;

  const oneOffEngagementServiceFooter = calculateCustomServiceFooter({
    serviceGroups: props.selectedOneOffServiceList || [],

    discountPercentage: props.OneOffPricingInfo?.DefaultDiscount ?? null,

    // Fallback for older engagement data
    discountAmount: props.OneOffPricingInfo?.Discount ?? null,

    fallbackVatPercentage: props.vatPercentage || 0,
  });

  const hasOneOffEngagementVAT = Number(props.vatPercentage || 0) > 0;

  const showOneOffEngagementDiscount =
    props.engagementObj?.DiscountLines &&
    oneOffEngagementServiceFooter.hasPositiveDiscount;

  const oneOffEngagementLabelColSpan =
    [
      props.visibleFieldsCustomTemp?.serviceCategory,
      props.visibleFieldsCustomTemp?.serviceName,
    ].filter(Boolean).length || 1;

  return (
    <>
      <div className="create-practice-height scrollbar">
        <div className="container">
          <div className="tab-content">
            <div className="tab-pane p-3 active">
              <div className="row">
                <div className="col-12">
                  <div className="row fieldset">
                    <div className="col-md-2 mb-2 text-md-end">
                      <>
                        {props.proposalName.length > 8 ? (
                          <Tooltip title={`Fees in the ${props.proposalName}`}>
                            <label className="fieldset-label required">
                              Fees in the {props.proposalName.substring(0, 8)}
                              ...
                            </label>
                          </Tooltip>
                        ) : (
                          <label className="fieldset-label required">
                            Fees in the {props.proposalName}
                            <span className="text-danger">*</span>
                          </label>
                        )}
                      </>
                    </div>
                    <div className="col-md-10 mb-2">
                      <div className="input-group">
                        {/* Adjust the Select component as needed */}
                        <Select
                          className="phone-input-country-code selectDropDown Drop-down-width"
                          value={feeTypeValue}
                          onChange={(e) => {
                            handleChangeFeesType(e);
                          }}
                          options={modifiedFeesType}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row fieldset">
                    <div className="col-md-2 text-md-end">
                      <label className="fieldset-label required">
                        Payment Gateway
                        <span className="text-danger">*</span>
                      </label>
                    </div>
                    <div className="col-md-10 mb-2">
                      <div className="d-flex flex-column align-items-end">
                        <button
                          style={{
                            fontSize: "12px",
                            border: "none",
                            background: "transparent",
                            color: "#626ed4",
                          }}
                          onClick={() => props.setISModalOpen(true)}
                          data-bs-toggle="modal"
                          data-bs-target="#paymentGatewayModel"
                          aria-label="Add Payment Gateway"
                        >
                          + Payment Gateway
                        </button>
                        <div className="input-group">
                          <Select
                            className="phone-input-country-code selectDropDown Drop-down-width"
                            value={PaymentGatewayValue}
                            onChange={(e) => {
                              props.setEngagementObj({
                                ...props.engagementObj,
                                paymentGatewayID: e.value,
                              });
                            }}
                            options={modifiedPaymentGatewayType}
                            aria-label="Select Payment Gateway"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row fieldset">
                    <div className="col-lg-2 text-lg-right">
                      <label className="fieldset-label required">
                        Show Discount
                      </label>
                    </div>
                    <div className="col-lg-10">
                      <div className="input-group">
                        {/* Replace Select with Checkbox */}
                        <input
                          disabled={
                            props.engagementObj.feeTypeId === 1 ||
                            (props.RecurringPricingInfo.DefaultDiscount <= 0 &&
                              props.OneOffPricingInfo.DefaultDiscount <= 0)
                          }
                          type="checkbox"
                          checked={props.engagementObj.DiscountLines} // Check the checkbox if DiscountLines is 1
                          onChange={handleCheckboxChange}
                        />
                      </div>
                    </div>
                  </div>
                  {(hasRecurringServiceRows || hasOneOffServiceRows) && (
                    <div
                      className="Custom-template"
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: "10px",
                        width: "100%",
                        marginBottom: "12px",
                      }}
                    >
                      <small className="text-muted">
                        Applies to recurring and one-off tables
                      </small>
                      <div className="viewTemp">
                        <Tooltip title="Select Template">
                          <div
                            onClick={openGlobalServiceTemplatePicker}
                            style={{ cursor: "pointer" }}
                          >
                            <ViewModuleIcon />
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  )}
                  {props.selectedRecurringServiceList?.length !== 0 && (
                    <>
                      <div className="separator mb-2"></div>
                      <h6>Recurring Services</h6>
                      <div className="separator mb-3"></div>
                      <div className="row fieldset">
                        <div className="col-md-2 col-sm-12  text-md-end">
                          <label className="fieldset-label">
                            Original Price ({props.currencySymbol})
                          </label>
                        </div>
                        <div className="col-md-4 col-sm-12">
                          <input
                            readOnly
                            type="text"
                            className="input-text"
                            value={Number(
                              props.RecurringPricingInfo.OriginalPrice,
                            )
                              ?.toFixed(2)
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} // Add commas as thousand separators
                          />
                        </div>
                        <div className="col-md-2 col-sm-12  text-md-end">
                          <label className="fieldset-label required">
                            Payment Frequency
                          </label>
                        </div>
                        <div className="col-md-4 col-sm-12">
                          <div className="input-group">
                            <Select
                              className="phone-input-country-code selectDropDown Drop-down-width"
                              value={selectedFrequency}
                              onChange={handlePaymentFrequencyChange}
                              options={Utils.Payment_Frequency}
                            />
                          </div>
                        </div>
                      </div>
                      <div class="row" id="recurring_Default">
                        <div class="col-lg-2 mb-1 col-md-2 col-sm-12 mt-2 text-md-end">
                          <label class="form-label">Discount (%)</label>
                        </div>
                        <div class="col-lg-4 col-md-4 col-sm-12">
                          <div class="mb-1">
                            <div className="input-group">
                              <input
                                class="input-text"
                                type="text"
                                placeholder="Discount (%)"
                                value={props.RecurringPricingInfo.DefaultDiscount?.toString()?.replace(
                                  /\B(?=(\d{3})+(?!\d))/g,
                                  ",",
                                )}
                                onChange={(e) => {
                                  handleRecurringChangeDiscount(e);
                                  // let inputValue = e.target.value;
                                  // let parsedValue = parseFloat(inputValue);
                                  // if (isNaN(parsedValue)) {
                                  //   props.setRecurringPricingInfo({
                                  //     ...props.RecurringPricingInfo,
                                  //     DefaultDiscount: inputValue,
                                  //   });
                                  //   return false
                                  // } else {
                                  //   handleRecurringChangeDiscount(e)
                                  // }
                                }}
                              />
                              {props.requireMessage &&
                                (props.pricingSettingObj.maxDiscountForQC ===
                                  "" ||
                                  props.pricingSettingObj.maxDiscountForQC ===
                                    null ||
                                  props.pricingSettingObj.maxDiscountForQC ===
                                    undefined) &&
                                props.RecurringPricingInfo.DefaultDiscount !==
                                  "" &&
                                props.RecurringPricingInfo.DefaultDiscount !==
                                  null &&
                                props.RecurringPricingInfo.DefaultDiscount !==
                                  undefined &&
                                (Number(
                                  props.RecurringPricingInfo.DefaultDiscount,
                                ) < -999.0 ||
                                  Number(
                                    props.RecurringPricingInfo.DefaultDiscount,
                                  ) > 100) && (
                                  <>
                                    <span className="validation">
                                      The discount (%) should be between
                                      -999.00% and 100%.
                                    </span>
                                  </>
                                )}

                              {props.requireMessage &&
                                props.RecurringPricingInfo.DefaultDiscount !==
                                  "" &&
                                props.RecurringPricingInfo.DefaultDiscount !==
                                  "-" &&
                                isNaN(
                                  props.RecurringPricingInfo.DefaultDiscount,
                                ) && (
                                  <span className="validation">
                                    Invalid discount
                                  </span>
                                )}
                              {props.requireMessage &&
                                props.pricingSettingObj.maxDiscountForQC !==
                                  "" &&
                                props.pricingSettingObj.maxDiscountForQC !==
                                  null &&
                                props.pricingSettingObj.maxDiscountForQC !==
                                  undefined &&
                                props.pricingSettingObj.maxDiscountForQC !==
                                  0 &&
                                props.RecurringPricingInfo.DefaultDiscount !==
                                  "" &&
                                props.RecurringPricingInfo.DefaultDiscount !==
                                  null &&
                                props.RecurringPricingInfo.DefaultDiscount !==
                                  undefined &&
                                (Number(
                                  props.RecurringPricingInfo.DefaultDiscount,
                                ) < -999.0 ||
                                  Number(
                                    props.RecurringPricingInfo.DefaultDiscount,
                                  ) >
                                    props.pricingSettingObj
                                      .maxDiscountForQC) && (
                                  <div>
                                    <span className="validation">
                                      The discount(%) should be between -999.00%
                                      and{" "}
                                      {props.pricingSettingObj.maxDiscountForQC}
                                      %.
                                    </span>
                                    <br />
                                    <button
                                      style={{
                                        fontSize: "12px",
                                        border: "none",
                                        background: "transparent",
                                        color: "#626ED4",
                                        padding: "0px",
                                      }}
                                      className="float-sm-start"
                                      data-bs-toggle="modal"
                                      data-bs-target="#pricingModel"
                                    >
                                      + Pricing Setting
                                    </button>
                                  </div>
                                )}
                              {props.requireMessage &&
                                (props.pricingSettingObj.maxDiscountForQC ==
                                  "" ||
                                  props.pricingSettingObj.maxDiscountForQC ==
                                    null ||
                                  props.pricingSettingObj.maxDiscountForQC ==
                                    undefined) &&
                                props.RecurringPricingInfo.DefaultDiscount !==
                                  "" &&
                                props.RecurringPricingInfo.DefaultDiscount !==
                                  null &&
                                props.RecurringPricingInfo.DefaultDiscount !==
                                  undefined &&
                                Number(
                                  props.RecurringPricingInfo.DefaultDiscount,
                                ) < -999.0 &&
                                Number(
                                  props.RecurringPricingInfo.DefaultDiscount,
                                ) > 100 && (
                                  <>
                                    <span className="validation">
                                      The discount(%) should be between -999.00%
                                      and 100%.
                                    </span>
                                  </>
                                )}
                            </div>
                          </div>
                        </div>
                        <div
                          style={{ padding: !props.isMobile && "0px" }}
                          class="col-lg-2 col-md-2  col-sm-12"
                        >
                          <div class="mt-2 text-md-end">
                            <label class="form-label">
                              Discounted Price ({props.currencySymbol})
                              <span class="text-danger">*</span>
                            </label>
                          </div>
                        </div>
                        <div class="col-lg-4 col-md-4 col-sm-12">
                          <div class="mb-1">
                            <div className="input-group">
                              <input
                                class="input-text"
                                type="text"
                                placeholder={`Discounted Price (${props.currencySymbol})`}
                                value={props.RecurringPricingInfo.DiscountedPrice.toString().replace(
                                  /\B(?=(\d{3})+(?!\d))/g,
                                  ",",
                                )}
                                onChange={handleRecurringDefaultPrice}
                              />
                              {props.requireMessage &&
                                props.RecurringPricingInfo.DiscountedPrice !==
                                  "" &&
                                props.RecurringPricingInfo.DiscountedPrice !==
                                  "-" &&
                                isNaN(
                                  props.RecurringPricingInfo.DiscountedPrice,
                                ) && (
                                  <span className="validation">
                                    Invalid discounted price
                                  </span>
                                )}
                              {props.requireMessage &&
                                (props.RecurringPricingInfo.DiscountedPrice ===
                                  undefined ||
                                  props.RecurringPricingInfo.DiscountedPrice ===
                                    null ||
                                  props.RecurringPricingInfo.DiscountedPrice ===
                                    "") && (
                                  <span className="validation">
                                    {ERROR_MESSAGES}
                                  </span>
                                )}
                              {props.requireMessage &&
                                minPrice !== "" &&
                                minPrice !== null &&
                                minPrice !== undefined &&
                                minPrice !== 0 &&
                                props.RecurringPricingInfo.DiscountedPrice !==
                                  "" &&
                                props.RecurringPricingInfo.DiscountedPrice !==
                                  null &&
                                props.RecurringPricingInfo.DiscountedPrice !==
                                  undefined &&
                                ((props.engagementObj.Payment_Frequency === 4 &&
                                  Number(
                                    props.RecurringPricingInfo.DiscountedPrice,
                                  ) <
                                    Number(
                                      props.pricingSettingObj
                                        .minMonthlyPriceForQC,
                                    )) ||
                                  (props.engagementObj.Payment_Frequency ===
                                    3 &&
                                    Number(
                                      props.RecurringPricingInfo
                                        .DiscountedPrice,
                                    ) <
                                      Number(
                                        props.pricingSettingObj
                                          .minMonthlyPriceForQC,
                                      ) *
                                        3) ||
                                  (props.engagementObj.Payment_Frequency ===
                                    2 &&
                                    Number(
                                      props.RecurringPricingInfo
                                        .DiscountedPrice,
                                    ) <
                                      Number(
                                        props.pricingSettingObj
                                          .minMonthlyPriceForQC,
                                      ) *
                                        6) ||
                                  (props.engagementObj.Payment_Frequency ===
                                    1 &&
                                    Number(
                                      props.RecurringPricingInfo
                                        .DiscountedPrice,
                                    ) <
                                      Number(
                                        props.pricingSettingObj
                                          .minMonthlyPriceForQC,
                                      ) *
                                        12)) && (
                                  <>
                                    <span className="validation">
                                      The min. {priceFrequency} price can not be
                                      lower than{" "}
                                      {props.formatValue(
                                        props.pricingSettingObj
                                          .minMonthlyPriceForQC,
                                        props.currencyID,
                                      )}
                                    </span>
                                    <br />
                                    <button
                                      style={{
                                        fontSize: "12px",
                                        border: "none",
                                        background: "transparent",
                                        color: "#626ED4",
                                        padding: "0px",
                                      }}
                                      className="float-sm-start"
                                      data-bs-toggle="modal"
                                      data-bs-target="#pricingModel"
                                    >
                                      + Pricing Setting
                                    </button>
                                  </>
                                )}

                              {props.requireMessage &&
                                (props.pricingSettingObj.minMonthlyPriceForQC ==
                                  "" ||
                                  props.pricingSettingObj
                                    .minMonthlyPriceForQC == null ||
                                  props.pricingSettingObj
                                    .minMonthlyPriceForQC == undefined) &&
                                props.RecurringPricingInfo.DiscountedPrice !==
                                  "" &&
                                props.RecurringPricingInfo.DiscountedPrice !==
                                  null &&
                                props.RecurringPricingInfo.DiscountedPrice !==
                                  undefined &&
                                Number(
                                  props.RecurringPricingInfo.DiscountedPrice,
                                ) <= 0 && (
                                  <>
                                    {" "}
                                    <span className="validation">
                                      The recurring discounted price may not be
                                      or less than{" "}
                                      {props.formatValue(0.0, props.currencyID)}
                                    </span>
                                  </>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3"></div>
                      {props.selectedTemplateID === 0 ? (
                        <table class="table align-middle table-nowrap">
                          <thead class="table-light table-header-font">
                            <tr class="head-row">
                              <td className="tr-table-class text-white">
                                Services
                              </td>
                              <td className="tr-table-class text-white text-right">
                                {props.RecurringPricingInfo
                                  .servicePackageName !== null ? (
                                  props.RecurringPricingInfo.servicePackageName
                                    .length > 50 ? (
                                    <Tooltip
                                      title={
                                        props.RecurringPricingInfo
                                          .servicePackageName
                                      }
                                    >
                                      {props.RecurringPricingInfo.servicePackageName
                                        .substring(0, 50)
                                        .toLowerCase()
                                        .replace(/\b\w/g, (l) =>
                                          l.toUpperCase(),
                                        ) + "..."}
                                    </Tooltip>
                                  ) : props.RecurringPricingInfo
                                      .servicePackageName.length > 50 ? (
                                    <Tooltip
                                      title={
                                        props.RecurringPricingInfo
                                          .servicePackageName
                                      }
                                    >
                                      {props.RecurringPricingInfo.servicePackageName.substring(
                                        0,
                                        50,
                                      ) + "..."}
                                    </Tooltip>
                                  ) : (
                                    props.RecurringPricingInfo
                                      .servicePackageName
                                  )
                                ) : (
                                  `Fees (${props.currencySymbol})`
                                )}
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
                                  {item.servicesList.map((service, index) => {
                                    // Add the return statement here
                                    return (
                                      <tr
                                        key={index}
                                        className={` ${
                                          service?.isAdditionalService === true
                                            ? "bg-info  text-white"
                                            : ""
                                        }`}
                                      >
                                        <td>
                                          <div>
                                            <EditableCell
                                              value={service.serviceName}
                                              displayValue={
                                                service.serviceName.length > 45
                                                  ? service.serviceName
                                                      .substring(0, 45)
                                                      .toLowerCase()
                                                      .replace(/\b\w/g, (l) =>
                                                        l.toUpperCase(),
                                                      ) + "..."
                                                  : undefined
                                              }
                                              onSave={(newName) => {
                                                props.setSelectedRecurringServiceList(
                                                  (prevList) => {
                                                    const newList = [
                                                      ...prevList,
                                                    ];
                                                    const serviceIndex =
                                                      prevList.findIndex(
                                                        (s) => s === item,
                                                      );
                                                    newList[
                                                      serviceIndex
                                                    ].servicesList[
                                                      index
                                                    ].serviceName = newName;
                                                    return newList;
                                                  },
                                                );
                                              }}
                                            />
                                          </div>
                                          {props.requireMessage &&
                                            service.serviceName.trim() ===
                                              "" && (
                                              <div>
                                                <label className="text-danger">
                                                  Please enter a valid service
                                                  name
                                                </label>
                                              </div>
                                            )}
                                          <div className="package-variables"></div>
                                        </td>
                                        <td className="text-right">
                                          {props.engagementObj.feeTypeId ===
                                            1 &&
                                            props.engagementObj
                                              .selectSourceId == 1 && (
                                              <>
                                                <span>
                                                  {props.formatValue(
                                                    service?.price,
                                                    props.currencyID,
                                                  )}
                                                </span>
                                              </>
                                            )}
                                          {props.engagementObj.feeTypeId ===
                                            1 &&
                                            props.engagementObj
                                              .selectSourceId == 2 && (
                                              <span>
                                                {props.formatValue(
                                                  service?.quotationPrice,
                                                  props.currencyID,
                                                )}
                                              </span>
                                            )}
                                          {props.engagementObj.feeTypeId ===
                                            2 && (
                                            <span className="fa fa-check"></span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </>
                              );
                            })}
                            <tr className="head-row">
                              <td className="tr-table-class font-14 text-white">
                                Net Total
                              </td>
                              <td className="tr-table-class font-14 text-white text-right">
                                {
                                  Number(
                                    props.RecurringPricingInfo.OriginalPrice,
                                  ) <
                                    Number(
                                      props.RecurringPricingInfo
                                        .DiscountedPrice,
                                    ) ||
                                  (Number(props.RecurringPricingInfo.Discount) >
                                    0 &&
                                    !props.engagementObj.DiscountLines)
                                    ? props.formatValue(
                                        props.RecurringPricingInfo
                                          .DiscountedPrice,
                                        props.currencyID,
                                      )
                                    : // Number(props.RecurringPricingInfo.DiscountedPrice)
                                      //     .toFixed(2)
                                      //     .toString()
                                      //     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                      props.formatValue(
                                        props.RecurringPricingInfo
                                          .OriginalPrice,
                                        props.currencyID,
                                      )
                                  // Number(props.RecurringPricingInfo.OriginalPrice)
                                  //     .toFixed(2)
                                  //     .toString()
                                  //     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                }
                              </td>
                            </tr>
                            {Number(props.RecurringPricingInfo.Discount) > 0 &&
                              props.engagementObj.DiscountLines && (
                                <>
                                  <tr class="head-grey-row">
                                    <td className="tr-table-class font-14 text-white">
                                      Discount
                                    </td>
                                    <td className="tr-table-class font-14 text-white text-right">
                                      (-){" "}
                                      {props.formatValue(
                                        props.RecurringPricingInfo.Discount,
                                        props.currencyID,
                                      )}
                                    </td>
                                  </tr>
                                  <tr class="head-row">
                                    <td className="tr-table-class font-14 text-white">
                                      Discounted Total
                                    </td>
                                    <td className="tr-table-class font-14 text-white text-right">
                                      {" "}
                                      {props.formatValue(
                                        props.RecurringPricingInfo
                                          .DiscountedTotal,
                                        props.currencyID,
                                      )}
                                    </td>
                                  </tr>
                                </>
                              )}

                            {props.vatPercentage && (
                              <>
                                <tr class="head-grey-row">
                                  <td className="tr-table-class font-14 text-white">
                                    {props.taxName}
                                  </td>
                                  <td className="tr-table-class font-14 text-white text-right">
                                    {" "}
                                    {props.formatValue(
                                      props.RecurringPricingInfo.VATPrice,
                                      props.currencyID,
                                    )}
                                  </td>
                                </tr>
                                <tr className="head-row">
                                  <td className="tr-table-class font-14 text-white">
                                    Grand Total
                                  </td>
                                  <td className="tr-table-class font-14 text-white text-right">
                                    {" "}
                                    {props.formatValue(
                                      props.RecurringPricingInfo.GrandTotal,
                                      props.currencyID,
                                    )}
                                  </td>
                                </tr>
                              </>
                            )}
                          </tbody>
                        </table>
                      ) : (
                        <div
                          style={{ marginTop: "0px" }}
                          className="table-responsive"
                        >
                          <table className="table align-middle table-nowrap">
                            <thead className="table-dark text-white">
                              <tr className="head-row">
                                {props.visibleFieldsCustomTemp
                                  ?.serviceCategory && (
                                  <th
                                    className="tr-table-class text-white text-center"
                                    style={{ width: "16.66%" }}
                                  >
                                    Service Category
                                  </th>
                                )}
                                {props.visibleFieldsCustomTemp.serviceName && (
                                  <th
                                    className="tr-table-class text-white text-center"
                                    style={{ width: "16.66%" }}
                                  >
                                    Services
                                  </th>
                                )}
                                {props.visibleFieldsCustomTemp.fees && (
                                  <th
                                    className="tr-table-class text-white text-center"
                                    style={{ width: "16.66%" }}
                                  >
                                    Fees ({props.currencySymbol})
                                  </th>
                                )}
                                {props.vatPercentage !== 0 &&
                                  props.visibleFieldsCustomTemp.vatRate && (
                                    <th
                                      className="tr-table-class text-white text-center"
                                      style={{ width: "16.66%" }}
                                    >
                                      {props.taxName} Rate
                                    </th>
                                  )}
                                {props.vatPercentage !== 0 &&
                                  props.visibleFieldsCustomTemp.vat && (
                                    <th
                                      className="tr-table-class text-white text-center"
                                      style={{ width: "16.66%" }}
                                    >
                                      {props.taxName} ({props.currencySymbol})
                                    </th>
                                  )}
                                {props.vatPercentage !== 0 &&
                                  props.visibleFieldsCustomTemp.feesIncVat && (
                                    <th
                                      className="tr-table-class text-white text-center"
                                      style={{ width: "16.66%" }}
                                    >
                                      Fees inc {props.taxName} (
                                      {props.currencySymbol})
                                    </th>
                                  )}
                                {props.visibleFieldsCustomTemp.serviceScope && (
                                  <th
                                    className="tr-table-class text-white text-center"
                                    style={{ width: "16.66%" }}
                                  >
                                    Service Scope
                                  </th>
                                )}
                              </tr>
                            </thead>

                            <tbody>
                              {(props.selectedRecurringServiceList || []).map(
                                (service, categoryIndex) => (
                                  <React.Fragment
                                    key={`recurring-engagement-category-${categoryIndex}`}
                                  >
                                    {(service.servicesList || []).map(
                                      (subService, serviceIndex) => {
                                        const recurringServiceRow =
                                          calculateCustomServiceRow({
                                            service: subService,

                                            fallbackVatPercentage:
                                              props.vatPercentage || 0,
                                          });

                                        const driverList = Array.isArray(
                                          subService?.pricingDriverList,
                                        )
                                          ? subService.pricingDriverList
                                          : [];

                                        return (
                                          <tr
                                            key={`recurring-engagement-service-${categoryIndex}-${serviceIndex}`}
                                          >
                                            {/* SERVICE CATEGORY */}
                                            {props.visibleFieldsCustomTemp
                                              ?.serviceCategory && (
                                              <td className="text-left">
                                                {service.serviceCatName}
                                              </td>
                                            )}

                                            {/* SERVICE NAME */}
                                            {props.visibleFieldsCustomTemp
                                              ?.serviceName && (
                                              <td className="text-left">
                                                {subService.serviceName}
                                              </td>
                                            )}

                                            {/* FEES */}
                                            {props.visibleFieldsCustomTemp
                                              ?.fees && (
                                              <td className="text-center">
                                                {Number(
                                                  props.engagementObj
                                                    ?.feeTypeId,
                                                ) === 1 ? (
                                                  props.formatValue(
                                                    recurringServiceRow.fees,
                                                    props.currencyID,
                                                  )
                                                ) : (
                                                  <span className="fa fa-check"></span>
                                                )}
                                              </td>
                                            )}

                                            {/* VAT RATE */}
                                            {hasRecurringEngagementVAT &&
                                              props.visibleFieldsCustomTemp
                                                ?.vatRate && (
                                                <td className="text-center">
                                                  {Number(
                                                    recurringServiceRow.vatRate ||
                                                      0,
                                                  ).toFixed(2)}
                                                  %
                                                </td>
                                              )}

                                            {/* VAT */}
                                            {hasRecurringEngagementVAT &&
                                              props.visibleFieldsCustomTemp
                                                ?.vat && (
                                                <td className="text-center">
                                                  {Number(
                                                    props.engagementObj
                                                      ?.feeTypeId,
                                                  ) === 1 ? (
                                                    props.formatValue(
                                                      recurringServiceRow.vat,
                                                      props.currencyID,
                                                    )
                                                  ) : (
                                                    <span className="fa fa-check"></span>
                                                  )}
                                                </td>
                                              )}

                                            {/* FEES INCLUDING VAT */}
                                            {hasRecurringEngagementVAT &&
                                              props.visibleFieldsCustomTemp
                                                ?.feesIncVat && (
                                                <td className="text-center">
                                                  {Number(
                                                    props.engagementObj
                                                      ?.feeTypeId,
                                                  ) === 1 ? (
                                                    props.formatValue(
                                                      recurringServiceRow.feesIncVat,
                                                      props.currencyID,
                                                    )
                                                  ) : (
                                                    <span className="fa fa-check"></span>
                                                  )}
                                                </td>
                                              )}

                                            {/* SERVICE SCOPE */}
                                            {props.visibleFieldsCustomTemp
                                              ?.serviceScope && (
                                              <td className="text-left">
                                                {driverList.length > 0
                                                  ? driverList.map(
                                                      (driver, driverIndex) => {
                                                        const matchedVariation =
                                                          Array.isArray(
                                                            driver?.variation,
                                                          )
                                                            ? driver.variation.find(
                                                                (variation) =>
                                                                  Number(
                                                                    variation.variationValue,
                                                                  ) ===
                                                                    Number(
                                                                      driver.driverValue,
                                                                    ) ||
                                                                  Number(
                                                                    variation.variationID,
                                                                  ) ===
                                                                    Number(
                                                                      driver.variationID,
                                                                    ),
                                                              )
                                                            : null;

                                                        const displayedValue =
                                                          matchedVariation
                                                            ? matchedVariation.variationName
                                                            : driver?.driverValue;

                                                        return (
                                                          <div
                                                            key={`recurring-engagement-driver-${categoryIndex}-${serviceIndex}-${driverIndex}`}
                                                          >
                                                            {driver.driverName}{" "}
                                                            = {displayedValue}
                                                            {driverIndex !==
                                                            driverList.length -
                                                              1
                                                              ? "; "
                                                              : ""}
                                                          </div>
                                                        );
                                                      },
                                                    )
                                                  : "-"}
                                              </td>
                                            )}
                                          </tr>
                                        );
                                      },
                                    )}
                                  </React.Fragment>
                                ),
                              )}

                              {/* NET TOTAL */}
                              <tr className="head-row">
                                <td
                                  colSpan={recurringEngagementLabelColSpan}
                                  className="tr-table-class text-white"
                                >
                                  Net Total
                                </td>

                                {/* FEES */}
                                {props.visibleFieldsCustomTemp?.fees && (
                                  <td className="tr-table-class text-white text-center">
                                    {props.formatValue(
                                      props.engagementObj?.DiscountLines
                                        ? recurringEngagementServiceFooter.net
                                        : recurringEngagementServiceFooter.finalNet,
                                      props.currencyID,
                                    )}
                                  </td>
                                )}

                                {/* VAT RATE */}
                                {hasRecurringEngagementVAT &&
                                  props.visibleFieldsCustomTemp?.vatRate && (
                                    <td className="tr-table-class text-white text-center"></td>
                                  )}

                                {/* VAT */}
                                {hasRecurringEngagementVAT &&
                                  props.visibleFieldsCustomTemp?.vat && (
                                    <td className="tr-table-class text-white text-center">
                                      {props.formatValue(
                                        props.engagementObj?.DiscountLines
                                          ? recurringEngagementServiceFooter.vat
                                          : recurringEngagementServiceFooter.finalVat,
                                        props.currencyID,
                                      )}
                                    </td>
                                  )}

                                {/* FEES INCLUDING VAT */}
                                {hasRecurringEngagementVAT &&
                                  props.visibleFieldsCustomTemp?.feesIncVat && (
                                    <td className="tr-table-class text-white text-center">
                                      {props.formatValue(
                                        props.engagementObj?.DiscountLines
                                          ? recurringEngagementServiceFooter.feesIncVat
                                          : recurringEngagementServiceFooter.finalFeesIncVat,
                                        props.currencyID,
                                      )}
                                    </td>
                                  )}

                                {/* SERVICE SCOPE — LAST COLUMN */}
                                {props.visibleFieldsCustomTemp
                                  ?.serviceScope && (
                                  <td className="tr-table-class text-white"></td>
                                )}
                              </tr>

                              {/* DISCOUNT */}
                              {showRecurringEngagementDiscount && (
                                <tr className="head-grey-row">
                                  <td
                                    colSpan={recurringEngagementLabelColSpan}
                                    className="tr-table-class font-14 text-white"
                                  >
                                    Discount
                                  </td>

                                  {/* FEES */}
                                  {props.visibleFieldsCustomTemp?.fees && (
                                    <td className="tr-table-class font-14 text-white text-center">
                                      (-){" "}
                                      {props.formatValue(
                                        recurringEngagementServiceFooter.discount,
                                        props.currencyID,
                                      )}
                                    </td>
                                  )}

                                  {/* VAT RATE */}
                                  {hasRecurringEngagementVAT &&
                                    props.visibleFieldsCustomTemp?.vatRate && (
                                      <td className="tr-table-class text-white text-center"></td>
                                    )}

                                  {/* VAT */}
                                  {hasRecurringEngagementVAT &&
                                    props.visibleFieldsCustomTemp?.vat && (
                                      <td className="tr-table-class text-white text-center">
                                        (-){" "}
                                        {props.formatValue(
                                          recurringEngagementServiceFooter.vatDiscount,
                                          props.currencyID,
                                        )}
                                      </td>
                                    )}

                                  {/* FEES INCLUDING VAT */}
                                  {hasRecurringEngagementVAT &&
                                    props.visibleFieldsCustomTemp
                                      ?.feesIncVat && (
                                      <td className="tr-table-class text-white text-center">
                                        (-){" "}
                                        {props.formatValue(
                                          recurringEngagementServiceFooter.feesIncVatDiscount,
                                          props.currencyID,
                                        )}
                                      </td>
                                    )}

                                  {/* SERVICE SCOPE — LAST COLUMN */}
                                  {props.visibleFieldsCustomTemp
                                    ?.serviceScope && (
                                    <td className="tr-table-class text-white"></td>
                                  )}
                                </tr>
                              )}

                              {/* GRAND TOTAL / DISCOUNTED TOTAL */}
                              {showRecurringEngagementDiscount && (
                                <tr className="head-row">
                                  <td
                                    colSpan={recurringEngagementLabelColSpan}
                                    className="tr-table-class font-14 text-white"
                                  >
                                    {hasRecurringEngagementVAT
                                      ? "Grand Total"
                                      : "Discounted Total"}
                                  </td>

                                  {/* FEES */}
                                  {props.visibleFieldsCustomTemp?.fees && (
                                    <td className="tr-table-class font-14 text-white text-center">
                                      {props.formatValue(
                                        recurringEngagementServiceFooter.finalNet,
                                        props.currencyID,
                                      )}
                                    </td>
                                  )}

                                  {/* VAT RATE */}
                                  {hasRecurringEngagementVAT &&
                                    props.visibleFieldsCustomTemp?.vatRate && (
                                      <td className="tr-table-class text-white text-center"></td>
                                    )}

                                  {/* VAT */}
                                  {hasRecurringEngagementVAT &&
                                    props.visibleFieldsCustomTemp?.vat && (
                                      <td className="tr-table-class font-14 text-white text-center">
                                        {props.formatValue(
                                          recurringEngagementServiceFooter.finalVat,
                                          props.currencyID,
                                        )}
                                      </td>
                                    )}

                                  {/* FEES INCLUDING VAT */}
                                  {hasRecurringEngagementVAT &&
                                    props.visibleFieldsCustomTemp
                                      ?.feesIncVat && (
                                      <td className="tr-table-class font-14 text-white text-center">
                                        {props.formatValue(
                                          recurringEngagementServiceFooter.finalFeesIncVat,
                                          props.currencyID,
                                        )}
                                      </td>
                                    )}

                                  {/* SERVICE SCOPE — LAST COLUMN */}
                                  {props.visibleFieldsCustomTemp
                                    ?.serviceScope && (
                                    <td className="tr-table-class text-white"></td>
                                  )}
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                  {props.selectedOneOffServiceList?.length !== 0 && (
                    <>
                      <div className="separator mt-3  mb-2"></div>
                      <h6>One Off Services</h6>
                      <div className="separator mb-3"></div>
                      <div className="row fieldset">
                        <div className="col-md-2 col-sm-12  text-md-end">
                          <label className="fieldset-label">
                            Original Price ({props.currencySymbol})
                          </label>
                        </div>
                        <div className="col-md-10 col-sm-12">
                          <input
                            readonly=""
                            type="text"
                            class="input-text"
                            value={
                              // props.formatValue(
                              // props.OneOffPricingInfo.OriginalPrice
                              // )
                              Number(props.OneOffPricingInfo.OriginalPrice)
                                ?.toFixed(2)
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            } // Add commas as thousand separators
                          />
                        </div>
                      </div>
                      <div class="row" id="OneOff_Default">
                        <div class="col-lg-2 col-md-2 col-sm-12">
                          <div class="mt-2 mb-1 text-md-end">
                            <label class="form-label">Discount (%)</label>
                          </div>
                        </div>
                        <div class="col-lg-4 col-md-4 col-sm-12">
                          <div>
                            <div className="input-group">
                              <input
                                class="input-text"
                                type="text"
                                placeholder="Discount (%)"
                                value={props.OneOffPricingInfo.DefaultDiscount?.toString()?.replace(
                                  /\B(?=(\d{3})+(?!\d))/g,
                                  ",",
                                )}
                                onChange={(e) => {
                                  handleOneOffChangeDiscount(e);
                                  // let inputValue = e.target.value;
                                  // let parsedValue = parseFloat(inputValue);
                                  // if (isNaN(parsedValue)) {
                                  //   props.setOneOffPricingInfo({
                                  //     ...props.OneOffPricingInfo,
                                  //     DefaultDiscount: inputValue,
                                  //   });
                                  //   return false
                                  // } else {

                                  //   handleOneOffChangeDiscount(e)
                                  // }
                                }}
                              />
                              {props.requireMessage &&
                                props.OneOffPricingInfo.DefaultDiscount !==
                                  "" &&
                                props.OneOffPricingInfo.DefaultDiscount !==
                                  "-" &&
                                isNaN(
                                  props.OneOffPricingInfo.DefaultDiscount,
                                ) && (
                                  <span className="validation">
                                    Invalid discount
                                  </span>
                                )}

                              {props.requireMessage &&
                                props.pricingSettingObj.maxDiscountForQC !==
                                  "" &&
                                props.pricingSettingObj.maxDiscountForQC !==
                                  null &&
                                props.pricingSettingObj.maxDiscountForQC !==
                                  undefined &&
                                props.pricingSettingObj.maxDiscountForQC !==
                                  0 &&
                                props.OneOffPricingInfo.DefaultDiscount !==
                                  "" &&
                                props.OneOffPricingInfo.DefaultDiscount !==
                                  null &&
                                props.OneOffPricingInfo.DefaultDiscount !==
                                  undefined &&
                                (Number(
                                  props.OneOffPricingInfo.DefaultDiscount,
                                ) < -999.0 ||
                                  Number(
                                    props.OneOffPricingInfo.DefaultDiscount,
                                  ) >
                                    props.pricingSettingObj
                                      .maxDiscountForQC) && (
                                  <div>
                                    <span className="validation">
                                      The discount (%) should be between
                                      -999.00% and{" "}
                                      {props.pricingSettingObj.maxDiscountForQC}
                                      %.
                                    </span>
                                    <br />
                                    <button
                                      style={{
                                        fontSize: "12px",
                                        border: "none",
                                        background: "transparent",
                                        color: "#626ED4",
                                        padding: "0px",
                                      }}
                                      className="float-sm-start"
                                      data-bs-toggle="modal"
                                      data-bs-target="#pricingModel"
                                    >
                                      + Pricing Setting
                                    </button>
                                  </div>
                                )}
                              {props.requireMessage &&
                                (props.pricingSettingObj.maxDiscountForQC ==
                                  "" ||
                                  props.pricingSettingObj.maxDiscountForQC ==
                                    null ||
                                  props.pricingSettingObj.maxDiscountForQC ==
                                    undefined) &&
                                props.OneOffPricingInfo.DefaultDiscount !==
                                  "" &&
                                props.OneOffPricingInfo.DefaultDiscount !==
                                  null &&
                                props.OneOffPricingInfo.DefaultDiscount !==
                                  undefined &&
                                (Number(
                                  props.OneOffPricingInfo.DefaultDiscount,
                                ) < -999.0 ||
                                  Number(
                                    props.OneOffPricingInfo.DefaultDiscount,
                                  ) > 100) && (
                                  <>
                                    <span className="validation">
                                      The discount (%) should be between
                                      -999.00% and 100%.
                                    </span>
                                  </>
                                )}
                            </div>
                          </div>
                        </div>
                        <div
                          style={{ padding: !props.isMobile && "0px" }}
                          class="col-lg-2 col-md-2 mt-2 col-sm-12"
                        >
                          <div class="mb-1  text-md-end">
                            <label class="form-label">
                              Discounted Price ({props.currencySymbol})
                              <span class="text-danger">*</span>
                            </label>
                          </div>
                        </div>
                        <div class="col-lg-4 col-md-4 col-sm-12">
                          <div class="mb-1">
                            <div className="input-group">
                              <input
                                class="input-text"
                                type="text"
                                placeholder={`Discounted Price (${props.currencySymbol})`}
                                value={props.OneOffPricingInfo.DiscountedPrice?.toString()?.replace(
                                  /\B(?=(\d{3})+(?!\d))/g,
                                  ",",
                                )}
                                onChange={handleOneOffDefaultPrice}
                              />

                              {props.requireMessage &&
                                props.OneOffPricingInfo.DiscountedPrice !==
                                  "" &&
                                props.OneOffPricingInfo.DiscountedPrice !==
                                  "-" &&
                                isNaN(
                                  props.OneOffPricingInfo.DiscountedPrice,
                                ) && (
                                  <span className="validation">
                                    Invalid discounted price
                                  </span>
                                )}
                              {props.requireMessage &&
                                (props.OneOffPricingInfo.DiscountedPrice ===
                                  undefined ||
                                  props.OneOffPricingInfo.DiscountedPrice ===
                                    null ||
                                  props.OneOffPricingInfo.DiscountedPrice ===
                                    "") && (
                                  <span className="validation">
                                    {ERROR_MESSAGES}
                                  </span>
                                )}

                              {props.requireMessage &&
                                props.pricingSettingObj.minOneOffPriceForQC !==
                                  "" &&
                                props.pricingSettingObj.minOneOffPriceForQC !==
                                  null &&
                                props.pricingSettingObj.minOneOffPriceForQC !==
                                  undefined &&
                                props.OneOffPricingInfo.DiscountedPrice !==
                                  "" &&
                                props.OneOffPricingInfo.DiscountedPrice !==
                                  null &&
                                props.OneOffPricingInfo.DiscountedPrice !==
                                  undefined &&
                                Number(
                                  props.OneOffPricingInfo.DiscountedPrice,
                                ) <
                                  props.pricingSettingObj
                                    .minOneOffPriceForQC && (
                                  <>
                                    <span className="validation">
                                      The min. one-Off price can not be lower
                                      than{" "}
                                      {props.formatValue(
                                        props.pricingSettingObj
                                          .minOneOffPriceForQC,
                                        props.currencyID,
                                      )}
                                    </span>
                                    <br />
                                    <button
                                      style={{
                                        fontSize: "12px",
                                        border: "none",
                                        background: "transparent",
                                        color: "#626ED4",
                                        padding: "0px",
                                      }}
                                      className="float-sm-start"
                                      data-bs-toggle="modal"
                                      data-bs-target="#pricingModel"
                                    >
                                      + Pricing Setting
                                    </button>
                                  </>
                                )}

                              {props.requireMessage &&
                                (props.pricingSettingObj.minOneOffPriceForQC ==
                                  "" ||
                                  props.pricingSettingObj.minOneOffPriceForQC ==
                                    null ||
                                  props.pricingSettingObj.minOneOffPriceForQC ==
                                    0 ||
                                  props.pricingSettingObj.minOneOffPriceForQC ==
                                    undefined) &&
                                props.OneOffPricingInfo.DiscountedPrice !==
                                  "" &&
                                props.OneOffPricingInfo.DiscountedPrice !==
                                  null &&
                                props.OneOffPricingInfo.DiscountedPrice !==
                                  undefined &&
                                Number(
                                  props.OneOffPricingInfo.DiscountedPrice,
                                ) <=
                                  props.pricingSettingObj
                                    .minOneOffPriceForQC && (
                                  <>
                                    <span className="validation">
                                      The One Off discounted price may not be or
                                      less than{" "}
                                      {props.formatValue(0.0, props.currencyID)}
                                    </span>
                                  </>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3"></div>
                      {props.selectedTemplateID === 0 ? (
                        <table class="table align-middle table-nowrap">
                          <thead class="table-light table-header-font">
                            <tr class="head-row">
                              <td className="tr-table-class text-white">
                                Services
                              </td>
                              <td className="tr-table-class text-white text-right">
                                {props.OneOffPricingInfo.servicePackageName !==
                                null ? (
                                  props.OneOffPricingInfo.servicePackageName
                                    .length > 50 ? (
                                    <Tooltip
                                      title={
                                        props.OneOffPricingInfo
                                          .servicePackageName
                                      }
                                    >
                                      {props.OneOffPricingInfo.servicePackageName
                                        .substring(0, 50)
                                        .toLowerCase()
                                        .replace(/\b\w/g, (l) =>
                                          l.toUpperCase(),
                                        ) + "..."}
                                    </Tooltip>
                                  ) : props.OneOffPricingInfo.servicePackageName
                                      .length > 50 ? (
                                    <Tooltip
                                      title={
                                        props.OneOffPricingInfo
                                          .servicePackageName
                                      }
                                    >
                                      {props.OneOffPricingInfo.servicePackageName.substring(
                                        0,
                                        50,
                                      ) + "..."}
                                    </Tooltip>
                                  ) : (
                                    props.OneOffPricingInfo.servicePackageName
                                  )
                                ) : (
                                  `Fees (${props.currencySymbol})`
                                )}
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
                                  {item.servicesList.map((service, index) => {
                                    // Add the return statement here
                                    return (
                                      <tr
                                        key={index}
                                        className={` ${
                                          service?.isAdditionalService === true
                                            ? "bg-info  text-white"
                                            : ""
                                        }`}
                                      >
                                        <td>
                                          <div>
                                            <EditableCell
                                              value={service.serviceName}
                                              displayValue={
                                                service.serviceName.length > 45
                                                  ? service.serviceName
                                                      .substring(0, 45)
                                                      .toLowerCase()
                                                      .replace(/\b\w/g, (l) =>
                                                        l.toUpperCase(),
                                                      ) + "..."
                                                  : undefined
                                              }
                                              onSave={(newName) => {
                                                props.setSelectedOneOffServiceList(
                                                  (prevList) => {
                                                    const newList = [
                                                      ...prevList,
                                                    ];
                                                    const serviceIndex =
                                                      prevList.findIndex(
                                                        (s) => s === item,
                                                      );
                                                    newList[
                                                      serviceIndex
                                                    ].servicesList[
                                                      index
                                                    ].serviceName = newName;
                                                    return newList;
                                                  },
                                                );
                                              }}
                                            />
                                          </div>
                                          {props.requireMessage &&
                                            service.serviceName.trim() ===
                                              "" && (
                                              <div>
                                                <label className="text-danger">
                                                  Please enter a valid service
                                                  name
                                                </label>
                                              </div>
                                            )}
                                          <div className="package-variables"></div>
                                        </td>
                                        <td className="text-right">
                                          {props.engagementObj.feeTypeId ===
                                            1 &&
                                            props.engagementObj
                                              .selectSourceId == 1 && (
                                              <span>
                                                {props.formatValue(
                                                  service?.price,
                                                  props.currencyID,
                                                )}
                                              </span>
                                            )}
                                          {props.engagementObj.feeTypeId ===
                                            1 &&
                                            props.engagementObj
                                              .selectSourceId == 2 && (
                                              <span>
                                                {props.formatValue(
                                                  service?.quotationPrice,
                                                  props.currencyID,
                                                )}
                                              </span>
                                            )}
                                          {props.engagementObj.feeTypeId ===
                                            2 && (
                                            <span className="fa fa-check"></span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </>
                              );
                            })}
                            <tr className="head-row">
                              <td className="tr-table-class font-14 text-white">
                                Net Total
                              </td>
                              <td className="tr-table-class font-14 text-white text-right">
                                {
                                  Number(
                                    props.OneOffPricingInfo.OriginalPrice,
                                  ) <
                                    Number(
                                      props.OneOffPricingInfo.DiscountedPrice,
                                    ) ||
                                  (Number(props.OneOffPricingInfo.Discount) >
                                    0 &&
                                    !props.engagementObj.DiscountLines)
                                    ? props.formatValue(
                                        props.OneOffPricingInfo.DiscountedPrice,
                                        props.currencyID,
                                      )
                                    : // Number(props.OneOffPricingInfo.DiscountedPrice)
                                      //     .toFixed(2)
                                      //     .toString()
                                      //     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                      props.formatValue(
                                        props.OneOffPricingInfo.OriginalPrice,
                                        props.currencyID,
                                      )
                                  // Number(props.OneOffPricingInfo.OriginalPrice)
                                  //     .toFixed(2)
                                  //     .toString()
                                  //     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                }
                              </td>
                            </tr>
                            {Number(props.OneOffPricingInfo.Discount) > 0 &&
                              props.engagementObj.DiscountLines && (
                                <>
                                  {" "}
                                  <tr class="head-grey-row">
                                    <td className="tr-table-class font-14 text-white">
                                      Discount
                                    </td>
                                    <td className="tr-table-class font-14 text-white text-right">
                                      (-){" "}
                                      {props.formatValue(
                                        props.OneOffPricingInfo.Discount,
                                        props.currencyID,
                                      )}
                                    </td>
                                  </tr>
                                  <tr class="head-row">
                                    <td className="tr-table-class font-14 text-white">
                                      Discounted Total
                                    </td>
                                    <td className="tr-table-class font-14 text-white text-right">
                                      {props.formatValue(
                                        props.OneOffPricingInfo.DiscountedTotal,
                                        props.currencyID,
                                      )}
                                    </td>
                                  </tr>
                                </>
                              )}
                            {props.vatPercentage && (
                              <>
                                <tr class="head-grey-row">
                                  <td className="tr-table-class font-14 text-white">
                                    {props.taxName}
                                  </td>
                                  <td className="tr-table-class font-14 text-white text-right">
                                    {props.formatValue(
                                      props.OneOffPricingInfo.VATPrice,
                                      props.currencyID,
                                    )}
                                  </td>
                                </tr>
                                <tr className="head-row">
                                  <td className="tr-table-class font-14 text-white">
                                    Grand Total
                                  </td>
                                  <td className="tr-table-class font-14 text-white text-right">
                                    {props.formatValue(
                                      props.OneOffPricingInfo.GrandTotal,
                                      props.currencyID,
                                    )}
                                  </td>
                                </tr>
                              </>
                            )}
                          </tbody>
                        </table>
                      ) : (
                        <div
                          style={{ marginTop: "0px" }}
                          className="table-responsive"
                        >
                          <table className="table align-middle table-nowrap">
                            <thead className="table-dark text-white">
                              <tr className="head-row">
                                {props.visibleFieldsCustomTemp
                                  ?.serviceCategory && (
                                  <th className="tr-table-class text-white text-center">
                                    Service Category
                                  </th>
                                )}

                                {props.visibleFieldsCustomTemp?.serviceName && (
                                  <th className="tr-table-class text-white text-center">
                                    Services
                                  </th>
                                )}

                                {props.visibleFieldsCustomTemp?.fees && (
                                  <th className="tr-table-class text-white text-center">
                                    Fees ({props.currencySymbol})
                                  </th>
                                )}

                                {hasOneOffEngagementVAT &&
                                  props.visibleFieldsCustomTemp?.vatRate && (
                                    <th className="tr-table-class text-white text-center">
                                      {props.taxName} Rate
                                    </th>
                                  )}

                                {hasOneOffEngagementVAT &&
                                  props.visibleFieldsCustomTemp?.vat && (
                                    <th className="tr-table-class text-white text-center">
                                      {props.taxName} ({props.currencySymbol})
                                    </th>
                                  )}

                                {hasOneOffEngagementVAT &&
                                  props.visibleFieldsCustomTemp?.feesIncVat && (
                                    <th className="tr-table-class text-white text-center">
                                      Fees inc {props.taxName} (
                                      {props.currencySymbol})
                                    </th>
                                  )}

                                {props.visibleFieldsCustomTemp
                                  ?.serviceScope && (
                                  <th className="tr-table-class text-white text-center">
                                    Service Scope
                                  </th>
                                )}
                              </tr>
                            </thead>

                            <tbody>
                              {(props.selectedOneOffServiceList || []).map(
                                (service, categoryIndex) => (
                                  <React.Fragment
                                    key={`oneoff-engagement-category-${categoryIndex}`}
                                  >
                                    {(service.servicesList || []).map(
                                      (subService, serviceIndex) => {
                                        /*
                                         * Some engagement-letter responses contain
                                         * quotationPrice instead of price.
                                         */
                                        const serviceForCalculation = {
                                          ...subService,

                                          price: hasCalculationValue(
                                            subService?.price,
                                          )
                                            ? subService.price
                                            : subService?.quotationPrice,
                                        };

                                        const oneOffServiceRow =
                                          calculateCustomServiceRow({
                                            service: serviceForCalculation,

                                            fallbackVatPercentage:
                                              props.vatPercentage || 0,
                                          });

                                        const driverList = Array.isArray(
                                          subService?.pricingDriverList,
                                        )
                                          ? subService.pricingDriverList
                                          : [];

                                        return (
                                          <tr
                                            key={`oneoff-engagement-service-${categoryIndex}-${serviceIndex}`}
                                          >
                                            {/* SERVICE CATEGORY */}
                                            {props.visibleFieldsCustomTemp
                                              ?.serviceCategory && (
                                              <td className="text-left">
                                                {service.serviceCatName}
                                              </td>
                                            )}

                                            {/* SERVICE NAME */}
                                            {props.visibleFieldsCustomTemp
                                              ?.serviceName && (
                                              <td className="text-left">
                                                {subService.serviceName}
                                              </td>
                                            )}

                                            {/* FEES */}
                                            {props.visibleFieldsCustomTemp
                                              ?.fees && (
                                              <td className="text-center">
                                                {Number(
                                                  props.engagementObj
                                                    ?.feeTypeId,
                                                ) === 1 ? (
                                                  props.formatValue(
                                                    oneOffServiceRow.fees,
                                                    props.currencyID,
                                                  )
                                                ) : (
                                                  <span className="fa fa-check"></span>
                                                )}
                                              </td>
                                            )}

                                            {/* VAT RATE */}
                                            {hasOneOffEngagementVAT &&
                                              props.visibleFieldsCustomTemp
                                                ?.vatRate && (
                                                <td className="text-center">
                                                  {Number(
                                                    oneOffServiceRow.vatRate ||
                                                      0,
                                                  ).toFixed(2)}
                                                  %
                                                </td>
                                              )}

                                            {/* VAT */}
                                            {hasOneOffEngagementVAT &&
                                              props.visibleFieldsCustomTemp
                                                ?.vat && (
                                                <td className="text-center">
                                                  {Number(
                                                    props.engagementObj
                                                      ?.feeTypeId,
                                                  ) === 1 ? (
                                                    props.formatValue(
                                                      oneOffServiceRow.vat,
                                                      props.currencyID,
                                                    )
                                                  ) : (
                                                    <span className="fa fa-check"></span>
                                                  )}
                                                </td>
                                              )}

                                            {/* FEES INCLUDING VAT */}
                                            {hasOneOffEngagementVAT &&
                                              props.visibleFieldsCustomTemp
                                                ?.feesIncVat && (
                                                <td className="text-center">
                                                  {Number(
                                                    props.engagementObj
                                                      ?.feeTypeId,
                                                  ) === 1 ? (
                                                    props.formatValue(
                                                      oneOffServiceRow.feesIncVat,
                                                      props.currencyID,
                                                    )
                                                  ) : (
                                                    <span className="fa fa-check"></span>
                                                  )}
                                                </td>
                                              )}

                                            {/* SERVICE SCOPE */}
                                            {props.visibleFieldsCustomTemp
                                              ?.serviceScope && (
                                              <td className="text-left">
                                                {driverList.length > 0
                                                  ? driverList.map(
                                                      (driver, driverIndex) => {
                                                        const matchedVariation =
                                                          Array.isArray(
                                                            driver?.variation,
                                                          )
                                                            ? driver.variation.find(
                                                                (variation) =>
                                                                  Number(
                                                                    variation.variationValue,
                                                                  ) ===
                                                                    Number(
                                                                      driver.driverValue,
                                                                    ) ||
                                                                  Number(
                                                                    variation.variationID,
                                                                  ) ===
                                                                    Number(
                                                                      driver.variationID,
                                                                    ),
                                                              )
                                                            : null;

                                                        const displayedValue =
                                                          matchedVariation
                                                            ? matchedVariation.variationName
                                                            : driver?.driverValue;

                                                        return (
                                                          <div
                                                            key={`oneoff-engagement-driver-${categoryIndex}-${serviceIndex}-${driverIndex}`}
                                                          >
                                                            {driver.driverName}{" "}
                                                            = {displayedValue}
                                                            {driverIndex !==
                                                            driverList.length -
                                                              1
                                                              ? "; "
                                                              : ""}
                                                          </div>
                                                        );
                                                      },
                                                    )
                                                  : "-"}
                                              </td>
                                            )}
                                          </tr>
                                        );
                                      },
                                    )}
                                  </React.Fragment>
                                ),
                              )}

                              {/* NET TOTAL */}
                              <tr className="head-row">
                                <td
                                  colSpan={oneOffEngagementLabelColSpan}
                                  className="tr-table-class text-white"
                                >
                                  Net Total
                                </td>

                                {/* FEES */}
                                {props.visibleFieldsCustomTemp?.fees && (
                                  <td className="tr-table-class text-white text-center">
                                    {props.formatValue(
                                      props.engagementObj?.DiscountLines
                                        ? oneOffEngagementServiceFooter.net
                                        : oneOffEngagementServiceFooter.finalNet,
                                      props.currencyID,
                                    )}
                                  </td>
                                )}

                                {/* VAT RATE */}
                                {hasOneOffEngagementVAT &&
                                  props.visibleFieldsCustomTemp?.vatRate && (
                                    <td className="tr-table-class text-white text-center"></td>
                                  )}

                                {/* VAT */}
                                {hasOneOffEngagementVAT &&
                                  props.visibleFieldsCustomTemp?.vat && (
                                    <td className="tr-table-class text-white text-center">
                                      {props.formatValue(
                                        props.engagementObj?.DiscountLines
                                          ? oneOffEngagementServiceFooter.vat
                                          : oneOffEngagementServiceFooter.finalVat,
                                        props.currencyID,
                                      )}
                                    </td>
                                  )}

                                {/* FEES INCLUDING VAT */}
                                {hasOneOffEngagementVAT &&
                                  props.visibleFieldsCustomTemp?.feesIncVat && (
                                    <td className="tr-table-class text-white text-center">
                                      {props.formatValue(
                                        props.engagementObj?.DiscountLines
                                          ? oneOffEngagementServiceFooter.feesIncVat
                                          : oneOffEngagementServiceFooter.finalFeesIncVat,
                                        props.currencyID,
                                      )}
                                    </td>
                                  )}

                                {/* SERVICE SCOPE — ALWAYS LAST */}
                                {props.visibleFieldsCustomTemp
                                  ?.serviceScope && (
                                  <td className="tr-table-class text-white"></td>
                                )}
                              </tr>

                              {/* DISCOUNT */}
                              {showOneOffEngagementDiscount && (
                                <tr className="head-grey-row">
                                  <td
                                    colSpan={oneOffEngagementLabelColSpan}
                                    className="tr-table-class font-14 text-white"
                                  >
                                    Discount
                                  </td>

                                  {/* FEES */}
                                  {props.visibleFieldsCustomTemp?.fees && (
                                    <td className="tr-table-class font-14 text-white text-center">
                                      (-){" "}
                                      {props.formatValue(
                                        oneOffEngagementServiceFooter.discount,
                                        props.currencyID,
                                      )}
                                    </td>
                                  )}

                                  {/* VAT RATE */}
                                  {hasOneOffEngagementVAT &&
                                    props.visibleFieldsCustomTemp?.vatRate && (
                                      <td className="tr-table-class text-white text-center"></td>
                                    )}

                                  {/* VAT */}
                                  {hasOneOffEngagementVAT &&
                                    props.visibleFieldsCustomTemp?.vat && (
                                      <td className="tr-table-class text-white text-center">
                                        (-){" "}
                                        {props.formatValue(
                                          oneOffEngagementServiceFooter.vatDiscount,
                                          props.currencyID,
                                        )}
                                      </td>
                                    )}

                                  {/* FEES INCLUDING VAT */}
                                  {hasOneOffEngagementVAT &&
                                    props.visibleFieldsCustomTemp
                                      ?.feesIncVat && (
                                      <td className="tr-table-class text-white text-center">
                                        (-){" "}
                                        {props.formatValue(
                                          oneOffEngagementServiceFooter.feesIncVatDiscount,
                                          props.currencyID,
                                        )}
                                      </td>
                                    )}

                                  {/* SERVICE SCOPE — ALWAYS LAST */}
                                  {props.visibleFieldsCustomTemp
                                    ?.serviceScope && (
                                    <td className="tr-table-class text-white"></td>
                                  )}
                                </tr>
                              )}

                              {/* GRAND TOTAL / DISCOUNTED TOTAL */}
                              {showOneOffEngagementDiscount && (
                                <tr className="head-row">
                                  <td
                                    colSpan={oneOffEngagementLabelColSpan}
                                    className="tr-table-class font-14 text-white"
                                  >
                                    {hasOneOffEngagementVAT
                                      ? "Grand Total"
                                      : "Discounted Total"}
                                  </td>

                                  {/* FEES */}
                                  {props.visibleFieldsCustomTemp?.fees && (
                                    <td className="tr-table-class font-14 text-white text-center">
                                      {props.formatValue(
                                        oneOffEngagementServiceFooter.finalNet,
                                        props.currencyID,
                                      )}
                                    </td>
                                  )}

                                  {/* VAT RATE */}
                                  {hasOneOffEngagementVAT &&
                                    props.visibleFieldsCustomTemp?.vatRate && (
                                      <td className="tr-table-class text-white text-center"></td>
                                    )}

                                  {/* VAT */}
                                  {hasOneOffEngagementVAT &&
                                    props.visibleFieldsCustomTemp?.vat && (
                                      <td className="tr-table-class font-14 text-white text-center">
                                        {props.formatValue(
                                          oneOffEngagementServiceFooter.finalVat,
                                          props.currencyID,
                                        )}
                                      </td>
                                    )}

                                  {/* FEES INCLUDING VAT */}
                                  {hasOneOffEngagementVAT &&
                                    props.visibleFieldsCustomTemp
                                      ?.feesIncVat && (
                                      <td className="tr-table-class font-14 text-white text-center">
                                        {props.formatValue(
                                          oneOffEngagementServiceFooter.finalFeesIncVat,
                                          props.currencyID,
                                        )}
                                      </td>
                                    )}

                                  {/* SERVICE SCOPE — ALWAYS LAST */}
                                  {props.visibleFieldsCustomTemp
                                    ?.serviceScope && (
                                    <td className="tr-table-class text-white"></td>
                                  )}
                                </tr>
                              )}
                            </tbody>
                          </table>
                          {/* <div
                        dangerouslySetInnerHTML={{
                          __html: currentPricingTableDesignRecurring,
                        }}
                      /> */}
                        </div>
                      )}
                    </>
                  )}

                  {/* Statement of facts - Service description customization */}

                  <div className="SOF-SD-Customization d-flex flex-column gap-2">
                    {props?.serviceDescriptionObj?.mainHeading !== null && (
                      <div className="service-description">
                        {props?.serviceDescriptionObj?.mainHeading !== null &&
                          props?.serviceDescriptionObj?.mainHeading !==
                            undefined &&
                          props?.serviceDescriptionObj?.mainHeading !== "" && (
                            <>
                              <div className="separator mb-2"></div>
                              <h6
                                style={{
                                  fontSize: `${props?.serviceDescriptionObj?.mainHeadingFontSize}px`,
                                  fontWeight: props?.serviceDescriptionObj
                                    ?.mainHeadingIsBold
                                    ? "bold"
                                    : "normal",
                                  fontStyle: props?.serviceDescriptionObj
                                    ?.mainHeadingIsItalic
                                    ? "italic"
                                    : undefined,
                                }}
                              >
                                {props?.serviceDescriptionObj?.mainHeading}
                              </h6>
                              <div className="separator mb-3"></div>
                            </>
                          )}
                        <Text_Editor
                          index={0}
                          handleContentChange={handleSDChange}
                          editorState={props.serviceDescriptionHTML}
                        />
                      </div>
                    )}

                    {props?.statementOfFactsObj?.mainHeading !== null && (
                      <div className="statement-of-facts">
                        {props?.statementOfFactsObj?.mainHeading !== null &&
                          props?.statementOfFactsObj?.mainHeading !==
                            undefined &&
                          props?.statementOfFactsObj?.mainHeading !== "" && (
                            <>
                              <div className="separator mb-2"></div>
                              <h6
                                style={{
                                  fontSize: `${props?.statementOfFactsObj?.mainHeadingFontSize}px`,
                                  fontWeight: props?.statementOfFactsObj
                                    ?.mainHeadingIsBold
                                    ? "bold"
                                    : "normal",
                                  fontStyle: props?.statementOfFactsObj
                                    ?.mainHeadingIsItalic
                                    ? "italic"
                                    : undefined,
                                }}
                              >
                                {props?.statementOfFactsObj?.mainHeading}
                              </h6>
                              <div className="separator mb-3"></div>
                            </>
                          )}
                        <Text_Editor
                          index={0}
                          handleContentChange={handleSOFChange}
                          editorState={props.statementOfFactsHTML}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="separator"></div>
      <div class="row fieldset">
        <div class="col-lg-12 hstack  gap-2 justify-content-end text-right mt-3">
          <div class="d-flex" style={{ overflowX: "auto" }}>
            <button
              class="btn btn-md btn-light mr-1"
              onClick={() => props.handleCancel()}
            >
              <span>{props.getCrudButtonTextName("Cancel")}</span>
            </button>
            <button
              onClick={() => props.HandleBack(3)}
              style={{ paddingTop: "5px", marginRight: "4px" }}
              className="btn btn-md btn-success create-item-btn"
            >
              <span>Back</span>
            </button>

            <button
              type="submit"
              class="btn btn-md btn-success create-item-btn"
              onClick={() => {
                // props.GetTemplateModalData(); // Call GetTemplateModalData function
                props.HandleTabChange(5); // Call HandleTabChange function as before
              }}
            >
              <span>Next</span>
            </button>
            <button
              type="submit"
              class="btn btn-md btn-success create-item-btn text-nowrap"
              onClick={() => props.HandleTabChange(5, statusID.Draft)}
              style={{ marginLeft: "5px" }}
            >
              <span>Save as a Draft</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
const ReviewPackagesComponent = (props) => {
  const modifiedFeesType = Utils.feeInProposal.map((option) =>
    option.value === 1 && props.disableCondition
      ? { ...option, isDisabled: true }
      : option,
  );
  const modifiedPaymentGatewayType = Utils.payment_gateway.map((option) => {
    const isGoCardlessTokenInvalid =
      props.paymentGatewayObj.goCardlessAccessToken === null ||
      props.paymentGatewayObj.goCardlessAccessToken === undefined ||
      props.paymentGatewayObj.goCardlessAccessToken === "";

    const isStripeKeysInvalid =
      (props.paymentGatewayObj.stripePublishableKey === null ||
        props.paymentGatewayObj.stripePublishableKey === undefined ||
        props.paymentGatewayObj.stripePublishableKey === "") &&
      (props.paymentGatewayObj.stripeSecretKey === null ||
        props.paymentGatewayObj.stripeSecretKey === undefined ||
        props.paymentGatewayObj.stripeSecretKey === "");
    const isBankTransferInvalid =
      (props.paymentGatewayObj.AccountNumber === null ||
        props.paymentGatewayObj.AccountNumber === undefined ||
        props.paymentGatewayObj.AccountNumber === "") &&
      (props.paymentGatewayObj.bankTransferName === null ||
        props.paymentGatewayObj.bankTransferName === undefined ||
        props.paymentGatewayObj.bankTransferName === "") &&
      (props.paymentGatewayObj.sortCode === null ||
        props.paymentGatewayObj.sortCode === undefined ||
        props.paymentGatewayObj.sortCode === "");
    if (option.value === 3 && isGoCardlessTokenInvalid) {
      return { ...option, isDisabled: true }; // Disable this option
    } else if (option.value === 2 && isStripeKeysInvalid) {
      return { ...option, isDisabled: true }; // Disable this option
    } else if (option.value === 4 && isBankTransferInvalid) {
      return { ...option, isDisabled: true }; // Disable this option
    } else {
      return option; // Keep this option as is
    }
  });
  const [RecurringPackageCalculation, setRecurringPackageCalculation] =
    useState({
      //Net Total :
      PackageOneNetTotal: null,
      PackageTwoNetTotal: null,
      PackageThreeNetTotal: null,

      //Net Total Add On Value :
      PackageOneNetTotalAddOnValue: 0,
      PackageTwoNetTotalAddOnValue: 0,
      PackageThreeNetTotalAddOnValue: 0,

      //Vat Total Amount :
      VatPercentage: null,
      PackageOneVatTotalAmount: null,
      PackageTwoVatTotalAmount: null,
      PackageThreeVatTotalAmount: null,

      //Discount :
      PackageOneDiscountAmount: null,
      PackageTwoDiscountAmount: null,
      PackageThreeDiscountAmount: null,

      //Discounted Total Amount :
      PackageOneDiscountedTotalAmount: null,
      PackageTwoDiscountedTotalAmount: null,
      PackageThreeDiscountedTotalAmount: null,

      //Grand Total Amount :
      PackageOneGrandTotalAmount: null,
      PackageTwoGrandTotalAmount: null,
      PackageThreeGrandTotalAmount: null,
    });

  const [OneOffPackageCalculation, setOneOffPackageCalculation] = useState({
    //Net Total :
    PackageOneNetTotal: null,
    PackageTwoNetTotal: null,
    PackageThreeNetTotal: null,

    //Net Total Add On Value :
    PackageOneNetTotalAddOnValue: 0,
    PackageTwoNetTotalAddOnValue: 0,
    PackageThreeNetTotalAddOnValue: 0,

    //Vat Total Amount :
    VatPercentage: null,
    PackageOneVatTotalAmount: null,
    PackageTwoVatTotalAmount: null,
    PackageThreeVatTotalAmount: null,

    //Discount :
    PackageOneDiscountAmount: null,
    PackageTwoDiscountAmount: null,
    PackageThreeDiscountAmount: null,

    //Discounted Total Amount :
    PackageOneDiscountedTotalAmount: null,
    PackageTwoDiscountedTotalAmount: null,
    PackageThreeDiscountedTotalAmount: null,

    //Grand Total Amount :
    PackageOneGrandTotalAmount: null,
    PackageTwoGrandTotalAmount: null,
    PackageThreeGrandTotalAmount: null,
  });
  const hasMounted = useRef(false);
  const [totalOnePackageValue, setTotalOnePackageValue] = useState(0);
  const [totalTwoPackageValue, setTotalTwoPackageValue] = useState(0);
  const [totalThreePackageValue, setTotalThreePackageValue] = useState(0);
  const [totalOnePackageValueOneOff, setTotalOnePackageValueOneOff] =
    useState(0);
  const [totalTwoPackageValueOneOff, setTotalTwoPackageValueOneOff] =
    useState(0);
  const [totalThreePackageValueOneOff, setTotalThreePackageValueOneOff] =
    useState(0);

  useEffect(() => {
    let SelectedService = [
      ...props.selectedRecurringServiceList,
      ...props.selectedOneOffServiceList,
    ];

    const contractAdditionalServicesInPackages = {
      selectedServicesList: SelectedService.flatMap((category) =>
        category.servicesList
          .filter((service) => service.isAdditionalService) // Filter additional services
          .map((service) => {
            return {
              serviceID: service.serviceID,
              serviceCatID: category.serviceCatID,
              serviceChargeTypeID:
                service.serviceChargeTypeName === "One Off" ? 2 : 1,
              servicePackageIDs: service.servicePackageIDs,
            };
          }),
      ),
    };
    props.setContractAdditionalServices(
      contractAdditionalServicesInPackages.selectedServicesList,
    );
  }, [props.selectedRecurringServiceList, props.selectedOneOffServiceList]);

  useEffect(() => {
    CalculateRecurringPackageNetTotal();
    CalculateOneOffPackageNetTotal();
  }, [props]);

  useEffect(() => {
    const htmlContent = generateCombinedServicesHTML();
    props.setServiceDescriptionHTML(htmlContent);
  }, []);

  useEffect(() => {
    const htmlContent = generateSOFHTML();
    props.setStatementOfFactsHTML(htmlContent);
  }, []);

  useEffect(() => {
    if (hasMounted.current) {
      const isRecurringDiscounted =
        Number(props.RecurringPricingInfo.DefaultDiscount) < 0;
      const isOneOffDiscounted =
        Number(props.OneOffPricingInfo.DefaultDiscount) < 0;

      if (isRecurringDiscounted || isOneOffDiscounted) {
        props.setDisableCondition(true);
        props.setEngagementObj({
          ...props.engagementObj,
          feeTypeId: 2,
          DiscountLines: false,
        });
      } else {
        props.setDisableCondition(false);
        props.setEngagementObj({
          ...props.engagementObj,
          feeTypeId: 1,
          DiscountLines: true,
        });
      }
    } else {
      hasMounted.current = true;
    }
  }, [
    props.RecurringPricingInfo.DefaultDiscount,
    props.OneOffPricingInfo.DefaultDiscount,
  ]);

  useEffect(() => {
    // Call the function when component mounts
    computeRecurringTotalPackageValues();

    // Call the function when component mounts
    computeOneOffTotalPackageValues();
  }, [props]);

  const computeRecurringTotalPackageValues = () => {
    let totalOne = 0;
    let totalTwo = 0;
    let totalThree = 0;

    props.selectedRecurringServiceList?.forEach((category) => {
      category.servicesList.forEach((service) => {
        // Check if the packageID is included in servicePackageIDs before adding
        if (
          service.servicePackageIDs.includes(service.packageOneID) &&
          service.packageOneValue !== null
        ) {
          // totalOne += Number(service.packageOneValue);
          let currentServicePriceWithToFixed = Number(
            service.originalPackageOneValue,
          )?.toFixed(2);
          totalOne = Number(
            Number(totalOne) + Number(currentServicePriceWithToFixed),
          )?.toFixed(2);
        }
        if (
          service.servicePackageIDs.includes(service.packageTwoID) &&
          service.packageTwoValue !== null
        ) {
          // totalTwo += Number(service.packageTwoValue);
          let currentServicePriceWithToFixed = Number(
            service.originalPackageTwoValue,
          )?.toFixed(2);
          totalTwo = Number(
            Number(totalTwo) + Number(currentServicePriceWithToFixed),
          )?.toFixed(2);
        }
        if (
          service.servicePackageIDs.includes(service.packageThreeID) &&
          service.packageThreeValue !== null
        ) {
          let currentServicePriceWithToFixed = Number(
            service.originalPackageThreeValue,
          )?.toFixed(2);
          totalThree = Number(
            Number(totalThree) + Number(currentServicePriceWithToFixed),
          )?.toFixed(2);
          //totalThree += Number(service.packageThreeValue);
        }
      });
    });
    props.setLastPaymentFrequencyAndDiscountedPriceForPreview({
      PaymentFrequencyID: 1,
      PackageOneNetValue: {
        totalOne: totalOne,
        servicePackageID: props.selectedPackagesDetails[0]?.servicePackageID,
      },
      PackageTwoNetValue: {
        totalTwo: totalTwo,
        servicePackageID: props.selectedPackagesDetails[1]?.servicePackageID,
      },
      PackageThreeNetValue: {
        totalThree: totalThree,
        servicePackageID: props.selectedPackagesDetails[2]?.servicePackageID,
      },
    });

    // Update state with the computed totals
    setTotalOnePackageValue(totalOne);
    setTotalTwoPackageValue(totalTwo);
    setTotalThreePackageValue(totalThree);
  };

  // Function to compute the sum of package values
  const computeOneOffTotalPackageValues = () => {
    let totalOne = 0;
    let totalTwo = 0;
    let totalThree = 0;

    props.selectedOneOffServiceList?.forEach((category) => {
      category.servicesList.forEach((service) => {
        // Check if the packageID is included in servicePackageIDs before adding
        if (
          service.servicePackageIDs.includes(service.packageOneID) &&
          service.packageOneValue !== null
        ) {
          totalOne += Number(service.packageOneValue);
        }
        if (
          service.servicePackageIDs.includes(service.packageTwoID) &&
          service.packageTwoValue !== null
        ) {
          totalTwo += Number(service.packageTwoValue);
        }
        if (
          service.servicePackageIDs.includes(service.packageThreeID) &&
          service.packageThreeValue !== null
        ) {
          totalThree += Number(service.packageThreeValue);
        }
      });
    });
    props.setLastPaymentFrequencyAndDiscountedPriceForPreviewForoneoff({
      PaymentFrequencyID: 1,
      PackageOneNetValue: totalOne,
      PackageTwoNetValue: totalTwo,
      PackageThreeNetValue: totalThree,
    });
    // Update state with the computed totals
    setTotalOnePackageValueOneOff(totalOne);
    setTotalTwoPackageValueOneOff(totalTwo);
    setTotalThreePackageValueOneOff(totalThree);
  };

  const handlePaymentFrequencyChange = (e) => {
    props.DisableTabOnChange();
    const updatedData = JSON.parse(
      JSON.stringify(props.selectedRecurringServiceListCopy),
    );

    // Calculate price based on payment frequency
    if (e.value === Payment_Frequency.Yearly) {
      props.setEngagementObj((prevState) => ({
        ...prevState,
        Payment_Frequency: e.value,
      }));

      updatedData.forEach((category) => {
        category.servicesList.forEach((service) => {
          // Perform the percentage calculation for each value
          service.price = Number(service.price);
          service.packageOneValue = Number(
            Number(service.originalPackageOneValue),
          ).toFixed(2);
          service.packageTwoValue = Number(
            Number(service.originalPackageTwoValue),
          ).toFixed(2);
          service.packageThreeValue = Number(
            Number(service.originalPackageThreeValue),
          ).toFixed(2);
          service.originalPackageOneValue = Number(
            service.originalPackageOneValue,
          );
          service.originalPackageTwoValue = Number(
            service.originalPackageTwoValue,
          );
          service.originalPackageThreeValue = Number(
            service.originalPackageThreeValue,
          );
        });
      });
    } else if (e.value === Payment_Frequency.HalfYearly) {
      props.setEngagementObj((prevState) => ({
        ...prevState,
        Payment_Frequency: e.value,
      }));

      updatedData.forEach((category) => {
        category.servicesList.forEach((service) => {
          // Perform the percentage calculation for each value
          service.price = Number(service.price) / 2;
          service.packageOneValue = Number(
            Number(service.originalPackageOneValue) / 2,
          ).toFixed(2);
          service.packageTwoValue = Number(
            Number(service.originalPackageTwoValue) / 2,
          ).toFixed(2);
          service.packageThreeValue = Number(
            Number(service.originalPackageThreeValue) / 2,
          ).toFixed(2);
          service.originalPackageOneValue =
            Number(service.originalPackageOneValue) / 2;
          service.originalPackageTwoValue =
            Number(service.originalPackageTwoValue) / 2;
          service.originalPackageThreeValue =
            Number(service.originalPackageThreeValue) / 2;
        });
      });
    } else if (e.value === Payment_Frequency.Quarterly) {
      props.setEngagementObj((prevState) => ({
        ...prevState,
        Payment_Frequency: e.value,
      }));

      updatedData.forEach((category) => {
        category.servicesList.forEach((service) => {
          // Perform the percentage calculation for each value
          service.price = Number(service.price) / 4;
          service.packageOneValue = Number(
            Number(service.originalPackageOneValue) / 4,
          ).toFixed(2);
          service.packageTwoValue = Number(
            Number(service.originalPackageTwoValue) / 4,
          ).toFixed(2);
          service.packageThreeValue = Number(
            Number(service.originalPackageThreeValue) / 4,
          ).toFixed(2);
          service.originalPackageOneValue =
            Number(service.originalPackageOneValue) / 4;
          service.originalPackageTwoValue =
            Number(service.originalPackageTwoValue) / 4;
          service.originalPackageThreeValue =
            Number(service.originalPackageThreeValue) / 4;
        });
      });
    } else if (e.value === Payment_Frequency.Monthly) {
      props.setEngagementObj((prevState) => ({
        ...prevState,
        Payment_Frequency: e.value,
      }));

      updatedData.forEach((category) => {
        category.servicesList.forEach((service) => {
          // Perform the percentage calculation for each value
          service.price = Number(service.price) / 12;
          service.packageOneValue = Number(
            Number(service.originalPackageOneValue) / 12,
          ).toFixed(2);
          service.packageTwoValue = Number(
            Number(service.originalPackageTwoValue) / 12,
          ).toFixed(2);
          service.packageThreeValue = Number(
            Number(service.originalPackageThreeValue) / 12,
          ).toFixed(2);
          service.originalPackageOneValue =
            Number(service.originalPackageOneValue) / 12;
          service.originalPackageTwoValue =
            Number(service.originalPackageTwoValue) / 12;
          service.originalPackageThreeValue =
            Number(service.originalPackageThreeValue) / 12;
        });
      });
    }

    props.setSelectedRecurringServiceList(updatedData);
  };
  //calculate Recurring Package Net Total
  const CalculateRecurringPackageNetTotal = () => {
    let packageOneNetTotalObj =
      GetNetTotalValueByRecurringPackage("packageOne");
    let packageTwoNetTotalObj =
      GetNetTotalValueByRecurringPackage("packageTwo");
    let packageThreeNetTotalObj =
      GetNetTotalValueByRecurringPackage("packageThree");

    const NetOneTotal =
      Number(packageOneNetTotalObj.netTotal) +
      Number(packageOneNetTotalObj.addOnValue);
    const NetTwoTotal =
      Number(packageTwoNetTotalObj.netTotal) +
      Number(packageTwoNetTotalObj.addOnValue);
    const NetThreeTotal =
      Number(packageThreeNetTotalObj.netTotal) +
      Number(packageThreeNetTotalObj.addOnValue);

    props.setRecurringPricingInfo({
      ...props.RecurringPricingInfo,
      packageOneNetTotal: NetOneTotal,
      packageTwoNetTotal: NetTwoTotal,
      packageThreeNetTotal: NetThreeTotal,
      packageOneDisCount: packageOneNetTotalObj.discountAmount,
      packageTwoDisCount: packageTwoNetTotalObj.discountAmount,
      packageThreeDisCount: packageThreeNetTotalObj.discountAmount,
      packageOneDisCountedTotal: packageOneNetTotalObj.discountedTotalAmount,
      packageTwoDisCountedTotal: packageTwoNetTotalObj.discountedTotalAmount,
      packageThreeDisCountedTotal:
        packageThreeNetTotalObj.discountedTotalAmount,
      PackageOneVaTPrice: packageOneNetTotalObj.vatTotalAmount,
      PackageTwoVaTPrice: packageTwoNetTotalObj.vatTotalAmount,
      PackageThreeVaTPrice: packageThreeNetTotalObj.vatTotalAmount,
      PackageOneGrandTotal: packageOneNetTotalObj.grandTotalAmount,
      PackageTwoGrandTotal: packageTwoNetTotalObj.grandTotalAmount,
      PackageThreeGrandTotal: packageThreeNetTotalObj.grandTotalAmount,
    });

    // setTotalOnePackageValue(NetOneTotal);
    // setTotalTwoPackageValue(NetTwoTotal);
    // setTotalThreePackageValue(NetThreeTotal);

    setRecurringPackageCalculation({
      ...RecurringPackageCalculation,
      //Package One :
      PackageOneNetTotal: packageOneNetTotalObj.netTotal,
      PackageOneNetTotalAddOnValue: packageOneNetTotalObj.addOnValue,
      VatPercentage: packageOneNetTotalObj.vatPercentage,
      PackageOneVatTotalAmount: packageOneNetTotalObj.vatTotalAmount,
      PackageOneDiscountAmount: packageOneNetTotalObj.discountAmount,
      PackageOneDiscountedTotalAmount:
        packageOneNetTotalObj.discountedTotalAmount,
      PackageOneGrandTotalAmount: packageOneNetTotalObj.grandTotalAmount,

      //PackageTwo :
      PackageTwoNetTotal: packageTwoNetTotalObj.netTotal,
      PackageTwoNetTotalAddOnValue: packageTwoNetTotalObj.addOnValue,
      VatPercentage: packageTwoNetTotalObj.vatPercentage,
      PackageTwoVatTotalAmount: packageTwoNetTotalObj.vatTotalAmount,
      PackageTwoDiscountAmount: packageTwoNetTotalObj.discountAmount,
      PackageTwoDiscountedTotalAmount:
        packageTwoNetTotalObj.discountedTotalAmount,
      PackageTwoGrandTotalAmount: packageTwoNetTotalObj.grandTotalAmount,

      //PackageThree :
      PackageThreeNetTotal: packageThreeNetTotalObj.netTotal,
      PackageThreeNetTotalAddOnValue: packageThreeNetTotalObj.addOnValue,
      VatPercentage: packageThreeNetTotalObj.vatPercentage,
      PackageThreeVatTotalAmount: packageThreeNetTotalObj.vatTotalAmount,
      PackageThreeDiscountAmount: packageThreeNetTotalObj.discountAmount,
      PackageThreeDiscountedTotalAmount:
        packageThreeNetTotalObj.discountedTotalAmount,
      PackageThreeGrandTotalAmount: packageThreeNetTotalObj.grandTotalAmount,
    }); //return packageOneNetTotal
  };
  //Get NetTotal value From Recurring Package
  const GetNetTotalValueByRecurringPackage = (packageName) => {
    let netTotal = 0;
    let addOnValue = 0;
    let vatPercentage = null;
    let vatTotalAmount = null;
    let discountAmount = 0;
    let discountedTotalAmount = null;
    let grandTotalAmount = null;
    let defaultDiscountPercentage = null;

    //props.selectedPackagesList

    //Calculate netTotal :

    props.selectedRecurringServiceList.forEach((category) => {
      category.servicesList.forEach((service) => {
        // Check if the service has any package IDs
        if (service.servicePackageIDs.length > 0) {
          // Check if the packageOneID is in servicePackageIDs and packageOneValue is not null
          if (
            packageName === "packageOne" &&
            service.servicePackageIDs.includes(service.packageOneID) &&
            service.originalPackageOneValue !== null
          ) {
            //netTotal += Number(service.originalPackageOneValue);

            let currentServicePriceWithToFixed = Number(
              service.originalPackageOneValue,
            )?.toFixed(2);
            netTotal = Number(
              Number(netTotal) + Number(currentServicePriceWithToFixed),
            )?.toFixed(2);

            defaultDiscountPercentage =
              props.RecurringFrequencyPricingInfo.DiscountPercentagePackageOne;
          }

          // Check if the packageTwoID is in servicePackageIDs and packageTwoValue is not null
          if (
            packageName === "packageTwo" &&
            service.servicePackageIDs.includes(service.packageTwoID) &&
            service.originalPackageTwoValue !== null
          ) {
            //netTotal += Number(service.originalPackageTwoValue);

            let currentServicePriceWithToFixed = Number(
              service.originalPackageTwoValue,
            )?.toFixed(2);
            netTotal = Number(
              Number(netTotal) + Number(currentServicePriceWithToFixed),
            )?.toFixed(2);

            defaultDiscountPercentage =
              props.RecurringFrequencyPricingInfo.DiscountPercentagePackageTwo;
          }

          // Check if the packageThreeID is in servicePackageIDs and packageThreeValue is not null
          if (
            packageName === "packageThree" &&
            service.servicePackageIDs.includes(service.packageThreeID) &&
            service.originalPackageThreeValue !== null
          ) {
            //netTotal += Number(service.originalPackageThreeValue);

            let currentServicePriceWithToFixed = Number(
              service.originalPackageThreeValue,
            )?.toFixed(2);
            netTotal = Number(
              Number(netTotal) + Number(currentServicePriceWithToFixed),
            )?.toFixed(2);

            defaultDiscountPercentage =
              props.RecurringFrequencyPricingInfo
                .DiscountPercentagePackageThree;
          }
        }
      });
    });

    // //Calculate : addOnValue,discountAmount
    //defaultDiscountPercentage = props.RecurringFrequencyPricingInfo.DefaultDiscount
    if (
      !isNaN(defaultDiscountPercentage) &&
      defaultDiscountPercentage !== undefined &&
      defaultDiscountPercentage !== null &&
      defaultDiscountPercentage !== ""
    ) {
      if (Number(defaultDiscountPercentage) === 0) {
        addOnValue = 0;
        discountAmount = 0;
        //discountedTotalAmount = null;//Number(netTotal);
      } else if (defaultDiscountPercentage < 0) {
        addOnValue =
          Number(netTotal) * (Math.abs(defaultDiscountPercentage) / 100);
      } else if (defaultDiscountPercentage > 0) {
        discountAmount =
          ((Number(netTotal) + Number(addOnValue)) *
            defaultDiscountPercentage) /
          100;
        discountAmount = Number(discountAmount)?.toFixed(2);
        //discountedTotalAmount = (Number(netTotal) + Number(addOnValue)) - discountAmount
      }
    }

    discountedTotalAmount =
      Number(netTotal) +
      Number(addOnValue) -
      (Math.floor(discountAmount * 100) / 100).toFixed(2);

    //Calculate : vatPercentage,vatTotalAmount
    if (
      !isNaN(props.vatPercentage) &&
      props.vatPercentage !== undefined &&
      props.vatPercentage !== null
    ) {
      if (props.vatPercentage > 0) {
        vatTotalAmount =
          (Number(discountedTotalAmount) * props.vatPercentage) / 100;
        vatTotalAmount =
          props.GetTwoDecimalValueWithoutRoundOff(vatTotalAmount);
      }
    }

    //Calculate : grandTotalAmount
    if (
      !isNaN(props.vatPercentage) &&
      props.vatPercentage !== undefined &&
      props.vatPercentage !== null
    ) {
      if (props.vatPercentage > 0) {
        grandTotalAmount = discountedTotalAmount + vatTotalAmount;
        grandTotalAmount = Number(grandTotalAmount)?.toFixed(2);
      }
    }

    return {
      netTotal: netTotal,
      addOnValue: addOnValue,
      vatPercentage: vatPercentage,
      vatTotalAmount: vatTotalAmount,
      discountAmount: discountAmount,
      discountedTotalAmount: discountedTotalAmount,
      grandTotalAmount: grandTotalAmount,
    };
  };
  //calculate One-Off Packages Net Total
  const CalculateOneOffPackageNetTotal = () => {
    let packageOneNetTotalObj = GetNetTotalValueByOneOffPackage("packageOne");
    let packageTwoNetTotalObj = GetNetTotalValueByOneOffPackage("packageTwo");
    let packageThreeNetTotalObj =
      GetNetTotalValueByOneOffPackage("packageThree");

    const NetOneTotal =
      Number(packageOneNetTotalObj.netTotal) +
      Number(packageOneNetTotalObj.addOnValue);
    const NetTwoTotal =
      Number(packageTwoNetTotalObj.netTotal) +
      Number(packageTwoNetTotalObj.addOnValue);
    const NetThreeTotal =
      Number(packageThreeNetTotalObj.netTotal) +
      Number(packageThreeNetTotalObj.addOnValue);

    props.setOneOffPricingInfo({
      ...props.OneOffPricingInfo,
      packageOneNetTotal: NetOneTotal,
      packageTwoNetTotal: NetTwoTotal,
      packageThreeNetTotal: NetThreeTotal,
      packageOneDisCount: packageOneNetTotalObj.discountAmount,
      packageTwoDisCount: packageTwoNetTotalObj.discountAmount,
      packageThreeDisCount: packageThreeNetTotalObj.discountAmount,
      packageOneDisCountedTotal: packageOneNetTotalObj.discountedTotalAmount,
      packageTwoDisCountedTotal: packageTwoNetTotalObj.discountedTotalAmount,
      packageThreeDisCountedTotal:
        packageThreeNetTotalObj.discountedTotalAmount,
      PackageOneVaTPrice: packageOneNetTotalObj.vatTotalAmount,
      PackageTwoVaTPrice: packageTwoNetTotalObj.vatTotalAmount,
      PackageThreeVaTPrice: packageThreeNetTotalObj.vatTotalAmount,
      PackageOneGrandTotal: packageOneNetTotalObj.grandTotalAmount,
      PackageTwoGrandTotal: packageTwoNetTotalObj.grandTotalAmount,
      PackageThreeGrandTotal: packageThreeNetTotalObj.grandTotalAmount,
    });

    // setTotalOnePackageValue(NetOneTotal);
    // setTotalTwoPackageValue(NetTwoTotal);
    // setTotalThreePackageValue(NetThreeTotal);

    setOneOffPackageCalculation({
      ...OneOffPackageCalculation,
      //Package One :
      PackageOneNetTotal: packageOneNetTotalObj.netTotal,
      PackageOneNetTotalAddOnValue: packageOneNetTotalObj.addOnValue,
      VatPercentage: packageOneNetTotalObj.vatPercentage,
      PackageOneVatTotalAmount: packageOneNetTotalObj.vatTotalAmount,
      PackageOneDiscountAmount: packageOneNetTotalObj.discountAmount,
      PackageOneDiscountedTotalAmount:
        packageOneNetTotalObj.discountedTotalAmount,
      PackageOneGrandTotalAmount: packageOneNetTotalObj.grandTotalAmount,

      //PackageTwo :
      PackageTwoNetTotal: packageTwoNetTotalObj.netTotal,
      PackageTwoNetTotalAddOnValue: packageTwoNetTotalObj.addOnValue,
      VatPercentage: packageTwoNetTotalObj.vatPercentage,
      PackageTwoVatTotalAmount: packageTwoNetTotalObj.vatTotalAmount,
      PackageTwoDiscountAmount: packageTwoNetTotalObj.discountAmount,
      PackageTwoDiscountedTotalAmount:
        packageTwoNetTotalObj.discountedTotalAmount,
      PackageTwoGrandTotalAmount: packageTwoNetTotalObj.grandTotalAmount,

      //PackageThree :
      PackageThreeNetTotal: packageThreeNetTotalObj.netTotal,
      PackageThreeNetTotalAddOnValue: packageThreeNetTotalObj.addOnValue,
      VatPercentage: packageThreeNetTotalObj.vatPercentage,
      PackageThreeVatTotalAmount: packageThreeNetTotalObj.vatTotalAmount,
      PackageThreeDiscountAmount: packageThreeNetTotalObj.discountAmount,
      PackageThreeDiscountedTotalAmount:
        packageThreeNetTotalObj.discountedTotalAmount,
      PackageThreeGrandTotalAmount: packageThreeNetTotalObj.grandTotalAmount,
    }); //return packageOneNetTotal
  };
  //Get Net Total Value From One-Off Package
  const GetNetTotalValueByOneOffPackage = (packageName) => {
    let netTotal = 0;
    let addOnValue = 0;
    let vatPercentage = null;
    let vatTotalAmount = null;
    let discountAmount = 0;
    let discountedTotalAmount = null;
    let grandTotalAmount = null;
    let defaultDiscountPercentage = null;

    props.selectedOneOffServiceList.forEach((category) => {
      category.servicesList.forEach((service) => {
        // Check if the service has any package IDs
        if (service.servicePackageIDs.length > 0) {
          // Check if the packageOneID is in servicePackageIDs and packageOneValue is not null
          if (
            packageName === "packageOne" &&
            service.servicePackageIDs.includes(service.packageOneID) &&
            service.originalPackageOneValue !== null
          ) {
            //netTotal += Number(service.originalPackageOneValue);

            let currentServicePriceWithToFixed = Number(
              service.originalPackageOneValue,
            )?.toFixed(2);
            netTotal = Number(
              Number(netTotal) + Number(currentServicePriceWithToFixed),
            )?.toFixed(2);

            defaultDiscountPercentage =
              props.OneOffPricingInfoCopy.DiscountPercentagePackageOne;
          }

          // Check if the packageTwoID is in servicePackageIDs and packageTwoValue is not null
          if (
            packageName === "packageTwo" &&
            service.servicePackageIDs.includes(service.packageTwoID) &&
            service.originalPackageTwoValue !== null
          ) {
            //netTotal += Number(service.originalPackageTwoValue);

            let currentServicePriceWithToFixed = Number(
              service.originalPackageTwoValue,
            )?.toFixed(2);
            netTotal = Number(
              Number(netTotal) + Number(currentServicePriceWithToFixed),
            )?.toFixed(2);

            defaultDiscountPercentage =
              props.OneOffPricingInfoCopy.DiscountPercentagePackageTwo;
          }

          // Check if the packageThreeID is in servicePackageIDs and packageThreeValue is not null
          if (
            packageName === "packageThree" &&
            service.servicePackageIDs.includes(service.packageThreeID) &&
            service.originalPackageThreeValue !== null
          ) {
            //netTotal += Number(service.originalPackageThreeValue);

            let currentServicePriceWithToFixed = Number(
              service.originalPackageThreeValue,
            )?.toFixed(2);
            netTotal = Number(
              Number(netTotal) + Number(currentServicePriceWithToFixed),
            )?.toFixed(2);

            defaultDiscountPercentage =
              props.OneOffPricingInfoCopy.DiscountPercentagePackageThree;
          }
        }
      });
    });
    // //Calculate : addOnValue,discountAmount,discountedTotalAmount
    if (
      !isNaN(defaultDiscountPercentage) &&
      defaultDiscountPercentage !== undefined &&
      defaultDiscountPercentage !== null &&
      defaultDiscountPercentage !== ""
    ) {
      if (Number(defaultDiscountPercentage) === 0) {
        addOnValue = 0;
        discountAmount = 0;
        //discountedTotalAmount = Number(netTotal);
      } else if (defaultDiscountPercentage < 0) {
        addOnValue =
          Number(netTotal) * (Math.abs(defaultDiscountPercentage) / 100);
      } else if (defaultDiscountPercentage > 0) {
        discountAmount =
          ((Number(netTotal) + Number(addOnValue)) *
            defaultDiscountPercentage) /
          100;
        discountAmount = Number(discountAmount)?.toFixed(2);
        //discountedTotalAmount = (Number(netTotal) + Number(addOnValue)) - discountAmount
      }
    }

    discountedTotalAmount =
      Number(netTotal) +
      Number(addOnValue) -
      (Math.floor(discountAmount * 100) / 100).toFixed(2);

    //Calculate : vatPercentage,vatTotalAmount
    if (
      !isNaN(props.vatPercentage) &&
      props.vatPercentage !== undefined &&
      props.vatPercentage !== null
    ) {
      if (props.vatPercentage > 0) {
        vatTotalAmount =
          (Number(discountedTotalAmount) * props.vatPercentage) / 100;
        vatTotalAmount =
          props.GetTwoDecimalValueWithoutRoundOff(vatTotalAmount);
      }
    }

    //Calculate : grandTotalAmount
    if (
      !isNaN(props.vatPercentage) &&
      props.vatPercentage !== undefined &&
      props.vatPercentage !== null
    ) {
      if (props.vatPercentage > 0) {
        grandTotalAmount = discountedTotalAmount + vatTotalAmount;
        grandTotalAmount = Number(grandTotalAmount)?.toFixed(2);
      }
    }

    return {
      netTotal: netTotal,
      addOnValue: addOnValue,
      vatPercentage: vatPercentage,
      vatTotalAmount: vatTotalAmount,
      discountAmount: discountAmount,
      discountedTotalAmount: discountedTotalAmount,
      grandTotalAmount: grandTotalAmount,
    };
  };

  const checkAllPackageDiscountPercentageValidation = (
    discountPercentage,
    CurrentValue,
  ) => {
    // Allow only numeric, dot, and negative sign characters and limit to 8 characters
    let sanitizedInput = discountPercentage
      .replace(/[^0-9.-]/g, "")
      .slice(0, 8);

    // Ensure the input is properly formatted with a hyphen if necessary
    sanitizedInput = props.hasHyphenAfterNumber(sanitizedInput);

    // Split the input into integer and decimal parts
    const [integerPart, decimalPart] = sanitizedInput.split(".");

    // Combine integer and decimal parts with appropriate precision
    let formattedInput;

    // Check if the input is within the valid range
    if (
      sanitizedInput === "-" ||
      (parseFloat(sanitizedInput) >= -999.0 &&
        parseFloat(sanitizedInput) <= 100)
    ) {
      if (decimalPart !== undefined) {
        if (integerPart.includes("-")) {
          // For negative values, ensure 4 digits after the negative sign
          formattedInput = `-${integerPart.slice(1, 4)}.${decimalPart.slice(
            0,
            2,
          )}`;
        } else {
          // For positive values, limit to 4 digits before the decimal point
          formattedInput = `${integerPart.slice(0, 3)}.${decimalPart.slice(
            0,
            2,
          )}`;
        }
      } else {
        // No decimal part, limit to 4 digits
        formattedInput = integerPart.includes("-")
          ? `-${integerPart.slice(1, 4)}`
          : `${integerPart.slice(0, 3)}`;
      }
      return formattedInput === undefined
        ? sanitizedInput === ""
          ? ""
          : CurrentValue
        : formattedInput;
    }
    return formattedInput === undefined
      ? sanitizedInput === ""
        ? ""
        : CurrentValue
      : formattedInput;
  };

  const handleOneOffPackageOneDiscountPercentage = (e) => {
    let InputValue = checkAllPackageDiscountPercentageValidation(
      e.target.value,
      props.OneOffPricingInfoCopy.DiscountPercentagePackageOne,
    );
    // InputValue = InputValue.replace(
    //   /-/g,
    //   (match, index) => (index === 0 ? match : "")
    // )
    let DefaultDiscount = props.GetSingleDefaultDiscountPercentageOfPackages(
      InputValue,
      props.OneOffPricingInfoCopy.DiscountPercentagePackageTwo,
      props.OneOffPricingInfoCopy.DiscountPercentagePackageThree,
    );

    props.setOneOffPricingInfo({
      ...props.OneOffPricingInfo,
      DiscountPercentagePackageOne: InputValue,
      DefaultDiscount: DefaultDiscount,
    });
    props.setOneOffPricingInfoCopy({
      ...props.OneOffPricingInfoCopy,
      DiscountPercentagePackageOne: InputValue,
      DefaultDiscount: DefaultDiscount,
    });
  };

  const handleOneOffPackageTwoDiscountPercentage = (e) => {
    let InputValue = checkAllPackageDiscountPercentageValidation(
      e.target.value,
      props.OneOffPricingInfoCopy.DiscountPercentagePackageTwo,
    );
    // InputValue = InputValue.replace(
    //   /-/g,
    //   (match, index) => (index === 0 ? match : "")
    // )
    let DefaultDiscount = props.GetSingleDefaultDiscountPercentageOfPackages(
      props.OneOffPricingInfoCopy.DiscountPercentagePackageOne,
      InputValue,
      props.OneOffPricingInfoCopy.DiscountPercentagePackageThree,
    );

    props.setOneOffPricingInfo({
      ...props.OneOffPricingInfo,
      DiscountPercentagePackageTwo: InputValue,
      DefaultDiscount: DefaultDiscount,
    });
    props.setOneOffPricingInfoCopy({
      ...props.OneOffPricingInfoCopy,
      DiscountPercentagePackageTwo: InputValue,
      DefaultDiscount: DefaultDiscount,
    });
  };

  const handleOneOffPackageThreeDiscountPercentage = (e) => {
    let InputValue = checkAllPackageDiscountPercentageValidation(
      e.target.value,
      props.OneOffPricingInfoCopy.DiscountPercentagePackageThree,
    );
    // InputValue = InputValue.replace(
    //   /-/g,
    //   (match, index) => (index === 0 ? match : "")
    // )
    let DefaultDiscount = props.GetSingleDefaultDiscountPercentageOfPackages(
      props.OneOffPricingInfoCopy.DiscountPercentagePackageOne,
      props.OneOffPricingInfoCopy.DiscountPercentagePackageTwo,
      InputValue,
    );

    props.setOneOffPricingInfo({
      ...props.OneOffPricingInfo,
      DiscountPercentagePackageThree: InputValue,
      DefaultDiscount: DefaultDiscount,
    });
    props.setOneOffPricingInfoCopy({
      ...props.OneOffPricingInfoCopy,
      DiscountPercentagePackageThree: InputValue,
      DefaultDiscount: DefaultDiscount,
    });
  };

  const handlePackageOneDiscountPercentage = (e) => {
    let InputValue = checkAllPackageDiscountPercentageValidation(
      e.target.value,
      props.RecurringPricingInfo.DiscountPercentagePackageOne,
    );

    // InputValue = InputValue.replace(
    //   /-/g,
    //   (match, index) => (index === 0 ? match : "")
    // )
    let DefaultDiscount = props.GetSingleDefaultDiscountPercentageOfPackages(
      InputValue,
      props.RecurringPricingInfo.DiscountPercentagePackageTwo,
      props.RecurringPricingInfo.DiscountPercentagePackageThree,
    );

    props.setRecurringPricingInfo({
      ...props.RecurringPricingInfo,
      DiscountPercentagePackageOne: InputValue,
      DefaultDiscount: DefaultDiscount,
    });
    props.setRecurringFrequencyPricingInfo({
      ...props.RecurringFrequencyPricingInfo,
      DiscountPercentagePackageOne: InputValue,
      DefaultDiscount: DefaultDiscount,
    });
  };

  const handlePackageTwoDiscountPercentage = (e) => {
    let InputValue = checkAllPackageDiscountPercentageValidation(
      e.target.value,
      props.RecurringPricingInfo.DiscountPercentagePackageTwo,
    );
    // InputValue = InputValue.replace(
    //   /-/g,
    //   (match, index) => (index === 0 ? match : "")
    // )
    let DefaultDiscount = props.GetSingleDefaultDiscountPercentageOfPackages(
      props.RecurringPricingInfo.DiscountPercentagePackageOne,
      InputValue,
      props.RecurringPricingInfo.DiscountPercentagePackageThree,
    );

    props.setRecurringPricingInfo({
      ...props.RecurringPricingInfo,
      DiscountPercentagePackageTwo: InputValue,
      DefaultDiscount: DefaultDiscount,
    });
    props.setRecurringFrequencyPricingInfo({
      ...props.RecurringFrequencyPricingInfo,
      DiscountPercentagePackageTwo: InputValue,
      DefaultDiscount: DefaultDiscount,
    });
  };

  const handlePackageThreeDiscountPercentage = (e) => {
    let InputValue = checkAllPackageDiscountPercentageValidation(
      e.target.value,
      props.RecurringPricingInfo.DiscountPercentagePackageThree,
    );
    // InputValue = InputValue.replace(
    //   /-/g,
    //   (match, index) => (index === 0 ? match : "")
    // )

    let DefaultDiscount = props.GetSingleDefaultDiscountPercentageOfPackages(
      props.RecurringPricingInfo.DiscountPercentagePackageOne,
      props.RecurringPricingInfo.DiscountPercentagePackageTwo,
      InputValue,
    );

    props.setRecurringPricingInfo({
      ...props.RecurringPricingInfo,
      DiscountPercentagePackageThree: InputValue,
      DefaultDiscount: DefaultDiscount,
    });
    props.setRecurringFrequencyPricingInfo({
      ...props.RecurringFrequencyPricingInfo,
      DiscountPercentagePackageThree: InputValue,
      DefaultDiscount: DefaultDiscount,
    });
  };

  const handleCheckboxChange = (e) => {
    props.DisableTabOnChange();
    const newValue = e.target.checked ? true : null; // Set to 1 if checked, null otherwise
    props.setEngagementObj((prevProposalObject) => ({
      ...prevProposalObject,
      DiscountLines: newValue,
    }));
  };

  const handleChangeFeesType = (e) => {
    const {
      RecurringPricingInfo,
      OneOffPricingInfo,
      setEngagementObj,
      engagementObj,
    } = props;

    const isRecurringDiscounted =
      Number(RecurringPricingInfo.DefaultDiscount) <= 0;
    const isOneOffDiscounted = Number(OneOffPricingInfo.DefaultDiscount) <= 0;

    const updatedProposalObj = {
      ...engagementObj,
      feeTypeId: e.value,
    };

    if (e.value == 2 && isRecurringDiscounted && isOneOffDiscounted) {
      updatedProposalObj.DiscountLines = false;
    } else {
      updatedProposalObj.DiscountLines = true;
    }

    setEngagementObj(updatedProposalObj);
  };
  const packageCount = props.selectedPackagesList.length;
  const PaymentGatewayValue = Utils.payment_gateway.find(
    (item) => props.engagementObj.paymentGatewayID == item.value,
  );
  const selectedFrequency = Utils.Payment_Frequency.find(
    (item) => props.engagementObj.Payment_Frequency == item.value,
  );

  const feeTypeValue = modifiedFeesType.find(
    (item) => props.engagementObj.feeTypeId == item.value,
  );

  const generateCombinedServicesHTML = () => {
    const fontFamily = "Arial, sans-serif";
    const fontSizeHeading = "18px";
    const recurringHeadingFontSize = props?.serviceDescriptionObj
      ?.recurringOnGoingHeadingFontSize
      ? `${props?.serviceDescriptionObj?.recurringOnGoingHeadingFontSize}px`
      : "18px";
    const oneOffHeadingFontSize = props?.serviceDescriptionObj
      ?.oneOffAdhocFontSize
      ? `${props?.serviceDescriptionObj?.oneOffAdhocFontSize}px`
      : "18px";
    const fontSizeContent = "14px";
    const newColorCode = "#b4aba6";

    return `
  <div style="padding-left: 40px; padding-right: 40px;">
    ${
      props?.selectedRecurringServiceList?.length
        ? props?.serviceDescriptionObj?.recurringOnGoingHeading !== null &&
          props?.serviceDescriptionObj?.recurringOnGoingHeading !== undefined &&
          props?.serviceDescriptionObj?.recurringOnGoingHeading !== ""
          ? `<p style="font-family:${fontFamily}; font-size: ${recurringHeadingFontSize}; color: ${newColorCode}; font-weight: ${
              props?.serviceDescriptionObj?.recurringOnGoingHeadingIsBold
                ? "bold"
                : "normal"
            }; font-style: ${
              props?.serviceDescriptionObj?.recurringOnGoingHeadingIsItalic
                ? "italic"
                : undefined
            };">
             ${props?.serviceDescriptionObj?.recurringOnGoingHeading}
           </p>`
          : ""
        : ""
    }

    ${props?.selectedRecurringServiceList
      ?.map(
        (serviceCat) => `
        <div>
          <p style="color: black; font-weight: bold; font-family:${fontFamily}; font-size: ${fontSizeHeading};">
            ${serviceCat.serviceCatName}
          </p>
          <hr style="color: gray; margin-top: -15px;" />
          ${serviceCat.servicesList
            .map(
              (subService) => `
                <p style="color: black; font-family:${fontFamily}; font-size: ${fontSizeContent};">
                  ${subService.serviceName}
                </p>
                <p style="color: black; font-family:${fontFamily}; font-size: ${fontSizeContent};">
                  ${
                    subService.serviceDescription?.trim()
                      ? subService.serviceDescription
                      : ""
                  }
                </p>
              `,
            )
            .join("")}
        </div>
      `,
      )
      .join("")}

    ${
      props?.selectedOneOffServiceList?.length
        ? props?.serviceDescriptionObj?.oneOffAdhocHeading !== null &&
          props?.serviceDescriptionObj?.oneOffAdhocHeading !== undefined &&
          props?.serviceDescriptionObj?.oneOffAdhocHeading !== ""
          ? `<p style="font-family:${fontFamily}; font-size: ${oneOffHeadingFontSize}; color: ${newColorCode}; font-weight: ${
              props?.serviceDescriptionObj?.oneOffAdhocHeadingIsBold
                ? "bold"
                : "normal"
            }; font-style: ${
              props?.serviceDescriptionObj?.oneOffAdhocHeadingIsItalic
                ? "italic"
                : undefined
            };">
             ${props?.serviceDescriptionObj?.oneOffAdhocHeading}
           </p>`
          : ""
        : ""
    }

    ${props?.selectedOneOffServiceList
      ?.map(
        (serviceCat) => `
        <div>
          <p style="color: black; font-weight: bold; font-family:${fontFamily}; font-size: ${fontSizeHeading};">
            ${serviceCat.serviceCatName}
          </p>
          <hr style="color: gray; margin-top: -15px;" />
          ${serviceCat.servicesList
            .map(
              (subService) => `
                <p style="color: black; font-family:${fontFamily}; font-size: ${fontSizeContent};">
                  ${subService.serviceName}
                </p>
                <p style="color: black; font-family:${fontFamily}; font-size: ${fontSizeContent};">
                  ${
                    subService.serviceDescription?.trim()
                      ? subService.serviceDescription
                      : ""
                  }
                </p>
              `,
            )
            .join("")}
        </div>
      `,
      )
      .join("")}
  </div>
  `;
  };

  function generateSOFHTML() {
    const fontFamily = "Arial, sans-serif";
    const fontSizeHeading = "18px";
    const fontSizeContent = "14px";
    const newColorCode = "#b4aba6";

    const formatCurrency = props.formatValueWithoutCurrencySymbol;

    if (
      props.moduleName === "Quote" &&
      props?.engagementObj?.quoteTypeID === 2
    ) {
      return props.StatementOfFact.map(
        (SelectedPackage) => `
      <div style="padding-left: 40px; padding-right: 40px; font-family:${fontFamily};">
        <p style="color: ${newColorCode}; font-size: ${fontSizeHeading}; font-weight: bold;">
          Package Name: ${SelectedPackage.servicePackageName}
        </p>
        <hr style="color: gray; margin-top: -15px;">
        
        ${
          SelectedPackage.reccuring.length
            ? `<p style="font-size: ${fontSizeHeading}; color: ${newColorCode}; font-weight: bold;">Ongoing/Recurring Services</p>`
            : ""
        }

        ${SelectedPackage.reccuring
          .map(
            (cat) => `
          <p style="color: black; font-size: ${fontSizeHeading}; font-weight: bold;">${
            cat.serviceCategoryName
          }</p>
          ${cat.servicesList
            .map(
              (srv) => `
            <p style="color: black; font-size: ${fontSizeContent};">${
              srv.serviceName
            }</p>
            ${(srv?.gpdList || [])
              ?.filter((d) => d.driverTypeID !== 1)
              .map(
                (d) => `
                <li style="color: black; font-size: ${fontSizeContent}; margin-top:5px;">
                  ${d.driverName}: <strong>${
                    d.driverTypeID === 2
                      ? formatCurrency(d.value)
                      : d.driverTypeID === 3
                        ? d.variationName
                        : d.driverTypeID === 4
                          ? d.slabTypeID === 2
                            ? formatCurrency(d.value)
                            : `${d.slabFrom}-${d.slabTo}`
                          : d.driverTypeID === 5
                            ? d.enteredText
                            : d.driverTypeID === 6
                              ? d.enteredDate
                              : ""
                  }</strong>
                </li>
              `,
              )
              .join("")}
          `,
            )
            .join("")}
        `,
          )
          .join("")}

        ${
          SelectedPackage.oneOff.length
            ? `<p style="font-size: ${fontSizeHeading}; color: ${newColorCode}; font-weight: bold;">One-Off/Ad hoc Services</p>`
            : ""
        }

        ${SelectedPackage.oneOff
          .map(
            (cat) => `
          <p style="color: black; font-size: ${fontSizeHeading}; font-weight: bold;">${
            cat.serviceCategoryName
          }</p>
          ${cat.servicesList
            .map(
              (srv) => `
            <p style="color: black; font-size: ${fontSizeContent};">${
              srv.serviceName
            }</p>
            ${(srv?.gpdList || [])
              ?.filter((d) => d.driverTypeID !== 1)
              .map(
                (d) => `
                <li style="color: black; font-size: ${fontSizeContent}; margin-top:5px;">
                  ${d.driverName}: <strong>${
                    d.driverTypeID === 2
                      ? formatCurrency(d.value)
                      : d.driverTypeID === 3
                        ? d.variationName
                        : d.driverTypeID === 4
                          ? d.slabTypeID === 2
                            ? formatCurrency(d.value)
                            : `${d.slabFrom}-${d.slabTo}`
                          : d.driverTypeID === 5
                            ? d.enteredText
                            : d.driverTypeID === 6
                              ? d.enteredDate
                              : ""
                  }</strong>
                </li>
              `,
              )
              .join("")}
          `,
            )
            .join("")}
        `,
          )
          .join("")}

        ${
          SelectedPackage.additionalInformationList?.length
            ? `<p style="color: ${newColorCode}; font-size: ${fontSizeHeading}; font-weight: bold;">Additional Information</p>
             <hr style="color: gray; margin-top: -15px;" />
             ${SelectedPackage.additionalInformationList
               ?.filter((d) => d.driverTypeID !== 1)
               .map(
                 (d) => `
                 <p style="font-size: ${fontSizeContent}; color: black;">
                   ${d.driverName}: <strong>${
                     d.driverTypeID === 2
                       ? formatCurrency(d.value)
                       : d.driverTypeID === 3
                         ? d.variationName
                         : d.driverTypeID === 4
                           ? d.slabTypeID === 2
                             ? formatCurrency(d.value)
                             : `${formatCurrency(d.slabFrom)}-${formatCurrency(
                                 d.slabTo,
                               )}`
                           : d.driverTypeID === 5
                             ? d.enteredText
                             : d.driverTypeID === 6
                               ? d.enteredDate
                               : ""
                   }</strong>
                 </p>
               `,
               )
               .join("")}`
            : ""
        }
      </div>
    `,
      ).join(" ");
    } else {
      return `
      <div style="padding-left: 40px; padding-right: 40px; font-family:${fontFamily};">
        ${
          props?.selectedRecurringServiceList?.length
            ? `<p style="font-size: ${fontSizeHeading}; color: ${newColorCode}; font-weight: bold;">Ongoing/Recurring Services</p>`
            : ""
        }

        ${props?.selectedRecurringServiceList
          ?.map(
            (cat) => `
          <div>
            <p style="color: black; font-size: ${fontSizeHeading}; font-weight: bold;">${
              cat.serviceCatName
            }</p>
            <hr style="color: gray; margin-top: -15px;">
            ${cat.servicesList
              .map(
                (srv) => `
              <p style="color: black; font-size: ${fontSizeContent};">${
                srv.serviceName
              }</p>
              ${(srv.pricingDriverList || srv.gpdList || [])
                ?.filter((d) =>
                  srv.pricingDriverList ? d.driverVisibility : true,
                )
                ?.filter((d) => d.driverTypeID !== 1)
                .map(
                  (d) => `
                  <li style="color: black; font-size: ${fontSizeContent}; margin-top:5px;">
                    ${d.driverName}: <strong>${
                      d.driverTypeID === 2
                        ? formatCurrency(d.driverValue)
                        : d.driverTypeID === 3
                          ? srv.pricingDriverList
                            ? d.variation.find((v) => v.isDefault)
                                ?.variationName
                            : d.variationName
                          : d.driverTypeID === 4
                            ? srv.pricingDriverList
                              ? (() => {
                                  const slab = d.slab.find((s) => s.isDefault);
                                  return slab.slabTypeID === 2
                                    ? formatCurrency(slab.slabValue)
                                    : `${formatCurrency(
                                        slab.slabFrom,
                                      )}-${formatCurrency(slab.slabTo)}`;
                                })()
                              : d.slabTypeID === 2
                                ? formatCurrency(d.driverValue)
                                : `${formatCurrency(d.slabFrom)}-${formatCurrency(
                                    d.slabTo,
                                  )}`
                            : d.driverTypeID === 5
                              ? d.enteredText
                              : d.driverTypeID === 6
                                ? d.enteredDate
                                : ""
                    }</strong>
                  </li>
                `,
                )
                .join("")}
            `,
              )
              .join("")}
          </div>
        `,
          )
          .join("")}

        ${
          props?.selectedOneOffServiceList?.length
            ? `<p style="font-size: ${fontSizeHeading}; color: ${newColorCode}; font-weight: bold;">One-Off/Ad hoc Services</p>`
            : ""
        }

        ${props?.selectedOneOffServiceList
          ?.map(
            (cat) => `
          <div>
            <p style="color: black; font-size: ${fontSizeHeading}; font-weight: bold;">${
              cat.serviceCatName
            }</p>
            <hr style="color: gray; margin-top: -15px;">
            ${cat.servicesList
              .map(
                (srv) => `
              <p style="color: black; font-size: ${fontSizeContent};">${
                srv.serviceName
              }</p>
              ${(srv.pricingDriverList || srv.gpdList || [])
                ?.filter((d) =>
                  srv.pricingDriverList ? d.driverVisibility : true,
                )
                ?.filter((d) => d.driverTypeID !== 1)
                .map(
                  (d) => `
                  <li style="color: black; font-size: ${fontSizeContent}; margin-top:5px;">
                    ${d.driverName}: <strong>${
                      d.driverTypeID === 2
                        ? formatCurrency(d.driverValue)
                        : d.driverTypeID === 3
                          ? srv.pricingDriverList
                            ? d.variation.find((v) => v.isDefault)
                                ?.variationName
                            : d.variationName
                          : d.driverTypeID === 4
                            ? srv.pricingDriverList
                              ? (() => {
                                  const slab = d.slab.find((s) => s.isDefault);
                                  return slab.slabTypeID === 2
                                    ? formatCurrency(slab.slabValue)
                                    : `${formatCurrency(
                                        slab.slabFrom,
                                      )}-${formatCurrency(slab.slabTo)}`;
                                })()
                              : d.slabTypeID === 2
                                ? formatCurrency(d.driverValue)
                                : `${formatCurrency(d.slabFrom)}-${formatCurrency(
                                    d.slabTo,
                                  )}`
                            : d.driverTypeID === 5
                              ? d.enteredText
                              : d.driverTypeID === 6
                                ? d.enteredDate
                                : ""
                    }</strong>
                  </li>
                `,
                )
                .join("")}
            `,
              )
              .join("")}
          </div>
        `,
          )
          .join("")}

        ${
          props?.additionalInformationList?.filter((d) => d.driverTypeID !== 1)
            .length
            ? `<p style="font-size: ${fontSizeHeading}; color: ${newColorCode}; font-weight: bold;">Additional Information</p>
             <hr style="color: gray; margin-top: -15px;" />
             ${props.additionalInformationList
               .map((d) => {
                 if (
                   d.driverTypeID === 2 &&
                   d.variation === null &&
                   d.slab === null
                 ) {
                   return `<p style="color: black; font-size: ${fontSizeContent};">${
                     d.driverName
                   }: <strong>${formatCurrency(d.driverValue)}</strong></p>`;
                 }
                 //  else {

                 // Type 5 – Text
                 if (d.driverTypeID === 5) {
                   return `<p style="color:black;font-size:${fontSizeContent};">
      ${d.driverName}: <strong>${d.enteredText}</strong>
    </p>`;
                 }

                 // Type 6 – Date
                 if (d.driverTypeID === 6) {
                   return `<p style="color:black;font-size:${fontSizeContent};">
      ${d.driverName}: <strong>${d.enteredDate}</strong>
    </p>`;
                 }
                 const source = d.driverTypeID === 4 ? d.slab : d.variation;
                 return source
                   ?.filter((item) => item.isDefault)
                   .map(
                     (sub) => `
                   <p style="color: black; font-size: ${fontSizeContent};">
                     ${d.driverName}: ${
                       d.driverTypeID === 4
                         ? sub.slabTypeID === 2
                           ? `<strong>${formatCurrency(sub.slabValue)}</strong>`
                           : `<strong>${formatCurrency(
                               sub.slabFrom,
                             )}-${formatCurrency(sub.slabTo)}</strong>`
                         : `<strong>${sub.variationName}</strong>`
                     }
                   </p>
                 `,
                   )
                   .join("");
                 //  }
               })
               .join("")}`
            : ""
        }

        ${
          props?.quoteAdditionalInfoGlobalPricingDriver?.filter(
            (d) => d.driverTypeID !== 1,
          ).length
            ? `<p style="font-size: ${fontSizeHeading}; color: ${newColorCode}; font-weight: bold;">Additional Information</p>
             <hr style="color: gray; margin-top: -15px;" />
             ${props.quoteAdditionalInfoGlobalPricingDriver
               .map(
                 (d) => `
               <p style="color: black; font-size: ${fontSizeContent};">
                 ${d.driverName}: <strong>${
                   d.driverTypeID === 2
                     ? formatCurrency(d.driverValue)
                     : d.driverTypeID === 3
                       ? d.variationName
                       : d.driverTypeID === 4
                         ? d.slabTypeID === 2
                           ? formatCurrency(d.driverValue)
                           : `${formatCurrency(d.slabFrom)} - ${formatCurrency(
                               d.slabTo,
                             )}`
                         : d.driverTypeID === 5
                           ? d.enteredText
                           : d.driverTypeID === 6
                             ? d.enteredDate
                             : ""
                 }</strong>
               </p>
             `,
               )
               .join("")}`
            : ""
        }
      </div>
    `;
    }
  }

  const handleSOFChange = (newContent) => {
    props.setStatementOfFactsHTML(newContent);
  };

  const handleSDChange = (newContent) => {
    props.setServiceDescriptionHTML(newContent);
  };

  const hasRecurringPackageRows = (
    props.selectedRecurringServiceList || []
  ).some((service) => (service?.servicesList || []).length > 0);
  const hasOneOffPackageRows = (props.selectedOneOffServiceList || []).some(
    (service) => (service?.servicesList || []).length > 0,
  );

  const openGlobalPackageTemplatePicker = () => {
    props.setShowSelectTemplateModal(true);
    props.setServiceTypeID(
      hasRecurringPackageRows
        ? servicePackageTypeID.RecurringPackageTypeID
        : servicePackageTypeID.OneOffPackageTypeID,
    );
  };

  const recurringPackageDiscountPercentages = [
    props.RecurringPricingInfo?.DiscountPercentagePackageOne,
    props.RecurringPricingInfo?.DiscountPercentagePackageTwo,
    props.RecurringPricingInfo?.DiscountPercentagePackageThree,
  ];

  const activeRecurringPackages = (props.selectedPackagesList || []).slice(
    0,
    3,
  );

  const activeCustomPackageFooters = activeRecurringPackages.map(
    (selectedPackage, packageIndex) =>
      calculateCustomRecurringPackageFooter({
        serviceGroups: props.selectedRecurringServiceList || [],

        packageIndex,

        selectedPackageID: selectedPackage?.servicePackageID ?? null,

        discountPercentage:
          recurringPackageDiscountPercentages[packageIndex] ?? 0,

        fallbackVatPercentage: props.vatPercentage ?? 0,
      }),
  );

  const hasCustomPackageVAT = Number(props.vatPercentage || 0) > 0;

  const showCustomPackageDiscount =
    Boolean(props.engagementObj?.DiscountLines) &&
    activeCustomPackageFooters.some((footer) => footer.hasPositiveDiscount);

  const customPackageColumnsPerPackage = [
    props.visibleFieldsCustomTemp?.fees,

    hasCustomPackageVAT && props.visibleFieldsCustomTemp?.vatRate,

    hasCustomPackageVAT && props.visibleFieldsCustomTemp?.vat,

    hasCustomPackageVAT && props.visibleFieldsCustomTemp?.feesIncVat,

    props.visibleFieldsCustomTemp?.serviceScope,
  ].filter(Boolean).length;

  const recurringPackageTableColumnCount =
    (props.visibleFieldsCustomTemp?.serviceName ? 1 : 0) +
    activeRecurringPackages.length * customPackageColumnsPerPackage;

  const calculateCustomOneOffPackageRow = ({
    service,
    packageIndex,
    fallbackVatPercentage = 0,
  }) => {
    const packageValueKeys = [
      "packageOneValue",
      "packageTwoValue",
      "packageThreeValue",
    ];

    const packageIdKeys = ["packageOneID", "packageTwoID", "packageThreeID"];

    const price =
      Number(
        String(service?.[packageValueKeys[packageIndex]] ?? 0).replace(
          /,/g,
          "",
        ),
      ) || 0;

    const packageId = service?.[packageIdKeys[packageIndex]];

    const isIncluded =
      Array.isArray(service?.servicePackageIDs) &&
      service.servicePackageIDs.includes(packageId);

    const vatRate =
      Number(service?.service_vat_percentage) ||
      Number(fallbackVatPercentage) ||
      0;

    const vat = isIncluded ? (price * vatRate) / 100 : 0;

    const feesIncVat = price + vat;

    return {
      price,
      vatRate,
      vat,
      feesIncVat,
      isIncluded,
    };
  };

  const calculateOneOffPackageRow = ({
    service,
    packageIndex,
    fallbackVatRate = 0,
  }) => {
    const packageValueKeys = [
      "packageOneValue",
      "packageTwoValue",
      "packageThreeValue",
    ];

    const packageIdKeys = ["packageOneID", "packageTwoID", "packageThreeID"];

    const price =
      Number(
        String(service?.[packageValueKeys[packageIndex]] ?? 0).replace(
          /,/g,
          "",
        ),
      ) || 0;

    const packageId = service?.[packageIdKeys[packageIndex]];

    const isIncluded = service?.servicePackageIDs?.includes(packageId);

    const vatRate =
      Number(service?.service_vat_percentage) || Number(fallbackVatRate) || 0;

    const vat = isIncluded ? (price * vatRate) / 100 : 0;

    const feesIncVat = price + vat;

    return {
      price,
      vatRate,
      vat,
      feesIncVat,
      isIncluded,
    };
  };

  const oneOffPackageDiscountPercentages = [
    props.OneOffPricingInfo?.DiscountPercentagePackageOne,

    props.OneOffPricingInfo?.DiscountPercentagePackageTwo,

    props.OneOffPricingInfo?.DiscountPercentagePackageThree,
  ];

  const activeOneOffPackageCount = Math.min(
    Number(packageCount || props.selectedPackagesList?.length || 0),
    3,
  );

  const activeOneOffPackages = (props.selectedPackagesList || []).slice(
    0,
    activeOneOffPackageCount,
  );

  const activeCustomOneOffPackageFooters = activeOneOffPackages.map(
    (selectedPackage, packageIndex) =>
      calculateCustomOneOffPackageFooter({
        serviceGroups: props.selectedOneOffServiceList || [],

        packageIndex,

        selectedPackageID: selectedPackage?.servicePackageID ?? null,

        discountPercentage: oneOffPackageDiscountPercentages[packageIndex] ?? 0,

        fallbackVatPercentage: props.vatPercentage ?? 0,
      }),
  );

  const hasCustomOneOffPackageVAT =
    Number(props.vatPercentage || 0) > 0 ||
    (props.selectedOneOffServiceList || []).some((category) =>
      (category?.servicesList || []).some(
        (service) => Number(service?.service_vat_percentage || 0) > 0,
      ),
    );

  const showCustomOneOffPackageDiscount =
    Boolean(props.engagementObj?.DiscountLines) &&
    activeCustomOneOffPackageFooters.some(
      (footer) => footer.hasPositiveDiscount,
    );

  return (
    <>
      <div className="create-practice-height scrollbar">
        <div className="container">
          <div className="tab-content">
            <div className="tab-pane p-3 active">
              <div className="row">
                <div className="col-12">
                  <div className="row fieldset mb-2">
                    <div className="col-lg-2 text-lg-right">
                      <>
                        {props.proposalName.length > 10 ? (
                          <Tooltip title={`Fees in the ${props.proposalName}`}>
                            <label className="fieldset-label required">
                              Fees in the {props.proposalName.substring(0, 10)}
                              ...
                              <span className="text-danger">*</span>
                            </label>
                          </Tooltip>
                        ) : (
                          <>
                            <label className="fieldset-label required">
                              Fees in the {props.proposalName}
                              <span className="text-danger">*</span>
                            </label>
                          </>
                        )}
                      </>
                    </div>
                    <div className="col-lg-10">
                      <div className="input-group">
                        {/* Add your Select component here */}
                        <Select
                          className="phone-input-country-code selectDropDown Drop-down-width"
                          value={feeTypeValue}
                          onChange={(e) => {
                            props.DisableTabOnChange();
                            handleChangeFeesType(e);
                          }}
                          options={modifiedFeesType}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row fieldset">
                    <div className="col-md-2 text-md-end">
                      <label className="fieldset-label required">
                        Payment Gateway
                        <span className="text-danger">*</span>
                      </label>
                    </div>
                    <div className="col-md-10 mb-2 ">
                      {/* Adjust the Select component as needed */}
                      <button
                        style={{
                          fontSize: "12px",
                          float: "right",
                          border: "none",
                          background: "transparent",
                          color: "#626ed4",
                        }}
                        onClick={() => props.setISModalOpen(true)}
                        className="float-sm-end"
                        data-bs-toggle="modal"
                        data-bs-target="#paymentGatewayModel"
                      >
                        + Payment Gateway
                      </button>
                      <div className="mb-1 input-group">
                        <Select
                          className="phone-input-country-code selectDropDown Drop-down-width"
                          value={PaymentGatewayValue}
                          onChange={(e) => {
                            props.setEngagementObj({
                              ...props.engagementObj,
                              paymentGatewayID: e.value,
                            });
                          }}
                          options={modifiedPaymentGatewayType}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row fieldset">
                    <div className="col-lg-2 text-lg-right">
                      <label className="fieldset-label required">
                        Show Discount
                      </label>
                    </div>
                    <div className="col-lg-10">
                      <div className="input-group">
                        {/* Replace Select with Checkbox */}
                        <input
                          type="checkbox"
                          disabled={
                            props.engagementObj.feeTypeId === 1 ||
                            (props.RecurringPricingInfo.DefaultDiscount <= 0 &&
                              props.OneOffPricingInfo.DefaultDiscount <= 0)
                          }
                          checked={props.engagementObj.DiscountLines} // Check the checkbox if DiscountLines is 1
                          onChange={handleCheckboxChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {(hasRecurringPackageRows || hasOneOffPackageRows) && (
            <div
              className="Custom-template"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                marginBottom: "12px",
              }}
            >
              <small className="text-muted">
                Applies to recurring and one-off tables
              </small>
              <div className="viewTemp">
                <Tooltip title="Select Template">
                  <div
                    onClick={openGlobalPackageTemplatePicker}
                    style={{ cursor: "pointer" }}
                  >
                    <ViewModuleIcon />
                  </div>
                </Tooltip>
              </div>
            </div>
          )}
          {props.selectedRecurringServiceList?.length !== 0 && (
            <div className="tab-content">
              <div className="tab-pane p-3 active">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="separator mb-2"></div>
                    <h6>Recurring Services</h6>
                    <div className="separator mb-3"></div>

                    <div className="row" id="recurring_Default">
                      <div class="col-lg-2 mb-1 col-md-2 col-sm-12 mt-2 text-md-end">
                        {packageCount == 1 && (
                          <>
                            <label className="fieldset-label">
                              Discount (%)
                            </label>
                          </>
                        )}
                      </div>
                      <div className="col-lg-4">
                        {packageCount == 1 && (
                          <>
                            <input
                              className="input-text"
                              type="text" // Change type to number
                              placeholder="Discount (%)"
                              value={props.RecurringPricingInfo.DiscountPercentagePackageOne?.toString()?.replace(
                                /\B(?=(\d{3})+(?!\d))/g,
                                ",",
                              )}
                              onChange={(e) => {
                                handlePackageOneDiscountPercentage(e);
                              }}
                            />
                            {props.getValidationMessage(
                              props.requireMessage,
                              props.pricingSettingObj.maxDiscountForQC,
                              props.RecurringPricingInfo
                                .DiscountPercentagePackageOne,
                            )}
                          </>
                        )}
                      </div>

                      <div className="col-lg-2 text-lg-right">
                        <label className="fieldset-label required mt-2">
                          Payment Frequency
                        </label>
                      </div>
                      <div className="col-lg-4">
                        <Select
                          className="phone-input-country-code selectDropDown Drop-down-width"
                          value={selectedFrequency}
                          onChange={handlePaymentFrequencyChange}
                          options={Utils.Payment_Frequency}
                        />
                      </div>
                    </div>
                    <div className="row fieldset"></div>
                    <div className="mb-3"></div>

                    {props.selectedTemplateID === 0 ? (
                      <div
                        style={{ marginTop: "0px" }}
                        className="table-responsive"
                      >
                        <table
                          class="table align-middle table-nowrap"
                          style={{ width: "100%" }}
                        >
                          <thead className="table-light table-header-font">
                            <tr className="head-row">
                              <td className="tr-table-class font-14 text-white">
                                Services
                              </td>
                              {props.selectedPackagesList.map((pkg, index) => (
                                <td
                                  key={index}
                                  className="tr-table-class font-14 text-white text-right"
                                >
                                  {pkg.servicePackageName.length > 50 ? (
                                    <Tooltip title={pkg.servicePackageName}>
                                      {pkg.servicePackageName
                                        .substring(0, 50)
                                        .toLowerCase()
                                        .replace(/\b\w/g, (l) =>
                                          l.toUpperCase(),
                                        ) + "..."}
                                    </Tooltip>
                                  ) : pkg.servicePackageName.length > 50 ? (
                                    <Tooltip title={pkg.servicePackageName}>
                                      {pkg.servicePackageName.substring(0, 50) +
                                        "..."}
                                    </Tooltip>
                                  ) : (
                                    pkg.servicePackageName
                                  )}
                                </td>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {props.selectedRecurringServiceList.map(
                              (service, index) => {
                                return (
                                  <>
                                    <tr className="a-la-carte-services-review-head-row">
                                      <th colSpan={1 + packageCount}>
                                        {service.serviceCatName}
                                      </th>
                                    </tr>
                                    {service.servicesList.map(
                                      (subService, subIndex) => (
                                        <tr
                                          key={subIndex}
                                          className={` ${
                                            subService?.isAdditionalService !==
                                            null
                                              ? "bg-info  text-white"
                                              : ""
                                          }`}
                                        >
                                          <td>
                                            <div>
                                              {/* {subService.serviceName.length >
                                              45 ? (
                                              <Tooltip
                                                title={subService.serviceName}
                                              >
                                                {subService.serviceName
                                                  .substring(0, 45)
                                                  .toLowerCase()
                                                  .replace(/\b\w/g, (l) =>
                                                    l.toUpperCase()
                                                  ) + "..."}
                                              </Tooltip>
                                            ) : (
                                                <EditableCell
                                                  value={subService.serviceName}
                                                  onSave={(newName) => {
                                                    // Update the service name in your state
                                                    props.setSelectedRecurringServiceList(prevList => {
                                                      const newList = [...prevList];
                                                      // Find the correct service and update it
                                                      const serviceIndex = prevList.findIndex(s => s === service);
                                                      newList[serviceIndex].servicesList[subIndex].serviceName = newName;
                                                      return newList;
                                                    });
                                                    // For example: call a prop or update local data here
                                                  }}
                                                />
                                            )} */}
                                              <EditableCell
                                                value={subService.serviceName}
                                                displayValue={
                                                  subService.serviceName
                                                    .length > 45
                                                    ? subService.serviceName
                                                        .substring(0, 45)
                                                        .toLowerCase()
                                                        .replace(/\b\w/g, (l) =>
                                                          l.toUpperCase(),
                                                        ) + "..."
                                                    : undefined
                                                }
                                                onSave={(newName) => {
                                                  props.setSelectedRecurringServiceList(
                                                    (prevList) => {
                                                      const newList = [
                                                        ...prevList,
                                                      ];
                                                      const serviceIndex =
                                                        prevList.findIndex(
                                                          (s) => s === service,
                                                        );
                                                      newList[
                                                        serviceIndex
                                                      ].servicesList[
                                                        subIndex
                                                      ].serviceName = newName;
                                                      return newList;
                                                    },
                                                  );
                                                }}
                                              />
                                            </div>
                                            {props.requireMessage &&
                                              subService.serviceName.trim() ===
                                                "" && (
                                                <div>
                                                  <label className="text-danger">
                                                    Please enter a valid service
                                                    name
                                                  </label>
                                                </div>
                                              )}
                                            <div className="package-variables"></div>
                                          </td>

                                          <td className="text-right">
                                            <div className="flex-end-item">
                                              {props.engagementObj.feeTypeId ===
                                              1 ? (
                                                <div>
                                                  {(subService.packageOneValue ===
                                                    0 ||
                                                    subService.packageOneValue ===
                                                      null) &&
                                                  !subService.servicePackageIDs.some(
                                                    (item) =>
                                                      item ==
                                                      props
                                                        .selectedPackagesList[0]
                                                        .servicePackageID,
                                                  ) ? (
                                                    <span className="fa fa-times"></span>
                                                  ) : !subService?.servicePackageIDs.includes(
                                                      subService.packageOneID,
                                                    ) ? (
                                                    <span className="fa fa-times"></span>
                                                  ) : (
                                                    ` ${props.formatValue(
                                                      subService.packageOneValue,
                                                      props.currencyID,
                                                    )}`
                                                  )}
                                                </div>
                                              ) : Number(
                                                  subService.packageOneValue,
                                                ) !== null &&
                                                subService?.servicePackageIDs.includes(
                                                  subService.packageOneID,
                                                ) ? (
                                                <span className="fa fa-check"></span>
                                              ) : (
                                                <span className="fa fa-times"></span>
                                              )}
                                            </div>
                                          </td>
                                          {packageCount >= 2 && (
                                            <td className="text-right">
                                              <div className="flex-end-item">
                                                {props.engagementObj
                                                  .feeTypeId === 1 ? (
                                                  <div className="flex-end-item">
                                                    {(subService.packageTwoValue ===
                                                      0 ||
                                                      subService.packageTwoValue ===
                                                        null) &&
                                                    !subService.servicePackageIDs.some(
                                                      (item) =>
                                                        item ==
                                                        props
                                                          .selectedPackagesList[1]
                                                          .servicePackageID,
                                                    ) ? (
                                                      <span className="fa fa-times"></span>
                                                    ) : !subService?.servicePackageIDs.includes(
                                                        subService.packageTwoID,
                                                      ) ? (
                                                      <span className="fa fa-times"></span>
                                                    ) : (
                                                      ` ${props.formatValue(
                                                        subService.packageTwoValue,
                                                        props.currencyID,
                                                      )}`
                                                    )}
                                                  </div>
                                                ) : Number(
                                                    subService.packageTwoValue,
                                                  ) !== null &&
                                                  subService?.servicePackageIDs.includes(
                                                    subService.packageTwoID,
                                                  ) ? (
                                                  <span className="fa fa-check"></span>
                                                ) : (
                                                  <span className="fa fa-times"></span>
                                                )}
                                              </div>
                                            </td>
                                          )}
                                          {packageCount === 3 && (
                                            <td className="text-right">
                                              <div className="flex-end-item">
                                                {props.engagementObj
                                                  .feeTypeId === 1 ? (
                                                  <div className="flex-end-item">
                                                    {(subService.packageThreeValue ===
                                                      0 ||
                                                      subService.packageThreeValue ===
                                                        null) &&
                                                    !subService.servicePackageIDs.some(
                                                      (item) =>
                                                        item ==
                                                        props
                                                          .selectedPackagesList[2]
                                                          .servicePackageID,
                                                    ) ? (
                                                      <span className="fa fa-times"></span>
                                                    ) : !subService?.servicePackageIDs.includes(
                                                        subService.packageThreeID,
                                                      ) ? (
                                                      <span className="fa fa-times"></span>
                                                    ) : (
                                                      ` ${props.formatValue(
                                                        subService.packageThreeValue,
                                                        props.currencyID,
                                                      )}`
                                                    )}
                                                  </div>
                                                ) : Number(
                                                    subService.packageThreeValue,
                                                  ) !== null &&
                                                  subService?.servicePackageIDs.includes(
                                                    subService.packageThreeID,
                                                  ) ? (
                                                  <span className="fa fa-check"></span>
                                                ) : (
                                                  <span className="fa fa-times"></span>
                                                )}
                                              </div>
                                            </td>
                                          )}
                                        </tr>
                                      ),
                                    )}
                                  </>
                                );
                              },
                            )}
                          </tbody>
                          {packageCount > 1 && (
                            <>
                              <tr id="recurring_DefaultWithPackages">
                                <td
                                  style={{
                                    padding: "8px",
                                  }}
                                >
                                  Discount (%)
                                  {/* <div className="package-variables"></div> */}
                                </td>

                                <td
                                  style={{
                                    width: "35%",
                                    padding: "0px",
                                    whiteSpace: "normal",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "flex-start",
                                    }}
                                  >
                                    <input
                                      className="input-text"
                                      type="text" // Change type to number
                                      placeholder="Discount (%)"
                                      value={props.RecurringPricingInfo.DiscountPercentagePackageOne?.toString()?.replace(
                                        /\B(?=(\d{3})+(?!\d))/g,
                                        ",",
                                      )}
                                      onChange={(e) => {
                                        handlePackageOneDiscountPercentage(e);
                                      }}
                                      style={{
                                        width: "100%",
                                        textAlign: "right",
                                      }}
                                    />
                                    <div>
                                      {props.getValidationMessage(
                                        props.requireMessage,
                                        props.pricingSettingObj
                                          .maxDiscountForQC,
                                        props.RecurringPricingInfo
                                          .DiscountPercentagePackageOne,
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {packageCount >= 2 && (
                                  <td
                                    style={{
                                      width: "35%",
                                      padding: "0px",
                                      whiteSpace: "normal",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-start",
                                      }}
                                    >
                                      <input
                                        className="input-text"
                                        type="text" // Change type to number
                                        placeholder="Discount (%)"
                                        value={props.RecurringPricingInfo.DiscountPercentagePackageTwo?.toString()?.replace(
                                          /\B(?=(\d{3})+(?!\d))/g,
                                          ",",
                                        )}
                                        onChange={(e) => {
                                          handlePackageTwoDiscountPercentage(e);
                                        }}
                                        style={{
                                          width: "100%",
                                          textAlign: "right",
                                        }}
                                      />
                                      <div>
                                        {props.getValidationMessage(
                                          props.requireMessage,
                                          props.pricingSettingObj
                                            .maxDiscountForQC,
                                          props.RecurringPricingInfo
                                            .DiscountPercentagePackageTwo,
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                )}

                                {packageCount === 3 && (
                                  <td
                                    style={{
                                      width: "35%",
                                      padding: "0px",
                                      whiteSpace: "normal",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-start",
                                      }}
                                    >
                                      <input
                                        className="input-text"
                                        type="text" // Change type to number
                                        placeholder="Discount (%)"
                                        value={props.RecurringPricingInfo.DiscountPercentagePackageThree?.toString()?.replace(
                                          /\B(?=(\d{3})+(?!\d))/g,
                                          ",",
                                        )}
                                        onChange={(e) => {
                                          handlePackageThreeDiscountPercentage(
                                            e,
                                          );
                                        }}
                                        style={{
                                          width: "100%",
                                          textAlign: "right",
                                        }}
                                      />
                                      <div>
                                        {props.getValidationMessage(
                                          props.requireMessage,
                                          props.pricingSettingObj
                                            .maxDiscountForQC,
                                          props.RecurringPricingInfo
                                            .DiscountPercentagePackageThree,
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            </>
                          )}
                          <tr className="head-row">
                            <td className="tr-table-class font-14 text-white">
                              Net Total
                            </td>
                            <td className="tr-table-class font-14 text-white text-right">
                              {" "}
                              {
                                totalOnePackageValue >
                                  Number(
                                    props.RecurringPricingInfo
                                      .packageOneNetTotal,
                                  ) ||
                                (Number(
                                  props.RecurringPricingInfo.packageOneDisCount,
                                ) > 0 &&
                                  !props.engagementObj.DiscountLines)
                                  ? // ||
                                    // Number(
                                    //   props.RecurringPricingInfo
                                    //     .packageOneDisCountedTotal
                                    // ) === 0
                                    Number(
                                      props.RecurringPricingInfo
                                        .packageOneDisCount,
                                    ) > 0 && !props.engagementObj.DiscountLines
                                    ? props.formatValue(
                                        props.RecurringPricingInfo
                                          .packageOneDisCountedTotal,
                                        props.currencyID,
                                      )
                                    : props.formatValue(
                                        totalOnePackageValue,
                                        props.currencyID,
                                      )
                                  : //  Number(totalOnePackageValue)
                                    //     .toFixed(2)
                                    //     .toString()
                                    //     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    props.formatValue(
                                      props.RecurringPricingInfo
                                        .packageOneNetTotal,
                                      props.currencyID,
                                    )
                                // Number(
                                //     props.RecurringPricingInfo
                                //       .packageOneDisCountedTotal
                                //   )
                                //     .toFixed(2)
                                //     .toString()
                                //     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                              }
                            </td>
                            {packageCount >= 2 && (
                              <td className="tr-table-class font-14 text-white text-right">
                                {" "}
                                {
                                  totalTwoPackageValue >
                                    Number(
                                      props.RecurringPricingInfo
                                        .packageTwoNetTotal,
                                    ) ||
                                  (Number(
                                    props.RecurringPricingInfo
                                      .packageTwoDisCount,
                                  ) > 0 &&
                                    !props.engagementObj.DiscountLines)
                                    ? // ||
                                      // Number(
                                      //   props.RecurringPricingInfo
                                      //     .packageTwoDisCountedTotal
                                      // ) === 0
                                      Number(
                                        props.RecurringPricingInfo
                                          .packageTwoDisCount,
                                      ) > 0 &&
                                      !props.engagementObj.DiscountLines
                                      ? props.formatValue(
                                          props.RecurringPricingInfo
                                            .packageTwoDisCountedTotal,
                                          props.currencyID,
                                        )
                                      : props.formatValue(
                                          totalTwoPackageValue,
                                          props.currencyID,
                                        )
                                    : // Number(totalTwoPackageValue)
                                      //     .toFixed(2)
                                      //     .toString()
                                      //     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                      props.formatValue(
                                        props.RecurringPricingInfo
                                          .packageTwoNetTotal,
                                        props.currencyID,
                                      )
                                  // Number(
                                  //     props.RecurringPricingInfo
                                  //       .packageTwoDisCountedTotal
                                  //   )
                                  //     .toFixed(2)
                                  //     .toString()
                                  //     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                }
                              </td>
                            )}{" "}
                            {packageCount === 3 && (
                              <td className="tr-table-class font-14 text-white text-right">
                                {" "}
                                {
                                  totalThreePackageValue >
                                    Number(
                                      props.RecurringPricingInfo
                                        .packageThreeNetTotal,
                                    ) ||
                                  (Number(
                                    props.RecurringPricingInfo
                                      .packageThreeDisCount,
                                  ) > 0 &&
                                    !props.engagementObj.DiscountLines)
                                    ? // ||
                                      // Number(
                                      //   props.RecurringPricingInfo
                                      //     .packageThreeNetTotal
                                      // ) === 0
                                      Number(
                                        props.RecurringPricingInfo
                                          .packageThreeDisCount,
                                      ) > 0 &&
                                      !props.engagementObj.DiscountLines
                                      ? props.formatValue(
                                          props.RecurringPricingInfo
                                            .packageThreeDisCountedTotal,
                                          props.currencyID,
                                        )
                                      : props.formatValue(
                                          totalThreePackageValue,
                                          props.currencyID,
                                        )
                                    : // Number(totalThreePackageValue)
                                      //     .toFixed(2)
                                      //     .toString()
                                      //     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                      props.formatValue(
                                        props.RecurringPricingInfo
                                          .packageThreeNetTotal,
                                        props.currencyID,
                                      )
                                  // Number(
                                  //     props.RecurringPricingInfo
                                  //       .packageThreeDisCountedTotal
                                  //   )
                                  //     .toFixed(2)
                                  //     .toString()
                                  //     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                }
                              </td>
                            )}
                          </tr>

                          {/* </td> */}
                          {/* </tr> */}
                          {(Number(
                            props.RecurringPricingInfo.packageThreeDisCount,
                          ) > 0 ||
                            Number(
                              props.RecurringPricingInfo.packageOneDisCount,
                            ) > 0 ||
                            Number(
                              props.RecurringPricingInfo.packageTwoDisCount,
                            ) > 0) &&
                            props.engagementObj.DiscountLines && (
                              <>
                                <tr className="head-grey-row">
                                  <td className="tr-table-class font-14 text-white">
                                    Discount
                                  </td>
                                  <td className="tr-table-class font-14 text-white text-right">
                                    (-){" "}
                                    {props.formatValue(
                                      props.RecurringPricingInfo
                                        .packageOneDisCount,
                                      props.currencyID,
                                    )}
                                  </td>
                                  {packageCount >= 2 && (
                                    <td className="tr-table-class font-14 text-white text-right">
                                      (-){" "}
                                      {props.formatValue(
                                        props.RecurringPricingInfo
                                          .packageTwoDisCount,
                                        props.currencyID,
                                      )}
                                    </td>
                                  )}
                                  {packageCount === 3 && (
                                    <td className="tr-table-class font-14 text-white text-right">
                                      (-){" "}
                                      {props.formatValue(
                                        props.RecurringPricingInfo
                                          .packageThreeDisCount,
                                        props.currencyID,
                                      )}
                                    </td>
                                  )}
                                </tr>
                                <tr className="head-row">
                                  <td className="tr-table-class font-14 text-white">
                                    Discounted Total
                                  </td>
                                  <td className="tr-table-class font-14 text-white text-right">
                                    {" "}
                                    {props.formatValue(
                                      props.RecurringPricingInfo
                                        .packageOneDisCountedTotal,
                                      props.currencyID,
                                    )}
                                  </td>

                                  {packageCount >= 2 && (
                                    <td className="tr-table-class font-14 text-white text-right">
                                      {" "}
                                      {props.formatValue(
                                        props.RecurringPricingInfo
                                          .packageTwoDisCountedTotal,
                                        props.currencyID,
                                      )}
                                    </td>
                                  )}
                                  {packageCount === 3 && (
                                    <td className="tr-table-class font-14 text-white text-right">
                                      {" "}
                                      {props.formatValue(
                                        props.RecurringPricingInfo
                                          .packageThreeDisCountedTotal,
                                        props.currencyID,
                                      )}
                                    </td>
                                  )}
                                </tr>
                              </>
                            )}

                          {props.vatPercentage && (
                            <>
                              <tr class="head-grey-row">
                                <td className="tr-table-class font-14 text-white">
                                  {props.taxName}
                                </td>
                                <td className="tr-table-class font-14 text-white text-right">
                                  {" "}
                                  {
                                    props.formatValue(
                                      props.RecurringPricingInfo
                                        .PackageOneVaTPrice,
                                      props.currencyID,
                                    )
                                    // Number(
                                    //   props.RecurringPricingInfo.PackageOneVaTPrice
                                    // )
                                    //   .toFixed(2)
                                    //   .toString()
                                    //   .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                  }
                                  {/* VATNew Rs{RecurringPackageCalculation.PackageOneVatTotalAmount} */}
                                </td>
                                {packageCount >= 2 && (
                                  <td className="tr-table-class font-14 text-white text-right">
                                    {" "}
                                    {
                                      props.formatValue(
                                        props.RecurringPricingInfo
                                          .PackageTwoVaTPrice,
                                        props.currencyID,
                                      )
                                      // Number(
                                      //   props.RecurringPricingInfo.PackageTwoVaTPrice
                                      // )
                                      //   .toFixed(2)
                                      //   .toString()
                                      //   .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    }
                                  </td>
                                )}
                                {packageCount === 3 && (
                                  <td className="tr-table-class font-14 text-white text-right">
                                    {" "}
                                    {
                                      props.formatValue(
                                        props.RecurringPricingInfo
                                          .PackageThreeVaTPrice,
                                        props.currencyID,
                                      )
                                      // Number(
                                      //   props.RecurringPricingInfo
                                      //     .PackageThreeVaTPrice
                                      // )
                                      //   .toFixed(2)
                                      //   .toString()
                                      //   .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    }
                                  </td>
                                )}
                              </tr>
                              <tr className="head-row">
                                <td className="tr-table-class font-14 text-white">
                                  Grand Total
                                </td>
                                <td className="tr-table-class font-14 text-white text-right">
                                  {" "}
                                  {
                                    props.formatValue(
                                      props.RecurringPricingInfo
                                        .PackageOneGrandTotal,
                                      props.currencyID,
                                    )

                                    // Number(
                                    //   props.RecurringPricingInfo.PackageOneGrandTotal
                                    // )
                                    //   .toFixed(2)
                                    //   .toString()
                                    //   .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                  }
                                  {/* NewGT Rs{RecurringPackageCalculation.PackageOneGrandTotalAmount} */}
                                </td>
                                {packageCount >= 2 && (
                                  <td className="tr-table-class font-14 text-white text-right">
                                    {" "}
                                    {
                                      props.formatValue(
                                        props.RecurringPricingInfo
                                          .PackageTwoGrandTotal,
                                        props.currencyID,
                                      )
                                      // Number(
                                      //   props.RecurringPricingInfo
                                      //     .PackageTwoGrandTotal
                                      // )
                                      //   .toFixed(2)
                                      //   .toString()
                                      //   .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    }
                                  </td>
                                )}
                                {packageCount == 3 && (
                                  <td className="tr-table-class font-14 text-white text-right">
                                    {" "}
                                    {
                                      props.formatValue(
                                        props.RecurringPricingInfo
                                          .PackageThreeGrandTotal,
                                        props.currencyID,
                                      )
                                      // Number(
                                      //   props.RecurringPricingInfo
                                      //     .PackageThreeGrandTotal
                                      // )
                                      //   .toFixed(2)
                                      //   .toString()
                                      //   .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    }
                                  </td>
                                )}
                              </tr>
                            </>
                          )}
                        </table>
                      </div>
                    ) : (
                      <div
                        style={{ marginTop: "0px" }}
                        className="table-responsive"
                      >
                        {/* <div
                                                       dangerouslySetInnerHTML={{
                                                         __html: currentPricingTableDesignRecurring,
                                                       }}
                                                     /> */}
                        <table
                          class="table align-middle table-nowrap"
                          style={{ width: "100%" }}
                        >
                          <thead className="table-light table-header-font">
                            <tr className="head-row">
                              <td></td>
                              {props.selectedPackagesList.map((pkg, index) => (
                                <>
                                  <td
                                    key={index}
                                    className="tr-table-class font-14 text-white text-right"
                                  >
                                    {pkg.servicePackageName.length > 10 ? (
                                      <Tooltip title={pkg.servicePackageName}>
                                        {pkg.servicePackageName
                                          .substring(0, 10)
                                          .toLowerCase()
                                          .replace(/\b\w/g, (l) =>
                                            l.toUpperCase(),
                                          ) + "..."}
                                      </Tooltip>
                                    ) : pkg.servicePackageName.length > 10 ? (
                                      <Tooltip title={pkg.servicePackageName}>
                                        {pkg.servicePackageName.substring(
                                          0,
                                          10,
                                        ) + "..."}
                                      </Tooltip>
                                    ) : (
                                      pkg.servicePackageName
                                    )}
                                  </td>
                                  {props.vatPercentage !== 0 &&
                                    props.visibleFieldsCustomTemp.vatRate && (
                                      <td></td>
                                    )}
                                  {props.vatPercentage !== 0 &&
                                    props.visibleFieldsCustomTemp.vat && (
                                      <td></td>
                                    )}
                                  {props.vatPercentage !== 0 &&
                                    props.visibleFieldsCustomTemp
                                      .feesIncVat && <td></td>}
                                  {props.visibleFieldsCustomTemp
                                    .serviceScope && <td></td>}
                                </>
                              ))}
                            </tr>
                            <tr className="head-row">
                              {props.visibleFieldsCustomTemp.serviceName && (
                                <td className="tr-table-class font-14 text-white">
                                  Services
                                </td>
                              )}
                              {props.selectedPackagesList.map((pkg, index) => (
                                <>
                                  {/* <td
                                              key={index}
                                              className="tr-table-class font-14 text-white text-right"
                                            >
                                              {pkg.servicePackageName.length > 10 ? (
                                                <Tooltip title={pkg.servicePackageName}>
                                                  {pkg.servicePackageName
                                                    .substring(0, 10)
                                                    .toLowerCase()
                                                    .replace(/\b\w/g, (l) => l.toUpperCase()) + "..."}
                                                </Tooltip>
                                              ) : pkg.servicePackageName.length > 10 ? (
                                                <Tooltip title={pkg.servicePackageName}>
                                                  {pkg.servicePackageName.substring(0, 10) + "..."}
                                                </Tooltip>
                                              ) : (
                                                pkg.servicePackageName
                                              )}
                                            </td> */}

                                  {props.visibleFieldsCustomTemp.fees && (
                                    <th
                                      className="tr-table-class text-white text-right"
                                      style={{ width: "16.66%" }}
                                    >
                                      Fees ({props.currencySymbol})
                                    </th>
                                  )}

                                  {props.vatPercentage !== 0 &&
                                    props.visibleFieldsCustomTemp.vatRate && (
                                      <th
                                        className="tr-table-class text-white text-right"
                                        style={{ width: "16.66%" }}
                                      >
                                        {props.taxName} Rate
                                      </th>
                                    )}

                                  {props.vatPercentage !== 0 &&
                                    props.visibleFieldsCustomTemp.vat && (
                                      <th
                                        className="tr-table-class text-white text-right"
                                        style={{ width: "16.66%" }}
                                      >
                                        {props.taxName} ({props.currencySymbol})
                                      </th>
                                    )}

                                  {props.vatPercentage !== 0 &&
                                    props.visibleFieldsCustomTemp
                                      .feesIncVat && (
                                      <th
                                        className="tr-table-class text-white text-right"
                                        style={{ width: "16.66%" }}
                                      >
                                        Fees inc {props.taxName} (
                                        {props.currencySymbol})
                                      </th>
                                    )}

                                  {props.visibleFieldsCustomTemp
                                    .serviceScope && (
                                    <th
                                      className="tr-table-class text-white text-right"
                                      style={{ width: "16.66%" }}
                                    >
                                      Service Scope
                                    </th>
                                  )}
                                </>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {props.selectedRecurringServiceList.map(
                              (service, index) => {
                                return (
                                  <>
                                    <tr className="a-la-carte-services-review-head-row">
                                      <th
                                        colSpan={
                                          recurringPackageTableColumnCount
                                        }
                                      >
                                        {service.serviceCatName}
                                      </th>
                                    </tr>
                                    {service.servicesList.map(
                                      (subService, subIndex) => {
                                        const recurringPackageRows =
                                          activeRecurringPackages.map(
                                            (_, packageIndex) =>
                                              calculateCustomPackageRow({
                                                service: subService,
                                                packageIndex,
                                                fallbackVatPercentage:
                                                  props.vatPercentage ?? 0,
                                              }),
                                          );

                                        const driverList = Array.isArray(
                                          getServiceScopeDriverList(subService),
                                        )
                                          ? getServiceScopeDriverList(
                                              subService,
                                            )
                                          : [];

                                        return (
                                          <tr
                                            key={subIndex}
                                            className={
                                              subService?.isAdditionalService !==
                                              null
                                                ? "bg-info text-white"
                                                : ""
                                            }
                                          >
                                            {/* SERVICE NAME */}
                                            {props.visibleFieldsCustomTemp
                                              .serviceName && (
                                              <td>
                                                <div>
                                                  {subService.serviceName
                                                    .length > 45 ? (
                                                    <Tooltip
                                                      title={
                                                        subService.serviceName
                                                      }
                                                    >
                                                      {subService.serviceName
                                                        .substring(0, 45)
                                                        .toLowerCase()
                                                        .replace(/\b\w/g, (l) =>
                                                          l.toUpperCase(),
                                                        )}
                                                      ...
                                                    </Tooltip>
                                                  ) : (
                                                    subService.serviceName
                                                  )}
                                                </div>
                                              </td>
                                            )}

                                            {/* PACKAGE COLUMNS */}
                                            {activeRecurringPackages.map(
                                              (pkg, packageIndex) => {
                                                const packageRow =
                                                  recurringPackageRows[
                                                    packageIndex
                                                  ];

                                                return (
                                                  <React.Fragment
                                                    key={`package-row-${packageIndex}`}
                                                  >
                                                    {/* FEES */}
                                                    {props
                                                      .visibleFieldsCustomTemp
                                                      .fees && (
                                                      <td className="text-right">
                                                        {props.engagementObj
                                                          .feeTypeId === 1 ? (
                                                          packageRow.isIncluded ? (
                                                            props.formatValue(
                                                              packageRow.fees,
                                                              props.currencyID,
                                                            )
                                                          ) : (
                                                            <span className="fa fa-times"></span>
                                                          )
                                                        ) : packageRow.isIncluded ? (
                                                          <span className="fa fa-check"></span>
                                                        ) : (
                                                          <span className="fa fa-times"></span>
                                                        )}
                                                      </td>
                                                    )}

                                                    {/* VAT RATE */}
                                                    {Number(
                                                      props.vatPercentage,
                                                    ) > 0 &&
                                                      props
                                                        .visibleFieldsCustomTemp
                                                        .vatRate && (
                                                        <td className="text-right">
                                                          {packageRow.isIncluded ? (
                                                            `${Number(
                                                              packageRow.vatRate ||
                                                                0,
                                                            ).toFixed(2)}%`
                                                          ) : (
                                                            <span className="fa fa-times"></span>
                                                          )}
                                                        </td>
                                                      )}

                                                    {/* VAT */}
                                                    {Number(
                                                      props.vatPercentage,
                                                    ) > 0 &&
                                                      props
                                                        .visibleFieldsCustomTemp
                                                        .vat && (
                                                        <td className="text-right">
                                                          {props.engagementObj
                                                            .feeTypeId === 1 ? (
                                                            packageRow.isIncluded ? (
                                                              props.formatValue(
                                                                packageRow.vat,
                                                                props.currencyID,
                                                              )
                                                            ) : (
                                                              <span className="fa fa-times"></span>
                                                            )
                                                          ) : packageRow.isIncluded ? (
                                                            <span className="fa fa-check"></span>
                                                          ) : (
                                                            <span className="fa fa-times"></span>
                                                          )}
                                                        </td>
                                                      )}

                                                    {/* FEES INCLUDING VAT */}
                                                    {Number(
                                                      props.vatPercentage,
                                                    ) > 0 &&
                                                      props
                                                        .visibleFieldsCustomTemp
                                                        .feesIncVat && (
                                                        <td className="text-right">
                                                          {props.engagementObj
                                                            .feeTypeId === 1 ? (
                                                            packageRow.isIncluded ? (
                                                              props.formatValue(
                                                                packageRow.feesIncVat,
                                                                props.currencyID,
                                                              )
                                                            ) : (
                                                              <span className="fa fa-times"></span>
                                                            )
                                                          ) : packageRow.isIncluded ? (
                                                            <span className="fa fa-check"></span>
                                                          ) : (
                                                            <span className="fa fa-times"></span>
                                                          )}
                                                        </td>
                                                      )}

                                                    {/* SERVICE SCOPE */}
                                                    {props
                                                      .visibleFieldsCustomTemp
                                                      .serviceScope && (
                                                      <td className="text-right">
                                                        {packageRow.isIncluded &&
                                                        driverList.length > 0
                                                          ? driverList
                                                              .filter(
                                                                (d) =>
                                                                  d.driverValue !==
                                                                  null,
                                                              )
                                                              .map((d, i) => (
                                                                <div key={i}>
                                                                  {d.driverName}
                                                                  {" = "}
                                                                  {
                                                                    d.driverValue
                                                                  }
                                                                </div>
                                                              ))
                                                          : "-"}
                                                      </td>
                                                    )}
                                                  </React.Fragment>
                                                );
                                              },
                                            )}
                                          </tr>
                                        );
                                      },
                                    )}
                                  </>
                                );
                              },
                            )}
                          </tbody>
                          {packageCount > 1 && (
                            <>
                              <tr id="recurring_DefaultWithPackages">
                                <td
                                  style={{
                                    padding: "8px",
                                  }}
                                >
                                  Discount (%)
                                </td>

                                <td
                                  style={{
                                    width: "35%",
                                    padding: "0px",
                                    whiteSpace: "normal",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "flex-start",
                                    }}
                                  >
                                    <input
                                      className="input-text"
                                      type="text"
                                      placeholder="Discount (%)"
                                      value={props.RecurringPricingInfo.DiscountPercentagePackageOne?.toString()?.replace(
                                        /\B(?=(\d{3})+(?!\d))/g,
                                        ",",
                                      )}
                                      onChange={(e) => {
                                        handlePackageOneDiscountPercentage(e);
                                      }}
                                      style={{
                                        width: "100%",
                                        textAlign: "right",
                                      }}
                                    />
                                    <div>
                                      {props.getValidationMessage(
                                        props.requireMessage,
                                        props.pricingSettingObj
                                          .maxDiscountForQC,
                                        props.RecurringPricingInfo
                                          .DiscountPercentagePackageOne,
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {props.vatPercentage !== 0 &&
                                  props.visibleFieldsCustomTemp.vatRate && (
                                    <th></th>
                                  )}
                                {props.vatPercentage !== 0 &&
                                  props.visibleFieldsCustomTemp.vat && (
                                    <th></th>
                                  )}
                                {props.vatPercentage !== 0 &&
                                  props.visibleFieldsCustomTemp.feesIncVat && (
                                    <th></th>
                                  )}
                                {props.visibleFieldsCustomTemp.serviceScope && (
                                  <th></th>
                                )}

                                {packageCount >= 2 && (
                                  <>
                                    <td
                                      style={{
                                        width: "35%",
                                        padding: "0px",
                                        whiteSpace: "normal",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "flex-start",
                                        }}
                                      >
                                        <input
                                          className="input-text"
                                          type="text"
                                          placeholder="Discount (%)"
                                          value={props.RecurringPricingInfo.DiscountPercentagePackageTwo?.toString()?.replace(
                                            /\B(?=(\d{3})+(?!\d))/g,
                                            ",",
                                          )}
                                          onChange={(e) => {
                                            handlePackageTwoDiscountPercentage(
                                              e,
                                            );
                                          }}
                                          style={{
                                            width: "100%",
                                            textAlign: "right",
                                          }}
                                        />
                                        <div>
                                          {props.getValidationMessage(
                                            props.requireMessage,
                                            props.pricingSettingObj
                                              .maxDiscountForQC,
                                            props.RecurringPricingInfo
                                              .DiscountPercentagePackageTwo,
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    {props.vatPercentage !== 0 &&
                                      props.visibleFieldsCustomTemp.vatRate && (
                                        <th></th>
                                      )}
                                    {props.vatPercentage !== 0 &&
                                      props.visibleFieldsCustomTemp.vat && (
                                        <th></th>
                                      )}
                                    {props.vatPercentage !== 0 &&
                                      props.visibleFieldsCustomTemp
                                        .feesIncVat && <th></th>}
                                    {props.visibleFieldsCustomTemp
                                      .serviceScope && <th></th>}
                                  </>
                                )}

                                {packageCount === 3 && (
                                  <>
                                    <td
                                      style={{
                                        width: "35%",
                                        padding: "0px",
                                        whiteSpace: "normal",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "flex-start",
                                        }}
                                      >
                                        <input
                                          className="input-text"
                                          type="text"
                                          placeholder="Discount (%)"
                                          value={props.RecurringPricingInfo.DiscountPercentagePackageThree?.toString()?.replace(
                                            /\B(?=(\d{3})+(?!\d))/g,
                                            ",",
                                          )}
                                          onChange={(e) => {
                                            handlePackageThreeDiscountPercentage(
                                              e,
                                            );
                                          }}
                                          style={{
                                            width: "100%",
                                            textAlign: "right",
                                          }}
                                        />
                                        <div>
                                          {props.getValidationMessage(
                                            props.requireMessage,
                                            props.pricingSettingObj
                                              .maxDiscountForQC,
                                            props.RecurringPricingInfo
                                              .DiscountPercentagePackageThree,
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                  </>
                                )}
                              </tr>
                            </>
                          )}

                          {/* NET TOTAL */}
                          <tr className="head-row">
                            <td className="tr-table-class font-14 text-white">
                              Net Total
                            </td>

                            {activeCustomPackageFooters.map(
                              (footer, packageIndex) => (
                                <React.Fragment
                                  key={`recurring-package-net-${packageIndex}`}
                                >
                                  {props.visibleFieldsCustomTemp?.fees && (
                                    <td className="tr-table-class font-14 text-white text-right">
                                      {props.formatValue(
                                        props.engagementObj?.DiscountLines
                                          ? footer.net
                                          : footer.finalNet,
                                        props.currencyID,
                                      )}
                                    </td>
                                  )}

                                  {hasCustomPackageVAT &&
                                    props.visibleFieldsCustomTemp?.vatRate && (
                                      <td className="tr-table-class font-14 text-white"></td>
                                    )}

                                  {hasCustomPackageVAT &&
                                    props.visibleFieldsCustomTemp?.vat && (
                                      <td className="tr-table-class font-14 text-white text-right">
                                        {props.formatValue(
                                          props.engagementObj?.DiscountLines
                                            ? footer.vat
                                            : footer.finalVat,
                                          props.currencyID,
                                        )}
                                      </td>
                                    )}

                                  {hasCustomPackageVAT &&
                                    props.visibleFieldsCustomTemp
                                      ?.feesIncVat && (
                                      <td className="tr-table-class font-14 text-white text-right">
                                        {props.formatValue(
                                          props.engagementObj?.DiscountLines
                                            ? footer.feesIncVat
                                            : footer.finalFeesIncVat,
                                          props.currencyID,
                                        )}
                                      </td>
                                    )}

                                  {props.visibleFieldsCustomTemp
                                    ?.serviceScope && <td></td>}
                                </React.Fragment>
                              ),
                            )}
                          </tr>

                          {/* DISCOUNT */}
                          {showCustomPackageDiscount && (
                            <tr className="head-grey-row">
                              <td className="tr-table-class font-14 text-white">
                                Discount
                              </td>

                              {activeCustomPackageFooters.map(
                                (footer, packageIndex) => (
                                  <React.Fragment
                                    key={`recurring-package-discount-${packageIndex}`}
                                  >
                                    {props.visibleFieldsCustomTemp?.fees && (
                                      <td className="tr-table-class font-14 text-white text-right">
                                        (-){" "}
                                        {props.formatValue(
                                          footer.discount,
                                          props.currencyID,
                                        )}
                                      </td>
                                    )}

                                    {hasCustomPackageVAT &&
                                      props.visibleFieldsCustomTemp
                                        ?.vatRate && (
                                        <td className="tr-table-class font-14 text-white"></td>
                                      )}

                                    {hasCustomPackageVAT &&
                                      props.visibleFieldsCustomTemp?.vat && (
                                        <td className="tr-table-class font-14 text-white text-right">
                                          (-){" "}
                                          {props.formatValue(
                                            footer.vatDiscount,
                                            props.currencyID,
                                          )}
                                        </td>
                                      )}

                                    {hasCustomPackageVAT &&
                                      props.visibleFieldsCustomTemp
                                        ?.feesIncVat && (
                                        <td className="tr-table-class font-14 text-white text-right">
                                          (-){" "}
                                          {props.formatValue(
                                            footer.feesIncVatDiscount,
                                            props.currencyID,
                                          )}
                                        </td>
                                      )}

                                    {props.visibleFieldsCustomTemp
                                      ?.serviceScope && <td></td>}
                                  </React.Fragment>
                                ),
                              )}
                            </tr>
                          )}

                          {/* GRAND TOTAL / DISCOUNTED TOTAL */}
                          {showCustomPackageDiscount && (
                            <tr className="head-row">
                              <td className="tr-table-class font-14 text-white">
                                {hasCustomPackageVAT
                                  ? "Grand Total"
                                  : "Discounted Total"}
                              </td>

                              {activeCustomPackageFooters.map(
                                (footer, packageIndex) => (
                                  <React.Fragment
                                    key={`recurring-package-final-${packageIndex}`}
                                  >
                                    {props.visibleFieldsCustomTemp?.fees && (
                                      <td className="tr-table-class font-14 text-white text-right">
                                        {props.formatValue(
                                          footer.finalNet,
                                          props.currencyID,
                                        )}
                                      </td>
                                    )}

                                    {hasCustomPackageVAT &&
                                      props.visibleFieldsCustomTemp
                                        ?.vatRate && (
                                        <td className="tr-table-class font-14 text-white"></td>
                                      )}

                                    {hasCustomPackageVAT &&
                                      props.visibleFieldsCustomTemp?.vat && (
                                        <td className="tr-table-class font-14 text-white text-right">
                                          {props.formatValue(
                                            footer.finalVat,
                                            props.currencyID,
                                          )}
                                        </td>
                                      )}

                                    {hasCustomPackageVAT &&
                                      props.visibleFieldsCustomTemp
                                        ?.feesIncVat && (
                                        <td className="tr-table-class font-14 text-white text-right">
                                          {props.formatValue(
                                            footer.finalFeesIncVat,
                                            props.currencyID,
                                          )}
                                        </td>
                                      )}

                                    {props.visibleFieldsCustomTemp
                                      ?.serviceScope && <td></td>}
                                  </React.Fragment>
                                ),
                              )}
                            </tr>
                          )}
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {props.selectedOneOffServiceList?.length !== 0 && (
            <div className="tab-content">
              <div className="tab-pane p-3 active">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="separator mb-2"></div>
                    <h6>One-Off Services</h6>
                    <div className="separator mb-3"></div>

                    {/* <div className="row fieldset">
                    <div className="col-lg-2 text-lg-right">
                      <label className="fieldset-label">Original Price ()</label>
                    </div>
                    <div className="col-lg-4">
                      <input
                        readonly=""
                        type="text"
                        class="input-text"
                        value={props.OneOffPricingInfo.OriginalPrice.toString().replace(
                          /\B(?=(\d{3})+(?!\d))/g,
                          ","
                        )}
                      />
                    </div>
                  </div> */}
                    <div class="row" id="OneOff_Default">
                      <div class="col-lg-2 mb-1 col-md-2 col-sm-12 mt-2 text-md-end">
                        <div class="mb-1 text-md-end">
                          {packageCount == 1 && (
                            <>
                              <label class="form-label">Discount (%)</label>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="col-lg-4">
                        {packageCount == 1 && (
                          <>
                            <input
                              class="input-text"
                              type="text"
                              placeholder="Discount (%)"
                              value={props.OneOffPricingInfo.DiscountPercentagePackageOne?.toString()?.replace(
                                /\B(?=(\d{3})+(?!\d))/g,
                                ",",
                              )}
                              onChange={(e) => {
                                handleOneOffPackageOneDiscountPercentage(e);
                              }}
                            />
                            {props.getValidationMessage(
                              props.requireMessage,
                              props.pricingSettingObj.maxDiscountForQC,
                              props.OneOffPricingInfo
                                .DiscountPercentagePackageOne,
                            )}
                          </>
                        )}
                        {/* {props.requireMessage &&
                          isNaN(props.OneOffPricingInfo.DefaultDiscount) && (
                            <span className="validation">Invalid discount</span>
                          )}

                        {props.requireMessage &&
                          props.pricingSettingObj.maxDiscountForQC !== "" &&
                          props.pricingSettingObj.maxDiscountForQC !== null &&
                          props.pricingSettingObj.maxDiscountForQC !==
                          undefined &&
                          props.pricingSettingObj.maxDiscountForQC !== 0 &&
                          props.OneOffPricingInfo.DefaultDiscount !== "" &&
                          props.OneOffPricingInfo.DefaultDiscount !== null &&
                          props.OneOffPricingInfo.DefaultDiscount !== undefined &&
                          (Number(props.OneOffPricingInfo.DefaultDiscount) <
                            -999.0 ||
                            Number(props.OneOffPricingInfo.DefaultDiscount) >
                            props.pricingSettingObj.maxDiscountForQC) && (
                            <>
                              <span className="validation">
                                The discount should be between -999.00% and{" "}
                                {
                                  props.pricingSettingObj.maxDiscountForQC
                                }
                                %.
                              </span>
                              <button
                                style={{
                                  fontSize: "12px",
                                  border: "none",
                                  background: "transparent",
                                  color: "#626ED4",
                                }}
                                className="float-sm-end"
                                data-bs-toggle="modal"
                                data-bs-target="#pricingModel"
                              >
                                + Pricing Setting
                              </button>
                            </>
                          )}
                        {props.requireMessage &&
                          (props.pricingSettingObj.maxDiscountForQC == "" ||
                            props.pricingSettingObj.maxDiscountForQC == null ||
                            props.pricingSettingObj.maxDiscountForQC ==
                            undefined) &&
                          props.OneOffPricingInfo.DefaultDiscount !== "" &&
                          props.OneOffPricingInfo.DefaultDiscount !== null &&
                          props.OneOffPricingInfo.DefaultDiscount !== undefined &&
                          (Number(props.OneOffPricingInfo.DefaultDiscount) <=
                            -999.0 ||
                            Number(props.OneOffPricingInfo.DefaultDiscount) >=
                            100) && (
                            <>
                              <span className="validation">
                                The discount should be between -999.00% and 100%.
                              </span>
                            </>
                          )} */}
                      </div>
                    </div>
                    <div className="mb-3"></div>

                    {props.selectedTemplateID === 0 ? (
                      <div
                        style={{ marginTop: "0px" }}
                        className="table-responsive"
                      >
                        <table
                          class="table align-middle table-nowrap"
                          style={{ width: "100%" }}
                        >
                          <thead className="table-light table-header-font">
                            <tr className="head-row">
                              <td className="tr-table-class font-14 text-white">
                                Services
                              </td>

                              {props.selectedPackagesList.map((pkg, index) => (
                                <td
                                  key={index}
                                  className="tr-table-class font-14 text-white text-right"
                                >
                                  {pkg.servicePackageName.length > 50 ? (
                                    <Tooltip title={pkg.servicePackageName}>
                                      {pkg.servicePackageName
                                        .substring(0, 50)
                                        .toLowerCase()
                                        .replace(/\b\w/g, (l) =>
                                          l.toUpperCase(),
                                        ) + "..."}
                                    </Tooltip>
                                  ) : pkg.servicePackageName.length > 50 ? (
                                    <Tooltip title={pkg.servicePackageName}>
                                      {pkg.servicePackageName.substring(0, 50) +
                                        "..."}
                                    </Tooltip>
                                  ) : (
                                    pkg.servicePackageName
                                  )}
                                </td>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {props.selectedOneOffServiceList.map(
                              (service, index) => {
                                return (
                                  <>
                                    <tr className="a-la-carte-services-review-head-row">
                                      <th colSpan={1 + packageCount}>
                                        {service.serviceCatName}
                                      </th>
                                    </tr>
                                    {service.servicesList.map(
                                      (subService, subIndex) => (
                                        <tr
                                          key={subIndex}
                                          className={` ${
                                            subService?.isAdditionalService !==
                                            null
                                              ? "bg-info  text-white"
                                              : ""
                                          }`}
                                        >
                                          <td>
                                            <div>
                                              {/* {subService.serviceName.length > 45
                                              ? subService.serviceName
                                                .substring(0, 45)
                                                .toLowerCase()
                                                .replace(/\b\w/g, (l) =>
                                                  l.toUpperCase()
                                                ) + "..."
                                              : 
                                              <EditableCell
                                                  value={subService.serviceName}
                                                  onSave={(newName) => {
                                                    // Update the service name in your state
                                                    props.setSelectedOneOffServiceList(prevList => {
                                                      const newList = [...prevList];
                                                      // Find the correct service and update it
                                                      const serviceIndex = prevList.findIndex(s => s === service);
                                                      newList[serviceIndex].servicesList[subIndex].serviceName = newName;
                                                      return newList;
                                                    });
                                                    // For example: call a prop or update local data here
                                                  }}
                                                />
                                              } */}
                                              <EditableCell
                                                value={subService.serviceName}
                                                displayValue={
                                                  subService.serviceName
                                                    .length > 45
                                                    ? subService.serviceName
                                                        .substring(0, 45)
                                                        .toLowerCase()
                                                        .replace(/\b\w/g, (l) =>
                                                          l.toUpperCase(),
                                                        ) + "..."
                                                    : undefined
                                                }
                                                onSave={(newName) => {
                                                  props.setSelectedOneOffServiceList(
                                                    (prevList) => {
                                                      const newList = [
                                                        ...prevList,
                                                      ];
                                                      const serviceIndex =
                                                        prevList.findIndex(
                                                          (s) => s === service,
                                                        );
                                                      newList[
                                                        serviceIndex
                                                      ].servicesList[
                                                        subIndex
                                                      ].serviceName = newName;
                                                      return newList;
                                                    },
                                                  );
                                                }}
                                              />
                                            </div>
                                            {props.requireMessage &&
                                              subService.serviceName.trim() ===
                                                "" && (
                                                <div>
                                                  <label className="text-danger">
                                                    Please enter a valid service
                                                    name
                                                  </label>
                                                </div>
                                              )}
                                            <div className="package-variables"></div>
                                          </td>

                                          <td className="text-right">
                                            <div className="flex-end-item">
                                              {props.engagementObj.feeTypeId ===
                                              1 ? (
                                                <div className="flex-end-item">
                                                  {(subService.packageOneValue ===
                                                    0 ||
                                                    subService.packageOneValue ===
                                                      null) &&
                                                  !subService.servicePackageIDs.some(
                                                    (item) =>
                                                      item ==
                                                      props
                                                        .selectedPackagesList[0]
                                                        ?.servicePackageID,
                                                  ) ? (
                                                    <span className="fa fa-times"></span>
                                                  ) : !subService?.servicePackageIDs.includes(
                                                      subService.packageOneID,
                                                    ) ? (
                                                    <span className="fa fa-times"></span>
                                                  ) : (
                                                    ` ${props.formatValue(
                                                      subService.packageOneValue,
                                                      props.currencyID,
                                                    )}`
                                                  )}
                                                </div>
                                              ) : Number(
                                                  subService.packageOneValue,
                                                ) !== null &&
                                                subService?.servicePackageIDs.includes(
                                                  subService.packageOneID,
                                                ) ? (
                                                <span className="fa fa-check"></span>
                                              ) : (
                                                <span className="fa fa-times"></span>
                                              )}
                                            </div>
                                          </td>
                                          {packageCount >= 2 && (
                                            <td className="text-right">
                                              <div className="flex-end-item">
                                                {props.engagementObj
                                                  .feeTypeId === 1 ? (
                                                  <div className="flex-end-item">
                                                    {(subService.packageTwoValue ===
                                                      0 ||
                                                      subService.packageTwoValue ===
                                                        null) &&
                                                    !subService.servicePackageIDs.some(
                                                      (item) =>
                                                        item ==
                                                        props
                                                          .selectedPackagesList[1]
                                                          ?.servicePackageID,
                                                    ) ? (
                                                      <span className="fa fa-times"></span>
                                                    ) : !subService?.servicePackageIDs.includes(
                                                        subService.packageTwoID,
                                                      ) ? (
                                                      <span className="fa fa-times"></span>
                                                    ) : (
                                                      ` ${props.formatValue(
                                                        subService.packageTwoValue,
                                                        props.currencyID,
                                                      )}`
                                                    )}
                                                  </div>
                                                ) : Number(
                                                    subService.packageTwoValue,
                                                  ) !== null &&
                                                  subService?.servicePackageIDs.includes(
                                                    subService.packageTwoID,
                                                  ) ? (
                                                  <span className="fa fa-check"></span>
                                                ) : (
                                                  <span className="fa fa-times"></span>
                                                )}
                                              </div>
                                            </td>
                                          )}
                                          {packageCount === 3 && (
                                            <td className="text-right">
                                              <div className="flex-end-item">
                                                {props.engagementObj
                                                  .feeTypeId === 1 ? (
                                                  <div className="flex-end-item">
                                                    {(subService.packageThreeValue ===
                                                      0 ||
                                                      subService.packageThreeValue ===
                                                        null) &&
                                                    !subService.servicePackageIDs.some(
                                                      (item) =>
                                                        item ==
                                                        props
                                                          .selectedPackagesList[2]
                                                          ?.servicePackageID,
                                                    ) ? (
                                                      <span className="fa fa-times"></span>
                                                    ) : !subService?.servicePackageIDs.includes(
                                                        subService.packageThreeID,
                                                      ) ? (
                                                      <span className="fa fa-times"></span>
                                                    ) : (
                                                      ` ${props.formatValue(
                                                        subService.packageThreeValue,
                                                        props.currencyID,
                                                      )}`
                                                    )}
                                                  </div>
                                                ) : Number(
                                                    subService.packageThreeValue,
                                                  ) !== null &&
                                                  subService?.servicePackageIDs.includes(
                                                    subService.packageThreeID,
                                                  ) ? (
                                                  <span className="fa fa-check"></span>
                                                ) : (
                                                  <span className="fa fa-times"></span>
                                                )}
                                              </div>
                                            </td>
                                          )}
                                        </tr>
                                      ),
                                    )}
                                  </>
                                );
                              },
                            )}
                          </tbody>
                          {packageCount > 1 && (
                            <>
                              <tr id="OneOff_DefaultWithPackages">
                                <td
                                  style={{
                                    padding: "8px",
                                  }}
                                >
                                  Discount (%)
                                  {/* <div className="package-variables"></div> */}
                                </td>
                                <td
                                  style={{
                                    width: "35%",
                                    padding: "0px",
                                    whiteSpace: "normal",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "flex-start",
                                    }}
                                  >
                                    <input
                                      className="input-text"
                                      type="text" // Change type to number
                                      placeholder="Discount (%)"
                                      value={props.OneOffPricingInfo.DiscountPercentagePackageOne?.toString()?.replace(
                                        /\B(?=(\d{3})+(?!\d))/g,
                                        ",",
                                      )}
                                      onChange={(e) => {
                                        handleOneOffPackageOneDiscountPercentage(
                                          e,
                                        );
                                      }}
                                      style={{
                                        width: "100%",
                                        textAlign: "right",
                                      }}
                                    />
                                    <div>
                                      {props.getValidationMessage(
                                        props.requireMessage,
                                        props.pricingSettingObj
                                          .maxDiscountForQC,
                                        props.OneOffPricingInfo
                                          .DiscountPercentagePackageOne,
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {packageCount >= 2 && (
                                  <td
                                    style={{
                                      width: "35%",
                                      padding: "0px",
                                      whiteSpace: "normal",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-start",
                                      }}
                                    >
                                      <input
                                        className="input-text"
                                        type="text" // Change type to number
                                        placeholder="Discount (%)"
                                        value={props.OneOffPricingInfo.DiscountPercentagePackageTwo?.toString()?.replace(
                                          /\B(?=(\d{3})+(?!\d))/g,
                                          ",",
                                        )}
                                        onChange={(e) => {
                                          handleOneOffPackageTwoDiscountPercentage(
                                            e,
                                          );
                                        }}
                                        style={{
                                          width: "100%",
                                          textAlign: "right",
                                        }}
                                      />
                                      <div>
                                        {props.getValidationMessage(
                                          props.requireMessage,
                                          props.pricingSettingObj
                                            .maxDiscountForQC,
                                          props.OneOffPricingInfo
                                            .DiscountPercentagePackageTwo,
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                )}

                                {packageCount === 3 && (
                                  <td
                                    style={{
                                      width: "35%",
                                      padding: "0px",
                                      whiteSpace: "normal",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-start",
                                      }}
                                    >
                                      <input
                                        className="input-text"
                                        type="text" // Change type to number
                                        placeholder="Discount (%)"
                                        value={props.OneOffPricingInfo.DiscountPercentagePackageThree?.toString()?.replace(
                                          /\B(?=(\d{3})+(?!\d))/g,
                                          ",",
                                        )}
                                        onChange={(e) => {
                                          handleOneOffPackageThreeDiscountPercentage(
                                            e,
                                          );
                                        }}
                                        style={{
                                          width: "100%",
                                          textAlign: "right",
                                        }}
                                      />
                                      <div>
                                        {props.getValidationMessage(
                                          props.requireMessage,
                                          props.pricingSettingObj
                                            .maxDiscountForQC,
                                          props.OneOffPricingInfo
                                            .DiscountPercentagePackageThree,
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            </>
                          )}
                          <tr className="head-row">
                            <td className="tr-table-class font-14 text-white">
                              Net Total
                            </td>
                            <td className="tr-table-class font-14 text-white text-right">
                              {" "}
                              {
                                totalOnePackageValueOneOff <
                                  Number(
                                    props.OneOffPricingInfo
                                      .packageOneDisCountedTotal,
                                  ) ||
                                (Number(
                                  props.OneOffPricingInfo.packageOneDisCount,
                                ) > 0 &&
                                  !props.engagementObj.DiscountLines)
                                  ? props.formatValue(
                                      props.OneOffPricingInfo
                                        .packageOneDisCountedTotal,
                                      props.currencyID,
                                    )
                                  : // Number(totalOnePackageValueOneOff)
                                    //     .toFixed(2)
                                    //     .toString()
                                    //     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    props.formatValue(
                                      totalOnePackageValueOneOff,
                                      props.currencyID,
                                    )
                                // Number(
                                //     props.OneOffPricingInfo
                                //       .packageOneDisCountedTotal
                                //   )
                                //     .toFixed(2)
                                //     .toString()
                                //     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                              }
                            </td>
                            {packageCount >= 2 && (
                              <td className="tr-table-class font-14 text-white text-right">
                                {" "}
                                {
                                  totalTwoPackageValueOneOff <
                                    Number(
                                      props.OneOffPricingInfo
                                        .packageTwoDisCountedTotal,
                                    ) ||
                                  (Number(
                                    props.OneOffPricingInfo.packageTwoDisCount,
                                  ) > 0 &&
                                    !props.engagementObj.DiscountLines)
                                    ? props.formatValue(
                                        props.OneOffPricingInfo
                                          .packageTwoDisCountedTotal,
                                        props.currencyID,
                                      )
                                    : // Number(totalOnePackageValueOneOff)
                                      //     .toFixed(2)
                                      //     .toString()
                                      //     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                      props.formatValue(
                                        totalTwoPackageValueOneOff,
                                        props.currencyID,
                                      )
                                  // Number(
                                  //     props.OneOffPricingInfo
                                  //       .packageOneDisCountedTotal
                                  //   )
                                  //     .toFixed(2)
                                  //     .toString()
                                  //     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                }
                              </td>
                            )}{" "}
                            {packageCount === 3 && (
                              <td className="tr-table-class font-14 text-white text-right">
                                {" "}
                                {
                                  totalThreePackageValueOneOff <
                                    Number(
                                      props.OneOffPricingInfo
                                        .packageThreeDisCountedTotal,
                                    ) ||
                                  (Number(
                                    props.OneOffPricingInfo
                                      .packageThreeDisCount,
                                  ) > 0 &&
                                    !props.engagementObj.DiscountLines)
                                    ? props.formatValue(
                                        props.OneOffPricingInfo
                                          .packageThreeDisCountedTotal,
                                        props.currencyID,
                                      )
                                    : // Number(totalOnePackageValueOneOff)
                                      //     .toFixed(2)
                                      //     .toString()
                                      //     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                      props.formatValue(
                                        totalThreePackageValueOneOff,
                                        props.currencyID,
                                      )
                                  // Number(
                                  //     props.OneOffPricingInfo
                                  //       .packageOneDisCountedTotal
                                  //   )
                                  //     .toFixed(2)
                                  //     .toString()
                                  //     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                }
                              </td>
                            )}
                          </tr>

                          {(Number(
                            props.OneOffPricingInfo.packageThreeDisCount,
                          ) > 0 ||
                            Number(props.OneOffPricingInfo.packageOneDisCount) >
                              0 ||
                            Number(props.OneOffPricingInfo.packageTwoDisCount) >
                              0) &&
                            props.engagementObj.DiscountLines && (
                              <>
                                <tr className="head-grey-row">
                                  <td className="tr-table-class font-14 text-white">
                                    Discount
                                  </td>
                                  <td className="tr-table-class font-14 text-white text-right">
                                    (-){" "}
                                    {props.formatValue(
                                      props.OneOffPricingInfo
                                        .packageOneDisCount,
                                      props.currencyID,
                                    )}
                                  </td>
                                  {packageCount >= 2 && (
                                    <td className="tr-table-class font-14 text-white text-right">
                                      (-){" "}
                                      {props.formatValue(
                                        props.OneOffPricingInfo
                                          .packageTwoDisCount,
                                        props.currencyID,
                                      )}
                                    </td>
                                  )}
                                  {packageCount == 3 && (
                                    <td className="tr-table-class font-14 text-white text-right">
                                      (-){" "}
                                      {props.formatValue(
                                        props.OneOffPricingInfo
                                          .packageThreeDisCount,
                                        props.currencyID,
                                      )}
                                    </td>
                                  )}
                                </tr>
                                <tr className="head-row">
                                  <td className="tr-table-class font-14 text-white">
                                    Discounted Total
                                  </td>
                                  <td className="tr-table-class font-14 text-white text-right">
                                    {" "}
                                    {props.formatValue(
                                      props.OneOffPricingInfo
                                        .packageOneDisCountedTotal,
                                      props.currencyID,
                                    )}
                                  </td>
                                  {packageCount >= 2 && (
                                    <td className="tr-table-class font-14 text-white text-right">
                                      {" "}
                                      {props.formatValue(
                                        props.OneOffPricingInfo
                                          .packageTwoDisCountedTotal,
                                        props.currencyID,
                                      )}
                                    </td>
                                  )}
                                  {packageCount == 3 && (
                                    <td className="tr-table-class font-14 text-white text-right">
                                      {" "}
                                      {props.formatValue(
                                        props.OneOffPricingInfo
                                          .packageThreeDisCountedTotal,
                                        props.currencyID,
                                      )}
                                    </td>
                                  )}
                                </tr>
                              </>
                            )}
                          {props.vatPercentage && (
                            <>
                              <tr class="head-grey-row">
                                <td className="tr-table-class font-14 text-white">
                                  {props.taxName}
                                </td>
                                <td className="tr-table-class font-14 text-white text-right">
                                  {" "}
                                  {
                                    props.formatValue(
                                      props.OneOffPricingInfo
                                        .PackageOneVaTPrice,
                                      props.currencyID,
                                    )
                                    // Number(
                                    //   props.OneOffPricingInfo.PackageOneVaTPrice
                                    // )
                                    //   .toFixed(2)
                                    //   .toString()
                                    //   .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                  }
                                </td>
                                {packageCount >= 2 && (
                                  <td className="tr-table-class text-white text-right">
                                    {" "}
                                    {
                                      props.formatValue(
                                        props.OneOffPricingInfo
                                          .PackageTwoVaTPrice,
                                        props.currencyID,
                                      )
                                      // Number(
                                      //   props.OneOffPricingInfo.PackageTwoVaTPrice
                                      // )
                                      //   .toFixed(2)
                                      //   .toString()
                                      //   .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    }
                                  </td>
                                )}
                                {packageCount === 3 && (
                                  <td className="tr-table-class text-white text-right">
                                    {" "}
                                    {
                                      props.formatValue(
                                        props.OneOffPricingInfo
                                          .PackageThreeVaTPrice,
                                        props.currencyID,
                                      )
                                      // Number(
                                      //   props.OneOffPricingInfo.PackageThreeVaTPrice
                                      // )
                                      //   .toFixed(2)
                                      //   .toString()
                                      //   .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    }
                                  </td>
                                )}
                              </tr>
                              <tr className="head-row">
                                <td className="tr-table-class font-14 text-white">
                                  Grand Total
                                </td>
                                <td className="tr-table-class font-14 text-white text-right">
                                  {" "}
                                  {
                                    props.formatValue(
                                      props.OneOffPricingInfo
                                        .PackageOneGrandTotal,
                                      props.currencyID,
                                    )
                                    // Number(
                                    //   props.OneOffPricingInfo.PackageOneGrandTotal
                                    // )
                                    //   .toFixed(2)
                                    //   .toString()
                                    //   .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                  }
                                </td>
                                {packageCount >= 2 && (
                                  <td className="tr-table-class font-14 text-white text-right">
                                    {" "}
                                    {
                                      props.formatValue(
                                        props.OneOffPricingInfo
                                          .PackageTwoGrandTotal,
                                        props.currencyID,
                                      )
                                      // Number(
                                      //   props.OneOffPricingInfo.PackageTwoGrandTotal
                                      // )
                                      //   .toFixed(2)
                                      //   .toString()
                                      //   .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    }
                                  </td>
                                )}
                                {packageCount == 3 && (
                                  <td className="tr-table-class font-14 text-white text-right">
                                    {" "}
                                    {
                                      props.formatValue(
                                        props.OneOffPricingInfo
                                          .PackageThreeGrandTotal,
                                        props.currencyID,
                                      )
                                      // Number(
                                      //   props.OneOffPricingInfo.PackageThreeGrandTotal
                                      // )
                                      //   .toFixed(2)
                                      //   .toString()
                                      //   .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                    }
                                  </td>
                                )}
                              </tr>
                            </>
                          )}
                        </table>
                      </div>
                    ) : (
                      <div
                        style={{ marginTop: "0px" }}
                        className="table-responsive"
                      >
                        {/* <div
                                                         dangerouslySetInnerHTML={{
                                                           __html: currentPricingTableDesignRecurring,
                                                         }}
                                                       /> */}
                        <table
                          class="table align-middle table-nowrap"
                          style={{ width: "100%" }}
                        >
                          <thead className="table-light table-header-font">
                            <tr className="head-row">
                              <td></td>
                              {props.selectedPackagesList.map((pkg, index) => (
                                <>
                                  <td
                                    key={index}
                                    className="tr-table-class font-14 text-white text-right"
                                  >
                                    {pkg.servicePackageName.length > 10 ? (
                                      <Tooltip title={pkg.servicePackageName}>
                                        {pkg.servicePackageName
                                          .substring(0, 10)
                                          .toLowerCase()
                                          .replace(/\b\w/g, (l) =>
                                            l.toUpperCase(),
                                          ) + "..."}
                                      </Tooltip>
                                    ) : pkg.servicePackageName.length > 10 ? (
                                      <Tooltip title={pkg.servicePackageName}>
                                        {pkg.servicePackageName.substring(
                                          0,
                                          10,
                                        ) + "..."}
                                      </Tooltip>
                                    ) : (
                                      pkg.servicePackageName
                                    )}
                                  </td>
                                  {props.vatPercentage !== 0 &&
                                    props.visibleFieldsCustomTemp.vatRate && (
                                      <td></td>
                                    )}
                                  {props.vatPercentage !== 0 &&
                                    props.visibleFieldsCustomTemp.vat && (
                                      <td></td>
                                    )}
                                  {props.vatPercentage !== 0 &&
                                    props.visibleFieldsCustomTemp
                                      .feesIncVat && <td></td>}
                                  {props.visibleFieldsCustomTemp
                                    .serviceScope && <td></td>}
                                </>
                              ))}
                            </tr>
                            <tr className="head-row">
                              {props.visibleFieldsCustomTemp.serviceName && (
                                <td className="tr-table-class font-14 text-white">
                                  Services
                                </td>
                              )}
                              {props.selectedPackagesList.map((pkg, index) => (
                                <>
                                  {props.visibleFieldsCustomTemp.fees && (
                                    <th
                                      className="tr-table-class text-white text-right"
                                      style={{ width: "16.66%" }}
                                    >
                                      Fees ({props.currencySymbol})
                                    </th>
                                  )}
                                  {props.vatPercentage !== 0 &&
                                    props.visibleFieldsCustomTemp.vatRate && (
                                      <th
                                        className="tr-table-class text-white text-right"
                                        style={{ width: "16.66%" }}
                                      >
                                        {props.taxName} Rate
                                      </th>
                                    )}
                                  {props.vatPercentage !== 0 &&
                                    props.visibleFieldsCustomTemp.vat && (
                                      <th
                                        className="tr-table-class text-white text-right"
                                        style={{ width: "16.66%" }}
                                      >
                                        {props.taxName} ({props.currencySymbol})
                                      </th>
                                    )}
                                  {props.vatPercentage !== 0 &&
                                    props.visibleFieldsCustomTemp
                                      .feesIncVat && (
                                      <th
                                        className="tr-table-class text-white text-right"
                                        style={{ width: "16.66%" }}
                                      >
                                        Fees inc {props.taxName} (
                                        {props.currencySymbol})
                                      </th>
                                    )}
                                  {props.visibleFieldsCustomTemp
                                    .serviceScope && (
                                    <th
                                      className="tr-table-class text-white text-right"
                                      style={{ width: "16.66%" }}
                                    >
                                      Service Scope
                                    </th>
                                  )}
                                </>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {props.selectedOneOffServiceList.map(
                              (service, index) => {
                                return (
                                  <>
                                    <tr className="a-la-carte-services-review-head-row">
                                      {props.visibleFieldsCustomTemp
                                        .serviceName && (
                                        <th colSpan={1 + packageCount}>
                                          {service.serviceCatName}
                                        </th>
                                      )}

                                      {/* <th></th> */}
                                      {props.visibleFieldsCustomTemp.fees && (
                                        <th></th>
                                      )}
                                      {props.vatPercentage !== 0 &&
                                        props.visibleFieldsCustomTemp
                                          .vatRate && <th></th>}
                                      {props.vatPercentage !== 0 &&
                                        props.visibleFieldsCustomTemp.vat && (
                                          <th></th>
                                        )}
                                      {props.vatPercentage !== 0 &&
                                        props.visibleFieldsCustomTemp
                                          .feesIncVat && <th></th>}
                                      {props.visibleFieldsCustomTemp
                                        .serviceScope && <th></th>}
                                      {packageCount >= 2 && (
                                        <>
                                          {props.visibleFieldsCustomTemp
                                            .fees && <th></th>}
                                          {props.vatPercentage !== 0 &&
                                            props.visibleFieldsCustomTemp
                                              .vatRate && <th></th>}
                                          {props.vatPercentage !== 0 &&
                                            props.visibleFieldsCustomTemp
                                              .vat && <th></th>}
                                          {props.vatPercentage !== 0 &&
                                            props.visibleFieldsCustomTemp
                                              .feesIncVat && <th></th>}
                                          {props.visibleFieldsCustomTemp
                                            .serviceScope && <th></th>}
                                        </>
                                      )}

                                      {packageCount === 3 && (
                                        <>
                                          {props.visibleFieldsCustomTemp
                                            .fees && <th></th>}
                                          {props.vatPercentage !== 0 &&
                                            props.visibleFieldsCustomTemp
                                              .vatRate && <th></th>}
                                          {props.vatPercentage !== 0 &&
                                            props.visibleFieldsCustomTemp
                                              .vat && <th></th>}
                                          {props.vatPercentage !== 0 &&
                                            props.visibleFieldsCustomTemp
                                              .feesIncVat && <th></th>}
                                          {props.visibleFieldsCustomTemp
                                            .serviceScope && <th></th>}
                                        </>
                                      )}
                                    </tr>
                                    {service.servicesList.map(
                                      (subService, subIndex) => {
                                        const packageRows =
                                          props.selectedPackagesList.map(
                                            (_, packageIndex) =>
                                              calculateOneOffPackageRow({
                                                service: subService,
                                                packageIndex,
                                                fallbackVatRate:
                                                  props.vatPercentage ?? 0,
                                              }),
                                          );

                                        const driverList =
                                          getServiceScopeDriverList(subService);

                                        return (
                                          <tr
                                            key={subIndex}
                                            className={
                                              subService?.isAdditionalService !==
                                              null
                                                ? "bg-info text-white"
                                                : ""
                                            }
                                          >
                                            {/* SERVICE NAME */}
                                            {props.visibleFieldsCustomTemp
                                              .serviceName && (
                                              <td>{subService.serviceName}</td>
                                            )}

                                            {/* PACKAGE COLUMNS */}
                                            {packageRows.map(
                                              (packageRow, packageIndex) => (
                                                <React.Fragment
                                                  key={packageIndex}
                                                >
                                                  {/* FEES */}
                                                  {props.visibleFieldsCustomTemp
                                                    .fees && (
                                                    <td className="text-right">
                                                      {packageRow.isIncluded ? (
                                                        props.engagementObj
                                                          .feeTypeId === 1 ? (
                                                          props.formatValue(
                                                            packageRow.price,
                                                            props.currencyID,
                                                          )
                                                        ) : (
                                                          <span className="fa fa-check"></span>
                                                        )
                                                      ) : (
                                                        <span className="fa fa-times"></span>
                                                      )}

                                                      {subService?.isAdditionalService !==
                                                        null && (
                                                        <input
                                                          style={{
                                                            marginLeft: "5px",
                                                          }}
                                                          type="checkbox"
                                                          checked={
                                                            packageRow.isIncluded
                                                          }
                                                          disabled={
                                                            subService
                                                              .servicePackageIDs
                                                              ?.length === 1 &&
                                                            packageRow.isIncluded
                                                          }
                                                        />
                                                      )}
                                                    </td>
                                                  )}

                                                  {/* VAT RATE */}
                                                  {Number(props.vatPercentage) >
                                                    0 &&
                                                    props
                                                      .visibleFieldsCustomTemp
                                                      .vatRate && (
                                                      <td className="text-right">
                                                        {packageRow.isIncluded ? (
                                                          `${packageRow.vatRate}%`
                                                        ) : (
                                                          <span className="fa fa-times"></span>
                                                        )}
                                                      </td>
                                                    )}

                                                  {/* VAT */}
                                                  {Number(props.vatPercentage) >
                                                    0 &&
                                                    props
                                                      .visibleFieldsCustomTemp
                                                      .vat && (
                                                      <td className="text-right">
                                                        {packageRow.isIncluded ? (
                                                          props.formatValue(
                                                            packageRow.vat,
                                                            props.currencyID,
                                                          )
                                                        ) : (
                                                          <span className="fa fa-times"></span>
                                                        )}
                                                      </td>
                                                    )}

                                                  {/* FEES INC VAT */}
                                                  {Number(props.vatPercentage) >
                                                    0 &&
                                                    props
                                                      .visibleFieldsCustomTemp
                                                      .feesIncVat && (
                                                      <td className="text-right">
                                                        {packageRow.isIncluded ? (
                                                          props.formatValue(
                                                            packageRow.feesIncVat,
                                                            props.currencyID,
                                                          )
                                                        ) : (
                                                          <span className="fa fa-times"></span>
                                                        )}
                                                      </td>
                                                    )}

                                                  {/* SERVICE SCOPE */}
                                                  {props.visibleFieldsCustomTemp
                                                    .serviceScope && (
                                                    <td className="text-right">
                                                      {packageRow.isIncluded &&
                                                      driverList.length > 0
                                                        ? driverList
                                                            .filter(
                                                              (d) =>
                                                                d.driverValue !==
                                                                null,
                                                            )
                                                            .map(
                                                              (d, i, array) => (
                                                                <div key={i}>
                                                                  {d.driverName}
                                                                  {" = "}
                                                                  {
                                                                    d.driverValue
                                                                  }

                                                                  {i !==
                                                                  array.length -
                                                                    1
                                                                    ? ", "
                                                                    : ""}
                                                                </div>
                                                              ),
                                                            )
                                                        : "-"}
                                                    </td>
                                                  )}
                                                </React.Fragment>
                                              ),
                                            )}
                                          </tr>
                                        );
                                      },
                                    )}
                                  </>
                                );
                              },
                            )}
                          </tbody>
                          {packageCount > 1 && (
                            <>
                              <tr id="recurring_DefaultWithPackages">
                                <td
                                  style={{
                                    padding: "8px",
                                  }}
                                >
                                  Discount (%)
                                </td>

                                <td
                                  style={{
                                    width: "35%",
                                    padding: "0px",
                                    whiteSpace: "normal",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "flex-start",
                                    }}
                                  >
                                    <input
                                      className="input-text"
                                      type="text"
                                      placeholder="Discount (%)"
                                      value={props.OneOffPricingInfo.DiscountPercentagePackageOne?.toString()?.replace(
                                        /\B(?=(\d{3})+(?!\d))/g,
                                        ",",
                                      )}
                                      onChange={(e) => {
                                        handleOneOffPackageOneDiscountPercentage(
                                          e,
                                        );
                                      }}
                                      style={{
                                        width: "100%",
                                        textAlign: "right",
                                      }}
                                    />
                                    <div>
                                      {props.getValidationMessage(
                                        props.requireMessage,
                                        props.pricingSettingObj
                                          .maxDiscountForQC,
                                        props.OneOffPricingInfo
                                          .DiscountPercentagePackageOne,
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {props.vatPercentage !== 0 &&
                                  props.visibleFieldsCustomTemp.vatRate && (
                                    <th></th>
                                  )}
                                {props.vatPercentage !== 0 &&
                                  props.visibleFieldsCustomTemp.vat && (
                                    <th></th>
                                  )}
                                {props.vatPercentage !== 0 &&
                                  props.visibleFieldsCustomTemp.feesIncVat && (
                                    <th></th>
                                  )}
                                {props.visibleFieldsCustomTemp.serviceScope && (
                                  <th></th>
                                )}

                                {packageCount >= 2 && (
                                  <>
                                    <td
                                      style={{
                                        width: "35%",
                                        padding: "0px",
                                        whiteSpace: "normal",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "flex-start",
                                        }}
                                      >
                                        <input
                                          className="input-text"
                                          type="text"
                                          placeholder="Discount (%)"
                                          value={props.OneOffPricingInfo.DiscountPercentagePackageTwo?.toString()?.replace(
                                            /\B(?=(\d{3})+(?!\d))/g,
                                            ",",
                                          )}
                                          onChange={(e) => {
                                            handleOneOffPackageTwoDiscountPercentage(
                                              e,
                                            );
                                          }}
                                          style={{
                                            width: "100%",
                                            textAlign: "right",
                                          }}
                                        />
                                        <div>
                                          {props.getValidationMessage(
                                            props.requireMessage,
                                            props.pricingSettingObj
                                              .maxDiscountForQC,
                                            props.OneOffPricingInfo
                                              .DiscountPercentagePackageTwo,
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    {props.vatPercentage !== 0 &&
                                      props.visibleFieldsCustomTemp.vatRate && (
                                        <th></th>
                                      )}
                                    {props.vatPercentage !== 0 &&
                                      props.visibleFieldsCustomTemp.vat && (
                                        <th></th>
                                      )}
                                    {props.vatPercentage !== 0 &&
                                      props.visibleFieldsCustomTemp
                                        .feesIncVat && <th></th>}
                                    {props.visibleFieldsCustomTemp
                                      .serviceScope && <th></th>}
                                  </>
                                )}

                                {packageCount === 3 && (
                                  <>
                                    <td
                                      style={{
                                        width: "35%",
                                        padding: "0px",
                                        whiteSpace: "normal",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "flex-start",
                                        }}
                                      >
                                        <input
                                          className="input-text"
                                          type="text"
                                          placeholder="Discount (%)"
                                          value={props.OneOffPricingInfo.DiscountPercentagePackageThree?.toString()?.replace(
                                            /\B(?=(\d{3})+(?!\d))/g,
                                            ",",
                                          )}
                                          onChange={(e) => {
                                            handleOneOffPackageThreeDiscountPercentage(
                                              e,
                                            );
                                          }}
                                          style={{
                                            width: "100%",
                                            textAlign: "right",
                                          }}
                                        />
                                        <div>
                                          {props.getValidationMessage(
                                            props.requireMessage,
                                            props.pricingSettingObj
                                              .maxDiscountForQC,
                                            props.OneOffPricingInfo
                                              .DiscountPercentagePackageThree,
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                  </>
                                )}
                              </tr>
                            </>
                          )}

                          {/* NET TOTAL */}
                          <tr className="head-row">
                            <td className="tr-table-class font-14 text-white">
                              Net Total
                            </td>

                            {activeCustomOneOffPackageFooters.map(
                              (footer, packageIndex) => (
                                <React.Fragment
                                  key={`one-off-package-net-${packageIndex}`}
                                >
                                  {/* NET FEES */}
                                  {props.visibleFieldsCustomTemp?.fees && (
                                    <td className="tr-table-class font-14 text-white text-right">
                                      {props.formatValue(
                                        props.engagementObj?.DiscountLines
                                          ? footer.net
                                          : footer.finalNet,
                                        props.currencyID,
                                      )}
                                    </td>
                                  )}

                                  {/* VAT RATE SPACER */}
                                  {hasCustomOneOffPackageVAT &&
                                    props.visibleFieldsCustomTemp?.vatRate && (
                                      <td className="tr-table-class font-14 text-white"></td>
                                    )}

                                  {/* NET VAT */}
                                  {hasCustomOneOffPackageVAT &&
                                    props.visibleFieldsCustomTemp?.vat && (
                                      <td className="tr-table-class font-14 text-white text-right">
                                        {props.formatValue(
                                          props.engagementObj?.DiscountLines
                                            ? footer.vat
                                            : footer.finalVat,
                                          props.currencyID,
                                        )}
                                      </td>
                                    )}

                                  {/* NET FEES INCLUDING VAT */}
                                  {hasCustomOneOffPackageVAT &&
                                    props.visibleFieldsCustomTemp
                                      ?.feesIncVat && (
                                      <td className="tr-table-class font-14 text-white text-right">
                                        {props.formatValue(
                                          props.engagementObj?.DiscountLines
                                            ? footer.feesIncVat
                                            : footer.finalFeesIncVat,
                                          props.currencyID,
                                        )}
                                      </td>
                                    )}

                                  {/* SERVICE SCOPE SPACER */}
                                  {props.visibleFieldsCustomTemp
                                    ?.serviceScope && <td></td>}
                                </React.Fragment>
                              ),
                            )}
                          </tr>

                          {/* DISCOUNT */}
                          {showCustomOneOffPackageDiscount && (
                            <tr className="head-grey-row">
                              <td className="tr-table-class font-14 text-white">
                                Discount
                              </td>

                              {activeCustomOneOffPackageFooters.map(
                                (footer, packageIndex) => (
                                  <React.Fragment
                                    key={`one-off-package-discount-${packageIndex}`}
                                  >
                                    {/* FEES DISCOUNT */}
                                    {props.visibleFieldsCustomTemp?.fees && (
                                      <td className="tr-table-class font-14 text-white text-right">
                                        (-){" "}
                                        {props.formatValue(
                                          footer.discount,
                                          props.currencyID,
                                        )}
                                      </td>
                                    )}

                                    {/* VAT RATE SPACER */}
                                    {hasCustomOneOffPackageVAT &&
                                      props.visibleFieldsCustomTemp
                                        ?.vatRate && (
                                        <td className="tr-table-class font-14 text-white"></td>
                                      )}

                                    {/* VAT DISCOUNT */}
                                    {hasCustomOneOffPackageVAT &&
                                      props.visibleFieldsCustomTemp?.vat && (
                                        <td className="tr-table-class font-14 text-white text-right">
                                          (-){" "}
                                          {props.formatValue(
                                            footer.vatDiscount,
                                            props.currencyID,
                                          )}
                                        </td>
                                      )}

                                    {/* FEES INCLUDING VAT DISCOUNT */}
                                    {hasCustomOneOffPackageVAT &&
                                      props.visibleFieldsCustomTemp
                                        ?.feesIncVat && (
                                        <td className="tr-table-class font-14 text-white text-right">
                                          (-){" "}
                                          {props.formatValue(
                                            footer.feesIncVatDiscount,
                                            props.currencyID,
                                          )}
                                        </td>
                                      )}

                                    {/* SERVICE SCOPE SPACER */}
                                    {props.visibleFieldsCustomTemp
                                      ?.serviceScope && <td></td>}
                                  </React.Fragment>
                                ),
                              )}
                            </tr>
                          )}

                          {/* GRAND TOTAL / DISCOUNTED TOTAL */}
                          {showCustomOneOffPackageDiscount && (
                            <tr className="head-row">
                              <td className="tr-table-class font-14 text-white">
                                {hasCustomOneOffPackageVAT
                                  ? "Grand Total"
                                  : "Discounted Total"}
                              </td>

                              {activeCustomOneOffPackageFooters.map(
                                (footer, packageIndex) => (
                                  <React.Fragment
                                    key={`one-off-package-final-${packageIndex}`}
                                  >
                                    {/* FINAL FEES */}
                                    {props.visibleFieldsCustomTemp?.fees && (
                                      <td className="tr-table-class font-14 text-white text-right">
                                        {props.formatValue(
                                          footer.finalNet,
                                          props.currencyID,
                                        )}
                                      </td>
                                    )}

                                    {/* VAT RATE SPACER */}
                                    {hasCustomOneOffPackageVAT &&
                                      props.visibleFieldsCustomTemp
                                        ?.vatRate && (
                                        <td className="tr-table-class font-14 text-white"></td>
                                      )}

                                    {/* FINAL VAT */}
                                    {hasCustomOneOffPackageVAT &&
                                      props.visibleFieldsCustomTemp?.vat && (
                                        <td className="tr-table-class font-14 text-white text-right">
                                          {props.formatValue(
                                            footer.finalVat,
                                            props.currencyID,
                                          )}
                                        </td>
                                      )}

                                    {/* FINAL FEES INCLUDING VAT */}
                                    {hasCustomOneOffPackageVAT &&
                                      props.visibleFieldsCustomTemp
                                        ?.feesIncVat && (
                                        <td className="tr-table-class font-14 text-white text-right">
                                          {props.formatValue(
                                            footer.finalFeesIncVat,
                                            props.currencyID,
                                          )}
                                        </td>
                                      )}

                                    {/* SERVICE SCOPE SPACER */}
                                    {props.visibleFieldsCustomTemp
                                      ?.serviceScope && <td></td>}
                                  </React.Fragment>
                                ),
                              )}
                            </tr>
                          )}
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="SOF-SD-Customization d-flex flex-column gap-2">
            {/* <div className="service-description">
              <div className="separator mb-2"></div>
              <h6>Service Description</h6>
              <div className="separator mb-3"></div>
              <Text_Editor
                index={0}
                handleContentChange={handleSDChange}
                editorState={props.serviceDescriptionHTML}
              />
            </div> */}
            {props?.serviceDescriptionObj?.mainHeading !== null && (
              <div className="service-description">
                {props?.serviceDescriptionObj?.mainHeading !== null &&
                  props?.serviceDescriptionObj?.mainHeading !== undefined &&
                  props?.serviceDescriptionObj?.mainHeading !== "" && (
                    <>
                      <div className="separator mb-2"></div>
                      <h6
                        style={{
                          fontSize: `${props?.serviceDescriptionObj?.mainHeadingFontSize}px`,
                          fontWeight: props?.serviceDescriptionObj
                            ?.mainHeadingIsBold
                            ? "bold"
                            : "normal",
                          fontStyle: props?.serviceDescriptionObj
                            ?.mainHeadingIsItalic
                            ? "italic"
                            : undefined,
                        }}
                      >
                        {props?.serviceDescriptionObj?.mainHeading}
                      </h6>
                      <div className="separator mb-3"></div>
                    </>
                  )}
                <Text_Editor
                  index={0}
                  handleContentChange={handleSDChange}
                  editorState={props.serviceDescriptionHTML}
                />
              </div>
            )}
            {/* <div className="statement-of-facts">
              <div className="separator mb-2"></div>
              <h6>Statement Of Facts</h6>
              <div className="separator mb-3"></div>
              <Text_Editor
                index={0}
                handleContentChange={handleSOFChange}
                editorState={props.statementOfFactsHTML}
              />
            </div> */}
            {props?.statementOfFactsObj?.mainHeading !== null && (
              <div className="statement-of-facts">
                {props?.statementOfFactsObj?.mainHeading !== null &&
                  props?.statementOfFactsObj?.mainHeading !== undefined &&
                  props?.statementOfFactsObj?.mainHeading !== "" && (
                    <>
                      <div className="separator mb-2"></div>
                      <h6
                        style={{
                          fontSize: `${props?.statementOfFactsObj?.mainHeadingFontSize}px`,
                          fontWeight: props?.statementOfFactsObj
                            ?.mainHeadingIsBold
                            ? "bold"
                            : "normal",
                          fontStyle: props?.statementOfFactsObj
                            ?.mainHeadingIsItalic
                            ? "italic"
                            : undefined,
                        }}
                      >
                        {props?.statementOfFactsObj?.mainHeading}
                      </h6>
                      <div className="separator mb-3"></div>
                    </>
                  )}
                <Text_Editor
                  index={0}
                  handleContentChange={handleSOFChange}
                  editorState={props.statementOfFactsHTML}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div class="separator"></div>
      <div class="row fieldset">
        <div class="col-lg-12 hstack gap-2 justify-content-end text-right mt-3">
          <button
            class="btn btn-md btn-light"
            onClick={() => props.handleCancelBtn()}
          >
            <span>Cancel</span>
          </button>
          <button
            onClick={() => props.HandleBack(3)}
            style={{ paddingTop: "5px", marginRight: "4px" }}
            className="btn btn-md btn-success create-item-btn"
          >
            <span>Back</span>
          </button>

          <button
            type="submit"
            class="btn btn-md btn-success create-item-btn"
            onClick={() => {
              // props.GetTemplateModalData(); // Call GetTemplateModalData function
              props.HandleTabChange(5); // Call HandleTabChange function as before
            }}
          >
            <span>Next</span>
          </button>
          <button
            type="submit"
            class="btn btn-md btn-success create-item-btn text-nowrap"
            onClick={() => props.HandleTabChange(5, statusID.Draft)}
            style={{ marginLeft: "5px" }}
          >
            <span>Save as a Draft</span>
          </button>
        </div>
      </div>
    </>
  );
};
const Add_Update_Engagement_Letter = () => {
  // A] States Declaration :
  const common = useSelector((state) => state.Storage);
  const navigate = useNavigate();
  const {
    setTopbar,
    setLoader,
    getCrudButtonTextName,
    getCrudPopUpTitleName,
    EngagementName,
    HtmlToPlainText,
    proposalName,
    prospectName,
    scrollUpDownByElementID,
    isValidEmail,
    isMobile,
    loader,
    formatValue,
    activeOrganizationSubscriptionPlan,
    hasActionAccess,
    getValidationMessage,
    GetTwoDecimalValueWithoutRoundOff,
    hasHyphenAfterNumber,
    formatValueWithoutCurrencySymbol,
    formatValueWithoutCurrencySymbol_v1,
    getFontStylesFromHtml,
    isValidNumber,
    replaceTemplatePricingVariables,
    isValueGreaterThan20000,
    updateTemplateList,
  } = useContext(AuthContextProvider);
  // SD, SOF states
  const [serviceDescriptionHTML, setServiceDescriptionHTML] = useState("");
  const [statementOfFactsHTML, setStatementOfFactsHTML] = useState("");
  const [serviceDescriptionObj, setServiceDescriptionObj] = useState({
    mainHeading: null,
    recurringOnGoingHeading: null,
    oneOffAdhocHeading: null,
    mainHeadingFontSize: null,
    recurringOnGoingHeadingFontSize: null,
    oneOffAdhocFontSize: null,
    mainHeadingIsBold: null,
    mainHeadingIsItalic: null,
    recurringOnGoingHeadingIsBold: null,
    recurringOnGoingHeadingIsItalic: null,
    oneOffAdhocHeadingIsBold: null,
    oneOffAdhocHeadingIsItalic: null,
  });

  const [statementOfFactsObj, setStatementOfFactsObj] = useState({
    mainHeading: null,
    recurringOnGoingHeading: null,
    oneOffAdhocHeading: null,
    mainHeadingFontSize: null,
    recurringOnGoingHeadingFontSize: null,
    oneOffAdhocFontSize: null,
    mainHeadingIsBold: null,
    mainHeadingIsItalic: null,
    recurringOnGoingHeadingIsBold: null,
    recurringOnGoingHeadingIsItalic: null,
    oneOffAdhocHeadingIsBold: null,
    oneOffAdhocHeadingIsItalic: null,
  });
  const [recurringObj, setRecurringObj] = useState([]);
  const [recurringError, setRecurringError] = useState(false);
  const [oneOffObj, setOneOffObj] = useState([]);
  const [updatedTnCData, setUpdatedTnCData] = useState(null);
  // const [updatedTnCData, setUpdatedTnCData] = useState([]);
  const [TnCLookupList, setTnCLookupList] = useState([]);
  const [Validation, setValidation] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [isModalOpen, setISModalOpen] = useState(false);
  const [selectedPackagesList, setSelectedPackagesList] = useState([]);
  const location = useLocation();
  const [pricingTableColumnIDs, setPricingTableColumnIDs] = useState("");
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [showSelectTemplateModal, setShowSelectTemplateModal] = useState(false);
  const [selectedTemplateID, setSelectedTemplateID] = useState(0);
  const [selectedTemplateIDOneOff, setSelectedTemplateIDOneOff] = useState(0);
  const [serviceTypeID, setServiceTypeID] = useState(null);
  const [vatPercentage, setVATPercentage] = useState("");
  const [ContractAdditionalServices, setContractAdditionalServices] = useState(
    [],
  );
  const [visibleFieldsCustomTemp, setVisibleFieldsCustomTemp] = useState({
    serviceCategory: true,
    serviceName: true,
    vatRate: vatPercentage === null ? false : true,
    vat: vatPercentage === null ? false : true,
    fees: true,
    serviceScope: true,
    feesIncVat: vatPercentage === null ? false : true,
  });
  // const [isChangeSourceType, setIsChangeSourceType] = React.useState(true);
  const [modelAction, setModelAction] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [getServicePackageLookupList, setGetServicePackageLookupList] =
    useState([]);
  const [isTemplateManuallySelected, setIsTemplateManuallySelected] =
    useState(false);
  const [DocumentCode, setDocumentCode] = useState(false);
  const [isTypeChange, setIsTypeChange] = useState(false);
  const [BrandColor, setBrandColor] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(null);
  const [footerHeight, setFooterHeight] = useState(null);
  const [headerImage, setHeaderImage] = useState(null);
  const [footerImage, setFooterImage] = useState(null);
  const [headerFooterFirstPage, setHeaderFooterFirstPage] = useState(false);
  const [headerFooterLastPage, setHeaderFooterLastPage] = useState(false);
  const [fontFamily, setFontFamily] = useState("");
  const [watermarkImage, setWatermarkImage] = useState("");
  const [orientationID, setOrientationID] = useState(null);
  const [headerContent, setHeaderContent] = useState(null);
  const [footerContent, setFooterContent] = useState(null);
  const [showSeparatorLines, setShowSeparatorLines] = useState(null);
  const [fontSize, setFontSize] = useState("");
  const [CompanyLogo, setCompanyLogo] = useState(false);
  const [isDefaultFirstPage, setIsDefaultFirstPage] = useState(null);
  const [requireMessage, setRequireMessage] = useState(false);
  const [priceAdjustedServices, setPriceAdjustedServices] = useState([]);
  const [openPriceAdjustedModal, setOpenPriceAdjustedModal] = useState(false);
  const [clientLookUpOptions, setClientLookUpOptions] = useState([]);
  const [recurringServiceList, setRecurringServiceList] = useState([]);
  const [oneOffServiceList, setOneOffServiceList] = useState([]);
  const [templateLookUpOptions, setTemplateLookUpOptions] = useState([]);
  const [proposalLookUpOptions, setProposalLookUpOptions] = useState([]);
  const [additionalInformationList, setAdditionalInformationList] = useState(
    [],
  );
  const [taxName, setTaxName] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("");
  const [currencyID, setCurrencyID] = useState(null);
  const [contractFinalPackageAmountList, setContractFinalPackageAmountList] =
    useState([]);
  const [
    quoteAdditionalInfoGlobalPricingDriver,
    setQuoteAdditionalInfoGlobalPricingDriver,
  ] = useState([]);
  const [
    lastPaymentFrequencyAndDiscountedPriceForPreview,
    setLastPaymentFrequencyAndDiscountedPriceForPreview,
  ] = useState({
    PaymentFrequencyID: 1,
    PackageOneNetValue: null,
    PackageTwoNetValue: null,
    PackageThreeNetValue: null,
    RecurringServiceArray: null,
    oneOffService: null,
  });
  const [
    lastPaymentFrequencyAndDiscountedPriceForPreviewForOneOff,
    setLastPaymentFrequencyAndDiscountedPriceForPreviewForOneOff,
  ] = useState({
    PaymentFrequencyID: 1,
    PackageOneNetValue: null,
    PackageTwoNetValue: null,
    PackageThreeNetValue: null,
    RecurringServiceArray: null,
    oneOffService: null,
  });
  const [TabHide, setTabHide] = useState(false);
  const [ServiceElementId, setServiceElementId] = useState([]);
  const [selectedRecurringServiceList, setSelectedRecurringServiceList] =
    useState([]);
  const [selectedOneOffServiceList, setSelectedOneOffServiceList] = useState(
    [],
  );
  const [selectedPackagesDetails, setSelectedPackagesDetails] = useState([]);
  const [disableCondition, setDisableCondition] = useState("");
  const [
    selectedRecurringServiceListCopy,
    setSelectedRecurringServiceListCopy,
  ] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [templateElementList, setTemplateElementList] = useState([]);
  const [pricingVariablesForEmail, setPricingVariablesForEmail] = useState([]);
  const [organisationData, setOrganisationData] = useState([]);
  const [modelRequestData, setModelRequestData] = useState({
    Action: null,
    message: "",
    DriverName: null,
  });
  const [pricingSettingObj, setPricingSettingObj] = useState({
    userKeyID: null,
    minOneOffPriceForQC: null,
    minMonthlyPriceForQC: null,
    minQuarterlyPriceForQC: null,
    minHalfYearlyPriceForQC: null,
    minYearlyPriceForQC: null,
    maxDiscountForQC: null,
    PaymentFrequency: null,
  });
  const [paymentGatewayObj, setPaymentGatewayObj] = useState({
    userKeyID: null,
    goCardlessAccessToken: undefined,
    stripePublishableKey: undefined,
    stripeSecretKey: undefined,
    bankTransferName: null,
    AccountNumber: null,
    sortCode: null,
    isDefault: null,
    PaymentGatewayID: null,
  });
  const [flagForTemplatePdf, setFlagForTemplatePdf] = useState(false);
  const [awsPdfWidth, setAwsPdfWidth] = useState(null);
  const [awsPdfHeight, setAwsPdfHeight] = useState(null);
  const [isAddUpdatePricingActionDone, setIsAddUpdatePricingActionDone] =
    useState(false);
  const [contractSignatoriesList, setContractSignatoriesList] = useState([
    {
      contractSignatoryID: null,
      firstName: null,
      lastName: null,
      emailID: null,
      signaturePositionID: null,
    },
  ]);
  const [isBack, setIsBack] = useState(false);
  const [RecurringPricingInfo, setRecurringPricingInfo] = useState({
    OriginalPrice: 0,
    DefaultDiscount: null,
    DiscountPercentagePackageOne: null,
    DiscountPercentagePackageTwo: null,
    DiscountPercentagePackageThree: null,
    DiscountedPrice: "",
    MaxDiscount: 0,
    MinPrice: "",
    NetTotal: 0,
    VATPrice: null,

    servicePackageName: null,
    Services: null,
    ServicePrice: 0,
    Discount: 0,
    GrandTotal: 0,
    DiscountedTotal: 0,
    packageOneNetTotal: 0,
    packageTwoNetTotal: 0,
    packageThreeNetTotal: 0,
    packageOneDisCount: 0,
    packageTwoDisCount: 0,
    packageThreeDisCount: 0,
    packageOneDisCountedTotal: 0,
    packageTwoDisCountedTotal: 0,
    packageThreeDisCountedTotal: 0,
    PackageOneVaTPrice: null,
    PackageTwoVaTPrice: null,
    PackageThreeVaTPrice: null,
    PackageOneGrandTotal: null,
    PackageTwoGrandTotal: null,
    PackageThreeGrandTotal: null,
  });
  const [OneOffPricingInfo, setOneOffPricingInfo] = useState({
    OriginalPrice: 0,
    DefaultDiscount: null,
    // DefaultDiscount: 0,
    DiscountPercentagePackageOne: null,
    DiscountPercentagePackageTwo: null,
    DiscountPercentagePackageThree: null,
    VATPrice: null,
    DiscountedPrice: "",
    MaxDiscount: 0,
    MinPrice: "",
    NetTotal: 0,
    Services: null,
    ServicePrice: 0,
    servicePackageName: null,
    Discount: 0,
    GrandTotal: 0,
    DiscountedTotal: 0,
    packageOneDisCount: 0,
    packageTwoDisCount: 0,
    packageThreeDisCount: 0,
    packageOneDisCountedTotal: 0,
    packageTwoDisCountedTotal: 0,
    packageThreeDisCountedTotal: 0,
    PackageOneVaTPrice: null,
    PackageTwoVaTPrice: null,
    PackageThreeVaTPrice: null,
    PackageOneGrandTotal: null,
    PackageTwoGrandTotal: null,
    PackageThreeGrandTotal: null,
  });
  const [OneOffPricingInfoCopy, setOneOffPricingInfoCopy] = useState({
    OriginalPrice: 0,
    DefaultDiscount: null,
    DiscountPercentagePackageOne: null,
    DiscountPercentagePackageTwo: null,
    DiscountPercentagePackageThree: null,
    // DefaultDiscount: 0,
    servicePackageName: null,
    DiscountedPrice: "",
    MaxDiscount: 0,
    MinPrice: "",
    NetTotal: 0,
    Services: null,
    ServicePrice: 0,
    Discount: 0,
    GrandTotal: 0,
    DiscountedTotal: 0,
    packageOneDisCount: 0,
    packageTwoDisCount: 0,
    packageThreeDisCount: 0,
    packageOneDisCountedTotal: 0,
    packageTwoDisCountedTotal: 0,
    packageThreeDisCountedTotal: 0,
    PackageOneVaTPrice: null,
    PackageTwoVaTPrice: null,
    PackageThreeVaTPrice: null,
    PackageOneGrandTotal: null,
    PackageTwoGrandTotal: null,
    PackageThreeGrandTotal: null,
  });
  const [RecurringFrequencyPricingInfo, setRecurringFrequencyPricingInfo] =
    useState({
      OriginalPrice: 0,
      DefaultDiscount: null,
      DiscountPercentagePackageOne: null,
      DiscountPercentagePackageTwo: null,
      DiscountPercentagePackageThree: null,
      // DefaultDiscount: 0,
      DiscountedPrice: "",
      MaxDiscount: 0,
      MinPrice: "",
      VATPrice: null,
      NetTotal: 0,
      Services: null,
      ServicePrice: 0,
      GrandTotal: null,
      Discount: 0,
      DiscountedTotal: 0,
      packageOneDisCount: 0,
      packageTwoDisCount: 0,
      packageThreeDisCount: 0,
      packageOneDisCountedTotal: 0,
      packageTwoDisCountedTotal: 0,
      packageThreeDisCountedTotal: 0,
      PackageOneVaTPrice: null,
      PackageTwoVaTPrice: null,
      PackageThreeVaTPrice: null,
      PackageOneGrandTotal: null,
      PackageTwoGrandTotal: null,
      PackageThreeGrandTotal: null,
    });
  const [engagementObj, setEngagementObj] = useState({
    servicePackageKeyID: null,
    DiscountLines: true,
    acceptedServicePackageID: null,
    acceptedServiceChargeTypeID: null,
    tnCTemplateKeyID: null,
    tnCTemplateID: null,
    ContractSignatoryID: null,
    contractKeyID: null,
    QuoteKeyID: null,
    quoteID: null,
    quoteTypeID: null,
    pdf: null,
    selectSourceId: modelAction == "Draft" ? null : 1,
    tnCTemplateContent: null,
    customizedEmailContent: null,
    selectedAttachments: [],
    ClientID: null,
    clientKeyID: null,
    templateKeyID: null,
    templateID: null,
    feeTypeId: 1,
    paymentGatewayID: null,
    Payment_Frequency: null,
    moduleName: "Contract",
    pricingTableColumnIDs: null,
  });
  // useEffect(() => {
  //   console.log(
  //     "Updated selectedAttachments:",
  //     engagementObj.selectedAttachments,
  //   );
  // }, [engagementObj.selectedAttachments]);
  const [MergePdfUrl, setMergePdfUrl] = useState("");
  const [openErrorModal, setOpenErrorModal] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [isValidForm, setIsValidForm] = useState({
    BasicForm: false,
    SelectService: false,
    AdditionalInfo: false,
    PricingInfo: false,
    previewEngagement: false,
    ReviewPackages: false,
  });
  const [refIdStore, setRefIdStore] = useState("");
  const [servicePackageName, setServicePackageName] = useState("");
  // B] Initial useEffect :

  // 1) Will Call Initial Api Like List Api
  useEffect(() => {
    // GetRecurringServiceListData();
    // GetOneOffServiceListData();
    // GetTemplateLookupListData(null,location?.state?.QuoteKeyID);
    GetClientLookupListData();
    GetOrganisationInformationModelData();
  }, [common.organisationKeyID]);

  useEffect(() => {
    setModelAction(
      location?.state?.Action === undefined || location?.state?.Action === null
        ? "Send"
        : "Draft",
    );
    GetContractModelData(location?.state?.contractKeyID);
    setEngagementObj({
      ...engagementObj,
      contractKeyID: location?.state?.contractKeyID,
    });

    setTopbar("none");
  }, [location?.state?.contractKeyID]);

  const handleCloseModel = () => {
    setShowModal(false);
  };
  useEffect(() => {
    // This effect runs when the component mounts
    // Define the getData function using async/await
    const Admin_Engagement_Latter_CanAdd = hasActionAccess(3, 9);
    if (
      (location?.state?.Action === undefined ||
        location?.state?.Action === null) &&
      !Admin_Engagement_Latter_CanAdd
    ) {
      navigate(-1);
    }
    const getData = async () => {
      // Set topbar to "none"
      setTopbar("none");
      // Wait for skipToEngagementLatter() to complete before moving to the next line
      await skipToEngagementLatter();
      // Wait for GetPricingSettingModelData() to complete before moving to the next line
      // await GetPricingSettingModelData();
    };
    if (
      location.state?.QuoteKeyID !== null &&
      location.state?.QuoteKeyID !== undefined &&
      location.state?.QuoteKeyID !== ""
    ) {
      // If QuoteKeyID exists in the location state, call getData()
      getData();
    } else {
      // If QuoteKeyID does not exist, setTopbar to "none" and call three different functions
      setTopbar("none");
      GetTermsAndConditionsLookupListData();
      GetQuoteLookupListData();
      GetPricingSettingModelData();
      GetPaymentGatewayModelData(common.organisationKeyID);
    }
  }, [location.state?.QuoteKeyID]);

  useEffect(() => {
    if (isAddUpdatePricingActionDone) {
      GetPricingSettingModelData();
      GetPaymentGatewayModelData(common.organisationKeyID);
      setIsAddUpdatePricingActionDone(false);
    }
  }, [isAddUpdatePricingActionDone]);

  function getFontNameById(id) {
    const font = Utils.FontFamily.find((f) => f.value === id);
    return font ? font.label : null;
  }

  const organisationList = JSON.parse(
    localStorage.getItem("OrganisationLocalList") || "[]",
  );

  const storedOrg = organisationList.find(
    (item) => item.organisationKeyID === common.organisationKeyID,
  );

  // console.log("storedOrg", storedOrg);
  // Remember, here the opposite sign is used for the vatStatus because, in the backend they have stored opposite. If the org is vat reg then they have stored false else true.

  const isVatEnabledForOrg =
    storedOrg?.isVatRegistered === true ? false : true || false;

  const updateVisibleFieldsFromIds = (pricingTableColumnIDs) => {
    // Ensure pricingTableColumnIDs is a string — handle undefined, null, object, or empty values safely
    if (
      typeof pricingTableColumnIDs !== "string" ||
      pricingTableColumnIDs.trim() === ""
    ) {
      const defaultVisibleFields = Object.fromEntries(
        Object.keys(fieldToIdMap).map((key) => [key, true]),
      );
      setVisibleFieldsCustomTemp(defaultVisibleFields);
      setSelectedTemplateID(0);
      setSelectedTemplateIDOneOff(0);
      return;
    }

    const idsFromBackend = pricingTableColumnIDs
      .split(",")
      .map((id) => Number(id.trim()))
      .filter((id) => !isNaN(id)); // avoid NaN if backend sends weird values

    const updatedFields = Object.fromEntries(
      Object.entries(fieldToIdMap).map(([key, id]) => [
        key,
        idsFromBackend.includes(id),
      ]),
    );

    const vatSafeFields = isVatEnabledForOrg
      ? updatedFields
      : {
          ...updatedFields,
          vatRate: false,
          vat: false,
          feesIncVat: false,
        };
    setVisibleFieldsCustomTemp(vatSafeFields);
    setSelectedTemplateID(6);
    setSelectedTemplateIDOneOff(6);
  };

  const getVisibleFieldIds = () => {
    const selectedIds = Object.entries(visibleFieldsCustomTemp)
      .filter(([_, value]) => value === true)
      .filter(([key]) => {
        if (isVatEnabledForOrg) return true;
        return key !== "vatRate" && key !== "vat" && key !== "feesIncVat";
      })
      .map(([key]) => fieldToIdMap[key]);

    return selectedIds.join(","); // e.g. "1,2,3,4,5,6,7"
  };

  useEffect(() => {
    if (isVatEnabledForOrg) return;
    setVisibleFieldsCustomTemp((prev) => ({
      ...prev,
      vatRate: false,
      vat: false,
      feesIncVat: false,
    }));
  }, [isVatEnabledForOrg]);

  const updatedData = Utils.source.map((item) => {
    if (item.label && item.label.includes("Contract")) {
      return {
        ...item,
        label: item.label.replace("Contract", EngagementName),
      }; // Replace "Contract" with "EL" in the label
    }
    if (item.label && item.label.includes("Quote")) {
      return {
        ...item,
        label: item.label.replace("Quote", proposalName),
      }; // Replace "Contract" with "EL" in the label
    }
    return item;
  });
  // B] Calling All Api's like List and other Here :
  //1) Get template model Api implementation  for Preview component
  const GetTemplateModalData = async (activeTab) => {
    setLoader(true);
    if (!engagementObj.templateKeyID) {
      return;
    }
    try {
      const data = await GetTemplateModelData({
        TemplateKeyID: engagementObj.templateKeyID,
        clientID: engagementObj.ClientID,
        TemplateTypeID: 2,
        ModuleKeyID: engagementObj.contractKeyID,
      });
      if (data?.data?.statusCode === 200) {
        setLoader(false);
        if (data?.data?.responseData?.data) {
          const ModelData = data?.data?.responseData?.data;
          function replaceVariables(array, signatoriesList) {
            // Mapping object for variable names to property names
            const variableMap = {
              //Individual Variables :
              "Client.FirstName": ["firstName"],
              "Client.LastName": ["lastName"],
              "Client.Name": ["firstName", "lastName"],
              //Sole Trader Variables :
              "Client.SoleTrader.FirstName": ["firstName"],
              "Client.SoleTrader.LastName": ["lastName"],
              //'Client.SoleTrader.Name': ['soleTraderName'],

              //Partnership Variables :
              "Client.Partner.Name": ["firstName", "lastName"],
              "Client.Partner.FirstName": ["firstName"],
              "Client.Partner.LastName": ["lastName"],

              //LLP / Ltd Variable :
              "Client.Officer.Name": ["firstName", "lastName"],
              "Client.Officer.FirstName": ["firstName"],
              "Client.Officer.LastName": ["lastName"],
            };

            const replacedArray = array.map((item) => {
              if (item.htmlContent) {
                let replacedContent = item.htmlContent;

                // Iterate over each variable and replace it in the content
                for (const variable in variableMap) {
                  const propertyNames = variableMap[variable];
                  const replacement = signatoriesList
                    .map((signatory) =>
                      propertyNames.map((prop) => signatory[prop]).join(" "),
                    )
                    .join(", ");
                  const regex = new RegExp(
                    "\\$" + variable.replace(/\./g, "\\.") + "\\$",
                    "g",
                  );
                  replacedContent = replacedContent.replace(regex, replacement);
                }

                // Update the htmlContent in the item
                return { ...item, htmlContent: replacedContent };
              } else {
                return item;
              }
            });

            return replacedArray;
          }
          const GetCommonFontFamily = ModelData.templateElementList.find(
            (item) => item.templateElementTypeName === "Text Block",
          )?.htmlContent;

          const { uniqueFontFamilies, largeFontSizes, smallFontSizes } =
            getFontStylesFromHtml(GetCommonFontFamily);
          const Logo =
            ModelData.templateElementListWithRequiredData.organisationLogoUrl;
          let clientNameOnFirstPage =
            ModelData.templateElementListWithRequiredData
              .clientNameOnFirstPage == null
              ? ""
              : ModelData.templateElementListWithRequiredData
                  .clientNameOnFirstPage;
          const firstPageHTML = `
          <div style="margin-top: 300px;>
    <div style="display: flex; justify-content: center; align-items: center; text-align: center;margin-top:${
      Logo ? `-100px` : "0px"
    }">
    ${
      Logo
        ? `
      <div style="display: inline-block; text-align: center; width: 700px; height: 150px; background-image: url('${Logo}'); background-size: contain; background-repeat: no-repeat; background-position: center;">
      </div>
    `
        : ""
    }
  
  <p style="text-align: center; color: #00BFFF; page-break-after: always;">
    <span style="color: #00BFFF; margin-top: 15px;font-family:${fontFamily};font-size: 50px;" class="OrgBrandColor">Engagement Letter For</span><br><br>
    <span style="color: black; margin-top: 15px;font-family:${fontFamily}; font-size: 25px;">${clientNameOnFirstPage}</span><br>
  </p>
  </div>
  </div>
  `;

          let firstPage = ModelData.templateElementList.find(
            (item) => item.templateElementTypeID === 10,
          );
          let isAddedFirstPage = ModelData.templateElementList.some(
            (item) => item.templateElementTypeID === 10,
          );
          let AddFirstPageHtmlContent = [...ModelData.templateElementList];
          setFlagForTemplatePdf(
            ModelData.templateElementList.find(
              (item) => item.templateElementTypeID === 9,
            ),
          );
          const pdfElement = ModelData.templateElementList.find(
            (item) => item.templateElementTypeID === 9,
          );
          const getPdfDimensions = async (pdfUrl) => {
            setLoader(true);
            const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
            setLoader(false);
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1 });
            return {
              targetWidth: viewport.width,
              targetHeight: viewport.height,
            };
          };
          let targetWidth = 595.28; // default A4
          let targetHeight = 841.89; // default A4

          if (pdfElement) {
            const dimensions = await getPdfDimensions(pdfElement.htmlContent); // htmlContent has the AWS URL
            setAwsPdfWidth(dimensions.targetWidth);
            setAwsPdfHeight(dimensions.targetHeight);
          }

          if (!isAddedFirstPage) {
            const firstPageElement = {
              ttetMapID: null,
              templateElementTypeID: 10,
              templateElementTypeName: "First Page",
              serialNo: null,
              headings: "",
              shortDesc: "",
              htmlContent: firstPageHTML,
            };
            AddFirstPageHtmlContent.splice(0, 0, firstPageElement);
          } else {
            const imgTag = `<img src="${Logo}" alt="Logo" style="display: none; margin: 0 auto 15px;">`;

            // Insert the imgTag after the closing </div> tag
            const updatedHtmlContent = `${imgTag}${firstPage?.htmlContent}`;

            // Create a new object with the updated htmlContent
            const updatedFirstPage = {
              ...firstPage,
              htmlContent: updatedHtmlContent,
            };

            // Find the index of the firstPage element and replace it in the array
            const index = ModelData.templateElementList.findIndex(
              (item) => item.templateElementTypeID === 10,
            );

            AddFirstPageHtmlContent[index] = updatedFirstPage;
          }

          // Call the function with your array and contract signatories list as arguments
          let newArray = await replaceVariables(
            AddFirstPageHtmlContent,
            contractSignatoriesList,
          );

          const { replacedArray, pricingVariables } =
            replaceTemplatePricingVariables(
              newArray,
              RecurringPricingInfo,
              OneOffPricingInfo,
              engagementObj.Payment_Frequency,
              3,
              selectedPackagesList,
            );
          debugger;
          newArray = replacedArray;
          setPricingVariablesForEmail(pricingVariables);
          if (
            engagementObj.pdf !== null ||
            engagementObj.tnCTemplateContent !== null
          ) {
            const pdfObject = {
              ttetMapID: null, //Template's Template Element Type Mapping Id
              templateElementTypeID: null,
              headings: null,
              shortDesc: null,
              htmlContent: null,
            };
            const updatedTemplateElementList = [...newArray, pdfObject];
            setIsDefaultFirstPage(ModelData?.enableFirstPage);
            setBrandColor(
              ModelData.templateElementListWithRequiredData.brandColor,
            );
            setHeaderFooterFirstPage(Boolean(ModelData?.headerFooterFirstPage));
            setHeaderFooterLastPage(Boolean(ModelData?.headerFooterLastPage));
            setCompanyLogo(Logo);
            setFontSize(smallFontSizes);
            // setFontFamily(uniqueFontFamilies);
            setDocumentCode(
              ModelData.templateElementListWithRequiredData.documentCode,
            );
            setTemplateElementList(updatedTemplateElementList);
          } else {
            setTemplateElementList(newArray);
          }
          setIsValidForm({
            ...isValidForm,
            PricingInfo: true,
            ReviewPackages: engagementObj.selectSourceId == 3 ? true : false,
          });
          setActiveTab(activeTab);
        }
      } else {
        setLoader(false);
        setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      setLoader(false);
      console.log(error);
    }
  };

  //2) Get Org Address model Api implementation  for Preview component
  const GetOrganisationInformationModelData = async () => {
    setLoader(true);
    const response = await GetOrganisationInformationModel(
      common.organisationKeyID,
    );
    if (response) {
      if (response?.data?.statusCode === 200) {
        setLoader(false);
        const ModelData = response?.data?.responseData?.data;
        // Extract emailId, phoneNumber, and countryCode
        const {
          emailID,
          phoneNo,
          countryCode,
          website,
          signatureImageUrl,
          signatoryName,
          preferredCurrencyId,
        } = ModelData.otherInformation;
        if (preferredCurrencyId === 1) {
          setTaxName("VAT");
          setCurrencySymbol("£");
        } else if (preferredCurrencyId === 2) {
          setTaxName("EU VAT");
          setCurrencySymbol("€");
        } else if (preferredCurrencyId === 3) {
          setTaxName("Sales Tax");
          setCurrencySymbol("$");
        } else if (preferredCurrencyId === 4) {
          setTaxName("GST");
          setCurrencySymbol("₹");
        }
        setCurrencyID(preferredCurrencyId);
        const concatenateFullAddress = (address) => {
          const addPart = (part) => (part ? `${part}, ` : "");
          let concatenatedAddress = `${addPart(
            address?.addressLine1?.replace(",", " "),
          )}${addPart(address?.addressLine2)}${addPart(
            address?.locality,
          )}${addPart(address?.region)}${addPart(
            address?.country || address?.countryName,
          )}${address?.postcode || ""}`;
          // Remove trailing comma, if present
          if (concatenatedAddress.endsWith(", ")) {
            concatenatedAddress = concatenatedAddress.slice(0, -2);
          }
          return concatenatedAddress;
        };
        const fullAddress = concatenateFullAddress(
          ModelData.organisationAddress,
        );
        // Concatenate countryCode and phoneNo
        const concatenatedPhone = `${countryCode} ${phoneNo}`;
        // Update otherInformation with only required fields
        const updatedOtherInformation = [
          {
            emailID,
            phoneNo: concatenatedPhone,
            fullAddress,
            website,
            signatureImageUrl,
            signatoryName,
          },
        ];
        const officerDetails = ModelData.officersList.map((item) => ({
          ...item, // Copies all properties from the `item` object
          isAuthorisedSignatory:
            ModelData.businessTypeID === 2 ? true : item.isAuthorisedSignatory,
        }));

        // Set updated organization data
        setOrganisationData({
          otherInformation: updatedOtherInformation,
          officersList: officerDetails,
        });
        // Set updated organization data in local storage
      } else {
        setLoader(false);
        setErrorMessage(response?.data?.errorMessage);
      }
    }
  };

  //3) Get Select service Charge type api  call
  const GetRecurringServiceListData = async () => {
    setLoader(true);

    try {
      const data = await GetPackageServicesList({
        userKeyID: common.userKeyID,
        organisationKeyID: common.organisationKeyID, //common.organisationKeyID,//common.organisationKeyID,
        ServiceChargeTypeID: 1,
        moduleKeyID: engagementObj.contractKeyID,
        moduleName: "Contract",
        ProfessionTypeIDs: null,
        BusinessTypeIDs: null,
        BusinessNatureIDs: null,
        ClientKeyID: engagementObj.ClientID.toString(),
        QuoteTypeID: null, //For Quotation
        SourceID: engagementObj.selectSourceId, //For Contract
        ServicePackageIDs:
          engagementObj.acceptedServicePackageID !== null
            ? [engagementObj.acceptedServicePackageID]
            : null,
        QuoteKeyID: engagementObj.quoteID,
      });
      if (data) {
        if (data?.data?.statusCode === 200) {
          setLoader(false);
          if (data?.data?.responseData?.data) {
            let PackageServiceListData = data.data.responseData.data;

            if (PackageServiceListData.length > 0) {
              PackageServiceListData = PackageServiceListData.map((item) => {
                // Check if the item has servicesList array
                if (item.servicesList && item.servicesList.length > 0) {
                  // Iterate through each service in servicesList
                  item.servicesList = item.servicesList.map((service) => {
                    // Add isAdditionalService property and initialize to false
                    service.isAdditionalService = false;
                    service.servicePackageIDs =
                      engagementObj.acceptedServicePackageID !== null
                        ? [engagementObj.acceptedServicePackageID]
                        : null;
                    // Check if the service meets certain conditions

                    if (
                      !service.isDisabled &&
                      engagementObj.selectSourceId === 3
                    ) {
                      service.isAdditionalService = true;
                    }
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
                              (variation) => variation.isDefault === true,
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
                              (slab) => slab.isDefault === true,
                            );
                            // Update driverValue and slabID if defaultSlab exists
                            if (defaultSlab) {
                              driver.driverValue = defaultSlab.slabValue;
                              driver.slabID = defaultSlab.slabID;
                            }
                          }
                          // Check if driverTypeID is 6 and driverValue, and dateID are null
                          else if (driver.driverTypeID === 6) {
                            // Find the default date
                            const defaultDate = driver.date.find(
                              (date) => date.isDefault === true,
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
                                  driver.dependsOnGlobalPricingDriverID,
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
                        },
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
                (catOne) => catOne.serviceCatID === recServices.serviceCatID,
              );
              if (matchingCatOne) {
                matchingCatOne.servicesList.forEach((serviceOne) => {
                  const matchingService = recServices.servicesList.find(
                    (service) => service.serviceID === serviceOne.serviceID,
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
          setLoader(false);
          setErrorMessage(data?.data?.errorMessage);
        }
      } else {
        setLoader(false);
        setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      setLoader(false);
      console.log(error);
    }
  };

  //4) Get Select service Charge type api  call
  const GetOneOffServiceListData = async () => {
    setLoader(true);
    try {
      const data = await GetPackageServicesList({
        userKeyID: common.userKeyID,
        organisationKeyID: common.organisationKeyID, //common.organisationKeyID,//common.organisationKeyID,
        ServiceChargeTypeID: 2,
        moduleKeyID: engagementObj.contractKeyID,
        moduleName: "Contract",
        ProfessionTypeIDs: null,
        BusinessTypeIDs: null,
        BusinessNatureIDs: null,
        QuoteTypeID: null, //For Quotation
        SourceID: engagementObj.selectSourceId, //For Contract
        ClientKeyID: engagementObj.ClientID.toString(),
        ServicePackageIDs:
          engagementObj.acceptedServicePackageID !== null
            ? [engagementObj.acceptedServicePackageID]
            : null,
        QuoteKeyID: engagementObj.quoteID,
      });
      if (data) {
        setLoader(false);
        if (data?.data?.statusCode === 200) {
          if (data?.data?.responseData?.data) {
            let PackageServiceListData = data.data.responseData.data;
            if (PackageServiceListData.length > 0) {
              PackageServiceListData = PackageServiceListData.map((item) => {
                // Check if the item has servicesList array
                if (item.servicesList && item.servicesList.length > 0) {
                  // Iterate through each service in servicesList
                  item.servicesList = item.servicesList.map((service) => {
                    // Add isAdditionalService property and initialize to false
                    service.isAdditionalService = false;
                    service.servicePackageIDs =
                      engagementObj.selectSourceId === 3 ||
                      engagementObj.selectSourceId === 4
                        ? [engagementObj.acceptedServicePackageID]
                        : null;

                    // Check if the service meets certain conditions
                    if (
                      !service.isDisabled &&
                      engagementObj.selectSourceId === 3
                    ) {
                      service.isAdditionalService = true;
                    }
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
                              (variation) => variation.isDefault === true,
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
                              (slab) => slab.isDefault === true,
                            );
                            // Update driverValue and slabID if defaultSlab exists
                            if (defaultSlab) {
                              driver.driverValue = defaultSlab.slabValue;
                              driver.slabID = defaultSlab.slabID;
                            }
                          }
                          // Check if driverTypeID is 6 and driverValue, and dateID are null
                          else if (driver.driverTypeID === 6) {
                            // Find the default date
                            const defaultDate = driver.date.find(
                              (date) => date.isDefault === true,
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
                                  driver.dependsOnGlobalPricingDriverID,
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
                        },
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
                (catOne) => catOne.serviceCatID === item.serviceCatID,
              );
              if (matchingCatOne) {
                matchingCatOne.servicesList.forEach((serviceOne) => {
                  const matchingService = item.servicesList.find(
                    (service) => service.serviceID === serviceOne.serviceID,
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
          setLoader(false);
          setErrorMessage(data?.data?.errorMessage);
        }
      } else {
        setLoader(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //5) Get Client lookup list api  call
  const GetClientLookupListData = async () => {
    setLoader(true);
    try {
      const response = await GetClientLookupList(common.organisationKeyID);
      const data = response.data;

      if (data.statusCode === 200) {
        setLoader(false);
        const mappedOptions = data.responseData.data.map((item) => ({
          value: item.clientID,
          label: item.clientName,
          clientKeyID: item.clientKeyID,
        }));
        setClientLookUpOptions(mappedOptions);
      } else {
        setLoader(false);
        console.error("Error fetching data from the API");
      }
    } catch (error) {
      setLoader(false);
      console.error("Error fetching data from the API", error);
    }
  };

  //6) Get Template lookup list api  call
  // const GetTemplateLookupListData = async (ClientId, QuoteId) => {
  //   setLoader(true);
  //   console.log("Hii");
  //   try {
  //     const response = await GetTemplateListLookupList({
  //       TemplateTypeID: 2,
  //       organisationKeyID: common.organisationKeyID,
  //       clientID: ClientId?.value == undefined ? ClientId : ClientId?.value,
  //       QuoteKeyID: QuoteId?.value == undefined ? QuoteId : QuoteId?.value,
  //     });
  //     const data = response.data;

  //     if (data.statusCode === 200) {
  //       setLoader(false);
  //       const mappedOptions = data.responseData.data.map((item) => ({
  //         value: item.templateKeyID,
  //         label: item.templateName,
  //         templateID: item.templateID,
  //         fontFamilyID: item.fontFamilyID,
  //         headerContent: item.headerContent,
  //         footerContent: item.footerContent,
  //         headerImage: item.headerImage,
  //         footerImage: item.footerImage,
  //         headerHeight: item.headerHeight,
  //         footerHeight: item.footerHeight
  //       }));
  //       setTemplateLookUpOptions(mappedOptions);
  //       const isSelectedDefault = data.responseData.data.filter(
  //         (item) => item.isDefault === true
  //       );

  //       if (QuoteId !== null) {
  //         setEngagementObj({
  //           ...engagementObj,
  //           acceptedServicePackageID: null,
  //           servicePackageKeyID: null,
  //           ClientID: QuoteId.clientID,
  //           clientKeyID:
  //             ClientId?.clientKeyID == undefined ? null : ClientId?.clientKeyID,
  //           QuoteKeyID: QuoteId?.value == undefined ? QuoteId : QuoteId?.value,
  //           quoteID: QuoteId?.quoteID == undefined ? QuoteId : QuoteId?.quoteID,
  //           quoteTypeID: isSelectedDefault[0]?.quoteTypeID,
  //           templateKeyID: isSelectedDefault[0]?.templateKeyID,
  //           templateID: isSelectedDefault[0]?.templateID,
  //         });
  //       } else {
  //         setEngagementObj({
  //           ...engagementObj,
  //           acceptedServicePackageID: null,
  //           servicePackageKeyID: null,
  //           ClientID:
  //             ClientId?.value == undefined
  //               ? ClientId
  //               : ClientId?.value == null
  //                 ? null
  //                 : ClientId?.value,
  //           clientKeyID:
  //             ClientId?.clientKeyID == undefined ? null : ClientId?.clientKeyID,
  //           QuoteKeyID: QuoteId?.value == undefined ? QuoteId : QuoteId?.value,
  //           quoteID: QuoteId?.quoteID == undefined ? QuoteId : QuoteId?.quoteID,
  //           templateKeyID: isSelectedDefault[0]?.templateKeyID,
  //           templateID: isSelectedDefault[0]?.templateID,
  //         });
  //       }
  //       console.log(getFontNameById(isSelectedDefault[0].fontFamilyID));
  //       setFontFamily(getFontNameById(isSelectedDefault[0].fontFamilyID));
  //       setHeaderContent(isSelectedDefault[0].headerContent);
  //       setFooterContent(isSelectedDefault[0].footerContent);
  //       setHeaderImage(isSelectedDefault[0].headerImage);
  //       setFooterImage(isSelectedDefault[0].footerImage);
  //       setHeaderHeight(isSelectedDefault[0].headerHeight);
  //       setFooterHeight(isSelectedDefault[0].footerHeight);
  //     } else {
  //       setLoader(false);
  //       console.error("Error fetching data from the API");
  //     }
  //   } catch (error) {
  //     setLoader(false);
  //     console.error("Error fetching data from the API", error);
  //   }
  // };
  const GetTemplateLookupListData = async (ClientId, QuoteId) => {
    setLoader(true);
    try {
      const response = await GetTemplateListLookupList({
        TemplateTypeID: 2,
        organisationKeyID: common.organisationKeyID,
        clientID: ClientId?.value == undefined ? ClientId : ClientId?.value,
        QuoteKeyID: QuoteId?.value == undefined ? QuoteId : QuoteId?.value,
      });
      const data = response.data;

      if (data.statusCode === 200) {
        setLoader(false);
        const mappedOptions = data.responseData.data.map((item) => ({
          value: item.templateKeyID,
          label: item.templateName,
          templateID: item.templateID,
          fontFamilyID: item.fontFamilyID,
          headerContent: item.headerContent,
          footerContent: item.footerContent,
          headerImage: item.headerImage,
          footerImage: item.footerImage,
          headerHeight: item.headerHeight,
          footerHeight: item.footerHeight,
          showSeparatorLines: Boolean(item.showSeparatorLines),
          pricingTableColumnIDs: item.pricingTableColumnIDs
            ? item.pricingTableColumnIDs
            : "",
          mainHeadingSD: item.mainHeadingSD,
          recurringOnGoingHeadingSD: item.recurringOnGoingHeadingSD,
          oneOffAdhocHeadingSD: item.oneOffAdhocHeadingSD,
          mainHeadingFontSizeSD: item.mainHeadingFontSizeSD,
          recurringOnGoingHeadingFontSizeSD:
            item.recurringOnGoingHeadingFontSizeSD,
          oneOffAdhocFontSizeSD: item.oneOffAdhocFontSizeSD,
          mainHeadingIsBoldSD: item.mainHeadingIsBoldSD,
          mainHeadingIsItalicSD: item.mainHeadingIsItalicSD,
          recurringOnGoingHeadingIsBoldSD: item.recurringOnGoingHeadingIsBoldSD,
          recurringOnGoingHeadingIsItalicSD:
            item.recurringOnGoingHeadingIsItalicSD,
          oneOffAdhocHeadingIsBoldSD: item.oneOffAdhocHeadingIsBoldSD,
          oneOffAdhocHeadingIsItalicSD: item.oneOffAdhocHeadingIsItalicSD,
          mainHeadingSOF: item.mainHeadingSOF,
          recurringOnGoingHeadingSOF: item.recurringOnGoingHeadingSOF,
          oneOffAdhocHeadingSOF: item.oneOffAdhocHeadingSOF,
          mainHeadingFontSizeSOF: item.mainHeadingFontSizeSOF,
          recurringOnGoingHeadingFontSizeSOF:
            item.recurringOnGoingHeadingFontSizeSOF,
          oneOffAdhocFontSizeSOF: item.oneOffAdhocFontSizeSOF,
          mainHeadingIsBoldSOF: item.mainHeadingIsBoldSOF,
          mainHeadingIsItalicSOF: item.mainHeadingIsItalicSOF,
          recurringOnGoingHeadingIsBoldSOF:
            item.recurringOnGoingHeadingIsBoldSOF,
          recurringOnGoingHeadingIsItalicSOF:
            item.recurringOnGoingHeadingIsItalicSOF,
          oneOffAdhocHeadingIsBoldSOF: item.oneOffAdhocHeadingIsBoldSOF,
          oneOffAdhocHeadingIsItalicSOF: item.oneOffAdhocHeadingIsItalicSOF,
        }));
        setTemplateLookUpOptions(mappedOptions);
        const isSelectedDefault = data.responseData.data.filter(
          (item) => item.isDefault === true,
        );

        // Only update template-related fields if no manual selection has occurred
        if (!isTemplateManuallySelected) {
          if (QuoteId !== null) {
            setEngagementObj({
              ...engagementObj,
              acceptedServicePackageID: null,
              servicePackageKeyID: null,
              ClientID: QuoteId.clientID,
              clientKeyID:
                ClientId?.clientKeyID == undefined
                  ? null
                  : ClientId?.clientKeyID,
              QuoteKeyID:
                QuoteId?.value == undefined ? QuoteId : QuoteId?.value,
              quoteID:
                QuoteId?.quoteID == undefined ? QuoteId : QuoteId?.quoteID,
              quoteTypeID: isSelectedDefault[0]?.quoteTypeID,
              templateKeyID: isSelectedDefault[0]?.templateKeyID,
              templateID: isSelectedDefault[0]?.templateID,
              pricingTableColumnIDs: isSelectedDefault[0]?.pricingTableColumnIDs
                ? isSelectedDefault[0]?.pricingTableColumnIDs
                : "",
            });

            if (isSelectedDefault[0]?.pricingTableColumnIDs !== null) {
              setSelectedTemplateID(6);
              setSelectedTemplateIDOneOff(6);
              updateVisibleFieldsFromIds(
                isSelectedDefault[0]?.pricingTableColumnIDs,
              );
              setServiceDescriptionObj((prev) => ({
                ...prev,
                mainHeading: isSelectedDefault[0]?.mainHeadingSD,
                recurringOnGoingHeading:
                  isSelectedDefault[0]?.recurringOnGoingHeadingSD,
                oneOffAdhocHeading: isSelectedDefault[0]?.oneOffAdhocHeadingSD,
                mainHeadingFontSize:
                  isSelectedDefault[0]?.mainHeadingFontSizeSD,
                recurringOnGoingHeadingFontSize:
                  isSelectedDefault[0]?.recurringOnGoingHeadingFontSizeSD,
                oneOffAdhocFontSize:
                  isSelectedDefault[0]?.oneOffAdhocFontSizeSD,
                mainHeadingIsBold: isSelectedDefault[0]?.mainHeadingIsBoldSD,
                mainHeadingIsItalic:
                  isSelectedDefault[0]?.mainHeadingIsItalicSD,
                recurringOnGoingHeadingIsBold:
                  isSelectedDefault[0]?.recurringOnGoingHeadingIsBoldSD,
                recurringOnGoingHeadingIsItalic:
                  isSelectedDefault[0]?.recurringOnGoingHeadingIsItalicSD,
                oneOffAdhocHeadingIsBold:
                  isSelectedDefault[0]?.oneOffAdhocHeadingIsBoldSD,
                oneOffAdhocHeadingIsItalic:
                  isSelectedDefault[0]?.oneOffAdhocHeadingIsItalicSD,
              }));
              setStatementOfFactsObj((prev) => ({
                ...prev,
                mainHeading: isSelectedDefault[0]?.mainHeadingSOF,
                recurringOnGoingHeading:
                  isSelectedDefault[0]?.recurringOnGoingHeadingSOF,
                oneOffAdhocHeading: isSelectedDefault[0]?.oneOffAdhocHeadingSOF,
                mainHeadingFontSize:
                  isSelectedDefault[0]?.mainHeadingFontSizeSOF,
                recurringOnGoingHeadingFontSize:
                  isSelectedDefault[0]?.recurringOnGoingHeadingFontSizeSOF,
                oneOffAdhocFontSize:
                  isSelectedDefault[0]?.oneOffAdhocFontSizeSOF,
                mainHeadingIsBold: isSelectedDefault[0]?.mainHeadingIsBoldSOF,
                mainHeadingIsItalic:
                  isSelectedDefault[0]?.mainHeadingIsItalicSOF,
                recurringOnGoingHeadingIsBold:
                  isSelectedDefault[0]?.recurringOnGoingHeadingIsBoldSOF,
                recurringOnGoingHeadingIsItalic:
                  isSelectedDefault[0]?.recurringOnGoingHeadingIsItalicSOF,
                oneOffAdhocHeadingIsBold:
                  isSelectedDefault[0]?.oneOffAdhocHeadingIsBoldSOF,
                oneOffAdhocHeadingIsItalic:
                  isSelectedDefault[0]?.oneOffAdhocHeadingIsItalicSOF,
              }));
            }

            setServiceDescriptionObj((prev) => ({
              ...prev,
              mainHeading: isSelectedDefault[0]?.mainHeadingSD,
              recurringOnGoingHeading:
                isSelectedDefault[0]?.recurringOnGoingHeadingSD,
              oneOffAdhocHeading: isSelectedDefault[0]?.oneOffAdhocHeadingSD,
              mainHeadingFontSize: isSelectedDefault[0]?.mainHeadingFontSizeSD,
              recurringOnGoingHeadingFontSize:
                isSelectedDefault[0]?.recurringOnGoingHeadingFontSizeSD,
              oneOffAdhocFontSize: isSelectedDefault[0]?.oneOffAdhocFontSizeSD,
              mainHeadingIsBold: isSelectedDefault[0]?.mainHeadingIsBoldSD,
              mainHeadingIsItalic: isSelectedDefault[0]?.mainHeadingIsItalicSD,
              recurringOnGoingHeadingIsBold:
                isSelectedDefault[0]?.recurringOnGoingHeadingIsBoldSD,
              recurringOnGoingHeadingIsItalic:
                isSelectedDefault[0]?.recurringOnGoingHeadingIsItalicSD,
              oneOffAdhocHeadingIsBold:
                isSelectedDefault[0]?.oneOffAdhocHeadingIsBoldSD,
              oneOffAdhocHeadingIsItalic:
                isSelectedDefault[0]?.oneOffAdhocHeadingIsItalicSD,
            }));
            setStatementOfFactsObj((prev) => ({
              ...prev,
              mainHeading: isSelectedDefault[0]?.mainHeadingSOF,
              recurringOnGoingHeading:
                isSelectedDefault[0]?.recurringOnGoingHeadingSOF,
              oneOffAdhocHeading: isSelectedDefault[0]?.oneOffAdhocHeadingSOF,
              mainHeadingFontSize: isSelectedDefault[0]?.mainHeadingFontSizeSOF,
              recurringOnGoingHeadingFontSize:
                isSelectedDefault[0]?.recurringOnGoingHeadingFontSizeSOF,
              oneOffAdhocFontSize: isSelectedDefault[0]?.oneOffAdhocFontSizeSOF,
              mainHeadingIsBold: isSelectedDefault[0]?.mainHeadingIsBoldSOF,
              mainHeadingIsItalic: isSelectedDefault[0]?.mainHeadingIsItalicSOF,
              recurringOnGoingHeadingIsBold:
                isSelectedDefault[0]?.recurringOnGoingHeadingIsBoldSOF,
              recurringOnGoingHeadingIsItalic:
                isSelectedDefault[0]?.recurringOnGoingHeadingIsItalicSOF,
              oneOffAdhocHeadingIsBold:
                isSelectedDefault[0]?.oneOffAdhocHeadingIsBoldSOF,
              oneOffAdhocHeadingIsItalic:
                isSelectedDefault[0]?.oneOffAdhocHeadingIsItalicSOF,
            }));
          } else {
            setEngagementObj({
              ...engagementObj,
              acceptedServicePackageID: null,
              servicePackageKeyID: null,
              ClientID:
                ClientId?.value == undefined
                  ? ClientId
                  : ClientId?.value == null
                    ? null
                    : ClientId?.value,
              clientKeyID:
                ClientId?.clientKeyID == undefined
                  ? null
                  : ClientId?.clientKeyID,
              QuoteKeyID:
                QuoteId?.value == undefined ? QuoteId : QuoteId?.value,
              quoteID:
                QuoteId?.quoteID == undefined ? QuoteId : QuoteId?.quoteID,
              templateKeyID: isSelectedDefault[0]?.templateKeyID,
              templateID: isSelectedDefault[0]?.templateID,
              pricingTableColumnIDs: isSelectedDefault[0]?.pricingTableColumnIDs
                ? isSelectedDefault[0]?.pricingTableColumnIDs
                : "",
            });

            if (isSelectedDefault[0]?.pricingTableColumnIDs !== null) {
              setSelectedTemplateID(6);
              setSelectedTemplateIDOneOff(6);
              updateVisibleFieldsFromIds(
                isSelectedDefault[0]?.pricingTableColumnIDs,
              );
              setServiceDescriptionObj((prev) => ({
                ...prev,
                mainHeading: isSelectedDefault[0]?.mainHeadingSD,
                recurringOnGoingHeading:
                  isSelectedDefault[0]?.recurringOnGoingHeadingSD,
                oneOffAdhocHeading: isSelectedDefault[0]?.oneOffAdhocHeadingSD,
                mainHeadingFontSize:
                  isSelectedDefault[0]?.mainHeadingFontSizeSD,
                recurringOnGoingHeadingFontSize:
                  isSelectedDefault[0]?.recurringOnGoingHeadingFontSizeSD,
                oneOffAdhocFontSize:
                  isSelectedDefault[0]?.oneOffAdhocFontSizeSD,
                mainHeadingIsBold: isSelectedDefault[0]?.mainHeadingIsBoldSD,
                mainHeadingIsItalic:
                  isSelectedDefault[0]?.mainHeadingIsItalicSD,
                recurringOnGoingHeadingIsBold:
                  isSelectedDefault[0]?.recurringOnGoingHeadingIsBoldSD,
                recurringOnGoingHeadingIsItalic:
                  isSelectedDefault[0]?.recurringOnGoingHeadingIsItalicSD,
                oneOffAdhocHeadingIsBold:
                  isSelectedDefault[0]?.oneOffAdhocHeadingIsBoldSD,
                oneOffAdhocHeadingIsItalic:
                  isSelectedDefault[0]?.oneOffAdhocHeadingIsItalicSD,
              }));
              setStatementOfFactsObj((prev) => ({
                ...prev,
                mainHeading: isSelectedDefault[0]?.mainHeadingSOF,
                recurringOnGoingHeading:
                  isSelectedDefault[0]?.recurringOnGoingHeadingSOF,
                oneOffAdhocHeading: isSelectedDefault[0]?.oneOffAdhocHeadingSOF,
                mainHeadingFontSize:
                  isSelectedDefault[0]?.mainHeadingFontSizeSOF,
                recurringOnGoingHeadingFontSize:
                  isSelectedDefault[0]?.recurringOnGoingHeadingFontSizeSOF,
                oneOffAdhocFontSize:
                  isSelectedDefault[0]?.oneOffAdhocFontSizeSOF,
                mainHeadingIsBold: isSelectedDefault[0]?.mainHeadingIsBoldSOF,
                mainHeadingIsItalic:
                  isSelectedDefault[0]?.mainHeadingIsItalicSOF,
                recurringOnGoingHeadingIsBold:
                  isSelectedDefault[0]?.recurringOnGoingHeadingIsBoldSOF,
                recurringOnGoingHeadingIsItalic:
                  isSelectedDefault[0]?.recurringOnGoingHeadingIsItalicSOF,
                oneOffAdhocHeadingIsBold:
                  isSelectedDefault[0]?.oneOffAdhocHeadingIsBoldSOF,
                oneOffAdhocHeadingIsItalic:
                  isSelectedDefault[0]?.oneOffAdhocHeadingIsItalicSOF,
              }));
            }

            setServiceDescriptionObj((prev) => ({
              ...prev,
              mainHeading: isSelectedDefault[0]?.mainHeadingSD,
              recurringOnGoingHeading:
                isSelectedDefault[0]?.recurringOnGoingHeadingSD,
              oneOffAdhocHeading: isSelectedDefault[0]?.oneOffAdhocHeadingSD,
              mainHeadingFontSize: isSelectedDefault[0]?.mainHeadingFontSizeSD,
              recurringOnGoingHeadingFontSize:
                isSelectedDefault[0]?.recurringOnGoingHeadingFontSizeSD,
              oneOffAdhocFontSize: isSelectedDefault[0]?.oneOffAdhocFontSizeSD,
              mainHeadingIsBold: isSelectedDefault[0]?.mainHeadingIsBoldSD,
              mainHeadingIsItalic: isSelectedDefault[0]?.mainHeadingIsItalicSD,
              recurringOnGoingHeadingIsBold:
                isSelectedDefault[0]?.recurringOnGoingHeadingIsBoldSD,
              recurringOnGoingHeadingIsItalic:
                isSelectedDefault[0]?.recurringOnGoingHeadingIsItalicSD,
              oneOffAdhocHeadingIsBold:
                isSelectedDefault[0]?.oneOffAdhocHeadingIsBoldSD,
              oneOffAdhocHeadingIsItalic:
                isSelectedDefault[0]?.oneOffAdhocHeadingIsItalicSD,
            }));
            setStatementOfFactsObj((prev) => ({
              ...prev,
              mainHeading: isSelectedDefault[0]?.mainHeadingSOF,
              recurringOnGoingHeading:
                isSelectedDefault[0]?.recurringOnGoingHeadingSOF,
              oneOffAdhocHeading: isSelectedDefault[0]?.oneOffAdhocHeadingSOF,
              mainHeadingFontSize: isSelectedDefault[0]?.mainHeadingFontSizeSOF,
              recurringOnGoingHeadingFontSize:
                isSelectedDefault[0]?.recurringOnGoingHeadingFontSizeSOF,
              oneOffAdhocFontSize: isSelectedDefault[0]?.oneOffAdhocFontSizeSOF,
              mainHeadingIsBold: isSelectedDefault[0]?.mainHeadingIsBoldSOF,
              mainHeadingIsItalic: isSelectedDefault[0]?.mainHeadingIsItalicSOF,
              recurringOnGoingHeadingIsBold:
                isSelectedDefault[0]?.recurringOnGoingHeadingIsBoldSOF,
              recurringOnGoingHeadingIsItalic:
                isSelectedDefault[0]?.recurringOnGoingHeadingIsItalicSOF,
              oneOffAdhocHeadingIsBold:
                isSelectedDefault[0]?.oneOffAdhocHeadingIsBoldSOF,
              oneOffAdhocHeadingIsItalic:
                isSelectedDefault[0]?.oneOffAdhocHeadingIsItalicSOF,
            }));
          }
          setFontFamily(getFontNameById(isSelectedDefault[0].fontFamilyID));
          setHeaderContent(isSelectedDefault[0].headerContent);
          setFooterContent(isSelectedDefault[0].footerContent);
          setHeaderImage(isSelectedDefault[0].headerImage);
          setFooterImage(isSelectedDefault[0].footerImage);
          setHeaderHeight(isSelectedDefault[0].headerHeight);
          setFooterHeight(isSelectedDefault[0].footerHeight);
          setOrientationID(isSelectedDefault[0].orientationID);
          setShowSeparatorLines(isSelectedDefault[0]?.showSeparatorLines);
          setPricingTableColumnIDs(
            isSelectedDefault[0]?.pricingTableColumnIDs
              ? isSelectedDefault[0]?.pricingTableColumnIDs
              : "",
          );
          if (isSelectedDefault[0]?.pricingTableColumnIDs !== null) {
            setSelectedTemplateID(6);
            setSelectedTemplateIDOneOff(6);
            updateVisibleFieldsFromIds(
              isSelectedDefault[0]?.pricingTableColumnIDs,
            );
            setServiceDescriptionObj((prev) => ({
              ...prev,
              mainHeading: isSelectedDefault[0]?.mainHeadingSD,
              recurringOnGoingHeading:
                isSelectedDefault[0]?.recurringOnGoingHeadingSD,
              oneOffAdhocHeading: isSelectedDefault[0]?.oneOffAdhocHeadingSD,
              mainHeadingFontSize: isSelectedDefault[0]?.mainHeadingFontSizeSD,
              recurringOnGoingHeadingFontSize:
                isSelectedDefault[0]?.recurringOnGoingHeadingFontSizeSD,
              oneOffAdhocFontSize: isSelectedDefault[0]?.oneOffAdhocFontSizeSD,
              mainHeadingIsBold: isSelectedDefault[0]?.mainHeadingIsBoldSD,
              mainHeadingIsItalic: isSelectedDefault[0]?.mainHeadingIsItalicSD,
              recurringOnGoingHeadingIsBold:
                isSelectedDefault[0]?.recurringOnGoingHeadingIsBoldSD,
              recurringOnGoingHeadingIsItalic:
                isSelectedDefault[0]?.recurringOnGoingHeadingIsItalicSD,
              oneOffAdhocHeadingIsBold:
                isSelectedDefault[0]?.oneOffAdhocHeadingIsBoldSD,
              oneOffAdhocHeadingIsItalic:
                isSelectedDefault[0]?.oneOffAdhocHeadingIsItalicSD,
            }));
            setStatementOfFactsObj((prev) => ({
              ...prev,
              mainHeading: isSelectedDefault[0]?.mainHeadingSOF,
              recurringOnGoingHeading:
                isSelectedDefault[0]?.recurringOnGoingHeadingSOF,
              oneOffAdhocHeading: isSelectedDefault[0]?.oneOffAdhocHeadingSOF,
              mainHeadingFontSize: isSelectedDefault[0]?.mainHeadingFontSizeSOF,
              recurringOnGoingHeadingFontSize:
                isSelectedDefault[0]?.recurringOnGoingHeadingFontSizeSOF,
              oneOffAdhocFontSize: isSelectedDefault[0]?.oneOffAdhocFontSizeSOF,
              mainHeadingIsBold: isSelectedDefault[0]?.mainHeadingIsBoldSOF,
              mainHeadingIsItalic: isSelectedDefault[0]?.mainHeadingIsItalicSOF,
              recurringOnGoingHeadingIsBold:
                isSelectedDefault[0]?.recurringOnGoingHeadingIsBoldSOF,
              recurringOnGoingHeadingIsItalic:
                isSelectedDefault[0]?.recurringOnGoingHeadingIsItalicSOF,
              oneOffAdhocHeadingIsBold:
                isSelectedDefault[0]?.oneOffAdhocHeadingIsBoldSOF,
              oneOffAdhocHeadingIsItalic:
                isSelectedDefault[0]?.oneOffAdhocHeadingIsItalicSOF,
            }));
          }
          setServiceDescriptionObj((prev) => ({
            ...prev,
            mainHeading: isSelectedDefault[0]?.mainHeadingSD,
            recurringOnGoingHeading:
              isSelectedDefault[0]?.recurringOnGoingHeadingSD,
            oneOffAdhocHeading: isSelectedDefault[0]?.oneOffAdhocHeadingSD,
            mainHeadingFontSize: isSelectedDefault[0]?.mainHeadingFontSizeSD,
            recurringOnGoingHeadingFontSize:
              isSelectedDefault[0]?.recurringOnGoingHeadingFontSizeSD,
            oneOffAdhocFontSize: isSelectedDefault[0]?.oneOffAdhocFontSizeSD,
            mainHeadingIsBold: isSelectedDefault[0]?.mainHeadingIsBoldSD,
            mainHeadingIsItalic: isSelectedDefault[0]?.mainHeadingIsItalicSD,
            recurringOnGoingHeadingIsBold:
              isSelectedDefault[0]?.recurringOnGoingHeadingIsBoldSD,
            recurringOnGoingHeadingIsItalic:
              isSelectedDefault[0]?.recurringOnGoingHeadingIsItalicSD,
            oneOffAdhocHeadingIsBold:
              isSelectedDefault[0]?.oneOffAdhocHeadingIsBoldSD,
            oneOffAdhocHeadingIsItalic:
              isSelectedDefault[0]?.oneOffAdhocHeadingIsItalicSD,
          }));
          setStatementOfFactsObj((prev) => ({
            ...prev,
            mainHeading: isSelectedDefault[0]?.mainHeadingSOF,
            recurringOnGoingHeading:
              isSelectedDefault[0]?.recurringOnGoingHeadingSOF,
            oneOffAdhocHeading: isSelectedDefault[0]?.oneOffAdhocHeadingSOF,
            mainHeadingFontSize: isSelectedDefault[0]?.mainHeadingFontSizeSOF,
            recurringOnGoingHeadingFontSize:
              isSelectedDefault[0]?.recurringOnGoingHeadingFontSizeSOF,
            oneOffAdhocFontSize: isSelectedDefault[0]?.oneOffAdhocFontSizeSOF,
            mainHeadingIsBold: isSelectedDefault[0]?.mainHeadingIsBoldSOF,
            mainHeadingIsItalic: isSelectedDefault[0]?.mainHeadingIsItalicSOF,
            recurringOnGoingHeadingIsBold:
              isSelectedDefault[0]?.recurringOnGoingHeadingIsBoldSOF,
            recurringOnGoingHeadingIsItalic:
              isSelectedDefault[0]?.recurringOnGoingHeadingIsItalicSOF,
            oneOffAdhocHeadingIsBold:
              isSelectedDefault[0]?.oneOffAdhocHeadingIsBoldSOF,
            oneOffAdhocHeadingIsItalic:
              isSelectedDefault[0]?.oneOffAdhocHeadingIsItalicSOF,
          }));
        } else {
          // Update non-template fields only
          if (QuoteId !== null) {
            setEngagementObj({
              ...engagementObj,
              acceptedServicePackageID: null,
              servicePackageKeyID: null,
              ClientID: QuoteId.clientID,
              clientKeyID:
                ClientId?.clientKeyID == undefined
                  ? null
                  : ClientId?.clientKeyID,
              QuoteKeyID:
                QuoteId?.value == undefined ? QuoteId : QuoteId?.value,
              quoteID:
                QuoteId?.quoteID == undefined ? QuoteId : QuoteId?.quoteID,
              quoteTypeID: isSelectedDefault[0]?.quoteTypeID,
              pricingTableColumnIDs: isSelectedDefault[0]?.pricingTableColumnIDs
                ? isSelectedDefault[0]?.pricingTableColumnIDs
                : "",
            });
            if (isSelectedDefault[0]?.pricingTableColumnIDs !== null) {
              setSelectedTemplateID(6);
              setSelectedTemplateIDOneOff(6);
              updateVisibleFieldsFromIds(
                isSelectedDefault[0]?.pricingTableColumnIDs,
              );
              setServiceDescriptionObj((prev) => ({
                ...prev,
                mainHeading: isSelectedDefault[0]?.mainHeadingSD,
                recurringOnGoingHeading:
                  isSelectedDefault[0]?.recurringOnGoingHeadingSD,
                oneOffAdhocHeading: isSelectedDefault[0]?.oneOffAdhocHeadingSD,
                mainHeadingFontSize:
                  isSelectedDefault[0]?.mainHeadingFontSizeSD,
                recurringOnGoingHeadingFontSize:
                  isSelectedDefault[0]?.recurringOnGoingHeadingFontSizeSD,
                oneOffAdhocFontSize:
                  isSelectedDefault[0]?.oneOffAdhocFontSizeSD,
                mainHeadingIsBold: isSelectedDefault[0]?.mainHeadingIsBoldSD,
                mainHeadingIsItalic:
                  isSelectedDefault[0]?.mainHeadingIsItalicSD,
                recurringOnGoingHeadingIsBold:
                  isSelectedDefault[0]?.recurringOnGoingHeadingIsBoldSD,
                recurringOnGoingHeadingIsItalic:
                  isSelectedDefault[0]?.recurringOnGoingHeadingIsItalicSD,
                oneOffAdhocHeadingIsBold:
                  isSelectedDefault[0]?.oneOffAdhocHeadingIsBoldSD,
                oneOffAdhocHeadingIsItalic:
                  isSelectedDefault[0]?.oneOffAdhocHeadingIsItalicSD,
              }));
              setStatementOfFactsObj((prev) => ({
                ...prev,
                mainHeading: isSelectedDefault[0]?.mainHeadingSOF,
                recurringOnGoingHeading:
                  isSelectedDefault[0]?.recurringOnGoingHeadingSOF,
                oneOffAdhocHeading: isSelectedDefault[0]?.oneOffAdhocHeadingSOF,
                mainHeadingFontSize:
                  isSelectedDefault[0]?.mainHeadingFontSizeSOF,
                recurringOnGoingHeadingFontSize:
                  isSelectedDefault[0]?.recurringOnGoingHeadingFontSizeSOF,
                oneOffAdhocFontSize:
                  isSelectedDefault[0]?.oneOffAdhocFontSizeSOF,
                mainHeadingIsBold: isSelectedDefault[0]?.mainHeadingIsBoldSOF,
                mainHeadingIsItalic:
                  isSelectedDefault[0]?.mainHeadingIsItalicSOF,
                recurringOnGoingHeadingIsBold:
                  isSelectedDefault[0]?.recurringOnGoingHeadingIsBoldSOF,
                recurringOnGoingHeadingIsItalic:
                  isSelectedDefault[0]?.recurringOnGoingHeadingIsItalicSOF,
                oneOffAdhocHeadingIsBold:
                  isSelectedDefault[0]?.oneOffAdhocHeadingIsBoldSOF,
                oneOffAdhocHeadingIsItalic:
                  isSelectedDefault[0]?.oneOffAdhocHeadingIsItalicSOF,
              }));
            }
            setServiceDescriptionObj((prev) => ({
              ...prev,
              mainHeading: isSelectedDefault[0]?.mainHeadingSD,
              recurringOnGoingHeading:
                isSelectedDefault[0]?.recurringOnGoingHeadingSD,
              oneOffAdhocHeading: isSelectedDefault[0]?.oneOffAdhocHeadingSD,
              mainHeadingFontSize: isSelectedDefault[0]?.mainHeadingFontSizeSD,
              recurringOnGoingHeadingFontSize:
                isSelectedDefault[0]?.recurringOnGoingHeadingFontSizeSD,
              oneOffAdhocFontSize: isSelectedDefault[0]?.oneOffAdhocFontSizeSD,
              mainHeadingIsBold: isSelectedDefault[0]?.mainHeadingIsBoldSD,
              mainHeadingIsItalic: isSelectedDefault[0]?.mainHeadingIsItalicSD,
              recurringOnGoingHeadingIsBold:
                isSelectedDefault[0]?.recurringOnGoingHeadingIsBoldSD,
              recurringOnGoingHeadingIsItalic:
                isSelectedDefault[0]?.recurringOnGoingHeadingIsItalicSD,
              oneOffAdhocHeadingIsBold:
                isSelectedDefault[0]?.oneOffAdhocHeadingIsBoldSD,
              oneOffAdhocHeadingIsItalic:
                isSelectedDefault[0]?.oneOffAdhocHeadingIsItalicSD,
            }));
            setStatementOfFactsObj((prev) => ({
              ...prev,
              mainHeading: isSelectedDefault[0]?.mainHeadingSOF,
              recurringOnGoingHeading:
                isSelectedDefault[0]?.recurringOnGoingHeadingSOF,
              oneOffAdhocHeading: isSelectedDefault[0]?.oneOffAdhocHeadingSOF,
              mainHeadingFontSize: isSelectedDefault[0]?.mainHeadingFontSizeSOF,
              recurringOnGoingHeadingFontSize:
                isSelectedDefault[0]?.recurringOnGoingHeadingFontSizeSOF,
              oneOffAdhocFontSize: isSelectedDefault[0]?.oneOffAdhocFontSizeSOF,
              mainHeadingIsBold: isSelectedDefault[0]?.mainHeadingIsBoldSOF,
              mainHeadingIsItalic: isSelectedDefault[0]?.mainHeadingIsItalicSOF,
              recurringOnGoingHeadingIsBold:
                isSelectedDefault[0]?.recurringOnGoingHeadingIsBoldSOF,
              recurringOnGoingHeadingIsItalic:
                isSelectedDefault[0]?.recurringOnGoingHeadingIsItalicSOF,
              oneOffAdhocHeadingIsBold:
                isSelectedDefault[0]?.oneOffAdhocHeadingIsBoldSOF,
              oneOffAdhocHeadingIsItalic:
                isSelectedDefault[0]?.oneOffAdhocHeadingIsItalicSOF,
            }));
          } else {
            setEngagementObj({
              ...engagementObj,
              acceptedServicePackageID: null,
              servicePackageKeyID: null,
              ClientID:
                ClientId?.value == undefined
                  ? ClientId
                  : ClientId?.value == null
                    ? null
                    : ClientId?.value,
              clientKeyID:
                ClientId?.clientKeyID == undefined
                  ? null
                  : ClientId?.clientKeyID,
              QuoteKeyID:
                QuoteId?.value == undefined ? QuoteId : QuoteId?.value,
              quoteID:
                QuoteId?.quoteID == undefined ? QuoteId : QuoteId?.quoteID,
              pricingTableColumnIDs: isSelectedDefault[0]?.pricingTableColumnIDs
                ? isSelectedDefault[0]?.pricingTableColumnIDs
                : "",
            });
            if (isSelectedDefault[0]?.pricingTableColumnIDs !== null) {
              setSelectedTemplateID(6);
              setSelectedTemplateIDOneOff(6);
              updateVisibleFieldsFromIds(
                isSelectedDefault[0]?.pricingTableColumnIDs,
              );
              setServiceDescriptionObj((prev) => ({
                ...prev,
                mainHeading: isSelectedDefault[0]?.mainHeadingSD,
                recurringOnGoingHeading:
                  isSelectedDefault[0]?.recurringOnGoingHeadingSD,
                oneOffAdhocHeading: isSelectedDefault[0]?.oneOffAdhocHeadingSD,
                mainHeadingFontSize:
                  isSelectedDefault[0]?.mainHeadingFontSizeSD,
                recurringOnGoingHeadingFontSize:
                  isSelectedDefault[0]?.recurringOnGoingHeadingFontSizeSD,
                oneOffAdhocFontSize:
                  isSelectedDefault[0]?.oneOffAdhocFontSizeSD,
                mainHeadingIsBold: isSelectedDefault[0]?.mainHeadingIsBoldSD,
                mainHeadingIsItalic:
                  isSelectedDefault[0]?.mainHeadingIsItalicSD,
                recurringOnGoingHeadingIsBold:
                  isSelectedDefault[0]?.recurringOnGoingHeadingIsBoldSD,
                recurringOnGoingHeadingIsItalic:
                  isSelectedDefault[0]?.recurringOnGoingHeadingIsItalicSD,
                oneOffAdhocHeadingIsBold:
                  isSelectedDefault[0]?.oneOffAdhocHeadingIsBoldSD,
                oneOffAdhocHeadingIsItalic:
                  isSelectedDefault[0]?.oneOffAdhocHeadingIsItalicSD,
              }));
              setStatementOfFactsObj((prev) => ({
                ...prev,
                mainHeading: isSelectedDefault[0]?.mainHeadingSOF,
                recurringOnGoingHeading:
                  isSelectedDefault[0]?.recurringOnGoingHeadingSOF,
                oneOffAdhocHeading: isSelectedDefault[0]?.oneOffAdhocHeadingSOF,
                mainHeadingFontSize:
                  isSelectedDefault[0]?.mainHeadingFontSizeSOF,
                recurringOnGoingHeadingFontSize:
                  isSelectedDefault[0]?.recurringOnGoingHeadingFontSizeSOF,
                oneOffAdhocFontSize:
                  isSelectedDefault[0]?.oneOffAdhocFontSizeSOF,
                mainHeadingIsBold: isSelectedDefault[0]?.mainHeadingIsBoldSOF,
                mainHeadingIsItalic:
                  isSelectedDefault[0]?.mainHeadingIsItalicSOF,
                recurringOnGoingHeadingIsBold:
                  isSelectedDefault[0]?.recurringOnGoingHeadingIsBoldSOF,
                recurringOnGoingHeadingIsItalic:
                  isSelectedDefault[0]?.recurringOnGoingHeadingIsItalicSOF,
                oneOffAdhocHeadingIsBold:
                  isSelectedDefault[0]?.oneOffAdhocHeadingIsBoldSOF,
                oneOffAdhocHeadingIsItalic:
                  isSelectedDefault[0]?.oneOffAdhocHeadingIsItalicSOF,
              }));
            }
            setServiceDescriptionObj((prev) => ({
              ...prev,
              mainHeading: isSelectedDefault[0]?.mainHeadingSD,
              recurringOnGoingHeading:
                isSelectedDefault[0]?.recurringOnGoingHeadingSD,
              oneOffAdhocHeading: isSelectedDefault[0]?.oneOffAdhocHeadingSD,
              mainHeadingFontSize: isSelectedDefault[0]?.mainHeadingFontSizeSD,
              recurringOnGoingHeadingFontSize:
                isSelectedDefault[0]?.recurringOnGoingHeadingFontSizeSD,
              oneOffAdhocFontSize: isSelectedDefault[0]?.oneOffAdhocFontSizeSD,
              mainHeadingIsBold: isSelectedDefault[0]?.mainHeadingIsBoldSD,
              mainHeadingIsItalic: isSelectedDefault[0]?.mainHeadingIsItalicSD,
              recurringOnGoingHeadingIsBold:
                isSelectedDefault[0]?.recurringOnGoingHeadingIsBoldSD,
              recurringOnGoingHeadingIsItalic:
                isSelectedDefault[0]?.recurringOnGoingHeadingIsItalicSD,
              oneOffAdhocHeadingIsBold:
                isSelectedDefault[0]?.oneOffAdhocHeadingIsBoldSD,
              oneOffAdhocHeadingIsItalic:
                isSelectedDefault[0]?.oneOffAdhocHeadingIsItalicSD,
            }));
            setStatementOfFactsObj((prev) => ({
              ...prev,
              mainHeading: isSelectedDefault[0]?.mainHeadingSOF,
              recurringOnGoingHeading:
                isSelectedDefault[0]?.recurringOnGoingHeadingSOF,
              oneOffAdhocHeading: isSelectedDefault[0]?.oneOffAdhocHeadingSOF,
              mainHeadingFontSize: isSelectedDefault[0]?.mainHeadingFontSizeSOF,
              recurringOnGoingHeadingFontSize:
                isSelectedDefault[0]?.recurringOnGoingHeadingFontSizeSOF,
              oneOffAdhocFontSize: isSelectedDefault[0]?.oneOffAdhocFontSizeSOF,
              mainHeadingIsBold: isSelectedDefault[0]?.mainHeadingIsBoldSOF,
              mainHeadingIsItalic: isSelectedDefault[0]?.mainHeadingIsItalicSOF,
              recurringOnGoingHeadingIsBold:
                isSelectedDefault[0]?.recurringOnGoingHeadingIsBoldSOF,
              recurringOnGoingHeadingIsItalic:
                isSelectedDefault[0]?.recurringOnGoingHeadingIsItalicSOF,
              oneOffAdhocHeadingIsBold:
                isSelectedDefault[0]?.oneOffAdhocHeadingIsBoldSOF,
              oneOffAdhocHeadingIsItalic:
                isSelectedDefault[0]?.oneOffAdhocHeadingIsItalicSOF,
            }));
          }
        }
      } else {
        setLoader(false);
        console.error("Error fetching data from the API");
      }
    } catch (error) {
      setLoader(false);
      console.error("Error fetching data from the API", error);
    }
  };
  //7) Get TnC Model data api  call
  const GetTermsAndConditionsModelData = async (e) => {
    try {
      const response = await GetTermsAndConditionsModel(e.value);
      setLoader(true);
      if (response.data.statusCode == 200) {
        setLoader(false);
        const pdf = response.data.responseData.data.pdf;
        const htmlContent =
          response.data.responseData.data.templateElementList[0]?.htmlContent;

        // Update engagementObj based on response data
        if (pdf === null) {
          setEngagementObj({
            ...engagementObj,
            pdf: null,
            tnCTemplateContent: htmlContent,
            tnCTemplateKeyID: e.value,
            tnCTemplateID: e.templateID,
          });
        } else {
          setEngagementObj({
            ...engagementObj,
            pdf: pdf,
            tnCTemplateContent: null,
            tnCTemplateKeyID: e.value,
            tnCTemplateID: e.templateID,
          });
          setTimeout(function () {
            scrollUpDownByElementID("TnC-EditorDiv");
          }, 200);
        }
      } else {
        setLoader(false);
        setErrorMessage(response.data.errorMessage);
      }
    } catch (error) {
      setLoader(false);
      console.error("Error fetching terms and conditions data:", error);
      // Optionally, handle the error here, e.g., display an error message
    }
  };

  //8) Get TnC lookup list api  call
  const GetTermsAndConditionsLookupListData = async () => {
    try {
      const response = await GetTermsAndConditionsLookupList(
        common.organisationKeyID,
      );
      setLoader(true);
      // setTnCLookupList()
      if (response.data.statusCode === 200) {
        setLoader(false);
        let TnCTypeData = response.data.responseData.data.map((item) => ({
          value: item.templateKeyID,
          label: item.templateName,
          templateID: item.templateID,
          isDefault: item.isDefault,
        }));
        setTnCLookupList(TnCTypeData);
        const isSelectedDefault = TnCTypeData.find(
          (item) => item.isDefault === true,
        );
        await GetTermsAndConditionsModelData(isSelectedDefault);
      } else {
        setLoader(false);
        setErrorMessage(response.data.errorMessage);
      }
    } catch (error) {
      setLoader(false);
    }
  };

  //9) Get first Signatory user data api  call
  const GetOfficersForQuoteAndContractData = async (id) => {
    setLoader(true);
    try {
      const data = await GetOfficersForQuoteAndContract(id);
      if (data?.data?.statusCode === 200) {
        setLoader(false);
        if (data?.data?.responseData?.data) {
          const ModelData = data?.data?.responseData?.data;
          setContractSignatoriesList(ModelData);
        }
      } else {
        setLoader(false);
        setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      setLoader(false);
      console.log(error);
    }
  };
  //variable change in term and condition function
  const GetVariableValuesForTnCTemplateData = async () => {
    const VariableData = await GetVariableValuesForTnCTemplate(
      engagementObj.ClientID,
    );

    let variables = VariableData.data?.responseData?.data;

    // Function to escape special characters in a string to be used in a regular expression
    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    const replaceVariables = (htmlContent, variables) => {
      let replacedHtmlContent = htmlContent;
      variables?.forEach(({ variableName, variableValue }) => {
        const regex = new RegExp(escapeRegExp(variableName), "g");
        if (variableValue !== null) {
          replacedHtmlContent = replacedHtmlContent?.replace(
            regex,
            variableValue,
          );
        }
      });
      return replacedHtmlContent;
    };

    const htmlContent = replaceVariables(
      engagementObj.tnCTemplateContent,
      variables,
    );
    setUpdatedTnCData(htmlContent);
  };

  //10) Get Calculate services price api  call
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
          const adjustedServiceNames = PricingData.filter(
            (s) => s.isPriceAdjustedToZero,
          ).map((s) => s.serviceName);
          const vatPercentage = data?.data?.responseData?.vatPercentage;
          setSelectedPackagesList(data?.data?.responseData?.packageList);
          if (tab === 4) {
            GetVariableValuesForTnCTemplateData();

            const RecurringServicePrices = {};
            const OneOffServicePrices = {};
            let hasError = false;
            const oneOffService = [];
            const RecurringService = [];
            setVATPercentage(vatPercentage);
            // Populate the service prices object with service IDs as keys and prices as values
            PricingData.filter(
              (item) => item.serviceChargeTypeID === 1,
            ).forEach((service) => {
              if (!RecurringServicePrices[service.serviceCatID]) {
                RecurringServicePrices[service.serviceCatID] = {};
              }
              const ValidPrice = isValidNumber(service.price);
              if (!ValidPrice) {
                hasError = true;
                RecurringService.push(service);
              }
              RecurringServicePrices[service.serviceCatID][service.serviceID] =
                {
                  price: service.price,
                  originalServicePrice: service.price,
                  serviceDescription: service.serviceDescription,
                };
            });
            PricingData.filter(
              (item) => item.serviceChargeTypeID === 2,
            ).forEach((service) => {
              if (!OneOffServicePrices[service.serviceCatID]) {
                OneOffServicePrices[service.serviceCatID] = {};
              }
              const ValidPrice = isValidNumber(service.price);
              if (!ValidPrice) {
                hasError = true;
                oneOffService.push(service);
              }
              OneOffServicePrices[service.serviceCatID][service.serviceID] = {
                price: service.price,
                originalServicePrice: service.price,
                serviceDescription: service.serviceDescription,
              };
            });
            if (hasError) {
              showModalRecordsAvailable(
                `The result of this operation is too large to be processed. Please check the following services.`,
                [...RecurringService, ...oneOffService],
              );
              return;
            } else {
              setModelRequestData({
                ...modelRequestData,
                Action: null,
                DriverName: [],
                message: "",
              });
            }
            const recArray = recurringServiceList
              .filter((category) =>
                category.servicesList.some((service) => service.isSelected),
              )
              .map((category) => ({
                serviceCatID: category.serviceCatID,
                serviceCatName: category.serviceCatName,
                servicesList: category.servicesList.filter(
                  (service) => service.isSelected,
                ),
              }));

            const OneArray = oneOffServiceList
              .filter((category) =>
                category.servicesList.some((service) => service.isSelected),
              )
              .map((category) => ({
                serviceCatID: category.serviceCatID,
                serviceCatName: category.serviceCatName,
                servicesList: category.servicesList.filter(
                  (service) => service.isSelected,
                ),
              }));

            const recArrayWithPrice = await recArray.map((category) => ({
              serviceCatID: category.serviceCatID,
              serviceCatName: category.serviceCatName,
              servicesList: category.servicesList.map((service) => ({
                ...service,
                price:
                  RecurringServicePrices[category.serviceCatID][
                    service.serviceID
                  ].price, // Add the price corresponding to the service ID
                originalServicePrice:
                  RecurringServicePrices[category.serviceCatID][
                    service.serviceID
                  ].originalServicePrice, // Add the price corresponding to the service ID
                serviceDescription:
                  RecurringServicePrices[category.serviceCatID][
                    service.serviceID
                  ].serviceDescription,
              })),
            }));

            const recArrayWithPriceCopy = await recArray.map((category) => ({
              serviceCatID: category.serviceCatID,
              serviceCatName: category.serviceCatName,
              servicesList: category.servicesList.map((service) => {
                let price =
                  RecurringServicePrices[category.serviceCatID][
                    service.serviceID
                  ].price; // Default price
                let originalServicePrice =
                  RecurringServicePrices[category.serviceCatID][
                    service.serviceID
                  ].originalServicePrice; // Default price
                let serviceDescription =
                  RecurringServicePrices[category.serviceCatID][
                    service.serviceID
                  ].serviceDescription;
                // Adjust price based on payment frequency
                switch (engagementObj.Payment_Frequency) {
                  case 1:
                    price *= 1; // No adjustment needed for yearly
                    originalServicePrice *= 1; // No adjustment needed for yearly
                    break;
                  case 4:
                    price *= 12; // Multiply by 12 for monthly
                    originalServicePrice *= 12; // Multiply by 12 for monthly
                    break;
                  case 3:
                    price *= 4; // Multiply by 4 for quarterly
                    originalServicePrice *= 4; // Multiply by 4 for quarterly
                    break;
                  case 2:
                    price *= 2; // Multiply by 2 for half-yearly
                    originalServicePrice *= 2; // Multiply by 2 for half-yearly
                    break;
                  default:
                    // Handle unsupported frequency types or default to yearly
                    price *= 1;
                    break;
                }

                return {
                  ...service,
                  price: price,
                  originalServicePrice: originalServicePrice,
                  serviceDescription: serviceDescription,
                };
              }),
            }));

            const OneArrayWithPrice = await OneArray.map((category) => ({
              serviceCatID: category.serviceCatID,
              serviceCatName: category.serviceCatName,
              servicesList: category.servicesList.map((service) => {
                let price =
                  OneOffServicePrices[category.serviceCatID][service.serviceID]
                    .price; // Default price
                let originalServicePrice =
                  OneOffServicePrices[category.serviceCatID][service.serviceID]
                    .originalServicePrice; // Default price
                let serviceDescription =
                  OneOffServicePrices[category.serviceCatID][service.serviceID]
                    .serviceDescription;
                // Convert price to yearly based on payment frequency
                switch (engagementObj.Payment_Frequency) {
                  case 1:
                    price *= 1; // No adjustment needed for yearly
                    originalServicePrice *= 1; // No adjustment needed for yearly
                    break;
                  case 4:
                    price *= 12; // Multiply by 12 for monthly
                    originalServicePrice *= 12; // Multiply by 12 for monthly
                    break;
                  case 3:
                    price *= 4; // Multiply by 4 for quarterly
                    originalServicePrice *= 4; // Multiply by 4 for quarterly
                    break;
                  case 2:
                    price *= 2; // Multiply by 2 for half-yearly
                    originalServicePrice *= 2; // Multiply by 2 for half-yearly
                    break;
                  default:
                    // Handle unsupported frequency types or default to yearly
                    price *= 1;
                    originalServicePrice *= 1;
                    break;
                }

                return {
                  ...service,
                  price: price,
                  originalServicePrice: originalServicePrice,
                  serviceDescription: serviceDescription,
                };
              }),
            }));

            setSelectedRecurringServiceList(recArrayWithPrice);
            setSelectedOneOffServiceList(OneArrayWithPrice);
            setSelectedRecurringServiceListCopy(recArrayWithPriceCopy);
            let RecTotal = 0;
            let OneOffTotal = 0;
            recArrayWithPrice.forEach((category) => {
              category.servicesList.forEach((service) => {
                // Perform the percentage calculation for each value
                let currentServicePrice =
                  service.originalServicePrice === undefined
                    ? (service.quotationPrice = Number(service.quotationPrice))
                    : (service.originalServicePrice = Number(
                        service.originalServicePrice,
                      ));

                let currentServicePriceWithToFixed =
                  Number(currentServicePrice)?.toFixed(2);
                RecTotal = Number(
                  Number(RecTotal) + Number(currentServicePriceWithToFixed),
                )?.toFixed(2);
              });
            });
            OneArrayWithPrice.forEach((category) => {
              category.servicesList.forEach((service) => {
                // Perform the percentage calculation for each value
                let currentServicePrice =
                  service.originalServicePrice === undefined
                    ? (service.quotationPrice = Number(service.quotationPrice))
                    : (service.originalServicePrice = Number(
                        service.originalServicePrice,
                      ));

                let currentServicePriceWithToFixed =
                  Number(currentServicePrice)?.toFixed(2);
                OneOffTotal = Number(
                  Number(OneOffTotal) + Number(currentServicePriceWithToFixed),
                )?.toFixed(2);
              });
            });
            let recOriginalPrice = 0.0;
            let recDefaultPrice = 0.0;
            let recMinPrice = 0.0;
            let recVATPrice = 0.0;
            let recDiscount = 0.0;
            let recDefaultDiscount = 0.0;
            let recMaxDiscount = 0.0;
            let recGrandTotal = 0.0;

            let recOriginalPriceCopy = 0.0;
            let recDefaultPriceCopy = 0.0;
            let recMinPriceCopy = 0.0;
            let recVATPriceCopy = 0.0;
            let recDiscountCopy = 0.0;
            let recDefaultDiscountCopy = 0.0;
            let recMaxDiscountCopy = 0.0;
            let recGrandTotalCopy = 0.0;

            let multiplicationFactor = 1; // Default to yearly

            switch (engagementObj.Payment_Frequency) {
              case 4:
                multiplicationFactor = 12; // Convert to yearly
                break;
              case 3:
                multiplicationFactor = 4; // Convert to yearly
                break;
              case 2:
                multiplicationFactor = 2; // Convert to yearly
                break;
              // No adjustment needed for yearly
              case 1:
              default:
                break;
            }
            recOriginalPriceCopy = Number(
              Number(RecTotal) * Number(multiplicationFactor),
            ).toFixed(12);
            recOriginalPrice = Number(RecTotal).toFixed(12);

            if (
              RecurringPricingInfo.OriginalPrice === "" ||
              RecurringPricingInfo.OriginalPrice === null ||
              RecurringPricingInfo.OriginalPrice === undefined ||
              RecurringPricingInfo.DefaultDiscount === "" ||
              RecurringFrequencyPricingInfo.DefaultDiscount === null ||
              RecurringFrequencyPricingInfo.DefaultDiscount === undefined ||
              RecurringFrequencyPricingInfo.DefaultDiscount === "0.00" ||
              RecurringFrequencyPricingInfo.DefaultDiscount == 0 ||
              Number(RecTotal)?.toFixed(2) !==
                Number(RecurringPricingInfo.OriginalPrice)?.toFixed(2)
            ) {
              recDefaultPrice = Number(RecTotal)?.toFixed(2);

              // recDefaultPrice = RecTotal?.toFixed(2);
              recVATPrice = Number(recOriginalPrice) * (vatPercentage / 100);
              recGrandTotal = Number(recVATPrice) + Number(recOriginalPrice);
              recDefaultPriceCopy =
                Number(RecTotal) * Number(multiplicationFactor);
              recMinPriceCopy = Number(RecTotal) * Number(multiplicationFactor);

              recVATPriceCopy =
                Number(recOriginalPrice) * (vatPercentage / 100);
              recGrandTotalCopy =
                Number(recVATPrice) + Number(recOriginalPrice);
            } else {
              // recOriginalPrice = Number(RecurringPricingInfo.OriginalPrice);
              recDefaultPrice = RecurringPricingInfo.DiscountedPrice;

              const truncatedTotal = Math.trunc(recDefaultPrice * 100) / 100;
              recDefaultPrice = Number(truncatedTotal)?.toFixed(2);
              if (
                RecurringPricingInfo.DiscountedPrice === undefined ||
                RecurringPricingInfo.DiscountedPrice === "" ||
                RecurringPricingInfo.DiscountedPrice === null
              ) {
                recDefaultPrice =
                  Number(RecTotal) *
                  (1 - Number(RecurringPricingInfo.DefaultDiscount) / 100);
                recDefaultPrice = Number(recDefaultPrice)?.toFixed(2);
              }

              // recDefaultPrice =
              //   Number(RecurringPricingInfo.DiscountedPrice)?.toFixed(2);
              recVATPrice = Number(recDefaultPrice) * (vatPercentage / 100);
              recGrandTotal = Number(recVATPrice) + Number(recDefaultPrice);

              recDiscount = Number(recOriginalPrice) - Number(recDefaultPrice); //RecurringPricingInfo.Discount;
              recDefaultDiscount = RecurringPricingInfo.DefaultDiscount;
              recMaxDiscount = RecurringPricingInfo.MaxDiscount;

              // recDefaultPriceCopy = Number(
              //   RecurringPricingInfo.DiscountedPrice) * Number(multiplicationFactor)

              recDefaultDiscountCopy =
                RecurringFrequencyPricingInfo.DefaultDiscount;
              recDefaultPriceCopy =
                Number(recOriginalPriceCopy) -
                Number(recOriginalPriceCopy) * (recDefaultDiscountCopy / 100);

              recVATPriceCopy = Number(recDefaultPrice) * (vatPercentage / 100);
              recGrandTotalCopy = Number(recVATPrice) + Number(recDefaultPrice);
              recDiscountCopy =
                Number(recOriginalPriceCopy) - Number(recDefaultPriceCopy); //RecurringPricingInfo.Discount;

              recMaxDiscountCopy = RecurringPricingInfo.MaxDiscount;
            }

            setRecurringPricingInfo({
              ...RecurringPricingInfo,
              OriginalPrice: recOriginalPrice,
              DiscountedPrice: recDefaultPrice,
              MinPrice: recMinPrice,
              VATPrice: recVATPrice,
              Discount: recDiscount,
              DefaultDiscount: Number(recDefaultDiscount).toFixed(2),
              // DefaultDiscount: Number(recDefaultDiscount).toFixed(2),
              GrandTotal: recGrandTotal,
            });

            // Assuming paymentFrequencyType is a variable that holds the payment frequency type

            setRecurringFrequencyPricingInfo({
              ...RecurringFrequencyPricingInfo,
              OriginalPrice: recOriginalPriceCopy,
              DiscountedPrice: Number(recDefaultPriceCopy),
              MinPrice: recMinPriceCopy,
              VATPrice: recVATPriceCopy,
              Discount: recDiscountCopy,
              DefaultDiscount: recDefaultDiscountCopy,
              GrandTotal: recGrandTotalCopy,
            });

            let oneOffOriginalPrice = 0.0;
            let oneOffDiscountedPrice = 0.0;
            let oneOffMinPrice = 0.0;
            let oneOffVATPrice = 0.0;
            let oneOffDiscount = 0.0;
            let oneOffDefaultDiscount = 0.0;
            let oneOffDefaultDiscountCopy = 0.0;
            let oneOffMaxDiscount = 0.0;
            let oneOffGrandTotal = 0.0;

            oneOffOriginalPrice = Number(OneOffTotal).toFixed(12);

            if (
              OneOffPricingInfo.OriginalPrice === "" ||
              OneOffPricingInfo.OriginalPrice === null ||
              OneOffPricingInfo.OriginalPrice === undefined ||
              OneOffPricingInfo.DefaultDiscount === "" ||
              OneOffPricingInfoCopy.DefaultDiscount === null ||
              OneOffPricingInfoCopy.DefaultDiscount === undefined ||
              OneOffPricingInfoCopy.DefaultDiscount === "0.00" ||
              OneOffPricingInfoCopy.DefaultDiscount === 0 ||
              Number(OneOffTotal)?.toFixed(2) !==
                Number(OneOffPricingInfo.OriginalPrice)?.toFixed(2)
            ) {
              oneOffDiscountedPrice = Number(OneOffTotal)?.toFixed(2);

              oneOffVATPrice =
                Number(oneOffOriginalPrice) * (vatPercentage / 100);
              oneOffGrandTotal =
                Number(oneOffVATPrice) + Number(oneOffOriginalPrice);
            } else {
              oneOffDiscountedPrice = OneOffPricingInfo.DiscountedPrice;
              const truncatedTotal =
                Math.trunc(oneOffDiscountedPrice * 100) / 100;
              oneOffDiscountedPrice = Number(truncatedTotal)?.toFixed(2);
              if (
                OneOffPricingInfo.DiscountedPrice === undefined ||
                OneOffPricingInfo.DiscountedPrice === "" ||
                OneOffPricingInfo.DiscountedPrice === null
              ) {
                oneOffDiscountedPrice =
                  Number(OneOffTotal) *
                  (1 - Number(OneOffPricingInfoCopy.DefaultDiscount) / 100);
                oneOffDiscountedPrice = oneOffDiscountedPrice.toFixed(2);
              }

              // oneOffDiscountedPrice = Number(
              //   OneOffPricingInfo.DiscountedPrice
              // )?.toFixed(2);
              oneOffMinPrice = Number(OneOffPricingInfo.MinPrice)?.toFixed(2);
              oneOffVATPrice =
                Number(oneOffDiscountedPrice) * (vatPercentage / 100);
              oneOffGrandTotal =
                Number(oneOffVATPrice) + Number(oneOffDiscountedPrice);
              oneOffDiscount = OneOffPricingInfo.Discount;
              oneOffDefaultDiscount = OneOffPricingInfo.DefaultDiscount;
              oneOffDefaultDiscountCopy = OneOffPricingInfoCopy.DefaultDiscount;
              oneOffMaxDiscount = OneOffPricingInfo.MaxDiscount;
            }

            setOneOffPricingInfo({
              ...OneOffPricingInfo,
              OriginalPrice: oneOffOriginalPrice,
              DiscountedPrice: oneOffDiscountedPrice,
              MinPrice: oneOffMinPrice,
              VATPrice: oneOffVATPrice,
              Discount: oneOffDiscount,
              // DefaultDiscount: Number(oneOffDefaultDiscount).toFixed(2),
              DefaultDiscount: Number(oneOffDefaultDiscount).toFixed(2),
              MaxDiscount: Number(oneOffMaxDiscount).toFixed(2),
              GrandTotal: oneOffGrandTotal,
            });

            setOneOffPricingInfoCopy({
              ...OneOffPricingInfoCopy,
              OriginalPrice: oneOffOriginalPrice,
              DiscountedPrice: oneOffDiscountedPrice,
              MinPrice: oneOffMinPrice,
              VATPrice: oneOffVATPrice,
              Discount: oneOffDiscount,
              DefaultDiscount: oneOffDefaultDiscountCopy,
              GrandTotal: oneOffGrandTotal,
            });
            if (adjustedServiceNames.length > 0) {
              setPriceAdjustedServices(adjustedServiceNames);
              setOpenPriceAdjustedModal(true);
            }
            setActiveTab(tab);
            setIsValidForm({
              ...isValidForm,
              AdditionalInfo: true,
              SelectService: true,
            });
          }
        } else {
          HandleTabChange(3);
          setIsValidForm({
            ...isValidForm,
            AdditionalInfo: true,
            SelectService: true,
          });
          setLoader(false);
        }
      } else {
        setLoader(false);
        setOpenErrorModal(true);
        setErrorMessage(
          "The result of this operation is too large to be processed. Please check the input values and try again.",
        );
        setActiveTab(activeTab);
        return;
      }
    } catch (error) {
      setLoader(false);
      setIsValidForm({
        ...isValidForm,
        AdditionalInfo: true,
      });
      setLoader(false);
      console.log(error);
    }
  };
  function roundUpToSixDecimals(num) {
    num = Number(num)?.toFixed(2);
    return Number(num);
    // if (num === null) return 0;
    // const factor = Math.pow(10, 6);
    // return (Math.ceil(num * factor) / factor).toFixed(6);
  }
  function updatePackageIDs(data) {
    data.forEach((category) => {
      category.servicesList.forEach((service) => {
        if (!service.isAdditionalService) {
          if (!service.servicePackageIDs.includes(service.packageOneID)) {
            service.packageOneID = null;
          }
          if (!service.servicePackageIDs.includes(service.packageTwoID)) {
            service.packageTwoID = null;
          }
          if (!service.servicePackageIDs.includes(service.packageThreeID)) {
            service.packageThreeID = null;
          }
        }
      });
    });
    return data; // Return updated data array
  }
  const GetCalculatedPackageServicesPriceData = async (
    obj,
    tab,
    recurringServiceListData,
    oneOffServiceListData,
  ) => {
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
          const adjustedServiceNames = PricingData.filter(
            (s) => s.isPriceAdjustedToZero,
          ).map((s) => s.serviceName);
          const vatPercentage = data?.data?.responseData?.vatPercentage;
          setVATPercentage(vatPercentage);
          GetVariableValuesForTnCTemplateData();
          setSelectedPackagesList(data?.data?.responseData?.packageList);
          const PackageList = data?.data?.responseData?.packageList;

          const serviceMappingWithPackagesList =
            data?.data?.responseData?.serviceMappingWithPackagesList;
          let recurringServices = serviceMappingWithPackagesList.filter(
            (item) => item.serviceChargeTypeID === 1,
          );
          let OneOffServices = serviceMappingWithPackagesList.filter(
            (item) => item.serviceChargeTypeID === 2,
          );
          const RecurringServicePrices = {};
          const OneOffServicePrices = {};
          let recArray = [];
          let OneArray = [];
          let hasError = false;
          const oneOffService = [];
          const RecurringService = [];
          // Populate the RecurringServicePrices object
          PricingData.filter((item) => item.serviceChargeTypeID === 1).forEach(
            (service) => {
              // Initialize the category object if it doesn't exist
              if (!RecurringServicePrices[service.serviceCatID]) {
                RecurringServicePrices[service.serviceCatID] = {};
              }
              let ValidPrice = isValidNumber(service.price);
              if (engagementObj.selectSourceId === 1) {
                ValidPrice = isValidNumber(service.price);
              } else {
                // Check validity for all three package values
                ValidPrice =
                  isValidNumber(service.packageOneValue) &&
                  isValidNumber(service.packageTwoValue) &&
                  isValidNumber(service.packageThreeValue);
              }
              if (!ValidPrice) {
                hasError = true;
                RecurringService.push(service);
              }
              RecurringServicePrices[service.serviceCatID][service.serviceID] =
                {
                  serviceCatID: service.serviceCatID,
                  price: roundUpToSixDecimals(Number(service.price)),
                  originalServicePrice: Number(service.price),
                  serviceDescription: service.serviceDescription,
                  packageOneValue: roundUpToSixDecimals(
                    Number(service.packageOneValue),
                  ),
                  packageTwoValue: roundUpToSixDecimals(
                    Number(service.packageTwoValue),
                  ),
                  packageThreeValue: roundUpToSixDecimals(
                    Number(service.packageThreeValue),
                  ),
                  originalPackageOneValue: service.packageOneValue,
                  originalPackageTwoValue: service.packageTwoValue,
                  originalPackageThreeValue: service.packageThreeValue,
                  servicePackageIDs: service.servicePackageIDs,
                  packageOneID: service.packageOneID,
                  packageTwoID: service.packageTwoID,
                  packageThreeID: service.packageThreeID,
                  isAdditionalService: service.isAdditionalService,
                };
            },
          );

          // Populate the OneOffServicePrices object
          PricingData.filter((item) => item.serviceChargeTypeID === 2).forEach(
            (service) => {
              // Initialize the category object if it doesn't exist
              if (!OneOffServicePrices[service.serviceCatID]) {
                OneOffServicePrices[service.serviceCatID] = {};
              }
              let ValidPrice = isValidNumber(service.price);
              if (engagementObj.selectSourceId === 1) {
                ValidPrice = isValidNumber(service.price);
              } else {
                // Check validity for all three package values
                ValidPrice =
                  isValidNumber(service.packageOneValue) &&
                  isValidNumber(service.packageTwoValue) &&
                  isValidNumber(service.packageThreeValue);
              }
              if (!ValidPrice) {
                hasError = true;
                oneOffService.push(service);
              }
              OneOffServicePrices[service.serviceCatID][service.serviceID] = {
                serviceCatID: service.serviceCatID,
                price: roundUpToSixDecimals(Number(service.price)),
                originalServicePrice: Number(service.price),
                serviceDescription: service.serviceDescription,
                packageOneValue: roundUpToSixDecimals(
                  Number(service.packageOneValue),
                ),
                packageTwoValue: roundUpToSixDecimals(
                  Number(service.packageTwoValue),
                ),
                packageThreeValue: roundUpToSixDecimals(
                  Number(service.packageThreeValue),
                ),
                originalPackageOneValue: service.packageOneValue,
                originalPackageTwoValue: service.packageTwoValue,
                originalPackageThreeValue: service.packageThreeValue,
                servicePackageIDs: service.servicePackageIDs,
                packageOneID: service.packageOneID,
                packageTwoID: service.packageTwoID,
                packageThreeID: service.packageThreeID,
                isAdditionalService: service.isAdditionalService,
              };
            },
          );
          if (hasError) {
            showModalRecordsAvailable(
              `The result of this operation is too large to be processed. Please check the following services.`,
              [...RecurringService, ...oneOffService],
            );
            return;
          } else {
            setModelRequestData({
              ...modelRequestData,
              Action: null,
              DriverName: [],
              message: "",
            });
          }
          if (engagementObj.selectSourceId === 3) {
            recArray = recurringServiceList
              .filter((category) =>
                category.servicesList.some((service) => service.isSelected),
              )
              .map((category) => ({
                serviceCatID: category.serviceCatID,
                serviceCatName: category.serviceCatName,
                servicesList: category.servicesList.filter(
                  (service) => service.isSelected,
                ),
              }));
            OneArray = oneOffServiceList
              .filter((category) =>
                category.servicesList.some((service) => service.isSelected),
              )
              .map((category) => ({
                serviceCatID: category.serviceCatID,
                serviceCatName: category.serviceCatName,
                servicesList: category.servicesList.filter(
                  (service) => service.isSelected,
                ),
              }));
          } else if (engagementObj.selectSourceId === 4) {
            recArray = recurringServiceListData
              .filter((category) =>
                category.servicesList.some((service) => service.isSelected),
              )
              .map((category) => ({
                serviceCatID: category.serviceCatID,
                serviceCatName: category.serviceCatName,
                servicesList: category.servicesList.filter(
                  (service) => service.isSelected,
                ),
              }));
            OneArray = oneOffServiceListData
              .filter((category) =>
                category.servicesList.some((service) => service.isSelected),
              )
              .map((category) => ({
                serviceCatID: category.serviceCatID,
                serviceCatName: category.serviceCatName,
                servicesList: category.servicesList.filter(
                  (service) => service.isSelected,
                ),
              }));
          }

          let recArrayWithPrice = await Promise.all(
            recArray.map(async (category) => ({
              serviceCatID: category.serviceCatID,
              serviceCatName: category.serviceCatName,
              servicesList: await Promise.all(
                category.servicesList.map((service) => {
                  const servicePriceData =
                    RecurringServicePrices[category.serviceCatID][
                      service.serviceID
                    ];
                  let updatedServicePackageIDs = [];
                  let packageOneData = servicePriceData.originalPackageOneValue; // Could be undefined
                  let packageTwoData = servicePriceData.originalPackageTwoValue; // Could be undefined
                  let packageThreeData =
                    servicePriceData.originalPackageThreeValue;
                  if (engagementObj.selectSourceId === 3) {
                    packageOneData = servicePriceData.originalPackageOneValue; // Could be undefined
                    packageTwoData = servicePriceData.originalPackageTwoValue; // Could be undefined
                    packageThreeData =
                      servicePriceData.originalPackageThreeValue; // Could be undefined
                  } else if (engagementObj.selectSourceId === 4) {
                    packageOneData = recurringServices.find(
                      (item) =>
                        item.servicePackageID ===
                          servicePriceData.packageOneID &&
                        service.serviceID === item.serviceID &&
                        item.serviceCatID === category.serviceCatID,
                    )?.price;

                    packageTwoData = recurringServices.find(
                      (item) =>
                        item.servicePackageID ===
                          servicePriceData.packageTwoID &&
                        service.serviceID === item.serviceID &&
                        item.serviceCatID === category.serviceCatID,
                    )?.price;

                    packageThreeData = recurringServices.find(
                      (item) =>
                        item.servicePackageID ===
                          servicePriceData.packageThreeID &&
                        service.serviceID === item.serviceID &&
                        item.serviceCatID === category.serviceCatID,
                    )?.price;
                  }

                  return {
                    ...service,
                    serviceDescription: servicePriceData.serviceDescription,
                    price: servicePriceData.price,
                    originalServicePrice: servicePriceData.originalServicePrice,
                    packageOneValue: Number(packageOneData),
                    packageTwoValue: Number(packageTwoData),
                    packageThreeValue: Number(packageThreeData),
                    originalPackageOneValue: Number(packageOneData),
                    originalPackageTwoValue: Number(packageTwoData),
                    originalPackageThreeValue: Number(packageThreeData),
                    servicePackageIDs: updatedServicePackageIDs,
                    packageOneID: servicePriceData.packageOneID,
                    packageTwoID: servicePriceData.packageTwoID,
                    packageThreeID: servicePriceData.packageThreeID,
                    isAdditionalService: servicePriceData.isAdditionalService,
                  };
                }),
              ),
            })),
          );

          let recArrayWithPriceCopy = await Promise.all(
            recArray.map(async (category) => ({
              serviceCatID: category.serviceCatID,
              serviceCatName: category.serviceCatName,
              servicesList: await Promise.all(
                category.servicesList.map((service) => {
                  const servicePriceData =
                    RecurringServicePrices[category.serviceCatID][
                      service.serviceID
                    ];

                  // Safeguard against undefined servicePriceData
                  if (!servicePriceData) return { ...service };

                  let {
                    serviceDescription,
                    price,
                    originalServicePrice,
                    servicePackageIDs,
                    packageOneID,
                    packageTwoID,
                    packageThreeID,
                    isAdditionalService,
                  } = servicePriceData;

                  // Fetch recurring service data
                  let packageOneData = servicePriceData.originalPackageOneValue; // Could be undefined
                  let packageTwoData = servicePriceData.originalPackageTwoValue; // Could be undefined
                  let packageThreeData =
                    servicePriceData.originalPackageThreeValue;

                  // Fetch recurring service data
                  if (engagementObj.selectSourceId === 3) {
                    packageOneData = servicePriceData.originalPackageOneValue; // Could be undefined
                    packageTwoData = servicePriceData.originalPackageTwoValue; // Could be undefined
                    packageThreeData =
                      servicePriceData.originalPackageThreeValue; // Could be undefined
                  } else if (engagementObj.selectSourceId === 4) {
                    packageOneData = recurringServices.find(
                      (item) =>
                        item.servicePackageID ===
                          servicePriceData.packageOneID &&
                        service.serviceID === item.serviceID &&
                        item.serviceCatID === category.serviceCatID,
                    )?.price;

                    packageTwoData = recurringServices.find(
                      (item) =>
                        item.servicePackageID ===
                          servicePriceData.packageTwoID &&
                        service.serviceID === item.serviceID &&
                        item.serviceCatID === category.serviceCatID,
                    )?.price;

                    packageThreeData = recurringServices.find(
                      (item) =>
                        item.servicePackageID ===
                          servicePriceData.packageThreeID &&
                        service.serviceID === item.serviceID &&
                        item.serviceCatID === category.serviceCatID,
                    )?.price;
                  }
                  let packageOneValue = packageOneData;
                  let packageTwoValue = packageTwoData;
                  let packageThreeValue = packageThreeData;

                  let originalPackageOneValue = packageOneData;
                  let originalPackageTwoValue = packageTwoData;
                  let originalPackageThreeValue = packageThreeData;

                  let updatedServicePackageIDs = []; // Assuming you'll add logic to update this

                  // Adjust price and package values based on payment frequency
                  switch (engagementObj.Payment_Frequency) {
                    case 4:
                      price *= 12;
                      originalServicePrice *= 12;
                      packageOneValue *= 12;
                      packageTwoValue *= 12;
                      packageThreeValue *= 12;
                      originalPackageOneValue *= 12;
                      originalPackageTwoValue *= 12;
                      originalPackageThreeValue *= 12;
                      break;
                    case 3:
                      price *= 4;
                      originalServicePrice *= 4;
                      packageOneValue *= 4;
                      packageTwoValue *= 4;
                      packageThreeValue *= 4;
                      originalPackageOneValue *= 4;
                      originalPackageTwoValue *= 4;
                      originalPackageThreeValue *= 4;
                      break;
                    case 2:
                      price *= 2;
                      originalServicePrice *= 2;
                      packageOneValue *= 2;
                      packageTwoValue *= 2;
                      packageThreeValue *= 2;
                      originalPackageOneValue *= 2;
                      originalPackageTwoValue *= 2;
                      originalPackageThreeValue *= 2;
                      break;
                    case 1:
                    default:
                      break;
                  }

                  return {
                    ...service,
                    price,
                    originalServicePrice,
                    serviceDescription,
                    packageOneValue,
                    packageTwoValue,
                    packageThreeValue,
                    originalPackageOneValue,
                    originalPackageTwoValue,
                    originalPackageThreeValue,
                    servicePackageIDs: updatedServicePackageIDs,
                    packageOneID,
                    packageTwoID,
                    packageThreeID,
                    isAdditionalService,
                  };
                }),
              ),
            })),
          );

          let OneArrayWithPrice = await Promise.all(
            OneArray.map(async (category) => ({
              serviceCatID: category.serviceCatID,
              serviceCatName: category.serviceCatName,
              servicesList: await Promise.all(
                category.servicesList.map((service) => {
                  const servicePriceData =
                    OneOffServicePrices[category.serviceCatID][
                      service.serviceID
                    ];

                  // Safeguard against undefined servicePriceData
                  if (!servicePriceData) return { ...service };

                  let {
                    serviceDescription,
                    price,
                    originalServicePrice,
                    servicePackageIDs,
                    packageOneID,
                    packageTwoID,
                    packageThreeID,
                    isAdditionalService,
                  } = servicePriceData;

                  // Fetch recurring service data
                  // Fetch recurring service data
                  let packageOneData = servicePriceData.originalPackageOneValue; // Could be undefined
                  let packageTwoData = servicePriceData.originalPackageTwoValue; // Could be undefined
                  let packageThreeData =
                    servicePriceData.originalPackageThreeValue;
                  // Fetch recurring service data
                  if (engagementObj.selectSourceId === 3) {
                    packageOneData = servicePriceData.originalPackageOneValue; // Could be undefined
                    packageTwoData = servicePriceData.originalPackageTwoValue; // Could be undefined
                    packageThreeData =
                      servicePriceData.originalPackageThreeValue; // Could be undefined
                  } else if (engagementObj.selectSourceId === 4) {
                    packageOneData = OneOffServices.find(
                      (item) =>
                        item.servicePackageID ===
                          servicePriceData.packageOneID &&
                        service.serviceID === item.serviceID &&
                        item.serviceCatID === category.serviceCatID,
                    )?.price;

                    packageTwoData = OneOffServices.find(
                      (item) =>
                        item.servicePackageID ===
                          servicePriceData.packageTwoID &&
                        service.serviceID === item.serviceID &&
                        item.serviceCatID === category.serviceCatID,
                    )?.price;

                    packageThreeData = OneOffServices.find(
                      (item) =>
                        item.servicePackageID ===
                          servicePriceData.packageThreeID &&
                        service.serviceID === item.serviceID &&
                        item.serviceCatID === category.serviceCatID,
                    )?.price;
                  }

                  // Override package values if data is found in OneOffServices
                  let packageOneValue = packageOneData;
                  let packageTwoValue = packageTwoData;
                  let packageThreeValue = packageThreeData;

                  let originalPackageOneValue = packageOneData;
                  let originalPackageTwoValue = packageTwoData;
                  let originalPackageThreeValue = packageThreeData;

                  let updatedServicePackageIDs = []; // Assuming you'll add logic to update this

                  // Adjust price and package values based on payment frequency
                  switch (engagementObj.Payment_Frequency) {
                    case 4:
                      price *= 12;
                      originalServicePrice *= 12;
                      packageOneValue *= 12;
                      packageTwoValue *= 12;
                      packageThreeValue *= 12;
                      originalPackageOneValue *= 12;
                      originalPackageTwoValue *= 12;
                      originalPackageThreeValue *= 12;
                      break;
                    case 3:
                      price *= 4;
                      originalServicePrice *= 4;
                      packageOneValue *= 4;
                      packageTwoValue *= 4;
                      packageThreeValue *= 4;
                      originalPackageOneValue *= 4;
                      originalPackageTwoValue *= 4;
                      originalPackageThreeValue *= 4;
                      break;
                    case 2:
                      price *= 2;
                      originalServicePrice *= 2;
                      packageOneValue *= 2;
                      packageTwoValue *= 2;
                      packageThreeValue *= 2;
                      originalPackageOneValue *= 2;
                      originalPackageTwoValue *= 2;
                      originalPackageThreeValue *= 2;
                      break;
                    case 1:
                    default:
                      break;
                  }

                  return {
                    ...service,
                    price,
                    originalServicePrice,
                    serviceDescription,
                    packageOneValue,
                    packageTwoValue,
                    packageThreeValue,
                    originalPackageOneValue,
                    originalPackageTwoValue,
                    originalPackageThreeValue,
                    servicePackageIDs: updatedServicePackageIDs,
                    packageOneID,
                    packageTwoID,
                    packageThreeID,
                    isAdditionalService,
                  };
                }),
              ),
            })),
          );

          recArrayWithPriceCopy.forEach((category) => {
            category.servicesList.forEach((service) => {
              // Initialize servicePackageIDs if it's not already an array
              if (!Array.isArray(service.servicePackageIDs)) {
                service.servicePackageIDs = [];
              }

              // Find matching service from recurringServices
              recurringServices.forEach((rs) => {
                if (
                  rs.serviceID === service.serviceID &&
                  rs.serviceCatID === category.serviceCatID
                ) {
                  // Ensure the servicePackageID is unique in servicePackageIDs
                  if (
                    !service.servicePackageIDs.includes(rs.servicePackageID)
                  ) {
                    service.servicePackageIDs.push(rs.servicePackageID);
                  }
                }
              });
            });
          });

          recArrayWithPrice.forEach((category) => {
            category.servicesList.forEach((service) => {
              // Initialize servicePackageIDs if it's not already an array
              if (!Array.isArray(service.servicePackageIDs)) {
                service.servicePackageIDs = [];
              }

              // Find matching service from recurringServices
              recurringServices.forEach((rs) => {
                if (
                  rs.serviceID === service.serviceID &&
                  rs.serviceCatID === category.serviceCatID
                ) {
                  // Ensure the servicePackageID is unique in servicePackageIDs
                  if (
                    !service.servicePackageIDs.includes(rs.servicePackageID)
                  ) {
                    service.servicePackageIDs.push(rs.servicePackageID);
                  }
                }
              });
            });
          });

          recArrayWithPrice.forEach((category) => {
            category.servicesList.forEach((service) => {
              if (service.isAdditionalService) {
                // Find matching additional service from ContractAdditionalServices
                const additionalService =
                  ContractAdditionalServices !== null &&
                  ContractAdditionalServices.find(
                    (item) =>
                      item.serviceChargeTypeID === 1 &&
                      item.serviceID === service.serviceID,
                  );

                // Update servicePackageIDs only if additional service is found and has package IDs
                const updatedServicePackageIDs =
                  additionalService &&
                  additionalService.servicePackageIDs.length > 0
                    ? additionalService.servicePackageIDs
                    : RecurringServicePrices[category.serviceCatID][
                        service.serviceID
                      ].servicePackageIDs;

                // Update servicePackageIDs in the service object
                service.servicePackageIDs = updatedServicePackageIDs;
              }
            });
          });
          recArrayWithPriceCopy.forEach((category) => {
            category.servicesList.forEach((service) => {
              if (service.isAdditionalService) {
                // Find matching additional service from ContractAdditionalServices
                const additionalService =
                  ContractAdditionalServices !== null &&
                  ContractAdditionalServices.find(
                    (item) =>
                      item.serviceChargeTypeID === 1 &&
                      item.serviceID === service.serviceID,
                  );

                // Update servicePackageIDs only if additional service is found and has package IDs
                const updatedServicePackageIDs =
                  additionalService &&
                  additionalService.servicePackageIDs.length > 0
                    ? additionalService.servicePackageIDs
                    : RecurringServicePrices[category.serviceCatID][
                        service.serviceID
                      ].servicePackageIDs;

                // Update servicePackageIDs in the service object
                service.servicePackageIDs = updatedServicePackageIDs;
              }
            });
          });
          OneArrayWithPrice.filter((category) => {
            category.servicesList.forEach((service) => {
              // Initialize servicePackageIDs if it's not already an array
              if (!Array.isArray(service.servicePackageIDs)) {
                service.servicePackageIDs = [];
              }

              // Find matching service from recurringServices
              OneOffServices.forEach((rs) => {
                if (
                  rs.serviceID === service.serviceID &&
                  rs.serviceCatID === category.serviceCatID
                ) {
                  // Ensure the servicePackageID is unique in servicePackageIDs
                  if (
                    !service.servicePackageIDs.includes(rs.servicePackageID)
                  ) {
                    service.servicePackageIDs.push(rs.servicePackageID);
                  }
                }
              });
            });
          });

          OneArrayWithPrice.filter((category) => {
            category.servicesList.map((service) => {
              if (service.isAdditionalService) {
                // Find matching additional service from ContractAdditionalServices
                const additionalService =
                  ContractAdditionalServices !== null &&
                  ContractAdditionalServices.find(
                    (item) =>
                      item.serviceChargeTypeID === 2 &&
                      item.serviceID === service.serviceID,
                  );

                // Update servicePackageIDs only if additional service is found and has package IDs
                const updatedServicePackageIDs =
                  additionalService &&
                  additionalService.servicePackageIDs.length > 0
                    ? additionalService.servicePackageIDs
                    : OneOffServicePrices[category.serviceCatID][
                        service.serviceID
                      ].servicePackageIDs;

                // Update servicePackageIDs in the service object
                service.servicePackageIDs = updatedServicePackageIDs;
              }
            });
          });
          recArrayWithPrice = updatePackageIDs(recArrayWithPrice);
          OneArrayWithPrice = updatePackageIDs(OneArrayWithPrice);
          setSelectedRecurringServiceList(recArrayWithPrice);
          setSelectedRecurringServiceListCopy(recArrayWithPriceCopy);
          setSelectedOneOffServiceList(OneArrayWithPrice);

          let RecTotal = 0;
          let OneOffTotal = 0;
          recArrayWithPrice.forEach((category) => {
            category.servicesList.forEach((service) => {
              // Perform the percentage calculation for each value
              let currentServicePrice =
                service.originalServicePrice === undefined
                  ? (service.quotationPrice = Number(service.quotationPrice))
                  : (service.originalServicePrice = Number(
                      service.originalServicePrice,
                    ));

              let currentServicePriceWithToFixed =
                Number(currentServicePrice)?.toFixed(2);
              //service.price = currentServicePriceWithToFixed
              RecTotal = Number(
                Number(RecTotal) + Number(currentServicePriceWithToFixed),
              )?.toFixed(2);

              // service.price === undefined
              //   ? (service.quotationPrice = Number(service.quotationPrice))
              //   : (service.price = Number(service.price));
            });
          });
          OneArrayWithPrice.forEach((category) => {
            category.servicesList.forEach((service) => {
              // Perform the percentage calculation for each value
              let currentServicePrice =
                service.originalServicePrice === undefined
                  ? (service.quotationPrice = Number(service.quotationPrice))
                  : (service.originalServicePrice = Number(
                      service.originalServicePrice,
                    ));

              let currentServicePriceWithToFixed =
                Number(currentServicePrice)?.toFixed(2);
              //service.price = currentServicePriceWithToFixed
              OneOffTotal = Number(
                Number(OneOffTotal) + Number(currentServicePriceWithToFixed),
              )?.toFixed(2);
            });
          });

          let totalOne = 0;
          let totalTwo = 0;
          let totalThree = 0;

          recArrayWithPrice.forEach((category) => {
            category.servicesList.forEach((service) => {
              // Check if the value is not null before adding

              if (service.packageOneValue !== null) {
                //totalOne += Number(service.packageOneValue);
                let currentServicePriceWithToFixed = Number(
                  service.originalPackageOneValue,
                )?.toFixed(2);
                totalOne = Number(
                  Number(totalOne) + Number(currentServicePriceWithToFixed),
                )?.toFixed(2);
              }
              if (service.packageTwoValue !== null) {
                //totalTwo += Number(service.packageTwoValue);
                let currentServicePriceWithToFixed = Number(
                  service.originalPackageTwoValue,
                )?.toFixed(2);
                totalTwo = Number(
                  Number(totalTwo) + Number(currentServicePriceWithToFixed),
                )?.toFixed(2);
              }
              if (service.packageThreeValue !== null) {
                //totalThree += Number(service.packageThreeValue);
                let currentServicePriceWithToFixed = Number(
                  service.originalPackageThreeValue,
                )?.toFixed(2);
                totalThree = Number(
                  Number(totalThree) + Number(currentServicePriceWithToFixed),
                )?.toFixed(2);
              }
            });
          });
          // Round the totals to two decimal places

          let multiplicationFactor = 1; // Default to yearly

          switch (engagementObj.Payment_Frequency) {
            case 4:
              multiplicationFactor = 12; // Convert to yearly
              break;
            case 3:
              multiplicationFactor = 4; // Convert to yearly
              break;
            case 2:
              multiplicationFactor = 2; // Convert to yearly
              break;
            // No adjustment needed for yearly
            case 1:
            default:
              break;
          }

          let pricingSettingPaymentFrequency = 1;
          switch (pricingSettingObj.PaymentFrequency) {
            case 4:
              pricingSettingPaymentFrequency = 12; // Convert to yearly
              break;
            case 3:
              pricingSettingPaymentFrequency = 4; // Convert to yearly
              break;
            case 2:
              pricingSettingPaymentFrequency = 2; // Convert to yearly
              break;
            // No adjustment needed for yearly
            case 1:
            default:
              break;
          }

          let recOriginalPrice = 0.0;
          let recDefaultPrice = 0.0;
          let recMinPrice = 0.0;
          let recVATPrice = 0.0;
          let recDiscount = 0.0;
          let recDefaultDiscount = null;
          let recMaxDiscount = 0.0;
          let recGrandTotal = 0.0;

          let recOriginalPriceCopy = 0.0;
          let recDefaultPriceCopy = 0.0;
          let recMinPriceCopy = 0.0;
          let recVATPriceCopy = 0.0;
          let recDiscountCopy = 0.0;
          let recDefaultDiscountCopy = null;
          let recMaxDiscountCopy = 0.0;
          let recGrandTotalCopy = 0.0;

          let PackageOneVaTPrice = totalOne * (vatPercentage / 100);
          let PackageTwoVaTPrice = totalTwo * (vatPercentage / 100);
          let PackageThreeVaTPrice = totalThree * (vatPercentage / 100);
          let PackageOneGrandTotal = PackageOneVaTPrice + totalOne;
          let PackageTwoGrandTotal = PackageTwoVaTPrice + totalTwo;
          let PackageThreeGrandTotal = PackageThreeVaTPrice + totalThree;
          let packageRecurringOriginalPrice = 0;
          let packageRecurringDefaultPrice = 0;
          let packageOneOffOriginalPrice = 0;
          let packageOneOffDefaultPrice = 0;
          recOriginalPriceCopy = Number(
            Number(RecTotal) * Number(multiplicationFactor),
          ).toFixed(12);
          recOriginalPrice = Number(RecTotal);
          // recOriginalPrice = Number(RecTotal) / pricingSettingPaymentFrequency;

          let DiscountPercentagePackageOne = null;
          let DiscountPercentagePackageOneWithAllDecimal = null;
          let DiscountPercentagePackageTwo = null;
          let DiscountPercentagePackageTwoWithAllDecimal = null;
          let DiscountPercentagePackageThree = null;
          let DiscountPercentagePackageThreeWithAllDecimal = null;

          let OneOffDiscountPercentagePackageOne = null;
          let OneOffDiscountPercentagePackageOneWithAllDecimal = null;
          let OneOffDiscountPercentagePackageTwo = null;
          let OneOffDiscountPercentagePackageTwoWithAllDecimal = null;
          let OneOffDiscountPercentagePackageThree = null;
          let OneOffDiscountPercentagePackageThreeWithAllDecimal = null;

          if (PackageList?.length > 0) {
            //Recurring Package discount 1
            if (
              PackageList[0].recurringOriginalPrice !== null ||
              recurringServiceList.length > 0
            ) {
              packageRecurringOriginalPrice =
                PackageList[0]?.recurringOriginalPrice;
              packageRecurringDefaultPrice =
                PackageList[0]?.recurringDefaultPrice;
              let packageDiscountPercentage =
                ((packageRecurringOriginalPrice -
                  packageRecurringDefaultPrice) /
                  packageRecurringOriginalPrice) *
                100;

              if (
                RecurringPricingInfo.DiscountPercentagePackageOne === "" ||
                RecurringPricingInfo.DiscountPercentagePackageOne === null ||
                RecurringPricingInfo.DiscountPercentagePackageOne === undefined
              ) {
                DiscountPercentagePackageOne = Number(
                  packageDiscountPercentage,
                ).toFixed(2);
                DiscountPercentagePackageOneWithAllDecimal =
                  packageDiscountPercentage;
                if (contractFinalPackageAmountList?.length > 0) {
                  let packageOneQuotationFinalPackageAmountObj =
                    contractFinalPackageAmountList.find(
                      (quotationFinalPackage) =>
                        quotationFinalPackage.servicePackageID ===
                          PackageList[0].servicePackageID &&
                        quotationFinalPackage.serviceChargeTypeID == 1,
                    );
                  if (
                    packageOneQuotationFinalPackageAmountObj !== undefined &&
                    packageOneQuotationFinalPackageAmountObj !== null
                  ) {
                    DiscountPercentagePackageOne = Number(
                      packageOneQuotationFinalPackageAmountObj?.discountPercentageWithAllDecimal,
                    ).toFixed(2);
                    DiscountPercentagePackageOneWithAllDecimal =
                      packageOneQuotationFinalPackageAmountObj?.discountPercentageWithAllDecimal;
                  }
                }
              } else {
                DiscountPercentagePackageOne = isNaN(
                  RecurringPricingInfo.DiscountPercentagePackageOne,
                )
                  ? 0
                  : RecurringPricingInfo.DiscountPercentagePackageOne;
                DiscountPercentagePackageOneWithAllDecimal = isNaN(
                  RecurringFrequencyPricingInfo.DiscountPercentagePackageOne,
                )
                  ? 0
                  : RecurringFrequencyPricingInfo.DiscountPercentagePackageOne;
              }
            }

            //OneOff Package discount 1
            if (
              PackageList[0].oneOffOriginalPrice !== null ||
              oneOffServiceList.length > 0
            ) {
              packageOneOffOriginalPrice = PackageList[0]?.oneOffOriginalPrice;
              packageOneOffDefaultPrice = PackageList[0]?.oneOffDefaultPrice;
              let OneOffPackageDiscountPercentage =
                ((packageOneOffOriginalPrice - packageOneOffDefaultPrice) /
                  packageOneOffOriginalPrice) *
                100;

              if (
                OneOffPricingInfo.DiscountPercentagePackageOne === "" ||
                OneOffPricingInfo.DiscountPercentagePackageOne === null ||
                OneOffPricingInfo.DiscountPercentagePackageOne === undefined
              ) {
                OneOffDiscountPercentagePackageOne = Number(
                  OneOffPackageDiscountPercentage,
                ).toFixed(2);
                OneOffDiscountPercentagePackageOneWithAllDecimal =
                  OneOffPackageDiscountPercentage;

                if (contractFinalPackageAmountList?.length > 0) {
                  let OneOffPackageOneQuotationFinalPackageAmountObj =
                    contractFinalPackageAmountList.find(
                      (quotationFinalPackage) =>
                        quotationFinalPackage.servicePackageID ===
                          PackageList[0].servicePackageID &&
                        quotationFinalPackage.serviceChargeTypeID == 2,
                    );
                  if (
                    OneOffPackageOneQuotationFinalPackageAmountObj !==
                      undefined &&
                    OneOffPackageOneQuotationFinalPackageAmountObj !== null
                  ) {
                    OneOffDiscountPercentagePackageOne = Number(
                      OneOffPackageOneQuotationFinalPackageAmountObj?.discountPercentageWithAllDecimal,
                    ).toFixed(2);
                    OneOffDiscountPercentagePackageOneWithAllDecimal =
                      OneOffPackageOneQuotationFinalPackageAmountObj?.discountPercentageWithAllDecimal;
                  }
                }
              } else {
                OneOffDiscountPercentagePackageOne = isNaN(
                  OneOffPricingInfo.DiscountPercentagePackageOne,
                )
                  ? 0
                  : OneOffPricingInfo.DiscountPercentagePackageOne;
                OneOffDiscountPercentagePackageOneWithAllDecimal = isNaN(
                  OneOffPricingInfoCopy.DiscountPercentagePackageOne,
                )
                  ? 0
                  : OneOffPricingInfoCopy.DiscountPercentagePackageOne;
              }
            }
          }

          if (PackageList?.length > 1) {
            //Recurring Package discount 2
            if (
              PackageList[1].recurringOriginalPrice !== null ||
              recurringServiceList.length > 0
            ) {
              packageRecurringOriginalPrice =
                PackageList[1]?.recurringOriginalPrice;
              packageRecurringDefaultPrice =
                PackageList[1]?.recurringDefaultPrice;
              let packageDiscountPercentage =
                ((packageRecurringOriginalPrice -
                  packageRecurringDefaultPrice) /
                  packageRecurringOriginalPrice) *
                100;

              if (
                RecurringPricingInfo.DiscountPercentagePackageTwo === "" ||
                RecurringPricingInfo.DiscountPercentagePackageTwo === null ||
                RecurringPricingInfo.DiscountPercentagePackageTwo === undefined
              ) {
                DiscountPercentagePackageTwo = Number(
                  packageDiscountPercentage,
                ).toFixed(2);
                DiscountPercentagePackageTwoWithAllDecimal =
                  packageDiscountPercentage;

                if (contractFinalPackageAmountList?.length > 0) {
                  let packageTwoQuotationFinalPackageAmountObj =
                    contractFinalPackageAmountList.find(
                      (quotationFinalPackage) =>
                        quotationFinalPackage.servicePackageID ===
                          PackageList[1].servicePackageID &&
                        quotationFinalPackage.serviceChargeTypeID == 1,
                    );

                  if (
                    packageTwoQuotationFinalPackageAmountObj !== undefined &&
                    packageTwoQuotationFinalPackageAmountObj !== null
                  ) {
                    DiscountPercentagePackageTwo = Number(
                      packageTwoQuotationFinalPackageAmountObj?.discountPercentageWithAllDecimal,
                    ).toFixed(2);
                    DiscountPercentagePackageTwoWithAllDecimal =
                      packageTwoQuotationFinalPackageAmountObj?.discountPercentageWithAllDecimal;
                  }
                }
              } else {
                DiscountPercentagePackageTwo = isNaN(
                  RecurringPricingInfo.DiscountPercentagePackageTwo,
                )
                  ? 0
                  : RecurringPricingInfo.DiscountPercentagePackageTwo;
                DiscountPercentagePackageTwoWithAllDecimal = isNaN(
                  RecurringFrequencyPricingInfo.DiscountPercentagePackageTwo,
                )
                  ? 0
                  : RecurringFrequencyPricingInfo.DiscountPercentagePackageTwo;
              }
            }

            //OneOff Package discount 2
            if (
              PackageList[1].oneOffOriginalPrice !== null ||
              oneOffServiceList.length > 0
            ) {
              packageOneOffOriginalPrice = PackageList[1]?.oneOffOriginalPrice;
              packageOneOffDefaultPrice = PackageList[1]?.oneOffDefaultPrice;
              let OneOffPackageDiscountPercentage =
                ((packageOneOffOriginalPrice - packageOneOffDefaultPrice) /
                  packageOneOffOriginalPrice) *
                100;

              if (
                OneOffPricingInfo.DiscountPercentagePackageTwo === "" ||
                OneOffPricingInfo.DiscountPercentagePackageTwo === null ||
                OneOffPricingInfo.DiscountPercentagePackageTwo === undefined
              ) {
                OneOffDiscountPercentagePackageTwo = Number(
                  OneOffPackageDiscountPercentage,
                ).toFixed(2);
                OneOffDiscountPercentagePackageTwoWithAllDecimal =
                  OneOffPackageDiscountPercentage;

                if (contractFinalPackageAmountList?.length > 0) {
                  let OneOffPackageTwoQuotationFinalPackageAmountObj =
                    contractFinalPackageAmountList.find(
                      (quotationFinalPackage) =>
                        quotationFinalPackage.servicePackageID ===
                          PackageList[1].servicePackageID &&
                        quotationFinalPackage.serviceChargeTypeID == 2,
                    );
                  if (
                    OneOffPackageTwoQuotationFinalPackageAmountObj !==
                      undefined &&
                    OneOffPackageTwoQuotationFinalPackageAmountObj !== null
                  ) {
                    OneOffDiscountPercentagePackageTwo = Number(
                      OneOffPackageTwoQuotationFinalPackageAmountObj?.discountPercentageWithAllDecimal,
                    ).toFixed(2);
                    OneOffDiscountPercentagePackageTwoWithAllDecimal =
                      OneOffPackageTwoQuotationFinalPackageAmountObj?.discountPercentageWithAllDecimal;
                  }
                }
              } else {
                OneOffDiscountPercentagePackageTwo = isNaN(
                  OneOffPricingInfo.DiscountPercentagePackageTwo,
                )
                  ? 0
                  : OneOffPricingInfo.DiscountPercentagePackageTwo;
                OneOffDiscountPercentagePackageTwoWithAllDecimal = isNaN(
                  OneOffPricingInfoCopy.DiscountPercentagePackageTwo,
                )
                  ? 0
                  : OneOffPricingInfoCopy.DiscountPercentagePackageTwo;
              }
            }
          }

          if (PackageList?.length > 2) {
            //Recurring Package discount 3
            if (
              PackageList[2].recurringOriginalPrice !== null ||
              recurringServiceList.length > 0
            ) {
              packageRecurringOriginalPrice =
                PackageList[2]?.recurringOriginalPrice;
              packageRecurringDefaultPrice =
                PackageList[2]?.recurringDefaultPrice;
              let packageDiscountPercentage =
                ((packageRecurringOriginalPrice -
                  packageRecurringDefaultPrice) /
                  packageRecurringOriginalPrice) *
                100;

              if (
                RecurringPricingInfo.DiscountPercentagePackageThree === "" ||
                RecurringPricingInfo.DiscountPercentagePackageThree === null ||
                RecurringPricingInfo.DiscountPercentagePackageThree ===
                  undefined
              ) {
                DiscountPercentagePackageThree = Number(
                  packageDiscountPercentage,
                ).toFixed(2);
                DiscountPercentagePackageThreeWithAllDecimal =
                  packageDiscountPercentage;

                if (contractFinalPackageAmountList?.length > 0) {
                  let packageThreeQuotationFinalPackageAmountObj =
                    contractFinalPackageAmountList.find(
                      (quotationFinalPackage) =>
                        quotationFinalPackage.servicePackageID ===
                          PackageList[2].servicePackageID &&
                        quotationFinalPackage.serviceChargeTypeID == 1,
                    );
                  if (
                    packageThreeQuotationFinalPackageAmountObj !== undefined &&
                    packageThreeQuotationFinalPackageAmountObj !== null
                  ) {
                    DiscountPercentagePackageThree = Number(
                      packageThreeQuotationFinalPackageAmountObj?.discountPercentageWithAllDecimal,
                    ).toFixed(2);
                    DiscountPercentagePackageThreeWithAllDecimal =
                      packageThreeQuotationFinalPackageAmountObj?.discountPercentageWithAllDecimal;
                  }
                }
              } else {
                DiscountPercentagePackageThree = isNaN(
                  RecurringPricingInfo.DiscountPercentagePackageThree,
                )
                  ? 0
                  : RecurringPricingInfo.DiscountPercentagePackageThree;

                DiscountPercentagePackageThreeWithAllDecimal = isNaN(
                  RecurringFrequencyPricingInfo.DiscountPercentagePackageThree,
                )
                  ? 0
                  : RecurringFrequencyPricingInfo.DiscountPercentagePackageThree;
              }
            }

            //OneOff Package discount 3
            if (
              PackageList[2].oneOffOriginalPrice !== null ||
              oneOffServiceList.length > 0
            ) {
              packageOneOffOriginalPrice = PackageList[2]?.oneOffOriginalPrice;
              packageOneOffDefaultPrice = PackageList[2]?.oneOffDefaultPrice;
              let OneOffPackageDiscountPercentage =
                ((packageOneOffOriginalPrice - packageOneOffDefaultPrice) /
                  packageOneOffOriginalPrice) *
                100;

              if (
                OneOffPricingInfo.DiscountPercentagePackageThree === "" ||
                OneOffPricingInfo.DiscountPercentagePackageThree === null ||
                OneOffPricingInfo.DiscountPercentagePackageThree === undefined
              ) {
                OneOffDiscountPercentagePackageThree = Number(
                  OneOffPackageDiscountPercentage,
                ).toFixed(2);
                OneOffDiscountPercentagePackageThreeWithAllDecimal =
                  OneOffPackageDiscountPercentage;

                if (contractFinalPackageAmountList?.length > 0) {
                  let OneOffPackageThreeQuotationFinalPackageAmountObj =
                    contractFinalPackageAmountList.find(
                      (quotationFinalPackage) =>
                        quotationFinalPackage.servicePackageID ===
                          PackageList[2].servicePackageID &&
                        quotationFinalPackage.serviceChargeTypeID == 2,
                    );
                  if (
                    OneOffPackageThreeQuotationFinalPackageAmountObj !==
                      undefined &&
                    OneOffPackageThreeQuotationFinalPackageAmountObj !== null
                  ) {
                    OneOffDiscountPercentagePackageThree = Number(
                      OneOffPackageThreeQuotationFinalPackageAmountObj?.discountPercentageWithAllDecimal,
                    ).toFixed(2);
                    OneOffDiscountPercentagePackageThreeWithAllDecimal =
                      OneOffPackageThreeQuotationFinalPackageAmountObj?.discountPercentageWithAllDecimal;
                  }
                }
              } else {
                OneOffDiscountPercentagePackageThree = isNaN(
                  OneOffPricingInfo.DiscountPercentagePackageThree,
                )
                  ? 0
                  : OneOffPricingInfo.DiscountPercentagePackageThree;
                OneOffDiscountPercentagePackageThreeWithAllDecimal = isNaN(
                  OneOffPricingInfoCopy.DiscountPercentagePackageThree,
                )
                  ? 0
                  : OneOffPricingInfoCopy.DiscountPercentagePackageThree;
              }
            }
          }
          // setIsUpdatePackage(false)
          recDefaultDiscountCopy = GetSingleDefaultDiscountPercentageOfPackages(
            isNaN(DiscountPercentagePackageOne)
              ? 0
              : DiscountPercentagePackageOne,
            isNaN(DiscountPercentagePackageTwo)
              ? 0
              : DiscountPercentagePackageTwo,
            isNaN(DiscountPercentagePackageThree)
              ? 0
              : DiscountPercentagePackageThree,
          );
          recDefaultDiscount = GetSingleDefaultDiscountPercentageOfPackages(
            isNaN(DiscountPercentagePackageOne)
              ? 0
              : DiscountPercentagePackageOne,
            isNaN(DiscountPercentagePackageTwo)
              ? 0
              : DiscountPercentagePackageTwo,
            isNaN(DiscountPercentagePackageThree)
              ? 0
              : DiscountPercentagePackageThree,
          );

          if (
            RecurringPricingInfo.OriginalPrice === "" ||
            RecurringPricingInfo.OriginalPrice === null ||
            RecurringPricingInfo.OriginalPrice === undefined ||
            RecurringPricingInfo.DefaultDiscount === "" ||
            RecurringFrequencyPricingInfo.DefaultDiscount === null ||
            RecurringFrequencyPricingInfo.DefaultDiscount === undefined ||
            RecurringFrequencyPricingInfo.DefaultDiscount === "0.00" ||
            RecurringFrequencyPricingInfo.DefaultDiscount === 0 ||
            Number(RecTotal)?.toFixed(2) !==
              Number(RecurringPricingInfo.OriginalPrice)?.toFixed(2)
          ) {
            recDefaultPrice = Number(RecTotal)?.toFixed(2);
            // recDefaultPrice = (
            //   Math.floor(Number(RecTotal / pricingSettingPaymentFrequency).toFixed(12) * 100) / 100
            // ).toFixed(2);
            // recDefaultPrice = Number(recDefaultPrice)
            // recDefaultPrice = RecTotal?.toFixed(2);
            recVATPrice = Number(recOriginalPrice) * (vatPercentage / 100);
            recGrandTotal = Number(recVATPrice) + Number(recOriginalPrice);
            recDefaultPriceCopy =
              Number(RecTotal) * Number(multiplicationFactor);
            recMinPriceCopy = Number(RecTotal) * Number(multiplicationFactor);

            recVATPriceCopy = Number(recOriginalPrice) * (vatPercentage / 100);
            recGrandTotalCopy = Number(recVATPrice) + Number(recOriginalPrice);
          } else {
            // recOriginalPrice = Number(RecurringPricingInfo.OriginalPrice);
            recDefaultPrice = RecurringPricingInfo.DiscountedPrice;
            const truncatedTotal = Math.trunc(recDefaultPrice * 100) / 100;
            recDefaultPrice = Number(truncatedTotal)?.toFixed(2);
            if (
              RecurringPricingInfo.DiscountedPrice === undefined ||
              RecurringPricingInfo.DiscountedPrice === "" ||
              RecurringPricingInfo.DiscountedPrice === null
            ) {
              recDefaultPrice =
                Number(RecTotal) *
                (1 - Number(RecurringPricingInfo.DefaultDiscount) / 100);
              recDefaultPrice = Number(recDefaultPrice)?.toFixed(2);
            }

            // recDefaultPrice =
            //   Number(RecurringPricingInfo.DiscountedPrice)?.toFixed(2);
            recVATPrice = Number(recDefaultPrice) * (vatPercentage / 100);
            recGrandTotal = Number(recVATPrice) + Number(recDefaultPrice);

            recDiscount = Number(recOriginalPrice) - Number(recDefaultPrice); //RecurringPricingInfo.Discount;
            recDefaultDiscount = RecurringPricingInfo.DefaultDiscount;
            recMaxDiscount = RecurringPricingInfo.MaxDiscount;

            // recDefaultPriceCopy = Number(
            //   RecurringPricingInfo.DiscountedPrice) * Number(multiplicationFactor)

            recDefaultDiscountCopy =
              RecurringFrequencyPricingInfo.DefaultDiscount;
            recDefaultPriceCopy =
              Number(recOriginalPriceCopy) -
              Number(recOriginalPriceCopy) * (recDefaultDiscountCopy / 100);

            recVATPriceCopy = Number(recDefaultPrice) * (vatPercentage / 100);
            recGrandTotalCopy = Number(recVATPrice) + Number(recDefaultPrice);
            recDiscountCopy =
              Number(recOriginalPriceCopy) - Number(recDefaultPriceCopy); //RecurringPricingInfo.Discount;

            recMaxDiscountCopy = RecurringPricingInfo.MaxDiscount;
          }

          setRecurringPricingInfo({
            ...RecurringPricingInfo,
            OriginalPrice: recOriginalPrice,
            DiscountedPrice: recDefaultPrice,
            MinPrice: recMinPrice,
            VATPrice: recVATPrice,
            Discount: recDiscount,
            DefaultDiscount:
              recDefaultDiscount == null
                ? null
                : Number(recDefaultDiscount).toFixed(2),
            // DefaultDiscount: Number(recDefaultDiscount).toFixed(2),
            DiscountPercentagePackageOne: isNaN(DiscountPercentagePackageOne)
              ? 0
              : DiscountPercentagePackageOne,
            DiscountPercentagePackageTwo: isNaN(DiscountPercentagePackageTwo)
              ? 0
              : DiscountPercentagePackageTwo,
            DiscountPercentagePackageThree: isNaN(
              DiscountPercentagePackageThree,
            )
              ? 0
              : DiscountPercentagePackageThree,
            GrandTotal: recGrandTotal,
            packageOneDisCountedTotal: recDefaultPrice,
            packageTwoDisCountedTotal: recDefaultPrice,
            packageThreeDisCountedTotal: recDefaultPrice,
            PackageOneVaTPrice: PackageOneVaTPrice,
            PackageTwoVaTPrice: PackageTwoVaTPrice,
            PackageThreeVaTPrice: PackageThreeVaTPrice,
            PackageOneGrandTotal: PackageOneGrandTotal,
            PackageTwoGrandTotal: PackageTwoGrandTotal,
            PackageThreeGrandTotal: PackageThreeGrandTotal,
          });

          setRecurringFrequencyPricingInfo({
            ...RecurringFrequencyPricingInfo,
            OriginalPrice: recOriginalPriceCopy,
            DiscountedPrice: recDefaultPriceCopy,
            MinPrice: recMinPriceCopy,
            VATPrice: recVATPriceCopy,
            Discount: recDiscountCopy,
            DefaultDiscount:
              recDefaultDiscountCopy == null ? null : recDefaultDiscountCopy,
            DiscountPercentagePackageOne: isNaN(
              DiscountPercentagePackageOneWithAllDecimal,
            )
              ? 0
              : DiscountPercentagePackageOneWithAllDecimal,
            DiscountPercentagePackageTwo: isNaN(
              DiscountPercentagePackageTwoWithAllDecimal,
            )
              ? 0
              : DiscountPercentagePackageTwoWithAllDecimal,
            DiscountPercentagePackageThree: isNaN(
              DiscountPercentagePackageThreeWithAllDecimal,
            )
              ? 0
              : DiscountPercentagePackageThreeWithAllDecimal,
            // DiscountPercentagePackageOne:
            //   DiscountPercentagePackageOneWithAllDecimal,
            // DiscountPercentagePackageTwo:
            //   DiscountPercentagePackageTwoWithAllDecimal,
            // DiscountPercentagePackageThree:
            //   DiscountPercentagePackageThreeWithAllDecimal,
            GrandTotal: recGrandTotalCopy,
            packageOneDisCountedTotal: recDefaultPrice,
            packageTwoDisCountedTotal: recDefaultPrice,
            packageThreeDisCountedTotal: recDefaultPrice,
            PackageOneVaTPrice: PackageOneVaTPrice,
            PackageTwoVaTPrice: PackageTwoVaTPrice,
            PackageThreeVaTPrice: PackageThreeVaTPrice,
            PackageOneGrandTotal: PackageOneGrandTotal,
            PackageTwoGrandTotal: PackageTwoGrandTotal,
            PackageThreeGrandTotal: PackageThreeGrandTotal,
          });
          let OneOffTotalOne = 0;
          let OneOffTotalTwo = 0;
          let OneOffTotalThree = 0;

          OneArrayWithPrice.forEach((category) => {
            category.servicesList.forEach((service) => {
              // Check if the value is not null before adding
              if (service.packageOneValue !== null)
                OneOffTotalOne += service.packageOneValue;
              if (service.packageTwoValue !== null)
                OneOffTotalTwo += service.packageTwoValue;
              if (service.packageThreeValue !== null)
                OneOffTotalThree += service.packageThreeValue;
            });
          });
          let oneOffOriginalPrice = 0.0;
          let oneOffDefaultPrice = 0.0;
          let oneOffVATPrice = 0.0;
          let oneOffDiscount = 0.0;
          let oneOffDefaultDiscount = null;
          let oneOffDefaultDiscountCopy = null;
          let oneOffGrandTotal = 0.0;
          if (PackageList?.length == 1) {
            if (PackageList[0]?.oneOffOriginalPrice !== null) {
              packageOneOffOriginalPrice = PackageList[0]?.oneOffOriginalPrice;
              packageOneOffDefaultPrice = PackageList[0]?.oneOffDefaultPrice;
              let packageDiscountPercentage =
                ((packageOneOffOriginalPrice - packageOneOffDefaultPrice) /
                  packageOneOffOriginalPrice) *
                100;
              oneOffDefaultDiscount = packageDiscountPercentage;
              // oneOffDefaultDiscount = Number(packageDiscountPercentage).toFixed(2)
            }
          }
          let OneOffPackageOneVaTPrice = OneOffTotalOne * (vatPercentage / 100);
          let OneOffPackageTwoVaTPrice = OneOffTotalTwo * (vatPercentage / 100);
          let OneOffPackageThreeVaTPrice =
            OneOffTotalThree * (vatPercentage / 100);
          let OneOffPackageOneGrandTotal =
            OneOffPackageOneVaTPrice + OneOffTotalOne;
          let OneOffPackageTwoGrandTotal =
            OneOffPackageTwoVaTPrice + OneOffTotalTwo;
          let OneOffPackageThreeGrandTotal =
            OneOffPackageThreeVaTPrice + OneOffTotalThree;
          oneOffOriginalPrice = Number(OneOffTotal).toFixed(12);

          if (
            OneOffPricingInfo.OriginalPrice === "" ||
            OneOffPricingInfo.OriginalPrice === null ||
            OneOffPricingInfo.OriginalPrice === undefined ||
            OneOffPricingInfo.DefaultDiscount === "" ||
            OneOffPricingInfoCopy.DefaultDiscount === null ||
            OneOffPricingInfoCopy.DefaultDiscount === undefined ||
            OneOffPricingInfoCopy.DefaultDiscount === "0.00" ||
            OneOffPricingInfoCopy.DefaultDiscount === 0 ||
            Number(OneOffTotal)?.toFixed(2) !==
              Number(OneOffPricingInfo.OriginalPrice)?.toFixed(2)
          ) {
            oneOffDefaultPrice = Number(OneOffTotal)?.toFixed(2);

            oneOffVATPrice =
              Number(oneOffOriginalPrice) * (vatPercentage / 100);
            oneOffGrandTotal =
              Number(oneOffVATPrice) + Number(oneOffOriginalPrice);
          } else {
            oneOffDefaultPrice = OneOffPricingInfo.DiscountedPrice;
            const truncatedTotal = Math.trunc(oneOffDefaultPrice * 100) / 100;
            oneOffDefaultPrice = Number(truncatedTotal)?.toFixed(2);
            if (
              OneOffPricingInfo.DiscountedPrice === undefined ||
              OneOffPricingInfo.DiscountedPrice === "" ||
              OneOffPricingInfo.DiscountedPrice === null
            ) {
              oneOffDefaultPrice =
                Number(OneOffTotal) *
                (1 - Number(OneOffPricingInfoCopy.DefaultDiscount) / 100);
              oneOffDefaultPrice = oneOffDefaultPrice.toFixed(2);
            }

            // oneOffDefaultPrice = Number(
            //   OneOffPricingInfo.DiscountedPrice
            // )?.toFixed(2);

            oneOffVATPrice = Number(oneOffDefaultPrice) * (vatPercentage / 100);
            oneOffGrandTotal =
              Number(oneOffVATPrice) + Number(oneOffDefaultPrice);
            oneOffDiscount = OneOffPricingInfo.Discount;
            oneOffDefaultDiscount = OneOffPricingInfo.DefaultDiscount;
            oneOffDefaultDiscountCopy = OneOffPricingInfoCopy.DefaultDiscount;
          }

          setOneOffPricingInfo({
            ...OneOffPricingInfo,
            OriginalPrice: oneOffOriginalPrice,
            DiscountedPrice: oneOffDefaultPrice,

            VATPrice: oneOffVATPrice,
            Discount: oneOffDiscount,
            DefaultDiscount:
              oneOffDefaultDiscount == null ? null : oneOffDefaultDiscount,
            DiscountPercentagePackageOne: isNaN(
              OneOffDiscountPercentagePackageOne,
            )
              ? 0
              : OneOffDiscountPercentagePackageOne,
            DiscountPercentagePackageTwo: isNaN(
              OneOffDiscountPercentagePackageTwo,
            )
              ? 0
              : OneOffDiscountPercentagePackageTwo,
            DiscountPercentagePackageThree: isNaN(
              OneOffDiscountPercentagePackageThree,
            )
              ? 0
              : OneOffDiscountPercentagePackageThree,
            GrandTotal: oneOffGrandTotal,
            packageOneDisCountedTotal: oneOffDefaultPrice,
            packageTwoDisCountedTotal: oneOffDefaultPrice,
            packageThreeDisCountedTotal: oneOffDefaultPrice,
            PackageOneVaTPrice: OneOffPackageOneVaTPrice,
            PackageTwoVaTPrice: OneOffPackageTwoVaTPrice,
            PackageThreeVaTPrice: OneOffPackageThreeVaTPrice,
            PackageOneGrandTotal: OneOffPackageOneGrandTotal,
            PackageTwoGrandTotal: OneOffPackageTwoGrandTotal,
            PackageThreeGrandTotal: OneOffPackageThreeGrandTotal,
          });

          setOneOffPricingInfoCopy({
            ...OneOffPricingInfoCopy,
            DefaultDiscount:
              oneOffDefaultDiscountCopy == null
                ? null
                : Number(oneOffDefaultDiscountCopy),
            DiscountPercentagePackageOne: isNaN(
              OneOffDiscountPercentagePackageOneWithAllDecimal,
            )
              ? 0
              : OneOffDiscountPercentagePackageOneWithAllDecimal,
            DiscountPercentagePackageTwo: isNaN(
              OneOffDiscountPercentagePackageTwoWithAllDecimal,
            )
              ? 0
              : OneOffDiscountPercentagePackageTwoWithAllDecimal,
            DiscountPercentagePackageThree: isNaN(
              OneOffDiscountPercentagePackageThreeWithAllDecimal,
            )
              ? 0
              : OneOffDiscountPercentagePackageThreeWithAllDecimal,
            // DiscountPercentagePackageOne:
            //   OneOffDiscountPercentagePackageOneWithAllDecimal,
            // DiscountPercentagePackageTwo:
            //   OneOffDiscountPercentagePackageTwoWithAllDecimal,
            // DiscountPercentagePackageThree:
            //   OneOffDiscountPercentagePackageThreeWithAllDecimal,
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
            SelectPackages: true,
          });
        } else {
          HandleTabChange(3);
          setIsValidForm({
            ...isValidForm,
            AdditionalInfo: true,
            SelectService: true,
            SelectPackages: true,
          });
          setTabHide(true);
          setLoader(false);
        }
      } else {
        setTabHide(true);
        setLoader(false);
        setActiveTab(activeTab);
        setOpenErrorModal(true);
        setErrorMessage(
          "The result of this operation is too large to be processed. Please check the input values and try again.",
        );
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

  //11) Get Additional  services list data api  call
  const GetAdditionalInformationListData = async (
    ServicesIDs = ServiceElementId,
  ) => {
    setLoader(true);
    try {
      const data = await GetAdditionalInformationList({
        userKeyID: common.userKeyID,
        organisationKeyID: common.organisationKeyID,
        ServicesIDs,
        clientID: engagementObj.ClientID,
        moduleKeyID: engagementObj.contractKeyID,
        ServicePackageIDs:
          engagementObj.acceptedServicePackageID !== null
            ? [engagementObj.acceptedServicePackageID]
            : null,
        moduleName: "Contract", // "ServicePackage / Quotation / Contract"
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
                  (item) => item.isDefault == true,
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
                  (item) => item.isDefault == true,
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
                      itemTwo.globalPricingDriverID,
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
              },
            );

            setAdditionalInformationList(additionalInformationListData);
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

  //c) get Price and Value of service from addition services to send api
  const modifiedAdditionalServiceArray =
    additionalInformationList !== null &&
    additionalInformationList
      .filter((AddItem) => AddItem.driverVisibility === true)
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
            (variationItem) => variationItem.isDefault,
          );
          driverValue = defaultVariation.variationValue;
          variationID = defaultVariation.variationID;
          msgMapID = item.msgMapID;
          msMapID = item.msMapID;
        } else if (
          item.date &&
          item.date.some((dateItem) => dateItem.isDefault)
        ) {
          const defaultDate = item.date.find((dateItem) => dateItem.isDefault);
          driverValue =
            defaultDate.dateValue ?? defaultDate.defaultDateValue ?? 0;
          dateID = defaultDate.dateID;
          msgMapID = item.msgMapID;
          msMapID = item.msMapID;
        } else if (item.text && item.text.length > 0) {
          driverValue = item.text?.[0]?.textValue ?? 0;
          textID = item.text?.[0]?.textID;
          msgMapID = item.msgMapID;
          msMapID = item.msMapID;
        } else if (item.driverTypeID === 2 || item.driverTypeID === 1) {
          driverValue = item.driverValue === null ? 0 : item.driverValue;
          slabID = item.slabID;
          variationID = item.variationID;
          msgMapID = item.msgMapID;
          textID = item.textID;
          dateID = item.dateID;
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
          enteredDateFormat: item.enteredDateFormat,
        };
      })
      .filter((item) => item.driverTypeID !== 1)
      .flat();

  const isDuplicateEmail = (email, index) => {
    return contractSignatoriesList.some(
      (officer, idx) =>
        officer.emailID?.toLowerCase() === email?.toLowerCase() &&
        idx !== index,
    );
  };

  function validatePricingInfo(
    RecurringPricingInfo,
    ProposalObject,
    pricingSettingObj,
    Type,
  ) {
    const minMonthlyPriceForQC = pricingSettingObj.minMonthlyPriceForQC;
    const minQuarterlyPriceForQC = pricingSettingObj.minQuarterlyPriceForQC;
    const minHalfYearlyPriceForQC = pricingSettingObj.minHalfYearlyPriceForQC;
    const minYearlyPriceForQC = pricingSettingObj.minYearlyPriceForQC;

    const discountedPrice = RecurringPricingInfo.DiscountedPrice;
    const paymentFrequency = ProposalObject.Payment_Frequency;
    const maxDiscountForQC = pricingSettingObj.maxDiscountForQC;

    // Map payment frequency to its corresponding minimum price
    // 1: Yearly, 2: Half-Yearly, 3: Quarterly, 4: Monthly
    const minPriceByFrequency = {
      4: minMonthlyPriceForQC,
      3: minQuarterlyPriceForQC,
      2: minHalfYearlyPriceForQC,
      1: minYearlyPriceForQC,
    };

    const minPriceForCurrentFrequency = minPriceByFrequency[paymentFrequency];

    // Check if DiscountedPrice is invalid or not a number
    if (Type === "Service") {
      if (
        isNaN(discountedPrice) ||
        RecurringPricingInfo.DiscountedPrice === "" ||
        RecurringPricingInfo.DiscountedPrice === null ||
        RecurringPricingInfo.DiscountedPrice === undefined
      ) {
        return true;
      }

      // Validate minimum price for the selected payment frequency
      const hasMinPrice =
        typeof minPriceForCurrentFrequency === "number" &&
        minPriceForCurrentFrequency > 0;

      if (hasMinPrice) {
        if (discountedPrice < minPriceForCurrentFrequency) {
          return true;
        }
      } else if (discountedPrice <= 0) {
        return true;
      }

      // Validate DefaultDiscount
      const defaultDiscount = RecurringPricingInfo.DefaultDiscount;

      if (isNaN(defaultDiscount)) {
        return true;
      }

      if (
        maxDiscountForQC > 0 &&
        (defaultDiscount > maxDiscountForQC || defaultDiscount < -999.0)
      ) {
        return true;
      }

      if (
        maxDiscountForQC <= 0 &&
        (defaultDiscount < -999.0 || defaultDiscount > 100)
      ) {
        return true;
      }
    }

    // Additional checks if Type is "Package"
    if (Type === "Package") {
      const DiscountPercentagePackageOne =
        RecurringPricingInfo.DiscountPercentagePackageOne;
      const DiscountPercentagePackageTwo =
        RecurringPricingInfo.DiscountPercentagePackageTwo;
      const DiscountPercentagePackageThree =
        RecurringPricingInfo.DiscountPercentagePackageThree;

      // Check if discount percentages are invalid or not a number
      if (
        isNaN(DiscountPercentagePackageOne) ||
        isNaN(DiscountPercentagePackageTwo) ||
        isNaN(DiscountPercentagePackageThree)
      ) {
        return true;
      }

      // Apply maxDiscountForQC validation
      if (
        maxDiscountForQC > 0 &&
        (DiscountPercentagePackageOne > maxDiscountForQC ||
          DiscountPercentagePackageTwo > maxDiscountForQC ||
          DiscountPercentagePackageThree > maxDiscountForQC)
      ) {
        return true;
      }

      // Validate default discount range when no QC max discount is configured
      if (
        maxDiscountForQC <= 0 &&
        (DiscountPercentagePackageOne < -999.0 ||
          DiscountPercentagePackageOne > 100 ||
          DiscountPercentagePackageTwo < -999.0 ||
          DiscountPercentagePackageTwo > 100 ||
          DiscountPercentagePackageThree < -999.0 ||
          DiscountPercentagePackageThree > 100)
      ) {
        return true;
      }
    }

    // All validations passed
    return false;
  }

  function validateOneOffPricingInfo(
    OneOffPricingInfo,
    pricingSettingObj,
    Type,
  ) {
    const minOneOffPriceForQC = pricingSettingObj.minOneOffPriceForQC;
    const discountedPrice = OneOffPricingInfo.DiscountedPrice;
    const defaultDiscount = OneOffPricingInfo.DefaultDiscount;
    const maxDiscountForQC = pricingSettingObj.maxDiscountForQC;
    if (Type === "Service") {
      // Check if DiscountedPrice is valid and a number
      if (
        OneOffPricingInfo.DiscountedPrice === "" ||
        OneOffPricingInfo.DiscountedPrice === null ||
        OneOffPricingInfo.DiscountedPrice === undefined ||
        isNaN(discountedPrice)
      ) {
        return true;
      }

      // Check minOneOffPriceForQC
      if (
        minOneOffPriceForQC !== "" &&
        minOneOffPriceForQC !== null &&
        minOneOffPriceForQC !== undefined &&
        discountedPrice < minOneOffPriceForQC
      ) {
        return true;
      }

      // Validate DefaultDiscount based on Type

      if (isNaN(defaultDiscount)) {
        return true;
      }

      if (
        maxDiscountForQC !== "" &&
        maxDiscountForQC !== null &&
        maxDiscountForQC !== undefined &&
        (defaultDiscount > maxDiscountForQC || defaultDiscount < -999.0)
      ) {
        return true;
      }
      if (
        (maxDiscountForQC === "" ||
          maxDiscountForQC === null ||
          maxDiscountForQC === undefined) &&
        (defaultDiscount < -999.0 || defaultDiscount > 100)
      ) {
        return true;
      }
    }

    // Check if maxDiscountForQC is not set

    // Additional checks if Type is "Package"
    if (Type === "Package") {
      const DiscountPercentagePackageOne =
        OneOffPricingInfo.DiscountPercentagePackageOne;
      const DiscountPercentagePackageTwo =
        OneOffPricingInfo.DiscountPercentagePackageTwo;
      const DiscountPercentagePackageThree =
        OneOffPricingInfo.DiscountPercentagePackageThree;

      // Check if discount percentages are invalid or not a number
      if (
        isNaN(DiscountPercentagePackageOne) ||
        isNaN(DiscountPercentagePackageTwo) ||
        isNaN(DiscountPercentagePackageThree)
      ) {
        return true;
      }

      // Apply the same maxDiscountForQC validation for Package type
      if (
        maxDiscountForQC !== "" &&
        maxDiscountForQC !== null &&
        maxDiscountForQC !== undefined &&
        (DiscountPercentagePackageOne > maxDiscountForQC ||
          DiscountPercentagePackageTwo > maxDiscountForQC ||
          DiscountPercentagePackageThree > maxDiscountForQC)
      ) {
        return true;
      }

      // Check if maxDiscountForQC is not set
      if (
        (maxDiscountForQC === "" ||
          maxDiscountForQC === null ||
          maxDiscountForQC === undefined) &&
        (DiscountPercentagePackageOne < -999.0 ||
          DiscountPercentagePackageOne > 100 ||
          DiscountPercentagePackageTwo < -999.0 ||
          DiscountPercentagePackageTwo > 100 ||
          DiscountPercentagePackageThree < -999.0 ||
          DiscountPercentagePackageThree > 100)
      ) {
        return true;
      }
    }

    // All validations passed
    return false;
  }

  function hasInvalidServiceNames(serviceList) {
    for (const category of serviceList) {
      for (const subService of category.servicesList) {
        if (!subService.serviceName || subService.serviceName.trim() === "") {
          return true;
        }
      }
    }
    return false;
  }
  //13) Check validation and send to next tab Function
  const HandleTabChange = async (NextTab, Status) => {
    if (
      Status === 2 &&
      activeOrganizationSubscriptionPlan?.prepareContract !== true
    ) {
      setShowModal(true);
      return;
    }

    const RecurringServiceListCheck = recurringServiceList.map((i) =>
      i.servicesList.some((item) => item.isSelected === true),
    );
    const RecurringServiceListLength = RecurringServiceListCheck.filter(
      (i) => i === true,
    );

    const OnOffServiceListCheck = oneOffServiceList.map((i) =>
      i.servicesList.some((item) => item.isSelected === true),
    );
    const OnOffServiceListLength = OnOffServiceListCheck.filter(
      (i) => i === true,
    );

    const recurringServicesIDsElement = await recurringServiceList?.flatMap(
      (item) =>
        item?.servicesList
          .filter((i) => i.isSelected === true)
          .map((newT) => newT.serviceID),
    );
    const oneOffServicesIDsElement = await oneOffServiceList?.flatMap((item) =>
      item?.servicesList
        .filter((i) => i.isSelected === true)
        .map((newT) => newT.serviceID),
    );

    const ServicesIDsElement = await recurringServicesIDsElement.concat(
      oneOffServicesIDsElement,
    );

    setServiceElementId(ServicesIDsElement);

    //check validation before get into Additional information component after select service
    if (NextTab === EngagementLetterHeader.AdditionalInformation) {
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
        let hasUndefinedTextOrDateorquantityDriver = false;

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
                  pricingList.driverTypeID === 5 &&
                  (pricingList.enteredText === undefined ||
                    pricingList.enteredText === null ||
                    pricingList.enteredText === "")
                ) {
                  hasUndefinedTextOrDateorquantityDriver = true;
                }
                // if (
                //   pricingList.driverVisibility &&
                //   pricingList.driverTypeID === 2 &&
                //   Number(pricingList.driverValue)
                // ) {
                //   const value = Number(pricingList.driverValue);
                //   const from = pricingList.quantity?.[0]?.quantityFrom;
                //   const to = pricingList.quantity?.[0]?.quantityTo;

                //   const parsedFrom = Number(from);
                //   const parsedTo = Number(to);

                //   const hasFrom = from !== undefined && from !== null && from !== '' && !isNaN(parsedFrom);
                //   const hasTo = to !== undefined && to !== null && to !== '' && !isNaN(parsedTo);

                //   if (
                //     (hasFrom && hasTo && (value < parsedFrom || value > parsedTo)) ||
                //     (hasFrom && !hasTo && value < parsedFrom) ||
                //     (!hasFrom && hasTo && value > parsedTo)
                //   ) {
                //     hasUndefinedTextOrDateorquantityDriver = true;
                //   }
                // }
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
                  pricingList.driverTypeID === 5 &&
                  pricingList.text[0]?.textValue !== null &&
                  (pricingList.enteredText === undefined ||
                    pricingList.enteredText === null ||
                    pricingList.enteredText === "")
                ) {
                  hasUndefinedTextOrDateorquantityDriver = true;
                }
                // if (
                //   pricingList.driverVisibility &&
                //   pricingList.driverTypeID === 2 &&
                //   Number(pricingList.driverValue)
                // ) {
                //   const value = Number(pricingList.driverValue);
                //   const from = pricingList.quantity?.[0]?.quantityFrom;
                //   const to = pricingList.quantity?.[0]?.quantityTo;

                //   const parsedFrom = Number(from);
                //   const parsedTo = Number(to);

                //   const hasFrom = from !== undefined && from !== null && from !== '' && !isNaN(parsedFrom);
                //   const hasTo = to !== undefined && to !== null && to !== '' && !isNaN(parsedTo);

                //   if (
                //     (hasFrom && hasTo && (value < parsedFrom || value > parsedTo)) ||
                //     (hasFrom && !hasTo && value < parsedFrom) ||
                //     (!hasFrom && hasTo && value > parsedTo)
                //   ) {
                //     hasUndefinedTextOrDateorquantityDriver = true;
                //   }
                // }
              }
            }
          });
        });

        if (
          hasUndefinedDriver ||
          hasUndefinedDriver2 ||
          hasUndefinedTextOrDateorquantityDriver
        ) {
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
          // console.log("Hee")
          setIsValidForm({
            ...isValidForm,
            BasicForm: true,
            SelectService: true,
          });
          setRequireMessage(false);
        }
        await GetAdditionalInformationListData(ServicesIDsElement);
      }
    }
    if (activeTab === EngagementLetterHeader.BasicInformation) {
      if (
        engagementObj.templateID === undefined ||
        engagementObj.templateID === null ||
        engagementObj.templateID === "" ||
        (engagementObj.selectSourceId == 1 &&
          (engagementObj.ClientID === undefined ||
            engagementObj.ClientID === null ||
            engagementObj.ClientID === "")) ||
        (engagementObj.selectSourceId == 2 &&
          (engagementObj.QuoteKeyID === undefined ||
            engagementObj.QuoteKeyID === null ||
            engagementObj.QuoteKeyID === "")) ||
        ((engagementObj.selectSourceId == 2 ||
          engagementObj.selectSourceId == 3 ||
          engagementObj.selectSourceId == 4) &&
          getServicePackageLookupList.length > 0 &&
          (engagementObj.acceptedServicePackageID === undefined ||
            engagementObj.acceptedServicePackageID === null ||
            engagementObj.acceptedServicePackageID === "")) ||
        engagementObj.selectSourceId === undefined ||
        engagementObj.selectSourceId === null ||
        engagementObj.selectSourceId === ""
      ) {
        setRequireMessage(true);
        return false;
      } else {
        setRequireMessage(false);
        if (Status === statusID.Draft) {
          AddUpdateEngagementLatter(statusID.Draft, "BasicInformation");
          setRequireMessage(false);
        } else {
          if (engagementObj.selectSourceId === 1) {
            setRequireMessage(false);
            GetPricingSettingModelData();
            if (
              location.state?.contractKeyID === null ||
              engagementObj.paymentGatewayID === null
            ) {
              GetPaymentGatewayModelData(common.organisationKeyID);
            }
            await GetRecurringServiceListData();
            await GetOneOffServiceListData();
            setIsValidForm({
              ...isValidForm,
              BasicForm: true,
            });
            setActiveTab(NextTab);
          } else if (engagementObj.selectSourceId === 3) {
            setRequireMessage(false);
            GetPricingSettingModelData();
            if (
              location.state?.contractKeyID === null ||
              engagementObj.paymentGatewayID === null
            ) {
              GetPaymentGatewayModelData(common.organisationKeyID);
            }
            await GetRecurringServiceListData();
            await GetOneOffServiceListData();
            setIsValidForm({
              ...isValidForm,
              BasicForm: true,
            });
            setActiveTab(NextTab);
          } else {
            setIsValidForm({
              ...isValidForm,
              BasicForm: true,
              SelectService: true,
            });
            GetPricingSettingModelData();
            if (
              location.state?.contractKeyID === null ||
              engagementObj.paymentGatewayID === null
            ) {
              GetPaymentGatewayModelData(common.organisationKeyID);
            }
            setLoader(false);
            setRequireMessage(false);
            setActiveTab(3);
          }
        }
      }
    } else if (activeTab === EngagementLetterHeader.SelectServices) {
      let hasUndefinedDriver = false;
      let hasUndefinedDriver2 = false;
      let hasUndefinedTextOrDateorquantityDriver = false;

      recurringServiceList.some((rService) => {
        return rService.servicesList?.some((service) => {
          if (service.isSelected === true) {
            for (let i = 0; i < service.pricingDriverList.length; i++) {
              const pricingList = service.pricingDriverList[i];
              if (
                pricingList.driverVisibility &&
                pricingList.driverTypeID !== 5 &&
                pricingList.driverTypeID !== 6 &&
                (pricingList.driverValue === undefined ||
                  pricingList.driverValue === null ||
                  pricingList.driverValue === "")
              ) {
                hasUndefinedDriver = true;
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
                pricingList.driverTypeID === 6
              ) {
                const isDateMandatory = pricingList.date?.some(
                  (block) =>
                    block.dateValue != null || block.defaultDateValue != null,
                );

                if (
                  isDateMandatory &&
                  (pricingList.enteredDate === undefined ||
                    pricingList.enteredDate === null ||
                    pricingList.enteredDate === "")
                ) {
                  hasUndefinedTextOrDateorquantityDriver = true;
                }
              }
              if (
                pricingList.driverVisibility &&
                pricingList.driverTypeID === 5 &&
                pricingList.text?.[0]?.textValue !== null &&
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

                const hasFrom =
                  from !== undefined &&
                  from !== null &&
                  from !== "" &&
                  !isNaN(parsedFrom);
                const hasTo =
                  to !== undefined &&
                  to !== null &&
                  to !== "" &&
                  !isNaN(parsedTo);

                if (
                  (hasFrom &&
                    hasTo &&
                    (value < parsedFrom || value > parsedTo)) ||
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
                pricingList.driverVisibility &&
                pricingList.driverTypeID !== 5 &&
                pricingList.driverTypeID !== 6 &&
                (pricingList.driverValue === undefined ||
                  pricingList.driverValue === null ||
                  pricingList.driverValue === "")
              ) {
                hasUndefinedDriver2 = true;
                setIsValidForm({
                  ...isValidForm,
                  BasicForm: true,
                  AdditionalInfo: false,
                  PricingInfo: false,
                });
                return true; // Break out of the inner loop and stop iterating
              } else {
                hasUndefinedDriver2 = false;
                setIsValidForm({
                  ...isValidForm,
                  BasicForm: true,
                  PricingInfo: true,
                });
              }
              if (
                pricingList.driverVisibility &&
                pricingList.driverTypeID === 6
              ) {
                const isDateMandatory = pricingList.date?.some(
                  (block) =>
                    block.dateValue != null || block.defaultDateValue != null,
                );

                if (
                  isDateMandatory &&
                  (pricingList.enteredDate === undefined ||
                    pricingList.enteredDate === null ||
                    pricingList.enteredDate === "")
                ) {
                  hasUndefinedTextOrDateorquantityDriver = true;
                }
              }
              if (
                pricingList.driverVisibility &&
                pricingList.driverTypeID === 5 &&
                pricingList.text?.[0]?.textValue !== null &&
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

                const hasFrom =
                  from !== undefined &&
                  from !== null &&
                  from !== "" &&
                  !isNaN(parsedFrom);
                const hasTo =
                  to !== undefined &&
                  to !== null &&
                  to !== "" &&
                  !isNaN(parsedTo);

                if (
                  (hasFrom &&
                    hasTo &&
                    (value < parsedFrom || value > parsedTo)) ||
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

      if (
        hasUndefinedDriver ||
        hasUndefinedDriver2 ||
        hasUndefinedTextOrDateorquantityDriver
      ) {
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
        if (Status === statusID.Draft) {
          setRequireMessage(false);
          AddUpdateEngagementLatter(statusID.Draft, "SelectServices");
        } else {
          setIsValidForm({
            ...isValidForm,
            BasicForm: true,
            SelectService: true,
          });
          setRequireMessage(false);
          setActiveTab(NextTab);
        }
      } else {
        setIsValidForm({
          ...isValidForm,
          SelectService: false,
          AdditionalInfo: false,
          PricingInfo: false,
        });
        setRequireMessage(true);
      }
    } else if (activeTab === EngagementLetterHeader.ReviewPackages) {
      if (selectedRecurringServiceList.length !== 0) {
        let IsRecurringValuesValidResponse = validatePricingInfo(
          RecurringPricingInfo,
          engagementObj,
          pricingSettingObj,
          "Package",
        );
        // let IsRecurringValuesValidResponse = IsRecurringPackageValuesValid();

        if (IsRecurringValuesValidResponse) {
          // if (IsRecurringValuesValidResponse.IsRecurringPackageValueNegative || IsRecurringValuesValidResponse.IsRecurringPackageValueValid) {

          if (selectedPackagesList.length === 1) {
            scrollUpDownByElementID("recurring_Default");
          } else {
            scrollUpDownByElementID("recurring_DefaultWithPackages");
          }
          setRequireMessage(true);
          setIsValidForm({
            ...isValidForm,
            Preview: false,
          });
          setLoader(false);
          return false;
        }
      }

      if (selectedOneOffServiceList.length !== 0) {
        //Check Validation for OneOff Services
        let IsOneOffValuesValidResponse = validateOneOffPricingInfo(
          OneOffPricingInfo,
          pricingSettingObj,
          "Package",
        );
        // let IsOneOffValuesValidResponse = IsOneOffPackageValuesValid();

        if (IsOneOffValuesValidResponse) {
          // if (IsOneOffValuesValidResponse.IsOneOffPackageValueValid || IsOneOffValuesValidResponse.IsOneOffPackageValueNegative) {

          if (selectedPackagesList.length === 1) {
            scrollUpDownByElementID("OneOff_Default");
          } else {
            scrollUpDownByElementID("OneOff_DefaultWithPackages");
          }
          setRequireMessage(true);
          setIsValidForm({
            ...isValidForm,
            Preview: false,
          });
          setLoader(false);
          return false;
        }
      }
      if (Status === statusID.Draft) {
        AddUpdateEngagementLatter(statusID.Draft, "ReviewPackage");
        setRequireMessage(false);
      } else {
        if (
          engagementObj.paymentGatewayID ===
          ChangeDefaultPaymentGatewaysTypes.Stripe
        ) {
          if (
            isValueGreaterThan20000(
              RecurringPricingInfo,
              OneOffPricingInfo,
              vatPercentage,
              selectedPackagesList,
            )
          ) {
            setLoader(false);
            setErrorMessage(
              `Stripe cannot be selected as the payment method because your total exceeds ${currencySymbol}20,000. Please choose another payment method.`,
            );
            setOpenErrorModal(true);
            return;
          }
        }
        GetTemplateModalData(NextTab);
        setRequireMessage(false);
        setIsValidForm({
          ...isValidForm,
          ReviewService: true,
          ReviewPackages: true,
        });
      }
    } else if (activeTab === EngagementLetterHeader.AdditionalInformation) {
      // Filter the list based on driverTypeID being either 2 or 4
      let hasError = false;
      const filteredList = additionalInformationList.filter(
        (item) =>
          item.driverTypeID === 2 ||
          item.driverTypeID === 4 ||
          item.driverTypeID === 3 ||
          item.driverTypeID === 6,
      );
      // Check if any of the filtered items have driverValue as null, empty string, or undefined

      if (
        engagementObj.tnCTemplateID === null ||
        engagementObj.tnCTemplateID === undefined ||
        engagementObj.tnCTemplateID === ""
      ) {
        setRequireMessage(true);
        scrollUpDownByElementID("TnC-Div");
        setIsValidForm({
          ...isValidForm,
          PricingInfo: false,
        });
        hasError = true;
      }
      if (contractSignatoriesList?.length === 0) {
        scrollUpDownByElementID(`SignatoryBlockDiv`);
        setRequireMessage(true);
        setIsValidForm({
          ...isValidForm,
          PricingInfo: false,
        });
        hasError = true;
      } else if (contractSignatoriesList?.length !== 0) {
        for (let i = 0; i < contractSignatoriesList?.length; i++) {
          if (
            contractSignatoriesList[i].firstName === undefined ||
            contractSignatoriesList[i].firstName === null ||
            contractSignatoriesList[i].firstName === "" ||
            contractSignatoriesList[i].lastName === undefined ||
            contractSignatoriesList[i].lastName === null ||
            contractSignatoriesList[i].lastName === "" ||
            contractSignatoriesList[i].emailID === undefined ||
            contractSignatoriesList[i].emailID === null ||
            contractSignatoriesList[i].emailID === "" ||
            !isValidEmail(contractSignatoriesList[i].emailID) ||
            contractSignatoriesList[i].signaturePositionID === undefined ||
            contractSignatoriesList[i].signaturePositionID === null ||
            contractSignatoriesList[i].signaturePositionID === ""
          ) {
            setRequireMessage(true);
            scrollUpDownByElementID(`contract-signatory-${i}`);
            setIsValidForm({
              ...isValidForm,
              PricingInfo: false,
            });
            hasError = true;
            break;
          }
          if (isDuplicateEmail(contractSignatoriesList[i].emailID, i)) {
            setEmailError(`Duplicate email should not be allowed.`);
            // scrollUpDownByElementID(`AdditionalInfoEmailError`);
            setOpenErrorModal(true);
            hasError = true;
            return false;
          }

          // Extract email IDs from both lists
          if (organisationData.otherInformation[0].signatureImageUrl === null) {
            const officerEmails = organisationData.officersList.map((officer) =>
              officer.emailID?.toLowerCase(),
            );
            const signatoryEmails = contractSignatoriesList.map((signatory) =>
              signatory.emailID?.toLowerCase(),
            );

            // Combine both arrays
            const allEmails = [...officerEmails, ...signatoryEmails];

            // Use a Map to count occurrences of each email
            const emailCount = allEmails.reduce((acc, email) => {
              if (email) {
                acc[email] = (acc[email] || 0) + 1;
              }
              return acc;
            }, {});

            // Find duplicates
            const duplicateEmails = Object.keys(emailCount).filter(
              (email) => emailCount[email] > 1,
            );

            // Check if there are any duplicates
            const hasDuplicates = duplicateEmails.length > 0;

            if (hasDuplicates) {
              setEmailError(
                `Practice and ${prospectName} both have the same email: ${duplicateEmails.join(
                  ", ",
                )}`,
              );
              // scrollUpDownByElementID(`AdditionalInfoEmailError`);
              setOpenErrorModal(true);
              hasError = true;
              return false;
            }
          }
        }
      }
      const hasInvalidValues = filteredList.some(
        (i) =>
          i.driverValue === null ||
          i.driverValue === "" ||
          i.driverValue === undefined ||
          i.driverValue === "." ||
          i.driverValue === "-",
      );

      if (hasInvalidValues) {
        setRequireMessage(true);
        filteredList.forEach((item) => {
          if (
            item.driverValue === null ||
            item.driverValue === "" ||
            item.driverValue === undefined ||
            item.driverValue === "." ||
            item.driverValue === "-"
          ) {
            scrollUpDownByElementID(item.driverName);
            setIsValidForm({
              ...isValidForm,
              PricingInfo: false,
            });
            hasError = true;
          }
        });
      } else {
        if (!hasError) {
          if (Status === statusID.Draft) {
            setRequireMessage(false);
            AddUpdateEngagementLatter(statusID.Draft, "AdditionalInformation");
          } else if (engagementObj.selectSourceId == 1) {
            setRequireMessage(false);
            const ServicePricing = await handleSetCalculatedPackageData();
            GetCalculatedServicesPriceData(ServicePricing, 4);
          } else if (engagementObj.selectSourceId === 3) {
            setRequireMessage(false);
            const ServicePricing = await handleSetCalculatedPackageData();
            GetCalculatedPackageServicesPriceData(ServicePricing, 7);
          } else if (engagementObj.selectSourceId === 4) {
            const GetRecurringServiceListData = async () => {
              try {
                const data = await GetPackageServicesList({
                  userKeyID: common.userKeyID,
                  organisationKeyID: common.organisationKeyID,
                  ServiceChargeTypeID: 1,
                  moduleKeyID: null,
                  moduleName: "Contract",
                  ProfessionTypeIDs: null,
                  BusinessTypeIDs: null,
                  QuoteTypeID: null, //For Quotation
                  SourceID: engagementObj.selectSourceId, //For Contract
                  BusinessNatureIDs: null,
                  ClientKeyID: engagementObj.ClientID.toString(),
                  ServicePackageIDs:
                    engagementObj.acceptedServicePackageID !== null
                      ? [engagementObj.acceptedServicePackageID]
                      : null,
                });
                if (data) {
                  if (data?.data?.statusCode === 200) {
                    if (data?.data?.responseData?.data) {
                      const PackageServiceListData =
                        data.data.responseData.data;
                      // setRecurringServiceList(PackageServiceListData);
                      return PackageServiceListData;
                    }
                  } else {
                    setErrorMessage(data?.data?.errorMessage);
                  }
                }
              } catch (error) {
                console.log(error);
              }
            };
            // await GetOneOffServiceListData();
            const GetOneOffServiceListData = async (i) => {
              try {
                const data = await GetPackageServicesList({
                  userKeyID: common.userKeyID,
                  organisationKeyID: common.organisationKeyID, //common.organisationKeyID,//common.organisationKeyID,
                  ServiceChargeTypeID: 2,
                  moduleID: null,
                  moduleName: "Contract",
                  ProfessionTypeIDs: null,
                  BusinessTypeIDs: null,
                  BusinessNatureIDs: null,
                  QuoteTypeID: null, //For Quotation
                  SourceID: engagementObj.selectSourceId, //For Contract
                  ClientKeyID: engagementObj.ClientID.toString(),
                  ServicePackageIDs:
                    engagementObj.acceptedServicePackageID !== null
                      ? [engagementObj.acceptedServicePackageID]
                      : null,
                });
                if (data) {
                  if (data?.data?.statusCode === 200) {
                    if (data?.data?.responseData?.data) {
                      const PackageServiceListDataOneOff =
                        data.data.responseData.data;
                      return PackageServiceListDataOneOff;
                    }
                  } else {
                    setErrorMessage(data?.data?.errorMessage);
                  }
                }
              } catch (error) {
                console.log(error);
              }
            };

            const GetAdditionalInformationListData1 = async (
              extractedServiceIDs,
            ) => {
              setLoader(true);

              try {
                const data = await GetAdditionalInformationList({
                  userKeyID: common.userKeyID,
                  organisationKeyID: common.organisationKeyID,
                  ServicesIDs: extractedServiceIDs,
                  ServicePackageIDs:
                    engagementObj.acceptedServicePackageID !== null
                      ? [engagementObj.acceptedServicePackageID]
                      : null,
                  clientID: engagementObj.ClientID,
                  moduleID: null,
                  moduleName: "Contract", // "ServicePackage / Quotation / Contract"
                });

                if (data && data.data) {
                  setLoader(false);
                  const { statusCode, responseData } = data.data;
                  if (statusCode === 200) {
                    setLoader(false);
                    if (responseData && responseData.data) {
                      const additionalInformationListData = responseData.data;
                      return additionalInformationListData;
                    }
                  }
                }
              } catch (error) {
                setLoader(false);
                console.error(error);
              }
            };
            const recurringServiceListData =
              await GetRecurringServiceListData();
            const oneOffServiceListData = await GetOneOffServiceListData();
            const SelectedRecurringService = recurringServiceListData.map(
              (item) => {
                return {
                  ...item,
                  servicesList: item.servicesList.filter(
                    (service) => service.isSelected,
                  ),
                };
              },
            );
            const SelectedOneOffService = oneOffServiceListData.map((item) => {
              return {
                ...item,
                servicesList: item.servicesList.filter(
                  (service) => service.isSelected,
                ),
              };
            });
            const combinedData = [
              ...SelectedRecurringService,
              ...SelectedOneOffService,
            ];
            const extractedServiceIDs = combinedData.flatMap((item) =>
              item.servicesList.map((service) => service.serviceID),
            );
            const uniqueServiceIDs = [...new Set(extractedServiceIDs)];
            const GetAdditionalInformationListData =
              await GetAdditionalInformationListData1(uniqueServiceIDs);

            const ServicePricing = await handleSetCalculatedPackageServiceData(
              GetAdditionalInformationListData,
              SelectedRecurringService,
              SelectedOneOffService,
            );

            GetCalculatedPackageServicesPriceData(
              ServicePricing,
              7,
              SelectedRecurringService,
              SelectedOneOffService,
            );
          } else if (
            engagementObj.selectSourceId === 2 &&
            engagementObj.quoteTypeID === 4
          ) {
            await GetSelectedServicePackageAcceptData(5);
            GetTemplateModalData(EngagementLetterHeader.Preview);
          } else {
            setIsValidForm({
              ...isValidForm,
              AdditionalInfo: true,
              SelectService: true,
            });
            setRequireMessage(false);
            if (isBack) {
              setActiveTab(4);
            } else {
              GetSelectedServicePackageAcceptData(4);
            }
          }
        }
      }
    } else if (activeTab === EngagementLetterHeader.ReviewServices) {
      const hasInvalidRecurring = hasInvalidServiceNames(
        selectedRecurringServiceList,
      );
      const hasInvalidOneOff = hasInvalidServiceNames(
        selectedOneOffServiceList,
      );
      if (
        (selectedRecurringServiceList.length !== 0 &&
          (RecurringPricingInfo.DiscountedPrice === "" ||
            RecurringPricingInfo.DiscountedPrice === null ||
            RecurringPricingInfo.DiscountedPrice === undefined ||
            (engagementObj.Payment_Frequency == 4 &&
              pricingSettingObj.minMonthlyPriceForQC !== "" &&
              pricingSettingObj.minMonthlyPriceForQC !== null &&
              pricingSettingObj.minMonthlyPriceForQC !== undefined &&
              Number(RecurringPricingInfo.DiscountedPrice) <
                Number(pricingSettingObj.minMonthlyPriceForQC)) ||
            (engagementObj.Payment_Frequency === 3 &&
              pricingSettingObj.minQuarterlyPriceForQC !== "" &&
              pricingSettingObj.minQuarterlyPriceForQC !== null &&
              pricingSettingObj.minQuarterlyPriceForQC !== undefined &&
              Number(RecurringPricingInfo.DiscountedPrice) <
                Number(pricingSettingObj.minQuarterlyPriceForQC)) ||
            (engagementObj.Payment_Frequency === 2 &&
              pricingSettingObj.minHalfYearlyPriceForQC !== "" &&
              pricingSettingObj.minHalfYearlyPriceForQC !== null &&
              pricingSettingObj.minHalfYearlyPriceForQC !== undefined &&
              Number(RecurringPricingInfo.DiscountedPrice) <
                Number(pricingSettingObj.minHalfYearlyPriceForQC)) ||
            (engagementObj.Payment_Frequency === 1 &&
              pricingSettingObj.minYearlyPriceForQC !== "" &&
              pricingSettingObj.minYearlyPriceForQC !== null &&
              pricingSettingObj.minYearlyPriceForQC !== undefined &&
              Number(RecurringPricingInfo.DiscountedPrice) <
                Number(pricingSettingObj.minYearlyPriceForQC)) ||
            ((pricingSettingObj.minMonthlyPriceForQC == "" ||
              pricingSettingObj.minMonthlyPriceForQC == null ||
              pricingSettingObj.minMonthlyPriceForQC == undefined) &&
              RecurringPricingInfo.DiscountedPrice !== "" &&
              RecurringPricingInfo.DiscountedPrice !== null &&
              RecurringPricingInfo.DiscountedPrice !== undefined &&
              Number(RecurringPricingInfo.DiscountedPrice) <= 0) ||
            (pricingSettingObj.maxDiscountForQC !== "" &&
              pricingSettingObj.maxDiscountForQC !== null &&
              pricingSettingObj.maxDiscountForQC !== undefined &&
              (Number(RecurringPricingInfo.DefaultDiscount) < -999.0 ||
                Number(RecurringPricingInfo.DefaultDiscount) >
                  Number(pricingSettingObj.maxDiscountForQC))) ||
            ((pricingSettingObj.maxDiscountForQC == "" ||
              pricingSettingObj.maxDiscountForQC == null ||
              pricingSettingObj.maxDiscountForQC == undefined) &&
              (Number(RecurringPricingInfo.DefaultDiscount) < -999.0 ||
                Number(RecurringPricingInfo.DefaultDiscount) > 100)) ||
            (RecurringPricingInfo.DiscountedPrice !== "" &&
              RecurringPricingInfo.DiscountedPrice !== "-" &&
              isNaN(RecurringPricingInfo.DiscountedPrice)) ||
            (RecurringPricingInfo.DefaultDiscount !== "" &&
              RecurringPricingInfo.DefaultDiscount !== "-" &&
              isNaN(RecurringPricingInfo.DefaultDiscount)))) ||
        (selectedOneOffServiceList.length !== 0 &&
          (OneOffPricingInfo.DiscountedPrice === "" ||
            OneOffPricingInfo.DiscountedPrice === null ||
            OneOffPricingInfo.DiscountedPrice === undefined ||
            (pricingSettingObj.maxDiscountForQC !== "" &&
              pricingSettingObj.maxDiscountForQC !== null &&
              pricingSettingObj.maxDiscountForQC !== undefined &&
              (Number(OneOffPricingInfo.DefaultDiscount) < -999.0 ||
                Number(OneOffPricingInfo.DefaultDiscount) >
                  Number(pricingSettingObj.maxDiscountForQC))) ||
            (pricingSettingObj.minOneOffPriceForQC !== "" &&
              pricingSettingObj.minOneOffPriceForQC !== null &&
              pricingSettingObj.minOneOffPriceForQC !== undefined &&
              Number(OneOffPricingInfo.DiscountedPrice) <
                Number(pricingSettingObj.minOneOffPriceForQC)) ||
            ((pricingSettingObj.minOneOffPriceForQC == "" ||
              pricingSettingObj.minOneOffPriceForQC == null ||
              pricingSettingObj.minOneOffPriceForQC == 0 ||
              pricingSettingObj.minOneOffPriceForQC == undefined) &&
              OneOffPricingInfo.DiscountedPrice !== "" &&
              OneOffPricingInfo.DiscountedPrice !== null &&
              OneOffPricingInfo.DiscountedPrice !== undefined &&
              Number(OneOffPricingInfo.DiscountedPrice) <= 0) ||
            ((pricingSettingObj.maxDiscountForQC == "" ||
              pricingSettingObj.maxDiscountForQC == null ||
              pricingSettingObj.maxDiscountForQC == undefined) &&
              (Number(OneOffPricingInfo.DefaultDiscount) < -999.0 ||
                Number(OneOffPricingInfo.DefaultDiscount) > 100)) ||
            (OneOffPricingInfo.DiscountedPrice !== "" &&
              OneOffPricingInfo.DiscountedPrice !== "-" &&
              isNaN(OneOffPricingInfo.DiscountedPrice)) ||
            (OneOffPricingInfo.DefaultDiscount !== "" &&
              OneOffPricingInfo.DefaultDiscount !== "-" &&
              isNaN(OneOffPricingInfo.DefaultDiscount)))) ||
        (selectedRecurringServiceList.length !== 0 && hasInvalidRecurring) ||
        (selectedOneOffServiceList.length !== 0 && hasInvalidOneOff)
      ) {
        setRequireMessage(true);
        setIsValidForm({
          ...isValidForm,
          Preview: false,
        });
        if (
          selectedRecurringServiceList.length !== 0 &&
          (RecurringPricingInfo.DiscountedPrice === "" ||
            RecurringPricingInfo.DiscountedPrice === null ||
            RecurringPricingInfo.DiscountedPrice === undefined ||
            (engagementObj.Payment_Frequency == 4 &&
              pricingSettingObj.minMonthlyPriceForQC !== "" &&
              pricingSettingObj.minMonthlyPriceForQC !== null &&
              pricingSettingObj.minMonthlyPriceForQC !== undefined &&
              Number(RecurringPricingInfo.DiscountedPrice) <=
                Number(pricingSettingObj.minMonthlyPriceForQC)) ||
            ((pricingSettingObj.minMonthlyPriceForQC == "" ||
              pricingSettingObj.minMonthlyPriceForQC == null ||
              pricingSettingObj.minMonthlyPriceForQC == undefined) &&
              RecurringPricingInfo.DiscountedPrice !== "" &&
              RecurringPricingInfo.DiscountedPrice !== null &&
              RecurringPricingInfo.DiscountedPrice !== undefined &&
              Number(RecurringPricingInfo.DiscountedPrice) <= 0) ||
            (pricingSettingObj.maxDiscountForQC !== "" &&
              pricingSettingObj.maxDiscountForQC !== null &&
              pricingSettingObj.maxDiscountForQC !== undefined &&
              (Number(RecurringPricingInfo.DefaultDiscount) < -999.0 ||
                Number(RecurringPricingInfo.DefaultDiscount) >
                  Number(pricingSettingObj.maxDiscountForQC))) ||
            ((pricingSettingObj.maxDiscountForQC == "" ||
              pricingSettingObj.maxDiscountForQC == null ||
              pricingSettingObj.maxDiscountForQC == undefined) &&
              (Number(RecurringPricingInfo.DefaultDiscount) < -999.0 ||
                Number(RecurringPricingInfo.DefaultDiscount) > 100)) ||
            (RecurringPricingInfo.DiscountedPrice !== "" &&
              RecurringPricingInfo.DiscountedPrice !== "-" &&
              isNaN(RecurringPricingInfo.DiscountedPrice)) ||
            (RecurringPricingInfo.DefaultDiscount !== "" &&
              RecurringPricingInfo.DefaultDiscount !== "-" &&
              isNaN(RecurringPricingInfo.DefaultDiscount)))
        ) {
          scrollUpDownByElementID("recurring_Default");
        } else if (
          selectedOneOffServiceList.length !== 0 &&
          (OneOffPricingInfo.DiscountedPrice === "" ||
            OneOffPricingInfo.DiscountedPrice === null ||
            OneOffPricingInfo.DiscountedPrice === undefined ||
            (pricingSettingObj.minOneOffPriceForQC !== "" &&
              pricingSettingObj.minOneOffPriceForQC !== null &&
              pricingSettingObj.minOneOffPriceForQC !== undefined &&
              Number(OneOffPricingInfo.DiscountedPrice) <
                Number(pricingSettingObj.minOneOffPriceForQC)) ||
            (pricingSettingObj.maxDiscountForQC !== "" &&
              pricingSettingObj.maxDiscountForQC !== null &&
              pricingSettingObj.maxDiscountForQC !== undefined &&
              Number(OneOffPricingInfo.DefaultDiscount) >=
                Number(pricingSettingObj.maxDiscountForQC)) ||
            ((pricingSettingObj.minOneOffPriceForQC == "" ||
              pricingSettingObj.minOneOffPriceForQC == null ||
              pricingSettingObj.minOneOffPriceForQC == 0 ||
              pricingSettingObj.minOneOffPriceForQC == undefined) &&
              OneOffPricingInfo.DiscountedPrice !== "" &&
              OneOffPricingInfo.DiscountedPrice !== null &&
              OneOffPricingInfo.DiscountedPrice !== undefined &&
              Number(OneOffPricingInfo.DiscountedPrice) <= 0) ||
            (pricingSettingObj.maxDiscountForQC !== "" &&
              pricingSettingObj.maxDiscountForQC !== null &&
              pricingSettingObj.maxDiscountForQC !== undefined &&
              (Number(OneOffPricingInfo.DefaultDiscount) < -999.0 ||
                Number(OneOffPricingInfo.DefaultDiscount) >
                  Number(pricingSettingObj.maxDiscountForQC))) ||
            ((pricingSettingObj.maxDiscountForQC == "" ||
              pricingSettingObj.maxDiscountForQC == null ||
              pricingSettingObj.maxDiscountForQC == undefined) &&
              (Number(OneOffPricingInfo.DefaultDiscount) < -999.0 ||
                Number(OneOffPricingInfo.DefaultDiscount) > 100)) ||
            (OneOffPricingInfo.DiscountedPrice !== "" &&
              OneOffPricingInfo.DiscountedPrice !== "-" &&
              isNaN(OneOffPricingInfo.DiscountedPrice)) ||
            (OneOffPricingInfo.DefaultDiscount !== "" &&
              OneOffPricingInfo.DefaultDiscount !== "-" &&
              isNaN(OneOffPricingInfo.DefaultDiscount)))
        ) {
          scrollUpDownByElementID("OneOff_Default");
        }

        return false;
      } else {
        if (Status === statusID.Draft) {
          setRequireMessage(false);
          AddUpdateEngagementLatter(statusID.Draft, "ReviewServices");
        } else {
          if (
            engagementObj.paymentGatewayID ===
            ChangeDefaultPaymentGatewaysTypes.Stripe
          ) {
            if (
              isValueGreaterThan20000(
                RecurringPricingInfo,
                OneOffPricingInfo,
                vatPercentage,
                [],
              )
            ) {
              setLoader(false);
              setErrorMessage(
                `Stripe cannot be selected as the payment method because your total exceeds ${currencySymbol}20,000. Please choose another payment method.`,
              );
              setOpenErrorModal(true);
              return;
            }
          }
          setRequireMessage(false);
          GetTemplateModalData(NextTab);
        }
      }
    } else if (activeTab === EngagementLetterHeader.Preview) {
      if (Status === statusID.Draft) {
        setRequireMessage(false);
        AddUpdateEngagementLatter(statusID.Draft, "Preview");
      } else {
        AddUpdateEngagementLatter(2, "Preview");
      }
    }
  };

  //14) Get Selected service and create object to send api for get calculation  price data
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
                          (item) => item.isDefault === true,
                        ) || {}
                      ).variationValue ||
                      (
                        driver.slab?.find((item) => item.isDefault === true) ||
                        {}
                      ).slabValue ||
                      (Array.isArray(driver.text) && driver.text.length > 0
                        ? driver.text[0].textValue
                        : null) ||
                      (
                        driver.date?.find((item) => item.isDefault === true) ||
                        {}
                      ).dateValue ||
                      driver.driverValue,
                    variationID:
                      (
                        driver.variation?.find(
                          (item) => item.isDefault === true,
                        ) || {}
                      ).variationID || null,
                    slabID:
                      (
                        driver.slab?.find((item) => item.isDefault === true) ||
                        {}
                      ).slabID || null,
                    textID:
                      Array.isArray(driver.text) && driver.text.length > 0
                        ? driver.text[0].textID
                        : null,
                    dateID:
                      Array.isArray(driver.date) && driver.date.length > 0
                        ? driver.date.find((d) => d.isDefault === true)?.dateID
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
                  dateID: null,
                };
              }
            }),
        )
        .flat();
    };
    const recurringServicesObj = await extractServiceData(
      recurringServiceList,
      1,
    );
    const oneOffServicesObj = await extractServiceData(oneOffServiceList, 2);

    const AdditionalData = additionalInformationList
      ?.filter((item) => {
        if (item.driverTypeID === 2) {
          return true;
        } else if (item.slab !== null) {
          return item.slab.some((slab) => slab.isDefault);
        } else if (item.variation !== null) {
          return item.variation.some((variation) => variation.isDefault);
        } else if (item.date !== null) {
          return item.date.some((date) => date.isDefault);
        } else if (item.text !== null) {
          return true;
        } else {
          return false;
        }
      })
      .map((item) => ({
        serviceID: item.serviceID,
        globalPricingDriverID: item.globalPricingDriverID,
        driverValue: item.driverValue,
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
        textID: item.text !== null ? (item.text?.[0]?.textID ?? null) : null,
      }))
      .flat();

    const ServicePricing = {
      userKeyID: common.userKeyID,
      ServicePackageIDs:
        engagementObj.acceptedServicePackageID !== null
          ? [engagementObj.acceptedServicePackageID]
          : null,
      organisationKeyID: common.organisationKeyID,
      GetValueOf: (() => {
        let paymentFrequency = null;
        switch (engagementObj.Payment_Frequency) {
          case 1:
            paymentFrequency = "Yearly";
            break;
          case 2:
            paymentFrequency = "HalfYearly";
            break;
          case 3:
            paymentFrequency = "Quarterly";
            break;
          case 4:
            paymentFrequency = "Monthly";
            break;
          default:
            paymentFrequency = null;
        }
        return paymentFrequency;
      })(),
      calculateServicesGPDList: [
        ...oneOffServicesObj,
        ...recurringServicesObj,
        ...AdditionalData,
      ],
    };

    return ServicePricing;
  }
  async function handleSetCalculatedPackageServiceData(
    AdditionalInformationList,
    recurringServiceListData,
    oneOffServiceListData,
  ) {
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
                          (item) => item.isDefault === true,
                        ) || {}
                      ).variationValue ||
                      (
                        driver.slab?.find((item) => item.isDefault === true) ||
                        {}
                      ).slabValue ||
                      (Array.isArray(driver.text) && driver.text.length > 0
                        ? driver.text[0].textValue
                        : 0) ||
                      driver.date?.find(
                        (d) => d.dateValue === driver.driverValue,
                      )?.dateValue ||
                      driver.date?.[0]?.defaultDateValue ||
                      0 ||
                      driver.driverValue,
                    variationID:
                      (
                        driver.variation?.find(
                          (item) => item.isDefault === true,
                        ) || {}
                      ).variationID || null,
                    slabID:
                      (
                        driver.slab?.find((item) => item.isDefault === true) ||
                        {}
                      ).slabID || null,
                    dateID:
                      (
                        driver.date?.find((item) => item.isDefault === true) ||
                        {}
                      ).dateID || null,
                    textID:
                      Array.isArray(driver.text) && driver.text.length > 0
                        ? driver.text[0].textID
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
                  dateID: null,
                  textID: null,
                };
              }
            }),
        )
        .flat();
    };

    const recurringServicesObj = await extractServiceData(
      recurringServiceListData,
      1,
    );
    const oneOffServicesObj = await extractServiceData(
      oneOffServiceListData,
      2,
    );

    const AdditionalData = AdditionalInformationList?.filter((item) => {
      if (item.driverTypeID === 2) {
        return true;
      } else if (item.slab !== null) {
        return item.slab.some((slab) => slab.isDefault);
      } else if (item.variation !== null) {
        return item.variation.some((variation) => variation.isDefault);
      } else if (item.date !== null) {
        return item.date.some((date) => date.isDefault);
      } else if (item.text !== null) {
        return true;
      } else {
        return false;
      }
    })
      .map((item) => ({
        serviceID: item.serviceID,
        globalPricingDriverID: item.globalPricingDriverID,
        driverValue: item.driverValue,
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
        textID: item.text !== null ? (item.text?.[0]?.textID ?? null) : null,
      }))
      .flat();

    const ServicePricing = {
      userKeyID: common.userKeyID,
      ServicePackageIDs:
        engagementObj.acceptedServicePackageID !== null
          ? [engagementObj.acceptedServicePackageID]
          : null,
      organisationKeyID: common.organisationKeyID,
      GetValueOf: (() => {
        let paymentFrequency = null;
        switch (engagementObj.Payment_Frequency) {
          case 1:
            paymentFrequency = "Yearly";
            break;
          case 2:
            paymentFrequency = "HalfYearly";
            break;
          case 3:
            paymentFrequency = "Quarterly";
            break;
          case 4:
            paymentFrequency = "Monthly";
            break;
          default:
            paymentFrequency = null;
        }
        return paymentFrequency;
      })(),
      calculateServicesGPDList: [
        ...oneOffServicesObj,
        ...recurringServicesObj,
        ...AdditionalData,
      ],
    };

    return ServicePricing;
  }
  //15) Add Update and Engagement Data
  const AddUpdateEngagementLatter = async (statusId, moduleName) => {
    setLoader(true);
    let SelectedService = [];

    const recArray = recurringServiceList
      .filter((category) =>
        category.servicesList.some((service) => service.isSelected),
      )
      .map((category) => ({
        serviceCatID: category.serviceCatID,
        serviceCatName: category.serviceCatName,
        servicesList: category.servicesList.filter(
          (service) => service.isSelected,
        ),
      }));
    const OneArray = oneOffServiceList
      .filter((category) =>
        category.servicesList.some((service) => service.isSelected),
      )
      .map((category) => ({
        serviceCatID: category.serviceCatID,
        serviceCatName: category.serviceCatName,
        servicesList: category.servicesList.filter(
          (service) => service.isSelected,
        ),
      }));

    const recArrayWithPrice = await recArray.map((category) => ({
      serviceCatID: category.serviceCatID,
      serviceCatName: category.serviceCatName,
      servicesList: category.servicesList.map((service) => ({
        ...service,
      })),
    }));

    const OneArrayWithPrice = await OneArray.map((category) => ({
      serviceCatID: category.serviceCatID,
      serviceCatName: category.serviceCatName,
      servicesList: category.servicesList.map((service) => ({
        ...service,
      })),
    }));

    if (activeTab == 2 || activeTab == 3) {
      SelectedService = [...recArrayWithPrice, ...OneArrayWithPrice];
    } else {
      SelectedService = [
        ...selectedRecurringServiceList,
        ...selectedOneOffServiceList,
      ];
    }
    const modifiedArray = {
      selectedServicesList: SelectedService.flatMap((category) =>
        category.servicesList.map((service) => {
          const moduleServicesGPDList =
            service.pricingDriverList !== undefined &&
            service.pricingDriverList
              .filter((item) => item.driverVisibility === true)
              .map((driver) => ({
                driverValue:
                  driver.variation !== null
                    ? driver.variation?.filter(
                        (item) => item.isDefault === true,
                      )[0]?.variationValue
                    : driver.slab !== null
                      ? driver.slab?.filter(
                          (item) => item.isDefault === true,
                        )[0]?.slabValue
                      : driver.date !== null
                        ? driver.date?.length > 0
                          ? (driver.date.find(
                              (d) => d.dateValue === driver.driverValue,
                            )?.dateValue ??
                            driver.date[0].defaultDateValue ??
                            0)
                          : 0
                        : driver.text !== null
                          ? (driver.driverValue ??
                            driver.text?.find((d) => d.textID === driver.textID)
                              ?.textValue ??
                            0)
                          : driver.driverValue,
                msgMapID: driver.msgMapID || null,
                msMapID: driver.msMapID || null,
                globalPricingDriverID: driver.globalPricingDriverID,
                variationID: driver.variation
                  ? driver.variation.filter(
                      (item) => item.isDefault === true,
                    )[0]?.variationID
                  : null,
                slabID: driver.slab
                  ? driver.slab.filter((item) => item.isDefault === true)[0]
                      ?.slabID
                  : null,
                textID:
                  driver.driverTypeID === 5
                    ? driver.textID ||
                      driver.text?.find(
                        (d) => d.textValue === driver.driverValue,
                      )?.textID ||
                      null
                    : null,
                dateID:
                  Array.isArray(driver.date) && driver.date.length > 0
                    ? driver.date.find((d) => d.isDefault === true)?.dateID
                    : null,
                enteredText: driver.enteredText || null,
                enteredDate: driver.enteredDate || null,
                enteredDateFormat: driver.enteredDateFormat || null,
              }));

          return {
            driverValue: null,
            msMapID: service.msMapID || null,
            serviceID: service.serviceID,
            serviceCatID: category.serviceCatID,
            serviceChargeTypeID:
              service.serviceChargeTypeName === "One Off" ? 2 : 1,
            servicePackageID: null,
            finalCalculatedServicePrice:
              service?.price || service.quotationPrice,
            moduleServicesGPDList:
              moduleServicesGPDList.length === 0
                ? null
                : moduleServicesGPDList === false
                  ? null
                  : moduleServicesGPDList,
          };
        }),
      ),
    };

    const contractAdditionalServicesInPackages = {
      selectedServicesList: SelectedService.flatMap((category) =>
        category.servicesList
          .filter(
            (service) => service.isAdditionalService && service.isSelected,
          ) // Filter additional services
          .map((service) => {
            return {
              serviceID: service.serviceID,
              serviceCatID: category.serviceCatID,
              serviceChargeTypeID:
                service.serviceChargeTypeName === "One Off" ? 2 : 1,
              servicePackageIDs: service.servicePackageIDs,
            };
          }),
      ),
    };

    const contractFinalAmountList = [];
    let totalOne = 0;
    let totalTwo = 0;
    let totalThree = 0;
    let totalOneOffOne = 0;
    let totalOneOffTwo = 0;
    let totalOneOffThree = 0;

    if (
      selectedPackagesList?.length !== 0 &&
      selectedPackagesList?.length !== undefined &&
      selectedPackagesList !== null &&
      (engagementObj.selectSourceId === 3 || engagementObj.selectSourceId === 4)
    ) {
      selectedOneOffServiceList.forEach((category) => {
        category.servicesList.forEach((service) => {
          if (
            service.packageOneValue !== null &&
            service.servicePackageIDs.includes(service.packageOneID)
          )
            totalOneOffOne += Number(service.packageOneValue);
          if (
            service.packageTwoValue !== null &&
            service.servicePackageIDs.includes(service.packageTwoID)
          )
            totalOneOffTwo += Number(service.packageTwoValue);
          if (
            service.packageThreeValue !== null &&
            service.servicePackageIDs.includes(service.packageThreeID)
          )
            totalOneOffThree += Number(service.packageThreeValue);
        });
      });
      selectedRecurringServiceList.forEach((category) => {
        category.servicesList.forEach((service) => {
          if (
            service.packageOneValue !== null &&
            service.servicePackageIDs.includes(service.packageOneID)
          )
            totalOne += Number(service.packageOneValue);
          if (
            service.packageTwoValue !== null &&
            service.servicePackageIDs.includes(service.packageTwoID)
          )
            totalTwo += Number(service.packageTwoValue);
          if (
            service.packageThreeValue !== null &&
            service.servicePackageIDs.includes(service.packageThreeID)
          )
            totalThree += Number(service.packageThreeValue);
        });
      });

      for (let i = 0; i < selectedPackagesList?.length; i++) {
        if (selectedRecurringServiceList.length !== 0) {
          contractFinalAmountList.push({
            moduleKeyID: "Temp Key Id", // proposalModelObj.quoteKeyID || null,
            serviceChargeTypeID: 1, // Recurring
            servicePackageID: selectedPackagesList[i].servicePackageID,
            // servicePackageObj: selectedPackagesDetails[i],
            discountPercentageWithAllDecimal:
              i == 0
                ? RecurringFrequencyPricingInfo.DiscountPercentagePackageOne?.toString()
                : i == 1
                  ? RecurringFrequencyPricingInfo.DiscountPercentagePackageTwo?.toString()
                  : i == 2
                    ? RecurringFrequencyPricingInfo.DiscountPercentagePackageThree?.toString()
                    : 0,

            netTotal:
              i == 0 ? totalOne : i == 1 ? totalTwo : i == 2 ? totalThree : 0,
            discounted:
              i == 0
                ? RecurringPricingInfo.packageOneDisCount
                : i == 1
                  ? RecurringPricingInfo.packageTwoDisCount
                  : i == 2
                    ? RecurringPricingInfo.packageThreeDisCount
                    : RecurringPricingInfo.packageOneDisCount == 0 &&
                        RecurringPricingInfo.packageTwoDisCount == 0 &&
                        RecurringPricingInfo.packageThreeDisCount == 0
                      ? 0
                      : 0,
            discountedTotal:
              i == 0
                ? RecurringPricingInfo.packageOneDisCountedTotal
                : i == 1
                  ? RecurringPricingInfo.packageTwoDisCountedTotal
                  : i == 2
                    ? RecurringPricingInfo.packageThreeDisCountedTotal
                    : RecurringPricingInfo.packageOneDisCount == 0 &&
                        RecurringPricingInfo.packageTwoDisCount == 0 &&
                        RecurringPricingInfo.packageThreeDisCount == 0
                      ? 0
                      : 0,
            vatPercentage: vatPercentage ? vatPercentage : null,
            vat:
              i == 0
                ? RecurringPricingInfo.PackageOneVaTPrice
                : i == 1
                  ? RecurringPricingInfo.PackageTwoVaTPrice
                  : i == 2
                    ? RecurringPricingInfo.PackageThreeVaTPrice
                    : vatPercentage === null || vatPercentage == ""
                      ? 0
                      : 0,
            grandTotal:
              i == 0
                ? RecurringPricingInfo.PackageOneGrandTotal
                : i == 1
                  ? RecurringPricingInfo.PackageTwoGrandTotal
                  : i == 2
                    ? RecurringPricingInfo.PackageThreeGrandTotal
                    : vatPercentage === null || vatPercentage == ""
                      ? 0
                      : 0,
          });
        }
        if (selectedOneOffServiceList.length !== 0) {
          contractFinalAmountList.push({
            moduleKeyID: "Temp Key Id", // proposalModelObj.quoteKeyID || null,
            serviceChargeTypeID: 2, // OneOff
            servicePackageID: selectedPackagesList[i].servicePackageID,
            discountPercentageWithAllDecimal:
              i == 0
                ? OneOffPricingInfoCopy.DiscountPercentagePackageOne?.toString()
                : i == 1
                  ? OneOffPricingInfoCopy.DiscountPercentagePackageTwo?.toString()
                  : i == 2
                    ? OneOffPricingInfoCopy.DiscountPercentagePackageThree?.toString()
                    : 0,
            netTotal:
              i == 0
                ? totalOneOffOne
                : i == 1
                  ? totalOneOffTwo
                  : i == 2
                    ? totalOneOffThree
                    : 0,
            discounted:
              i == 0
                ? OneOffPricingInfo.packageOneDisCount
                : i == 1
                  ? OneOffPricingInfo.packageTwoDisCount
                  : i == 2
                    ? OneOffPricingInfo.packageThreeDisCount
                    : OneOffPricingInfo.packageOneDisCount == 0 &&
                        OneOffPricingInfo.packageTwoDisCount == 0 &&
                        OneOffPricingInfo.packageThreeDisCount == 0
                      ? 0
                      : 0,
            discountedTotal:
              i == 0
                ? OneOffPricingInfo.packageOneDisCountedTotal
                : i == 1
                  ? OneOffPricingInfo.packageTwoDisCountedTotal
                  : i == 2
                    ? OneOffPricingInfo.packageThreeDisCountedTotal
                    : OneOffPricingInfo.packageOneDisCount == 0 &&
                        OneOffPricingInfo.packageTwoDisCount == 0 &&
                        OneOffPricingInfo.packageThreeDisCount == 0
                      ? 0
                      : 0,
            vatPercentage: vatPercentage ? vatPercentage : null,
            vat:
              i == 0
                ? OneOffPricingInfo.PackageOneVaTPrice
                : i == 1
                  ? OneOffPricingInfo.PackageTwoVaTPrice
                  : i == 2
                    ? OneOffPricingInfo.PackageThreeVaTPrice
                    : vatPercentage === null || vatPercentage == ""
                      ? 0
                      : 0,
            grandTotal:
              i == 0
                ? OneOffPricingInfo.PackageOneGrandTotal
                : i == 1
                  ? OneOffPricingInfo.PackageTwoGrandTotal
                  : i == 2
                    ? OneOffPricingInfo.PackageThreeGrandTotal
                    : vatPercentage === null || vatPercentage == ""
                      ? 0
                      : 0,
          });
        }
      }
    } else {
      if (selectedRecurringServiceList.length !== 0) {
        contractFinalAmountList.push({
          moduleKeyID: "Temp Key Id", // proposalModelObj.quoteKeyID || null,
          serviceChargeTypeID: 1, // Recurring
          discountPercentageWithAllDecimal:
            RecurringFrequencyPricingInfo.DefaultDiscount?.toString(),
          servicePackageID: engagementObj.acceptedServicePackageID,
          // netTotal:
          //   Number(RecurringPricingInfo.DefaultDiscount) <
          //     Number(RecurringPricingInfo.OriginalPrice)
          //     ? RecurringPricingInfo.OriginalPrice
          //     : RecurringPricingInfo.DiscountedPrice,
          netTotal:
            Number(RecurringPricingInfo?.DefaultDiscount ?? 0) <
            Number(RecurringPricingInfo?.OriginalPrice ?? 0)
              ? Number(RecurringPricingInfo?.OriginalPrice ?? 0)
              : Number(RecurringPricingInfo?.DiscountedPrice ?? 0),
          discounted: RecurringPricingInfo.Discount,
          discountedTotal: RecurringPricingInfo.DiscountedTotal,
          vatPercentage:
            vatPercentage === "" || vatPercentage === undefined
              ? null
              : vatPercentage,
          vat:
            vatPercentage === null
              ? null
              : RecurringPricingInfo.VATPrice === "" ||
                  RecurringPricingInfo.VATPrice === undefined
                ? null
                : RecurringPricingInfo.VATPrice,
          grandTotal:
            vatPercentage === null ? null : RecurringPricingInfo.GrandTotal,
        });
      }
      if (selectedOneOffServiceList.length !== 0) {
        contractFinalAmountList.push({
          moduleKeyID: "Temp Key Id", // proposalModelObj.quoteKeyID || null,
          serviceChargeTypeID: 2, // OneOff
          discountPercentageWithAllDecimal:
            OneOffPricingInfo.DefaultDiscount?.toString(),
          servicePackageID: engagementObj.acceptedServicePackageID,
          // netTotal:
          //   Number(OneOffPricingInfo.DefaultDiscount) <
          //     Number(OneOffPricingInfo.OriginalPrice)
          //     ? OneOffPricingInfo.OriginalPrice
          //     : OneOffPricingInfo.DiscountedPrice,
          netTotal:
            Number(OneOffPricingInfo?.DefaultDiscount ?? 0) <
            Number(OneOffPricingInfo?.OriginalPrice ?? 0)
              ? Number(OneOffPricingInfo?.OriginalPrice ?? 0)
              : Number(OneOffPricingInfo?.DiscountedPrice ?? 0),
          discounted: OneOffPricingInfo.Discount,
          discountedTotal: OneOffPricingInfo.DiscountedTotal,
          vatPercentage:
            vatPercentage === "" || vatPercentage === undefined
              ? null
              : vatPercentage,
          vat:
            vatPercentage === null
              ? null
              : OneOffPricingInfo.VATPrice === null ||
                  OneOffPricingInfo.VATPrice === "" ||
                  OneOffPricingInfo.VATPrice === undefined
                ? null
                : OneOffPricingInfo.VATPrice,
          grandTotal:
            vatPercentage === null ? null : OneOffPricingInfo.GrandTotal,
        });
      }
    }

    const updatedTemplateList = await updateTemplateList(
      engagementObj.customizedEmailContent,
      "CustomizeTemplate",
    );
    const isGlobalCustomTemplate =
      selectedTemplateID === 0 || selectedTemplateIDOneOff === 0;
    // const updatedTemplateList = await updateTemplateList(
    //   engagementObj.customizedEmailContent,
    //   "CustomizeTemplate"
    // );
    debugger;
    let Api_ObjectParam = {
      organisationKeyID: common.organisationKeyID,
      userKeyID: common.userKeyID,
      // servicePackageKeyID: engagementObj.servicePackageKeyID,
      acceptedServiceChargeTypeID: null,
      showDiscountLine: engagementObj.DiscountLines,
      acceptedServicePackageID: engagementObj.acceptedServicePackageID,
      contractKeyID: engagementObj.contractKeyID,
      documentCode: DocumentCode || null,
      pricingTableColumnIDs: isGlobalCustomTemplate
        ? null
        : getVisibleFieldIds(),
      sourceID: engagementObj.selectSourceId, //1	From Scratch, 2	From Quote
      clientID: engagementObj.ClientID,
      TabName: moduleName,
      contractSignatoryID: engagementObj.ContractSignatoryID,
      quoteID: engagementObj.quoteID,
      contractPDFUrl: MergePdfUrl,
      templateID: engagementObj.templateID,
      customizedEmailContent: engagementObj.customizedEmailContent,
      pricingVariablesList: Object.entries(pricingVariablesForEmail).map(
        ([variableName, variableValue]) => ({
          variableName: `$${variableName}$`,
          variableValue: variableValue == null ? "0.00" : String(variableValue),
        }),
      ),
      templatePDFKeyIDs: engagementObj.selectedAttachments,
      tnCTemplateID:
        engagementObj.tnCTemplateID == "" ? null : engagementObj.tnCTemplateID,
      tnCTemplateContent:
        engagementObj.tnCTemplateContent == ""
          ? null
          : engagementObj.tnCTemplateContent,
      feesInQuoteID: engagementObj.feeTypeId, //1	Show Full Breakdown ,2	Show Totals Only
      paymentGatewayID: engagementObj.paymentGatewayID, //1	Manual
      paymentFrequencyID: engagementObj.Payment_Frequency,
      recurringOriginalPrice:
        RecurringPricingInfo.OriginalPrice === "" ||
        RecurringPricingInfo.OriginalPrice === undefined
          ? null
          : RecurringPricingInfo.OriginalPrice,
      recurringDiscountedPrice:
        RecurringPricingInfo.DiscountedPrice === "" ||
        RecurringPricingInfo.DiscountedPrice === undefined
          ? null
          : RecurringPricingInfo.DiscountedPrice,
      recurringDiscountPercentage:
        RecurringFrequencyPricingInfo.DefaultDiscount === "" ||
        RecurringFrequencyPricingInfo.DefaultDiscount === undefined
          ? null
          : RecurringFrequencyPricingInfo.DefaultDiscount,

      oneOffOriginalPrice:
        OneOffPricingInfo.OriginalPrice === "" ||
        OneOffPricingInfo.OriginalPrice === undefined
          ? null
          : OneOffPricingInfo.OriginalPrice,
      oneOffDiscountedPrice:
        OneOffPricingInfo.DiscountedPrice === "" ||
        OneOffPricingInfo.DiscountedPrice === undefined
          ? null
          : OneOffPricingInfo.DiscountedPrice,
      oneOffDiscountPercentage:
        OneOffPricingInfoCopy.DefaultDiscount === "" ||
        OneOffPricingInfoCopy.DefaultDiscount === undefined
          ? null
          : OneOffPricingInfoCopy.DefaultDiscount,
      statusID: statusId,
      contractAdditionalServicesInPackages:
        contractAdditionalServicesInPackages.selectedServicesList,
      servicePackageID:
        engagementObj.acceptedServicePackageID !== null
          ? [engagementObj.acceptedServicePackageID]
          : null,
      selectedServicesList: modifiedArray.selectedServicesList || null,
      additionalInformationList: modifiedAdditionalServiceArray || null,
      contractSignatorieList: contractSignatoriesList,
      contractFinalAmountList: contractFinalAmountList,
    };
    if (statusId == 1) {
      setModelAction("Draft");
    }

    const response = await AddUpdateEngagement(Api_ObjectParam);
    try {
      if (response) {
        setLoader(false);
        if (response?.data?.statusCode === 200) {
          setLoader(false);
          if (
            response?.data?.responseData &&
            response?.data?.responseData?.refID
          ) {
            const refID = response?.data?.responseData?.refID;
            setRefIdStore(refID);
          }
          if (statusId !== 1) {
            setModelAction("Send");
            GetSendToSignEasyData({
              moduleName: "Contract",
              contractKeyID: response.data.responseData.data,
              contractPDFUrl: MergePdfUrl,
              customizedEmailContent: engagementObj.customizedEmailContent,
              pricingVariablesList: Object.entries(
                pricingVariablesForEmail,
              ).map(([variableName, variableValue]) => ({
                variableName: `$${variableName}$`,
                variableValue:
                  variableValue == null ? "0.00" : String(variableValue),
              })),
            });
          } else {
            setOpenSuccessModal(true);
          }
        } else {
          setLoader(false);
          let Errormessage = response?.response?.data?.errorMessage;
          if (response?.response?.data?.statusCode === 500) {
            Errormessage = response?.response?.data?.errorMessage;
          }
          if (Errormessage.includes("Arithmetic overflow")) {
            setErrorMessage(
              "The result of this operation is too large to be processed. Please check the input values and try again.",
            );
            setOpenErrorModal(true);
          } else {
            setErrorMessage(response?.response?.data?.errorMessage);
          }
          // setErrorMessage(response?.response?.data?.errorMessage);
        }
      } else {
        setLoader(false);
        setErrorMessage(response?.response?.data?.errorMessage);
      }
    } catch (error) {
      setLoader(false);
      console.log(error);
    }
  };

  //16) cancel function
  const handleCancel = () => {
    navigate("/engagement-letters");
  };

  //17) Back  function
  const HandleBack = (NextTab) => {
    if (activeTab === EngagementLetterHeader.ReviewServices) {
      if (
        (selectedRecurringServiceList.length !== 0 &&
          (RecurringPricingInfo.DiscountedPrice === "" ||
            RecurringPricingInfo.DiscountedPrice === null ||
            RecurringPricingInfo.DiscountedPrice === undefined ||
            (engagementObj.Payment_Frequency == 4 &&
              pricingSettingObj.minMonthlyPriceForQC !== "" &&
              pricingSettingObj.minMonthlyPriceForQC !== null &&
              pricingSettingObj.minMonthlyPriceForQC !== undefined &&
              Number(RecurringPricingInfo.DiscountedPrice) <
                Number(pricingSettingObj.minMonthlyPriceForQC)) ||
            (engagementObj.Payment_Frequency === 3 &&
              pricingSettingObj.minQuarterlyPriceForQC !== "" &&
              pricingSettingObj.minQuarterlyPriceForQC !== null &&
              pricingSettingObj.minQuarterlyPriceForQC !== undefined &&
              Number(RecurringPricingInfo.DiscountedPrice) <
                Number(pricingSettingObj.minQuarterlyPriceForQC)) ||
            (engagementObj.Payment_Frequency === 2 &&
              pricingSettingObj.minHalfYearlyPriceForQC !== "" &&
              pricingSettingObj.minHalfYearlyPriceForQC !== null &&
              pricingSettingObj.minHalfYearlyPriceForQC !== undefined &&
              Number(RecurringPricingInfo.DiscountedPrice) <
                Number(pricingSettingObj.minHalfYearlyPriceForQC)) ||
            (engagementObj.Payment_Frequency === 1 &&
              pricingSettingObj.minYearlyPriceForQC !== "" &&
              pricingSettingObj.minYearlyPriceForQC !== null &&
              pricingSettingObj.minYearlyPriceForQC !== undefined &&
              Number(RecurringPricingInfo.DiscountedPrice) <
                Number(pricingSettingObj.minYearlyPriceForQC)) ||
            ((pricingSettingObj.minMonthlyPriceForQC == "" ||
              pricingSettingObj.minMonthlyPriceForQC == null ||
              pricingSettingObj.minMonthlyPriceForQC == undefined) &&
              RecurringPricingInfo.DiscountedPrice !== "" &&
              RecurringPricingInfo.DiscountedPrice !== null &&
              RecurringPricingInfo.DiscountedPrice !== undefined &&
              Number(RecurringPricingInfo.DiscountedPrice) <= 0) ||
            (pricingSettingObj.maxDiscountForQC !== "" &&
              pricingSettingObj.maxDiscountForQC !== null &&
              pricingSettingObj.maxDiscountForQC !== undefined &&
              (Number(RecurringPricingInfo.DefaultDiscount) < -999.0 ||
                Number(RecurringPricingInfo.DefaultDiscount) >
                  Number(pricingSettingObj.maxDiscountForQC))) ||
            ((pricingSettingObj.maxDiscountForQC == "" ||
              pricingSettingObj.maxDiscountForQC == null ||
              pricingSettingObj.maxDiscountForQC == undefined) &&
              (Number(RecurringPricingInfo.DefaultDiscount) < -999.0 ||
                Number(RecurringPricingInfo.DefaultDiscount) > 100)) ||
            (RecurringPricingInfo.DiscountedPrice !== "" &&
              RecurringPricingInfo.DiscountedPrice !== "-" &&
              isNaN(RecurringPricingInfo.DiscountedPrice)) ||
            (RecurringPricingInfo.DefaultDiscount !== "" &&
              RecurringPricingInfo.DefaultDiscount !== "-" &&
              isNaN(RecurringPricingInfo.DefaultDiscount)))) ||
        (selectedOneOffServiceList.length !== 0 &&
          (OneOffPricingInfo.DiscountedPrice === "" ||
            OneOffPricingInfo.DiscountedPrice === null ||
            OneOffPricingInfo.DiscountedPrice === undefined ||
            (pricingSettingObj.maxDiscountForQC !== "" &&
              pricingSettingObj.maxDiscountForQC !== null &&
              pricingSettingObj.maxDiscountForQC !== undefined &&
              (Number(OneOffPricingInfo.DefaultDiscount) < -999.0 ||
                Number(OneOffPricingInfo.DefaultDiscount) >
                  Number(pricingSettingObj.maxDiscountForQC))) ||
            (pricingSettingObj.minOneOffPriceForQC !== "" &&
              pricingSettingObj.minOneOffPriceForQC !== null &&
              pricingSettingObj.minOneOffPriceForQC !== undefined &&
              Number(OneOffPricingInfo.DiscountedPrice) <
                Number(pricingSettingObj.minOneOffPriceForQC)) ||
            ((pricingSettingObj.minOneOffPriceForQC == "" ||
              pricingSettingObj.minOneOffPriceForQC == null ||
              pricingSettingObj.minOneOffPriceForQC == 0 ||
              pricingSettingObj.minOneOffPriceForQC == undefined) &&
              OneOffPricingInfo.DiscountedPrice !== "" &&
              OneOffPricingInfo.DiscountedPrice !== null &&
              OneOffPricingInfo.DiscountedPrice !== undefined &&
              Number(OneOffPricingInfo.DiscountedPrice) <= 0) ||
            ((pricingSettingObj.maxDiscountForQC == "" ||
              pricingSettingObj.maxDiscountForQC == null ||
              pricingSettingObj.maxDiscountForQC == undefined) &&
              (Number(OneOffPricingInfo.DefaultDiscount) < -999.0 ||
                Number(OneOffPricingInfo.DefaultDiscount) > 100)) ||
            (OneOffPricingInfo.DiscountedPrice !== "" &&
              OneOffPricingInfo.DiscountedPrice !== "-" &&
              isNaN(OneOffPricingInfo.DiscountedPrice)) ||
            (OneOffPricingInfo.DefaultDiscount !== "" &&
              OneOffPricingInfo.DefaultDiscount !== "-" &&
              isNaN(OneOffPricingInfo.DefaultDiscount))))
      ) {
        setRequireMessage(true);
        setIsValidForm({
          ...isValidForm,
          Preview: false,
        });
        if (
          selectedRecurringServiceList.length !== 0 &&
          (RecurringPricingInfo.DiscountedPrice === "" ||
            RecurringPricingInfo.DiscountedPrice === null ||
            RecurringPricingInfo.DiscountedPrice === undefined ||
            (engagementObj.Payment_Frequency == 4 &&
              pricingSettingObj.minMonthlyPriceForQC !== "" &&
              pricingSettingObj.minMonthlyPriceForQC !== null &&
              pricingSettingObj.minMonthlyPriceForQC !== undefined &&
              Number(RecurringPricingInfo.DiscountedPrice) <=
                Number(pricingSettingObj.minMonthlyPriceForQC)) ||
            ((pricingSettingObj.minMonthlyPriceForQC == "" ||
              pricingSettingObj.minMonthlyPriceForQC == null ||
              pricingSettingObj.minMonthlyPriceForQC == undefined) &&
              RecurringPricingInfo.DiscountedPrice !== "" &&
              RecurringPricingInfo.DiscountedPrice !== null &&
              RecurringPricingInfo.DiscountedPrice !== undefined &&
              Number(RecurringPricingInfo.DiscountedPrice) <= 0) ||
            (pricingSettingObj.maxDiscountForQC !== "" &&
              pricingSettingObj.maxDiscountForQC !== null &&
              pricingSettingObj.maxDiscountForQC !== undefined &&
              (Number(RecurringPricingInfo.DefaultDiscount) < -999.0 ||
                Number(RecurringPricingInfo.DefaultDiscount) >
                  Number(pricingSettingObj.maxDiscountForQC))) ||
            ((pricingSettingObj.maxDiscountForQC == "" ||
              pricingSettingObj.maxDiscountForQC == null ||
              pricingSettingObj.maxDiscountForQC == undefined) &&
              (Number(RecurringPricingInfo.DefaultDiscount) < -999.0 ||
                Number(RecurringPricingInfo.DefaultDiscount) > 100)) ||
            (RecurringPricingInfo.DiscountedPrice !== "" &&
              RecurringPricingInfo.DiscountedPrice !== "-" &&
              isNaN(RecurringPricingInfo.DiscountedPrice)) ||
            (RecurringPricingInfo.DefaultDiscount !== "" &&
              RecurringPricingInfo.DefaultDiscount !== "-" &&
              isNaN(RecurringPricingInfo.DefaultDiscount)))
        ) {
          scrollUpDownByElementID("recurring_Default");
        } else if (
          selectedOneOffServiceList.length !== 0 &&
          (OneOffPricingInfo.DiscountedPrice === "" ||
            OneOffPricingInfo.DiscountedPrice === null ||
            OneOffPricingInfo.DiscountedPrice === undefined ||
            (pricingSettingObj.minOneOffPriceForQC !== "" &&
              pricingSettingObj.minOneOffPriceForQC !== null &&
              pricingSettingObj.minOneOffPriceForQC !== undefined &&
              Number(OneOffPricingInfo.DiscountedPrice) <
                Number(pricingSettingObj.minOneOffPriceForQC)) ||
            (pricingSettingObj.maxDiscountForQC !== "" &&
              pricingSettingObj.maxDiscountForQC !== null &&
              pricingSettingObj.maxDiscountForQC !== undefined &&
              Number(OneOffPricingInfo.DefaultDiscount) >=
                Number(pricingSettingObj.maxDiscountForQC)) ||
            ((pricingSettingObj.minOneOffPriceForQC == "" ||
              pricingSettingObj.minOneOffPriceForQC == null ||
              pricingSettingObj.minOneOffPriceForQC == 0 ||
              pricingSettingObj.minOneOffPriceForQC == undefined) &&
              OneOffPricingInfo.DiscountedPrice !== "" &&
              OneOffPricingInfo.DiscountedPrice !== null &&
              OneOffPricingInfo.DiscountedPrice !== undefined &&
              Number(OneOffPricingInfo.DiscountedPrice) <= 0) ||
            (pricingSettingObj.maxDiscountForQC !== "" &&
              pricingSettingObj.maxDiscountForQC !== null &&
              pricingSettingObj.maxDiscountForQC !== undefined &&
              (Number(OneOffPricingInfo.DefaultDiscount) < -999.0 ||
                Number(OneOffPricingInfo.DefaultDiscount) >
                  Number(pricingSettingObj.maxDiscountForQC))) ||
            ((pricingSettingObj.maxDiscountForQC == "" ||
              pricingSettingObj.maxDiscountForQC == null ||
              pricingSettingObj.maxDiscountForQC == undefined) &&
              (Number(OneOffPricingInfo.DefaultDiscount) < -999.0 ||
                Number(OneOffPricingInfo.DefaultDiscount) > 100)) ||
            (OneOffPricingInfo.DiscountedPrice !== "" &&
              OneOffPricingInfo.DiscountedPrice !== "-" &&
              isNaN(OneOffPricingInfo.DiscountedPrice)) ||
            (OneOffPricingInfo.DefaultDiscount !== "" &&
              OneOffPricingInfo.DefaultDiscount !== "-" &&
              isNaN(OneOffPricingInfo.DefaultDiscount)))
        ) {
          scrollUpDownByElementID("OneOff_Default");
        }

        return false;
      }
    }
    if (
      NextTab === 2 &&
      (engagementObj.selectSourceId === 4 || engagementObj.selectSourceId === 2)
    ) {
      setRequireMessage(false);
      setActiveTab(1);
    } else {
      setRequireMessage(false);
      setActiveTab(NextTab);
    }
  };

  //19) Add signatory block in Additional information function  data function
  const AddSignatory = () => {
    // Create a copy of the current state array
    const updatedList = [...contractSignatoriesList];
    // Push the new signatory object into the copied array
    updatedList.push({
      contractSignatoryID: null,
      firstName: null,
      lastName: null,
      emailID: null,
      signaturePositionID: 1,
    });

    // Update the state with the new array
    setContractSignatoriesList(updatedList);

    setTimeout(function () {
      scrollUpDownByElementID(
        `contract-signatory-${contractSignatoriesList.length}`,
      );
    }, 200);
  };

  //20) Delete signatory block in Additional information function  data function
  const deleteSignatory = (index) => {
    const contractSignatoriesListCopy = [...contractSignatoriesList];

    if (index >= 0 && index < contractSignatoriesListCopy.length) {
      contractSignatoriesListCopy.splice(index, 1);
      setContractSignatoriesList(contractSignatoriesListCopy);
    }
  };

  //21) Select Client From lookup list
  const handleChangeClient = (e) => {
    DisableTabOnChange();
    GetTemplateLookupListData(e, null);
    if (
      engagementObj.selectSourceId === 3 ||
      engagementObj.selectSourceId === 4
    ) {
      GetServicePackageLookupListData(null, e.value);
    }
    GetOfficersForQuoteAndContractData({
      ClientKeyID: e.clientKeyID,
      QuoteKeyID: null,
    });
  };
  //22) Display value of selected signature position in additional information
  const SignaturePositionValue = contractSignatoriesList
    .filter((signatory) => {
      return Utils.SignaturePosition.find(
        (position) =>
          signatory?.signaturePositionID != null &&
          signatory?.signaturePositionID == position.value,
      );
    })
    .map((signatory) => {
      const position = Utils.SignaturePosition.find(
        (position) => signatory.signaturePositionID == position.value,
      );
      return { value: position.value, label: position.label };
    });

  //23) close function after success model
  const handleClose = () => {
    const closeModal = modelRequestData.message.includes(
      "The result of this operation",
    );
    if (closeModal) {
      setOpenErrorModal(false);
      $("#" + "RecordsAvailablePopupModel").modal("hide");
      setModelRequestData({
        ...modelRequestData,
        Action: null,
        DriverName: [],
        message: "",
      });
      return false;
    }
    setOpenErrorModal(false);
    setOpenSuccessModal(false);
    navigate("/engagement-letters");
  };
  const handleCloseErrorModel = () => {
    setOpenErrorModal(false);
  };

  //24) select TnC template in additional information
  const handleSelectTncTemplate = (e) => {
    DisableTabOnChange();
    GetTermsAndConditionsModelData(e);
  };

  //25) add content in TnC has Html content type in additional information
  const handleContentChange = async (newContent) => {
    const trimmedContent = HtmlToPlainText(newContent, "Contract");
    const hasTextAtZeroPosition = trimmedContent.trim().length > 0;
    if (!hasTextAtZeroPosition) {
      setEngagementObj({
        ...engagementObj,
        tnCTemplateContent: null,
      });
      return;
    } else {
      setEngagementObj({
        ...engagementObj,
        tnCTemplateContent: newContent,
      });
    }
  };

  //26)display selected TnC template value
  const SelectTnCTemplateValue = TnCLookupList.find((item) => {
    return item.templateID === engagementObj.tnCTemplateID;
  });

  //27)go to selected tab function
  const handleClickOnTabChange = (TabNumber, clickedTabID) => {
    if (activeTab === EngagementLetterHeader.ReviewServices) {
      if (
        (selectedRecurringServiceList.length !== 0 &&
          (RecurringPricingInfo.DiscountedPrice === "" ||
            RecurringPricingInfo.DiscountedPrice === null ||
            RecurringPricingInfo.DiscountedPrice === undefined ||
            (engagementObj.Payment_Frequency == 4 &&
              pricingSettingObj.minMonthlyPriceForQC !== "" &&
              pricingSettingObj.minMonthlyPriceForQC !== null &&
              pricingSettingObj.minMonthlyPriceForQC !== undefined &&
              Number(RecurringPricingInfo.DiscountedPrice) <
                Number(pricingSettingObj.minMonthlyPriceForQC)) ||
            (engagementObj.Payment_Frequency === 3 &&
              pricingSettingObj.minMonthlyPriceForQC !== "" &&
              pricingSettingObj.minMonthlyPriceForQC !== null &&
              pricingSettingObj.minMonthlyPriceForQC !== undefined &&
              Number(RecurringPricingInfo.DiscountedPrice) <
                Number(pricingSettingObj.minMonthlyPriceForQC * 3)) ||
            (engagementObj.Payment_Frequency === 2 &&
              pricingSettingObj.minMonthlyPriceForQC !== "" &&
              pricingSettingObj.minMonthlyPriceForQC !== null &&
              pricingSettingObj.minMonthlyPriceForQC !== undefined &&
              Number(RecurringPricingInfo.DiscountedPrice) <
                Number(pricingSettingObj.minMonthlyPriceForQC * 6)) ||
            (engagementObj.Payment_Frequency === 1 &&
              pricingSettingObj.minMonthlyPriceForQC !== "" &&
              pricingSettingObj.minMonthlyPriceForQC !== null &&
              pricingSettingObj.minMonthlyPriceForQC !== undefined &&
              Number(RecurringPricingInfo.DiscountedPrice) <
                Number(pricingSettingObj.minMonthlyPriceForQC * 12)) ||
            ((pricingSettingObj.minMonthlyPriceForQC == "" ||
              pricingSettingObj.minMonthlyPriceForQC == null ||
              pricingSettingObj.minMonthlyPriceForQC == undefined) &&
              RecurringPricingInfo.DiscountedPrice !== "" &&
              RecurringPricingInfo.DiscountedPrice !== null &&
              RecurringPricingInfo.DiscountedPrice !== undefined &&
              Number(RecurringPricingInfo.DiscountedPrice) <= 0) ||
            (pricingSettingObj.maxDiscountForQC !== "" &&
              pricingSettingObj.maxDiscountForQC !== null &&
              pricingSettingObj.maxDiscountForQC !== undefined &&
              (Number(RecurringPricingInfo.DefaultDiscount) < -999.0 ||
                Number(RecurringPricingInfo.DefaultDiscount) >
                  Number(pricingSettingObj.maxDiscountForQC))) ||
            ((pricingSettingObj.maxDiscountForQC == "" ||
              pricingSettingObj.maxDiscountForQC == null ||
              pricingSettingObj.maxDiscountForQC == undefined) &&
              (Number(RecurringPricingInfo.DefaultDiscount) < -999.0 ||
                Number(RecurringPricingInfo.DefaultDiscount) > 100)) ||
            (RecurringPricingInfo.DiscountedPrice !== "" &&
              RecurringPricingInfo.DiscountedPrice !== "-" &&
              isNaN(RecurringPricingInfo.DiscountedPrice)) ||
            (RecurringPricingInfo.DefaultDiscount !== "" &&
              RecurringPricingInfo.DefaultDiscount !== "-" &&
              isNaN(RecurringPricingInfo.DefaultDiscount)))) ||
        (selectedOneOffServiceList.length !== 0 &&
          (OneOffPricingInfo.DiscountedPrice === "" ||
            OneOffPricingInfo.DiscountedPrice === null ||
            OneOffPricingInfo.DiscountedPrice === undefined ||
            (pricingSettingObj.maxDiscountForQC !== "" &&
              pricingSettingObj.maxDiscountForQC !== null &&
              pricingSettingObj.maxDiscountForQC !== undefined &&
              (Number(OneOffPricingInfo.DefaultDiscount) < -999.0 ||
                Number(OneOffPricingInfo.DefaultDiscount) >
                  Number(pricingSettingObj.maxDiscountForQC))) ||
            (pricingSettingObj.minOneOffPriceForQC !== "" &&
              pricingSettingObj.minOneOffPriceForQC !== null &&
              pricingSettingObj.minOneOffPriceForQC !== undefined &&
              Number(OneOffPricingInfo.DiscountedPrice) <
                Number(pricingSettingObj.minOneOffPriceForQC)) ||
            ((pricingSettingObj.minOneOffPriceForQC == "" ||
              pricingSettingObj.minOneOffPriceForQC == null ||
              pricingSettingObj.minOneOffPriceForQC == 0 ||
              pricingSettingObj.minOneOffPriceForQC == undefined) &&
              OneOffPricingInfo.DiscountedPrice !== "" &&
              OneOffPricingInfo.DiscountedPrice !== null &&
              OneOffPricingInfo.DiscountedPrice !== undefined &&
              Number(OneOffPricingInfo.DiscountedPrice) <= 0) ||
            ((pricingSettingObj.maxDiscountForQC == "" ||
              pricingSettingObj.maxDiscountForQC == null ||
              pricingSettingObj.maxDiscountForQC == undefined) &&
              (Number(OneOffPricingInfo.DefaultDiscount) < -999.0 ||
                Number(OneOffPricingInfo.DefaultDiscount) > 100)) ||
            (OneOffPricingInfo.DiscountedPrice !== "" &&
              OneOffPricingInfo.DiscountedPrice !== "-" &&
              isNaN(OneOffPricingInfo.DiscountedPrice)) ||
            (OneOffPricingInfo.DefaultDiscount !== "" &&
              OneOffPricingInfo.DefaultDiscount !== "-" &&
              isNaN(OneOffPricingInfo.DefaultDiscount))))
      ) {
        setRequireMessage(true);
        setIsValidForm({
          ...isValidForm,
          Preview: false,
        });
        if (
          selectedRecurringServiceList.length !== 0 &&
          (RecurringPricingInfo.DiscountedPrice === "" ||
            RecurringPricingInfo.DiscountedPrice === null ||
            RecurringPricingInfo.DiscountedPrice === undefined ||
            (engagementObj.Payment_Frequency == 4 &&
              pricingSettingObj.minMonthlyPriceForQC !== "" &&
              pricingSettingObj.minMonthlyPriceForQC !== null &&
              pricingSettingObj.minMonthlyPriceForQC !== undefined &&
              Number(RecurringPricingInfo.DiscountedPrice) <=
                Number(pricingSettingObj.minMonthlyPriceForQC)) ||
            ((pricingSettingObj.minMonthlyPriceForQC == "" ||
              pricingSettingObj.minMonthlyPriceForQC == null ||
              pricingSettingObj.minMonthlyPriceForQC == undefined) &&
              RecurringPricingInfo.DiscountedPrice !== "" &&
              RecurringPricingInfo.DiscountedPrice !== null &&
              RecurringPricingInfo.DiscountedPrice !== undefined &&
              Number(RecurringPricingInfo.DiscountedPrice) <= 0) ||
            (pricingSettingObj.maxDiscountForQC !== "" &&
              pricingSettingObj.maxDiscountForQC !== null &&
              pricingSettingObj.maxDiscountForQC !== undefined &&
              (Number(RecurringPricingInfo.DefaultDiscount) < -999.0 ||
                Number(RecurringPricingInfo.DefaultDiscount) >
                  Number(pricingSettingObj.maxDiscountForQC))) ||
            ((pricingSettingObj.maxDiscountForQC == "" ||
              pricingSettingObj.maxDiscountForQC == null ||
              pricingSettingObj.maxDiscountForQC == undefined) &&
              (Number(RecurringPricingInfo.DefaultDiscount) < -999.0 ||
                Number(RecurringPricingInfo.DefaultDiscount) > 100)) ||
            (RecurringPricingInfo.DiscountedPrice !== "" &&
              RecurringPricingInfo.DiscountedPrice !== "-" &&
              isNaN(RecurringPricingInfo.DiscountedPrice)) ||
            (RecurringPricingInfo.DefaultDiscount !== "" &&
              RecurringPricingInfo.DefaultDiscount !== "-" &&
              isNaN(RecurringPricingInfo.DefaultDiscount)))
        ) {
          scrollUpDownByElementID("recurring_Default");
        } else if (
          selectedOneOffServiceList.length !== 0 &&
          (OneOffPricingInfo.DiscountedPrice === "" ||
            OneOffPricingInfo.DiscountedPrice === null ||
            OneOffPricingInfo.DiscountedPrice === undefined ||
            (pricingSettingObj.minOneOffPriceForQC !== "" &&
              pricingSettingObj.minOneOffPriceForQC !== null &&
              pricingSettingObj.minOneOffPriceForQC !== undefined &&
              Number(OneOffPricingInfo.DiscountedPrice) <
                Number(pricingSettingObj.minOneOffPriceForQC)) ||
            (pricingSettingObj.maxDiscountForQC !== "" &&
              pricingSettingObj.maxDiscountForQC !== null &&
              pricingSettingObj.maxDiscountForQC !== undefined &&
              Number(OneOffPricingInfo.DefaultDiscount) >=
                Number(pricingSettingObj.maxDiscountForQC)) ||
            ((pricingSettingObj.minOneOffPriceForQC == "" ||
              pricingSettingObj.minOneOffPriceForQC == null ||
              pricingSettingObj.minOneOffPriceForQC == 0 ||
              pricingSettingObj.minOneOffPriceForQC == undefined) &&
              OneOffPricingInfo.DiscountedPrice !== "" &&
              OneOffPricingInfo.DiscountedPrice !== null &&
              OneOffPricingInfo.DiscountedPrice !== undefined &&
              Number(OneOffPricingInfo.DiscountedPrice) <= 0) ||
            (pricingSettingObj.maxDiscountForQC !== "" &&
              pricingSettingObj.maxDiscountForQC !== null &&
              pricingSettingObj.maxDiscountForQC !== undefined &&
              (Number(OneOffPricingInfo.DefaultDiscount) < -999.0 ||
                Number(OneOffPricingInfo.DefaultDiscount) >
                  Number(pricingSettingObj.maxDiscountForQC))) ||
            ((pricingSettingObj.maxDiscountForQC == "" ||
              pricingSettingObj.maxDiscountForQC == null ||
              pricingSettingObj.maxDiscountForQC == undefined) &&
              (Number(OneOffPricingInfo.DefaultDiscount) < -999.0 ||
                Number(OneOffPricingInfo.DefaultDiscount) > 100)) ||
            (OneOffPricingInfo.DiscountedPrice !== "" &&
              OneOffPricingInfo.DiscountedPrice !== "-" &&
              isNaN(OneOffPricingInfo.DiscountedPrice)) ||
            (OneOffPricingInfo.DefaultDiscount !== "" &&
              OneOffPricingInfo.DefaultDiscount !== "-" &&
              isNaN(OneOffPricingInfo.DefaultDiscount)))
        ) {
          scrollUpDownByElementID("OneOff_Default");
        }

        return false;
      }
    }
    let clickedTabClasses = $("#" + clickedTabID).attr("class");
    if (clickedTabClasses?.includes("disabled")) {
      return false;
    }
    if (TabNumber <= activeTab) {
      setActiveTab(TabNumber);
    } else {
      HandleTabChange(TabNumber);
    }
  };

  //28)proposal lookups api implementation
  const GetQuoteLookupListData = async (e) => {
    setLoader(true);
    try {
      const response = await GetQuoteLookupList(common.organisationKeyID);
      const data = response.data;

      if (data.statusCode === 200) {
        setLoader(false);
        const mappedOptions = data.responseData.data.map((item) => ({
          value: item.quoteKeyID,
          label: item.quoteName,
          quoteID: item.quoteID,
          clientID: item.clientID,
        }));
        setProposalLookUpOptions(mappedOptions);
      } else {
        setLoader(false);
        console.error("Error fetching data from the API");
      }
    } catch (error) {
      setLoader(false);
      console.error("Error fetching data from the API", error);
    }
  };

  const handleChangeProposal = (e) => {
    DisableTabOnChange();
    setIsTypeChange(false);
    setOneOffPricingInfo({
      OriginalPrice: 0,
      DefaultDiscount: 0.0,
      DiscountedPrice: "",
      MaxDiscount: 0,
      VATPrice: null,
      servicePackageName: null,
      MinPrice: "",
      NetTotal: 0,
      Services: null,
      ServicePrice: 0,
      Discount: 0,
      GrandTotal: null,
      DiscountedTotal: 0,
    });
    setRecurringPricingInfo({
      OriginalPrice: 0,
      DefaultDiscount: 0.0,
      DiscountedPrice: "",
      MaxDiscount: 0,
      VATPrice: null,
      servicePackageName: null,
      MinPrice: "",
      NetTotal: 0,
      Services: null,
      ServicePrice: 0,
      Discount: 0,
      GrandTotal: null,
      DiscountedTotal: 0,
    });
    setSelectedRecurringServiceListCopy([]);
    setSelectedRecurringServiceList([]);
    setSelectedOneOffServiceList([]);
    setIsBack(false);
    GetTemplateLookupListData(null, e);
    GetServicePackageLookupListData(e.value);
    GetOfficersForQuoteAndContractData({
      ClientKeyID: null,
      QuoteKeyID: e.value,
    });
  };
  //29)select quotation type value
  const SelectProposalTypeValue = proposalLookUpOptions.find((item) => {
    return item.value === engagementObj.QuoteKeyID;
  });

  //30)get package list api  call
  const GetServicePackageLookupListData = async (QuoteKeyID, ClientKeyID) => {
    setLoader(true);
    try {
      const response = await GetServicePackageLookupList({
        userKeyID: common.userKeyID,
        organisationKeyID: common.organisationKeyID,
        ClientKeyID: ClientKeyID,
        QuoteKeyID: QuoteKeyID,
      });
      const data = response.data;

      if (data.statusCode === 200) {
        setLoader(false);
        const mappedOptions = data.responseData.data.map((item) => ({
          value: item.servicePackageID,
          label: item.servicePackageName,
          servicePackageKeyID: item.servicePackageKeyID,
          needToUpdate: item.needToUpdate === 1,
          // recurringOriginalPrice: item.recurringOriginalPrice,
          // recurringDiscountedPrice: item.recurringDiscountedPrice,
          // oneOffOriginalPrice: item.oneOffOriginalPrice,
          // oneOffDiscountedPrice: item.oneOffDiscountedPrice,
        }));

        setGetServicePackageLookupList(mappedOptions);
      } else {
        setLoader(false);
        console.error("Error fetching data from the API");
      }
    } catch (error) {
      setLoader(false);
      console.error("Error fetching data from the API", error);
    }
  };
  //31)save package id function
  const handleChangePackage = (e) => {
    if (e.needToUpdate) {
      setOpenErrorModal(true);
      setErrorMessage("Please update package first");
      return;
    }
    DisableTabOnChange();
    setIsTypeChange(false);
    setOneOffPricingInfo({
      OriginalPrice: 0,
      DefaultDiscount: 0.0,
      DiscountedPrice: "",
      MaxDiscount: 0,
      VATPrice: null,
      servicePackageName: null,
      MinPrice: "",
      NetTotal: 0,
      Services: null,
      ServicePrice: 0,
      Discount: 0,
      GrandTotal: null,
      DiscountedTotal: 0,
    });
    setRecurringPricingInfo({
      OriginalPrice: 0,
      DefaultDiscount: 0.0,
      DiscountedPrice: "",
      MaxDiscount: 0,
      VATPrice: null,
      servicePackageName: null,
      MinPrice: "",
      NetTotal: 0,
      Services: null,
      ServicePrice: 0,
      Discount: 0,
      GrandTotal: null,
      DiscountedTotal: 0,
    });
    setSelectedPackagesDetails([
      {
        oneOffDefaultPrice: null,
        oneOffOriginalPrice: null,
        recurringDefaultPrice: null,
        recurringOriginalPrice: null,
        servicePackageID: e.value,
        servicePackageName: e.lable,
      },
    ]);
    setSelectedRecurringServiceListCopy([]);
    setSelectedRecurringServiceList([]);
    setSelectedOneOffServiceList([]);
    setIsBack(false);
    setEngagementObj({
      ...engagementObj,
      acceptedServicePackageID: e.value,
      servicePackageKeyID: e.servicePackageKeyID,
    });
  };
  //32) get package value function
  const SelectPackagesTypeValue = getServicePackageLookupList.find((item) => {
    return item.value === engagementObj.acceptedServicePackageID;
  });

  const ClientValue = clientLookUpOptions.find(
    (item) => engagementObj.ClientID === item.value,
  );
  // const ClientValue = clientLookUpOptions.find(
  //   (item) => engagementObj.ClientID == item.value
  // );
  const SelectSourceValue = updatedData.find(
    (item) => engagementObj.selectSourceId == item.value,
  );

  // const TemplateValue = templateLookUpOptions.find((item) => {
  //   return engagementObj.templateID === item.templateID;
  // });
  const TemplateValue =
    templateLookUpOptions.find(
      (item) => item.templateID === engagementObj.templateID,
    ) || templateLookUpOptions[0];
  //33)Change source Type
  const handleChangeSourceType = (e) => {
    DisableTabOnChange();
    setIsBack(false);
    setGetServicePackageLookupList([]);
    setRecurringServiceList([]);
    setOneOffServiceList([]);
    setAdditionalInformationList([]);
    setRequireMessage(false);
    setOneOffPricingInfo({
      OriginalPrice: 0,
      DefaultDiscount: 0.0,
      DiscountedPrice: "",
      MaxDiscount: 0,
      VATPrice: null,
      servicePackageName: null,
      MinPrice: "",
      NetTotal: 0,
      Services: null,
      ServicePrice: 0,
      Discount: 0,
      GrandTotal: null,
      DiscountedTotal: 0,
    });
    setRecurringPricingInfo({
      OriginalPrice: 0,
      DefaultDiscount: 0.0,
      DiscountedPrice: "",
      MaxDiscount: 0,
      VATPrice: null,
      servicePackageName: null,
      MinPrice: "",
      NetTotal: 0,
      Services: null,
      ServicePrice: 0,
      Discount: 0,
      GrandTotal: null,
      DiscountedTotal: 0,
    });
    // setIsChangeSourceType(true);
    setIsTypeChange(false);
    setSelectedRecurringServiceListCopy([]);
    setSelectedRecurringServiceList([]);
    setSelectedOneOffServiceList([]);
    // setClientLookUpOptions([])
    // setProposalLookUpOptions([])
    setEngagementObj({
      ...engagementObj,
      servicePackageKeyID: null,
      selectSourceId: e.value,
      acceptedServicePackageID: null,
      QuoteKeyID: "",
      ClientID: "",
      clientKeyID: "",
      templateKeyID: "",
      templateID: "",
      feeTypeId: 1,
    });
  };
  //34)Get EngagementModelData api implementation.
  const GetContractModelData = async (ContractKeyID) => {
    setLoader(true);
    if (ContractKeyID == undefined) {
      return;
    }

    const response = await GetContractModel(ContractKeyID);
    const QuoteData = await GetQuoteLookupList(common.organisationKeyID);
    const TnCData = await GetTermsAndConditionsLookupList(
      common.organisationKeyID,
    );
    const ClientLookupList = await GetClientLookupList(
      common.organisationKeyID,
    );
    // setIsChangeSourceType(false);

    setLoader(true);
    try {
      if (response.data) {
        if (response.data.statusCode == 200) {
          const ModelData = response.data.responseData.data;
          setContractAdditionalServices(
            ModelData.contractAdditionalServicesInPackages,
          );
          const ClientOption = ClientLookupList.data.responseData.data.map(
            (item) => ({
              value: item.clientID,
              label: item.clientName,
              clientKeyID: item.clientKeyID,
            }),
          );
          setClientLookUpOptions(ClientOption);
          const ClientValue = ClientOption.find(
            (item) => ModelData.clientID == item.value,
          );
          setLoader(true);
          const QuoteLookupList = QuoteData.data.responseData.data.map(
            (item) => ({
              value: item.quoteKeyID,
              label: item.quoteName,
              quoteID: item.quoteID,
              clientID: item.clientID,
            }),
          );
          setProposalLookUpOptions(QuoteLookupList);
          setLoader(true);
          let TnCTypeData = TnCData.data.responseData.data.map((item) => ({
            value: item.templateKeyID,
            label: item.templateName,
            templateID: item.templateID,
          }));
          setTnCLookupList(TnCTypeData);
          // const SelectTnCTemplateValue = TnCTypeData.find((item) => {
          //   return item.templateID === ModelData.tnCTemplateID
          // })

          let SelectedPackage;
          if (
            ModelData.quoteID !== null ||
            ModelData.acceptedServicePackageID
          ) {
            setLoader(true);
            const ServicePackage = await GetServicePackageLookupList({
              userKeyID: common.userKeyID,
              organisationKeyID: common.organisationKeyID,
              ClientKeyID: null,
              QuoteKeyID: ModelData.quoteKeyID,
            });

            const packageOption = ServicePackage.data.responseData.data.map(
              (item) => ({
                value: item.servicePackageID,
                label: item.servicePackageName,
                servicePackageKeyID: item.servicePackageKeyID,
                needToUpdate: item.needToUpdate === 1,
              }),
            );
            SelectedPackage = ServicePackage.data.responseData.data.find(
              (item) =>
                item.servicePackageID == ModelData.acceptedServicePackageID,
            );

            setGetServicePackageLookupList(packageOption);
          }

          let TemplateOption = [];
          if (ModelData.clientID !== null) {
            setLoader(true);
            const response = await GetTemplateListLookupList({
              TemplateTypeID: 2,
              organisationKeyID: common.organisationKeyID,
              clientID: ModelData.clientID,
              QuoteKeyID: null,
            });
            const data = response.data;
            if (data.statusCode === 200) {
              TemplateOption = data.responseData.data.map((item) => ({
                value: item.templateKeyID,
                label: item.templateName,
                templateID: item.templateID,
                fontFamilyID: item.fontFamilyID,
                headerContent: item.headerContent,
                footerContent: item.footerContent,
                headerImage: item.headerImage,
                footerImage: item.footerImage,
                headerHeight: item.headerHeight,
                footerHeight: item.footerHeight,
                watermarkImage: item.watermarkImage,
                orientationID: item.orientationID,
                showSeparatorLines: Boolean(item.showSeparatorLines),
                pricingTableColumnIDs: item.pricingTableColumnIDs
                  ? item.pricingTableColumnIDs
                  : "",
                mainHeadingSD: item.mainHeadingSD,
                recurringOnGoingHeadingSD: item.recurringOnGoingHeadingSD,
                oneOffAdhocHeadingSD: item.oneOffAdhocHeadingSD,
                mainHeadingFontSizeSD: item.mainHeadingFontSizeSD,
                recurringOnGoingHeadingFontSizeSD:
                  item.recurringOnGoingHeadingFontSizeSD,
                oneOffAdhocFontSizeSD: item.oneOffAdhocFontSizeSD,
                mainHeadingIsBoldSD: item.mainHeadingIsBoldSD,
                mainHeadingIsItalicSD: item.mainHeadingIsItalicSD,
                recurringOnGoingHeadingIsBoldSD:
                  item.recurringOnGoingHeadingIsBoldSD,
                recurringOnGoingHeadingIsItalicSD:
                  item.recurringOnGoingHeadingIsItalicSD,
                oneOffAdhocHeadingIsBoldSD: item.oneOffAdhocHeadingIsBoldSD,
                oneOffAdhocHeadingIsItalicSD: item.oneOffAdhocHeadingIsItalicSD,
                mainHeadingSOF: item.mainHeadingSOF,
                recurringOnGoingHeadingSOF: item.recurringOnGoingHeadingSOF,
                oneOffAdhocHeadingSOF: item.oneOffAdhocHeadingSOF,
                mainHeadingFontSizeSOF: item.mainHeadingFontSizeSOF,
                recurringOnGoingHeadingFontSizeSOF:
                  item.recurringOnGoingHeadingFontSizeSOF,
                oneOffAdhocFontSizeSOF: item.oneOffAdhocFontSizeSOF,
                mainHeadingIsBoldSOF: item.mainHeadingIsBoldSOF,
                mainHeadingIsItalicSOF: item.mainHeadingIsItalicSOF,
                recurringOnGoingHeadingIsBoldSOF:
                  item.recurringOnGoingHeadingIsBoldSOF,
                recurringOnGoingHeadingIsItalicSOF:
                  item.recurringOnGoingHeadingIsItalicSOF,
                oneOffAdhocHeadingIsBoldSOF: item.oneOffAdhocHeadingIsBoldSOF,
                oneOffAdhocHeadingIsItalicSOF:
                  item.oneOffAdhocHeadingIsItalicSOF,
              }));
              setTemplateLookUpOptions(TemplateOption);
            }
          } else {
            setLoader(true);
            const response = await GetTemplateListLookupList({
              TemplateTypeID: 2,
              organisationKeyID: common.organisationKeyID,
              clientID: null,
              QuoteKeyID: SelectProposalTypeValue?.value,
            });
            const data = response.data;
            setLoader(true);
            if (data.statusCode === 200) {
              setLoader(false);
              TemplateOption = data.responseData.data.map((item) => ({
                value: item.templateKeyID,
                label: item.templateName,
                templateID: item.templateID,
                fontFamilyID: item.fontFamilyID,
                headerContent: item.headerContent,
                footerContent: item.footerContent,
                headerImage: item.headerImage,
                footerImage: item.footerImage,
                headerHeight: item.headerHeight,
                footerHeight: item.footerHeight,
                watermarkImage: item.watermarkImage,
                orientationID: item.orientationID,
                showSeparatorLines: Boolean(item.showSeparatorLines),
                pricingTableColumnIDs: item.pricingTableColumnIDs
                  ? item.pricingTableColumnIDs
                  : "",
                mainHeadingSD: item.mainHeadingSD,
                recurringOnGoingHeadingSD: item.recurringOnGoingHeadingSD,
                oneOffAdhocHeadingSD: item.oneOffAdhocHeadingSD,
                mainHeadingFontSizeSD: item.mainHeadingFontSizeSD,
                recurringOnGoingHeadingFontSizeSD:
                  item.recurringOnGoingHeadingFontSizeSD,
                oneOffAdhocFontSizeSD: item.oneOffAdhocFontSizeSD,
                mainHeadingIsBoldSD: item.mainHeadingIsBoldSD,
                mainHeadingIsItalicSD: item.mainHeadingIsItalicSD,
                recurringOnGoingHeadingIsBoldSD:
                  item.recurringOnGoingHeadingIsBoldSD,
                recurringOnGoingHeadingIsItalicSD:
                  item.recurringOnGoingHeadingIsItalicSD,
                oneOffAdhocHeadingIsBoldSD: item.oneOffAdhocHeadingIsBoldSD,
                oneOffAdhocHeadingIsItalicSD: item.oneOffAdhocHeadingIsItalicSD,
                mainHeadingSOF: item.mainHeadingSOF,
                recurringOnGoingHeadingSOF: item.recurringOnGoingHeadingSOF,
                oneOffAdhocHeadingSOF: item.oneOffAdhocHeadingSOF,
                mainHeadingFontSizeSOF: item.mainHeadingFontSizeSOF,
                recurringOnGoingHeadingFontSizeSOF:
                  item.recurringOnGoingHeadingFontSizeSOF,
                oneOffAdhocFontSizeSOF: item.oneOffAdhocFontSizeSOF,
                mainHeadingIsBoldSOF: item.mainHeadingIsBoldSOF,
                mainHeadingIsItalicSOF: item.mainHeadingIsItalicSOF,
                recurringOnGoingHeadingIsBoldSOF:
                  item.recurringOnGoingHeadingIsBoldSOF,
                recurringOnGoingHeadingIsItalicSOF:
                  item.recurringOnGoingHeadingIsItalicSOF,
                oneOffAdhocHeadingIsBoldSOF: item.oneOffAdhocHeadingIsBoldSOF,
                oneOffAdhocHeadingIsItalicSOF:
                  item.oneOffAdhocHeadingIsItalicSOF,
              }));
              setTemplateLookUpOptions(TemplateOption);
            }
          }

          // const TemplateValue = TemplateOption.find((item) => {
          //   return ModelData.templateID === item.templateID;
          // });
          const TemplateValue =
            TemplateOption.find(
              (item) => item.templateID === ModelData.templateID,
            ) || TemplateOption[0];
          console.log(TemplateValue);
          setFontFamily(getFontNameById(TemplateValue.fontFamilyID));
          setHeaderContent(TemplateValue.headerContent);
          setFooterContent(TemplateValue.footerContent);
          setHeaderImage(TemplateValue.headerImage);
          setFooterImage(TemplateValue.footerImage);
          setHeaderHeight(TemplateValue.headerHeight);
          setFooterHeight(TemplateValue.footerHeight);
          setWatermarkImage(TemplateValue.watermarkImage);
          setOrientationID(TemplateValue.orientationID);
          setLoader(true);
          setContractFinalPackageAmountList(ModelData.contractFinalAmountList);
          setEngagementObj({
            ...engagementObj,
            DiscountLines: ModelData.showDiscountLine,
            servicePackageKeyID:
              ModelData.quoteID !== null
                ? SelectedPackage?.servicePackageKeyID
                : null,
            acceptedServicePackageID: ModelData.acceptedServicePackageID,
            tnCTemplateKeyID: ModelData.tnCTemplateKeyID,
            tnCTemplateID: ModelData.tnCTemplateID,
            contractKeyID: ModelData.contractKeyID,
            QuoteKeyID: ModelData?.quoteKeyID,
            quoteID: ModelData.quoteID,
            quoteTypeID: ModelData.quoteTypeID,
            pdf: ModelData.tnCTemplatePdfUrl,
            selectSourceId: ModelData.sourceID,
            tnCTemplateContent: ModelData.tnCTemplateContent,
            ClientID: ModelData.clientID,
            clientKeyID: ModelData.clientKeyID,
            templateKeyID: ModelData.templateKeyID, //TemplateValue?.value,
            templateID: ModelData.templateID,
            feeTypeId: ModelData.feesInQuoteID,
            Payment_Frequency: ModelData.paymentFrequencyID,
            paymentGatewayID: ModelData.paymentGatewayID,
            statusID: ModelData.statusID,
          });
          // If contract has saved column IDs, it means user used a custom table template.
          // Prefer persisted selection over the template's default columns.
          const resolvedPricingTableColumnIDs =
            typeof ModelData?.pricingTableColumnIDs === "string" &&
            ModelData.pricingTableColumnIDs.trim() !== ""
              ? ModelData.pricingTableColumnIDs
              : TemplateValue?.pricingTableColumnIDs;

          setPricingTableColumnIDs(
            typeof resolvedPricingTableColumnIDs === "string"
              ? resolvedPricingTableColumnIDs
              : "",
          );
          updateVisibleFieldsFromIds(resolvedPricingTableColumnIDs);
          setServiceDescriptionObj((prev) => ({
            ...prev,
            mainHeading: TemplateValue?.mainHeadingSD,
            recurringOnGoingHeading: TemplateValue?.recurringOnGoingHeadingSD,
            oneOffAdhocHeading: TemplateValue?.oneOffAdhocHeadingSD,
            mainHeadingFontSize: TemplateValue?.mainHeadingFontSizeSD,
            recurringOnGoingHeadingFontSize:
              TemplateValue?.recurringOnGoingHeadingFontSizeSD,
            oneOffAdhocFontSize: TemplateValue?.oneOffAdhocFontSizeSD,
            mainHeadingIsBold: TemplateValue?.mainHeadingIsBoldSD,
            mainHeadingIsItalic: TemplateValue?.mainHeadingIsItalicSD,
            recurringOnGoingHeadingIsBold:
              TemplateValue?.recurringOnGoingHeadingIsBoldSD,
            recurringOnGoingHeadingIsItalic:
              TemplateValue?.recurringOnGoingHeadingIsItalicSD,
            oneOffAdhocHeadingIsBold: TemplateValue?.oneOffAdhocHeadingIsBoldSD,
            oneOffAdhocHeadingIsItalic:
              TemplateValue?.oneOffAdhocHeadingIsItalicSD,
          }));
          setStatementOfFactsObj((prev) => ({
            ...prev,
            mainHeading: TemplateValue?.mainHeadingSOF,
            recurringOnGoingHeading: TemplateValue?.recurringOnGoingHeadingSOF,
            oneOffAdhocHeading: TemplateValue?.oneOffAdhocHeadingSOF,
            mainHeadingFontSize: TemplateValue?.mainHeadingFontSizeSOF,
            recurringOnGoingHeadingFontSize:
              TemplateValue?.recurringOnGoingHeadingFontSizeSOF,
            oneOffAdhocFontSize: TemplateValue?.oneOffAdhocFontSizeSOF,
            mainHeadingIsBold: TemplateValue?.mainHeadingIsBoldSOF,
            mainHeadingIsItalic: TemplateValue?.mainHeadingIsItalicSOF,
            recurringOnGoingHeadingIsBold:
              TemplateValue?.recurringOnGoingHeadingIsBoldSOF,
            recurringOnGoingHeadingIsItalic:
              TemplateValue?.recurringOnGoingHeadingIsItalicSOF,
            oneOffAdhocHeadingIsBold:
              TemplateValue?.oneOffAdhocHeadingIsBoldSOF,
            oneOffAdhocHeadingIsItalic:
              TemplateValue?.oneOffAdhocHeadingIsItalicSOF,
          }));

          // if (ModelData.contractSignatorieList.length === 0) {
          //   setLoader(true);
          //   GetOfficersForQuoteAndContractData({
          //     ClientKeyID: ClientValue.clientKeyID,
          //     QuoteKeyID: ModelData.quoteKeyID,
          //   });
          // }
          // setLoader(true);
          if (ModelData.clientKeyID !== null) {
            setLoader(true);
            try {
              const data = await GetOfficersForQuoteAndContract({
                ClientKeyID: ModelData.clientKeyID,
                QuoteKeyID: ModelData.quoteKeyID,
              });
              if (data?.data?.statusCode === 200) {
                setLoader(false);
                if (data?.data?.responseData?.data) {
                  const ModelData = data?.data?.responseData?.data;
                  setContractSignatoriesList(ModelData);
                }
              } else {
                setLoader(false);
                setErrorMessage(data?.data?.errorMessage);
              }
            } catch (error) {
              setLoader(false);
              console.log(error);
            }
          } else if (ModelData.quoteKeyID !== null) {
            setLoader(true);
            try {
              const data = await GetOfficersForQuoteAndContract({
                ClientKeyID: ModelData.clientKeyID,
                QuoteKeyID: ModelData.quoteKeyID,
              });
              if (data?.data?.statusCode === 200) {
                setLoader(false);
                if (data?.data?.responseData?.data) {
                  const ModelData = data?.data?.responseData?.data;
                  setContractSignatoriesList(ModelData);
                }
              } else {
                setLoader(false);
                setErrorMessage(data?.data?.errorMessage);
              }
            } catch (error) {
              setLoader(false);
              console.log(error);
            }
          }

          // setLoader(true);
          // setContractSignatoriesList(ModelData.contractSignatorieList);

          if (ModelData.selectedServicesList.length !== 0) {
            if (
              (ModelData.selectedServicesList.map(
                (item) => item.serviceChargeTypeID === 1,
              ) &&
                ModelData.recurringOriginalPrice !== null &&
                ModelData.recurringOriginalPrice !== 0) ||
              (ModelData.selectedServicesList.map(
                (item) => item.serviceChargeTypeID === 2,
              ) &&
                ModelData.recurringOriginalPrice !== null &&
                ModelData.recurringOriginalPrice !== 0)
            ) {
              setIsTypeChange(true);
            }
          }

          const PercentageWithDecimal =
            ModelData.recurringDiscountPercentage_WithAllDecimal;
          const RecOg = ModelData.recurringOriginalPrice;
          const recDefault = ModelData.recurringDiscountedPrice;
          const recDefaultDecrease = Number(RecOg) - Number(recDefault);
          const OneOffDefaultDiscount = Number(
            ModelData.oneOffDiscountPercentage_WithAllDecimal,
          ).toFixed(2);

          const recDefaultDiscount = Number(PercentageWithDecimal).toFixed(2);
          // setLoader(true)
          // await GetOfficersForQuoteAndContractData({ ClientKeyID: ClientValue.clientKeyID, QuoteKeyID: SelectProposalTypeValue?.value })
          const truncatedTotal =
            Math.trunc(ModelData.recurringDiscountedPrice * 100) / 100;
          let RecDiscountedPrice = Number(
            ModelData.recurringDiscountedPrice,
          )?.toFixed(2);
          setRecurringPricingInfo({
            ...RecurringPricingInfo,
            OriginalPrice: ModelData.recurringOriginalPrice,
            DefaultDiscount: recDefaultDiscount,
            DiscountedPrice: RecDiscountedPrice,
            NetTotal: 0,
            Services: null,
            ServicePrice: 0,
            Discount: recDefaultDecrease,
            DiscountedTotal: recDefault,
          });
          setRecurringFrequencyPricingInfo({
            ...RecurringFrequencyPricingInfo,
            OriginalPrice: ModelData.recurringOriginalPrice,
            DefaultDiscount: PercentageWithDecimal,
            DiscountedPrice: ModelData.recurringDiscountedPrice,
            NetTotal: 0,
            Services: null,
            ServicePrice: 0,
            Discount: recDefaultDecrease,
            DiscountedTotal: recDefault,
          });
          const OneOffOg = ModelData.oneOffOriginalPrice;
          const OneDefault = ModelData.oneOffDiscountedPrice;
          const OneDefaultDecrease = Number(OneOffOg) - Number(OneDefault);
          const truncatedOneTotal = Math.trunc(OneDefault * 100) / 100;
          let OneOffDiscountedPrice = Number(truncatedOneTotal)?.toFixed(2);
          setOneOffPricingInfo({
            ...OneOffPricingInfo,
            OriginalPrice: ModelData.oneOffOriginalPrice,
            DefaultDiscount: OneOffDefaultDiscount,
            DiscountedPrice: OneOffDiscountedPrice,
            NetTotal: 0,
            Services: null,
            ServicePrice: 0,
            Discount: OneDefaultDecrease,
            DiscountedTotal: OneDefault,
          });
          setOneOffPricingInfoCopy({
            ...OneOffPricingInfoCopy,
            OriginalPrice: ModelData.oneOffOriginalPrice,
            DefaultDiscount: ModelData.oneOffDiscountPercentage_WithAllDecimal,
            DiscountedPrice: OneDefault,
            NetTotal: 0,
            Services: null,
            ServicePrice: 0,
            Discount: OneDefaultDecrease,
            DiscountedTotal: OneDefault,
          });
          setLoader(false);
        } else {
          setLoader(false);
          setErrorMessage(response.data.data.errorMessage);
        }
      } else {
        setLoader(false);
        setErrorMessage(response.data.data.errorMessage);
      }
    } catch (error) {
      setLoader(false);
      console.log(error);
    }
  };
  // 35) get service model data after select proposal type
  const GetSelectedServicePackageAcceptData = async (nextTab) => {
    setLoader(true);
    setIsBack(true);
    try {
      const fetchServiceData = async (type) => {
        const serviceData = await GetSelectedServicePackageAccept(
          engagementObj.QuoteKeyID,
          engagementObj.servicePackageKeyID || null,
          "Accepted",
          type,
        );
        return serviceData?.data?.statusCode === 200
          ? serviceData.data.responseData
          : null;
      };
      GetVariableValuesForTnCTemplateData();
      const recurringService = await fetchServiceData(1);
      const oneOffService = await fetchServiceData(2);
      const selectedService =
        recurringService.selectedServices.length !== 0
          ? recurringService
          : oneOffService.selectedServices.length !== 0
            ? oneOffService
            : null;

      if (selectedService) {
        setSelectedPackagesList([
          {
            servicePackageID:
              selectedService.finalQuotationAmount.servicePackageID,
            servicePackageKeyID: null,
            servicePackageName:
              selectedService.finalQuotationAmount.servicePackageName,
          },
        ]);
      }

      if (isTypeChange) {
        if (recurringService.selectedServices.length !== 0) {
          const {
            selectedServices,
            finalQuotationAmount,
            recurringOneOffPrice,
            quoteAdditionalInfoGlobalPricingDriver,
          } = recurringService;
          const recArrayWithPriceCopy = selectedServices.map((category) => ({
            serviceCatID: category.serviceCatID,
            serviceCatName: category.serviceCatName,

            servicesList: category.servicesList.map((service) => {
              const originalQuotationPrice = Number(
                service.quotationPriceWithAllDecimal ??
                  service.quotationPrice ??
                  0,
              );

              let yearlyPrice = originalQuotationPrice;

              /*
               * The proposal API may return the amount according to its
               * selected payment frequency. Convert it back to yearly first.
               */
              switch (recurringOneOffPrice.paymentFrequencyID) {
                case Payment_Frequency.Monthly:
                  yearlyPrice = originalQuotationPrice * 12;
                  break;

                case Payment_Frequency.Quarterly:
                  yearlyPrice = originalQuotationPrice * 4;
                  break;

                case Payment_Frequency.HalfYearly:
                  yearlyPrice = originalQuotationPrice * 2;
                  break;

                case Payment_Frequency.Yearly:
                default:
                  yearlyPrice = originalQuotationPrice;
                  break;
              }

              let currentFrequencyPrice = yearlyPrice;

              /*
               * Set the value based on the payment frequency selected
               * in the engagement letter.
               */
              switch (engagementObj.Payment_Frequency) {
                case Payment_Frequency.Monthly:
                  currentFrequencyPrice = yearlyPrice / 12;
                  break;

                case Payment_Frequency.Quarterly:
                  currentFrequencyPrice = yearlyPrice / 4;
                  break;

                case Payment_Frequency.HalfYearly:
                  currentFrequencyPrice = yearlyPrice / 2;
                  break;

                case Payment_Frequency.Yearly:
                default:
                  currentFrequencyPrice = yearlyPrice;
                  break;
              }

              return {
                ...service,

                /*
                 * Required by calculateCustomServiceRow and
                 * calculateCustomServiceFooter.
                 */
                price: currentFrequencyPrice,

                /*
                 * Required by the existing default table.
                 */
                quotationPrice: currentFrequencyPrice.toFixed(2),

                /*
                 * Preserve calculation precision.
                 */
                quotationPriceWithAllDecimal: currentFrequencyPrice,

                /*
                 * Yearly base price used when payment frequency changes.
                 */
                originalServicePrice: yearlyPrice,
              };
            }),
          }));

          let updatedService = recArrayWithPriceCopy.map((category) => ({
            serviceCatID: category.serviceCatID,
            serviceCatName: category.serviceCatName,
            servicesList: category.servicesList.map((service) => {
              let quotationPrice = Number(
                service.quotationPriceWithAllDecimal,
              ).toFixed(2);
              let quotationPriceWithAllDecimal = Number(
                service.quotationPriceWithAllDecimal,
              ).toFixed(2);
              switch (engagementObj.Payment_Frequency) {
                case 1: // Yearly
                  quotationPrice /= 1;
                  quotationPriceWithAllDecimal /= 1;
                  break;
                case 2: // Half-Yearly
                  quotationPrice /= 2;
                  quotationPriceWithAllDecimal /= 2;
                  break;
                case 3: // Quarterly
                  quotationPrice /= 4;
                  quotationPriceWithAllDecimal /= 4;
                  break;
                case 4: // Monthly
                  quotationPrice /= 12;
                  quotationPriceWithAllDecimal /= 12;
                  break;
                default:
                  break;
              }
              return {
                ...service,
                quotationPrice,
                quotationPriceWithAllDecimal,
              };
            }),
          }));
          setSelectedRecurringServiceListCopy(recArrayWithPriceCopy);
          setSelectedRecurringServiceList(updatedService);
          setLoader(false);
          setActiveTab(nextTab);
          if (finalQuotationAmount.vatPercentage !== null) {
            setVATPercentage(finalQuotationAmount.vatPercentage);
          }
          if (quoteAdditionalInfoGlobalPricingDriver !== null) {
            setQuoteAdditionalInfoGlobalPricingDriver(
              quoteAdditionalInfoGlobalPricingDriver,
            );
          }

          const RecTotal = recArrayWithPriceCopy.reduce((acc, category) => {
            return (
              acc +
              category.servicesList.reduce((subtotal, service) => {
                return Number(subtotal) + Number(service.quotationPrice);
              }, 0)
            );
          }, 0);

          let recDefaultPriceCopy =
            RecTotal * (1 - RecurringPricingInfo.DefaultDiscount / 100);
          let multiplicationFactor = 1; // Default to yearly

          switch (engagementObj.Payment_Frequency) {
            case 4:
              multiplicationFactor = 12; // Convert to yearly
              break;
            case 3:
              multiplicationFactor = 4; // Convert to yearly
              break;
            case 2:
              multiplicationFactor = 2; // Convert to yearly
              break;
            // No adjustment needed for yearly
            case 1:
            default:
              break;
          }
          // recDefaultPriceCopy = (
          //   Math.floor(
          //     Number(recDefaultPriceCopy * multiplicationFactor) * 100
          //   ) / 100
          // ).toFixed(2)

          setRecurringFrequencyPricingInfo((prev) => ({
            ...prev,
            OriginalPrice: (Math.floor(Number(RecTotal) * 100) / 100).toFixed(
              2,
            ),
            DiscountedPrice: recDefaultPriceCopy,
          }));
        }
        if (oneOffService.selectedServices.length !== 0) {
          const {
            selectedServices,
            finalQuotationAmount,
            recurringOneOffPrice,
            quoteAdditionalInfoGlobalPricingDriver,
          } = oneOffService;
          let updatedService = selectedServices.map((category) => ({
            serviceCatID: category.serviceCatID,
            serviceCatName: category.serviceCatName,
            servicesList: category.servicesList.map((service) => {
              let quotationPrice = Number(service.quotationPriceWithAllDecimal);
              let quotationPriceWithAllDecimal = Number(
                service.quotationPriceWithAllDecimal,
              );
              return {
                ...service,
                quotationPrice,
                quotationPriceWithAllDecimal,
              };
            }),
          }));
          setSelectedOneOffServiceList(updatedService);
          if (finalQuotationAmount.vatPercentage !== null) {
            setVATPercentage(finalQuotationAmount.vatPercentage);
          }
          if (quoteAdditionalInfoGlobalPricingDriver !== null) {
            setQuoteAdditionalInfoGlobalPricingDriver(
              quoteAdditionalInfoGlobalPricingDriver,
            );
          }
        }
      } else {
        const { selectedServices, finalQuotationAmount, recurringOneOffPrice } =
          oneOffService;
        let updatedService = selectedServices.map((category) => ({
          serviceCatID: category.serviceCatID,
          serviceCatName: category.serviceCatName,
          servicesList: category.servicesList.map((service) => {
            let quotationPrice = Number(
              service.quotationPriceWithAllDecimal,
            ).toFixed(2);
            let quotationPriceWithAllDecimal = Number(
              service.quotationPriceWithAllDecimal,
            ).toFixed(2);
            return {
              ...service,
              quotationPrice,
              quotationPriceWithAllDecimal,
            };
          }),
        }));
        setSelectedOneOffServiceList(updatedService);

        if (recurringService.selectedServices.length !== 0) {
          const {
            selectedServices,
            finalQuotationAmount,
            recurringOneOffPrice,
            quoteAdditionalInfoGlobalPricingDriver,
          } = recurringService;
          let updatedService = selectedServices.map((category) => ({
            serviceCatID: category.serviceCatID,
            serviceCatName: category.serviceCatName,
            servicesList: category.servicesList.map((service) => {
              let quotationPrice = Number(
                service.quotationPriceWithAllDecimal,
              ).toFixed(2);
              let quotationPriceWithAllDecimal = Number(
                service.quotationPriceWithAllDecimal,
              ).toFixed(2);
              return {
                ...service,
                quotationPrice,
                quotationPriceWithAllDecimal,
              };
            }),
          }));
          setSelectedRecurringServiceList(updatedService);
          if (finalQuotationAmount.vatPercentage !== null) {
            setVATPercentage(finalQuotationAmount.vatPercentage);
          }
          if (quoteAdditionalInfoGlobalPricingDriver !== null) {
            setQuoteAdditionalInfoGlobalPricingDriver(
              quoteAdditionalInfoGlobalPricingDriver,
            );
          }
          setEngagementObj((prev) => ({
            ...prev,
            Payment_Frequency: recurringOneOffPrice.paymentFrequencyID,
            feeTypeId: recurringOneOffPrice.feesInQuoteID,
            showDiscountLine: recurringOneOffPrice.showDiscountLine,
          }));

          let multiplicationFactor = 1; // Default to yearly

          switch (recurringOneOffPrice.paymentFrequencyID) {
            case 4:
              multiplicationFactor = 12; // Convert to yearly
              break;
            case 3:
              multiplicationFactor = 4; // Convert to yearly
              break;
            case 2:
              multiplicationFactor = 2; // Convert to yearly
              break;
            // No adjustment needed for yearly
            case 1:
            default:
              break;
          }

          const recArrayWithPriceCopy = selectedServices.map((category) => ({
            serviceCatID: category.serviceCatID,
            serviceCatName: category.serviceCatName,

            servicesList: category.servicesList.map((service) => {
              const originalQuotationPrice = Number(
                service.quotationPriceWithAllDecimal ??
                  service.quotationPrice ??
                  0,
              );

              let yearlyPrice = originalQuotationPrice;

              /*
               * The proposal API may return the amount according to its
               * selected payment frequency. Convert it back to yearly first.
               */
              switch (recurringOneOffPrice.paymentFrequencyID) {
                case Payment_Frequency.Monthly:
                  yearlyPrice = originalQuotationPrice * 12;
                  break;

                case Payment_Frequency.Quarterly:
                  yearlyPrice = originalQuotationPrice * 4;
                  break;

                case Payment_Frequency.HalfYearly:
                  yearlyPrice = originalQuotationPrice * 2;
                  break;

                case Payment_Frequency.Yearly:
                default:
                  yearlyPrice = originalQuotationPrice;
                  break;
              }

              let currentFrequencyPrice = yearlyPrice;

              /*
               * Set the value based on the payment frequency selected
               * in the engagement letter.
               */
              switch (engagementObj.Payment_Frequency) {
                case Payment_Frequency.Monthly:
                  currentFrequencyPrice = yearlyPrice / 12;
                  break;

                case Payment_Frequency.Quarterly:
                  currentFrequencyPrice = yearlyPrice / 4;
                  break;

                case Payment_Frequency.HalfYearly:
                  currentFrequencyPrice = yearlyPrice / 2;
                  break;

                case Payment_Frequency.Yearly:
                default:
                  currentFrequencyPrice = yearlyPrice;
                  break;
              }

              return {
                ...service,

                /*
                 * Required by calculateCustomServiceRow and
                 * calculateCustomServiceFooter.
                 */
                price: currentFrequencyPrice,

                /*
                 * Required by the existing default table.
                 */
                quotationPrice: currentFrequencyPrice.toFixed(2),

                /*
                 * Preserve calculation precision.
                 */
                quotationPriceWithAllDecimal: currentFrequencyPrice,

                /*
                 * Yearly base price used when payment frequency changes.
                 */
                originalServicePrice: yearlyPrice,
              };
            }),
          }));
          setSelectedRecurringServiceListCopy(recArrayWithPriceCopy);
          const RecTotal = selectedServices.reduce((acc, category) => {
            return (
              acc +
              category.servicesList.reduce((subtotal, service) => {
                return (
                  Number(subtotal) +
                  Number(service.quotationPriceWithAllDecimal)
                );
              }, 0)
            );
          }, 0);

          let discountedPercentage = Number(
            recurringOneOffPrice.recurringDiscountPercentage,
          );

          let percentage = Number(
            recurringOneOffPrice.recurringDiscountPercentage_WithAllDecimal,
          );
          const recOriginalPriceCopy = (
            Number(RecTotal) * multiplicationFactor
          ).toFixed(12);
          const recDefaultPriceCopy = Number(
            finalQuotationAmount.discountedTotal * multiplicationFactor,
          )?.toFixed(2);

          const recVATPriceCopy = (
            Number(recDefaultPriceCopy) *
            (finalQuotationAmount.vatPercentage / 100)
          ).toFixed(2);
          const recGrandTotalCopy = (
            Number(recDefaultPriceCopy) + Number(recVATPriceCopy)
          ).toFixed(2);

          percentage = Number(
            finalQuotationAmount.discountPercentageWithAllDecimal,
          );
          discountedPercentage = Number(
            finalQuotationAmount.discountPercentageWithAllDecimal,
          ).toFixed(2);
          setServicePackageName(finalQuotationAmount.servicePackageName);
          setRecurringPricingInfo((prev) => ({
            ...prev,
            OriginalPrice: Number(RecTotal),
            DefaultDiscount: Number(discountedPercentage)?.toFixed(2),
            servicePackageName: finalQuotationAmount.servicePackageName,
            DiscountedPrice: finalQuotationAmount.discountedTotal?.toFixed(2),
            NetTotal: Math.max(
              Number(finalQuotationAmount.netTotal),
              Number(finalQuotationAmount.discountedTotal),
            ),
            VATPrice: Number(finalQuotationAmount.vat),
            Discount: Number(finalQuotationAmount.discounted),
            DiscountedTotal: Number(finalQuotationAmount.discountedTotal),
            GrandTotal: Number(finalQuotationAmount.grandTotal),
          }));

          setRecurringFrequencyPricingInfo((prev) => ({
            ...prev,
            OriginalPrice: recOriginalPriceCopy,
            DefaultDiscount: Number(percentage),
            servicePackageName: finalQuotationAmount.servicePackageName,
            DiscountedPrice: recDefaultPriceCopy,
            NetTotal: recOriginalPriceCopy,
            VATPrice: recVATPriceCopy,
            Discount: Number(finalQuotationAmount.discounted),
            DiscountedTotal: Number(finalQuotationAmount.discountedTotal),
            GrandTotal: recGrandTotalCopy,
          }));
        }

        if (oneOffService.selectedServices.length !== 0) {
          const {
            selectedServices,
            finalQuotationAmount,
            recurringOneOffPrice,
            quoteAdditionalInfoGlobalPricingDriver,
          } = oneOffService;
          if (finalQuotationAmount.vatPercentage !== null) {
            setVATPercentage(finalQuotationAmount.vatPercentage);
          }
          if (quoteAdditionalInfoGlobalPricingDriver !== null) {
            setQuoteAdditionalInfoGlobalPricingDriver(
              quoteAdditionalInfoGlobalPricingDriver,
            );
          }
          setEngagementObj((prev) => ({
            ...prev,
            Payment_Frequency: recurringOneOffPrice.paymentFrequencyID,
            feeTypeId: recurringOneOffPrice.feesInQuoteID,
            showDiscountLine: recurringOneOffPrice.showDiscountLine,
          }));
          const OneOffTotal = selectedServices.reduce((acc, category) => {
            return (
              acc +
              category.servicesList.reduce((subtotal, service) => {
                return (
                  Number(subtotal) +
                  Number(service.quotationPriceWithAllDecimal)
                );
              }, 0)
            );
          }, 0);

          let updatedService = selectedServices.map((category) => ({
            serviceCatID: category.serviceCatID,
            serviceCatName: category.serviceCatName,
            servicesList: category.servicesList.map((service) => {
              let quotationPrice = Number(service.quotationPriceWithAllDecimal);
              let quotationPriceWithAllDecimal = Number(
                service.quotationPriceWithAllDecimal,
              );
              return {
                ...service,
                quotationPrice,
                quotationPriceWithAllDecimal,
              };
            }),
          }));
          setSelectedOneOffServiceList(updatedService);

          if (
            OneOffPricingInfo.OriginalPrice === "" ||
            OneOffPricingInfo.OriginalPrice === null ||
            OneOffPricingInfo.OriginalPrice === undefined ||
            Number(OneOffTotal)?.toFixed(2) !=
              Number(OneOffPricingInfo.OriginalPrice)?.toFixed(2)
          ) {
            let discountedPercentage = Number(
              recurringOneOffPrice.oneOffDiscountPercentage,
            );
            let percentage = Number(
              recurringOneOffPrice.oneOffDiscountPercentage_WithAllDecimal,
            );
            percentage = Number(
              finalQuotationAmount.discountPercentageWithAllDecimal,
            );
            discountedPercentage = Number(
              finalQuotationAmount.discountPercentageWithAllDecimal,
            ).toFixed(2);
            setServicePackageName(finalQuotationAmount.servicePackageName);
            setOneOffPricingInfo((prev) => ({
              ...prev,
              OriginalPrice: OneOffTotal,
              servicePackageName: finalQuotationAmount.servicePackageName,
              DefaultDiscount: Number(discountedPercentage)?.toFixed(2),
              DiscountedPrice: Number(
                finalQuotationAmount.discountedTotal,
              )?.toFixed(2),
              NetTotal: Math.max(
                Number(finalQuotationAmount.netTotal),
                Number(finalQuotationAmount.discountedTotal),
              ),
              VATPrice: Number(finalQuotationAmount.vat),
              Discount: Number(finalQuotationAmount.discounted),
              DiscountedTotal: Number(finalQuotationAmount.discountedTotal),
              GrandTotal: Number(finalQuotationAmount.grandTotal),
            }));

            setOneOffPricingInfoCopy((prev) => ({
              ...prev,
              OriginalPrice: OneOffTotal,
              servicePackageName: finalQuotationAmount.servicePackageName,
              DefaultDiscount: Number(percentage),
              DiscountedPrice: Number(
                finalQuotationAmount.discountedTotal,
              )?.toFixed(2),
              NetTotal: Number(finalQuotationAmount.netTotal)?.toFixed(2),
              VATPrice: Number(finalQuotationAmount.vat),
              Discount: Number(finalQuotationAmount.discounted),
              DiscountedTotal: Number(finalQuotationAmount.discountedTotal),
              GrandTotal: Number(finalQuotationAmount.grandTotal),
            }));
          }
        }

        setLoader(false);
        setActiveTab(nextTab);
      }
    } catch (error) {
      setLoader(false);
      console.error(error);
    } finally {
      setLoader(false);
    }
  };

  //36)get pricing setting model data api implementation.
  const updateProposalObject = (newData) => {
    setEngagementObj((prev) => ({
      ...prev,
      ...newData,
    }));
  };
  let PricingCount = 0;
  const GetPricingSettingModelData = async () => {
    if (PricingCount !== 0) {
      return;
    }
    PricingCount += 1;
    setLoader(true);
    try {
      const data = await GetPricingSettingModel(common.organisationKeyID);

      if (data?.data?.statusCode === 200) {
        setLoader(false);
        if (data?.data?.responseData?.data) {
          setLoader(false);
          const ModelData = data?.data?.responseData?.data;
          setPricingSettingObj({
            ...pricingSettingObj,
            userKeyID: common.userKeyID,
            minOneOffPriceForQC: ModelData.minOneOffPriceForQC,
            minMonthlyPriceForQC: ModelData.minMonthlyPriceForQC,
            minQuarterlyPriceForQC: ModelData.minQuarterlyPriceForQC,
            minHalfYearlyPriceForQC: ModelData.minHalfYearlyPriceForQC,
            minYearlyPriceForQC: ModelData.minYearlyPriceForQC,
            maxDiscountForQC: ModelData.maxDiscountForQC,
            organisationKeyID: ModelData.organisationKeyID,
            PaymentFrequency: ModelData.paymentFrequencyID,
          });
          // if (modelAction !== "Draft") {
          //   setEngagementObj({
          //     ...engagementObj,
          //     Payment_Frequency: ModelData.paymentFrequencyID === null ? 1 : ModelData.paymentFrequencyID
          //   })
          // }
          if (
            engagementObj.Payment_Frequency === "" ||
            engagementObj.Payment_Frequency === undefined ||
            engagementObj.Payment_Frequency === null
          ) {
            updateProposalObject({
              Payment_Frequency:
                ModelData.paymentFrequencyID === null
                  ? 1
                  : ModelData.paymentFrequencyID,
            });
          }
        }
      } else {
        setLoader(false);
        setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      setLoader(false);
      console.log(error);
    }
  };

  //37) SignEasy api implementation
  const GetSendToSignEasyData = async (Api_request_params) => {
    setLoader(true);
    const data = await GetSendToSignEasy(Api_request_params);
    try {
      if (data) {
        if (data.data.statusCode === 200) {
          setLoader(false);
          setOpenSuccessModal(true);
        } else {
          setLoader(false);
          setErrorMessage("Something wen wrong");
        }
      }
    } catch (error) {
      setLoader(false);
    }
  };

  const skipToEngagementLatter = async () => {
    setLoader(true);
    let allApisCompleted = false;
    try {
      setModelAction("Send");
      setLoader(true);
      const PricingSetting = await GetPricingSettingModel(
        common.organisationKeyID,
      );
      let PricingSettingData;
      if (PricingSetting?.data?.statusCode === 200) {
        setLoader(false);
        if (PricingSetting?.data?.responseData?.data) {
          setLoader(false);
          PricingSettingData = PricingSetting?.data?.responseData?.data;
          setPricingSettingObj({
            ...pricingSettingObj,
            userKeyID: common.userKeyID,
            minOneOffPriceForQC: PricingSettingData.minOneOffPriceForQC,
            minMonthlyPriceForQC: PricingSettingData.minMonthlyPriceForQC,
            minQuarterlyPriceForQC: PricingSettingData.minQuarterlyPriceForQC,
            minHalfYearlyPriceForQC: PricingSettingData.minHalfYearlyPriceForQC,
            minYearlyPriceForQC: PricingSettingData.minYearlyPriceForQC,
            maxDiscountForQC: PricingSettingData.maxDiscountForQC,
            organisationKeyID: PricingSettingData.organisationKeyID,
          });
          // setEngagementObj({
          //   ...engagementObj,
          //   Payment_Frequency: PricingSettingData.paymentFrequencyID
          // })
        }
      }
      const QuoteData = await GetQuoteLookupList(common.organisationKeyID);
      // if (QuoteData.data.statusCode !== 200) {

      //   throw new Error("Failed to fetch Quote data");
      // }

      let mappedOptions1 = [];
      if (QuoteData !== undefined) {
        const data = QuoteData?.data;
        mappedOptions1 = data?.responseData?.data.map((item) => ({
          value: item.quoteKeyID,
          label: item.quoteName,
          quoteID: item.quoteID,
          clientID: item.clientID,
        }));
        setProposalLookUpOptions(mappedOptions1);
      }
      const selectedQuote = mappedOptions1.find(
        (item) => item.value === location.state?.QuoteKeyID,
      );
      // if (!selectedQuote) {
      //   throw new Error("Selected quote not found");
      // }
      setLoader(true);
      if (selectedQuote !== undefined) {
        await Promise.all([
          GetServicePackageLookupListData(selectedQuote?.value),
          GetOfficersForQuoteAndContractData({
            ClientKeyID: null,
            QuoteKeyID: selectedQuote?.value,
          }),
        ]);
      }

      setLoader(true);
      const response = await GetTemplateListLookupList({
        TemplateTypeID: 2,
        organisationKeyID: common.organisationKeyID,
        clientID: null,
        QuoteKeyID: selectedQuote?.value,
      });
      const TemplateData = response.data;
      // if (TemplateData.statusCode !== 200) {
      //   throw new Error("Failed to fetch Template data");
      // }
      let mappedOptions = [];
      if (TemplateData !== undefined) {
        mappedOptions = TemplateData.responseData.data.map((item) => ({
          value: item.templateKeyID,
          label: item.templateName,
          templateID: item.templateID,
        }));
        setTemplateLookUpOptions(mappedOptions);
      }

      const isSelectedDefault = TemplateData?.responseData?.data?.find(
        (item) => item.isDefault === true,
      );
      // if (!isSelectedDefault) {
      //   throw new Error("Default template not found");
      // }
      setLoader(true);
      const TnCData = await GetTermsAndConditionsLookupList(
        common.organisationKeyID,
      );
      // if (TnCData.data.statusCode !== 200) {
      //   throw new Error("Failed to fetch Terms and Conditions data");
      // }
      const TnCTypeData = TnCData.data.responseData.data.map((item) => ({
        value: item.templateKeyID,
        label: item.templateName,
        templateID: item.templateID,
        isDefault: item.isDefault,
      }));
      setTnCLookupList(TnCTypeData);

      const isSelectedTnCDefault = TnCTypeData.find(
        (item) => item.isDefault === true,
      );
      // if (!isSelectedTnCDefault) {
      //   throw new Error("Default TnC not found");
      // }
      setLoader(true);
      const TnCModelData = await GetTermsAndConditionsModel(
        isSelectedTnCDefault?.value,
      );
      // if (TnCModelData.data.statusCode !== 200) {
      //   throw new Error("Failed to fetch TnC Model data");
      // }
      let pdf = null;
      let htmlContent = null;
      if (TnCModelData !== undefined) {
        pdf = TnCModelData.data.responseData.data.pdf;
        htmlContent =
          TnCModelData.data.responseData.data.templateElementList[0]
            ?.htmlContent;
      }

      setEngagementObj({
        ...engagementObj,
        selectSourceId: 2,
        pdf: pdf,
        tnCTemplateContent: htmlContent,
        tnCTemplateKeyID: isSelectedTnCDefault?.value,
        tnCTemplateID: isSelectedTnCDefault?.templateID,
        QuoteKeyID: selectedQuote?.value,
        quoteID: selectedQuote?.quoteID,
        ClientID: selectedQuote?.clientID,
        templateID: isSelectedDefault?.templateID,
        templateKeyID: isSelectedDefault?.templateKeyID,
        Payment_Frequency: PricingSettingData.paymentFrequencyID,
      });
      setTopbar("none");
      allApisCompleted = true;
    } catch (error) {
      console.error("Error fetching data:", error);
      // Handle error here
    } finally {
      if (allApisCompleted) {
        setLoader(false);
      }
    }
  };

  //38) hide tab when change value previous tab function
  const DisableTabOnChange = () => {
    if (activeTab == EngagementLetterHeader.BasicInformation) {
      setIsValidForm({
        ...isValidForm,
        BasicForm: false,
        SelectService: false,
        AdditionalInfo: false,
        PricingInfo: false,
        previewEngagement: false,
      });
    } else if (activeTab == EngagementLetterHeader.SelectServices) {
      setIsValidForm({
        ...isValidForm,
        SelectService: false,
        AdditionalInfo: false,
        PricingInfo: false,
        previewEngagement: false,
      });
    } else if (activeTab == EngagementLetterHeader.AdditionalInformation) {
      setIsValidForm({
        ...isValidForm,
        AdditionalInfo: false,
        PricingInfo: false,
        previewEngagement: false,
      });
    } else if (activeTab == EngagementLetterHeader.ReviewServices) {
      setIsValidForm({
        ...isValidForm,
        PricingInfo: false,
        previewEngagement: false,
      });
    }
  };

  const GetPaymentGatewayModelData = async (id) => {
    if (!id) {
      return;
    }
    try {
      const data = await GetPaymentGatewayModel(id);

      if (data?.data?.statusCode === 200) {
        if (data?.data?.responseData?.data) {
          const ModelData = data?.data?.responseData?.data;
          setPaymentGatewayObj({
            ...paymentGatewayObj,
            // keyID: ModelData.KeyID,
            userKeyID: common.userKeyID,
            goCardlessAccessToken: ModelData.goCardlessAccessToken,
            stripePublishableKey: ModelData.stripePublishableKey,
            stripeSecretKey: ModelData.stripeSecretKey,
            organisationKeyID: ModelData.organisationKeyID,
            bankTransferName: ModelData.bankTransferName,
            AccountNumber: ModelData.accountNumber,
            PaymentGatewayID: ModelData.defaultPaymentGatewayID,
            sortCode: ModelData.authenticationCode
              ? ModelData.authenticationCode.replace(/(\d{2})(?=\d)/g, "$1-")
              : "",
          });
          updateProposalObject({
            paymentGatewayID:
              ModelData.defaultPaymentGatewayID === null
                ? 1
                : ModelData.defaultPaymentGatewayID === 1
                  ? 4
                  : ModelData.defaultPaymentGatewayID,
          });
        }
      } else {
        setErrorMessage(data?.data?.errorMessage);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const GetSingleDefaultDiscountPercentageOfPackages = (
    packageOneDiscountPercentage,
    packageTwoDiscountPercentage,
    packageThreeDiscountPercentage,
  ) => {
    let DefaultDiscount = null;
    if (
      packageOneDiscountPercentage < 0 ||
      packageTwoDiscountPercentage < 0 ||
      packageThreeDiscountPercentage < 0
    ) {
      DefaultDiscount = -0.01;
    } else if (
      packageOneDiscountPercentage > 0 ||
      packageTwoDiscountPercentage > 0 ||
      packageThreeDiscountPercentage > 0
    ) {
      DefaultDiscount = 1.0;
    }
    return DefaultDiscount;
  };
  const showModalRecordsAvailable = (message, driverNamesSet) => {
    setModelRequestData({
      ...modelRequestData,
      Action: "LargePriceValueWarning",
      message: message,
      DriverName: driverNamesSet,
    });
    $("#" + "RecordsAvailablePopupModel").modal("show");
  };
  return (
    <div>
      <div className="container-fluid">
        <div>
          <div className="row form-row">
            <div className="col-12">
              <h3 class="modal-title">
                <BackButtonSvg onClick={handleCancel} />
                {location?.state?.Action === null
                  ? getCrudPopUpTitleName("Add", EngagementName)
                  : getCrudPopUpTitleName("Update", EngagementName)}
              </h3>
              {/* <h3 class="modal-title">{modelAction === "Add" ? `Add Engagement Letter ` : `Edit Engagement Letter `}: {location.state.clientName}</h3> */}
              <div
                className="steps overflow-auto"
                style={{ pointerEvents: "all" }}
              >
                <ul className="steps-list">
                  <li>
                    <div
                      id="ELBasicInformationDiv"
                      onClick={() =>
                        handleClickOnTabChange(1, "ELBasicInformationDiv")
                      }
                      class={`${
                        activeTab === EngagementLetterHeader.BasicInformation
                          ? "step tab-field-center"
                          : isValidForm.BasicForm === true
                            ? "step tab-field-center"
                            : "step disabled cursor-not-allowed tab-field-center"
                      } w-90`}
                    >
                      <span class="stepCount">1</span>
                      <span class="stepTitle">Basic Information</span>
                      &nbsp;
                      {activeTab == EngagementLetterHeader.BasicInformation &&
                        requireMessage && (
                          <span className="validation">
                            <InvalidFormIcon />
                          </span>
                        )}
                    </div>
                  </li>
                  {(engagementObj.selectSourceId === 1 ||
                    engagementObj.selectSourceId === 3) && (
                    <li>
                      <div
                        id="ELSelectServiceDiv"
                        onClick={() =>
                          handleClickOnTabChange(2, "ELSelectServiceDiv")
                        }
                        class={`${
                          activeTab === EngagementLetterHeader.SelectServices
                            ? "step tab-field-center"
                            : isValidForm.BasicForm === true
                              ? "step tab-field-center"
                              : "step disabled cursor-not-allowed tab-field-center"
                        } w-90`}
                      >
                        <span class="stepCount">2</span>
                        <span class="stepTitle">Select Services</span>
                        {activeTab == EngagementLetterHeader.SelectServices &&
                          requireMessage && (
                            <span className="validation">
                              <InvalidFormIcon />
                            </span>
                          )}
                      </div>
                    </li>
                  )}
                  <li>
                    <div
                      id="ELAdditionalInformationDiv"
                      onClick={() =>
                        handleClickOnTabChange(3, "ELAdditionalInformationDiv")
                      }
                      class={`${
                        activeTab ===
                        EngagementLetterHeader.AdditionalInformation
                          ? "step tab-field-center"
                          : isValidForm.SelectService === true
                            ? "step tab-field-center"
                            : "step disabled cursor-not-allowed tab-field-center"
                      } w-90`}
                    >
                      <span class="stepCount">
                        {engagementObj.selectSourceId === 1 ||
                        engagementObj.selectSourceId === 3
                          ? "3"
                          : "2"}
                      </span>
                      <span class="stepTitle">Additional Information</span>
                      {activeTab ==
                        EngagementLetterHeader.AdditionalInformation &&
                        requireMessage && (
                          <span className="validation">
                            <InvalidFormIcon />
                          </span>
                        )}
                    </div>
                  </li>
                  {engagementObj.selectSourceId !== 3 &&
                    !(
                      engagementObj.selectSourceId === 2 &&
                      engagementObj.quoteTypeID === 4
                    ) && (
                      <li>
                        <div
                          id="ELReviewServiceDiv"
                          onClick={() =>
                            handleClickOnTabChange(4, "ELReviewServiceDiv")
                          }
                          class={`${
                            activeTab === EngagementLetterHeader.ReviewServices
                              ? "step tab-field-center"
                              : isValidForm.AdditionalInfo === true
                                ? "step tab-field-center"
                                : "step disabled cursor-not-allowed tab-field-center"
                          } w-90`}
                        >
                          <span class="stepCount">
                            {engagementObj.selectSourceId === 1 ? "4" : "3"}
                          </span>
                          <span class="stepTitle">Review Services</span>
                          {activeTab == EngagementLetterHeader.ReviewServices &&
                            requireMessage && (
                              <span className="validation">
                                <InvalidFormIcon />
                              </span>
                            )}
                        </div>
                      </li>
                    )}
                  {engagementObj.selectSourceId === 3 && (
                    <li>
                      <div
                        id="ReviewPackage1"
                        onClick={() => HandleBack(7, "ReviewPackage1")}
                        class={`${
                          activeTab === EngagementLetterHeader.ReviewPackages
                            ? "step tab-field-center"
                            : isValidForm.ReviewPackages === true
                              ? "step tab-field-center"
                              : "step disabled cursor-not-allowed tab-field-center"
                        } w-90`}
                      >
                        <span class="stepCount">{TabHide ? 5 : 4}</span>
                        <span class="stepTitle">Review Packages</span>
                        &nbsp;
                        {activeTab == EngagementLetterHeader.ReviewPackages &&
                          requireMessage && (
                            <span className="validation">
                              <InvalidFormIcon />
                            </span>
                          )}
                      </div>
                    </li>
                  )}
                  <li>
                    <div
                      id="ELPreviewDiv"
                      onClick={() => handleClickOnTabChange(5, "ELPreviewDiv")}
                      class={`${
                        activeTab === EngagementLetterHeader.Preview
                          ? "step tab-field-center"
                          : isValidForm.PricingInfo === true
                            ? "step tab-field-center"
                            : "step disabled cursor-not-allowed tab-field-center"
                      } w-90`}
                    >
                      <span class="stepCount">
                        {engagementObj.selectSourceId === 1 ||
                        engagementObj.selectSourceId === 3
                          ? "5"
                          : engagementObj.selectSourceId === 2 &&
                              engagementObj.quoteTypeID === 4
                            ? "3"
                            : "4"}
                      </span>
                      <span class="stepTitle">Preview</span>
                      {activeTab == EngagementLetterHeader.Preview &&
                        requireMessage && (
                          <span className="validation">
                            <InvalidFormIcon />
                          </span>
                        )}
                    </div>
                  </li>
                </ul>
              </div>
              {activeTab === EngagementLetterHeader.BasicInformation && (
                <BasicInformationComponent
                  ClientValue={ClientValue}
                  DisableTabOnChange={DisableTabOnChange}
                  SelectSourceValue={SelectSourceValue}
                  TemplateValue={TemplateValue}
                  hasHyphenAfterNumber={hasHyphenAfterNumber}
                  updatedData={updatedData}
                  handleChangeSourceType={handleChangeSourceType}
                  engagementObj={engagementObj}
                  formatValue={formatValue}
                  EngagementName={EngagementName}
                  proposalName={proposalName}
                  setEngagementObj={setEngagementObj}
                  requireMessage={requireMessage}
                  getServicePackageLookupList={getServicePackageLookupList}
                  SelectPackagesTypeValue={SelectPackagesTypeValue}
                  handleChangePackage={handleChangePackage}
                  handleChangeClient={handleChangeClient}
                  handleChangeProposal={handleChangeProposal}
                  SelectProposalTypeValue={SelectProposalTypeValue}
                  clientLookUpOptions={clientLookUpOptions}
                  templateLookUpOptions={templateLookUpOptions}
                  proposalLookUpOptions={proposalLookUpOptions}
                  handleCancel={handleCancel}
                  HandleTabChange={HandleTabChange}
                  getCrudButtonTextName={getCrudButtonTextName}
                  getCrudPopUpTitleName={getCrudPopUpTitleName}
                  Validation={Validation}
                  common={common}
                  setIsValidForm={setIsValidForm}
                  setValidation={setValidation}
                  prospectName={prospectName}
                  GetTemplateLookupListData={GetTemplateLookupListData}
                  setTemplateElementList={setTemplateElementList}
                  setIsTemplateManuallySelected={setIsTemplateManuallySelected}
                  setHeaderContent={setHeaderContent}
                  setFooterContent={setFooterContent}
                  setHeaderImage={setHeaderImage}
                  setFooterImage={setFooterImage}
                  setHeaderHeight={setHeaderHeight}
                  setFooterHeight={setFooterHeight}
                  setFontFamily={setFontFamily}
                  getFontNameById={getFontNameById}
                  setShowSeparatorLines={setShowSeparatorLines}
                  setStatementOfFactsObj={setStatementOfFactsObj}
                  setServiceDescriptionObj={setServiceDescriptionObj}
                  updateVisibleFieldsFromIds={updateVisibleFieldsFromIds}
                  setOrientationID={setOrientationID}
                />
              )}
              {activeTab === EngagementLetterHeader.SelectServices && (
                <Suspense>
                  <SelectServices
                    DisableTabOnChange={DisableTabOnChange}
                    oneOffObj={oneOffObj}
                    requireMessage={requireMessage}
                    setOneOffObj={setOneOffObj}
                    recurringObj={recurringObj}
                    formatValue={formatValue}
                    setOneOffPricingInfo={setOneOffPricingInfo}
                    OneOffPricingInfo={OneOffPricingInfo}
                    setRecurringPricingInfo={setRecurringPricingInfo}
                    setRecurringFrequencyPricingInfo={
                      setRecurringFrequencyPricingInfo
                    }
                    hasHyphenAfterNumber={hasHyphenAfterNumber}
                    RecurringFrequencyPricingInfo={
                      RecurringFrequencyPricingInfo
                    }
                    RecurringPricingInfo={RecurringPricingInfo}
                    setRecurringObj={setRecurringObj}
                    recurringServiceList={recurringServiceList}
                    setRecurringServiceList={setRecurringServiceList}
                    setOneOffServiceList={setOneOffServiceList}
                    oneOffServiceList={oneOffServiceList}
                    recurringError={recurringError}
                    moduleName={"Contract"}
                    setRecurringError={setRecurringError}
                    getCrudButtonTextName={getCrudButtonTextName}
                    getCrudPopUpTitleName={getCrudPopUpTitleName}
                    HandleTabChange={HandleTabChange}
                    handleCancel={handleCancel}
                    HandleBack={HandleBack}
                  />
                </Suspense>
              )}
              {activeTab === EngagementLetterHeader.AdditionalInformation && (
                <Suspense>
                  <AdditionalInformation
                    DisableTabOnChange={DisableTabOnChange}
                    HandleTabChange={HandleTabChange}
                    HandleBack={HandleBack}
                    isDuplicateEmail={isDuplicateEmail}
                    engagementObj={engagementObj}
                    emailError={emailError}
                    hasHyphenAfterNumber={hasHyphenAfterNumber}
                    setEmailError={setEmailError}
                    setEngagementObj={setEngagementObj}
                    SignaturePositionValue={SignaturePositionValue}
                    AddSignatory={AddSignatory}
                    deleteSignatory={deleteSignatory}
                    requireMessage={requireMessage}
                    TnCLookupList={TnCLookupList}
                    handleContentChange={handleContentChange}
                    SelectTnCTemplateValue={SelectTnCTemplateValue}
                    handleSelectTncTemplate={handleSelectTncTemplate}
                    additionalInformationList={additionalInformationList}
                    setAdditionalInformationList={setAdditionalInformationList}
                    recurringError={recurringError}
                    moduleName={"Contract"}
                    contractSignatoriesList={contractSignatoriesList}
                    setContractSignatoriesList={setContractSignatoriesList}
                    getCrudButtonTextName={getCrudButtonTextName}
                    getCrudPopUpTitleName={getCrudPopUpTitleName}
                    handleCancel={handleCancel}
                  />
                </Suspense>
              )}
              {activeTab === EngagementLetterHeader.ReviewPackages && (
                <ReviewPackagesComponent
                  DisableTabOnChange={DisableTabOnChange}
                  getValidationMessage={getValidationMessage}
                  GetSingleDefaultDiscountPercentageOfPackages={
                    GetSingleDefaultDiscountPercentageOfPackages
                  }
                  paymentGatewayObj={paymentGatewayObj}
                  hasHyphenAfterNumber={hasHyphenAfterNumber}
                  setDisableCondition={setDisableCondition}
                  GetTwoDecimalValueWithoutRoundOff={
                    GetTwoDecimalValueWithoutRoundOff
                  }
                  disableCondition={disableCondition}
                  handleCancelBtn={handleCancel}
                  HandleTabChange={HandleTabChange}
                  setContractAdditionalServices={setContractAdditionalServices}
                  selectedPackagesDetails={selectedPackagesDetails}
                  setSelectedPackagesDetails={setSelectedPackagesDetails}
                  engagementObj={engagementObj}
                  setEngagementObj={setEngagementObj}
                  currencyID={currencyID}
                  currencySymbol={currencySymbol}
                  taxName={taxName}
                  setOneOffPricingInfoCopy={setOneOffPricingInfoCopy}
                  TabHide={TabHide}
                  common={common}
                  requireMessage={requireMessage}
                  pricingSettingObj={pricingSettingObj}
                  setPricingSettingObj={setPricingSettingObj}
                  proposalName={proposalName}
                  vatPercentage={vatPercentage}
                  setVATPercentage={setVATPercentage}
                  selectedRecurringServiceList={selectedRecurringServiceList}
                  setSelectedRecurringServiceList={
                    setSelectedRecurringServiceList
                  }
                  lastPaymentFrequencyAndDiscountedPriceForPreview={
                    lastPaymentFrequencyAndDiscountedPriceForPreview
                  }
                  formatValue={formatValue}
                  setLastPaymentFrequencyAndDiscountedPriceForPreview={
                    setLastPaymentFrequencyAndDiscountedPriceForPreview
                  }
                  setLastPaymentFrequencyAndDiscountedPriceForPreviewForoneoff={
                    setLastPaymentFrequencyAndDiscountedPriceForPreviewForOneOff
                  }
                  lastPaymentFrequencyAndDiscountedPriceForPreviewForoneoff={
                    lastPaymentFrequencyAndDiscountedPriceForPreviewForOneOff
                  }
                  setSelectedOneOffServiceList={setSelectedOneOffServiceList}
                  selectedOneOffServiceList={selectedOneOffServiceList}
                  GetTemplateModalData={GetTemplateModalData}
                  RecurringPricingInfo={RecurringPricingInfo}
                  setRecurringPricingInfo={setRecurringPricingInfo}
                  OneOffPricingInfo={OneOffPricingInfo}
                  OneOffPricingInfoCopy={OneOffPricingInfoCopy}
                  setOneOffPricingInfo={setOneOffPricingInfo}
                  HandleBack={HandleBack}
                  selectedPackagesList={selectedPackagesList}
                  setRecurringFrequencyPricingInfo={
                    setRecurringFrequencyPricingInfo
                  }
                  isModalOpen={isModalOpen}
                  setISModalOpen={setISModalOpen}
                  RecurringFrequencyPricingInfo={RecurringFrequencyPricingInfo}
                  selectedRecurringServiceListCopy={
                    selectedRecurringServiceListCopy
                  }
                  setSelectedRecurringServiceListCopy={
                    setSelectedRecurringServiceListCopy
                  }
                  setStatementOfFactsHTML={setStatementOfFactsHTML}
                  statementOfFactsHTML={statementOfFactsHTML}
                  setServiceDescriptionHTML={setServiceDescriptionHTML}
                  serviceDescriptionHTML={serviceDescriptionHTML}
                  serviceDescriptionObj={serviceDescriptionObj}
                  statementOfFactsObj={statementOfFactsObj}
                  formatValueWithoutCurrencySymbol={
                    formatValueWithoutCurrencySymbol
                  }
                  setShowSelectTemplateModal={setShowSelectTemplateModal}
                  setSelectedTemplateID={setSelectedTemplateID}
                  setSelectedTemplateIDOneOff={setSelectedTemplateIDOneOff}
                  serviceTypeID={serviceTypeID} //1 for recurring and 2 for one-off
                  setServiceTypeID={setServiceTypeID}
                  visibleFieldsCustomTemp={visibleFieldsCustomTemp}
                  setVisibleFieldsCustomTemp={setVisibleFieldsCustomTemp}
                  selectedTemplateID={selectedTemplateID}
                />
              )}
              {activeTab === EngagementLetterHeader.ReviewServices && (
                <ReviewServicesComponent
                  DisableTabOnChange={DisableTabOnChange}
                  HandleTabChange={HandleTabChange}
                  engagementObj={engagementObj}
                  setEngagementObj={setEngagementObj}
                  handleCancel={handleCancel}
                  HandleBack={HandleBack}
                  proposalName={proposalName}
                  paymentGatewayObj={paymentGatewayObj}
                  currencyID={currencyID}
                  currencySymbol={currencySymbol}
                  taxName={taxName}
                  isMobile={isMobile}
                  hasHyphenAfterNumber={hasHyphenAfterNumber}
                  setVATPercentage={setVATPercentage}
                  vatPercentage={vatPercentage}
                  pricingSettingObj={pricingSettingObj}
                  setPricingSettingObj={setPricingSettingObj}
                  requireMessage={requireMessage}
                  selectedRecurringServiceList={selectedRecurringServiceList}
                  selectedOneOffServiceList={selectedOneOffServiceList}
                  selectedRecurringServiceListCopy={
                    selectedRecurringServiceListCopy
                  }
                  setSelectedOneOffServiceList={setSelectedOneOffServiceList}
                  setSelectedRecurringServiceList={
                    setSelectedRecurringServiceList
                  }
                  setSelectedRecurringServiceListCopy={
                    setSelectedRecurringServiceListCopy
                  }
                  formatValue={formatValue}
                  disableCondition={disableCondition}
                  setDisableCondition={setDisableCondition}
                  RecurringPricingInfo={RecurringPricingInfo}
                  setRecurringPricingInfo={setRecurringPricingInfo}
                  setRecurringFrequencyPricingInfo={
                    setRecurringFrequencyPricingInfo
                  }
                  GetTwoDecimalValueWithoutRoundOff={
                    GetTwoDecimalValueWithoutRoundOff
                  }
                  isModalOpen={isModalOpen}
                  setISModalOpen={setISModalOpen}
                  RecurringFrequencyPricingInfo={RecurringFrequencyPricingInfo}
                  OneOffPricingInfo={OneOffPricingInfo}
                  OneOffPricingInfoCopy={OneOffPricingInfoCopy}
                  getCrudButtonTextName={getCrudButtonTextName}
                  getCrudPopUpTitleName={getCrudPopUpTitleName}
                  setOneOffPricingInfo={setOneOffPricingInfo}
                  setOneOffPricingInfoCopy={setOneOffPricingInfoCopy}
                  setStatementOfFactsHTML={setStatementOfFactsHTML}
                  statementOfFactsHTML={statementOfFactsHTML}
                  setServiceDescriptionHTML={setServiceDescriptionHTML}
                  serviceDescriptionHTML={serviceDescriptionHTML}
                  serviceDescriptionObj={serviceDescriptionObj}
                  statementOfFactsObj={statementOfFactsObj}
                  formatValueWithoutCurrencySymbol={
                    formatValueWithoutCurrencySymbol
                  }
                  setShowSelectTemplateModal={setShowSelectTemplateModal}
                  setSelectedTemplateID={setSelectedTemplateID}
                  selectedTemplateID={selectedTemplateID}
                  setSelectedTemplateIDOneOff={setSelectedTemplateIDOneOff}
                  serviceTypeID={serviceTypeID} //1 for recurring and 2 for one-off
                  setServiceTypeID={setServiceTypeID}
                  visibleFieldsCustomTemp={visibleFieldsCustomTemp}
                  setVisibleFieldsCustomTemp={setVisibleFieldsCustomTemp}
                />
              )}
              <Suspense>
                <PricingTableTemplatesModal
                  show={showSelectTemplateModal}
                  onHide={() => setShowSelectTemplateModal(false)}
                  setSelectedTemplateID={setSelectedTemplateID}
                  setSelectedTemplateIDOneOff={setSelectedTemplateIDOneOff}
                  selectedTemplateID={selectedTemplateID}
                  selectedTemplateIDOneOff={selectedTemplateIDOneOff}
                  serviceTypeID={serviceTypeID} //1 for recurring and 2 for one-off
                  selectedRecurringServiceList={selectedRecurringServiceList}
                  setSelectedRecurringServiceList={
                    setSelectedRecurringServiceList
                  }
                  RecurringPricingInfo={RecurringPricingInfo}
                  ProposalObject={engagementObj}
                  formatValue={formatValue}
                  vatPercentage={vatPercentage}
                  selectedOneOffServiceList={selectedOneOffServiceList}
                  OneOffPricingInfo={OneOffPricingInfo}
                  selectedPackagesList={selectedPackagesList}
                  getValidationMessage={getValidationMessage}
                  requireMessage={requireMessage}
                  pricingSettingObj={pricingSettingObj}
                  setSelectedOneOffServiceList={setSelectedOneOffServiceList}
                  hasHyphenAfterNumber={hasHyphenAfterNumber}
                  GetSingleDefaultDiscountPercentageOfPackages={
                    GetSingleDefaultDiscountPercentageOfPackages
                  }
                  setRecurringPricingInfo={setRecurringPricingInfo}
                  setRecurringFrequencyPricingInfo={
                    setRecurringFrequencyPricingInfo
                  }
                  RecurringFrequencyPricingInfo={RecurringFrequencyPricingInfo}
                  OneOffPricingInfoCopy={OneOffPricingInfoCopy}
                  setOneOffPricingInfoCopy={setOneOffPricingInfoCopy}
                  setOneOffPricingInfo={setOneOffPricingInfo}
                  setVisibleFieldsCustomTemp={setVisibleFieldsCustomTemp}
                  visibleFieldsCustomTemp={visibleFieldsCustomTemp}
                  vatPercentage={vatPercentage}
                  currencyID={currencyID}
                  taxName={taxName}
                  currencySymbol={currencySymbol}
                />
              </Suspense>
              {activeTab === EngagementLetterHeader.Preview && (
                <Suspense>
                  <PreviewComponentPdf
                    isDefaultFirstPage={isDefaultFirstPage}
                    common={common}
                    setRequireMessage={setRequireMessage}
                    DocumentCode={DocumentCode}
                    BrandColor={BrandColor}
                    Logo={CompanyLogo}
                    fontFamily={fontFamily}
                    fontSize={fontSize}
                    selectedPackages={
                      engagementObj.selectSourceId === 3 ||
                      engagementObj.selectSourceId === 4
                        ? [engagementObj.acceptedServicePackageID]
                        : null
                    }
                    formatValueWithoutCurrencySymbol={
                      formatValueWithoutCurrencySymbol
                    }
                    formatValueWithoutCurrencySymbol_v1={
                      formatValueWithoutCurrencySymbol_v1
                    }
                    selectedPackagesList={selectedPackagesList}
                    lastPaymentFrequencyAndDiscountedPriceForPreview={
                      lastPaymentFrequencyAndDiscountedPriceForPreview
                    }
                    formatValue={formatValue}
                    setLastPaymentFrequencyAndDiscountedPriceForPreview={
                      setLastPaymentFrequencyAndDiscountedPriceForPreview
                    }
                    setLastPaymentFrequencyAndDiscountedPriceForPreviewForoneoff={
                      setLastPaymentFrequencyAndDiscountedPriceForPreviewForOneOff
                    }
                    lastPaymentFrequencyAndDiscountedPriceForPreviewForoneoff={
                      lastPaymentFrequencyAndDiscountedPriceForPreviewForOneOff
                    }
                    currencyID={currencyID}
                    currencySymbol={currencySymbol}
                    taxName={taxName}
                    RecurringPricingInfo={RecurringPricingInfo}
                    OneOffPricingInfo={OneOffPricingInfo}
                    vatPercentage={vatPercentage}
                    DiscountLines={engagementObj.DiscountLines}
                    updatedTnCData={updatedTnCData}
                    selectedRecurringServiceList={selectedRecurringServiceList}
                    selectedOneOffServiceList={selectedOneOffServiceList}
                    templateElementList={templateElementList}
                    additionalInformationList={additionalInformationList}
                    // engagementObj={engagementObj}
                    pdf={engagementObj.pdf}
                    ProposalObject={engagementObj}
                    getCrudButtonTextName={getCrudButtonTextName}
                    getCrudPopUpTitleName={getCrudPopUpTitleName}
                    organisationData={organisationData}
                    setEngagementObj={setEngagementObj}
                    quoteAdditionalInfoGlobalPricingDriver={
                      quoteAdditionalInfoGlobalPricingDriver
                    }
                    setServicePackageName={setServicePackageName}
                    servicePackageName={servicePackageName}
                    moduleName={"Contract"}
                    feeTypeId={engagementObj.feeTypeId}
                    HandleBack={HandleBack}
                    MergePdfUrl={MergePdfUrl}
                    setMergePdfUrl={setMergePdfUrl}
                    handleSaveAsDraft={HandleTabChange}
                    HandleTabChange={HandleTabChange}
                    handleCancelBtn={handleCancel}
                    requireMessage={requireMessage}
                    contractSignatoriesList={contractSignatoriesList}
                    headerContent={headerContent}
                    footerContent={footerContent}
                    headerImage={headerImage}
                    footerImage={footerImage}
                    headerHeight={headerHeight}
                    footerHeight={footerHeight}
                    watermarkImage={watermarkImage}
                    showSeparatorLines={showSeparatorLines}
                    serviceDescriptionHTML={serviceDescriptionHTML}
                    statementOfFactsHTML={statementOfFactsHTML}
                    selectedTemplateIDOneOff={selectedTemplateIDOneOff}
                    selectedTemplateID={selectedTemplateID}
                    visibleFieldsCustomTemp={visibleFieldsCustomTemp}
                    headerFooterFirstPage={headerFooterFirstPage}
                    headerFooterLastPage={headerFooterLastPage}
                  />
                </Suspense>
              )}
            </div>
          </div>
        </div>
      </div>
      <ViewPlan
        moduleName={"Contract"}
        showModal={showModal}
        handleCloseModel={handleCloseModel}
        setShowModal={setShowModal}
        activeOrganizationKeyId={common.organisationKeyID}
      />
      <SuccessModal
        handleClose={handleClose}
        setOpenSuccessModal={setOpenSuccessModal}
        openSuccessModal={openSuccessModal}
        modelAction={modelAction}
        message={EngagementName}
        refIdStore={refIdStore}
      />
      <ErrorModel
        ErrorModel={openErrorModal}
        emailError={emailError}
        handleClose={handleCloseErrorModel}
        ErrorMessage={errorMessage}
      />
      <RecordsAvailablePopupModel
        handleClose={handleClose}
        openErrorModal={openErrorModal}
        openSuccessModal={openSuccessModal}
        modelRequestData={modelRequestData}
      />
      <PricingModel
        class="modal fade"
        id="pricingModel"
        tabindex="-1"
        aria_labelledby="pricingModel"
        aria_hidden="true"
        paymentFrequencyID={pricingSettingObj.PaymentFrequency}
        isAddUpdatePricingActionDone={isAddUpdatePricingActionDone}
        setIsAddUpdatePricingActionDone={setIsAddUpdatePricingActionDone}
      />
      <PaymentGatewayModel
        class="modal fade"
        id="paymentGatewayModel"
        tabindex="-1"
        aria_labelledby="paymentGatewayModel"
        aria_hidden="true"
        isModalOpen={isModalOpen}
        setISModalOpen={setISModalOpen}
        isAddUpdatePricingActionDone={isAddUpdatePricingActionDone}
        setIsAddUpdatePricingActionDone={setIsAddUpdatePricingActionDone}
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

export default Add_Update_Engagement_Letter;
