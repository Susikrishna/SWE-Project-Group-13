import apiClient from "./apiClient";

export const fetchMicroservices = async () => {
  return await apiClient.get("/registry/services");
};

export const fetchMicrofrontends = async () => {
  return await apiClient.get("/registry/mfes");
};
