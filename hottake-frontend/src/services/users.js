import axios from "axios";

const baseUrl = "/api/users";

let token = null;

const setToken = (newToken) => {
  token = `Bearer ${newToken}`;
};

const getUser = async (userId) => {
  const config = {
    headers: { Authorization: token },
  };

  const response = await axios.get(`${baseUrl}/${userId}`, config);
  return response.data;
};

const register = async (newUser) => {
  const response = await axios.post(baseUrl, newUser);
  return response.data;
};

export default { getUser, register, setToken };
