import React, { useContext, useEffect, useState } from "react";
import "./ServiceStyle.css";
import "./AddDeleteGlobalPricingDriver-redesign.css";
import {
  GetGlobalPricingDriverListForServices,
  GetGlobalPricingDriverModel,
} from "../../../redux/Services/Config/GlobalPricingDriverApi";
import { useSelector } from "react-redux";
import { RotatingLines } from "react-loader-spinner";
import Tooltip from "@mui/material/Tooltip";
import { AuthContextProvider } from "../../../AuthContext/AuthContext";

function AddDeleteGlobalPricingDriverModal(props) {
  const { isMobile, scrollUpDownByElementID } = useContext(AuthContextProvider);
  // A] States Declaration :
  const [loader, setLoader] = useState(false);
  const [id, setId] = useState("");
  const [globalPricingDriverList, setGlobalPricingDriverList] = useState([]);
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks

  // B] Initial useEffect :
  // 1) Will Call Initial Api Like List Api
  useEffect(() => {
    GetGlobalPricingDriverListData();
  }, []);

  // C] Calling All Api's like List and other Here :
  // 1) Get Global Pricing Driver List Data
  const GetGlobalPricingDriverListData = async (i) => {
    try {
      const response = await GetGlobalPricingDriverListForServices({
        userKeyID: common.userKeyID,
        organisationKeyID: common.organisationKeyID,
      });

      if (response) {
        if (response?.data?.statusCode === 200) {
          if (response?.data?.responseData?.data) {
            const totalCount = response.data.totalCount;
            const ServiceCategoryListData = response.data.responseData.data;
            setGlobalPricingDriverList(ServiceCategoryListData);
          }
        } 
      }
    } catch (error) {
      console.log(error);
    }
  };

  // D] handle Function
  const HandleDeleteClick = (index) => {
    const updatedGlobalPricingDrivers = [...props.pricingDriver];
    const itemIndex = updatedGlobalPricingDrivers.findIndex(
      (item) =>
        item.parentGlobalPricingDriverKeyID === index.globalPricingDriverKeyID
    );
    if (itemIndex !== -1) {
      updatedGlobalPricingDrivers.splice(itemIndex, 1);
      props.setPricingDriver(updatedGlobalPricingDrivers);
    }
  };
// Handle Add
  const HandleAdd = async (i) => {
    setId(i.globalPricingDriverKeyID);
    setLoader(true);
    const response = await GetGlobalPricingDriverModel(
      i.globalPricingDriverKeyID
    );
    if (response) {
      setLoader(false);
      const GetGlobalPricingDriverData = response?.data?.responseData?.data;
      const SetGlobalPricingDriverData = {
        userKeyID: common.userKeyID,
        globalPricingDriverID: null,
        globalPricingDriverKeyID: null,
        parentGlobalPricingDriverKeyID:
          GetGlobalPricingDriverData?.globalPricingDriverKeyID,
        driverName: GetGlobalPricingDriverData?.driverName,
        driverTypeID: GetGlobalPricingDriverData?.driverTypeID,
        isPredefined: null,
        temp_GlobalPricingDriverID_ForDependancy:
          props.pricingDriver.length === 0 ? 1 : props.pricingDriver.length + 1,
        dependsOn_DriverId: null,
        dependsOn_GlobalPricingDriverKeyID: null,
        dependant_OnDriverId: [],
        dependsOn_VariationID: null,
        dependsOn_VariationKeyID: null,
        dependant_GlobalPricingDriverKeyID: null,
        addedFor: "Services",
        variation: GetGlobalPricingDriverData?.variation
          ? GetGlobalPricingDriverData?.variation?.map((i, index) => ({
              isDefault: i.isDefault,
              parentVariationKeyID: i.variationKeyID,
              variationID: null,
              variationKeyID: null,
              temp_VariationID_ForDependancy: index + 1,
              variationName: i.variationName,
              variationValue: i.variationValue,
            }))
          : null,
        slab: GetGlobalPricingDriverData?.slab
          ? GetGlobalPricingDriverData.slab.map((item, index) => ({
              slabKeyID: null,
              parentSlabKeyID: item.slabKeyID,
              slabTypeID: item.slabTypeID,
              slabTypeName: item.slabTypeName,
              slabValue: item.slabValue,
              slabFrom: item.slabFrom,
              slabTo: item.slabTo,
              isDefault: item.isDefault,
            }))
          : null,
        text: GetGlobalPricingDriverData?.text
          ? GetGlobalPricingDriverData.text.map((item, index) => ({
              textKeyID: null,
              parentTextKeyID: item.textKeyID,
              textLength: item.textLength,
              textValue: item.textValue,
              allowedSpecialCharacters: item.allowedSpecialCharacters,
            }))
          : null,
        date: GetGlobalPricingDriverData?.date
          ? GetGlobalPricingDriverData.date.map((item) => ({
              dateKeyID: null,
              dateFormat: item.dateFormat,
              defaultDateValue: item.defaultDateValue,
              blocks: item.blocks
                ? item.blocks.map((block) => ({
                    dateKeyID: null,
                    parentDateKeyID: block.dateKeyID,
                    fromDate: block.fromDate,
                    toDate: block.toDate,
                    dateValue: block.dateValue,
                    isDefault: block.isDefault ?? null,
                  }))
                : [],
            }))
          : null
      };
      const updatedArray = [...props.pricingDriver, SetGlobalPricingDriverData];
      props.setPricingDriver(updatedArray);
      props.setAddGBP(true);
      setTimeout(function () {
        scrollUpDownByElementID(`Driver_${props.pricingDriver.length}`);
      }, 200);
    }
  };

  //Design part :
  return (
    <div>
      <div
        class={props.class}
        id={props.id}
        tabIndex={props.tabIndex}
        aria-labelledby={props.aria_labelledby}
        aria-hidden={props.aria_hidden}
      >
        <div class="modal-dialog modal-dialog-centered gpd-pick-dialog">
          <div class="modal-content gpd-pick">
            <div class="gpd-pick__header">
              <span class="gpd-pick__icon">
                <i class="ri-global-line"></i>
              </span>
              <div class="gpd-pick__heading">
                <h5 class="gpd-pick__title" id="addDeleteGlobalPricingDriver">
                  {props.title}
                </h5>
                <p class="gpd-pick__subtitle">
                  Add a shared driver to this service, or remove one already
                  added.
                </p>
              </div>
              <button
                type="button"
                class="gpd-pick__close"
                data-bs-dismiss="modal"
                aria-label="Close"
                id="close-modal"
              >
                <i class="ri-close-line"></i>
              </button>
            </div>

            <div class="gpd-pick__body">
              <div class="gpd-pick__list-head">
                <span>Driver Name</span>
                <span>Type</span>
                <span class="gpd-pick__list-head-action">Action</span>
              </div>

              <div class="gpd-pick__list" id="customerTable">
                {globalPricingDriverList.map((i, index) => {
                  const isAdded = props.pricingDriver?.some(
                    (item) =>
                      item.parentGlobalPricingDriverKeyID ===
                      i.globalPricingDriverKeyID
                  );
                  return (
                    <div
                      class={`gpd-pick__row${isAdded ? " is-added" : ""}`}
                      key={index}
                    >
                      <div class="gpd-pick__name">
                        {isMobile ? (
                          <>
                            {i.driverName.length > 20
                              ? i.driverName.substring(0, 20) + "..."
                              : i.driverName}
                          </>
                        ) : (
                          <>
                            {i.driverName.length > 30 ? (
                              <Tooltip title={i.driverName}>
                                <span>
                                  {i.driverName.substring(0, 30) + "..."}
                                </span>
                              </Tooltip>
                            ) : (
                              <>{i.driverName}</>
                            )}
                          </>
                        )}
                      </div>

                      <div>
                        <span class="gpd-pick__type">{i.driverType}</span>
                      </div>

                      <div class="gpd-pick__action">
                        {isAdded ? (
                          <button
                            type="button"
                            onClick={() => HandleDeleteClick(i)}
                            class="gpd-pick__btn gpd-pick__btn--remove"
                          >
                            <i class="ri-delete-bin-6-line"></i>
                            <span>Remove</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            class="gpd-pick__btn gpd-pick__btn--add"
                            onClick={() => HandleAdd(i)}
                          >
                            {id === i.globalPricingDriverKeyID && loader ? (
                              <RotatingLines
                                strokeColor="#0b7f95"
                                strokeWidth="3"
                                animationDuration="0.75"
                                width="14"
                                visible={true}
                              />
                            ) : (
                              <i class="ri-add-line"></i>
                            )}
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {globalPricingDriverList.length === 0 && (
                  <div class="gpd-pick__empty">
                    <i class="ri-global-line"></i>
                    <span>No global pricing drivers found</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddDeleteGlobalPricingDriverModal;
