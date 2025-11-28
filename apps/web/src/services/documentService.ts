import { type IDocumentResponse } from "@momobooks/shared";

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
