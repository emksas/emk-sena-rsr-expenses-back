import axios from "axios";

const GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0";

function graphGet(url, token, config = {}) {
  return axios.get(url, {
    ...config,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(config.headers || {}),
    },
  });
}

function graphPost(url, token, body, config = {}) {
  return axios.post(url, body, {
    ...config,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(config.headers || {}),
    },
  });
}

function graphPatch(url, token, body, config = {}) {
  return axios.patch(url, body, {
    ...config,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(config.headers || {}),
    },
  });
}

export { graphGet, graphPost, graphPatch, GRAPH_BASE_URL };