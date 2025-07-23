import axios from "axios";

export async function postSignup(data) {
  return await axios.post("/api/common/auth/signup", data);
}

export async function postLogin(data) {
  return await axios.post("/api/common/auth/login", data);
}

export async function getUser(params) {}
