const register = (name) => {
  return `
  <div style="width:450px;background:#fff;padding:25px;border-radius: 5px;box-shadow: 0 0 20px rgb(0 0 0 / 10%);border-top:10px solid #004d4d;">
          <h2 style="margin: 0 0 20px;font-size: 18px;">Dear ${name},</h2>
          <p>Your have register successfully!</p>
          </div >
  `;
}

module.exports = {
  register,
}; 