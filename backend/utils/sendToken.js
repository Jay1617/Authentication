export const sendToken = async (user, message, statusCode, res) => {
  const token = await user.generateToken();
  const cookieExpireDays = parseInt(process.env.COOKIE_EXPIRE, 10);

  res.status(statusCode).cookie("token", token, {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000), 
    httpOnly: true,
  }).json({
    success: true,
    message,
    token,
    user,
  });
};