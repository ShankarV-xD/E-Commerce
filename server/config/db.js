const mongoose = require("mongoose");
try {
  mongoose.connect(
    "mongodb+srv://root:admin@ecom-cluster.otriscl.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }
  );
  console.log("Database Connected Successfully");
} catch (err) {
  console.log("Database Not Connected");
}
