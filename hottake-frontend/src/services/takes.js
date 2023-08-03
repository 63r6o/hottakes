import axios from "axios";

const baseUrl = "http://localhost:3001/api/takes";

let token = null;

const setToken = (newToken) => {
  token = `Bearer ${newToken}`;
};

const getAll = async () => {
  const response = await axios.get(baseUrl);
  return response.data;
};

const getTake = async (takeId) => {
  const response = await axios.get(`baseUrl/${takeId}`);
  return response.data;
};

const create = async (newTake) => {
  const config = {
    headers: { Authorization: token },
  };

  const response = await axios.post(baseUrl, newTake, config);
  return response.data;
};

const like = async (takeId) => {
  const config = {
    headers: { Authorization: token },
  };

  const response = await axios.post(`${baseUrl}/${takeId}/likes`, {}, config);
  return response.data;
};

const dislike = async (takeId) => {
  const config = {
    headers: { Authorization: token },
  };

  const response = await axios.post(
    `${baseUrl}/${takeId}/dislikes`,
    {},
    config
  );
  return response.data;
};

export default { getAll, getTake, create, like, dislike, setToken };
