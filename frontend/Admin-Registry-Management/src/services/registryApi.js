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