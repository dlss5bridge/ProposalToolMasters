/* global $ */
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  GetUpdateThemeSettings,
  GetUserPersonalizeSetting,
} from "../redux/Services/Personalize/PersonalizeSetting";
import { useSelector } from "react-redux";
import { AuthContextProvider } from "./AuthContext";
import SuccessModal from "../components/SuccessModal";
import { USER_ROLE_TYPE } from "../Middleware/enums";

const initialState = {
  loading: false,
};

const MASTER_THEME_STORAGE_KEY = "masterThemeSettingLocalStorage";

// The API returns colours as hex or "rgb(r, g, b)"; <input type="color"> only
// accepts #rrggbb, so normalise before the values reach the customizer.
const toHexColor = (value) => {
  const match = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(value || "");
  if (!match) return value;
  return (
    "#" +
    match
      .slice(1, 4)
      .map((channel) => Number(channel).toString(16).padStart(2, "0"))
      .join("")
  );
};

const readStoredSettings = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
};

export const ColorContext = createContext(initialState);

export const ColorProvider = ({ children }) => {
  /* -------------------------------------------------------------------------- */
  /*                                State Declare                               */
  /* -------------------------------------------------------------------------- */
  
  let getUserPersonalizeSettingApiCallCount = 0;
  const [currentCardColor, setCurrentCardColor] = useState("#626ed4");
  const [currentTopbarColor, setCurrentTopbarColor] = useState("#333547");
  const [currentTopbarTextColor, setCurrentTopbarTextColor] =
    useState("#8d8d8d");
  const [CloseModal, setCloseModal] = useState(false);
  const [isAddUpdateDone, setIsAddUpdateDone] = useState(false);
  const [dismissModal, setDismissModal] = useState(null);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
  const [modelAction, setModelAction] = useState("Update");
  const [MessageType, setMessageType] = useState();
  const [CardColor, setCardColor] = useState("");
  const [TopbarColor, setTopbarColor] = useState("");
  const [TopbarTextColor, setTopbarTextColor] = useState("");
  const {
    setLoader,
    prospectName,
    proposalName,
    EngagementName,
    maxCountToRecallApi,
    updatedProposalName,
    updatedProspectName,
    setDefaultVariables,
    updatedEngagementName,
  } = useContext(AuthContextProvider);
  const common = useSelector((state) => state.Storage); //Getting Logged Users Details From Persist Storage of redux hooks

  // A Super Admin with no organisation selected saves Appearance without an
  // OrganisationKeyID, and the API returns that under masterThemeSetting.
  const isPlatformLevelSuperAdmin =
    common.roleTypeId == USER_ROLE_TYPE.SuperAdmin &&
    common.organisationKeyID == null;

  const applyThemeSettings = (userSettings, masterSettings) => {
    const settings =
      isPlatformLevelSuperAdmin && masterSettings?.length
        ? masterSettings
        : userSettings;
    if (!settings) return;

    const valueOf = (settingName) =>
      toHexColor(
        settings.find((item) => item.settingName === settingName)
          ?.settingValue
      );
    const headerBgColor = valueOf("AppearanceHeaderBgColor");
    const menuTextColor = valueOf("AppearanceNavbarMenuListColor");
    const cardBgColor = valueOf("AppearanceDashboardCardBgColor");

    setCurrentCardColor(cardBgColor);
    setCurrentTopbarTextColor(menuTextColor);
    setCurrentTopbarColor(headerBgColor);

    setCardColor(cardBgColor);
    setTopbarTextColor(menuTextColor);
    setTopbarColor(headerBgColor);
  };

  useEffect(() => {
    if (common.token) {
      const userSettings = readStoredSettings("userThemeSettingLocalStorage");
      const masterSettings = readStoredSettings(MASTER_THEME_STORAGE_KEY);
      // Caches written before the master set was stored lack it; refetch.
      if (userSettings === null || masterSettings === null) {
        GetUserPersonalizeSettingData(common.userKeyID);
      } else {
        applyThemeSettings(userSettings, masterSettings);
      }
    }
    // Re-evaluated when switching between platform level and an organisation.
  }, [common.organisationKeyID]);

  const GetUserPersonalizeSettingData = async (id) => {
    if (!id) {
      return;
    }
    try {
      const response = await GetUserPersonalizeSetting(id);
      if (response) {
        if (response?.data?.statusCode === 200) {
          getUserPersonalizeSettingApiCallCount = 0;
          const { userThemeSetting, masterThemeSetting } =
            response?.data?.responseData.userPersonalSetting;

          localStorage.setItem(
            "userThemeSettingLocalStorage",
            JSON.stringify(userThemeSetting)
          );
          localStorage.setItem(
            MASTER_THEME_STORAGE_KEY,
            JSON.stringify(masterThemeSetting || [])
          );

          applyThemeSettings(userThemeSetting, masterThemeSetting);
        } else {
          RecallGetUserPersonalizeSettingData(id);
        }
      } else {
        RecallGetUserPersonalizeSettingData(id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // if api call failed somehow , this function call 5 times 
  const RecallGetUserPersonalizeSettingData = (id) => {
    if (getUserPersonalizeSettingApiCallCount < maxCountToRecallApi) {
      getUserPersonalizeSettingApiCallCount += 1;
      setTimeout(function () {
        GetUserPersonalizeSettingData(id);
      }, 1000);
    } else {
    }
  };

  const UpdateThemeSettingsData = async (UpdateType) => {
    setLoader(true);

    // Your API request parameters
    let userThemeSetting = [];

    if (UpdateType === "Theme") {
      userThemeSetting = [
        {
          settingName: "AppearanceHeaderBgColor",
          settingValue: currentTopbarColor,
        },
        {
          settingName: "AppearanceNavbarMenuListColor",
          settingValue: currentTopbarTextColor,
        },
        {
          settingName: "AppearanceDashboardCardBgColor",
          settingValue: currentCardColor,
        },
      ];
    } else {
      userThemeSetting = [
        {
          settingName: "VariableProspectName",
          settingValue:
            updatedProspectName === "" ? prospectName : updatedProspectName,
        },
        {
          settingName: "VariableProposalName",
          settingValue:
            updatedProposalName === "" ? proposalName : updatedProposalName,
        },
        {
          settingName: "VariableEngagementName",
          settingValue:
            updatedEngagementName === ""
              ? EngagementName
              : updatedEngagementName,
        },
      ];
    }
    const ApiRequest_ParamsObj = { userThemeSetting };
    const SettingType =
      UpdateType === "Theme" ? "Appearance" : "PersonalizeSetting";

    try {
      const response = await GetUpdateThemeSettings(
        common.userKeyID,
        common.organisationKeyID,
        SettingType,
        ApiRequest_ParamsObj
      );
      if (response?.data?.statusCode === 200) {
        localStorage.removeItem("userThemeSettingLocalStorage");
        if (UpdateType !== "Theme") {
          localStorage.removeItem("OrganisationLocalList");
        }
        GetUserPersonalizeSettingData(common.userKeyID);
        setMessageType(UpdateType);
        setIsAddUpdateDone(true);
        setLoader(false);
        setOpenSuccessModal(true);
        setDefaultVariables(false);
        setCloseModal(true);
      }
    } catch (error) {
      setLoader(false);
    }
  };

  const UserDefaultTheme = () => {
    setCurrentCardColor(CardColor);
    setCurrentTopbarTextColor(TopbarTextColor);
    setCurrentTopbarColor(TopbarColor);
  };

  //topbar Function
  const OnChangeTopbarColor = (event) => {
    const newColor = event.target.value;
    setCurrentTopbarColor(newColor);
  };

  ///text / font color
  const OnChangeTopbarTextColor = (event) => {
    const newColor = event.target.value;
    setCurrentTopbarTextColor(newColor);
  };

  const cardStyle = {
    backgroundColor: currentCardColor,
  };

  const TopbarStyle = {
    backgroundColor: currentTopbarColor,
  };

  const TopTextColor = {
    color: currentTopbarTextColor,
  };

  const handleSetDefault = () => {
    setCurrentCardColor("#626ed4");
    setCurrentTopbarColor("#333547");
    setCurrentTopbarTextColor("#8d8d8d");
  };

  const handleOnChangeCard = (event) => {
    const newColor = event.target.value;
    setCurrentCardColor(newColor);
  };
  const handleClose = () => {
    $("#" + "SetPersonalizeSettingModal").modal("hide");
    setOpenSuccessModal(false);
  };

  /* -------------------- Provide All Function at Globally -------------------- */
  return (
    <ColorContext.Provider
      value={{
        cardStyle,
        CloseModal,
        TopbarStyle,
        TopTextColor,
        setCloseModal,
        isAddUpdateDone,
        currentCardColor,
        UserDefaultTheme,        
        handleSetDefault,
        currentTopbarColor,
        setIsAddUpdateDone,
        handleOnChangeCard,
        OnChangeTopbarColor,
        setCurrentCardColor,
        setCurrentTopbarColor,
        currentTopbarTextColor,
        OnChangeTopbarTextColor,
        UpdateThemeSettingsData,
        setCurrentTopbarTextColor,
        }}
    >
      <SuccessModal
        handleClose={handleClose}
        setDismissModal={setDismissModal}
        setOpenSuccessModal={setOpenSuccessModal}
        openSuccessModal={openSuccessModal}
        modelAction={modelAction}
        message={MessageType}
      />
      {children}
    </ColorContext.Provider>
  );
};
