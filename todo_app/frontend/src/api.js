import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Change this when hosted
});

// GET all tasks
export const getTasks = async () => {
  const res = await API.get('/tasks');
  return res.data;
};

// CREATE a task
export const createTask = async (taskData) => {
  const res = await API.post('/tasks', taskData);
  return res.data;
};

// UPDATE a task
export const updateTask = async (id, taskData) => {
  const res = await API.put(`/tasks/${id}`, taskData);
  return res.data;
};

// DELETE a task
export const deleteTask = async (id) => {
  const res = await API.delete(`/tasks/${id}`);
  return res.data;
};

// GET VAPID public key for push notifications
export const getVapidPublicKey = async () => {
  const res = await API.get('/vapid-public-key');
  return res.data.publicKey;
};

// Subscribe to push notifications
export const subscribeToPushNotifications = async (subscription) => {
  const res = await API.post('/subscribe', subscription);
  return res.data;
};

export default API;
