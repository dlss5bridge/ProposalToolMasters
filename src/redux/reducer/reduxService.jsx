import { createAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { Navigate } from "react-router-dom";
import Login from "../../Auth/login/Login";
import Api from "../../auth-token/AuthToken";
import c_h_API from "../../companies-housing-key/companies-housing";

//......................Get List Without Authorisation..................................

export const getList = async (url) => {
    try {
        const res = await axios.get(url);

        if (res.data.statusCode === 401) {
            // remove user related Details here
            <Navigate to={<Login />} />;
            return;
        }
        return res;
    } catch (error) {
        return error;
    }
};

//......................Get List With Authorization....................................

export const getListWithAuthenticated = async (url) => {
    try {
        const res = await Api.get(url);

        if (res.data.statusCode === 401) {
            // remove user related Details here
            <Navigate to={<Login />} />;
            return;
        }
        return res;
    } catch (error) {
        return error;
    }
};

//......................Post Api Without Authorization....................................

export const postApi = async (url, params) => {
    try {
        const res = await axios.post(url, params);

        if (res.data.statusCode === 401) {
            // remove user related Details here
            <Navigate to={<Login />} />;
            return;
        }
        return res;
    } catch (error) {
        return error;
    }
};

//......................Post Api With Authorization........................................

export const postApiWithAuthenticated = async (url, params) => {
    try {
        const res = await Api.post(url, params);
        if (res?.data?.statusCode === 401) {
            // remove user related Details here
            <Navigate to={<Login />} />;
            return;
        }
        return res;
    } catch (error) {
        return error;
    }
};

//......................Put Api With Authorization........................................
export const putApiWithAuthenticated = async (url, params) => {
    try {
        const res = await Api.put(url, params);

        if (res?.data?.statusCode === 401) {
            <Navigate to={<Login />} />;
            return;
        }
        return res;
    } catch (error) {
        return error;
    }
};