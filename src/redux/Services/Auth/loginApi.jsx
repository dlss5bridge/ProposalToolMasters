import { Base_Url } from "../../../Base-Url/Base_Url";
import {
    getListWithAuthenticated,
    postApi,
    postApiWithAuthenticated,
} from "../../reducer/reduxService";

//..................Login Url......................................

const loginUrl = `${Base_Url}/Login/authenticate`;
const AuthenticateWithSocialMedia = `${Base_Url}/Login/AuthenticateWithSocialMedia`;
const AuthenticateWithSocialMediaByToken = `${Base_Url}/Login/AuthenticateWithSocialMediaByToken`;
const refreshTokenUrl = `${Base_Url}/Login/RefreshToken`;

// Arrow function as a method

//..............................Login Services Callback function.................................

export const VerifyLoginCredential = async (params) => {
    const res = await postApi(loginUrl, params);
    return res;
};

export const VerifySocialMediaLoginCredential = async (params) => {
    const res = await postApi(AuthenticateWithSocialMedia, params);
    return res;
};
export const VerifyAuthenticateWithSocialMediaByToken = async (params) => {
    const res = await postApi(AuthenticateWithSocialMediaByToken, params);
    return res;
};
export const GetAuthenticateWithMFA = async (param) => {
    const res = await postApi(
        `${Base_Url}/Login/AuthenticateWithMFA`, param
    );
    return res;
};

export const RefreshToken = async (userKeyID) => {
    const res = await getListWithAuthenticated(
        `${refreshTokenUrl}?UserKeyID=${userKeyID}`
    );
    return res;
};