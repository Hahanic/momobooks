import { Response } from "express";

// 统一响应格式
export const sendResponse = (
  res: Response,
  statusCode = 200,
  message = "成功",
  data: unknown = null,
) => {
  const response: { message: string; data?: unknown } = { message };
  if (data !== null) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};
