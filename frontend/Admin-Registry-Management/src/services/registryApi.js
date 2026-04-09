// src/services/registryApi.js
import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';

// POST: Register
export const registerService = async (payload, type) => {
  const targetUrl = type === "microservice" 
    ? ENDPOINTS.REGISTRY.SERVICES_BULK 
    : ENDPOINTS.REGISTRY.MFES;

  console.log(targetUrl)
  // Axios automatically stringifies the payload and throws an error if it fails!
  return await apiClient.post(targetUrl, payload); 
};

// GET: Fetch Microservices
export const fetchMicroservices = async () => {
  return await apiClient.get(ENDPOINTS.REGISTRY.SERVICES);
};

// GET: Fetch Microfrontends
export const fetchMicrofrontends = async () => {
  return await apiClient.get(ENDPOINTS.REGISTRY.MFES);
};

// PUT: Update Microservice
export const updateMicroservice = async (id, payload) => {
  return await apiClient.put(`${ENDPOINTS.REGISTRY.SERVICES}/${id}`, payload);
};

// PUT: Update Microfrontend
export const updateMicrofrontend = async (id, payload) => {
  return await apiClient.put(`${ENDPOINTS.REGISTRY.MFES}/${id}`, payload);
};

// GET: Search Microservices
export const searchMicroservices = async (query) => {
  return await apiClient.get(`${ENDPOINTS.REGISTRY.SERVICES_SEARCH}?q=${encodeURIComponent(query)}`);
};

// GET: Search Microfrontends
export const searchMicrofrontends = async (query) => {
  return await apiClient.get(`${ENDPOINTS.REGISTRY.MFES_SEARCH}?q=${encodeURIComponent(query)}`);
};