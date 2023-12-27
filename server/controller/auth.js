const { toTitleCase, validateEmail } = require("../config/function");
const bcrypt = require("bcryptjs");
const userModel = require("../models/users");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/keys");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "brittneylauren143@gmail.com",
    pass: "jizi xddz qwph rxns",
  },
});

const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: "brittneylauren143@gmail.com",
    to: to,
    subject: subject,
    text: text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
};

const otpDatabase = new Map();

class Auth {
  async isAdmin(req, res) {
    let { loggedInUserId } = req.body;
    try {
      let loggedInUserRole = await userModel.findById(loggedInUserId);
      res.json({ role: loggedInUserRole.userRole });
    } catch (error) {
      console.log(error);
      res.status(404);
    }
  }

  async allUser(req, res) {
    try {
      let allUser = await userModel.find({});
      res.json({ users: allUser });
    } catch (error) {
      console.log(error);
      res.status(404);
    }
  }

  verifyOtp(email, enteredOtp) {
    const storedOtp = otpDatabase.get(email);

    if (storedOtp && storedOtp === enteredOtp) {
      otpDatabase.delete(email);
      return true;
    }

    return false;
  }

  async postSignup(req, res) {
    let { name, email, password, cPassword, otp } = req.body;
    let error = {};
    if (!name || !email || !password || !cPassword) {
      error = {
        ...error,
        name: "Field must not be empty",
        email: "Field must not be empty",
        password: "Field must not be empty",
        cPassword: "Field must not be empty",
      };
      return res.json({ error });
    }
    if (name.length < 3 || name.length > 25) {
      error = { ...error, name: "Name must be 3-25 characters" };
      return res.json({ error });
    } else {
      if (validateEmail(email)) {
        name = toTitleCase(name);
        if (password.length > 255 || password.length < 8) {
          error = {
            ...error,
            password: "Password must be 8 characters",
            name: "",
            email: "",
          };
          return res.json({ error });
        } else {
          const isOtpValid = this.verifyOtp(email, otp);

          if (!isOtpValid) {
            return res.json({ error: { otp: "Invalid OTP" } });
          }
          try {
            password = bcrypt.hashSync(password, 10);
            const data = await userModel.findOne({ email: email });
            if (data) {
              error = {
                ...error,
                password: "",
                name: "",
                email: "Email already exists",
              };
              return res.json({ error });
            } else {
              const otp = otpGenerator.generate(6, {
                digits: true,
                alphabets: false,
                upperCase: false,
                specialChars: false,
              });
              sendEmail(
                email,
                "Your OTP for Registration",
                `Your OTP is: ${otp}`
              );
              otpDatabase.push({ email: email, otp: otp });
              let newUser = new userModel({
                name,
                email,
                password,
                userRole: 0,
                otp: otp,
              });
              newUser
                .save()
                .then((data) => {
                  return res.json({
                    success: "Account created successfully. Please login",
                  });
                })
                .catch((err) => {
                  console.log(err);
                  return res
                    .status(500)
                    .json({ error: "Internal Server Error" });
                });
            }
          } catch (err) {
            console.log(err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
        }
      } else {
        error = {
          ...error,
          password: "",
          name: "",
          email: "Email is not valid",
        };
        return res.json({ error });
      }
    }
  }

  async postSignin(req, res) {
    let { email, password, enteredOTP, tempUser } = req.body;
    if (!email || !password || (tempUser && !enteredOTP)) {
      return res.json({
        error: "Fields must not be empty",
      });
    }
    try {
      const data = await userModel.findOne({ email: email });
      if (!data) {
        return res.json({
          error: "Invalid email or password",
        });
      } else {
        const login = await bcrypt.compare(password, data.password);
        if (login) {
          if (tempUser) {
            const storedOTP = otpDatabase.find(
              (otpEntry) => otpEntry.email === email
            );

            if (storedOTP && storedOTP.otp === enteredOTP) {
              otpDatabase.splice(otpDatabase.indexOf(storedOTP), 1);
              return res.json({
                success: "Temporary account verified. Please continue",
              });
            } else {
              return res.json({
                error: "Invalid OTP",
              });
            }
          } else {
            const token = jwt.sign(
              { _id: data._id, role: data.userRole },
              JWT_SECRET
            );
            const encode = jwt.verify(token, JWT_SECRET);

            return res.json({
              token: token,
              user: encode,
            });
          }
        } else {
          return res.json({
            error: "Invalid email or password",
          });
        }
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

const authController = new Auth();
module.exports = authController;
