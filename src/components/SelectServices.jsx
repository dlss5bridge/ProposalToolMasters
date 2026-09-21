import Select from "react-select";
import { useEffect } from "react";
import { ERROR_MESSAGES } from "./GlobalMessage";
import { Tooltip } from "@mui/material";
import { AuthContextProvider } from "../AuthContext/AuthContext";
import { useContext } from "react";
import { statusID } from "../Middleware/enums";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-calendar/dist/Calendar.css";
import { format, parse, isValid } from "date-fns";
import SelectServicesTheme2 from "./SelectServicesTheme2/SelectServicesTheme2";

// Stable references so Theme 2 memoisation is not reset on every render
const isServiceSelectedForTheme = (service) => service?.isSelected === true;
// Same guard theme 1 uses before toggling: `if (!service.isDisabled)`
const isServiceLockedForTheme = (service) => Boolean(service?.isDisabled);
export default function SelectServices(props) {
  const { isMobile, getCrudButtonTextName, convertAndParseDate } =
    useContext(AuthContextProvider);

  const moduleNameForSaveAsDraft = "SelectServices";
  const notAllowed = "not-allowed";
  console.log(props.requireMessage);
  // useEffect(() => {
  //   // Don’t run if list is still undefined/empty
  //   if (!props.recurringServiceList?.length) return;

  //   // The same recursive‐hide function you already have
  //   const updateRecursiveVisibility = (services) => {
  //     let updated = [...services];
  //     let changed = false;

  //     updated = updated.map(service => {
  //       if (service.hasDependencies) {
  //         const dependencyIds = Array.isArray(service.hasDependencies)
  //           ? service.hasDependencies.map(Number)
  //           : typeof service.hasDependencies === "string" && service.hasDependencies.trim().length > 0
  //             ? service.hasDependencies.split(",").map(Number)
  //             : [];

  //         const someDepsSelected = dependencyIds.some(depId => {
  //           const parent = updated.find(s => s.serviceID === depId);
  //           return parent && parent.isSelected;
  //         });

  //         if (!someDepsSelected && !service.isHidden && service.serviceChargeTypeID !== 4) {
  //           changed = true;
  //           return {
  //             ...service,
  //             isHidden: true,
  //             isDisabled: true,
  //             isSelected: false,
  //           };
  //         }
  //       }
  //       return service;
  //     });

  //     return changed ? updateRecursiveVisibility(updated) : updated;
  //   };
  //   // Apply it to each category
  //   const updatedAll = props.recurringServiceList.map(category => ({
  //     ...category,
  //     servicesList: updateRecursiveVisibility(category.servicesList)
  //   }));

  //   props.setRecurringServiceList(updatedAll);
  // }, [props.recurringServiceList, props.setRecurringServiceList]);

  // useEffect(() => {
  //   // Don’t run if list is still undefined/empty
  //   if (!props.oneOffServiceList?.length) return;

  //   // The same recursive‐hide function you already have
  //   const updateRecursiveVisibility = (services) => {
  //     let updated = [...services];
  //     let changed = false;

  //     updated = updated.map(service => {
  //       if (service.hasDependencies) {
  //         const dependencyIds = Array.isArray(service.hasDependencies)
  //           ? service.hasDependencies.map(Number)
  //           : typeof service.hasDependencies === "string" && service.hasDependencies.trim().length > 0
  //             ? service.hasDependencies.split(",").map(Number)
  //             : [];

  //         const someDepsSelected = dependencyIds.some(depId => {
  //           const parent = updated.find(s => s.serviceID === depId);
  //           return parent && parent.isSelected;
  //         });

  //         if (!someDepsSelected && !service.isHidden && service.serviceChargeTypeID !== 4) {
  //           changed = true;
  //           return {
  //             ...service,
  //             isHidden: true,
  //             isDisabled: true,
  //             isSelected: false,
  //           };
  //         }
  //       }
  //       return service;
  //     });

  //     return changed ? updateRecursiveVisibility(updated) : updated;
  //   };

  //   // Apply it to each category
  //   const updatedAll = props.oneOffServiceList.map(category => ({
  //     ...category,
  //     servicesList: updateRecursiveVisibility(category.servicesList)
  //   }));

  //   props.setOneOffServiceList(updatedAll);
  // }, [props.oneOffServiceList, props.setOneOffServiceList]);

  // const updateRecursiveVisibility = (services) => {
  //   let updated = [...services];
  //   let changed = false;

  //   updated = updated.map(service => {
  //     if (service.hasDependencies) {
  //       const dependencyIds = Array.isArray(service.hasDependencies)
  //         ? service.hasDependencies.map(Number)
  //         : typeof service.hasDependencies === "string" && service.hasDependencies.trim().length > 0
  //           ? service.hasDependencies.split(",").map(Number)
  //           : [];

  //       const someDepsSelected = dependencyIds.some(depId => {
  //         const parent = updated.find(s => s.serviceID === depId);
  //         return parent && parent.isSelected;
  //       });

  //       if (!someDepsSelected && !service.isHidden && service.serviceChargeTypeID !== 4) {
  //         changed = true;
  //         return {
  //           ...service,
  //           isHidden: true,
  //           isDisabled: true,
  //           isSelected: false,
  //         };
  //       }
  //     }
  //     return service;
  //   });

  //   return changed ? updateRecursiveVisibility(updated) : updated;
  // };

  //   const updateRecursiveVisibility = (services, fullList) => {
  //   let updated = [...services];
  //   let changed = false;

  //   updated = updated.map((service) => {
  //     if (service.hasDependencies) {
  //       const dependencies = Array.isArray(service.hasDependencies)
  //         ? service.hasDependencies
  //         : typeof service.hasDependencies === "string" && service.hasDependencies.trim().length > 0
  //         ? service.hasDependencies.split(",").map(Number)
  //         : [];

  //       const someDepsSelected = dependencies.some((dep) => {
  //         if (typeof dep === "object" && dep.serviceID && dep.serviceCatID) {
  //           return fullList.find(
  //             (s) =>
  //               s.serviceID === dep.serviceID &&
  //               s.serviceCatID === dep.serviceCatID &&
  //               s.isSelected
  //           );
  //         }
  //         const parent = fullList.find((s) => s.serviceID === Number(dep));
  //         return parent && parent.isSelected;
  //       });

  //       if (!someDepsSelected && !service.isHidden && service.serviceChargeTypeID !== 4) {
  //         changed = true;
  //         return {
  //           ...service,
  //           isHidden: true,
  //           isDisabled: true,
  //           isSelected: false,
  //         };
  //       }

  //       if (someDepsSelected && service.isHidden) {
  //         changed = true;
  //         return {
  //           ...service,
  //           isHidden: false,
  //           isDisabled: false,
  //         };
  //       }
  //     }

  //     return service;
  //   });

  //   return changed ? updateRecursiveVisibility(updated, fullList) : updated;
  // };
  // const updateRecursiveVisibility = (services, fullList) => {
  //   let changed = false;

  //   const updated = services.map(service => {
  //     if (
  //       Array.isArray(service.hasDependencies) &&
  //       service.hasDependencies.length > 0
  //     ) {
  //       const shouldShow = service.hasDependencies.some(dep => {
  //         const match = fullList.find(s => {
  //           const serviceMatch =
  //             s.serviceID === dep.serviceID &&
  //             s.serviceCatID === dep.serviceCatID &&
  //             s.isSelected === true;

  //           // console.log("---- Dependency Check ----");
  //           // console.log("Looking for:", dep.serviceID, "in category", dep.serviceCatID);
  //           // console.log("Checking against selected service:", s.serviceID, "in category", s.serviceCatID, "| isSelected:", s.isSelected);
  //           // console.log("Match result:", serviceMatch);

  //           return serviceMatch;
  //         });

  //         return !!match;
  //       });

  //       if (!shouldShow && !service.isHidden) {
  //         // console.log("hide");
  //         changed = true;
  //         return {
  //           ...service,
  //           isHidden: true,
  //           isDisabled: true,
  //           isSelected: false,
  //         };
  //       } else if (shouldShow && service.isHidden) {
  //         // console.log("show");
  //         changed = true;
  //         return {
  //           ...service,
  //           isHidden: false,
  //           isDisabled: false,
  //         };
  //       }
  //     }

  //     return service;
  //   });

  //   return changed ? updateRecursiveVisibility(updated, fullList) : updated;
  // };
  const updateRecursiveVisibility = (services, fullList) => {
    let changed = false;

    const updated = services.map((service) => {
      const selectedElsewhere = fullList.some(
        (s) =>
          s.serviceID === service.serviceID &&
          s.serviceChargeTypeName !== service.serviceChargeTypeName &&
          s.isSelected === true,
      );
      // console.log(fullList);
      if (selectedElsewhere) {
        const newService = {
          ...service,
          isDisabled: true,
          isSelected: false,
          isHidden: false,
        };
        if (
          newService.isDisabled !== service.isDisabled ||
          newService.isSelected !== service.isSelected ||
          newService.isHidden !== service.isHidden
        ) {
          changed = true;
        }
        return newService;
      }
      const hasDeps =
        Array.isArray(service.hasDependencies) &&
        service.hasDependencies.length > 0;

      if (hasDeps) {
        // determine if any dependency parent is selected
        const someDepsSelected = service.hasDependencies.some((dep) => {
          if (
            dep &&
            typeof dep === "object" &&
            dep.serviceID != null &&
            dep.serviceCatID != null
          ) {
            return fullList.some(
              (s) =>
                s.serviceID === dep.serviceID &&
                s.serviceCatID === dep.serviceCatID &&
                s.isSelected === true,
            );
          }
          const depId = Number(dep);
          return (
            Number.isFinite(depId) &&
            fullList.some((s) => s.serviceID === depId && s.isSelected === true)
          );
        });

        const nextHidden = !someDepsSelected;
        const nextDisabled = !someDepsSelected;
        const nextSelected = someDepsSelected
          ? !!service.isSelected
          : service.isSelected
            ? service.isSelected
            : false;

        // ALWAYS create a new service object with derived values
        const newService = {
          ...service,
          isHidden: nextHidden,
          isDisabled: nextDisabled,
          isSelected: nextSelected,
        };

        // mark changed if anything differs (so recursion continues until stable)
        if (
          service.isHidden !== nextHidden ||
          service.isDisabled !== nextDisabled ||
          service.isSelected !== nextSelected
        ) {
          changed = true;
        }

        return newService;
      }

      // Independent service — always visible and enabled
      const newService = { ...service, isHidden: false, isDisabled: false };
      if (service.isHidden !== false || service.isDisabled !== false)
        changed = true;
      return newService;
    });

    return changed ? updateRecursiveVisibility(updated, fullList) : updated;
  };

  const oneOffSignature =
    props.oneOffServiceList
      ?.flatMap((c) =>
        c.servicesList.map(
          (s) =>
            `${s.serviceID}-${s.serviceCatID}-${s.isSelected}-${s.isHidden}`,
        ),
      )
      .join("|") || "";

  const recurringSignature =
    props.recurringServiceList
      ?.flatMap((c) =>
        c.servicesList.map(
          (s) =>
            `${s.serviceID}-${s.serviceCatID}-${s.isSelected}-${s.isHidden}`,
        ),
      )
      .join("|") || "";

  useEffect(() => {
    const list = props.oneOffServiceList || [];
    const fullList = [
      ...list.flatMap((c) =>
        c.servicesList.map((s) => ({
          ...s,
          serviceCatID: c.serviceCatID,
          serviceChargeTypeName: s.serviceChargeTypeName,
        })),
      ),
      ...(props.recurringServiceList || []).flatMap((c) =>
        c.servicesList.map((s) => ({
          ...s,
          serviceCatID: c.serviceCatID,
          serviceChargeTypeName: s.serviceChargeTypeName,
        })),
      ),
    ];

    const updated = list.map((category) => ({
      ...category,
      servicesList: updateRecursiveVisibility(category.servicesList, fullList),
    }));

    props.setOneOffServiceList(updated);
  }, [oneOffSignature, recurringSignature]);

  useEffect(() => {
    const list = props.recurringServiceList || [];
    const fullList = [
      ...list.flatMap((c) =>
        c.servicesList.map((s) => ({
          ...s,
          serviceCatID: c.serviceCatID,
          serviceChargeTypeName: s.serviceChargeTypeName,
        })),
      ),
      ...(props.oneOffServiceList || []).flatMap((c) =>
        c.servicesList.map((s) => ({
          ...s,
          serviceCatID: c.serviceCatID,
          serviceChargeTypeName: s.serviceChargeTypeName,
        })),
      ),
    ];

    const updated = list.map((category) => ({
      ...category,
      servicesList: updateRecursiveVisibility(category.servicesList, fullList),
    }));

    props.setRecurringServiceList(updated);
  }, [oneOffSignature, recurringSignature]);

  const handleRecurringServiceDependsServerClick = (
    recurringService,
    subRecurringService,
    id,
    prevId,
    type,
  ) => {
    props.DisableTabOnChange();
    const variationIdMatches = prevId?.variation?.map((i) => {
      return i.variationID;
    });
    if (type === "RecurringService") {
      let updatedRecurringList = props.recurringServiceList?.map((category) => {
        if (category?.serviceCatID === recurringService?.serviceCatID) {
          return {
            ...category,
            servicesList: category.servicesList?.map((service) => {
              if (service.serviceID === subRecurringService.serviceID) {
                return {
                  ...service,
                  pricingDriverList: service.pricingDriverList?.map(
                    (pricingList) => {
                      const isVariation =
                        pricingList.variation &&
                        pricingList.variation.some(
                          (variation) => variation.variationID === id.value,
                        );
                      const isSlab =
                        pricingList.slab &&
                        pricingList.slab.some(
                          (slab) => slab.slabID === id.value,
                        );
                      if (isVariation) {
                        return {
                          ...pricingList,
                          driverVisibility: true,
                          driverValue: pricingList.variation
                            .filter(
                              (variation) => variation.variationID === id.value,
                            )
                            .map((varValue) => varValue.variationValue)
                            .join(", "),
                          variation: pricingList.variation.map((variation) => ({
                            ...variation,
                            isDefault: variation.variationID === id.value,
                          })),
                        };
                      } else if (isSlab) {
                        return {
                          ...pricingList,
                          driverVisibility: true,
                          driverValue:
                            pricingList.slab
                              .filter(
                                (Slab) =>
                                  Slab.slabID === id.value &&
                                  Slab.slabTypeID == 1,
                              )
                              .map((slabsValue) => slabsValue.slabValue)
                              .join(", ") || null,
                          slab: pricingList.slab.map((slab) => ({
                            ...slab,
                            isDefault: slab.slabID === id.value,
                          })),
                        };
                      } else if (
                        pricingList.driverTypeID === 6 &&
                        pricingList.globalPricingDriverID ===
                          prevId.globalPricingDriverID
                      ) {
                        const dateFormat =
                          pricingList.date?.[0]?.dateFormat || "yyyy-MM-dd";
                        const selectedDate =
                          id instanceof Date
                            ? id
                            : parseStoredDate(id, dateFormat); // Support both raw Date or string
                        // Detect which block the selected date belongs to
                        const sortedDateBlocks = [...pricingList.date].sort(
                          (a, b) => {
                            const aSpec =
                              (a.fromDate ? 1 : 0) + (a.toDate ? 1 : 0);
                            const bSpec =
                              (b.fromDate ? 1 : 0) + (b.toDate ? 1 : 0);
                            return bSpec - aSpec;
                          },
                        );

                        const selectedBlock = sortedDateBlocks.find((block) => {
                          const from = block.fromDate
                            ? parseStoredDate(block.fromDate, dateFormat)
                            : null;
                          const to = block.toDate
                            ? parseStoredDate(block.toDate, dateFormat)
                            : null;
                          return (
                            (!from || selectedDate >= from) &&
                            (!to || selectedDate <= to)
                          );
                        });
                        // console.log(selectedBlock.defaultDateValue);
                        console.log(pricingList.date);
                        console.log(selectedBlock);
                        if (selectedBlock) {
                          return {
                            ...pricingList,
                            driverVisibility: true,
                            dateID: selectedBlock.dateID,
                            driverValue:
                              selectedBlock.dateValue ??
                              selectedBlock.defaultDateValue ??
                              null,
                            enteredDate: format(
                              selectedDate,
                              selectedBlock.dateFormat,
                            ),
                            enteredDateFormat: selectedBlock.dateFormat,
                            date: pricingList.date.map((block) => ({
                              ...block,
                              isDefault:
                                block.dateID === selectedBlock.dateID
                                  ? true
                                  : false,
                              enteredDate:
                                block.dateID === selectedBlock.dateID
                                  ? !block.fromDate && !block.toDate
                                    ? "Default"
                                    : block.fromDate &&
                                        (!block.toDate || block.toDate === "")
                                      ? `${block.fromDate} to Present`
                                      : `${block.fromDate} to ${block.toDate}`
                                  : (block.enteredDate ?? ""),
                            })),
                          };
                        }

                        // fallback if no block matched (maybe due to error)
                        return {
                          ...pricingList,
                          dateID: null,
                          driverValue: null,
                          enteredDate: null,
                        };
                      }
                      if (pricingList.dependsOnVariationID === id.value) {
                        return {
                          ...pricingList,
                          driverVisibility: true,
                        };
                      } else if (
                        variationIdMatches?.includes(
                          pricingList.dependsOnVariationID,
                        )
                      ) {
                        return {
                          ...pricingList,
                          driverVisibility: false,
                          driverValue: null,
                        };
                      } else if (
                        pricingList.globalPricingDriverID ===
                        prevId.globalPricingDriverID
                      ) {
                        return {
                          ...pricingList,
                          driverValue: id.variationValue,
                        };
                      }

                      // Make sure to return the original object when none of the conditions are met
                      return pricingList;
                    },
                  ),
                };
              }

              return service;
            }),
          };
        }
        return category;
      });
      updatedRecurringList = updatedRecurringList.map((item) => {
        // Check if the item has servicesList array
        if (item?.serviceCatID === recurringService?.serviceCatID) {
          if (item.servicesList && item.servicesList.length > 0) {
            // Iterate through each service in servicesList
            item.servicesList = item.servicesList.map((service) => {
              // Check if pricingDriverList array exists and has elements
              if (service.serviceID === subRecurringService.serviceID) {
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
                          driver.driverValue = defaultVariation.variationValue;
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
                          driver.driverValue =
                            defaultSlab.slabTypeID == 2
                              ? null
                              : defaultSlab.slabValue;
                          driver.slabID = defaultSlab.slabID;
                        }
                      } else if (
                        driver.driverTypeID === 6 &&
                        driver.globalPricingDriverID ===
                          prevId.globalPricingDriverID
                      ) {
                        const selectedDate =
                          id instanceof Date
                            ? id
                            : parseStoredDate(
                                id,
                                driver?.date?.[0]?.dateFormat,
                              );
                        const sortedBlocks = [...driver.date].sort((a, b) => {
                          const aSpec =
                            (a.fromDate ? 1 : 0) + (a.toDate ? 1 : 0);
                          const bSpec =
                            (b.fromDate ? 1 : 0) + (b.toDate ? 1 : 0);
                          return bSpec - aSpec;
                        });

                        const selectedBlock = sortedBlocks.find((block) => {
                          const from = block.fromDate
                            ? parseStoredDate(block.fromDate, block.dateFormat)
                            : null;
                          const to = block.toDate
                            ? parseStoredDate(block.toDate, block.dateFormat)
                            : null;
                          return (
                            (!from || selectedDate >= from) &&
                            (!to || selectedDate <= to)
                          );
                        });
                        if (selectedBlock) {
                          driver.dateID = selectedBlock.dateID;
                          driver.driverValue = selectedBlock.dateValue
                            ? selectedBlock.dateValue
                            : selectedBlock.defaultDateValue
                              ? selectedBlock.defaultDateValue
                              : null;
                          driver.enteredDate = format(
                            selectedDate,
                            selectedBlock.dateFormat,
                          );
                          driver.enteredDateFormat = selectedBlock.dateFormat;
                          driver.date = driver.date.map((block) => ({
                            ...block,
                            isDefault:
                              block.dateID === selectedBlock.dateID
                                ? true
                                : false,
                            enteredDate:
                              block.dateID === selectedBlock.dateID
                                ? driver.enteredDate
                                : (block.enteredDate ?? ""),
                          }));
                        }
                        console.log(driver.driverValue);
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
                        } else {
                          driver.driverVisibility = false;
                        }
                      }
                      return driver; // Return the modified or unchanged driver object
                    },
                  );
                }
              }
              return service; // Return the modified or unchanged service object
            });
          }
        }
        return item; // Return the modified or unchanged item object
      });
      props.setRecurringServiceList(updatedRecurringList);
    } else if (type === "OneOffService") {
      let updatedOneOffList = props.oneOffServiceList?.map((category) => {
        if (category?.serviceCatID === recurringService?.serviceCatID) {
          return {
            ...category,
            servicesList: category.servicesList?.map((service) => {
              if (service.serviceID === subRecurringService.serviceID) {
                return {
                  ...service,
                  pricingDriverList: service.pricingDriverList?.map(
                    (pricingList) => {
                      const isVariation =
                        pricingList.variation &&
                        pricingList.variation.some(
                          (variation) => variation.variationID === id.value,
                        );
                      const isSlab =
                        pricingList.slab &&
                        pricingList.slab.some(
                          (slab) => slab.slabID === id.value,
                        );
                      if (isVariation) {
                        return {
                          ...pricingList,
                          driverVisibility: true,
                          driverValue: pricingList.variation
                            .filter(
                              (variation) => variation.variationID === id.value,
                            )
                            .map((varValue) => varValue.variationValue)
                            .join(", "),
                          variation: pricingList.variation.map((variation) => ({
                            ...variation,
                            isDefault: variation.variationID === id.value,
                          })),
                        };
                      } else if (isSlab) {
                        return {
                          ...pricingList,
                          driverVisibility: true,
                          driverValue:
                            pricingList.slab
                              .filter(
                                (Slab) =>
                                  Slab.slabID === id.value &&
                                  Slab.slabTypeID == 1,
                              )
                              .map((slabsValue) => slabsValue.slabValue)
                              .join(", ") || null,

                          slab: pricingList.slab.map((slab) => ({
                            ...slab,
                            isDefault: slab.slabID === id.value,
                          })),
                        };
                      } else if (
                        pricingList.driverTypeID === 6 &&
                        pricingList.globalPricingDriverID ===
                          prevId.globalPricingDriverID
                      ) {
                        const dateFormat =
                          pricingList.date?.[0]?.dateFormat || "yyyy-MM-dd";
                        const selectedDate =
                          id instanceof Date
                            ? id
                            : parseStoredDate(id, dateFormat); // Support both raw Date or string
                        console.log(selectedDate);
                        // Detect which block the selected date belongs to
                        const sortedDateBlocks = [...pricingList.date].sort(
                          (a, b) => {
                            const aSpec =
                              (a.fromDate ? 1 : 0) + (a.toDate ? 1 : 0);
                            const bSpec =
                              (b.fromDate ? 1 : 0) + (b.toDate ? 1 : 0);
                            return bSpec - aSpec;
                          },
                        );

                        const selectedBlock = sortedDateBlocks.find((block) => {
                          const from = block.fromDate
                            ? parseStoredDate(block.fromDate, dateFormat)
                            : null;
                          const to = block.toDate
                            ? parseStoredDate(block.toDate, dateFormat)
                            : null;
                          return (
                            (!from || selectedDate >= from) &&
                            (!to || selectedDate <= to)
                          );
                        });
                        if (selectedBlock) {
                          return {
                            ...pricingList,
                            driverVisibility: true,
                            dateID: selectedBlock.dateID,
                            driverValue: selectedBlock.dateValue
                              ? selectedBlock.dateValue
                              : selectedBlock.defaultDateValue
                                ? selectedBlock.defaultDateValue
                                : null,
                            enteredDate: format(
                              selectedDate,
                              selectedBlock.dateFormat,
                            ),
                            enteredDateFormat: selectedBlock.dateFormat,
                            date: pricingList.date.map((block) => ({
                              ...block,
                              isDefault:
                                block.dateID == selectedBlock.dateID
                                  ? true
                                  : false,
                              enteredDate:
                                block.dateID === selectedBlock.dateID
                                  ? !block.fromDate && !block.toDate
                                    ? "Default"
                                    : block.fromDate &&
                                        (!block.toDate || block.toDate === "")
                                      ? `${block.fromDate} to Present`
                                      : `${block.fromDate} to ${block.toDate}`
                                  : (block.enteredDate ?? ""),
                            })),
                          };
                        }

                        // fallback if no block matched (maybe due to error)
                        return {
                          ...pricingList,
                          driverVisibility: false,
                          dateID: null,
                          driverValue: null,
                          enteredDate: null,
                        };
                      }

                      if (pricingList.dependsOnVariationID === id.value) {
                        return {
                          ...pricingList,
                          driverVisibility: true,
                        };
                      } else if (
                        variationIdMatches?.includes(
                          pricingList.dependsOnVariationID,
                        )
                      ) {
                        return {
                          ...pricingList,
                          driverVisibility: false,
                          driverValue: null,
                        };
                      } else if (
                        pricingList.globalPricingDriverID ===
                        prevId.globalPricingDriverID
                      ) {
                        return {
                          ...pricingList,
                          driverValue: id.variationValue,
                        };
                      }

                      // Make sure to return the original object when none of the conditions are met
                      return pricingList;
                    },
                  ),
                };
              }

              return service;
            }),
          };
        }
        return category;
      });
      updatedOneOffList = updatedOneOffList.map((item) => {
        // Check if the item has servicesList array
        if (item?.serviceCatID === recurringService?.serviceCatID) {
          if (item.servicesList && item.servicesList.length > 0) {
            // Iterate through each service in servicesList
            item.servicesList = item.servicesList.map((service) => {
              // Check if pricingDriverList array exists and has elements
              if (service.serviceID === subRecurringService.serviceID) {
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
                          driver.driverValue = defaultVariation.variationValue;
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
                          driver.driverValue =
                            defaultSlab.slabTypeID == 2
                              ? null
                              : defaultSlab.slabValue;
                          driver.slabID = defaultSlab.slabID;
                        }
                      } else if (
                        driver.driverTypeID === 6 &&
                        driver.globalPricingDriverID ===
                          prevId.globalPricingDriverID
                      ) {
                        const selectedDate =
                          id instanceof Date
                            ? id
                            : parseStoredDate(
                                id,
                                driver?.date?.[0]?.dateFormat,
                              );
                        const sortedBlocks = [...driver.date].sort((a, b) => {
                          const aSpec =
                            (a.fromDate ? 1 : 0) + (a.toDate ? 1 : 0);
                          const bSpec =
                            (b.fromDate ? 1 : 0) + (b.toDate ? 1 : 0);
                          return bSpec - aSpec;
                        });

                        const selectedBlock = sortedBlocks.find((block) => {
                          const from = block.fromDate
                            ? parseStoredDate(block.fromDate, block.dateFormat)
                            : null;
                          const to = block.toDate
                            ? parseStoredDate(block.toDate, block.dateFormat)
                            : null;
                          return (
                            (!from || selectedDate >= from) &&
                            (!to || selectedDate <= to)
                          );
                        });
                        if (selectedBlock) {
                          driver.dateID = selectedBlock.dateID;
                          driver.driverValue = selectedBlock.dateValue
                            ? selectedBlock.dateValue
                            : selectedBlock.defaultDateValue
                              ? selectedBlock.defaultDateValue
                              : null;
                          driver.enteredDate = format(
                            selectedDate,
                            selectedBlock.dateFormat,
                          );
                          driver.enteredDateFormat = selectedBlock.dateFormat;
                          driver.date = driver.date.map((block) => ({
                            ...block,
                            isDefault:
                              block.dateID == selectedBlock.dateID
                                ? true
                                : false,
                            enteredDate:
                              block.dateID === selectedBlock.dateID
                                ? driver.enteredDate
                                : (block.enteredDate ?? ""),
                          }));
                        }
                        console.log(driver.enteredDate);
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
                        } else {
                          driver.driverVisibility = false;
                        }
                      }
                      return driver; // Return the modified or unchanged driver object
                    },
                  );
                }
              }
              return service; // Return the modified or unchanged service object
            });
          }
        }
        return item; // Return the modified or unchanged item object
      });

      props.setOneOffServiceList(updatedOneOffList);
    }
  };

  const handleRecurringServiceCheckboxClick = (
    recurringService,
    subRecurringService,
  ) => {
    props.DisableTabOnChange();

    const updatedRecurringList = props.recurringServiceList?.map((category) => {
      if (category?.serviceCatID === recurringService?.serviceCatID) {
        return {
          ...category,
          servicesList: category.servicesList?.map((service) => {
            if (service.serviceID === subRecurringService.serviceID) {
              return {
                ...service,
                isSelected: service.isSelected === true ? false : true,
                isDisabled: false,
                pricingDriverList: service.pricingDriverList?.map(
                  (pricingList) => {
                    return {
                      ...pricingList,
                      driverValue:
                        pricingList.driverTypeID === 3
                          ? pricingList?.variation?.filter(
                              (i) => i.isDefault === true,
                            )[0]?.variationValue
                          : pricingList?.slab?.filter(
                              (i) => i.isDefault === true,
                            )[0]?.slabValue || null,
                    };
                  },
                ),
              };
            }
            return service;
          }),
        };
      }
      return category;
    });
    props.setRecurringServiceList(updatedRecurringList);
    const updatedOneOffServiceList = props.oneOffServiceList?.map(
      (category) => {
        if (category?.serviceCatID === recurringService?.serviceCatID) {
          return {
            ...category,
            servicesList: category.servicesList?.map((service) => {
              if (service.serviceID === subRecurringService.serviceID) {
                return {
                  ...service,
                  isDisabled: !service.isDisabled,
                };
              }
              return service;
            }),
          };
        }
        return category;
      },
    );
    props.setOneOffServiceList(updatedOneOffServiceList);
  };

  const handleOneOffServiceCheckboxClick = (
    recurringService,
    subRecurringService,
  ) => {
    props.DisableTabOnChange();

    const updatedOneOffServiceList = props.oneOffServiceList?.map(
      (category) => {
        if (category?.serviceCatID === recurringService?.serviceCatID) {
          return {
            ...category,
            servicesList: category.servicesList?.map((service) => {
              if (service.serviceID === subRecurringService.serviceID) {
                return {
                  ...service,
                  isSelected: service.isSelected === true ? false : true,
                  isDisabled: false,
                  pricingDriverList: service.pricingDriverList?.map(
                    (pricingList) => {
                      return {
                        ...pricingList,
                        driverValue:
                          pricingList.driverTypeID === 3
                            ? pricingList?.variation?.filter(
                                (i) => i.isDefault === true,
                              )[0]?.variationValue
                            : pricingList?.slab?.filter(
                                (i) => i.isDefault === true,
                              )[0]?.slabValue,
                      };
                    },
                  ),
                };
              }
              return service;
            }),
          };
        }
        return category;
      },
    );

    props.setOneOffServiceList(updatedOneOffServiceList);
    const updatedRecurringList = props.recurringServiceList?.map((category) => {
      if (category?.serviceCatID === recurringService?.serviceCatID) {
        return {
          ...category,
          servicesList: category.servicesList?.map((service) => {
            if (service.serviceID === subRecurringService.serviceID) {
              return {
                ...service,
                isDisabled: !service.isDisabled,
              };
            }
            return service;
          }),
        };
      }
      return category;
    });

    props.setRecurringServiceList(updatedRecurringList);
  };

  const OnQuantityValueChange = (
    recurringService,
    subRecurringService,
    prevId,
    value,
    Type,
    quantityDecimalPlaces,
  ) => {
    props.DisableTabOnChange();
    // Ensure that the input only contains numeric characters
    const sanitizedInput = value
      .replace(/[^0-9.]/g, "") // Allow only numeric, dot, and negative sign characters
      .slice(0, 16); // Limit to 8 characters (5 digits + 1 dot + 1 decimal + 1 negative sign)

    // Split the input into integer and decimal parts
    const [integerPart, decimalPart] = sanitizedInput.split(".");

    // Combine integer and decimal parts with appropriate precision
    if (sanitizedInput == undefined) {
      return;
    }
    let formattedInput;
    const decimalPlaces = Number(quantityDecimalPlaces) ?? 0;
    if (decimalPart !== undefined) {
      if (integerPart.includes("-")) {
        // For negative values, ensure 5 digits after the negative sign
        formattedInput = `-${integerPart.slice(1, 13)}.${decimalPart.slice(
          0,
          decimalPlaces,
        )}`;
      } else {
        // For positive values, limit to 5 digits before the decimal point
        formattedInput = `${integerPart.slice(0, 12)}.${decimalPart.slice(
          0,
          decimalPlaces,
        )}`;
      }
    } else {
      // No decimal part, limit to 5 digits
      formattedInput = integerPart.includes("-")
        ? `-${integerPart.slice(1, 13)}`
        : `${integerPart.slice(0, 12)}`;
    }

    if (Type === "RecurringService") {
      const updatedRecurringList = props.recurringServiceList?.map(
        (category) => {
          if (category?.serviceCatID === recurringService?.serviceCatID) {
            return {
              ...category,
              servicesList: category.servicesList?.map((service) => {
                if (service.serviceID === subRecurringService.serviceID) {
                  return {
                    ...service,
                    pricingDriverList: service.pricingDriverList?.map(
                      (pricingList) => {
                        if (
                          pricingList.globalPricingDriverID ===
                          prevId.globalPricingDriverID
                        ) {
                          return {
                            ...pricingList,
                            driverValue: formattedInput.replace(
                              /-/g,
                              (match, index) => (index === 0 ? match : ""),
                            ),
                          };
                        }
                        // Make sure to return the original object when none of the conditions are met
                        return pricingList;
                      },
                    ),
                  };
                }
                return service;
              }),
            };
          }
          return category;
        },
      );
      props.setRecurringServiceList(updatedRecurringList);
    } else if (Type === "OneOffService") {
      const updatedRecurringList = props.oneOffServiceList?.map((category) => {
        if (category?.serviceCatID === recurringService?.serviceCatID) {
          return {
            ...category,
            servicesList: category.servicesList?.map((service) => {
              if (service.serviceID === subRecurringService.serviceID) {
                return {
                  ...service,
                  pricingDriverList: service.pricingDriverList?.map(
                    (pricingList) => {
                      if (
                        pricingList.globalPricingDriverID ===
                        prevId.globalPricingDriverID
                      ) {
                        return {
                          ...pricingList,
                          driverValue: formattedInput.replace(
                            /-/g,
                            (match, index) => (index === 0 ? match : ""),
                          ),
                        };
                      }
                      // Make sure to return the original object when none of the conditions are met
                      return pricingList;
                    },
                  ),
                };
              }
              return service;
            }),
          };
        }
        return category;
      });
      props.setOneOffServiceList(updatedRecurringList);
    }
  };

  const OnTextValueChange = (
    recurringService,
    subRecurringService,
    prevId,
    value,
    Type,
  ) => {
    props.DisableTabOnChange();

    const maxLength = prevId?.text?.[0]?.textLength || 100;
    const allowed = (prevId?.text?.[0]?.allowedSpecialCharacters || "")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const escapeRegexChar = (char) =>
      char.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

    const allowedSpecialPattern = allowed.map(escapeRegexChar).join("");
    const allowedRegex = new RegExp(
      `[^a-zA-Z0-9 ${allowedSpecialPattern}]`,
      "g",
    );

    const sanitized = value.replace(allowedRegex, "").slice(0, maxLength);

    if (Type === "RecurringService") {
      const updatedList = props.recurringServiceList?.map((category) => {
        if (category?.serviceCatID === recurringService?.serviceCatID) {
          return {
            ...category,
            servicesList: category.servicesList?.map((service) => {
              if (service.serviceID === subRecurringService?.serviceID) {
                return {
                  ...service,
                  pricingDriverList: service.pricingDriverList?.map(
                    (driver) => {
                      if (
                        driver.globalPricingDriverID ===
                          prevId.globalPricingDriverID &&
                        driver.driverTypeID === 5
                      ) {
                        return {
                          ...driver,
                          driverValue:
                            sanitized === "" ? 0 : driver.text?.[0]?.textValue,
                          enteredText: sanitized,
                        };
                      }
                      return driver;
                    },
                  ),
                };
              }
              return service;
            }),
          };
        }
        return category;
      });
      props.setRecurringServiceList(updatedList);
    } else if (Type === "OneOffService") {
      const updatedList = props.oneOffServiceList?.map((category) => {
        if (category?.serviceCatID === recurringService?.serviceCatID) {
          return {
            ...category,
            servicesList: category.servicesList?.map((service) => {
              if (service.serviceID === subRecurringService?.serviceID) {
                return {
                  ...service,
                  pricingDriverList: service.pricingDriverList?.map(
                    (driver) => {
                      if (
                        driver.globalPricingDriverID ===
                          prevId.globalPricingDriverID &&
                        driver.driverTypeID === 5
                      ) {
                        return {
                          ...driver,
                          driverValue:
                            sanitized === "" ? 0 : driver.text?.[0]?.textValue,
                          enteredText: sanitized,
                        };
                      }
                      return driver;
                    },
                  ),
                };
              }
              return service;
            }),
          };
        }
        return category;
      });
      props.setOneOffServiceList(updatedList);
    }
  };

  const handleDateBoundaryChange = (value, driverItem, fieldType) => {
    const updateServiceList = (list, setter) => {
      const updatedList = list.map((cat) => ({
        ...cat,
        servicesList: cat.servicesList.map((service) => ({
          ...service,
          pricingDriverList: service.pricingDriverList.map((driver) => {
            if (
              driver.globalPricingDriverID === driverItem.globalPricingDriverID
            ) {
              return {
                ...driver,
                driverValue: driver.date?.[0]?.dateValue ?? null,
                enteredDate: value,
                date: [
                  {
                    ...driver.date?.[0],
                  },
                ],
              };
            }
            return driver;
          }),
        })),
      }));
      setter(updatedList);
    };

    updateServiceList(
      props.recurringServiceList,
      props.setRecurringServiceList,
    );
    updateServiceList(props.oneOffServiceList, props.setOneOffServiceList);
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

  const getMatchingBlock = (date, blocks, formatStr) => {
    return blocks.find((block) => {
      const from = block.fromDate
        ? parseStoredDate(block.fromDate, formatStr)
        : null;
      const to = block.toDate ? parseStoredDate(block.toDate, formatStr) : null;

      return (!from || date >= from) && (!to || date <= to);
    });
  };

  const parseStoredDate = (dateStr, formatStr) => {
    if (!dateStr) return null;
    try {
      // Try the specified format first
      if (formatStr) {
        return parse(dateStr, formatStr, new Date());
      }
      // Fallback to ISO format
      return parse(dateStr, "yyyy-MM-dd", new Date());
    } catch (err) {
      console.error("Invalid date string:", dateStr, "with format:", formatStr);
      return null;
    }
  };

  const convertToInputValue = (formattedDate, dateFormat = "dd/MM/yyyy") => {
    if (!formattedDate) return "";

    const separator = dateFormat.includes("/") ? "/" : "-";
    const formatParts = dateFormat.split(separator); // e.g. ["dd", "MM", "yyyy"]
    const dateParts = formattedDate.split(separator); // e.g. ["16", "05", "2025"]

    if (formatParts.length !== 3 || dateParts.length !== 3) return "";

    let day, month, year;

    formatParts.forEach((part, index) => {
      switch (part) {
        case "dd":
          day = dateParts[index];
          break;
        case "MM":
          month = dateParts[index];
          break;
        case "yyyy":
          year = dateParts[index];
          break;
        // You can extend for other tokens if needed
      }
    });

    if (!year || !month || !day) return "";

    return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  // Function to update date value in the lists, similar to your OnTextValueChange
  const OnDateValueChange = (
    recurringService,
    subRecurringService,
    prevId,
    value,
    Type,
    dateFormat,
  ) => {
    props.DisableTabOnChange();

    // Simply update dateValue as the raw input string, no parsing or validation
    if (Type === "RecurringService") {
      const updatedList = props.recurringServiceList?.map((category) => {
        if (category?.serviceCatID === recurringService?.serviceCatID) {
          return {
            ...category,
            servicesList: category.servicesList?.map((service) => {
              if (service.serviceID === subRecurringService?.serviceID) {
                return {
                  ...service,
                  pricingDriverList: service.pricingDriverList?.map(
                    (driver) => {
                      if (
                        driver.globalPricingDriverID ===
                          prevId.globalPricingDriverID &&
                        driver.driverTypeID === 6 // date type
                      ) {
                        return {
                          ...driver,
                          driverValue: driver?.date?.[0]?.dateValue,
                          enteredDate: dateFormat,
                        };
                      }
                      return driver;
                    },
                  ),
                };
              }
              return service;
            }),
          };
        }
        return category;
      });
      props.setRecurringServiceList(updatedList);
    } else if (Type === "OneOffService") {
      const updatedList = props.oneOffServiceList?.map((category) => {
        if (category?.serviceCatID === recurringService?.serviceCatID) {
          return {
            ...category,
            servicesList: category.servicesList?.map((service) => {
              if (service.serviceID === subRecurringService?.serviceID) {
                return {
                  ...service,
                  pricingDriverList: service.pricingDriverList?.map(
                    (driver) => {
                      if (
                        driver.globalPricingDriverID ===
                          prevId.globalPricingDriverID &&
                        driver.driverTypeID === 6
                      ) {
                        return {
                          ...driver,
                          driverValue: driver?.date?.[0]?.dateValue,
                          enteredDate: dateFormat,
                        };
                      }
                      return driver;
                    },
                  ),
                };
              }
              return service;
            }),
          };
        }
        return category;
      });
      props.setOneOffServiceList(updatedList);
    }
  };

  const OnIncrementalValueChange = (
    recurringService,
    subRecurringService,
    prevId,
    value,
    Type,
  ) => {
    props.DisableTabOnChange();
    // Ensure that the input only contains numeric characters
    const sanitizedInput = value
      .replace(/[^0-9.-]/g, "") // Allow only numeric, dot, and negative sign characters
      .slice(0, 16); // Limit to 8 characters (5 digits + 1 dot + 1 decimal + 1 negative sign)

    // Split the input into integer and decimal parts
    const [integerPart, decimalPart] = sanitizedInput.split(".");

    // Combine integer and decimal parts with appropriate precision
    if (sanitizedInput == undefined) {
      return;
    }
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

    if (Type === "RecurringService") {
      let updatedRecurringList = props.recurringServiceList?.map((category) => {
        if (category?.serviceCatID === recurringService?.serviceCatID) {
          return {
            ...category,
            servicesList: category.servicesList?.map((service) => {
              if (service.serviceID === subRecurringService.serviceID) {
                return {
                  ...service,
                  pricingDriverList: service.pricingDriverList?.map(
                    (pricingList) => {
                      if (
                        pricingList.globalPricingDriverID ===
                        prevId.globalPricingDriverID
                      ) {
                        return {
                          ...pricingList,
                          driverValue: formattedInput.replace(
                            /-/g,
                            (match, index) => (index === 0 ? match : ""),
                          ),
                          slab: pricingList.slab.map((slab) => {
                            if (slab.isDefault === true) {
                              return {
                                ...slab,
                                slabValue: formattedInput.replace(
                                  /-/g,
                                  (match, index) => (index === 0 ? match : ""),
                                ), // Assuming formattedInput is your desired new value
                              };
                            }
                            return slab; // Preserve other slabs
                          }),
                        };
                      }
                      // Make sure to return the original object when none of the conditions are met
                      return pricingList;
                    },
                  ),
                };
              }
              return service;
            }),
          };
        }
        return category;
      });

      props.setRecurringServiceList(updatedRecurringList);
    } else if (Type === "OneOffService") {
      let updatedOneOffList = props.oneOffServiceList?.map((category) => {
        if (category?.serviceCatID === recurringService?.serviceCatID) {
          return {
            ...category,
            servicesList: category.servicesList?.map((service) => {
              if (service.serviceID === subRecurringService.serviceID) {
                return {
                  ...service,
                  pricingDriverList: service.pricingDriverList?.map(
                    (pricingList) => {
                      if (
                        pricingList.globalPricingDriverID ===
                        prevId.globalPricingDriverID
                      ) {
                        return {
                          ...pricingList,
                          driverValue: formattedInput.replace(
                            /-/g,
                            (match, index) => (index === 0 ? match : ""),
                          ),
                          slab: pricingList.slab.map((slab) => {
                            if (slab.isDefault === true) {
                              return {
                                ...slab,
                                slabValue: formattedInput.replace(
                                  /-/g,
                                  (match, index) => (index === 0 ? match : ""),
                                ), // Assuming formattedInput is your desired new value
                              };
                            }
                            return slab; // Preserve other slabs
                          }),
                        };
                      }
                      // Make sure to return the original object when none of the conditions are met
                      return pricingList;
                    },
                  ),
                };
              }
              return service;
            }),
          };
        }
        return category;
      });
      props.setOneOffServiceList(updatedOneOffList);
    }
  };
  // Pricing-driver inputs for a selected recurring service (shared by all themes)
  const renderRecurringDrivers = (
    recurringService,
    subRecurringService,
    index,
  ) =>
    subRecurringService?.pricingDriverList.length >= 1 &&
    subRecurringService?.isSelected &&
    subRecurringService?.pricingDriverList.map((i) => {
      const isMandatory = i.date?.some(
        (block) => block.dateValue != null || block.defaultDateValue != null,
      );
      return (
        <div
          style={{
            width: "90%",
            float: "right",
          }}
        >
          {i?.driverTypeID === 3 && i?.driverVisibility && (
            <div>
              <label className="mt-2">
                <strong>
                  {isMobile ? (
                    <>
                      {i?.driverName
                        .substring(0, 10)
                        .replace(/\b\w/g, (l) => l.toUpperCase()) + "..."}
                    </>
                  ) : (
                    <>
                      {i?.driverName.length > 38 ? (
                        <Tooltip title={i?.driverName}>
                          {i?.driverName
                            .substring(0, 38)
                            .replace(/\b\w/g, (l) => l.toUpperCase()) + "..."}
                        </Tooltip>
                      ) : (
                        <>
                          {i?.driverName.replace(/\b\w/g, (l) =>
                            l.toUpperCase(),
                          )}
                        </>
                      )}
                    </>
                  )}
                </strong>
                <span className="text-danger">*</span>
              </label>
              <Select
                options={i?.variation.map((variation) => ({
                  value: variation.variationID,
                  label: variation.variationName,
                  variationValue: variation.variationValue,
                }))}
                value={i?.variation
                  .filter((variation) => variation.isDefault === true)
                  .map((i) => ({
                    value: i.variationID,
                    label: i.variationName,
                  }))}
                onChange={(selectOption) =>
                  handleRecurringServiceDependsServerClick(
                    recurringService,
                    subRecurringService,
                    selectOption,
                    i,
                    "RecurringService",
                  )
                }
              />
              {props.requireMessage &&
                (i.driverValue === null ||
                  i.driverValue === undefined ||
                  i.driverValue === "") && (
                  <label className="text-danger">{ERROR_MESSAGES}</label>
                )}
            </div>
          )}
          {i?.driverTypeID === 2 && i?.driverVisibility && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
              id={`SelectServiceQuantity_${i.driverName}`}
            >
              <label className="mt-2">
                <strong>
                  {isMobile ? (
                    <>
                      {i?.driverName
                        .substring(0, 10)
                        .replace(/\b\w/g, (l) => l.toUpperCase()) + "..."}
                    </>
                  ) : (
                    <>
                      {i?.driverName.length > 38 ? (
                        <Tooltip title={i?.driverName}>
                          {i?.driverName
                            .substring(0, 38)
                            .replace(/\b\w/g, (l) => l.toUpperCase()) + "..."}
                        </Tooltip>
                      ) : (
                        <>
                          {i?.driverName.replace(/\b\w/g, (l) =>
                            l.toUpperCase(),
                          )}
                        </>
                      )}
                    </>
                  )}
                </strong>
                <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={i?.driverValue
                  ?.toString()
                  ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                onChange={(e) => {
                  OnQuantityValueChange(
                    recurringService,
                    subRecurringService,
                    i,
                    e.target.value,
                    "RecurringService",
                    i.quantity?.[0]?.quantityDecimalPlaces ?? 0,
                  );
                }}
                className="input-text"
                placeholder={i?.driverName}
              />
              {props.requireMessage &&
                (i?.driverValue === undefined ||
                  i?.driverValue === null ||
                  i?.driverValue === "") &&
                i?.driverTypeID === 2 && (
                  <label className="text-danger">{ERROR_MESSAGES}</label>
                )}
              {props.requireMessage &&
                i?.driverValue &&
                (() => {
                  const driverValue = Number(i.driverValue);
                  const quantityDetails = i.quantity?.[0];
                  if (!quantityDetails) {
                    return null;
                  }
                  const {
                    quantityFrom,
                    quantityTo,
                    quantityDecimalPlaces = 0,
                  } = quantityDetails;

                  const parseAndValidateValue = (value) => {
                    if (value === null || value === undefined || value === "") {
                      return { exists: false, numValue: NaN };
                    }
                    const num = Number(value);
                    return { exists: !isNaN(num), numValue: num };
                  };
                  const { exists: hasFrom, numValue: fromNum } =
                    parseAndValidateValue(quantityFrom);
                  const { exists: hasTo, numValue: toNum } =
                    parseAndValidateValue(quantityTo);

                  let showError = false;
                  let message = "";

                  if (hasFrom && hasTo) {
                    if (driverValue < fromNum || driverValue > toNum) {
                      showError = true;
                      message = `Value must be between ${fromNum.toFixed(quantityDecimalPlaces)} and ${toNum.toFixed(quantityDecimalPlaces)}`;
                    }
                  } else if (hasFrom) {
                    if (driverValue < fromNum) {
                      showError = true;
                      message = `Value must be greater than or equal to ${fromNum.toFixed(quantityDecimalPlaces)}`;
                    }
                  } else if (hasTo) {
                    if (driverValue > toNum) {
                      showError = true;
                      message = `Value must be less than or equal to ${toNum.toFixed(quantityDecimalPlaces)}`;
                    }
                  }
                  if (!showError) {
                    return null;
                  }

                  return <label className="text-danger">{message}</label>;
                })()}
            </div>
          )}
          {i?.driverTypeID === 5 && i?.driverVisibility && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
              id={`SelectServiceText_${i.driverName}`}
            >
              <label className="mt-2">
                <strong>
                  {isMobile ? (
                    <>
                      {i?.driverName
                        .substring(0, 10)
                        .replace(/\b\w/g, (l) => l.toUpperCase()) + "..."}
                    </>
                  ) : (
                    <>
                      {i?.driverName.length > 38 ? (
                        <Tooltip title={i?.driverName}>
                          {i?.driverName
                            .substring(0, 38)
                            .replace(/\b\w/g, (l) => l.toUpperCase()) + "..."}
                        </Tooltip>
                      ) : (
                        <>
                          {i?.driverName.replace(/\b\w/g, (l) =>
                            l.toUpperCase(),
                          )}
                        </>
                      )}
                    </>
                  )}
                </strong>
                {i?.text?.[0]?.textValue !== null && (
                  <span className="text-danger">*</span>
                )}
              </label>
              <input
                type="text"
                value={i?.enteredText || null}
                onBeforeInput={(e) => {
                  const char = e.data;
                  if (!char) return;

                  // Get allowed special characters from comma-separated string
                  const allowed = (i?.text?.[0]?.allowedSpecialCharacters || "")
                    .split(",")
                    .map((c) => c.trim())
                    .filter(Boolean);

                  const isAlphanumeric = /^[a-zA-Z0-9 ]$/.test(char);
                  const isAllowedSpecial = allowed.includes(char);

                  if (!isAlphanumeric && !isAllowedSpecial) {
                    e.preventDefault(); // Block disallowed characters
                  }
                }}
                onChange={(e) => {
                  const rawInput = e.target.value;
                  const maxLength = i?.text?.[0]?.textLength || 100;

                  // Allowed special characters from string
                  const allowed = (i?.text?.[0]?.allowedSpecialCharacters || "")
                    .split(",")
                    .map((c) => c.trim())
                    .filter(Boolean);

                  // Escape special characters for regex
                  const escapeRegexChar = (char) =>
                    char.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

                  const allowedSpecialPattern = allowed
                    .map(escapeRegexChar)
                    .join("");

                  // Allow only alphanumeric + space + allowed special characters
                  const allowedRegex = new RegExp(
                    `[^a-zA-Z0-9 ${allowedSpecialPattern}]`,
                    "g",
                  );

                  const sanitized = rawInput
                    .replace(allowedRegex, "")
                    .slice(0, maxLength);

                  OnTextValueChange(
                    recurringService,
                    subRecurringService,
                    i,
                    sanitized,
                    "RecurringService",
                  );
                }}
                className="input-text"
                placeholder={i?.driverName}
                maxLength={i?.text?.[0]?.textLength || 100}
              />

              {props.requireMessage &&
                i?.text?.[0]?.textValue !== null &&
                (1)?.text?.[0]?.textValue !== 0 &&
                (!i?.enteredText ||
                  i?.enteredText === "" ||
                  i?.enteredText === null ||
                  i?.enteredText === undefined) &&
                i?.driverTypeID === 5 && (
                  <label className="text-danger">{ERROR_MESSAGES}</label>
                )}
            </div>
          )}
          {i?.driverTypeID === 6 && i?.driverVisibility && (
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
                id={`SelectServiceDate_${i.driverName}`}
              >
                <label className="mt-2">
                  <strong>
                    {isMobile ? (
                      <>
                        {i?.driverName
                          .substring(0, 10)
                          .replace(/\b\w/g, (l) => l.toUpperCase()) + "..."}
                      </>
                    ) : (
                      <>
                        {i?.driverName.length > 38 ? (
                          <Tooltip title={i?.driverName}>
                            {i?.driverName
                              .substring(0, 38)
                              .replace(/\b\w/g, (l) => l.toUpperCase()) + "..."}
                          </Tooltip>
                        ) : (
                          <>
                            {i?.driverName.replace(/\b\w/g, (l) =>
                              l.toUpperCase(),
                            )}
                          </>
                        )}
                      </>
                    )}
                  </strong>
                  {isMandatory && <span className="text-danger">*</span>}
                </label>
                <DatePicker
                  className="input-text"
                  selected={
                    i.enteredDate
                      ? (() => {
                          const userDate = convertAndParseDate(
                            i.enteredDate,
                            i.enteredDateFormat,
                            i.date?.[0]?.dateFormat,
                          );

                          const matchingDateBlock = getMatchingBlock(
                            userDate,
                            i.date,
                            i.date?.[0]?.dateFormat,
                          );

                          if (matchingDateBlock) {
                            i.driverValue =
                              matchingDateBlock.dateValue ??
                              matchingDateBlock.defaultDateValue;
                            i.dateID = matchingDateBlock.dateID;
                          }

                          return userDate;
                        })()
                      : (() => {
                          i.driverValue = null;
                          i.dateID = null;
                          return null;
                        })()
                  }
                  onChange={(date) => {
                    i.enteredDate = format(date, i.date?.[0]?.dateFormat);

                    const block = getMatchingBlock(
                      date,
                      i.date,
                      i.date?.[0]?.dateFormat,
                    );
                    if (block) {
                      i.driverValue = block.dateValue ?? block.defaultDateValue;
                      i.dateID = block.dateID;
                    }

                    handleRecurringServiceDependsServerClick(
                      recurringService,
                      subRecurringService,
                      date,
                      i,
                      "RecurringService",
                    );
                  }}
                  dateFormat={i.date?.[0]?.dateFormat}
                  minDate={getMinDate(i.date, i.date?.[0]?.dateFormat)}
                  maxDate={getMaxDate(i.date, i.date?.[0]?.dateFormat)}
                  placeholderText="Select a valid date"
                  showMonthDropdown
                  dropdownMode="select"
                />
              </div>
              {props.requireMessage &&
                isMandatory &&
                (typeof i.enteredDate !== "string" ||
                  i.enteredDate.trim() === "") && (
                  <label className="text-danger">{ERROR_MESSAGES}</label>
                )}
            </>
          )}
          {i?.driverTypeID === 4 && i?.driverVisibility && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
              id={`SelectServiceQuantity_${i.driverName}`}
            >
              <label className="mt-1">
                <strong>
                  {isMobile ? (
                    <>
                      {i?.driverName
                        .substring(0, 10)
                        .replace(/\b\w/g, (l) => l.toUpperCase()) + "..."}
                    </>
                  ) : (
                    <>
                      {i?.driverName.length > 38 ? (
                        <Tooltip title={i?.driverName}>
                          {i?.driverName
                            .substring(0, 38)
                            .replace(/\b\w/g, (l) => l.toUpperCase()) + "..."}
                        </Tooltip>
                      ) : (
                        <>
                          {i?.driverName.replace(/\b\w/g, (l) =>
                            l.toUpperCase(),
                          )}
                        </>
                      )}
                    </>
                  )}
                </strong>
                <span className="text-danger">*</span>
              </label>
              <Select
                // options={i.slab.map(
                //   (i) => ({
                //     value: i.slabID,
                //     label:
                //       i.slabTypeID === 2
                //         ? "Other"
                //         : `${i.slabFrom
                //           .toString()
                //           .replace(
                //             /\B(?=(\d{3})+(?!\d))/g,
                //             ","
                //           )} - ${i.slabTo
                //             .toString()
                //             .replace(
                //               /\B(?=(\d{3})+(?!\d))/g,
                //               ","
                //             )}`,
                //     variationValue:
                //       i.slabValue,
                //   })
                // )}
                options={i.slab.map((slab) => {
                  const decimalPlaces = slab.decimalPlaces ?? 0;
                  return {
                    value: slab.slabID,
                    label:
                      slab.slabTypeID === 2
                        ? "Other"
                        : `${Number(slab.slabFrom)
                            .toFixed(decimalPlaces)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} - ${Number(
                            slab.slabTo,
                          )
                            .toFixed(decimalPlaces)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
                    variationValue: slab.slabValue,
                  };
                })}
                // value={slabSelectedRecValue}
                value={i?.slab
                  ?.filter((slab) => slab.isDefault === true)
                  .map((slab) => {
                    const decimalPlaces = slab.decimalPlaces ?? 0;
                    return {
                      value: slab.slabID,
                      label:
                        slab.slabTypeID === 2
                          ? "Other"
                          : `${Number(slab.slabFrom)
                              .toFixed(decimalPlaces)
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} -
                                                                   ${Number(
                                                                     slab.slabTo,
                                                                   )
                                                                     .toFixed(
                                                                       decimalPlaces,
                                                                     )
                                                                     .replace(
                                                                       /\B(?=(\d{3})+(?!\d))/g,
                                                                       ",",
                                                                     )}`,
                    };
                  })}
                onChange={(selectOption) =>
                  handleRecurringServiceDependsServerClick(
                    recurringService,
                    subRecurringService,
                    selectOption,
                    i,
                    "RecurringService",
                  )
                }
              />
              {i?.slab
                ?.filter((slab) => slab.isDefault === true)
                .map((item) => {
                  return (
                    item.slabTypeID === 2 && (
                      <input
                        type="text"
                        value={i?.driverValue
                          ?.toString()
                          ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        onChange={(e) => {
                          OnIncrementalValueChange(
                            recurringService,
                            subRecurringService,
                            i,
                            e.target.value,
                            "RecurringService",
                          );
                        }}
                        className="input-text  mt-2"
                        placeholder="Other"
                      />
                    )
                  );
                })}

              {props.requireMessage &&
                (i.driverValue === null ||
                  i.driverValue === undefined ||
                  i.driverValue === "") && (
                  <label className="text-danger">{ERROR_MESSAGES}</label>
                )}
            </div>
          )}
        </div>
      );
    });

  // Pricing-driver inputs for a selected one-off service (shared by all themes)
  const renderOneOffDrivers = (oneOffService, subOneOff, index) =>
    subOneOff?.pricingDriverList.length >= 1 &&
    subOneOff?.isSelected &&
    subOneOff?.pricingDriverList.map((i) => {
      const isMandatory = i.date?.some(
        (block) => block.dateValue != null || block.defaultDateValue != null,
      );
      return (
        <div
          style={{
            width: "90%",
            float: "right",
          }}
        >
          {i?.driverTypeID === 3 && i?.driverVisibility && (
            <div>
              <label className="mt-2">
                <strong>
                  {isMobile ? (
                    <>
                      {i?.driverName
                        .substring(0, 10)
                        .replace(/\b\w/g, (l) => l.toUpperCase()) + "..."}
                    </>
                  ) : (
                    <>
                      {i?.driverName.length > 38 ? (
                        <Tooltip title={i?.driverName}>
                          {i?.driverName
                            .substring(0, 38)
                            .replace(/\b\w/g, (l) => l.toUpperCase()) + "..."}
                        </Tooltip>
                      ) : (
                        <>
                          {i?.driverName.replace(/\b\w/g, (l) =>
                            l.toUpperCase(),
                          )}
                        </>
                      )}
                    </>
                  )}
                </strong>
                <span className="text-danger">*</span>
              </label>
              <Select
                options={i?.variation.map((variation) => ({
                  value: variation.variationID,
                  label: variation.variationName,
                  variationValue: variation.variationValue,
                }))}
                value={i?.variation
                  .filter((variation) => variation.isDefault === true)
                  .map((i) => ({
                    value: i.variationID,
                    label: i.variationName,
                  }))}
                onChange={(selectOption) =>
                  handleRecurringServiceDependsServerClick(
                    oneOffService,
                    subOneOff,
                    selectOption,
                    i,
                    "OneOffService",
                  )
                }
              />
              {props.requireMessage &&
                (i.driverValue === null ||
                  i.driverValue === undefined ||
                  i.driverValue === "") && (
                  <label className="text-danger">{ERROR_MESSAGES}</label>
                )}
            </div>
          )}
          {i?.driverTypeID === 5 && i?.driverVisibility && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
              id={`SelectServiceText_${i.driverName}`}
            >
              <label className="mt-2">
                <strong>
                  {isMobile ? (
                    <>
                      {i?.driverName
                        .substring(0, 10)
                        .replace(/\b\w/g, (l) => l.toUpperCase()) + "..."}
                    </>
                  ) : (
                    <>
                      {i?.driverName.length > 38 ? (
                        <Tooltip title={i?.driverName}>
                          {i?.driverName
                            .substring(0, 38)
                            .replace(/\b\w/g, (l) => l.toUpperCase()) + "..."}
                        </Tooltip>
                      ) : (
                        <>
                          {i?.driverName.replace(/\b\w/g, (l) =>
                            l.toUpperCase(),
                          )}
                        </>
                      )}
                    </>
                  )}
                </strong>
                {i?.text?.[0]?.textValue !== null && (
                  <span className="text-danger">*</span>
                )}
              </label>
              <input
                type="text"
                value={i?.enteredText || null}
                onBeforeInput={(e) => {
                  const char = e.data;
                  if (!char) return;

                  // Get allowed special characters from comma-separated string
                  const allowed = (i?.text?.[0]?.allowedSpecialCharacters || "")
                    .split(",")
                    .map((c) => c.trim())
                    .filter(Boolean);

                  const isAlphanumeric = /^[a-zA-Z0-9 ]$/.test(char);
                  const isAllowedSpecial = allowed.includes(char);

                  if (!isAlphanumeric && !isAllowedSpecial) {
                    e.preventDefault(); // Block disallowed characters
                  }
                }}
                onChange={(e) => {
                  const rawInput = e.target.value;
                  const maxLength = i?.text?.[0]?.textLength || 100;

                  // Allowed special characters from string
                  const allowed = (i?.text?.[0]?.allowedSpecialCharacters || "")
                    .split(",")
                    .map((c) => c.trim())
                    .filter(Boolean);

                  // Escape special characters for regex
                  const escapeRegexChar = (char) =>
                    char.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

                  const allowedSpecialPattern = allowed
                    .map(escapeRegexChar)
                    .join("");

                  // Allow only alphanumeric + space + allowed special characters
                  const allowedRegex = new RegExp(
                    `[^a-zA-Z0-9 ${allowedSpecialPattern}]`,
                    "g",
                  );

                  const sanitized = rawInput
                    .replace(allowedRegex, "")
                    .slice(0, maxLength);

                  OnTextValueChange(
                    oneOffService,
                    subOneOff,
                    i,
                    sanitized,
                    "OneOffService",
                  );
                }}
                className="input-text"
                placeholder={i?.driverName}
                maxLength={i?.text?.[0]?.textLength || 100}
              />

              {props.requireMessage &&
                i?.text?.[0]?.textValue !== null &&
                (!i?.enteredText ||
                  i?.enteredText === "" ||
                  i?.enteredText === null ||
                  i?.enteredText === undefined) &&
                i?.driverTypeID === 5 && (
                  <label className="text-danger">{ERROR_MESSAGES}</label>
                )}
            </div>
          )}
          {i?.driverTypeID === 6 && i?.driverVisibility && (
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
                id={`SelectServiceText_${i.driverName}`}
              >
                <label className="mt-2">
                  <strong>
                    {isMobile ? (
                      <>
                        {i?.driverName
                          .substring(0, 10)
                          .replace(/\b\w/g, (l) => l.toUpperCase()) + "..."}
                      </>
                    ) : (
                      <>
                        {i?.driverName.length > 38 ? (
                          <Tooltip title={i?.driverName}>
                            {i?.driverName
                              .substring(0, 38)
                              .replace(/\b\w/g, (l) => l.toUpperCase()) + "..."}
                          </Tooltip>
                        ) : (
                          <>
                            {i?.driverName.replace(/\b\w/g, (l) =>
                              l.toUpperCase(),
                            )}
                          </>
                        )}
                      </>
                    )}
                  </strong>
                  {isMandatory && <span className="text-danger">*</span>}
                </label>
                <DatePicker
                  className="input-text"
                  selected={
                    i.enteredDate
                      ? (() => {
                          const userDate = convertAndParseDate(
                            i.enteredDate,
                            i.enteredDateFormat,
                            i.date?.[0]?.dateFormat,
                          );

                          const matchingDateBlock = getMatchingBlock(
                            userDate,
                            i.date,
                            i.date?.[0]?.dateFormat,
                          );

                          if (matchingDateBlock) {
                            i.driverValue =
                              matchingDateBlock.dateValue ??
                              matchingDateBlock.defaultDateValue;
                            i.dateID = matchingDateBlock.dateID;
                          }

                          return userDate;
                        })()
                      : null
                  }
                  onChange={(date) => {
                    if (date && i.date?.[0]?.dateFormat) {
                      i.enteredDate = format(date, i.date[0].dateFormat);
                    } else {
                      i.enteredDate = null;
                    }

                    const block = getMatchingBlock(
                      date,
                      i.date,
                      i.date?.[0]?.dateFormat,
                    );
                    if (block) {
                      i.driverValue = block.dateValue ?? block.defaultDateValue;
                      i.dateID = block.dateID;
                    }

                    handleRecurringServiceDependsServerClick(
                      oneOffService,
                      subOneOff,
                      date,
                      i,
                      "OneOffService",
                    );
                  }}
                  dateFormat={i.date?.[0]?.dateFormat}
                  minDate={getMinDate(i.date, i.date?.[0]?.dateFormat)}
                  maxDate={getMaxDate(i.date, i.date?.[0]?.dateFormat)}
                  placeholderText="Select a valid date"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>
              {props.requireMessage &&
                isMandatory &&
                (typeof i.enteredDate !== "string" ||
                  i.enteredDate.trim() === "") && (
                  <label className="text-danger">{ERROR_MESSAGES}</label>
                )}
            </>
          )}
          {i?.driverTypeID === 2 && i?.driverVisibility && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
              id={`SelectServiceQuantity_${i.driverName}`}
            >
              <label className="mt-2">
                <strong>
                  {isMobile ? (
                    <>
                      {i?.driverName
                        .substring(0, 10)
                        .replace(/\b\w/g, (l) => l.toUpperCase()) + "..."}
                    </>
                  ) : (
                    <>
                      {i?.driverName.length > 38 ? (
                        <Tooltip title={i?.driverName}>
                          {i?.driverName
                            .substring(0, 38)
                            .replace(/\b\w/g, (l) => l.toUpperCase()) + "..."}
                        </Tooltip>
                      ) : (
                        <>
                          {i?.driverName.replace(/\b\w/g, (l) =>
                            l.toUpperCase(),
                          )}
                        </>
                      )}
                    </>
                  )}
                </strong>
                <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={i?.driverValue
                  ?.toString()
                  ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                onChange={(e) => {
                  OnQuantityValueChange(
                    oneOffService,
                    subOneOff,
                    i,
                    e.target.value,
                    "OneOffService",
                    i.quantity?.[0]?.quantityDecimalPlaces ?? 0,
                  );
                }}
                className="input-text"
                placeholder={i?.driverName}
              />
              {props.requireMessage &&
                (i?.driverValue === undefined ||
                  i?.driverValue === null ||
                  i?.driverValue === "") &&
                i?.driverTypeID === 2 && (
                  <label className="text-danger">{ERROR_MESSAGES}</label>
                )}
              {props.requireMessage &&
                i?.driverValue &&
                (() => {
                  const driverValue = Number(i.driverValue);
                  const quantityDetails = i.quantity?.[0];
                  if (!quantityDetails) {
                    return null;
                  }
                  const {
                    quantityFrom,
                    quantityTo,
                    quantityDecimalPlaces = 0,
                  } = quantityDetails;

                  const parseAndValidateValue = (value) => {
                    if (value === null || value === undefined || value === "") {
                      return { exists: false, numValue: NaN };
                    }
                    const num = Number(value);
                    return { exists: !isNaN(num), numValue: num };
                  };
                  const { exists: hasFrom, numValue: fromNum } =
                    parseAndValidateValue(quantityFrom);
                  const { exists: hasTo, numValue: toNum } =
                    parseAndValidateValue(quantityTo);

                  let showError = false;
                  let message = "";

                  if (hasFrom && hasTo) {
                    if (driverValue < fromNum || driverValue > toNum) {
                      showError = true;
                      message = `Value must be between ${fromNum.toFixed(quantityDecimalPlaces)} and ${toNum.toFixed(quantityDecimalPlaces)}`;
                    }
                  } else if (hasFrom) {
                    if (driverValue < fromNum) {
                      showError = true;
                      message = `Value must be greater than or equal to ${fromNum.toFixed(quantityDecimalPlaces)}`;
                    }
                  } else if (hasTo) {
                    if (driverValue > toNum) {
                      showError = true;
                      message = `Value must be less than or equal to ${toNum.toFixed(quantityDecimalPlaces)}`;
                    }
                  }
                  if (!showError) {
                    return null;
                  }

                  return <label className="text-danger">{message}</label>;
                })()}
            </div>
          )}

          {i?.driverTypeID === 4 && i?.driverVisibility && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
              id={`SelectServiceQuantity_${i.driverName}`}
            >
              <label className="mt-1">
                <strong>
                  {isMobile ? (
                    <>
                      {i?.driverName
                        .substring(0, 10)
                        .replace(/\b\w/g, (l) => l.toUpperCase()) + "..."}
                    </>
                  ) : (
                    <>
                      {i?.driverName.length > 38 ? (
                        <Tooltip title={i?.driverName}>
                          {i?.driverName
                            .substring(0, 38)
                            .replace(/\b\w/g, (l) => l.toUpperCase()) + "..."}
                        </Tooltip>
                      ) : (
                        <>
                          {i?.driverName.replace(/\b\w/g, (l) =>
                            l.toUpperCase(),
                          )}
                        </>
                      )}
                    </>
                  )}
                </strong>
                <span className="text-danger">*</span>
              </label>
              <Select
                // options={i.slab.map(
                //   (i) => ({
                //     value: i.slabID,
                //     label:
                //       i.slabTypeID === 2
                //         ? "Other"
                //         : `${i.slabFrom
                //           .toString()
                //           .replace(
                //             /\B(?=(\d{3})+(?!\d))/g,
                //             ","
                //           )} - ${i.slabTo
                //             .toString()
                //             .replace(
                //               /\B(?=(\d{3})+(?!\d))/g,
                //               ","
                //             )}`,
                //     variationValue:
                //       i.slabValue,
                //   })
                // )}
                options={i.slab.map((slab) => {
                  const decimalPlaces = slab.decimalPlaces ?? 0;
                  return {
                    value: slab.slabID,
                    label:
                      slab.slabTypeID === 2
                        ? "Other"
                        : `${Number(slab.slabFrom)
                            .toFixed(decimalPlaces)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} - ${Number(
                            slab.slabTo,
                          )
                            .toFixed(decimalPlaces)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
                    variationValue: slab.slabValue,
                  };
                })}
                // value={slabSelectedRecValue}
                // value={i?.slab
                //   ?.filter(
                //     (slab) =>
                //       slab.isDefault ===
                //       true
                //   )
                //   .map((i) => ({
                //     value: i.slabID,
                //     label:
                //       i.slabTypeID === 2
                //         ? "Other"
                //         : `${i.slabFrom
                //           .toString()
                //           .replace(
                //             /\B(?=(\d{3})+(?!\d))/g,
                //             ","
                //           )} - ${i.slabTo
                //             .toString()
                //             .replace(
                //               /\B(?=(\d{3})+(?!\d))/g,
                //               ","
                //             )}`,
                //   }))}
                value={i?.slab
                  ?.filter((slab) => slab.isDefault === true)
                  .map((slab) => {
                    const decimalPlaces = slab.decimalPlaces ?? 0;
                    return {
                      value: slab.slabID,
                      label:
                        slab.slabTypeID === 2
                          ? "Other"
                          : `${Number(slab.slabFrom)
                              .toFixed(decimalPlaces)
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} - 
                                                                ${Number(
                                                                  slab.slabTo,
                                                                )
                                                                  .toFixed(
                                                                    decimalPlaces,
                                                                  )
                                                                  .replace(
                                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                                    ",",
                                                                  )}`,
                    };
                  })}
                onChange={(selectOption) =>
                  handleRecurringServiceDependsServerClick(
                    oneOffService,
                    subOneOff,
                    selectOption,
                    i,
                    "OneOffService",
                  )
                }
              />
              {i?.slab
                ?.filter((slab) => slab.isDefault === true)
                .map((item) => {
                  return (
                    item.slabTypeID === 2 && (
                      <input
                        type="text"
                        value={i?.driverValue
                          ?.toString()
                          ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        onChange={(e) => {
                          OnIncrementalValueChange(
                            oneOffService,
                            subOneOff,
                            i,
                            e.target.value,
                            "OneOffService",
                          );
                        }}
                        className="input-text mt-2"
                        placeholder="Other"
                      />
                    )
                  );
                })}

              {props.requireMessage &&
                (i.driverValue === null ||
                  i.driverValue === undefined ||
                  i.driverValue === "") && (
                  <label className="text-danger">{ERROR_MESSAGES}</label>
                )}
            </div>
          )}
        </div>
      );
    });

  // ---------------- Theme 2 (UI only, same handlers as theme 1) ----------------
  const proposalTypeValue = props?.ProposalObject?.selectedProposalTypeValue;
  const isContractOrPackage =
    props?.moduleName == "Contract" || props.moduleName === "Package";

  const theme2Back = isContractOrPackage
    ? () => props.HandleBack(1)
    : proposalTypeValue === 1
      ? () => props.HandleBack(5)
      : proposalTypeValue === 3 || proposalTypeValue === 4
        ? () => props.HandleBack(1)
        : null;

  const theme2Next = isContractOrPackage
    ? async () => {
        await props.HandleTabChange(3);
      }
    : proposalTypeValue === 1
      ? async () => {
          await props.HandleTabChange(7);
        }
      : proposalTypeValue === 3
        ? async () => {
            await props.HandleTabChange(6);
          }
        : proposalTypeValue === 4
          ? async () => {
              await props.HandleTabChange(4);
            }
          : null;

  const theme2SaveDraft =
    props.moduleName == "Quote"
      ? () =>
          props.handleSaveAsDraft(2, moduleNameForSaveAsDraft, statusID.Draft)
      : props.moduleName == "Contract"
        ? () => props.HandleTabChange(3, statusID.Draft)
        : null;

  if (props.serviceThemeID === 2) {
    return (
      <SelectServicesTheme2
        recurringServiceList={props.recurringServiceList}
        oneOffServiceList={props.oneOffServiceList}
        requireMessage={props.requireMessage}
        isServiceSelected={isServiceSelectedForTheme}
        isServiceLocked={isServiceLockedForTheme}
        onToggleService={({ serviceType, category, service }) => {
          if (serviceType === 1) {
            handleRecurringServiceCheckboxClick(category, service);
          } else {
            handleOneOffServiceCheckboxClick(category, service);
          }
        }}
        renderServiceDetails={(service, category, serviceType, serviceIndex) =>
          serviceType === 1
            ? renderRecurringDrivers(category, service, serviceIndex)
            : renderOneOffDrivers(category, service, serviceIndex)
        }
        onBack={theme2Back}
        onNext={theme2Next}
        onSaveDraft={theme2SaveDraft}
        onCancel={
          props.getSAChanges
            ? () => props.DeclineSuperAdminChangesData("Decline")
            : props.handleCancel
        }
        cancelLabel={
          props.getSAChanges ? "Decline" : getCrudButtonTextName("Cancel")
        }
      />
    );
  }

  return (
    <>
      <div className="create-practice-height scrollbar">
        <div className="tab-content">
          <div className="tab-pane p-3 active">
            <div class="row">
              <div class="col-lg-6 col-md-6 col-sm-12 border-right-separator">
                <h6 className="text-center">Ongoing/Recurring Services</h6>
                <div class="separator mb-2"></div>
                <table
                  class="table align-middle table-nowrap"
                  id="customerTable"
                >
                  {props.recurringServiceList?.map((recurringService) => {
                    return (
                      <>
                        <thead class="table-light table-header-font">
                          <tr class="head-row">
                            <td className="tr-table-class text-white">
                              {isMobile ? (
                                <>
                                  {recurringService?.serviceCatName.length > 20
                                    ? recurringService?.serviceCatName
                                        .substring(0, 20)
                                        .replace(/\b\w/g, (l) =>
                                          l.toUpperCase(),
                                        ) + "..."
                                    : recurringService?.serviceCatName.replace(
                                        /\b\w/g,
                                        (l) => l.toUpperCase(),
                                      )}
                                </>
                              ) : (
                                <>
                                  {recurringService?.serviceCatName.length >
                                  30 ? (
                                    <Tooltip
                                      title={recurringService?.serviceCatName}
                                    >
                                      {recurringService?.serviceCatName
                                        .substring(0, 30)
                                        .replace(/\b\w/g, (l) =>
                                          l.toUpperCase(),
                                        ) + "..."}
                                    </Tooltip>
                                  ) : (
                                    <>
                                      {recurringService?.serviceCatName.replace(
                                        /\b\w/g,
                                        (l) => l.toUpperCase(),
                                      )}
                                    </>
                                  )}
                                </>
                              )}
                            </td>
                          </tr>
                        </thead>
                        <tbody>
                          {recurringService?.servicesList?.map(
                            (subRecurringService, index) => {
                              return (
                                <tr>
                                  {subRecurringService?.isHidden ? null : (
                                    <>
                                      <td>
                                        <div
                                          class="select-row align-center"
                                          id={`SelectServiceDiv${index}`}
                                        >
                                          <input
                                            type="checkbox"
                                            className="check check_tick"
                                            value={
                                              subRecurringService?.isSelected
                                            }
                                            // id={`flexCheckDefault_${subRecurringService.serviceID}`}
                                            onClick={() => {
                                              if (
                                                !subRecurringService.isDisabled
                                              ) {
                                                handleRecurringServiceCheckboxClick(
                                                  recurringService,
                                                  subRecurringService,
                                                );
                                              }
                                            }}
                                            checked={
                                              subRecurringService.isSelected
                                            }
                                            style={{
                                              cursor: `${
                                                subRecurringService.isDisabled ==
                                                true
                                                  ? notAllowed
                                                  : ""
                                              }`,
                                            }}
                                          />
                                          <label
                                            style={{
                                              wordBreak: "break-word",
                                              marginBottom: "0",
                                            }}
                                            onClick={() => {
                                              if (
                                                !subRecurringService.isDisabled
                                              ) {
                                                handleRecurringServiceCheckboxClick(
                                                  recurringService,
                                                  subRecurringService,
                                                );
                                              }
                                            }}
                                          >
                                            {isMobile ? (
                                              <>
                                                {subRecurringService.serviceName
                                                  .length > 20
                                                  ? subRecurringService.serviceName.substring(
                                                      0,
                                                      20,
                                                    ) + "..."
                                                  : subRecurringService.serviceName}
                                              </>
                                            ) : (
                                              <>
                                                {subRecurringService.serviceName
                                                  .length > 38 ? (
                                                  <Tooltip
                                                    title={
                                                      subRecurringService.serviceName
                                                    }
                                                  >
                                                    {subRecurringService.serviceName.substring(
                                                      0,
                                                      38,
                                                    ) + "..."}
                                                  </Tooltip>
                                                ) : (
                                                  <>
                                                    {
                                                      subRecurringService.serviceName
                                                    }
                                                  </>
                                                )}
                                              </>
                                            )}
                                          </label>
                                        </div>
                                        {renderRecurringDrivers(
                                          recurringService,
                                          subRecurringService,
                                          index,
                                        )}
                                      </td>
                                    </>
                                  )}
                                </tr>
                              );
                            },
                          )}
                        </tbody>
                      </>
                    );
                  })}
                </table>
              </div>
              <div class="col-lg-6 col-md-6 col-sm-12 border-right-separator mobile-margin-top ">
                <h6 className="text-center">One-Off/Ad hoc Services</h6>
                <div class="separator mb-2"></div>
                <table
                  class="table align-middle table-nowrap"
                  id="customerTable"
                >
                  {props.oneOffServiceList?.map((oneOffService) => {
                    return (
                      <>
                        <thead class="table-light table-header-font">
                          <tr class="head-row">
                            <td className="tr-table-class text-white">
                              {isMobile ? (
                                <>
                                  {oneOffService?.serviceCatName.length > 20
                                    ? oneOffService?.serviceCatName.substring(
                                        0,
                                        20,
                                      ) + "..."
                                    : oneOffService?.serviceCatName}
                                </>
                              ) : (
                                <>
                                  {oneOffService?.serviceCatName.length > 38 ? (
                                    <Tooltip
                                      title={oneOffService?.serviceCatName}
                                    >
                                      {oneOffService?.serviceCatName.substring(
                                        0,
                                        38,
                                      ) + "..."}
                                    </Tooltip>
                                  ) : (
                                    <>{oneOffService?.serviceCatName}</>
                                  )}
                                </>
                              )}
                            </td>
                          </tr>
                        </thead>
                        <tbody>
                          {oneOffService?.servicesList?.map(
                            (subOneOff, index) => {
                              return (
                                <tr>
                                  {subOneOff?.isHidden ? null : (
                                    <td>
                                      <div class="select-row align-center">
                                        <input
                                          type="checkbox"
                                          className="check check_tick"
                                          value={subOneOff?.isSelected}
                                          // id={`flexCheckDefault_${subOneOff.serviceID}`}
                                          onClick={() => {
                                            if (!subOneOff.isDisabled) {
                                              handleOneOffServiceCheckboxClick(
                                                oneOffService,
                                                subOneOff,
                                              );
                                            }
                                          }}
                                          checked={subOneOff.isSelected}
                                          style={{
                                            cursor: `${
                                              subOneOff.isDisabled == true
                                                ? notAllowed
                                                : ""
                                            }`,
                                          }}
                                        />
                                        <label
                                          style={{
                                            wordBreak: "break-word",
                                            marginBottom: "0",
                                          }}
                                          onClick={() => {
                                            if (!subOneOff.isDisabled) {
                                              handleOneOffServiceCheckboxClick(
                                                oneOffService,
                                                subOneOff,
                                              );
                                            }
                                          }}
                                        >
                                          {isMobile ? (
                                            <>
                                              {subOneOff.serviceName.length > 20
                                                ? subOneOff.serviceName.substring(
                                                    0,
                                                    20,
                                                  ) + "..."
                                                : subOneOff.serviceName}
                                            </>
                                          ) : (
                                            <>
                                              {subOneOff.serviceName.length >
                                              38 ? (
                                                <Tooltip
                                                  title={subOneOff.serviceName}
                                                >
                                                  {subOneOff.serviceName.substring(
                                                    0,
                                                    38,
                                                  ) + "..."}
                                                </Tooltip>
                                              ) : (
                                                <>{subOneOff.serviceName}</>
                                              )}
                                            </>
                                          )}
                                        </label>
                                      </div>
                                      {renderOneOffDrivers(
                                        oneOffService,
                                        subOneOff,
                                        index,
                                      )}
                                    </td>
                                  )}
                                </tr>
                              );
                            },
                          )}
                        </tbody>
                      </>
                    );
                  })}
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {props.requireMessage &&
        (props.recurringServiceList.some((i) =>
          i.servicesList.some((item) => item.isSelected),
        ) ||
        props.oneOffServiceList.some((i) =>
          i.servicesList.some((item) => item.isSelected),
        ) ? (
          ""
        ) : (
          <label
            className="validation mt-2"
            style={{ width: "100%", textAlign: "center" }}
          >
            Please select at least one service.
          </label>
        ))}
      <div class="separator"></div>
      <div
        class="row fieldset modal-footer"
        style={{ overflow: "auto", maxHeight: "150px" }}
      >
        <div class="col-lg-12 hstack gap-2 justify-content-end text-right mt-3 ">
          <div class="d-flex" style={{ overflowX: "auto" }}>
            {/* <button
              class="btn btn-md  btn-light mr-1"
              onClick={props.handleCancel}
            >
              <span>{getCrudButtonTextName("Cancel")}</span>
            </button> */}
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
                <span>{getCrudButtonTextName("Cancel")}</span>
              </button>
            )}
            {props?.ProposalObject?.selectedProposalTypeValue === 1 && (
              <button
                onClick={() => props.HandleBack(5)}
                style={{ marginRight: "5px" }}
                className="btn btn-md btn-success create-item-btn"
              >
                <span>Back</span>
              </button>
            )}
            {props?.ProposalObject?.selectedProposalTypeValue === 3 && (
              <button
                onClick={() => props.HandleBack(1)}
                style={{ marginRight: "5px" }}
                className="btn btn-md btn-success create-item-btn"
              >
                <span>Back</span>
              </button>
            )}
            {props?.ProposalObject?.selectedProposalTypeValue === 4 && (
              <button
                onClick={() => props.HandleBack(1)}
                style={{ marginRight: "5px" }}
                className="btn btn-md btn-success create-item-btn"
              >
                <span>Back</span>
              </button>
            )}
            {(props?.moduleName == "Contract" ||
              props.moduleName === "Package") && (
              <>
                <button
                  onClick={() => props.HandleBack(1)}
                  style={{ marginRight: "5px" }}
                  className="btn btn-md btn-success create-item-btn"
                >
                  <span>Back</span>
                </button>
                <button
                  class="btn btn-md btn-success create-item-btn"
                  onClick={async () => {
                    await props.HandleTabChange(3);
                  }}
                >
                  <span>Next</span>
                </button>
              </>
            )}
            {props?.ProposalObject &&
              props?.ProposalObject?.selectedProposalTypeValue === 1 && (
                <button
                  className="btn btn-md btn-success create-item-btn"
                  onClick={async () => {
                    await props.HandleTabChange(7);
                  }}
                >
                  <span>Next</span>
                </button>
              )}
            {props?.ProposalObject &&
              props?.ProposalObject?.selectedProposalTypeValue === 3 && (
                <button
                  className="btn btn-md btn-success create-item-btn"
                  onClick={async () => {
                    await props.HandleTabChange(6);
                  }}
                >
                  <span>Next</span>
                </button>
              )}
            {props?.ProposalObject &&
              props?.ProposalObject?.selectedProposalTypeValue === 4 && (
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
                    2,
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
                onClick={() => props.HandleTabChange(3, statusID.Draft)}
                style={{ marginLeft: "5px" }}
              >
                <span>Save as a Draft</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
