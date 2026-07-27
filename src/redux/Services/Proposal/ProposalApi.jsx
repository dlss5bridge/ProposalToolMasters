import { Base_Url, XeroBaseUrl } from "../../../Base-Url/Base_Url";
import { SelectServiceData } from "../../../Database/ProposalToolDatabase";
import {
  getList,
  getListWithAuthenticated,
  postApi,
  postApiWithAuthenticated,
} from "../../reducer/reduxService";

//Service Category Base Url
const ProposalBaseUrl = `${Base_Url}/configure/Proposal`;
const ProposalBaseUrlQuote = `${Base_Url}/Quote`;
const GetContractDetails = `${Base_Url}/Contract`;

// Arrow function as a method
//Get Service Category List Data Services Callback function
// export const GetProposalList = async (params) => {
//     let url = params.StatusID !== undefined && params.StatusID !== null ?
//         `/GetQuoteList?StatusID=${params.StatusID}` :
//         `/GetQuoteList`
//     const res = await postApiWithAuthenticated(
//         ProposalBaseUrlQuote + url,
//         params
//     );
//     return res;
// };
export const GetProposalList = async (params) => {
  let url =
    params.StatusID !== undefined && params.StatusID !== null
      ? `/GetQuoteList?StatusID=${params.StatusID}&QuotesFor=${params.quoteFor}`
      : `/GetQuoteList?QuotesFor=${params.quoteFor}`;
  const res = await postApiWithAuthenticated(
    ProposalBaseUrlQuote + url,
    params,
  );
  return res;
};
export const GetOldProposalList = async (params) => {
  let url =
    params.StatusID !== undefined && params.StatusID !== null
      ? `/GetOldQuoteList?StatusID=${params.StatusID}`
      : `/GetOldQuoteList`;
  const res = await postApiWithAuthenticated(
    ProposalBaseUrlQuote + url,
    params,
  );
  return res;
};

//Get Service Category Model Data Services Callback function
export const GetProposalModel = async (id) => {
  const res = await getListWithAuthenticated(
    `${ProposalBaseUrlQuote}/GetQuoteModel?QuoteKeyID=${id}`,
  );
  return res;
};

export const GetProposalModelWithoutToken = async (id) => {
  const res = await getList(
    `${ProposalBaseUrlQuote}/GetQuoteModel?QuoteKeyID=${id}`,
  );
  return res;
};
//AddUpdate Service Category Callback function
export const AddUpdateProposal = async (url, params) => {
  const res = await postApiWithAuthenticated(
    `${ProposalBaseUrl}${url}`,
    params,
  );
  return res;
};

//Delete Service Category Callback function
export const DeleteProposal = async (id) => {
  const res = await getListWithAuthenticated(
    `${ProposalBaseUrl}/ProposalDelete?keyID=${id}`,
  );
  return res;
};

//Delete Service Category Callback function
export const ProposalChangeStatus = async (id) => {
  const res = await getListWithAuthenticated(
    `${ProposalBaseUrl}/ProposalChangeStatus?keyID=${id}`,
  );
  return res;
};

export const AddUpdateQuote = async (url, params) => {
  const res = await postApiWithAuthenticated(
    `${ProposalBaseUrlQuote}${url}`,
    params,
  );
  return res;
};

// AcceptAndDeclinemodeApi

export const GetSelectedServicePackageAccept = async (
  quoteKeyID,
  servicePackageKeyID,
  Action,
  ServiceChargeTypeID,
  ContractSignatoryKeyID,
) => {
  let url;

  if (servicePackageKeyID !== null) {
    if (ContractSignatoryKeyID === undefined) {
      url = `/GetAcceptedQuotationServiceDetails?QuoteKeyID=${quoteKeyID}&Action=${Action}&ServiceChargeTypeID=${ServiceChargeTypeID}&ServicePackageKeyID=${servicePackageKeyID}`;
    } else {
      url = `/GetAcceptedQuotationServiceDetails?QuoteKeyID=${quoteKeyID}&Action=${Action}&ServiceChargeTypeID=${ServiceChargeTypeID}&ServicePackageKeyID=${servicePackageKeyID}&ContractSignatoryKeyID=${ContractSignatoryKeyID}`;
    }
  } else {
    // Handle the case when servicePackageKeyID is null
    url = `/GetAcceptedQuotationServiceDetails?QuoteKeyID=${quoteKeyID}&Action=${Action}&ServiceChargeTypeID=${ServiceChargeTypeID}`;
  }

  const res =
    // SelectServiceData
    await getListWithAuthenticated(ProposalBaseUrlQuote + url);
  return res;
};

export const GetQuoteContractViewPDFurl = async (
  UserKeyID,
  OrganisationKeyID,
  ModuleName,
  ModuleKeyID,
) => {
  const res =
    // SelectServiceData
    await getListWithAuthenticated(
      `${ProposalBaseUrlQuote}/GetQuoteCotractViewPDFurl?UserKeyID=${UserKeyID}&OrganisationKeyID=${OrganisationKeyID}&ModuleName=${ModuleName}&ModuleKeyID=${ModuleKeyID}`,
    );
  return res;
};
export const GetAcceptedQuotationServiceDetails = async (params) => {
  let url = `/AcceptDeclineProposal`;
  const res = await postApiWithAuthenticated(
    ProposalBaseUrlQuote + url,
    params,
  );
  return res;
};

export const GetQuoteLookupList = async (organisationKeyId) => {
  const res = await getListWithAuthenticated(
    ProposalBaseUrlQuote +
      `/GetQuoteLookupList?OrganisationKeyID=${organisationKeyId}`,
  );
  return res;
};

//Get Template Model Data Services Callback function
export const GetProposalModelList = async (id) => {
  const res = await getListWithAuthenticated(
    // `${TemplateBaseUrl}/GetMasterTemplateDetailsWithVariableValues?TemplateKeyID=${params.TemplateKeyID}&ClientKeyID=${params.clientID}`
    `${ProposalBaseUrlQuote}/GetQuoteDetailsModel?QuoteKeyID=${id}`,
  );
  return res;
};

export const GenerateContractFromProposal = async (params) => {
  let url = "/GenerateContractFromProposal";
  const res = await postApi(`${ProposalBaseUrlQuote}${url}`, params);
  return res;
};

export const GetContractDetailsForSignEasyList = async (GetContractKeyID) => {
  const res = await getList(
    // `${TemplateBaseUrl}/GetMasterTemplateDetailsWithVariableValues?TemplateKeyID=${params.TemplateKeyID}&ClientKeyID=${params.clientID}`
    `${GetContractDetails}/GetContractDetailsForSignEasy?ContractKeyID=${GetContractKeyID}`,
  );
  return res;
};
export const CopyQuotation = async (GetQuoteKeyID, UserKeyID) => {
  const res = await postApiWithAuthenticated(
    // `${TemplateBaseUrl}/GetMasterTemplateDetailsWithVariableValues?TemplateKeyID=${params.TemplateKeyID}&ClientKeyID=${params.clientID}`
    `${ProposalBaseUrlQuote}/CopyQuotation?QuoteKeyID=${GetQuoteKeyID}&UserKeyID=${UserKeyID}`,
  );
  return res;
};

export const ChangeQuoteStatus = async (QuoteKeyID, UserKeyID) => {
  const res = await getListWithAuthenticated(
    `${ProposalBaseUrlQuote}/ChangeQuoteStatus?QuoteKeyID=${QuoteKeyID}&Action=ChangeReminderStatus&UserKeyID=${UserKeyID}`,
  );
  return res;
};

export const ResendProposal = async (QuoteKeyID, UserKeyID) => {
  const res = await getListWithAuthenticated(
    `${ProposalBaseUrlQuote}/ResendQuote?UserKeyID=${UserKeyID}&QuoteKeyID=${QuoteKeyID}`,
  );
  return res;
};

export const DeleteQuotation = async (QuoteKeyID, UserKeyID) => {
  const res = await postApiWithAuthenticated(
    // `${TemplateBaseUrl}/GetMasterTemplateDetailsWithVariableValues?TemplateKeyID=${params.TemplateKeyID}&ClientKeyID=${params.clientID}`
    `${ProposalBaseUrlQuote}/DeleteQuotation?QuoteKeyID=${QuoteKeyID}&UserKeyID=${UserKeyID}`,
  );
  return res;
};
export const DeleteSingleApiQuote = async (params) => {
  const res = await postApiWithAuthenticated(
    // `${TemplateBaseUrl}/GetMasterTemplateDetailsWithVariableValues?TemplateKeyID=${params.TemplateKeyID}&ClientKeyID=${params.clientID}`
    `${ProposalBaseUrlQuote}/DeleteSingleApiQuote`,
    params,
  );
  return res;
};

export const ArchiveQuotation = async (QuoteKeyID, UserKeyID) => {
  const res = await postApiWithAuthenticated(
    `${ProposalBaseUrlQuote}/ArchiveQuotation?QuoteKeyID=${QuoteKeyID}&UserKeyID=${UserKeyID}`,
  );
  return res;
};
