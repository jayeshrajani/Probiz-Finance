import axios from "axios";

export const serverUrl = "/api";

export const awsUrl = "";

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

export const getApihandler = async (endPoint) => {
  try {
    const getres = await axios.get(serverUrl + endPoint);
    return getres.data;
  } catch (error) {
    return { error };
  }
};

export const getbyidApihandler = async (endPoint) => {
  try {
    const getres = await axios.get(serverUrl + endPoint);
    // console.log("getresbyid=>", getres);
    return getres.data;
  } catch (error) {
    return { error };
  }
};

export const postLoginApihandler = async (endPoint, value) => {
  try {
    const postRes = await axios.post(serverUrl + endPoint, value);
    // console.log("apipost=>", postRes);
    return postRes.data;
  } catch (error) {
    return { error };
  }
};

export const postApihandler = async (endPoint, value) => {
  console.log("postvalue=>", endPoint);
  console.log("postvalue=>", value);
  try {
    const postRes = await axios.post(serverUrl + endPoint, value);
    console.log("apipost=>", postRes);
    return postRes.data;
  } catch (error) {
    return { error };
  }
};

export const deleteApihandler = async (endPoint) => {
  try {
    const deleteRes = await axios.delete(serverUrl + endPoint);
    return deleteRes.data;
  } catch (error) {
    return { error };
  }
};

export const putApihandler = async (endPoint, value) => {
  console.log("endPoint--->", endPoint);
  console.log("value------>", value);
  try {
    // Axios Method ----
    const res = await axios.put(serverUrl + endPoint, value);
    return res.data;
  } catch (error) {
    return { error };
  }
};
