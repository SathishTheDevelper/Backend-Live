const { default: mongoose } = require("mongoose");

const dbConnect = () => {
  try {
    mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    
    });
    console.log(`Database Connected Successfully`);
  } catch (err) {
    console.log(`Database Not Connect ${err}`);
  }
};

module.exports = dbConnect;