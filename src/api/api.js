import axios from "axios";

const JWT_TOKEN_KEY = "remJwtToken";
const hostname = window && window.location && window.location.hostname;

function isLaunchedLocally(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

const apiRoot = isLaunchedLocally(hostname)
  ? "http://localhost:8080"
  : hostname.includes("api-route") || hostname.includes("api-prod-root")
    ? "https://" + hostname
    : process.env.REACT_APP_API_ROOT || "http://localhost:8080";

class Api {
  constructor(apiRoot) {
    this.apiRoot = apiRoot;
  }

  static get jwtHeader() {
    const jwt = JSON.parse(localStorage.getItem(JWT_TOKEN_KEY));
    return jwt && jwt.tokenType && jwt.accessToken
      ? { Authorization: `${jwt.tokenType} ${jwt.accessToken}` }
      : {};
  }

  static set jwt(jwtToken) {
    if (jwtToken) {
      localStorage.setItem(JWT_TOKEN_KEY, JSON.stringify(jwtToken));
    } else {
      localStorage.removeItem(JWT_TOKEN_KEY);
    }
  }

  async getPage(url, page, pageSize, params) {
    return await this.get(url, { page, pageSize, ...params }, { headers: Api.jwtHeader });
  }

  async handleError(actionF) {
    try {
      return (await actionF()).data;
    } catch (err) {
      const resp = err.response || {};
      const statusCode = resp.status;
      const data = resp.data || {};
      const exception = (data || {}).exception;
      let message = data.message || err.message;
      if (statusCode >= 400 && statusCode < 500 && data.errors) {
        message = data.errors.map((e) => e.field + ": " + e.defaultMessage).join("\n");
      }
      throw err;
    }
  }

  async get(url, params) {
    return await this.handleError(() =>
      axios.get(`${this.apiRoot}/${url}`, {
        params,
        headers: Api.jwtHeader,
      })
    );
  }

  async post(url, payload, contentType) {
    return await this.handleError(() =>
      axios.post(`${this.apiRoot}/${url}`, payload, {
        withCredentials: true,
        headers: {
          "Content-Type": contentType || "application/json",
          ...Api.jwtHeader,
        },
      })
    );
  }

  async put(url, payload) {
    return await this.handleError(() =>
      axios.put(`${this.apiRoot}/${url}`, payload, {
        withCredentials: true,
        headers: Api.jwtHeader,
      })
    );
  }

  async delete(url) {
    return await this.handleError(() =>
      axios.delete(`${this.apiRoot}/${url}`, {
        withCredentials: true,
        headers: Api.jwtHeader,
      })
    );
  }
}

export const setJwtToken = (jwtData) => (Api.jwt = jwtData);

export const authApi = new Api(`${apiRoot}/auth`);
export const userApi = new Api(`${apiRoot}/api/user`);
export const API_URL = apiRoot;
