// 统一响应格式
export const sendResponse = (res, statusCode = 200, message = "成功", data = null) => {
  const response = { message };
  if (data !== null) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};
