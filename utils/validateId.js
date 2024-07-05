 const mongoose=require('mongoose')
  const validateId = (id) => {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new Error("This id is Invalid");
  };
   module.exports = validateId;         