import { Base_Url } from "../../../Base-Url/Base_Url";
import {
  getListWithAuthenticated,
  postApiWithAuthenticated,
} from "../../reducer/reduxService";

/*
 * Global "which Select Services design is currently live" setting for the
 * Add/Update Proposal and Add/Update Engagement Letter screens.
 *
 * Unlike GlobalVariablesApi.jsx (org-scoped) or PersonalizeSetting.jsx
 * (user + optional org scoped), this setting has NO organisationKeyID /
 * userKeyID on the read side: it is one value for every organisation,
 * changed only from the Super Admin > Settings > Proposal Theme screen.
 *
 * GetProposalServiceTheme is confirmed live: it returns
 * { statusCode: 200, errorMessage: null, totalCount: 0, responseData: { data: 1 | 2 | 3 | 4 } }
 * - the theme id sits at responseData.data, not responseData.serviceThemeID.
 * UpdateProposalServiceTheme's shape hasn't been confirmed against a real
 * response yet; verify it the same way if "Save" doesn't persist.
 */

const proposalDesignThemeUrl = `${Base_Url}/ServiceTheme`;

// Confirmed response shape: { data: { statusCode: 200, responseData: { data: 1 | 2 | 3 | 4 } } }
export const GetProposalDesignTheme = async () => {
  const res = await getListWithAuthenticated(
    `${proposalDesignThemeUrl}/GetProposalServiceTheme`,
  );
  return res;
};

// param shape: { serviceThemeID: 1 | 2 | 3 | 4 }
export const UpdateProposalDesignTheme = async (param) => {
  const res = await postApiWithAuthenticated(
    `${proposalDesignThemeUrl}/UpdateProposalServiceTheme`,
    param,
  );
  return res;
};
