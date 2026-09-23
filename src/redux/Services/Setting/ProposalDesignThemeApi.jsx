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
 * NOTE: these two endpoints follow this codebase's existing REST/query
 * conventions but do not exist on the backend yet (searched this repo for
 * an equivalent - none found). The frontend below is fully wired and
 * ready; the backend needs a matching route before "Save" here actually
 * persists. If an equivalent endpoint already exists under another name,
 * point this file at it instead of adding a new one.
 */

const proposalDesignThemeUrl = `${Base_Url}/GlobalVariables`;

// Expected response shape: { data: { statusCode: 200, responseData: { serviceThemeID: 1 | 2 | 3 | 4 } } }
export const GetProposalDesignTheme = async () => {
  const res = await getListWithAuthenticated(
    `${proposalDesignThemeUrl}/GetProposalDesignTheme`,
  );
  return res;
};

// param shape: { serviceThemeID: 1 | 2 | 3 | 4 }
export const UpdateProposalDesignTheme = async (userKeyID, param) => {
  const res = await postApiWithAuthenticated(
    `${proposalDesignThemeUrl}/UpdateProposalDesignTheme?UserKeyID=${userKeyID}`,
    param,
  );
  return res;
};
