import axios from "axios";

export const G = "https://graph.microsoft.com/v1.0";

export function graphGet(url, token, config = {}) {
  return axios.get(url, {
    ...config,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(config.headers || {}),
    },
  });
}

export function graphPost(url, token, body, config = {}) {
  return axios.post(url, body, {
    ...config,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(config.headers || {}),
    },
  });
}
