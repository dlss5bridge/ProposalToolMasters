import { DeviationBaseUrlv2 } from "../../../Base-Url/Base_Url";
import { getListWithAuthenticated, postApiWithAuthenticated, putApiWithAuthenticated } from "../../reducer/reduxService";

export const GetDeviationList = async (organisationKeyId) => {
  const res = await postApiWithAuthenticated(
    `${DeviationBaseUrlv2}run/${organisationKeyId}`
  );
  return res;
};

export const GetDeviationsByReviewLogID = async (organisationKeyId, reviewLogID) => {
  const reviewLogIDParam = Number(reviewLogID);
  const res = await getListWithAuthenticated(
    `${DeviationBaseUrlv2}runs/${organisationKeyId}/${reviewLogIDParam}/deviations`
  );
  return res;
};
export const GetServiceReviewSettings = async (organisationKeyId) => {
  const res = await getListWithAuthenticated(
    `${DeviationBaseUrlv2}settings/${organisationKeyId}`
  );
  return res;
};
export const AddUpdateServiceReviewSettings = async (params) => {
  const { organisationID, ...body } = params;
  const res = await putApiWithAuthenticated(
    `${DeviationBaseUrlv2}settings/${organisationID}`,
    body
  );
  return res;
};
export const GetServiceReviewRuns = async (organisationKeyId, limit = 20) => {
  const res = await getListWithAuthenticated(
    `${DeviationBaseUrlv2}runs/${organisationKeyId}?limit=${limit}`
  );
  return res;
};