export const sendSuccessResponse = (res, statusCode, message = "Success", data = null, pagination = null) => {
  const response = {
    success:true,
    message,
  }
  if(data) response.data = data;
  if(pagination) response.pagination = pagination;

  return res.status(statusCode).json(response);
};

export const sendErrorResponse = (res, statusCode, message = "Error", error = null) => {
  return res.status(statusCode).json({
    success:false,
    message,
    error : error || null
  });
}