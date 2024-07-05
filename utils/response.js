
const success = (res, status, success, message, result) => {
  res.statusMessage = message;
  res.status(status).json({
    status: status,
    success: success,
    message: message,
    data: result,
  }).end();
};

const successToken = (res, status, success, message, result, token,session) => {
  res.statusMessage = message;
  res
    .status(status)
    .json({
      status: status,
      success: success,
      message: message,
      data: result,
      token: token,
      company: session,
    })
    .end();
};

const error = (res, status, success, message) => {
   res.statusMessage = message;
   res
     .status(status)
     .json({
       status: status,
       success: success,
       message: message,
     })
     .end();
};

module.exports = {
  success,
  successToken,
  error,
}
