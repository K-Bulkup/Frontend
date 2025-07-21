import axios from "axios";

export async function postSignup(data) {
  return await axios.post("/api/common/auth/signup", data);
}

export async function getUser(params) {}
