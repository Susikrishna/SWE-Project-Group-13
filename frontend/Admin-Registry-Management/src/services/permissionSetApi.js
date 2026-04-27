// src/services/permissionSetApi.js
import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';

export const fetchPermissionSets = () =>
  apiClient.get(ENDPOINTS.REGISTRY.PERMISSION_SETS);

export const fetchPermissionSetById = (id) =>
  apiClient.get(`${ENDPOINTS.REGISTRY.PERMISSION_SETS}/${id}`);

export const createPermissionSet = (payload) =>
  apiClient.post(ENDPOINTS.REGISTRY.PERMISSION_SETS, payload);

export const updatePermissionSet = (id, payload) =>
  apiClient.patch(`${ENDPOINTS.REGISTRY.PERMISSION_SETS}/${id}`, payload);

export const deletePermissionSet = (id) =>
  apiClient.delete(`${ENDPOINTS.REGISTRY.PERMISSION_SETS}/${id}`);

export const resolvePermissionSets = (ids) =>
  apiClient.post(ENDPOINTS.REGISTRY.PERMISSION_SETS_RESOLVE, { ids });
