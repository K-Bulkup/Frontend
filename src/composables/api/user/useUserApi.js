import axios from 'axios';

export async function getUser(userId) {
  return await axios.get(`/api/users/${userId}`);
}

export async function getUserList() {
  return await axios.get('/api/users');
}

export async function postLogin(data) {
  return await axios.post('/api/login', data);
}
