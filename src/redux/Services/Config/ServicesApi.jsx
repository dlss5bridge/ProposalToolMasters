import { Base_Url } from "../../../Base-Url/Base_Url";
import {
  getListWithAuthenticated,
  postApiWithAuthenticated,
} from "../../reducer/reduxService";

//Services Url

const ServiceCategory = `${Base_Url}/configure/ServiceCategory`;
const services = `${Base_Url}/configure/Services`;

//Service category function
export const ServiceCategoryList = async (KeyID, ProfessionTypeIDs) => {
  if (ProfessionTypeIDs?.length === 0) return;
  let res;
  if (KeyID !== null) {
    res = await getListWithAuthenticated(
      `${ServiceCategory}/ServiceCategoryLookupList?OrganisationKeyID=${KeyID}&ProfessionTypeIDs=${ProfessionTypeIDs}`,
    );
  } else {
    res = await getListWithAuthenticated(
      `${ServiceCategory}/ServiceCategoryLookupList?ProfessionTypeIDs=${ProfessionTypeIDs}`,
    );
  }

  return res;
};

export const GetServiceDependencyList = async (params) => {
  const res = await postApiWithAuthenticated(
    `${services}/GetServiceDependencyList`,
    params,
  );
  return res;
};
export const GetServiceFeeInflationList = async (params) => {
  const res = await postApiWithAuthenticated(
    `${services}/GetServiceFeeInflationList`,
    params,
  );
  return res;
};

// Add or update service fee inflation rules
export const AddUpdateServiceFeeInflation = async (params) => {
  const res = await postApiWithAuthenticated(
    `${services}/AddUpdateServiceFeeInflation`,
    params,
  );
  return res;
};

export const GetDraftsAffectedByFeeInflationBatch = async (params) => {
  const query = new URLSearchParams({
    userKeyID: params.userKeyID ?? "",
    batchID: params.batchID,
    ...(params.organisationKeyID
      ? { organisationKeyID: params.organisationKeyID }
      : {}),
  }).toString();
  const res = await getListWithAuthenticated(
    `${services}/GetDraftsAffectedByFeeInflationBatch?${query}`,
  );
  return res;
};

export const DeleteServiceFeeInflation = async (ServiceID, InflationIndex) => {
  const res = await postApiWithAuthenticated(
    `${services}/DeleteServiceFeeInflation?ServiceID=${ServiceID}&InflationIndex=${InflationIndex}`,
  );
  return res;
};

export const DeleteAllServiceFeeInflationConfiguration = async (
  OrganisationKeyID,
  UserKeyID,
  BatchID,
) => {
  const res = await postApiWithAuthenticated(
    `${services}/DeleteAllServiceFeeInflationConfiguration?OrganisationKeyID=${OrganisationKeyID}&UserKeyID=${UserKeyID}&BatchID=${BatchID}`,
  );
  return res;
};
export const AcceptServiceFeeInflationSAChanges = async (params) => {
  // params: { organisationKeyID, userKeyID, batchID }
  const res = await postApiWithAuthenticated(
    `${services}/AcceptServiceFeeInflationSAChanges`,
    params,
  );
  return res;
};

export const DeclineServiceFeeInflation = async (params) => {
  // params: { organisationKeyID, userKeyID, batchID }
  const res = await postApiWithAuthenticated(
    `${services}/DeclineServiceFeeInflation`,
    params,
  );
  return res;
};

export const GetServiceFeeInflationActiveForService = async (serviceKeyID) => {
  const res = await getListWithAuthenticated(
    `${services}/GetServiceFeeInflationActiveForService?ServiceKeyID=${encodeURIComponent(serviceKeyID)}`,
  );
  return res;
};

export const GetServicesList = async (params) => {
  const res = await postApiWithAuthenticated(
    `${services}/GetServicesWithServiceCategoryList`,
    params,
  );
  return res;
};

//Delete Service Callback function
export const DeleteService = async (ServiceKeyID, userKeyID) => {
  const res = await getListWithAuthenticated(
    `${services}/ServicesDelete?ServiceKeyID=${ServiceKeyID}&userKeyID=${userKeyID}`,
  );
  return res;
};

//Delete Service Callback function
export const ServicesChangeStatus = async (ServiceKeyID, userKeyID) => {
  const res = await getListWithAuthenticated(
    `${services}/ServicesChangeStatus?ServiceKeyID=${ServiceKeyID}&userKeyID=${userKeyID}`,
  );
  return res;
};

export const AddUpdateService = async (url, params) => {
  const res = await postApiWithAuthenticated(`${services}${url}`, params);
  return res;
};

export const GetServiceModel = async (id, GetSAChanges) => {
  // const res = await getListWithAuthenticated(
  //     `${services}/GetServiceModel?ServiceKeyID=${id}`
  // );
  // return res;
  let url = `${services}/GetServiceModel?ServiceKeyID=${id}`;
  if (GetSAChanges) {
    url = `${services}/GetServiceModel?ServiceKeyID=${id}&GetSAChanges=${GetSAChanges}`;
  }
  const res = await getListWithAuthenticated(url);
  return res;
};

export const GetCalculatedServicesPrice = async (params) => {
  const res = await postApiWithAuthenticated(
    `${services}/GetCalculatedServicesPrice`,
    params,
  );
  return res;
};
export const GetCalculatedServicesPriceByPackages = async (params) => {
  const res = await postApiWithAuthenticated(
    `${services}/GetCalculatedServicesPriceByPackages`,
    params,
  );
  return res;
};

export const CopyService = async (serviceKeyID, UserKeyID) => {
  const res = await getListWithAuthenticated(
    // `${TemplateBaseUrl}/GetMasterTemplateDetailsWithVariableValues?TemplateKeyID=${params.TemplateKeyID}&ClientKeyID=${params.clientID}`
    `${services}/CopyServices?serviceKeyID=${serviceKeyID}&UserKeyID=${UserKeyID}`,
  );
  return res;
};

export const GetServiceUpdatedAfterSendingQuoteOrContract = async (
  moduleID,
  moduleName,
) => {
  const res = await getListWithAuthenticated(
    `${services}/GetServiceUpdatedAfterSendingQuoteOrContract?moduleID=${moduleID}&moduleName=${moduleName}`,
  );
  return res;
};
