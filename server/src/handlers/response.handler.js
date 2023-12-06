const responseWithData = (res, statusCode, data) => res.status(statusCode).json(data);

const oke = (res, data) => responseWithData(res, 200, data);
const forbidden = (res, data) => responseWithData(res, 403, { error: data });

const error = (res, err) => responseWithData(res, 500, { error: err.message })

export default { error, oke, forbidden };