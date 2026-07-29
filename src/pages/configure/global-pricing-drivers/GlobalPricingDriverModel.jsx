/* global $ */
import React, { useContext, useEffect, useRef, useState } from "react";
import DropDown from "../../../components/DropDown";
import "./GlobalPricingDriversStyle.css";
import { GetProfessionTypeLookupList } from "../../../redux/Services/Master/ProfessionTypeApi";
import Select from "react-select";
import {
  AddUpdateGlobalPricingDriver,
  DriverTypeList,
  GetGlobalPricingDriverModel,
  GetPricingDriverUsedInModules,
  SlabTypeList,
} from "../../../redux/Services/Config/GlobalPricingDriverApi";
import { useSelector } from "react-redux";
import { USER_ROLE_TYPE } from "../../../Middleware/enums";
import SuccessModal from "../../../components/SuccessModal";
import { ERROR_MESSAGES } from "../../../components/GlobalMessage";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";
import ErrorModel from "../../../components/ErrorModel";
import RecordsAvailablePopupModel from "../../../components/RecordsAvailablePopupModel";
import DeleteDriverModal from "../../../components/DeleteDriverModel";
import { NotifySuperAdminPredefinedChangesToAdmin } from "../../../redux/Services/Setting/NotificationApi";
import { DeclineSuperAdminChanges } from "../../../redux/Services/Config/ServiceCategoryApi";
import AcceptSuperAdminChangesConfirmation from "../../../components/AcceptSuperAdminChangesConfirmation";
import SAPredefinedChangesNotifyMessageModel from "../../../components/SAPredefinedChangesNotifyMessageModel";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  parse,
  format,
  isValid,
  differenceInCalendarDays,
  addDays,
  subDays,
} from "date-fns";
import Utils from "../../../Middleware/Utils";
function Modal(props) {
  //A] Declare State
  const moduleName = props.modelRequestData?.addedFor === "GlobalProspect" ? "Global Prospect Variable" : "Global Pricing Driver";
  const modalRef = useRef(null);
  const [Status, setStatus] = React.useState(false);
  const [gdrivererror, setGdriverError] = useState(false);
  const [openDeleteDriverModel, setOpenDeleteDriverModel] = useState(false);
  const [slabError, setSlabError] = useState({
    slab: false,
    slabType: false,
    slabValue: false,
  });
  const [modelRequestData, setModelRequestData] = useState({
    Action: null,
    message: "",
    ServiceName: [],
    name: null,
  });
  const [modelRequestDataForDeleteDriver, setModelRequestDataForDeleteDriver] =
    useState({
      Action: null,
      message: "",
      ServiceName: [],
      name: null,
    });
  const [variationError, setVariationError] = useState({
    variation: false,
    variationName: false,
    variationValue: false,
  });
  const [dateError, setDateError] = useState({
    date: false,
    dateFormat: false,
    dateValue: false,
    fromDate: false,
    toDate: false,
  });
  const [textError, setTextError] = useState({
    text: false,
    textValue: false,
    textLength: false,
  });
  const [qtyError, setQtyError] = useState({
    quantityError: false,
  });
  const [errorMessageTitle, setErrorMessageTitle] = useState("");
  const [slabType, setSlabType] = useState([]);
  const [variations, setVariations] = useState([
    {
      variationKeyID: null,
      variationID: "",
      variationName: "",
      variationValue: "",
      canDelete: true,
      isDefault: true,
    },
  ]);
  const [slabs, setSlabs] = useState([
    {
      slabKeyID: null,
      slabTypeID: "",
      slabValue: "",
      slabFrom: 0,
      slabTo: 0,
      decimalPlaces: null,
      isDefault: true,
    },
  ]);
  const [dates, setDates] = useState([
    {
      dateFormat: null,
      defaultDateValue: null,
      blocks: [
        {
          fromDate: "",
          toDate: "",
          dateValue: null,
        },
      ],
    },
  ]);
  const [textDriver, setTextDriver] = useState({
    textKeyID: null,
    textLength: null,
    textValue: null,
    allowedSpecialCharacters: "",
  });
  const [quantity, setQuantity] = useState([
    {
      quantityKeyID: null,
      quantityDecimalPlaces: 0,
      quantityFrom: null,
      quantityTo: null,
    },
  ]);
  const [errorMessage, setErrorMessage] = useState("");
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [modelAction, setModelAction] = useState("");
  const [professionTypeLookupList, setProfessionTypeLookupList] = useState([]);
  const [driverType, setDriverType] = useState([]);
  const [driverTypeValue1, setDriverTypeValue1] = useState("");
  const [count, setCount] = useState(0);
  const [isCheck, setIsCheck] = useState(false);
  const [globalPricingDriverObj, setGlobalPricingDriverObj] = useState({
    globalPricingDriverKeyID: null,
    keyID: null,
    organisationID: null, //pass organisationID if UserRoleType=Admin, else send null
    CreatedByID: null,
    driverName: "",
    driverValue: null,
    driverTypeID: null,
    isPredefined: null,
    addedFor: props.modelRequestData?.addedFor || null,
    professionTypeList: [],
    variation: variations,
    slab: slabs,
    date: dates,
    text: textDriver,
  });
  const [dismissModal, setDismissModal] = useState(null);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const common = useSelector((state) => state.Storage);
  const {
    setLoader,
    getCrudButtonTextName,
    getCrudPopUpTitleName,
    problematicInputRef,
    scrollUpDownByElementID,
    formatNumberWithDecimals,
  } = useContext(AuthContextProvider);

  //B] Initial useEffect : Will call when Add/Update button click from list page
  useEffect(() => {
    setModelAction(props.modelRequestData.Action === null ? "Add" : "Update"); //Do not change this naming convention
    GetProfessionTypeLookupListData();
    GetDriverTypeData();
    getSlabTypeData();
    if (
      props.modelRequestData.Action !== undefined &&
      props.modelRequestData.Action !== null
    ) {
      GetServiceCategoryModelData(
        props.modelRequestData.globalPricingDriverKeyID,
        props.modelRequestData.Type
      );
    } else {
      SetInitialModelData();
    }
  }, [props.modelRequestData]);

  useEffect(() => {
    if (
      globalPricingDriverObj.driverTypeID === 6 &&
      (dates.length === 0 || !dates[0]?.dateFormat)
    ) {
      setDates([
        {
          dateFormat: dateFormats[3].value,
          defaultDateValue: null,
          blocks: [],
        },
      ]);
    }
  }, [globalPricingDriverObj.driverTypeID, dates]);

  useEffect(() => {
    if (
      globalPricingDriverObj.driverTypeID === 2 &&
      (quantity.length === 0 || !quantity)
    ) {
      setQuantity([
        {
          quantityDecimalPlaces: Utils.DECIMAL_PLACE_OPTIONS[2].value,
          quantityFrom: null,
          quantityTo: null,
        },
      ]);
    }
  }, [globalPricingDriverObj.driverTypeID, quantity]);

  // C] This function will clear all data from popup model
  const SetInitialModelData = () => {
    setGlobalPricingDriverObj({
      ...globalPricingDriverObj,
      globalPricingDriverKeyID: null,
      keyID: null,
      organisationID: null, //pass organisationID if UserRoleType=Admin, else send null
      CreatedByID: null,
      driverName: "",
      driverValue: null,
      driverTypeID: "",
      isPredefined: null,
      addedFor: null,
      professionTypeList: [],
      slab: [
        {
          slabTypeID: "",
          slabValue: "",
          slabFrom: 0,
          slabTo: 0,
          isDefault: true,
        },
      ],
    });
    setDriverTypeValue1("");
    setVariations([]);
    setDates([]);
    setTextDriver({
      textKeyID: null,
      textLength: null,
      textValue: null,
      allowedSpecialCharacters: "",
    }
  );
    setQuantity([
    {
      quantityKeyID: null,
      quantityDecimalPlaces: 0,
      quantityFrom: null,
      quantityTo: null,
    },
    ]);
    setErrorMessage("");
    setGdriverError(false);
    setVariationError({
      variation: false,
      variationValue: false,
    });
    setSlabError({
      slab: false,
      slabType: false,
      slabValue: false,
    });
  };

  const AddSlab = () => {
    setCount(count + 1);
    const newSlabs = {
      slabTypeID: "",
      slabValue: "",
      slabFrom: 0,
      slabTo: 0,
      decimalPlaces: 2,
      isDefault: true,
    };
    slabs.push(newSlabs);
  };

  const OnVariationChange = (index, field, value) => {
    const updatedVariations = [...variations];
    updatedVariations[index][field] = value;
    setVariations(updatedVariations);
    // Check if the current name is the same as the previous name
    if (
      index > 0 &&
      updatedVariations[index - 1][field] === updatedVariations[index][field]
    ) {
    } else {
      setErrorMessage(null);
    }
  };

  //onchange For Change the Slab
  // const OnSlabChange = (index, field, value) => {
  //   let updatedSlabs = [...slabs];
  //   updatedSlabs[index][field] = value;
  //   if (value == 2) {
  //     updatedSlabs[index][field] = value;
  //     updatedSlabs.splice(index + 1);
  //   }
  //   setSlabs(updatedSlabs);
  //   const slabTypeFilter = slabType.find(
  //     (item) => item.slabTypeId === slabs[index].slabTypeID
  //   );

  // };
  const OnSlabChange = (index, field, value) => {
    let updatedSlabs = [...slabs];

    if (field === "decimalPlaces") {
      // Update decimalPlaces for ALL slabs
      updatedSlabs = updatedSlabs.map((slab) => {
        const decimalPlaces = value;
        const updatedSlab = {
          ...slab,
          decimalPlaces,
        };

        // Format slabFrom and slabTo to match the new decimal places
        if (slab.slabFrom !== "") {
          updatedSlab.slabFrom = parseFloat(slab.slabFrom).toFixed(
            decimalPlaces
          );
        }

        if (slab.slabTo !== "") {
          updatedSlab.slabTo = parseFloat(slab.slabTo).toFixed(decimalPlaces);
        }

        return updatedSlab;
      });

      setSlabs(updatedSlabs);
      return; // Exit early since handled
    }

    // Regular logic for other fields
    updatedSlabs[index][field] = value;

    if (value == 2) {
      updatedSlabs.splice(index + 1);
    }

    setSlabs(updatedSlabs);
  };

  function OnVariationsRadioChange(selectedIndex) {
    setErrorMessage("");
    const updatedVariations = variations.map((variation, index) => ({
      ...variation,
      isDefault: index === selectedIndex, // Set the selected variation to true, others to false
    }));

    setVariations(updatedVariations);
    // Update your state or data with the updatedVariations array
    // For example, if you're using React state, set it with setState(updatedVariations);
  }

  function OnSlabsRadioChange(selectedIndex) {
    setErrorMessage("");
    const updatedSlabs = slabs.map((slab, index) => ({
      ...slab,
      isDefault: index === selectedIndex, // Set the selected variation to true, others to false
    }));

    setSlabs(updatedSlabs);
    // Update your state or data with the updatedVariations array
    // For example, if you're using React state, set it with setState(updatedVariations);
  }

  //Add Slab
  const OnAddSlab = (i) => {
    setCount(count + 1);
    var fromValueForNewSlab = Number(slabs[slabs.length - 1].slabTo) + 0.01;
    var existingDecimalPlaces =
      Number(slabs[slabs.length - 1].decimalPlaces) ?? 2;
    fromValueForNewSlab = Math.round(fromValueForNewSlab * 100) / 100;
    const newSlabs = {
      slabKeyID: null,
      slabTypeID: "",
      slabValue: "",
      slabFrom: fromValueForNewSlab, //Number(slabs[slabs.length - 1].slabTo) + 0.01,
      slabTo: "",
      decimalPlaces: existingDecimalPlaces,
      isDefault: slabs.length === 0 ? true : false,
    };

    if (
      slabs[slabs.length - 1].slabValue === "" ||
      slabs[slabs.length - 1].slabFrom === "" ||
      slabs[slabs.length - 1].slabTo === "" ||
      parseFloat(slabs[slabs.length - 1].slabTo) <
        parseFloat(slabs[slabs.length - 1].slabFrom)
    ) {
      setSlabError({ slabValue: true });
    } else {
      setSlabError({ slab: false, slabType: false, slabValue: false });

      slabs.push(newSlabs);
      setTimeout(function () {
        scrollUpDownByElementID(`Slab_Div_${slabs.length - 1}`);
      }, 200);
    }
  };

  //delete Slab
  const OnDeleteSlabs = async (index) => {
    // First, create a copy of the slabs array to avoid modifying it directly
    const slabsCopy = [...slabs];
    if (slabsCopy[index].slabKeyID !== null) {
      setLoader(true);
      const pricingDriverDelete = await GetPricingDriverUsedInModules(
        globalPricingDriverObj.globalPricingDriverKeyID,
        common.userKeyID,
        null,
        null,
        slabsCopy[index].slabKeyID
      );
      setLoader(false);
      if (pricingDriverDelete?.data?.statusCode === 200) {
        setLoader(false);
        let moduleList = pricingDriverDelete.data.responseData.moduleList;
        if (moduleList.length > 0) {
          // moduleList.map()
          setModelRequestDataForDeleteDriver({
            ...modelRequestDataForDeleteDriver,
            Action: "PricingDriverDelete",
            message: `Cannot delete slab already exist in following`,
            ServiceName: moduleList,
          });
          $("#" + "DeleteDriverModel").modal("show");
        } else {
          setLoader(false);
          // Check if the provided index is within the valid range
          if (index >= 0 && index < slabsCopy.length) {
            // Use splice to remove the element at the specified index
            slabsCopy.splice(index, 1);

            // Update the slabTo for the remaining elements based on the previous element's slabTo
            for (let i = 1; i < slabsCopy.length; i++) {
              var fromValueForNewSlab = Number(slabsCopy[i - 1].slabTo) + 0.01;
              fromValueForNewSlab = Math.round(fromValueForNewSlab * 100) / 100;
              slabsCopy[i].slabFrom = fromValueForNewSlab; //Number(slabsCopy[i - 1].slabTo) + 0.01;
            }

            // If there are remaining elements, update isDefault to true for the new first element
            if (slabsCopy.length > 0) {
              slabsCopy[0].isDefault = true;
            }

            // Update the slabs state with the modified array
            setSlabs(slabsCopy);
          }
        }
      }
    } else {
      // Check if the provided index is within the valid range
      if (index >= 0 && index < slabsCopy.length) {
        // Use splice to remove the element at the specified index
        slabsCopy.splice(index, 1);

        // Update the slabTo for the remaining elements based on the previous element's slabTo
        for (let i = 1; i < slabsCopy.length; i++) {
          var fromValueForNewSlab = Number(slabsCopy[i - 1].slabTo) + 0.01;
          fromValueForNewSlab = Math.round(fromValueForNewSlab * 100) / 100;
          slabsCopy[i].slabFrom = fromValueForNewSlab; //Number(slabsCopy[i - 1].slabTo) + 0.01;
        }

        // If there are remaining elements, update isDefault to true for the new first element
        if (slabsCopy.length > 0) {
          slabsCopy[0].isDefault = true;
        }

        // Update the slabs state with the modified array
        setSlabs(slabsCopy);
      }
    }
  };

  const OnDeletePeriodBlock = (dateIndex, blockIndex) => {
    const updatedDates = [...dates];
    const blocks = [...updatedDates[dateIndex].blocks];

    blocks.splice(blockIndex, 1);

    // Recalculate fromDate for all subsequent blocks
    for (let i = 1; i < blocks.length; i++) {
      const prevToDate = parseStoredDate(
        blocks[i - 1].toDate,
        updatedDates[dateIndex].dateFormat
      );
      blocks[i].fromDate = prevToDate
        ? formatToDisplay(
            addDays(prevToDate, 1),
            updatedDates[dateIndex].dateFormat
          )
        : "";
    }

    updatedDates[dateIndex].blocks = blocks;
    setDates(updatedDates);

    // Reset errors per blockIndex if you're using an array of errors
    if (Array.isArray(dateError)) {
      const errorsCopy = [...dateError];
      if (errorsCopy[dateIndex]?.blocks?.length) {
        errorsCopy[dateIndex].blocks.splice(blockIndex, 1);
      }
      setDateError(errorsCopy);
    }
  };

  //Delete Variations
  const OnDeleteVariations = async (index) => {
    const variationsCopy = [...variations];
    if (variationsCopy[index].variationKeyID !== null) {
      setLoader(true);
      const pricingDriverDelete = await GetPricingDriverUsedInModules(
        globalPricingDriverObj.globalPricingDriverKeyID,
        common.userKeyID,
        null,
        variationsCopy[index].variationKeyID,
        null
      );
      setLoader(false);
      if (pricingDriverDelete?.data?.statusCode === 200) {
        setLoader(false);
        let moduleList = pricingDriverDelete?.data?.responseData?.moduleList;
        if (moduleList.length > 0) {
          // moduleList.map()
          setModelRequestDataForDeleteDriver({
            ...modelRequestDataForDeleteDriver,
            Action: "PricingDriverDelete",
            message: `Cannot delete variation already exist in following`,
            ServiceName: moduleList,
          });
          $("#" + "DeleteDriverModel").modal("show");
        } else {
          setLoader(false);
          setCount(count - 1);
          // First, create a copy of the variations array to avoid modifying it directly

          // Check if the provided index is within the valid range
          if (index >= 0 && index < variationsCopy.length) {
            // Use splice to remove the element at the specified index
            variationsCopy.splice(index, 1);
            // Set isDefault to true for the first element in the modified array
            if (variationsCopy.length > 0) {
              variationsCopy[0].isDefault = true;
            }
            // Update the variations state with the modified array
            setVariations(variationsCopy);
          }
        }
        // Check if the provided index is within the valid range
      }
    } else {
      setCount(count - 1);
      // First, create a copy of the variations array to avoid modifying it directly
      const variationsCopy = [...variations];
      // Check if the provided index is within the valid range
      if (index >= 0 && index < variationsCopy.length) {
        // Use splice to remove the element at the specified index
        variationsCopy.splice(index, 1);
        // Set isDefault to true for the first element in the modified array
        if (variationsCopy.length > 0) {
          variationsCopy[0].isDefault = true;
        }
        // Update the variations state with the modified array
        setVariations(variationsCopy);
      }
      // Check if the provided index is within the valid range
    }
  };

  // Add Variation
  const OnAddVariations = () => {
    setErrorMessage("");
    setCount(count + 1);
    const newVariations = {
      variationKeyID: null,
      variationName: "",
      variationValue: "",
      isDefault: variations.length === 0 ? true : false,
    };
    if (
      variations[variations.length - 1]?.variationName !== "" &&
      variations[variations.length - 1]?.variationValue !== ""
    ) {
      setVariationError({ variationValue: false });
      variations.push(newVariations);
    } else if (
      variations[variations.length - 1]?.variationName === "" ||
      variations[variations.length - 1]?.variationValue === ""
    ) {
      setVariationError({ variationValue: true });
    }
    setTimeout(function () {
      scrollUpDownByElementID(`Variation_Div_${variations.length - 1}`);
    }, 200);
  };

  const specialCharOptions = Utils.specialCharOptions;

  const dateFormats = Utils.dateFormats;

  const handleSpecialCharChange = (selected) => {
    const chars = selected ? selected.map((s) => s.value).join(",") : "";
    setTextDriver((prev) => ({
      ...prev,
      allowedSpecialCharacters: chars,
    }));
  };

  // const OnAddPeriodBlock = () => {
  //   setCount(count + 1);
  //   setErrorMessage("");
  //   const lastDateBlock = dates[dates.length - 1];
  //   if (!lastDateBlock) {
  //     const dateFormat = dateFormats?.[0]?.value || "dd/MM/yyyy";
  //     const newDateBlock = {
  //       dateKeyID: null,
  //       dateFormat,
  //       fromDate: "",
  //       toDate: "",
  //       dateValue: null,
  //     };

  //     const updatedDates = [...dates, newDateBlock];
  //     setDates(updatedDates);

  //     setDateError({
  //       date: false,
  //       fromDate: false,
  //       toDate: false,
  //       dateValue: false,
  //     });

  //     setTimeout(() => {
  //       scrollUpDownByElementID(`Period_Block_${updatedDates.length - 1}`);
  //     }, 200);
  //     return;
  //   }

  //   if (lastDateBlock?.fromDate !== "" && lastDateBlock?.toDate !== "") {
  //     setDateError({ date: false, dateValue: false, fromDate: false, toDate: false });

  //     const dateFormat = lastDateBlock?.dateFormat || "dd/MM/yyyy";
  //     const parsedToDate = parseStoredDate(lastDateBlock?.toDate, dateFormat);

  //     const nextFromDate = new Date(parsedToDate);
  //     nextFromDate.setDate(nextFromDate.getDate() + 1);

  //     const formattedFromDate = formatToDisplay(nextFromDate, dateFormat);

  //     const newDateBlock = {
  //       dateKeyID: null,
  //       dateFormat: dateFormat,
  //       fromDate: formattedFromDate,
  //       toDate: "",
  //       dateValue: null,
  //     };

  //     const updatedDates = [...dates, newDateBlock];
  //     setDates(updatedDates);

  //     setTimeout(() => {
  //       scrollUpDownByElementID(`Period_Block_${updatedDates.length - 1}`);
  //     }, 200);
  //   } else {
  //     console.log(lastDateBlock.toDate);
  //     setDateError({
  //       fromDate: lastDateBlock?.fromDate === "",
  //       toDate: lastDateBlock?.toDate === ""
  //     });
  //   }
  // };

  const OnAddPeriodBlock = () => {
    setCount(count + 1);
    setErrorMessage("");

    const dateFormat = dates[0]?.dateFormat || dateFormats?.[3]?.value;
    console.log(dateFormat);
    const blocks = dates[0]?.blocks || [];
    const lastBlock = blocks[blocks.length - 1];

    if (!lastBlock) {
      // No blocks yet, add the first block
      const newBlock = {
        fromDate: "",
        toDate: "",
        dateValue: null,
      };

      const updatedDates = [...dates];
      updatedDates[0] = {
        ...updatedDates[0],
        dateFormat: dateFormat,
        blocks: [newBlock],
      };

      setDates(updatedDates);
      setDateError({
        date: false,
        fromDate: false,
        toDate: false,
        dateValue: false,
      });

      setTimeout(() => {
        scrollUpDownByElementID(`Period_Block_0`);
      }, 200);
      return;
    }

    // Allow adding new block only if toDate is present
    if (lastBlock.toDate && lastBlock.toDate !== "") {
      setDateError({ date: false, toDate: false });

      const parsedToDate = parseStoredDate(lastBlock.toDate, dateFormat);
      const nextFromDate = addDays(parsedToDate, 1);
      const formattedFromDate = formatToDisplay(nextFromDate, dateFormat);
      console.log(formattedFromDate);
      const newBlock = {
        fromDate: formattedFromDate,
        toDate: "",
        dateValue: null,
      };

      const updatedDates = [...dates];
      updatedDates[0] = {
        ...updatedDates[0],
        blocks: [...blocks, newBlock],
      };

      setDates(updatedDates);

      setTimeout(() => {
        scrollUpDownByElementID(
          `Period_Block_${updatedDates[0].blocks.length - 1}`
        );
      }, 200);
    } else {
      setDateError({ toDate: true });
    }
  };

  const AddPeriodBlock = () => {
    setCount(count + 1);
    const newDates = {
      dateValue: null,
      fromDate: 0,
      toDate: 0,
      isDefault: true,
    };
    slabs.push(newDates);
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

  const formatToDisplay = (date, formatStr) => {
    console.log("date", date);
    console.log("formatStr", formatStr);

    if (!isValid(date) || typeof formatStr !== "string") return "";
    return format(date, formatStr);
  };

  // const OnPeriodBlockChange = (index, field, value) => {
  //   const updatedDates = [...dates];
  //   console.log(updatedDates);
  //   const cleanValue = value?.replace(/[^0-9]/g, '');

  //   const block = updatedDates[index].blocks[0];

  //   if (field === "dateValue") {
  //     block[field] = cleanValue;
  //   } else {
  //     block[field] = value;
  //   }

  //   setDates(updatedDates);

  //   const total = updatedDates.length;

  //   const errors = updatedDates.map((d, i) => {
  //     const fromDate = parseStoredDate(d.blocks[0].fromDate, d.dateFormat);
  //     const toDate = parseStoredDate(d.blocks[0].toDate, d.dateFormat);

  //     return {
  //       date: total === 0,
  //       fromDate: !d.blocks[0].fromDate || d.blocks[0].fromDate === "",
  //       toDate:
  //         (!d.blocks[0].toDate || d.blocks[0].toDate === "") && i < total - 1 ||
  //         (fromDate && toDate && toDate < fromDate),
  //     };
  //   });

  //   // Relax paired field if it's currently being edited
  //   if (field === "fromDate") {
  //     errors[index].toDate = false;
  //   }
  //   if (field === "toDate") {
  //     errors[index].fromDate = false;
  //   }
  //   if (field === "dateValue") {
  //     errors[index].toDate = false;
  //   }

  //   setDateError(errors);
  // };
  const OnPeriodBlockChange = (dateIndex, field, value, blockIndex = 0) => {
    const updatedDates = [...dates];
    const block = updatedDates[dateIndex]?.blocks?.[blockIndex];
    if (!block) return;

    if (field === "dateValue") {
      block.dateValue =
        typeof value === "string" ? value.replace(/[^0-9]/g, "") : value;
    } else {
      block[field] = value;
    }

    setDates(updatedDates);

    const formatStr = updatedDates[dateIndex]?.dateFormat || "dd/MM/yyyy";
    const errors = updatedDates[dateIndex].blocks.map((b, i) => {
      const fromDate = parseStoredDate(b.fromDate, formatStr);
      const toDate = parseStoredDate(b.toDate, formatStr);
      return {
        fromDate: !b.fromDate,
        toDate:
          (!b.toDate && i < updatedDates[dateIndex].blocks.length - 1) ||
          (fromDate && toDate && toDate < fromDate),
        dateValue: !b.dateValue && b.dateValue !== 0,
      };
    });

    setDateError(errors);
  };

  const reformatDate = (dateStr, oldFormat, newFormat) => {
    if (!dateStr || !oldFormat || !newFormat) return "";
    const parsed = parseStoredDate(dateStr, oldFormat);
    return parsed ? formatToDisplay(parsed, newFormat) : "";
  };

  const handleDateFormatChange = (selected) => {
    const newFormat = selected ? selected.value : Utils.dateFormats[0].value;

    if (dates.length === 0) {
      setDates([
        {
          dateFormat: newFormat,
          blocks: [],
        },
      ]);
    } else {
      const updated = dates.map((dateGroup) => {
        const oldFormat = dateGroup.dateFormat;

        return {
          ...dateGroup,
          dateFormat: newFormat,
          blocks: Array.isArray(dateGroup.blocks)
            ? dateGroup.blocks.map((block) => ({
                ...block,
                fromDate: block.fromDate
                  ? reformatDate(block.fromDate, oldFormat, newFormat)
                  : "",
                toDate: block.toDate
                  ? reformatDate(block.toDate, oldFormat, newFormat)
                  : "",
              }))
            : [],
        };
      });

      setDates(updated);
    }

    setDateError({ date: false, dateValue: false });
  };

  const handleDefaultDateValueChange = (e) => {
    const inputValue = e.target.value;
    const cleanValue = inputValue?.replace(/[^0-9]/g, "");

    setDates(
      dates.map((date) => ({
        ...date,
        defaultDateValue: cleanValue === "" ? null : parseInt(cleanValue, 10),
      }))
    );

    setDateError({ date: false, dateValue: false });
  };

  // D] Calling All Api's like Lookup List and other Here :
  // 1) On Change Select Profession Type
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

  const ProfessionalTypeLookeupListOptions = professionTypeLookupList.map(
    (ptype) => ({
      value: ptype.professionTypeId,
      label: ptype.professionTypeName,
    })
  );
  // Select Profession type
  const OnChangeSelectProfessionType = (ptype) => {
    const updatedPfList = ptype.map((option) => ({
      professionTypeId: option.value,
      professionTypeName: option.label,
    }));
    setErrorMessage("");
    setGlobalPricingDriverObj({
      ...globalPricingDriverObj,
      professionTypeList: updatedPfList,
    });
  };

  let professionTypeValue;

  professionTypeValue = globalPricingDriverObj.professionTypeList?.map(
    (item) => ({
      value: item.professionTypeId,
      label: item.professionTypeName,
    })
  );

  //2] On Change Select Driver Type
  const GetDriverTypeData = async () => {
    //Driver Type Api
    try {
      const response = await DriverTypeList();
      if (response) {
        const driverTypeData = response?.data?.responseData.data;
        setDriverType(driverTypeData);
      }
    } catch (error) {
      console.log(error);
    }
  };
  //Driver Type Change
  const OnDriverTypeChange = async (DriverType) => {
    let variationKeyIDs = null;
    let slabKeyIDs = null;
    let dateKeyIDs = null;

    if (globalPricingDriverObj.driverTypeID === 4) {
      if (globalPricingDriverObj.slab.length > 0) {
        slabKeyIDs = slabs.map((slab) => slab.slabKeyID).join(",");
      }
    }
    if (globalPricingDriverObj.driverTypeID === 3) {
      if (globalPricingDriverObj.variation.length > 0) {
        variationKeyIDs = variations
          .map((variation) => variation.variationKeyID)
          .join(",");
      }
    }
    if (globalPricingDriverObj.driverTypeID === 6) {
      if (globalPricingDriverObj.date.length > 0) {
        dateKeyIDs = dates.map((date) => date.dateKeyID).join(",");
      }
    }
    if (globalPricingDriverObj.globalPricingDriverKeyID !== null) {
      // if ((slabKeyIDs !== "" && slabKeyIDs !== undefined && slabKeyIDs !== null) || (variationKeyIDs !== "" && variationKeyIDs !== undefined && variationKeyIDs !== null)) {
      setLoader(true);
      const pricingDriverDelete = await GetPricingDriverUsedInModules(
        globalPricingDriverObj.globalPricingDriverKeyID,
        common.userKeyID,
        null,
        variationKeyIDs,
        slabKeyIDs
      );

      if (pricingDriverDelete?.data?.statusCode === 200) {
        setLoader(false);
        let moduleList = pricingDriverDelete?.data?.responseData?.moduleList;
        if (moduleList.length > 0) {
          // moduleList.map()
          setModelRequestDataForDeleteDriver({
            ...modelRequestDataForDeleteDriver,
            Action: "PricingDriverDelete",
            message:
              slabKeyIDs !== null
                ? `Cannot delete slab already exist in following`
                : `Cannot delete variation already exist in following`,
            ServiceName: moduleList,
          });
          $("#" + "DeleteDriverModel").modal("show");
        } else {
          setErrorMessage("");
          setGlobalPricingDriverObj({
            ...globalPricingDriverObj,
            driverTypeID: DriverType.value,
            slab: [
              {
                slabTypeID: "",
                slabValue: "",
                slabFrom: 0,
                slabTo: 0,
                isDefault: false,
              },
            ],
            date: [
              {
                dateFormat: "",
                fromDate: "",
                toDate: "",
                dateValue: null,
                isDefault: false,
              },
            ],
          });
          if (DriverType.value === 4) {
            setSlabs([]);
          }
          if (DriverType.value === 6) {
            setDates([]);
          }
          setDriverTypeValue1(DriverType);
        }
      }
      // } else {
      //   setErrorMessage("");
      //   setGlobalPricingDriverObj({
      //     ...globalPricingDriverObj,
      //     driverTypeID: DriverType.value,
      //     slab: [
      //       {
      //         slabTypeID: "",
      //         slabValue: "",
      //         slabFrom: 0,
      //         slabTo: 0,
      //         isDefault: false,
      //       },
      //     ],
      //   });
      //   if (DriverType.value === 4) {
      //     setSlabs([]);
      //   }
      //   setDriverTypeValue1(DriverType);
      // }
    } else {
      setErrorMessage("");
      setGlobalPricingDriverObj({
        ...globalPricingDriverObj,
        driverTypeID: DriverType.value,
        slab: [
          {
            slabTypeID: "",
            slabValue: "",
            slabFrom: 0,
            slabTo: 0,
            isDefault: false,
          },
        ],
      });
      if (DriverType.value === 4) {
        setSlabs([]);
      }
      setDriverTypeValue1(DriverType);
    }
  };

  let driverTypeValue;

  driverTypeValue = driverType?.map((DriverType) => ({
    value: DriverType.driverTypeId,
    label: DriverType.driverTypeName,
  }));
  //3] On Change Select Driver Type
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

  // F] Calling CRUD Api here
  // 1) Get Model Data Api
  const GetServiceCategoryModelData = async (id, GetSAChanges) => {
    //Service Category Edit Data Api
    if (!id) {
      return;
    }
    setLoader(true);
    try {
      const response = await GetGlobalPricingDriverModel(id, GetSAChanges);
      if (response) {
        if (response?.data?.statusCode === 200) {
          setLoader(false);
          if (response?.data?.responseData?.data) {
            const ModelData = response?.data?.responseData?.data;
            const driverTypeValueNew = driverType?.filter(
              (DriverType) => DriverType.driverTypeId === ModelData.driverTypeID
            );
            const driverTypeConvert = driverTypeValueNew.map((i) => ({
              value: i.driverTypeId,
              label: i.driverTypeName,
            }));
            setDriverTypeValue1(driverTypeConvert);
            setGlobalPricingDriverObj({
              ...globalPricingDriverObj,
              globalPricingDriverKeyID: ModelData.globalPricingDriverKeyID,
              organisationKeyID: common.organisationKeyID,
              CreatedByID: common.userId,
              driverName: ModelData.driverName,
              driverTypeID: ModelData.driverTypeID,
              addedFor: props?.modelRequestData?.addedFor || ModelData.addedFor,
              professionTypeList: ModelData.professionTypeList,

              isDefault: ModelData.isDefault,
              keyID: ModelData.globalPricingDriverKeyID,
            });
            driverTypeValue = driverType?.map((DriverType) => ({
              value: DriverType.driverTypeId,
              label: DriverType.driverTypeName,
            }));
            let variation = [
              { variationName: "", variationValue: "", isDefault: false },
            ];
            if (ModelData.driverTypeID === 3) {
              const ModifyVariation = ModelData.variation.map((item) => ({
                ...item,
                variationValue: item.variationValue,
              }));
              variation = ModifyVariation;
            }
            setVariations(variation);

            const ModifySlab = ModelData.slab.map((item) => ({
              ...item,
              slabFrom:
                item.slabFrom !== null && item.decimalPlaces !== undefined
                  ? parseFloat(item.slabFrom).toFixed(item.decimalPlaces ?? 2)
                  : item.slabFrom,
              slabTo:
                item.slabTo !== null && item.decimalPlaces !== undefined
                  ? parseFloat(item.slabTo).toFixed(item.decimalPlaces ?? 2)
                  : item.slabTo,
              slabValue: item.slabValue,
            }));

            setSlabs(ModifySlab);
            if (ModelData.driverTypeID === 6) {
              const ModifyDate = (ModelData.date || []).map((item) => ({
                ...item,
                blocks: (item.blocks || []).map((block) => ({
                  ...block,
                  dateValue: block.dateValue,
                  fromDate: block.fromDate,
                  toDate: block.toDate,
                })),
              }));
              setDates(ModifyDate);
            }
            if (
              ModelData.driverTypeID === 5 &&
              ModelData.text &&
              ModelData.text.length > 0
            ) {
              const textData = ModelData.text[0]; // Take the first text driver
              setTextDriver({
                textKeyID: textData.textKeyID || null,
                textValue: textData.textValue || null,
                textLength: textData.textLength || null,
                allowedSpecialCharacters:
                  textData.allowedSpecialCharacters || "",
              });
            } else if (ModelData.driverTypeID === 5) {
              // Reset textDriver if no text data exists
              setTextDriver({
                textKeyID: null,
                textValue: "",
                textLength: null,
                allowedSpecialCharacters: "",
              });
            }
            if (ModelData.driverTypeID === 2) {
              const quantityData = ModelData.quantity[0]; // Take the first text driver
              setQuantity([
                {
                  quantityKeyID: quantityData.quantityKeyID || null,
                  quantityDecimalPlaces:
                    quantityData.quantityDecimalPlaces !== undefined &&
                    quantityData.quantityDecimalPlaces !== null
                      ? quantityData.quantityDecimalPlaces
                      : 2,
                  quantityFrom: quantityData.quantityFrom,
                  quantityTo: quantityData.quantityTo,
                },
              ]);
            }
            professionTypeValue =
              globalPricingDriverObj.professionTypeList?.map((item) => ({
                value: item.professionTypeId,
                label: item.professionTypeName,
              }));
          }
        } else {
          setErrorMessage(response?.data?.errorMessage);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // 2) Add Update Button Click Function
  const GlobalPricingDriverAddUpdateBtnClicked = (Accept) => {

    console.log(props?.modelRequestData?.addedFor);
    let hasError = false;
    const variationData =
      globalPricingDriverObj.driverTypeID === 3 ? variations : null;
    const slabData = globalPricingDriverObj.driverTypeID === 4 ? slabs : null;
    const dateData = globalPricingDriverObj.driverTypeID === 6 ? dates : null;
    const textData =
      globalPricingDriverObj.driverTypeID === 5 ? [textDriver] : null;
    const quantityData =
      globalPricingDriverObj.driverTypeID === 2 ? quantity : null;
    const ModifySlab = slabData?.map((item) => ({
      ...item,
      slabValue: item.slabValue,
    }));
    const ModifyVariation = variationData?.map((item) => ({
      ...item,
      variationValue: item.variationValue,
    }));
    const ModifyDate = dateData?.map((item) => ({
      ...item,
      dateValue: item.dateValue,
    }));
    const ModifyText = textData;
    if (Accept === "Accept") {
      $("#" + "ConfirmSAChangesModel").modal("show");

      setStatus(true);
      return;
    }
    const ApiRequest_ParamsObj = {
      organisationKeyID: common.organisationKeyID,
      userKeyID: common.userKeyID,
      isPredefined: common.roleTypeId === USER_ROLE_TYPE.Admin ? 0 : 1,
      globalPricingDriverKeyID: globalPricingDriverObj.globalPricingDriverKeyID,
      driverName: globalPricingDriverObj.driverName,
      driverTypeID: globalPricingDriverObj.driverTypeID,
      addedFor: props?.modelRequestData?.addedFor || globalPricingDriverObj.addedFor,
      acceptSAChanges: Accept,
      professionTypeList:
        common.professionTypeLists?.length > 1 ||
        common.organisationKeyID === null
          ? globalPricingDriverObj.professionTypeList
          : [
              {
                professionTypeId: professionTypeInputValue[0]?.professionTypeId,
                professionTypeName:
                  professionTypeInputValue[0]?.professionTypeName,
              },
            ],

      variation: ModifyVariation,
      slab: ModifySlab,
      date: ModifyDate,
      text: ModifyText,
      quantity: quantityData,
      isDefault: globalPricingDriverObj.isDefault,
    };
    console.log(ApiRequest_ParamsObj);
    //Check Validations if any
    //Return false if validation fails
    if (
      (common.professionTypeLists?.length > 1 ||
        common.organisationKeyID === null) &&
      professionTypeValue?.length === 0
    ) {
      setGdriverError(true);
      return false; // Return false or handle your error logic here if needed.
    } else if (globalPricingDriverObj.driverName === "") {
      scrollUpDownByElementID("DriverName");
      setGdriverError(true);
    } else if (globalPricingDriverObj.driverTypeID === "") {
      scrollUpDownByElementID("DriverName");
      setGdriverError(true);
    } else if (globalPricingDriverObj.driverTypeID === 2) {
      if (quantityData.length === 0) {
        console.log("empty");
        scrollUpDownByElementID("Quantity");
        setQtyError({ quantityError: true });
        hasError = true;
      } else {
        if (
          quantityData[0].quantityFrom &&
          quantityData[0].quantityFrom.trim() !== "" &&
          quantityData[0].quantityTo &&
          quantityData[0].quantityTo.trim() !== "" &&
          Number(quantityData[0].quantityFrom) >=
            Number(quantityData[0].quantityTo)
        ) {
          console.log("Err");
          setQtyError({ quantityError: true });
          hasError = true;
        } else {
          AddUpdateGlobalPricingDriverData(ApiRequest_ParamsObj);
        }
      }
    } else if (globalPricingDriverObj.driverTypeID === 3) {
      if (variations.length === 0) {
        scrollUpDownByElementID("Variation");
        setVariationError({ variation: true });
      } else {
        for (let varIndex = 0; varIndex < variations.length; varIndex++) {
          scrollUpDownByElementID(`Variation_Div_${varIndex}`);
          if (
            variations[varIndex]?.variationName === "" &&
            variations[varIndex]?.variationValue === ""
          ) {
            setVariationError({
              ...variationError,
              variationName: true,
              variationValue: true,
            });

            hasError = true;
            break;
          } else if (variations[varIndex]?.variationValue === "") {
            setVariationError({
              ...variationError,
              variationValue: true,
            });

            hasError = true;
            break;
          } else if (variations[varIndex]?.variationName === "") {
            setVariationError({
              ...variationError,
              variationName: true,
            });

            hasError = true;
            break;
          } else if (variations[varIndex]?.variationName !== "") {
            const duplicateVariationFound = variations?.filter(
              (item, index) => {
                // Check if there is any item with the same variationName before the current index
                return variations
                  .slice(0, index)
                  .some(
                    (prevItem) => prevItem.variationName === item.variationName
                  );
              }
            );

            if (duplicateVariationFound.length > 0) {
              // Remove duplicates from the array
              const uniqueVariations = Array.from(
                new Set(
                  duplicateVariationFound.map((item) => item.variationName)
                )
              );
              // Construct the error message
              const duplicateNames = uniqueVariations.join(", ");
              setErrorMessageTitle(
                `Variation ${duplicateNames} already exist. Please choose different name.`
              );
              setOpenErrorModal(true);
              hasError = true;
              break;
            }
          }
        }
        if (!hasError) {
          AddUpdateGlobalPricingDriverData(ApiRequest_ParamsObj);
        }
      }
    } else if (globalPricingDriverObj.driverTypeID === 4) {
      if (slabs.length === 0) {
        scrollUpDownByElementID("Slab");
        setSlabError({ slab: true });
      } else {
        let isValidSlabs = true;
        for (let i = 0; i < slabs.length; i++) {
          // const element = document.getElementById(`Slab_Value_${i}`);
          // if (element) {
          //   element.focus();
          // }

          // const element = document.getElementById(`Slab_Div_${i}`);
          // if (element) {
          //   element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // }
          scrollUpDownByElementID(`Slab_Div_${i}`);

          if (slabs[i].slabTypeID === "") {
            setSlabError({ slabType: true });
            isValidSlabs = false;

            break;
          } else if (slabs[i].slabValue === "") {
            setSlabError({ slabValue: true });
            isValidSlabs = false;
            break;
          } else if (slabs[i].slabFrom === "") {
            setSlabError({ slabValue: true });
            isValidSlabs = false;
            break;
          } else if (
            slabs[i].slabTypeID == 1 &&
            parseFloat(slabs[i].slabTo) < parseFloat(slabs[i].slabFrom)
          ) {
            setSlabError({ slabValue: true });
            isValidSlabs = false;
            break;
          } else if (slabs[i].slabTo === "") {
            setSlabError({ slabValue: true });
            isValidSlabs = false;
            break;
          }
        }

        if (isValidSlabs) {
          AddUpdateGlobalPricingDriverData(ApiRequest_ParamsObj);
        } else {
          return false; // Return false or handle your error logic here if needed.
        }
      }
    } else if (globalPricingDriverObj.driverTypeID === 6) {
      console.log(dates);

      let isValidDates = true;
      const errors = [];
      if (!dates[0]?.dateFormat) {
        setDateError({ ...dateError, dateFormat: true });
        isValidDates = false;
      }
      for (let i = 0; i < dates[0]?.blocks?.length; i++) {
        scrollUpDownByElementID(`Date_Div_${i}`);

        const { fromDate, toDate, dateValue, dateFormat } = dates[0]?.blocks[i];
        const parsedFrom = parseStoredDate(fromDate, dateFormat);
        const parsedTo = parseStoredDate(toDate, dateFormat);

        // toDate is required unless it's the last block
        if ((!toDate || toDate.trim() === "") && i < dates.length - 1) {
          setDateError({ ...dateError, toDate: true });
          isValidDates = false;
        }
        if (
          (!dates[0].blocks[i]?.fromDate ||
            dates[0].blocks[i]?.fromDate == "") &&
          (!dates[0].blocks[i]?.toDate || dates[0].blocks[i]?.toDate == "")
        ) {
          setDateError({ ...dateError, date: true });
          isValidDates = false;
        }
      }

      if (isValidDates) {
        AddUpdateGlobalPricingDriverData(ApiRequest_ParamsObj);
      } else {
        return false; // Do not submit
      }
    } else if (globalPricingDriverObj.driverTypeID === 5) {
      if (textData.length === 0) {
        scrollUpDownByElementID("Text");
        setTextError({ text: true });
      } else {
        let isValidText = true;

        for (let i = 0; i < textData.length; i++) {
          scrollUpDownByElementID(`Text_Div_${i}`);

          const { textValue, textLength } = textData[i];

          // if (!textValue || textValue.trim() === "" || textValue === null) {
          //   setTextError({ ...textError, textValue: true });
          //   isValidText = false;
          // }
          if (!textLength || textLength === null) {
            setTextError({ ...textError, textLength: true });
            isValidText = false;
          }
        }
        if (isValidText) {
          AddUpdateGlobalPricingDriverData(ApiRequest_ParamsObj);
        } else {
          return false; // Do not submit
        }
      }
    } else {
      setGdriverError(""); // Clear the error message if there are no errors.
      AddUpdateGlobalPricingDriverData(ApiRequest_ParamsObj);
    }
  };

  // Add or Update Service Category Data
  const AddUpdateGlobalPricingDriverData = async (ApiRequest_ParamsObj) => {
    setLoader(true);
    try {
      let URL = "/AddUpdateGlobalPricingDriver";
      if (props.modelRequestData.Action !== null) {
        URL = `/AddUpdateGlobalPricingDriver?Action=${props.modelRequestData.Action}`;
      }

      const response = await AddUpdateGlobalPricingDriver(
        URL,
        ApiRequest_ParamsObj
      );
      if (response) {
        setLoader(false);
        if (response?.data?.statusCode === 200) {
          if (ApiRequest_ParamsObj.Action === null) {
            // $('#' + props.id).modal('hide')
            $("#" + "ConfirmSAChangesModel").modal("hide");
            setOpenSuccessModal(true);
            props.setIsAddUpdateActionDone(true);
          } else {
            const services =
              response?.data.responseData.globalConstantExistsInServices;

            if (services.length > 0) {
              const serviceName = services.map((item) => item.serviceName);
              setModelRequestData({
                Action: "Update",
                message: `This Global Constant Driver is being used in the below Services:`,
                ServiceName: serviceName,
                name: "services",
              });
              setOpenSuccessModal(true);
              props.setIsAddUpdateActionDone(true);
            } else {
              setModelRequestData({ ServiceName: [] });
              setOpenSuccessModal(true);
              props.setIsAddUpdateActionDone(true);
            }
            $("#" + "ConfirmSAChangesModel").modal("hide");
          }
        } else {
          $("#" + "ConfirmSAChangesModel").modal("hide");
          setErrorMessage(response?.response?.data?.errorMessage);
        }
      }
    } catch (error) {
      $("#" + "ConfirmSAChangesModel").modal("hide");
      console.log(error);
    }
  };

  const formatDisplayValue = (value, decimalPlaces) => {
    if (!value || value === "") return "";

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;

    if (decimalPlaces === 0) {
      return Math.floor(numValue).toString();
    }

    // Force exact decimal places when formatting
    return numValue.toFixed(decimalPlaces);
  };

  const handleQuantityInput = (raw, decimalPlaces) => {
    if (!raw) return "";

    // Remove all but digits and dot
    let cleaned = raw.replace(/[^0-9.]/g, "");

    // Keep only first dot
    const firstDot = cleaned.indexOf(".");
    if (firstDot !== -1) {
      const beforeDot = cleaned.slice(0, firstDot + 1);
      const afterDot = cleaned.slice(firstDot + 1).replace(/\./g, "");
      cleaned = beforeDot + afterDot;
    }

    if (decimalPlaces === 0) {
      return cleaned.split(".")[0];
    }

    if (cleaned.includes(".")) {
      const [intPart, decPart] = cleaned.split(".");
      return `${intPart}.${decPart.slice(0, decimalPlaces)}`;
    }

    return cleaned;
  };

  const handleClose = async () => {
    if (isCheck) {
      setLoader(true);
      const Notification = await NotifySuperAdminPredefinedChangesToAdmin({
        userKeyID: common.userKeyID,
        moduleKeyID: globalPricingDriverObj.globalPricingDriverKeyID,
        moduleName: "Predefined-GlobalPricingDriver",
      });
      if (Notification?.data?.statusCode === 200) {
        setLoader(false);
        setModelAction("NotificationSend");
        setOpenSuccessModal(true);
        setIsCheck(false);
      }
    } else {
      $("#" + props.id).modal("hide");
      setOpenSuccessModal(false);
    }
  };

  // Close Delete DriverModel
  const handleCloseDeleteDriverModel = () => {
    $("#" + "DeleteDriverModel").modal("hide");

    setOpenDeleteDriverModel(false);
  };

  const professionTypeInputValue = professionTypeLookupList?.filter(
    (item) => common.professionTypeLists[0] === item.professionTypeId
  );

  const DriverValue = (e, index, Type) => {
    // Ensure that the input only contains numeric characters
    const sanitizedInput = e.target.value
      .replace(/[^0-9.-]/g, "") // Allow only numeric, dot, and negative sign characters
      .slice(0, 16); // Limit to 8 characters (5 digits + 1 dot + 1 decimal + 1 negative sign)
    const currentDecimalPlaces = slabs[index]?.decimalPlaces ?? 2;
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
    if (Type === "variationValue") {
      OnVariationChange(
        index,
        "variationValue",
        formattedInput.replace(/-/g, (match, index) =>
          index === 0 ? match : ""
        )
      );
    } else if (Type === "slabValue") {
      OnSlabChange(
        index,
        "slabValue",
        formattedInput.replace(/-/g, (match, index) =>
          index === 0 ? match : ""
        )
      );
    } else if (Type === "slabFrom") {
      OnSlabChange(
        index,
        "slabFrom",
        formattedInput.replace(/-/g, (match, index) =>
          index === 0 ? match : ""
        )
      );
    } else if (Type === "slabTo") {
      const updatedSlabs = [...slabs];
      updatedSlabs[index].slabTo = formattedInput.replace(
        /-/g,
        (match, index) => (index === 0 ? match : "")
      );
      // Update the next slab's slabFrom based on the current slab's slabTo
      const nextSlabIndex = index + 1;
      if (nextSlabIndex < slabs.length) {
        var fromValueForNewSlab = Number(formattedInput) + 0.01;
        fromValueForNewSlab = Math.round(fromValueForNewSlab * 100) / 100;
        updatedSlabs[nextSlabIndex].slabFrom = fromValueForNewSlab; //Number(formattedInput) + 0.01;
      }
      setSlabs(updatedSlabs);
    }
  };

  const HandleClose = () => {
    if (openErrorModal === true) {
      setOpenErrorModal(false);
    }
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
        moduleKeyID: props.modelRequestData.globalPricingDriverKeyID,
        moduleName: "Predefined-GlobalPricingDriver",
        //Predefined-ServiceCategory, Predefined-GlobalConstant, Predefined-GlobalPricingDriver,
        //Predefined-PL-EL-Template, Predefined-TnC-Template, Predefined-Email-Template,
        //Predefined-Service, Predefined-ServicePackage
      };
      const response = await DeclineSuperAdminChanges(apiRequestParams);
      if (response) {
        setLoader(false);
        if (response?.data?.statusCode === 200) {
          if (apiRequestParams.Action === null) {
            $("#" + props.id).modal("hide");
            $("#" + "ConfirmSAChangesModel").modal("hide");
            // setOpenSuccessModal(true);
            props.setIsAddUpdateActionDone(true);
          } else {
            $("#" + props.id).modal("hide");
            $("#" + "ConfirmSAChangesModel").modal("hide");
            // setOpenSuccessModal(true);
            props.setIsAddUpdateActionDone(true);
          }
        } else {
          $("#" + "ConfirmSAChangesModel").modal("hide");
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
      GlobalPricingDriverAddUpdateBtnClicked(true);
    } else {
      DeclineSuperAdminChangesData();
    }
  };
  //Design part :
  return (
    <div
      style={{ display: openSuccessModal && "none" }}
      class={props.class}
      id={props.id}
      ref={modalRef}
      tabIndex={props.tabIndex}
      aria-labelledby={props.aria_labelledby}
      aria-hidden={props.aria_hidden}
      data-bs-backdrop="static"
      data-bs-keyboard="true"
    >
      <div class="modal-dialog modal-md modal-dialog-centered pricing-driver-popup">
        <div class="modal-content">
          <div class="modal-header bg-light p-3">
            <h5 class="modal-title" id="exampleModalLabel">
              {modelAction === "Add"
                ? getCrudPopUpTitleName("Add", moduleName)
                : getCrudPopUpTitleName("Update", moduleName)}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              id="close-modal"
              onClick={SetInitialModelData}
            ></button>
          </div>
          <div class="modal-body gpd-scroll">
            <div class="tab-content">
              <div className="row" id="DriverName">
                <SAPredefinedChangesNotifyMessageModel
                  Params={{
                    moduleName: moduleName,
                    SAChanges: props.modelRequestData.Type,
                  }}
                />
                {(common.professionTypeLists?.length > 1 ||
                  common.organisationKeyID === null) && (
                  <div className="col-lg-12">
                    <div className="mb-3 ">
                      <label className="form-label">
                        Profession Type<span className="text-danger">*</span>
                      </label>
                      <div className="col-12 ">
                        <div className="input-group">
                          {common.professionTypeLists?.length > 1 ||
                          common.organisationKeyID === null ? (
                            <Select
                              isMulti
                              isDisabled={
                                globalPricingDriverObj.addedFor ===
                                  "Predefined-NOB" ||
                                globalPricingDriverObj.addedFor ===
                                  "Predefined-PT"
                              }
                              style={{ padding: "5px" }}
                              className="user-role-select"
                              options={ProfessionalTypeLookeupListOptions}
                              value={professionTypeValue}
                              onChange={OnChangeSelectProfessionType}
                            />
                          ) : (
                            ""
                          )}
                        </div>
                        {gdrivererror &&
                        (common.professionTypeLists?.length > 1 ||
                          common.organisationKeyID === null) &&
                        professionTypeValue?.length === 0 ? (
                          <label className="validation">{ERROR_MESSAGES}</label>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="col-lg-12">
                  <div className="mb-3 ">
                    <label className="form-label">
                      Driver Name <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="input-text"
                        placeholder="Enter Driver Name"
                        value={globalPricingDriverObj.driverName}
                        disabled={
                          globalPricingDriverObj.addedFor ===
                            "Predefined-NOB" ||
                          globalPricingDriverObj.addedFor === "Predefined-PT"
                        }
                        onChange={(e) => {
                          setErrorMessage("");
                          const inputValue = e.target.value;
                          const trimmedValue = inputValue.replace(/^\s+/g, ""); // Remove leading spaces
                          // Handle consecutive spaces
                          const singleSpaceValue = trimmedValue.replace(
                            /\s{2,}/g,
                            " "
                          );
                          // Remove dot if it follows a space
                          const sanitizedValue = singleSpaceValue.replace(
                            / \./g,
                            " "
                          );
                          const capitalizedValue =
                            sanitizedValue.charAt(0).toUpperCase() +
                            sanitizedValue.slice(1);
                          setGlobalPricingDriverObj({
                            ...globalPricingDriverObj,
                            driverName: capitalizedValue,
                          });
                        }}
                        maxLength={75}
                      />
                    </div>
                    {gdrivererror &&
                    globalPricingDriverObj.driverName === "" ? (
                      <label className="validation">{ERROR_MESSAGES}</label>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <div className="col-lg-12">
                  <div className="mb-3 ">
                    <label className="form-label">
                      Driver Type <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <DropDown
                        className="phone-input-country-code selectDropDown Drop-down-width driver-type-cls"
                        options={driverTypeValue}
                        value={driverTypeValue1}
                        onChange={OnDriverTypeChange}
                        placeholder="Select..."
                        disabled={
                          globalPricingDriverObj.addedFor ===
                            "Predefined-NOB" ||
                          globalPricingDriverObj.addedFor === "Predefined-PT"
                        }
                      />
                    </div>
                    {gdrivererror && driverTypeValue1.length === 0 ? (
                      <label className="validation">{ERROR_MESSAGES}</label>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>

              {/* <!-- end tab row --> */}
              {/* <!-- Start tab row --> */}
              {globalPricingDriverObj.driverTypeID === 3 && (
                <div class="row">
                  <div class="col-xl-12 col-lg-12">
                    {variations?.map((i, index) => {
                      return (
                        <div
                          id={`Variation_Div_${index}`}
                          class="card-1 pricing-box p-4 mt-4"
                          draggable="true"
                          onDragStart={(e) => {
                            e.dataTransfer.setData("index", index);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const sourceIndex = e.dataTransfer.getData("index");
                            const targetIndex = index;

                            // Rearrange the templateElementList based on the drag-and-drop
                            if (sourceIndex !== targetIndex) {
                              const variationsList = [...variations];
                              const [draggedItem] = variationsList.splice(
                                sourceIndex,
                                1
                              );
                              variationsList.splice(
                                targetIndex,
                                0,
                                draggedItem
                              );
                              setVariations(variationsList);
                            }
                          }}
                          key={index}
                        >
                          <div class="col-lg-6 col-md-6">
                            <p
                              class="office-name font-weight"
                              style={{ width: "auto", zIndex: "0" }}
                            >
                              Variation {index + 1}
                            </p>
                          </div>

                          <p
                            class="delete delete-margin "
                            style={{ marginBottom: "0", width: "auto" }}
                          >
                            <button
                              disabled={
                                variations[index].canDelete === false
                                  ? true
                                  : false
                              }
                              onClick={() => OnDeleteVariations(index)}
                              class="btn btn-sm btn-danger remove-item-btn d-flex gap-1 globalDriver"
                            >
                              <i class="ri-delete-bin-5-fill"></i>
                              <p className="delete-margin font-12">
                                Delete Variation
                              </p>
                            </button>
                          </p>
                          <div class="row mt-1">
                            <div className="col-lg-6">
                              <div className="mb-3 ">
                                <label className="form-label">
                                  Variation Name{" "}
                                  <span className="text-danger">*</span>
                                </label>
                                <div className="input-group">
                                  <input
                                    disabled={
                                      variations[index].canDelete === false
                                        ? true
                                        : false
                                    }
                                    type="text"
                                    className="input-text"
                                    placeholder="Enter Variation Name"
                                    value={
                                      variations[index]
                                        ? variations[index].variationName
                                        : ""
                                    }
                                    onChange={(e) => {
                                      setErrorMessage("");
                                      const inputValue = e.target.value;
                                      const trimmedValue = inputValue.replace(
                                        /^\s+/g,
                                        ""
                                      ); // Remove leading spaces
                                      if (/^\d/.test(trimmedValue)) {
                                        // setErrorMessage("Driver name cannot start with a number");
                                        return; // Do not update state if numeric value is detected
                                      }
                                      const capitalizedValue =
                                        trimmedValue.charAt(0).toUpperCase() +
                                        trimmedValue.slice(1);
                                      OnVariationChange(
                                        index,
                                        "variationName",
                                        capitalizedValue
                                      );
                                    }}
                                    maxLength={200}
                                  />
                                </div>
                                {variationError?.variationName &&
                                variations[index].variationName === "" ? (
                                  <label className="validation">
                                    {ERROR_MESSAGES}
                                  </label>
                                ) : (
                                  ""
                                )}
                              </div>
                            </div>
                            <div className="col-lg-6">
                              <div className="mb-3 ">
                                <label className="form-label">
                                  Variation Value{" "}
                                  <span className="text-danger">*</span>
                                </label>
                                <div className="input-group">
                                  <input
                                    type="text"
                                    className="input-text"
                                    placeholder="Enter Variation Value"
                                    // value={variations[index].variationValue === "" ? "" : variations[index].variationValue.includes("-") ?
                                    //   `-${Number(variations[index].variationValue.replace('-', '')).toLocaleString("en-US")}` :
                                    //   Number(variations[index].variationValue).toLocaleString("en-US")
                                    // }
                                    value={variations[index].variationValue
                                      .toString()
                                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                    onChange={(e) => {
                                      DriverValue(e, index, "variationValue");
                                    }}
                                  />
                                </div>

                                {variationError.variationValue &&
                                variations[index].variationValue === "" ? (
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
                                  verticalAlign: "middle",
                                }}
                                type="radio"
                                id={`variation${index}`}
                                name="variations"
                                disabled={
                                  variations[index].canDelete === false
                                    ? true
                                    : false
                                }
                                checked={variations[index].isDefault}
                                onChange={(e) => OnVariationsRadioChange(index)}
                              />
                              <label
                                className="toggle"
                                name="variations"
                                style={{
                                  cursor: "pointer",
                                  marginTop: "0",
                                  marginBottom: "0",
                                }}
                                htmlFor={`variation${index}`}
                              >
                                Set to Default
                              </label>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {variationError.variation && variations.length === 0 ? (
                      <label
                        id="Variation"
                        className="col-lg-12 col-12 variation-validation"
                      >
                        At least 1 Variation is required.
                      </label>
                    ) : (
                      ""
                    )}
                    {/* <p class="delete-right mt-2">
                      <button
                        onClick={OnAddVariations}
                        class="btn btn-md btn-success create-item-btn d-flex gap-1"
                      >
                        <i class="bi bi-plus-circle"></i>
                        <span className="font-12">Add Variation</span>
                      </button>
                    </p> */}
                  </div>
                </div>
              )}

              {/* <!-- end tab row --> */}
              {globalPricingDriverObj.driverTypeID == 4 && (
                <div class="row">
                  <div class="col-xl-12 col-lg-12">
                    {slabError.slab && slabs.length === 0 ? (
                      <label
                        id="Slab"
                        className="col-lg-12 col-12 variation-validation"
                      >
                        At least 1 Slab is required.
                      </label>
                    ) : (
                      ""
                    )}
                    {/* {slabs.length === 0 && (
                      <p class="delete-right" style={{ marginBottom: "0" }}>
                        <button
                          onClick={AddSlab}
                          class="btn btn-md btn-success create-item-btn d-flex gap-1"
                        >
                          <i class="bi bi-plus-circle"></i>
                          <span className="font-12">Add Slab</span>
                        </button>
                      </p>
                    )} */}
                    <div className="col-lg-6">
                      <div className="mb-1">
                        <label className="form-label">
                          Decimal Places <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <Select
                            className="user-role-select"
                            value={{
                              value: slabs[0]?.decimalPlaces ?? 2,
                              label: Utils.getDecimalPlaceLabel(
                                slabs[0]?.decimalPlaces ?? 2
                              ),
                            }}
                            onChange={(selectedOption) =>
                              OnSlabChange(
                                0,
                                "decimalPlaces",
                                selectedOption.value
                              )
                            }
                            options={Utils.DECIMAL_PLACE_OPTIONS}
                          />
                        </div>
                      </div>
                    </div>
                    {slabs?.map((i, index) => {
                      return (
                        <>
                          <div
                            class="card-1 pricing-box p-4 mt-4"
                            key={index}
                            id={`Slab_Div_${index}`}
                          >
                            <div class="col-lg-6 col-md-6 ">
                              <p
                                class="office-name font-weight"
                                style={{ width: "auto", zIndex: "0" }}
                              >
                                Slab{index + 1}
                              </p>
                            </div>

                            <p
                              class="delete delete-margin "
                              style={{ marginBottom: "0", width: "auto" }}
                            >
                              <button
                                disabled={props.disable}
                                onClick={() => OnDeleteSlabs(index)}
                                class="btn btn-sm btn-danger remove-item-btn d-flex gap-1 globalDriver"
                              >
                                <i class="ri-delete-bin-5-fill"></i>
                                <p className="delete-margin font-12">
                                  Delete Slab
                                </p>
                              </button>
                            </p>
                            <div class="row mt-1">
                              <div className="col-lg-6">
                                <div className="mb-3 ">
                                  <label className="form-label">
                                    Slab Type{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                  <div className="input-group">
                                    <Select
                                      className="user-role-select"
                                      onChange={(selectedOption) => {
                                        setErrorMessage("");
                                        OnSlabChange(
                                          index,
                                          "slabTypeID",
                                          selectedOption.value
                                        );
                                      }}
                                      value={slabType
                                        ?.filter(
                                          (item) =>
                                            item.slabTypeId ===
                                            slabs[index].slabTypeID
                                        )
                                        .map((i) => ({
                                          value: i.slabTypeId,
                                          label: i.slabTypeName,
                                        }))}
                                      options={slabType?.map((item) => ({
                                        value: item.slabTypeId,
                                        label: item.slabTypeName,
                                      }))}
                                      placeholder="Select..."
                                    />
                                  </div>
                                  {slabError.slabType &&
                                  slabs[index].slabTypeID === "" ? (
                                    <label className="validation">
                                      {ERROR_MESSAGES}
                                    </label>
                                  ) : (
                                    ""
                                  )}
                                </div>
                              </div>
                              {slabs && slabs[index]?.slabTypeID == "1" && (
                                <>
                                  <div className="col-lg-6">
                                    <div className="mb-3 ">
                                      <label className="form-label">
                                        Value{" "}
                                        <span className="text-danger">*</span>
                                      </label>
                                      <div className="input-group">
                                        <input
                                          type="text"
                                          className="input-text"
                                          placeholder="Value"
                                          value={
                                            slabs[index].slabValue === ""
                                              ? ""
                                              : slabs[index].slabValue
                                                  .toString()
                                                  .replace(
                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                    ","
                                                  )
                                          }
                                          onChange={(e) => {
                                            DriverValue(e, index, "slabValue");
                                          }}
                                          onWheel={(e) => e.preventDefault()}
                                        />
                                      </div>
                                      <div className="invalid-feedback">
                                        Please enter Slab Value
                                      </div>
                                      {slabError.slabValue &&
                                      slabs[index].slabValue === "" ? (
                                        <label className="validation">
                                          {ERROR_MESSAGES}
                                        </label>
                                      ) : (
                                        ""
                                      )}
                                    </div>
                                  </div>

                                  <div className="col-lg-6">
                                    <div className="mb-3 ">
                                      <label
                                        htmlFor="useremail"
                                        className="form-label"
                                      >
                                        From{" "}
                                        <span className="text-danger">*</span>
                                      </label>
                                      <div className="input-group">
                                        <input
                                          type="text"
                                          className="input-text"
                                          placeholder="From"
                                          // disabled={props.disable}
                                          disabled={index === 0 ? false : true}
                                          value={
                                            slabs[index].slabFrom === ""
                                              ? ""
                                              : slabs[index].slabFrom
                                                  .toString()
                                                  .replace(
                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                    ","
                                                  )
                                          }
                                          // onChange={(e) => OnSlabChange(index, 'slabFrom', e.target.value)}
                                          onChange={(e) => {
                                            DriverValue(e, index, "slabFrom");
                                          }}
                                          onBlur={() => {
                                            const updatedSlabs = [...slabs];
                                            const userInput =
                                              updatedSlabs[index].slabFrom;
                                            const numberValue =
                                              parseFloat(userInput);
                                            const decimalPlaces =
                                              updatedSlabs[index]
                                                .decimalPlaces ?? 2;

                                            if (!isNaN(numberValue)) {
                                              const roundedValue =
                                                numberValue.toFixed(
                                                  decimalPlaces
                                                );
                                              updatedSlabs[index].slabFrom =
                                                roundedValue;
                                              setSlabs(updatedSlabs);
                                            }
                                          }}
                                        />
                                      </div>
                                      <div className="invalid-feedback">
                                        Please enter Slab Value
                                      </div>
                                      {slabError.slabValue &&
                                      slabs[index].slabFrom === "" ? (
                                        <label className="validation">
                                          {ERROR_MESSAGES}
                                        </label>
                                      ) : (
                                        ""
                                      )}
                                    </div>
                                  </div>
                                  <div className="col-lg-6">
                                    <div className="mb-3 ">
                                      <label className="form-label">
                                        To{" "}
                                        <span className="text-danger">*</span>
                                      </label>
                                      <div className="input-group">
                                        <input
                                          type="text"
                                          className="input-text"
                                          disabled={props.disable}
                                          placeholder="To"
                                          value={
                                            slabs[index].slabTo === ""
                                              ? ""
                                              : slabs[index].slabTo
                                                  .toString()
                                                  .replace(
                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                    ","
                                                  )
                                          }
                                          onChange={(e) => {
                                            DriverValue(e, index, "slabTo");
                                          }}
                                          onBlur={() => {
                                            const updatedSlabs = [...slabs];
                                            const userInput =
                                              updatedSlabs[index].slabTo;
                                            const numberValue =
                                              parseFloat(userInput);
                                            const decimalPlaces =
                                              updatedSlabs[index]
                                                .decimalPlaces ?? 2;

                                            if (!isNaN(numberValue)) {
                                              const roundedValue =
                                                numberValue.toFixed(
                                                  decimalPlaces
                                                );
                                              updatedSlabs[index].slabTo =
                                                roundedValue;
                                              setSlabs(updatedSlabs);
                                            }
                                          }}
                                        />
                                      </div>
                                      <div className="invalid-feedback">
                                        Please enter Slab Value
                                      </div>
                                      {slabError.slabValue &&
                                      parseFloat(slabs[index].slabTo) <
                                        parseFloat(slabs[index].slabFrom) ? (
                                        <label className="validation">
                                          The field must not be less than{" "}
                                          {slabs[index].slabFrom}.
                                        </label>
                                      ) : (
                                        ""
                                      )}
                                      {slabError.slabValue &&
                                      slabs[index].slabTo === "" ? (
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
                                      style={{ marginRight: "1rem" }}
                                      type="radio"
                                      id={`slab block${index}`}
                                      disabled={props.disable}
                                      checked={slabs[index].isDefault}
                                      name="slabs"
                                      onChange={(e) =>
                                        OnSlabsRadioChange(index)
                                      }
                                    />
                                    <label
                                      className="toggle"
                                      name="slabs"
                                      style={{ cursor: "pointer" }}
                                      htmlFor={`slab block${index}`}
                                    >
                                      Set to Default
                                    </label>
                                  </div>
                                </>
                              )}
                              {slabs && slabs[index]?.slabTypeID == "2" && (
                                <>
                                  <div className="col-lg-6">
                                    <div className="mb-3 ">
                                      <label
                                        htmlFor="useremail"
                                        className="form-label"
                                      >
                                        Increment Value By{" "}
                                        <span className="text-danger">*</span>
                                      </label>
                                      <div className="input-group">
                                        <input
                                          type="text"
                                          className="input-text"
                                          placeholder="Increment Value By"
                                          value={
                                            slabs[index].slabValue === ""
                                              ? ""
                                              : slabs[index].slabValue
                                                  .toString()
                                                  .replace(
                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                    ","
                                                  )
                                          }
                                          onChange={(e) => {
                                            DriverValue(e, index, "slabValue");
                                          }}
                                        />
                                      </div>
                                      <div className="invalid-feedback">
                                        Please enter Slab Value
                                      </div>
                                      {slabError.slabValue &&
                                      slabs[index].slabValue === "" ? (
                                        <label className="validation">
                                          {ERROR_MESSAGES}
                                        </label>
                                      ) : (
                                        ""
                                      )}
                                    </div>
                                  </div>

                                  <div className="col-lg-6">
                                    <div className="mb-3 ">
                                      <label className="form-label">
                                        From{" "}
                                        <span className="text-danger">*</span>
                                      </label>
                                      <div className="input-group">
                                        <input
                                          type="text"
                                          className="input-text"
                                          placeholder="From"
                                          disabled={
                                            slabs[index].isDefault === false
                                              ? true
                                              : false
                                          }
                                          value={
                                            slabs[index].slabFrom === ""
                                              ? 0
                                              : slabs[index].slabFrom
                                                  .toString()
                                                  .replace(
                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                    ","
                                                  )
                                          }
                                          onChange={(e) => {
                                            DriverValue(e, index, "slabFrom");
                                          }}
                                        />
                                      </div>

                                      {slabError.slabValue &&
                                      slabs[index].slabFrom === "" ? (
                                        <label className="validation">
                                          {ERROR_MESSAGES}
                                        </label>
                                      ) : (
                                        ""
                                      )}
                                    </div>
                                  </div>
                                  <div className="col-lg-6">
                                    <div className="mb-3 ">
                                      <label
                                        htmlFor="useremail"
                                        className="form-label"
                                      >
                                        Increment Slab By{" "}
                                        <span className="text-danger">*</span>
                                      </label>
                                      <div className="input-group">
                                        <input
                                          type="text"
                                          className="input-text"
                                          placeholder="Increment Slab By"
                                          disabled={props.disable}
                                          value={
                                            slabs[index].slabTo === ""
                                              ? ""
                                              : slabs[index].slabTo
                                                  .toString()
                                                  .replace(
                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                    ","
                                                  )
                                          }
                                          // onChange={(e) => OnSlabChange(index, 'slabTo', e.target.value)}
                                          onChange={(e) => {
                                            DriverValue(e, index, "slabTo");
                                          }}
                                        />
                                      </div>
                                      {slabError.slabValue &&
                                      slabs[index].slabTo === "" ? (
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
                                      style={{ marginRight: "1rem" }}
                                      type="radio"
                                      id={`incremental slab${index}`}
                                      disabled={props.disable}
                                      defaultChecked
                                      checked={slabs[index].isDefault}
                                      name="slabs"
                                      onChange={(e) =>
                                        OnSlabsRadioChange(index)
                                      }
                                    />
                                    <label
                                      className="toggle"
                                      name="slabs"
                                      style={{ cursor: "pointer" }}
                                      htmlFor={`incremental slab${index}`}
                                    >
                                      Set to Default
                                    </label>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      );
                    })}
                    {/* {slabs && slabs[slabs.length - 1]?.slabTypeID == "1" && (
                      <p class="delete-right mt-2">
                        <button
                          onClick={() => OnAddSlab()}
                          class="btn btn-sm btn-primary create-item-btn d-flex gap-1"
                        >
                          <i class="bi bi-plus-circle"></i>
                          <p className="delete-margin font-12">Add Slab</p>
                        </button>
                      </p>
                    )} */}
                  </div>
                </div>
              )}

              {globalPricingDriverObj.driverTypeID === 5 && (
                <>
                  <div class="row">
                    <div className="col-lg-6">
                      <div className="mb-1">
                        <label className="form-label">Text Value</label>
                        <input
                          type="text"
                          className="input-text"
                          placeholder="Enter Text Value"
                          value={textDriver.textValue || ""}
                          onChange={(e) => {
                            const cleanValue = e.target.value.replace(
                              /[^\d.]/g,
                              ""
                            );
                            setTextDriver({
                              ...textDriver,
                              textValue:
                                cleanValue === ""
                                  ? null
                                  : parseFloat(cleanValue),
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="mb-1">
                        <label className="form-label">
                          Text Length <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className="input-text"
                          placeholder="Enter Text Value"
                          value={textDriver.textLength || null}
                          onChange={(e) => {
                            const value = e.target.value;
                            setTextDriver({
                              ...textDriver,
                              textLength: value,
                            });
                          }}
                        />
                      </div>
                      {textError.textLength &&
                        (textDriver.textLength === null ||
                          textDriver.textLength === undefined ||
                          textDriver.textLength === "") && (
                          <label className="validation">{ERROR_MESSAGES}</label>
                        )}
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
                            (textDriver.allowedSpecialCharacters || "")
                              .split(",")
                              .includes(opt.value)
                          )}
                          onChange={handleSpecialCharChange}
                          placeholder="Select special characters..."
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {globalPricingDriverObj.driverTypeID === 6 && (
                <>
                  <div class="row">
                    <div className="col-lg-6">
                      <div className="mb-1">
                        <label className="form-label">
                          Date Format <span className="text-danger">*</span>
                        </label>
                        <Select
                          options={dateFormats}
                          className="basic-multi-select"
                          classNamePrefix="select"
                          value={
                            dateFormats.find(
                              (f) => f.value === dates[0]?.dateFormat
                            ) || dateFormats[3]
                          }
                          onChange={handleDateFormatChange}
                        />
                      </div>
                      {dateError.dateFormat &&
                      (!dates[0] || dates[0].dateFormat === null) ? (
                        <label className="validation">{ERROR_MESSAGES}</label>
                      ) : (
                        ""
                      )}
                    </div>
                    <div className="col-lg-6">
                      <div className="mb-1">
                        <label className="form-label">Default Date Value</label>
                        <input
                          type="text"
                          className="input-text"
                          value={
                            dates[0]?.defaultDateValue
                              ? dates[0]?.defaultDateValue
                              : null
                          }
                          onChange={handleDefaultDateValueChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-xl-12 col-lg-12">
                      {dates?.map((date, dateIndex) =>
                        date?.blocks?.map((block, blockIndex) => (
                          <div
                            className="card-1 pricing-box p-4 mt-4"
                            key={`${dateIndex}-${blockIndex}`} // Unique key for each block
                            id={`Date_Div_${dateIndex}_${blockIndex}`}
                          >
                            <div className="col-lg-6 col-md-6">
                              <p
                                className="office-name font-weight"
                                style={{ width: "auto", zIndex: "0" }}
                              >
                                Period Block {blockIndex + 1}
                              </p>
                            </div>
                            <p
                              className="delete delete-margin"
                              style={{ marginBottom: "0", width: "auto" }}
                            >
                              <button
                                disabled={props.disable}
                                onClick={() =>
                                  OnDeletePeriodBlock(dateIndex, blockIndex)
                                } // Pass dateIndex and blockIndex
                                className="btn btn-sm btn-danger remove-item-btn d-flex gap-1 globalDriver"
                              >
                                <i className="ri-delete-bin-5-fill"></i>
                                <p className="delete-margin font-12">
                                  Delete Period Block
                                </p>
                              </button>
                            </p>
                            <div className="row mt-1">
                              <div className="col-lg-6">
                                <div className="mb-3">
                                  <label
                                    htmlFor="useremail"
                                    className="form-label"
                                  >
                                    From Date
                                  </label>
                                  <div className="input-group">
                                    <DatePicker
                                      className="input-text"
                                      selected={parseStoredDate(
                                        block.fromDate,
                                        date?.dateFormat
                                      )}
                                      placeholder="From Date"
                                      disabled={
                                        blockIndex === 0 && dateIndex === 0
                                          ? false
                                          : true
                                      } // Only enable first block of first date
                                      maxDate={
                                        block.toDate
                                          ? subDays(
                                              parseStoredDate(
                                                block.toDate,
                                                date.dateFormat
                                              ),
                                              1
                                            )
                                          : null
                                      }
                                      onChange={(selectedDate) =>
                                        OnPeriodBlockChange(
                                          dateIndex,
                                          "fromDate",
                                          formatToDisplay(
                                            selectedDate,
                                            date.dateFormat
                                          ),
                                          blockIndex
                                        )
                                      }
                                      dateFormat={date.dateFormat}
                                    />
                                  </div>
                                  <div className="invalid-feedback">
                                    Please enter Date Value
                                  </div>
                                </div>
                                {dateError.fromDate &&
                                  block.fromDate === "" && (
                                    <label className="validation">
                                      {ERROR_MESSAGES}
                                    </label>
                                  )}
                              </div>
                              <div className="col-lg-6">
                                <div className="mb-3">
                                  <label className="form-label">To Date</label>
                                  <div className="input-group">
                                    <DatePicker
                                      className="input-text"
                                      selected={parseStoredDate(
                                        block.toDate,
                                        date?.dateFormat
                                      )}
                                      placeholder="To Date"
                                      onChange={(selectedDate) =>
                                        OnPeriodBlockChange(
                                          dateIndex,
                                          "toDate",
                                          formatToDisplay(
                                            selectedDate,
                                            date.dateFormat
                                          ),
                                          blockIndex
                                        )
                                      }
                                      minDate={
                                        block.fromDate
                                          ? addDays(
                                              parseStoredDate(
                                                block.fromDate,
                                                date.dateFormat
                                              ),
                                              1
                                            )
                                          : null
                                      }
                                      maxDate={
                                        dates[dateIndex]?.blocks[blockIndex + 1]
                                          ?.fromDate ||
                                        (dateIndex + 1 < dates.length &&
                                          dates[dateIndex + 1]?.blocks[0]
                                            ?.fromDate)
                                          ? subDays(
                                              parseStoredDate(
                                                dates[dateIndex]?.blocks[
                                                  blockIndex + 1
                                                ]?.fromDate ||
                                                  dates[dateIndex + 1]
                                                    ?.blocks[0]?.fromDate,
                                                date.dateFormat
                                              ),
                                              1
                                            )
                                          : null
                                      }
                                      dateFormat={date.dateFormat}
                                    />
                                  </div>
                                  {block.fromDate &&
                                    block.toDate &&
                                    parseStoredDate(
                                      block.toDate,
                                      date.dateFormat
                                    ) <
                                      parseStoredDate(
                                        block.fromDate,
                                        date.dateFormat
                                      ) && (
                                      <div className="text-danger mt-1">
                                        To Date cannot be earlier than From
                                        Date.
                                      </div>
                                    )}
                                  {dateError.toDate && block.toDate === "" && (
                                    <label className="validation">
                                      {ERROR_MESSAGES}
                                    </label>
                                  )}
                                </div>
                                {!dateError?.toDate &&
                                  !dateError?.fromDate &&
                                  formatToDisplay(block.toDate) <
                                    formatToDisplay(block.fromDate) && (
                                    <label className="validation">
                                      The field must not be less than{" "}
                                      {block.fromDate}.
                                    </label>
                                  )}
                              </div>
                              {dateError.date && (
                                <label className="text-danger text-center">
                                  Either From date or To date is required
                                </label>
                              )}
                            </div>
                            <div className="row mt-1">
                              <div className="col-lg-6">
                                <div className="mb-3">
                                  <label
                                    htmlFor="useremail"
                                    className="form-label"
                                  >
                                    Date Value
                                  </label>
                                  <input
                                    type="text"
                                    className="input-text"
                                    value={block.dateValue || ""}
                                    onChange={(e) =>
                                      OnPeriodBlockChange(
                                        dateIndex,
                                        "dateValue",
                                        e.target.value,
                                        blockIndex
                                      )
                                    }
                                  />
                                  <div className="invalid-feedback">
                                    Please enter Date Value
                                  </div>
                                </div>
                                {dateError.dateValue &&
                                  block.dateValue === null && (
                                    <label className="validation">
                                      {ERROR_MESSAGES}
                                    </label>
                                  )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
              {globalPricingDriverObj.driverTypeID === 2 && (
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
                            onChange={(selectedOption) => {
                              const updatedDrivers = [...quantity];
                              updatedDrivers[0] = {
                                ...updatedDrivers[0],
                                quantityDecimalPlaces: selectedOption.value,
                              };
                              if (
                                updatedDrivers[0].quantityFrom &&
                                updatedDrivers[0].quantityFrom !== ""
                              ) {
                                const numValue = parseFloat(
                                  updatedDrivers[0].quantityFrom
                                );
                                if (!isNaN(numValue)) {
                                  updatedDrivers[0].quantityFrom =
                                    formatDisplayValue(
                                      numValue.toString(),
                                      selectedOption.value
                                    );
                                }
                              }

                              // Update quantityTo if it exists
                              if (
                                updatedDrivers[0].quantityTo &&
                                updatedDrivers[0].quantityTo !== ""
                              ) {
                                const numValue = parseFloat(
                                  updatedDrivers[0].quantityTo
                                );
                                if (!isNaN(numValue)) {
                                  updatedDrivers[0].quantityTo =
                                    formatDisplayValue(
                                      numValue.toString(),
                                      selectedOption.value
                                    );
                                }
                              }
                              setQuantity(updatedDrivers);
                            }}
                            value={{
                              value: quantity[0]?.quantityDecimalPlaces ?? 0,
                              label: (() => {
                                const decimalPlaces =
                                  quantity[0]?.quantityDecimalPlaces ?? 0;
                                if (decimalPlaces === 0)
                                  return "No decimal places";
                                if (decimalPlaces === 1)
                                  return "1 decimal place";
                                return `${decimalPlaces} decimal places`;
                              })(),
                            }}
                            options={[
                              { value: 2, label: "2 decimal places" },
                              { value: 1, label: "1 decimal place" },
                              { value: 0, label: "No decimal places" },
                            ]}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row mb-1">
                    <label>Allowed Range</label>
                  </div>
                  <div className="row fieldset">
                    <div className="col-lg-6">
                      <div className="mb-1">
                        <label className="form-label">Quantity From</label>
                        <div className="input-group">
                          <input
                            className="input-text"
                            type="text"
                            value={quantity[0]?.quantityFrom || ""}
                            onChange={(e) => {
                              const decimalPlaces =
                                quantity[0]?.quantityDecimalPlaces ?? 0;
                              const sanitized = handleQuantityInput(
                                e.target.value,
                                decimalPlaces
                              );

                              const updatedDrivers = [...quantity];
                              updatedDrivers[0] = {
                                ...updatedDrivers[0],
                                quantityFrom: sanitized,
                              };
                              setQuantity(updatedDrivers);
                            }}
                            onBlur={() => {
                              const currentValue = quantity[0]?.quantityFrom;
                              const decimalPlaces =
                                quantity[0]?.quantityDecimalPlaces ?? 0;

                              // Only format if there's a valid number
                              if (
                                currentValue &&
                                currentValue !== "" &&
                                !isNaN(parseFloat(currentValue))
                              ) {
                                const formattedValue = formatDisplayValue(
                                  currentValue,
                                  decimalPlaces
                                );

                                const updatedDrivers = [...quantity];
                                updatedDrivers[0] = {
                                  ...updatedDrivers[0],
                                  quantityFrom: formattedValue,
                                };
                                setQuantity(updatedDrivers);
                              } else if (
                                currentValue &&
                                currentValue.endsWith(".")
                              ) {
                                // Remove trailing decimal point if user left it
                                const updatedDrivers = [...quantity];
                                updatedDrivers[0] = {
                                  ...updatedDrivers[0],
                                  quantityFrom: currentValue.slice(0, -1),
                                };
                                setQuantity(updatedDrivers);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="mb-1">
                        <label className="form-label">Quantity To</label>
                        <div className="input-group">
                          <input
                            className="input-text"
                            type="text"
                            value={quantity[0].quantityTo || ""}
                            onChange={(e) => {
                              const decimalPlaces =
                                quantity[0]?.quantityDecimalPlaces ?? 0;
                              const sanitized = handleQuantityInput(
                                e.target.value,
                                decimalPlaces
                              );

                              const updatedDrivers = [...quantity];
                              updatedDrivers[0] = {
                                ...updatedDrivers[0],
                                quantityTo: sanitized,
                              };
                              setQuantity(updatedDrivers);
                            }}
                            onBlur={() => {
                              const currentValue = quantity[0]?.quantityTo;
                              const decimalPlaces =
                                quantity[0]?.quantityDecimalPlaces ?? 0;

                              // Only format if there's a valid number
                              if (
                                currentValue &&
                                currentValue !== "" &&
                                !isNaN(parseFloat(currentValue))
                              ) {
                                const formattedValue = formatDisplayValue(
                                  currentValue,
                                  decimalPlaces
                                );

                                const updatedDrivers = [...quantity];
                                updatedDrivers[0] = {
                                  ...updatedDrivers[0],
                                  quantityTo: formattedValue,
                                };
                                setQuantity(updatedDrivers);
                              } else if (
                                currentValue &&
                                currentValue.endsWith(".")
                              ) {
                                // Remove trailing decimal point if user left it
                                const updatedDrivers = [...quantity];
                                updatedDrivers[0] = {
                                  ...updatedDrivers[0],
                                  quantityTo: currentValue.slice(0, -1),
                                };
                                setQuantity(updatedDrivers);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {qtyError.quantityError &&
                    quantity[0].quantityFrom !== "" &&
                    quantity[0].quantityTo !== "" &&
                    Number(quantity[0].quantityTo) <=
                      Number(quantity[0].quantityFrom) && (
                      <label className="text-danger text-center">
                        Invalid Range
                      </label>
                    )}
                </>
              )}
              <label
                className="validation"
                style={{
                  fontSize: "15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {common.professionTypeLists?.length <= 1 &&
                errorMessage?.includes(
                  `Please dont choose this profession type`
                )
                  ? errorMessage.split(".")[0]
                  : errorMessage}
              </label>
              {/* <!-- end tab row --> */}
            </div>
          </div>
          <div class="modal-footer">
            <div class="hstack gap-2 justify-content-end">
              {slabs &&
                slabs[slabs.length - 1]?.slabTypeID == "1" &&
                globalPricingDriverObj.driverTypeID == 4 && (
                  <button
                    onClick={() => OnAddSlab()}
                    class="btn btn-sm btn-primary create-item-btn d-flex gap-1"
                  >
                    <i class="bi bi-plus-circle"></i>
                    <p className="delete-margin font-12">Add Slab </p>
                  </button>
                )}
              {slabs.length === 0 &&
                globalPricingDriverObj.driverTypeID == 4 && (
                  <button
                    onClick={AddSlab}
                    class="btn btn-sm btn-primary create-item-btn d-flex gap-1"
                  >
                    <i class="bi bi-plus-circle "></i>
                    <span className="font-12 delete-margin">Add Slab</span>
                  </button>
                )}
              {globalPricingDriverObj.driverTypeID == 3 && (
                <button
                  type="submit"
                  class="btn btn-sm btn-primary create-item-btn d-flex gap-1"
                  onClick={OnAddVariations}
                >
                  <i class="bi bi-plus-circle"></i>
                  <span className="font-12 delete-margin">Add Variation</span>
                </button>
              )}
              {dates && globalPricingDriverObj.driverTypeID === 6 && (
                <button
                  disabled={
                    dates[0]?.blocks?.length > 0 &&
                    // Disable if fromDate is filled but toDate is empty
                    ((dates[0].blocks.at(-1)?.fromDate &&
                      !dates[0].blocks.at(-1)?.toDate) ||
                      // Disable if both fromDate and toDate are empty
                      (!dates[0].blocks.at(-1)?.fromDate &&
                        !dates[0].blocks.at(-1)?.toDate))
                  }
                  onClick={() => OnAddPeriodBlock()}
                  className="btn btn-sm btn-primary create-item-btn d-flex gap-1"
                >
                  <i className="bi bi-plus-circle"></i>
                  <p className="delete-margin font-12">Add Period Block</p>
                </button>
              )}

              {/* {dates.length > 0 &&
                globalPricingDriverObj.driverTypeID == 6 && (
                  <button
                    onClick={AddPeriodBlock}
                    class="btn btn-sm btn-primary create-item-btn d-flex gap-1"
                  >
                    <i class="bi bi-plus-circle "></i>
                    <span className="font-12 delete-margin">Add Period Block</span>
                  </button>
                )} */}
              {props.modelRequestData.Type ? (
                <>
                  <button
                    type="submit"
                    class="btn btn-md btn-success accept-item-btn"
                    disabled={props.addCategoryLoader}
                    onClick={() =>
                      GlobalPricingDriverAddUpdateBtnClicked("Accept")
                    }
                  >
                    <span>Accept</span>
                  </button>
                  <button
                    type="submit"
                    class="btn btn-md btn-success declined-item-btn"
                    // data-bs-dismiss="modal"
                    onClick={() => DeclineSuperAdminChangesData("Decline")}
                  >
                    <span>Decline</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    class="btn btn-md btn-light"
                    data-bs-dismiss="modal"
                    onClick={SetInitialModelData}
                  >
                    <span>{getCrudButtonTextName("Cancel")}</span>
                  </button>
                  <button
                    type="submit"
                    class="btn btn-md btn-success create-item-btn"
                    disabled={props.addCategoryLoader}
                    onClick={() => GlobalPricingDriverAddUpdateBtnClicked()}
                  >
                    <span>
                      {modelAction === "Add"
                        ? getCrudButtonTextName("Add", moduleName)
                        : getCrudButtonTextName("Update", moduleName)}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <SuccessModal
        handleClose={handleClose}
        setDismissModal={setDismissModal}
        setOpenSuccessModal={setOpenSuccessModal}
        openSuccessModal={openSuccessModal}
        modelAction={modelAction}
        setIsCheck={setIsCheck}
        isCheck={isCheck}
        modelRequestData={modelRequestData}
        message={`${moduleName} ${globalPricingDriverObj.driverName}`}
      />

      <DeleteDriverModal
        handleClose={handleCloseDeleteDriverModel}
        openDeleteDriverModel={openDeleteDriverModel}
        modelRequestData={modelRequestDataForDeleteDriver}
        openSuccessModal={openSuccessModal}
        openErrorModal={openErrorModal}
      />
      <ErrorModel
        ErrorModel={openErrorModal}
        handleClose={HandleClose}
        ErrorMessage={errorMessageTitle}
        errorMessageTitle={""}
      />
      <AcceptSuperAdminChangesConfirmation
        openErrorModal={openErrorModal}
        ModelId={props.id}
        Status={Status}
        openSuccessModal={openSuccessModal}
        modelRequestData={props.modelRequestData}
        UpdatedChanges={handleConfirmButton}
      />
    </div>
  );
}

export default Modal;
