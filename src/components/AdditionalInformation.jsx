import React, { useContext, useEffect, useRef, useState } from "react";
import Select from "react-select";
import { ERROR_MESSAGES } from "./GlobalMessage";
import { Util } from "reactstrap";
import Utils from "../Middleware/Utils";
import { AuthContextProvider } from "../AuthContext/AuthContext";
import { Tooltip } from "@mui/material";
import Text_Editor from "./Text_Editor";
import { statusID } from "../Middleware/enums";
import DatePicker from "react-datepicker";
import { parse, isValid, format, isAfter, isBefore, isEqual } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import "react-calendar/dist/Calendar.css";
import dayjs from "dayjs";

const AdditionalInformation = (props) => {
  useEffect(() => {
    if (
      !props.additionalInformationList ||
      props.additionalInformationList.length === 0
    ) {
      return;
    }

    props.additionalInformationList.forEach((info) => {
      if (info.driverTypeID === 6 && info.enteredDate) {
        // Try to parse the entered date using its format (or fallback to default)
        const formatToUse =
          info.enteredDateFormat || info.date?.[0]?.dateFormat || "dd-MM-yyyy";
        const parsedDate = parseStoredDate(info.enteredDate, formatToUse);

        // If the parsed date is valid, trigger the main handler
        if (parsedDate) {
          // setTimeout is used to safely run it after render
          setTimeout(() => {
            HandleDateDriver(parsedDate, info.globalPricingDriverID);
          }, 0);
        }
      }
    });
  }, []);

  const moduleNameForSaveAsDraft = "AdditionalInformation";
  const { isValidEmail, isMobile, formatName } =
    useContext(AuthContextProvider);
  const [SignaturePositionValue, setSignaturePositionValue] = useState(
    (props.moduleName == "Contract" &&
      props?.contractSignatoriesList[0]?.signaturePositionID) ||
      1,
  );
  const HandleAdditionalInformation = (
    value,
    globalPricingDriverID,
    variationID,
    prevId,
  ) => {
    let formattedInput;
    props.DisableTabOnChange();
    if (value.variationValue === undefined) {
      const inputValue = value;
      // Allow only numeric and dot characters, limit to 7 characters
      const sanitizedInput = inputValue?.replace(/[^0-9.]/g, "")?.slice(0, 15);

      // Split the input into integer and decimal parts
      const [integerPart, decimalPart] = sanitizedInput.split(".");
      const formattedIntegerPart = integerPart;

      // Combine integer and decimal parts with appropriate precision
      formattedInput =
        decimalPart !== undefined
          ? `${formattedIntegerPart.slice(0, 11)}.${decimalPart.slice(0, 2)}`
          : formattedIntegerPart.slice(0, 11);
    }
    const variationMatches = prevId?.variation?.map((i) => i.variationID);
    const updateAdditionalInformationList = props.additionalInformationList.map(
      (additionalInformation) => {
        if (
          additionalInformation.globalPricingDriverID ===
            globalPricingDriverID &&
          variationID === undefined &&
          value.variationValue !== undefined
        ) {
          const updatedSlab = additionalInformation.slab.map((slab) => ({
            ...slab,
            isDefault: slab.slabID === value.value ? true : false,
          }));
          return {
            ...additionalInformation,
            slab: updatedSlab,
            driverValue:
              additionalInformation.slab
                .filter(
                  (Slab) => Slab.slabID == value.value && Slab.slabTypeID == 1,
                )
                .map((slabsValue) => slabsValue.slabValue)
                .join(", ") || null,
            // value.variationValue === undefined ? value : value.variationValue,
          };
        }
        if (
          additionalInformation.globalPricingDriverID ===
            globalPricingDriverID &&
          variationID !== null &&
          value.variationValue !== undefined
        ) {
          const updatedVariations = additionalInformation.variation.map(
            (variation) => ({
              ...variation,
              isDefault: variation.variationID === value.value ? true : false,
            }),
          );
          return {
            ...additionalInformation,
            variation: updatedVariations,
            driverValue: additionalInformation.variation
              .filter((variation) => variation.variationID === value.value)
              .map((varValue) => varValue.variationValue)
              .join(", "),
          };
        }
        if (
          additionalInformation.globalPricingDriverID ===
            globalPricingDriverID &&
          value.variationValue === undefined
        ) {
          return {
            ...additionalInformation,
            driverValue: formattedInput.replace(/-/g, (match, index) =>
              index === 0 ? match : "",
            ),
          };
        }
        if (additionalInformation.dependsOnVariationID === variationID) {
          return {
            ...additionalInformation,
            driverVisibility: true,
          };
        } else if (
          variationMatches?.includes(additionalInformation.dependsOnVariationID)
        ) {
          return {
            ...additionalInformation,
            driverVisibility: false,
            driverValue: null,
          };
        }

        return additionalInformation;
      },
    );
    props.setAdditionalInformationList(updateAdditionalInformationList);
  };

  const OnIncrementalValueChange = (slabObject, slabValue) => {
    props.DisableTabOnChange();
    const inputValue = slabValue.replace(/[^0-9.-]/g, ""); // Allow only numeric, dot, comma, and hyphen characters

    const sanitizedInput = inputValue;
    // Split the input into integer and decimal parts
    const [integerPart, decimalPart] = sanitizedInput.split(".");
    // Combine integer and decimal parts with appropriate precision
    let formattedInput;
    if (decimalPart !== undefined) {
      if (integerPart.includes("-")) {
        // For negative values, ensure 5 digits after the negative sign
        formattedInput = `-${integerPart.slice(
          1,
          13,
        )}.${decimalPart.slice(0, 2)}`;
      } else {
        // For positive values, limit to 5 digits before the decimal point
        formattedInput = `${integerPart.slice(
          0,
          12,
        )}.${decimalPart.slice(0, 2)}`;
      }
    } else {
      // No decimal part, limit to 5 digits
      formattedInput = integerPart.includes("-")
        ? `-${integerPart.slice(1, 13)}`
        : `${integerPart.slice(0, 12)}`;
    }
    const slabId = slabObject.slab
      .filter((item) => item.isDefault === true)
      .map((Id) => Id.slabID)[0];
    let updatedAdditionalInformationList = props.additionalInformationList.map(
      (Driver) => {
        if (Driver.slab?.some((slab) => slab.slabID === slabId)) {
          return {
            ...Driver,
            driverValue: formattedInput.replace(/-/g, (match, index) =>
              index === 0 ? match : "",
            ),
            slab: Driver.slab.map((slab) => {
              if (slab.slabID === slabId && slab.isDefault === true) {
                return {
                  ...slab,
                  slabValue: formattedInput.replace(/-/g, (match, index) =>
                    index === 0 ? match : "",
                  ), // Assuming formattedInput is your desired new value
                };
              }
              return slab; // Preserve other slabs
            }),
          };
        }
        return Driver; // Preserve Driver if no matching slabID found
      },
    );

    props.setAdditionalInformationList(updatedAdditionalInformationList);
  };

  const parseStoredDate = (dateStr, formatStr) => {
    if (!dateStr) return null;

    try {
      const parsed = parse(dateStr, formatStr, new Date());
      return isValid(parsed) ? parsed : null;
    } catch (err) {
      console.error("Invalid date string:", dateStr, "with format:", formatStr);
      return null;
    }
  };

  const getMinDate = (blocks, formatStr) => {
    if (!blocks?.length) return null;
    const firstBlock = blocks[0];
    const fromDate = firstBlock.fromDate
      ? parseStoredDate(firstBlock.fromDate, formatStr)
      : null;
    return fromDate instanceof Date && !isNaN(fromDate) ? fromDate : null;
  };

  const getMaxDate = (blocks, formatStr) => {
    if (!blocks?.length) return null;
    const lastBlock = blocks[blocks.length - 1];
    const toDate = lastBlock.toDate
      ? parseStoredDate(lastBlock.toDate, formatStr)
      : null;
    return toDate instanceof Date && !isNaN(toDate) ? toDate : null;
  };

  const HandleDateDriver = (selectedDate, globalPricingDriverID) => {
    props.DisableTabOnChange();

    const updatedList = props.additionalInformationList.map((info) => {
      if (info.globalPricingDriverID !== globalPricingDriverID) return info;

      const dateFormat = info.date?.[0]?.dateFormat || "dd-MM-yyyy";
      const formattedDate = format(selectedDate, dateFormat);
      const defaultValue = info.date?.[0]?.defaultDateValue;
      let matchedBlock = info.date.find((block) => {
        const from = block.fromDate
          ? parseStoredDate(block.fromDate, dateFormat)
          : null;
        const to = block.toDate
          ? parseStoredDate(block.toDate, dateFormat)
          : null;

        // Case 1: both from & to
        if (from && to) {
          return (
            (isEqual(selectedDate, from) || isAfter(selectedDate, from)) &&
            (isEqual(selectedDate, to) || isBefore(selectedDate, to))
          );
        }
        // Case 2: only from (open-ended future)
        if (from && !to) {
          return isEqual(selectedDate, from) || isAfter(selectedDate, from);
        }
        // Case 3: only to (open-ended past)
        if (!from && to) {
          return isEqual(selectedDate, to) || isBefore(selectedDate, to);
        }
        return false;
      });

      if (!matchedBlock) {
        matchedBlock = info.date.find((block) => block.isDefault === true);
      }

      if (!matchedBlock) {
        return {
          ...info,
          date: info.date.map((block) => ({
            ...block,
            enteredDate: null,
            isDefault: false,
          })),
          driverValue: 0,
          dateID: null,
          enteredDate: null,
          enteredDateFormat: null,
        };
      }

      const updatedDateBlocks = info.date.map((block) => ({
        ...block,
        isDefault: block.dateID === matchedBlock.dateID ? true : false,
        enteredDate:
          block.dateID === matchedBlock.dateID ? formattedDate : null,
      }));
      console.log(matchedBlock);
      const info1 = {
        ...info,
        date: updatedDateBlocks,
        driverValue:
          matchedBlock.dateValue ?? matchedBlock.defaultDateValue ?? 0,
        dateID: matchedBlock.dateID,
        enteredDate: formattedDate,
        enteredDateFormat: matchedBlock.dateFormat || dateFormat,
      };
      console.log(info1);
      return {
        ...info,
        date: updatedDateBlocks,
        driverValue:
          matchedBlock.dateValue ?? matchedBlock.defaultDateValue ?? 0,
        dateID: matchedBlock.dateID,
        enteredDate: formattedDate,
        enteredDateFormat: matchedBlock.dateFormat || dateFormat,
      };
    });

    props.setAdditionalInformationList(updatedList);
  };
  const HandleTextDriver = (e, globalPricingDriverID) => {
    const inputValue = e.target.value;

    const updatedList = props.additionalInformationList.map((info) => {
      if (info.globalPricingDriverID !== globalPricingDriverID) return info;

      const textBlock = info.text?.[0] ?? {};
      const maxLength = textBlock.textLength ?? 100;
      const allowedSpecial = textBlock.allowedSpecialCharacters ?? "";

      // Escape any special characters for regex
      const escapedAllowed = allowedSpecial.replace(
        /[-[\]/{}()*+?.\\^$|]/g,
        "\\$&",
      );

      // Only allow alphanumeric, spaces and defined special characters
      const regex = new RegExp(`[^a-zA-Z0-9 ${escapedAllowed}]`, "g");

      const cleanedValue = inputValue.replace(regex, "").slice(0, maxLength);

      return {
        ...info,
        enteredText: cleanedValue,
        driverValue: textBlock.textValue ?? 0,
        textID: textBlock.textID,
      };
    });

    props.setAdditionalInformationList(updatedList);
  };

  function getSelectedDateInfo(info) {
    const dateFormat = info.date?.[0]?.dateFormat || "dd-MM-yyyy";
    const enteredDateStr = info.enteredDate;
    const enteredDate = enteredDateStr
      ? parseStoredDate(enteredDateStr, info.enteredDateFormat || dateFormat)
      : null;

    if (!enteredDate) return null;

    // Try to match a block based on enteredDate
    let matchedBlock = info.date.find((block) => {
      const from = block.fromDate
        ? parseStoredDate(block.fromDate, dateFormat)
        : null;
      const to = block.toDate
        ? parseStoredDate(block.toDate, dateFormat)
        : null;

      if (!from || !to) return false;

      return (
        (isEqual(enteredDate, from) || isAfter(enteredDate, from)) &&
        (isEqual(enteredDate, to) || isBefore(enteredDate, to))
      );
    });

    // Fallback to default block
    if (!matchedBlock) {
      matchedBlock = info.date.find((block) => block.isDefault === true);
    }

    // Still fallback to 0 value block
    if (!matchedBlock && info.date?.[0]?.defaultDateValue != null) {
      return {
        driverValue: info.date?.[0].defaultDateValue,
        matchedBlock: null,
        enteredDate,
        dateFormat,
      };
    }

    if (!matchedBlock) return null;

    return {
      driverValue: matchedBlock.dateValue ?? matchedBlock.defaultDateValue ?? 0,
      matchedBlock,
      enteredDate,
      dateFormat,
    };
  }

  const handleSignatoryBlock = (index, field, e) => {
    props.DisableTabOnChange();
    const updatedSignatoriesList = [...props?.contractSignatoriesList]; // Create a copy of the existing list

    if (field === "signaturePositionID") {
      updatedSignatoriesList[index][field] = e.value; // Use square brackets notation to dynamically set the property
    } else {
      updatedSignatoriesList[index][field] = e; // Use square brackets notation to dynamically set the property
      if (field == "emailID") {
        if (props.isDuplicateEmail(e, index)) {
          props.setEmailError(`Duplicate email should not be allowed `);
          // scrollUpDownByElementID(`EmailError`);
        } else {
          props.setEmailError("");
        }
      }
    }
    props?.setContractSignatoriesList(updatedSignatoriesList); // Update the state with the modified list
  };

  return (
    <div>
      <div className="create-practice-height scrollbar">
        <div className="tab-content">
          <div class="tab-pane p-3 active">
            {props.additionalInformationList
              ?.filter((item) => item.driverTypeID !== 1)
              ?.map((i) => {
                return (
                  <div class="row fieldset add-new-package">
                    {i.driverVisibility && i.driverTypeID === 2 && (
                      <>
                        <div
                          className={
                            props.moduleName === "Package" ||
                            props.moduleName === "Quote"
                              ? "col-md-5 col-sm-12 text-start text-md-start"
                              : "col-md-3 col-sm-12 text-start text-md-end"
                          }
                        >
                          <div class="">
                            <label class="form-label">
                              {isMobile ? (
                                <>
                                  {i?.driverName
                                    .substring(0, 30)
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </>
                              ) : (
                                <>
                                  {props.moduleName === "Package" ||
                                  props.moduleName === "Quote" ? (
                                    i?.driverName.replace(/\b\w/g, (l) =>
                                      l.toUpperCase(),
                                    )
                                  ) : i?.driverName.length > 20 ? (
                                    <Tooltip title={i?.driverName}>
                                      {i?.driverName
                                        .substring(0, 25)
                                        .replace(/\b\w/g, (l) =>
                                          l.toUpperCase(),
                                        ) + "..."}
                                    </Tooltip>
                                  ) : (
                                    i?.driverName.replace(/\b\w/g, (l) =>
                                      l.toUpperCase(),
                                    )
                                  )}
                                </>
                              )}
                              <span class="text-danger">*</span>
                            </label>
                          </div>
                        </div>

                        <div
                          id={`${i?.driverName}`}
                          className={
                            props.moduleName === "Package" ||
                            props.moduleName === "Quote"
                              ? "col-lg-7 col-md-9 col-sm-12"
                              : "col-lg-9 col-md-9 col-sm-12"
                          }
                        >
                          <div class="mb-1">
                            <div class="input-group">
                              <input
                                type="text"
                                class="input-text"
                                placeholder={i?.driverName}
                                value={
                                  i.driverValue === null ? "" : i.driverValue
                                }
                                onChange={(e) =>
                                  HandleAdditionalInformation(
                                    e.target.value,
                                    i.globalPricingDriverID,
                                  )
                                }
                              />
                              {props.requireMessage &&
                              (i.driverValue === null ||
                                i.driverValue === undefined ||
                                i.driverValue === "") ? (
                                <label className="validation">
                                  {ERROR_MESSAGES}
                                </label>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    {i.driverVisibility && i.driverTypeID === 3 && (
                      <>
                        <div
                          className={
                            props.moduleName === "Package" ||
                            props.moduleName === "Quote"
                              ? "col-md-5 col-sm-12 text-start text-md-start"
                              : "col-md-3 col-sm-12 text-start text-md-end"
                          }
                        >
                          <div class="">
                            <label class="form-label">
                              {isMobile ? (
                                <>
                                  {i?.driverName
                                    .substring(0, 30)
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </>
                              ) : (
                                <>
                                  {props.moduleName === "Package" ||
                                  props.moduleName === "Quote" ? (
                                    i?.driverName.replace(/\b\w/g, (l) =>
                                      l.toUpperCase(),
                                    )
                                  ) : i?.driverName.length > 20 ? (
                                    <Tooltip title={i?.driverName}>
                                      {i?.driverName
                                        .substring(0, 25)
                                        .replace(/\b\w/g, (l) =>
                                          l.toUpperCase(),
                                        ) + "..."}
                                    </Tooltip>
                                  ) : (
                                    i?.driverName.replace(/\b\w/g, (l) =>
                                      l.toUpperCase(),
                                    )
                                  )}
                                </>
                              )}
                              <span class="text-danger">*</span>
                            </label>
                          </div>
                        </div>
                        <div
                          id={`${i?.driverName}`}
                          className={
                            props.moduleName === "Package" ||
                            props.moduleName === "Quote"
                              ? "col-lg-7 col-md-9 col-sm-12"
                              : "col-lg-9 col-md-9 col-sm-12"
                          }
                        >
                          <div class="mb-1 ">
                            <div class="input-group">
                              <Select
                                options={i.variation?.map((item) => ({
                                  value: item.variationID,
                                  label: item.variationName,
                                  variationValue: item.variationValue,
                                }))}
                                value={i?.variation
                                  .filter(
                                    (variation) => variation.isDefault === true,
                                  )
                                  .map((i) => ({
                                    value: i.variationID,
                                    label: i.variationName,
                                  }))}
                                onChange={(value) =>
                                  HandleAdditionalInformation(
                                    value,
                                    i.globalPricingDriverID,
                                    value.value,
                                    i,
                                  )
                                }
                              />
                              {props.requireMessage &&
                              (i.driverValue === null ||
                                i.driverValue === undefined ||
                                i.driverValue === "") ? (
                                <label className="validation">
                                  {ERROR_MESSAGES}
                                </label>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    {i.driverVisibility && i.driverTypeID === 6 && (
                      <>
                        <div
                          className={
                            props.moduleName === "Package" ||
                            props.moduleName === "Quote"
                              ? "col-md-5 col-sm-12 text-start text-md-start"
                              : "col-md-3 col-sm-12 text-start text-md-end"
                          }
                        >
                          <div class="">
                            <label class="form-label">
                              {isMobile ? (
                                <>
                                  {i?.driverName
                                    .substring(0, 30)
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </>
                              ) : (
                                <>
                                  {props.moduleName === "Package" ||
                                  props.moduleName === "Quote" ? (
                                    i?.driverName.replace(/\b\w/g, (l) =>
                                      l.toUpperCase(),
                                    )
                                  ) : i?.driverName.length > 20 ? (
                                    <Tooltip title={i?.driverName}>
                                      {i?.driverName
                                        .substring(0, 25)
                                        .replace(/\b\w/g, (l) =>
                                          l.toUpperCase(),
                                        ) + "..."}
                                    </Tooltip>
                                  ) : (
                                    i?.driverName.replace(/\b\w/g, (l) =>
                                      l.toUpperCase(),
                                    )
                                  )}
                                </>
                              )}
                              <span class="text-danger">*</span>
                            </label>
                          </div>
                        </div>
                        <div
                          id={`${i?.driverName}`}
                          className={
                            props.moduleName === "Package" ||
                            props.moduleName === "Quote"
                              ? "col-lg-7 col-md-9 col-sm-12"
                              : "col-lg-9 col-md-9 col-sm-12"
                          }
                        >
                          <div className="mb-1">
                            <div class="input-group">
                              <DatePicker
                                className="input-text"
                                selected={
                                  i.enteredDate
                                    ? getSelectedDateInfo(i)?.enteredDate
                                    : null
                                }
                                dateFormat={
                                  i.date?.[0]?.dateFormat || "dd-MM-yyyy"
                                }
                                onChange={(date) =>
                                  HandleDateDriver(
                                    date,
                                    i.globalPricingDriverID,
                                  )
                                }
                                minDate={getMinDate(
                                  i.date,
                                  i.date?.[0]?.dateFormat,
                                )}
                                maxDate={getMaxDate(
                                  i.date,
                                  i.date?.[0]?.dateFormat,
                                )}
                                placeholderText="Select any date"
                              />
                              {props.requireMessage &&
                                (i.enteredDate === null ||
                                  i.enteredDate === undefined ||
                                  i.enteredDate === "") && (
                                  <label className="validation">
                                    {ERROR_MESSAGES}
                                  </label>
                                )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {i.driverVisibility && i.driverTypeID === 5 && (
                      <>
                        <div
                          className={
                            props.moduleName === "Package" ||
                            props.moduleName === "Quote"
                              ? "col-md-5 col-sm-12 text-start text-md-start"
                              : "col-md-3 col-sm-12 text-start text-md-end"
                          }
                        >
                          <div class="">
                            <label class="form-label">
                              {isMobile ? (
                                <>
                                  {i?.driverName
                                    .substring(0, 30)
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </>
                              ) : (
                                <>
                                  {props.moduleName === "Package" ||
                                  props.moduleName === "Quote" ? (
                                    i?.driverName.replace(/\b\w/g, (l) =>
                                      l.toUpperCase(),
                                    )
                                  ) : i?.driverName.length > 20 ? (
                                    <Tooltip title={i?.driverName}>
                                      {i?.driverName
                                        .substring(0, 25)
                                        .replace(/\b\w/g, (l) =>
                                          l.toUpperCase(),
                                        ) + "..."}
                                    </Tooltip>
                                  ) : (
                                    i?.driverName.replace(/\b\w/g, (l) =>
                                      l.toUpperCase(),
                                    )
                                  )}
                                </>
                              )}
                              <span class="text-danger">*</span>
                            </label>
                          </div>
                        </div>
                        <div
                          id={`${i?.driverName}`}
                          className={
                            props.moduleName === "Package" ||
                            props.moduleName === "Quote"
                              ? "col-lg-7 col-md-9 col-sm-12"
                              : "col-lg-9 col-md-9 col-sm-12"
                          }
                        >
                          <div className="mb-1">
                            <div class="input-group">
                              <input
                                className="input-text"
                                type="text"
                                value={i?.enteredText || null}
                                onChange={(e) =>
                                  HandleTextDriver(e, i.globalPricingDriverID)
                                }
                                placeholder="Enter Text"
                                maxLength={i?.text?.[0]?.textLength || 100}
                              />
                              {props.requireMessage &&
                                (i.enteredText === null ||
                                  i.enteredText === undefined ||
                                  i.enteredText === "") && (
                                  <label className="validation">
                                    {ERROR_MESSAGES}
                                  </label>
                                )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* working here  */}
                    {i.driverVisibility && i.driverTypeID === 4 && (
                      <>
                        <div
                          className={
                            props.moduleName === "Package" ||
                            props.moduleName === "Quote"
                              ? "col-md-5 col-sm-12 text-start text-md-start"
                              : "col-md-3 col-sm-12 text-start text-md-end"
                          }
                        >
                          {/* <div class="col-md-5 col-sm-12 text-start text-md-start"> */}
                          <div class="">
                            <label class="form-label">
                              {isMobile ? (
                                <>
                                  {i?.driverName
                                    .substring(0, 30)
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </>
                              ) : (
                                <>
                                  {props.moduleName === "Package" ||
                                  props.moduleName === "Quote" ? (
                                    i?.driverName.replace(/\b\w/g, (l) =>
                                      l.toUpperCase(),
                                    )
                                  ) : i?.driverName.length > 20 ? (
                                    <Tooltip title={i?.driverName}>
                                      {i?.driverName
                                        .substring(0, 25)
                                        .replace(/\b\w/g, (l) =>
                                          l.toUpperCase(),
                                        ) + "..."}
                                    </Tooltip>
                                  ) : (
                                    i?.driverName.replace(/\b\w/g, (l) =>
                                      l.toUpperCase(),
                                    )
                                  )}
                                </>
                              )}
                              <span class="text-danger">*</span>
                            </label>
                          </div>
                        </div>
                        <div
                          id={`${i?.driverName}`}
                          className={
                            props.moduleName === "Package" ||
                            props.moduleName === "Quote"
                              ? "col-lg-7 col-md-9 col-sm-12"
                              : "col-lg-9 col-md-9 col-sm-12"
                          }
                        >
                          <div class="mb-1 ">
                            <div class="input-group">
                              <Select
                                options={i.slab?.map((item) => ({
                                  value: item.slabID,
                                  label:
                                    item.slabTypeID === 2
                                      ? "Other"
                                      : `${item.slabFrom
                                          .toString()
                                          .replace(
                                            /\B(?=(\d{3})+(?!\d))/g,
                                            ",",
                                          )} - ${item.slabTo
                                          .toString()
                                          .replace(
                                            /\B(?=(\d{3})+(?!\d))/g,
                                            ",",
                                          )}`,
                                  variationValue: item.slabValue,
                                }))}
                                value={i?.slab
                                  ?.filter((slab) => slab.isDefault === true)
                                  .map((i) => ({
                                    value: i.slabID,
                                    label:
                                      i.slabTypeID === 2
                                        ? "Other"
                                        : `${i.slabFrom
                                            .toString()
                                            .replace(
                                              /\B(?=(\d{3})+(?!\d))/g,
                                              ",",
                                            )} - ${i.slabTo
                                            .toString()
                                            .replace(
                                              /\B(?=(\d{3})+(?!\d))/g,
                                              ",",
                                            )}`,
                                  }))}
                                onChange={(value) =>
                                  HandleAdditionalInformation(
                                    value,
                                    i.globalPricingDriverID,
                                  )
                                }
                              />
                              {props.requireMessage &&
                              i?.slab?.some(
                                (slab) =>
                                  slab.isDefault && slab.slabTypeID !== 2,
                              ) &&
                              (i.driverValue === null ||
                                i.driverValue === undefined ||
                                i.driverValue === "") ? (
                                <label className="validation">
                                  {ERROR_MESSAGES}
                                </label>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>
                        </div>
                        {i?.slab
                          ?.filter((slab) => slab.isDefault === true)
                          .map((item) => {
                            if (item.slabTypeID === 2) {
                              return (
                                <React.Fragment key={i?.driverName}>
                                  <div
                                    className={
                                      props.moduleName === "Package" ||
                                      props.moduleName === "Quote"
                                        ? "col-md-5 col-sm-12 text-start text-md-start"
                                        : "col-md-3 col-sm-12 text-start text-md-end"
                                    }
                                  >
                                    <div>
                                      <label className="form-label"></label>
                                    </div>
                                  </div>
                                  <div
                                    id={`${i?.driverName}`}
                                    className={
                                      props.moduleName === "Package" ||
                                      props.moduleName === "Quote"
                                        ? "col-lg-7 col-md-9 col-sm-12"
                                        : "col-lg-9 col-md-9 col-sm-12"
                                    }
                                  >
                                    <div className="mb-1 d-flex flex-column justify-content-end h-100">
                                      <div className="input-group">
                                        <input
                                          type="text"
                                          value={i?.driverValue
                                            ?.toString()
                                            ?.replace(
                                              /\B(?=(\d{3})+(?!\d))/g,
                                              ",",
                                            )}
                                          onChange={(e) => {
                                            OnIncrementalValueChange(
                                              i,
                                              e.target.value,
                                            );
                                          }}
                                          className="input-text mt-2"
                                          placeholder={i.driverName}
                                        />
                                      </div>
                                      {props.requireMessage &&
                                        (i.driverValue === null ||
                                          i.driverValue === undefined ||
                                          i.driverValue === "") && (
                                          <label className="validation">
                                            {ERROR_MESSAGES}
                                          </label>
                                        )}
                                      {props.requireMessage &&
                                        (i.driverValue === "." ||
                                          i.driverValue === "-") && (
                                          <label className="validation">
                                            Invalid Value
                                          </label>
                                        )}
                                    </div>
                                  </div>
                                </React.Fragment>
                              );
                            }
                            return null;
                          })}
                      </>
                    )}
                  </div>
                );
              })}

            {props.moduleName == "Contract" && (
              <div id="SignatoryBlockDiv">
                <h3 className="modal-title">Signatories</h3>
                <div className="separator"></div>

                {/* Signature Position (moved to top) */}
                <div className="row fieldset mt-3">
                  <div className="col-lg-3 col-md-3 col-sm-12 text-start text-md-end">
                    <label className="fieldset-label required">
                      Signature Position
                      <span style={{ color: "#ec4561" }}>*</span>
                    </label>
                  </div>
                  <div className="col-lg-9 col-md-9 col-sm-12">
                    <div className="input-group">
                      <Select
                        options={Utils.SignaturePosition}
                        value={Utils.SignaturePosition.find(
                          (item) => item.value == SignaturePositionValue,
                        )}
                        onChange={(e) => {
                          // Apply the selected position to all signatories
                          setSignaturePositionValue(e.value);
                          const updatedList = props.contractSignatoriesList.map(
                            (signatory) => ({
                              ...signatory,
                              signaturePositionID: e.value,
                            }),
                          );
                          props.setContractSignatoriesList(updatedList);
                        }}
                      />
                    </div>
                    {props.requireMessage &&
                      (!SignaturePositionValue ||
                        SignaturePositionValue === "") && (
                        <label className="validation">{ERROR_MESSAGES}</label>
                      )}
                  </div>
                </div>

                {/* Signatories List */}
                {props?.contractSignatoriesList?.map((signatory, index) => {
                  return (
                    <div
                      id={`contract-signatory-${index}`}
                      className="fieldset-group mb-4"
                      key={index}
                    >
                      <div>
                        <label className="fieldset-group-label">
                          {Utils.stringifyNumber(index + 1)} Signatory
                        </label>
                        <label className="fieldset-group-label-1 required">
                          {props.contractSignatoriesList.length === 1 ? null : (
                            <button
                              onClick={() => props.deleteSignatory(index)}
                              className="btn btn-sm btn-danger delete-fieldset-group"
                            >
                              <i className="bi bi-trash3 margin-right "></i>
                              <span className="d-none d-sm-inline">
                                Delete Signature
                              </span>
                            </button>
                          )}
                        </label>

                        {/* First Name */}
                        <div className="row fieldset">
                          <div className="col-lg-3 col-md-3 col-sm-12 text-start text-md-end">
                            <label className="fieldset-label required">
                              First Name{" "}
                              <span style={{ color: "#ec4561" }}>*</span>
                            </label>
                          </div>
                          <div className="col-lg-9 col-md-9 col-sm-12">
                            <input
                              type="text"
                              className="input-text"
                              placeholder="First Name"
                              value={signatory?.firstName}
                              onChange={(e) => {
                                const inputValue = e.target.value.trim();
                                const cleanedValue = inputValue.replace(
                                  /[.\s]/g,
                                  "",
                                );
                                if (/\d/.test(cleanedValue)) return;
                                const capitalizedValue =
                                  cleanedValue.charAt(0).toUpperCase() +
                                  cleanedValue.slice(1);
                                handleSignatoryBlock(
                                  index,
                                  "firstName",
                                  capitalizedValue,
                                );
                              }}
                              maxLength={30}
                            />
                            {props.requireMessage &&
                              (!signatory?.firstName ||
                                signatory?.firstName === "") && (
                                <label className="validation">
                                  {ERROR_MESSAGES}
                                </label>
                              )}
                          </div>

                          {/* Last Name */}
                          <div className="mb-2"></div>
                          <div className="col-lg-3 col-md-3 col-sm-12 text-start text-md-end">
                            <label className="fieldset-label required">
                              Last Name{" "}
                              <span style={{ color: "#ec4561" }}>*</span>
                            </label>
                          </div>
                          <div className="col-lg-9 col-md-9 col-sm-12">
                            <input
                              type="text"
                              className="input-text"
                              placeholder="Last Name"
                              value={formatName(signatory?.lastName)}
                              onChange={(e) => {
                                const inputValue = e.target.value.trim();
                                const cleanedValue = inputValue.replace(
                                  /[.\s]/g,
                                  "",
                                );
                                if (/\d/.test(cleanedValue)) return;
                                const capitalizedValue =
                                  cleanedValue.charAt(0).toUpperCase() +
                                  cleanedValue.slice(1).toLowerCase();
                                handleSignatoryBlock(
                                  index,
                                  "lastName",
                                  capitalizedValue,
                                );
                              }}
                              maxLength={30}
                            />
                            {props.requireMessage &&
                              (!signatory?.lastName ||
                                signatory?.lastName === "") && (
                                <label className="validation">
                                  {ERROR_MESSAGES}
                                </label>
                              )}
                          </div>
                        </div>

                        {/* Email */}
                        <div className="row fieldset">
                          <div className="col-md-3 col-sm-12 text-start text-md-end">
                            <label className="fieldset-label required">
                              Email <span style={{ color: "#ec4561" }}>*</span>
                            </label>
                          </div>
                          <div className="col-md-9 col-sm-12">
                            <input
                              type="text"
                              className="input-text"
                              placeholder="Email"
                              value={signatory?.emailID}
                              onChange={(e) => {
                                handleSignatoryBlock(
                                  index,
                                  "emailID",
                                  e.target.value,
                                );
                              }}
                            />
                            {props.requireMessage &&
                            (!signatory?.emailID ||
                              signatory?.emailID === "") ? (
                              <label className="validation">
                                {ERROR_MESSAGES}
                              </label>
                            ) : (
                              props.requireMessage &&
                              !isValidEmail(signatory?.emailID) && (
                                <label className="validation">
                                  Invalid email pattern
                                </label>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Validation for no signatories */}
                {props.requireMessage &&
                  props?.contractSignatoriesList?.length === 0 && (
                    <label className="validation">
                      At least 1 Signatory is required.
                    </label>
                  )}
              </div>
            )}
            {props.moduleName === "Contract" && (
              <>
                <h3 className="modal-title">Terms & Conditions</h3>
                <div className="separator"></div>
                <div id="TnC-Div" className="row fieldset mt-3">
                  <div className="col-lg-3 col-md-3 col-sm-12 text-start text-md-end">
                    <label className="fieldset-label required">
                      TnC Template<span style={{ color: "#ec4561" }}>*</span>
                    </label>
                  </div>
                  <div className="col-lg-9 col-md-9 col-sm-12">
                    <div className="input-group">
                      <Select
                        options={props.TnCLookupList}
                        value={props?.SelectTnCTemplateValue} // Assuming 'index' is defined somewhere
                        onChange={(e) => {
                          props.handleSelectTncTemplate(e);
                        }}
                      />
                    </div>
                    {props.requireMessage &&
                    (props?.engagementObj.tnCTemplateID === null ||
                      props?.engagementObj.tnCTemplateID === undefined ||
                      props?.engagementObj.tnCTemplateID === "") ? (
                      <label className="validation">{ERROR_MESSAGES}</label>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                {props?.engagementObj?.pdf !== null ? (
                  <div id="TnC-PdfDiv" className="mt-2">
                    <iframe
                      title="PDF Viewer"
                      src={props?.engagementObj?.pdf}
                      width="100%"
                      height="600px"
                    ></iframe>
                  </div>
                ) : props?.engagementObj?.tnCTemplateContent !== null ? (
                  <div id="TnC-EditorDiv">
                    <Text_Editor
                      className="mt-2"
                      handleContentChange={props?.handleContentChange}
                      editorState={props?.engagementObj?.tnCTemplateContent}
                    />
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
      <div class="separator"></div>
      <div class="row fieldset modal-footer">
        <div class="col-lg-12 hstack gap-1 justify-content-end text-right mt-3">
          <div class="d-flex" style={{ overflowX: "auto" }}>
            {props.moduleName == "Contract" && (
              <button
                className="btn btn-md btn-primary create-item-btn  mr-1 text-nowrap "
                onClick={() => {
                  props.AddSignatory();
                }}
              >
                <i class="bi bi-plus-circle "></i>
                <span style={{ paddingLeft: "5px" }}>Add Signatory</span>
              </button>
            )}
            {props.getSAChanges ? (
              <button
                class="btn btn-md btn-success declined-item-btn mr-1"
                onClick={() => props.DeclineSuperAdminChangesData("Decline")}
              >
                <span>Decline</span>
              </button>
            ) : (
              <button
                class="btn btn-md  btn-light mr-1"
                onClick={props.handleCancel}
              >
                <span>{props.getCrudButtonTextName("Cancel")}</span>
              </button>
            )}
            <button
              onClick={() => props.HandleBack(2)}
              style={{ marginRight: "5px" }}
              className="btn btn-md btn-success create-item-btn text-nowrap"
            >
              <span>Back</span>
            </button>
            {props?.ProposalObject?.selectedProposalTypeValue === 1 && (
              <button
                className="btn btn-md btn-success create-item-btn"
                onClick={async () => {
                  await props.HandleTabChange(7);
                }}
              >
                <span>Next</span>
              </button>
            )}
            {props?.ProposalObject?.selectedProposalTypeValue === 2 && (
              <button
                className="btn btn-md btn-success create-item-btn"
                onClick={async () => {
                  await props.HandleTabChange(7);
                }}
              >
                <span>Next</span>
              </button>
            )}
            {props?.ProposalObject?.selectedProposalTypeValue === 3 && (
              <button
                className="btn btn-md btn-success create-item-btn"
                onClick={async () => {
                  await props.HandleTabChange(6);
                }}
              >
                <span>Next</span>
              </button>
            )}
            {props?.ProposalObject?.selectedProposalTypeValue === 4 && (
              <button
                className="btn btn-md btn-success create-item-btn"
                onClick={async () => {
                  await props.HandleTabChange(4);
                }}
              >
                <span>Next</span>
              </button>
            )}
            {(props.moduleName == "Contract" ||
              props.moduleName === "Package") && (
              <button
                className="btn btn-md btn-success create-item-btn"
                onClick={async () => {
                  await props.HandleTabChange(4);
                }}
              >
                <span>Next</span>
              </button>
            )}
            {props.moduleName == "Quote" && (
              <button
                type="submit"
                class="btn btn-md btn-success create-item-btn text-nowrap"
                onClick={() =>
                  props.handleSaveAsDraft(
                    3,
                    moduleNameForSaveAsDraft,
                    statusID.Draft,
                  )
                }
                style={{ marginLeft: "5px" }}
              >
                <span>Save as a Draft</span>
              </button>
            )}
            {props.moduleName == "Contract" && (
              <button
                type="submit"
                class="btn btn-md btn-success create-item-btn text-nowrap"
                onClick={() => props.HandleTabChange(4, statusID.Draft)}
                style={{ marginLeft: "5px" }}
              >
                <span>Save as a Draft</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalInformation;
