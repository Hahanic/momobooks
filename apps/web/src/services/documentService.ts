import { type IDocumentResponse, type IRDocumentResponse } from "@momobooks/shared";

import api from "../lib/api";

export interface CreateDocumentParams {
  title?: string;
  parent_id?: string | null;
}

export const createDocument = async (params: CreateDocumentParams) => {
  const response = await api.post("/document", params);
  return response.data;
};

export const getDocument = async (id: string): Promise<IDocumentResponse> => {
  const response = await api.get(`/document/${id}`);
  return response.data;
};

export const getDocuments = async (): Promise<IDocumentResponse[]> => {
  const response = await api.get("/document");
  return response.data;
};

export const getSharedDocuments = async (): Promise<IDocumentResponse[]> => {
  const response = await api.get("/document/shared");
  return response.data;
};

export const getRecentDocuments = async (): Promise<IRDocumentResponse[]> => {
  const response = await api.get("/document/recent");
  return response.data;
};

export const getStarredDocuments = async (): Promise<IDocumentResponse[]> => {
  const response = await api.get("/document/starred");
  return response.data;
};

export const deleteDocument = async (id: string) => {
  const response = await api.delete(`/document/${id}`);
  return response.data;
};

export const renameDocument = async (id: string, data: Partial<CreateDocumentParams>) => {
  const response = await api.post(`/document/rename/${id}`, data);
  return response.data;
};

export const starDocument = async (id: string) => {
  const response = await api.post("/document/star", { id });
  return response.data;
};
