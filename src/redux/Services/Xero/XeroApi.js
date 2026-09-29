import { QuickBookUrl, XeroBaseUrl } from "../../../Base-Url/Base_Url";
import {
  getListWithAuthenticated,
  postApiWithAuthenticated,
} from "../../reducer/reduxService";

export const ConnectionAuthentication = async (id, activePlatform) => {
  let baseUrl;

  switch (activePlatform) {
    case "QuickBooks":
      baseUrl = QuickBookUrl;
      break;
    case "Xero":
      baseUrl = XeroBaseUrl;
      break;
    default:
      throw new Error("Invalid platform selected");
  }

  const res = await getListWithAuthenticated(`${baseUrl}connection-url/${id}`);
  return res;
};

export const OrganisationToQuickBookAuthentication = async (
  id,
  activePlatform,
) => {
  let baseUrl;
  switch (activePlatform) {
    case "QuickBooks":
      baseUrl = QuickBookUrl;
      break;
    case "Xero":
      baseUrl = XeroBaseUrl;
      break;
    default:
      throw new Error("Invalid platform selected");
  }
  const res = await getListWithAuthenticated(`${baseUrl}`);
  return res;
};

export const GetAllClientLookupList = async (
  organisationKeyID,
  activePlatform,
) => {
  debugger;
  let baseUrl;
  switch (activePlatform) {
    case "QuickBooks":
      baseUrl = QuickBookUrl;
      break;
    case "Xero":
      baseUrl = XeroBaseUrl;
      break;
    default:
      throw new Error("Invalid platform selected");
  }
  const res = await getListWithAuthenticated(
    `${baseUrl}mappings/${organisationKeyID}`,
  );
  return res;
};

export const GetAllCachedXeroContacts = async (
  organisationKeyID,
  activePlatform,
) => {
  debugger;
  let baseUrl;
  switch (activePlatform) {
    case "QuickBooks":
      baseUrl = QuickBookUrl;
      break;
    case "Xero":
      baseUrl = XeroBaseUrl;
      break;
    default:
      throw new Error("Invalid platform selected");
  }
  const res = await getListWithAuthenticated(
    `${baseUrl}contacts/${organisationKeyID}`,
  );
  return res;
};

export const ProspectConnectionAuthentication = async (
  organisationKeyId,
  clientKeyId,
  activePlatform,
) => {
  debugger;
  let baseUrl;
  switch (activePlatform) {
    case "QuickBooks":
      baseUrl = QuickBookUrl;
      break;
    case "Xero":
      baseUrl = XeroBaseUrl;
      break;
    default:
      throw new Error("Invalid platform selected");
  }
  const res = await getListWithAuthenticated(
    `${baseUrl}client/connection-url/${organisationKeyId}/${clientKeyId}`,
  );
  return res;
};

export const CreateXeroContactFromOutbooks = async (
  param,
  organisationKeyId,
  activePlatform,
) => {
  let baseUrl;
  switch (activePlatform) {
    case "QuickBooks":
      baseUrl = `${QuickBookUrl}customers/create-from-client/${organisationKeyId}`;
      break;
    case "Xero":
      baseUrl = `${XeroBaseUrl}contacts/create-from-client/${organisationKeyId}`;
      break;
    default:
      throw new Error("Invalid platform selected");
  }
  const res = await postApiWithAuthenticated(`${baseUrl}`, param);
  return res;
};

export const ClientConnectionStatus = async (
  param,
  organisationKeyId,
  clientKeyId,
  activePlatform,
) => {
  let baseUrl;
  switch (activePlatform) {
    case "QuickBooks":
      baseUrl = `${QuickBookUrl}client/connection-status/${organisationKeyId}/${clientKeyId}`;
      break;
    case "Xero":
      baseUrl = `${XeroBaseUrl}client/connection-status/${organisationKeyId}/${clientKeyId}`;
      break;
    default:
      throw new Error("Invalid platform selected");
  }
  const res = await getListWithAuthenticated(baseUrl);
  return res;
};

export const DisconnectClient = async (
  param,
  organisationKeyId,
  clientKeyId,
  activePlatform,
) => {
  debugger;
  let baseUrl;
  switch (activePlatform) {
    case "QuickBooks":
      baseUrl = `${QuickBookUrl}client/disconnect/${organisationKeyId}/${clientKeyId}`;
      break;
    case "Xero":
      baseUrl = `${XeroBaseUrl}client/disconnect/${organisationKeyId}/${clientKeyId}`;
      break;
    default:
      throw new Error("Invalid platform selected");
  }
  const res = await postApiWithAuthenticated(baseUrl);
  return res;
};

export const GetDisconnectImpact = async (organisationKeyId, activePlatform) => {
  const baseUrl =
    activePlatform === "QuickBooks"
      ? `${QuickBookUrl}disconnect-impact/${organisationKeyId}`
      : `${XeroBaseUrl}disconnect-impact/${organisationKeyId}`;
  const res = await getListWithAuthenticated(baseUrl);
  return res;
};