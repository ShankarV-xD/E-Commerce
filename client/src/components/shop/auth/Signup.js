import React, { Fragment, useState } from "react";
import { signupReq } from "./fetchApi";
import { useNavigate } from "react-router-dom";

const Signup = (props) => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    cPassword: "",
    otp: "",
    error: false,
    loading: false,
    success: false,
    tempUser: true, // Display OTP field from the start
  });

  const navigate = useNavigate();

  const alert = (msg, type) => (
    <div className={`text-sm text-${type}-500`}>{msg}</div>
  );

  const formSubmit = async () => {
    setData({ ...data, loading: true });

    if (data.cPassword !== data.password) {
      return setData({
        ...data,
        error: {
          cPassword: "Password doesn't match",
          password: "Password doesn't match",
        },
      });
    }

    try {
      if (data.tempUser) {
        // Handle temporary registration
        let responseData = await signupReq({
          name: data.name,
          email: data.email,
          password: data.password,
          cPassword: data.cPassword,
        });

        if (responseData.error) {
          setData({
            ...data,
            loading: false,
            error: responseData.error,
            password: "",
            cPassword: "",
            otp: "",
          });
        } else if (responseData.success) {
          // Update state to indicate successful temporary registration
          setData({
            ...data,
            success: responseData.success,
            loading: false,
            error: false,
            tempUser: false, // Hide OTP field after temporary registration
          });
          navigate("/signin");
        }
      } else {
        // Handle OTP verification
        let responseData = await signupReq({
          name: data.name,
          email: data.email,
          password: data.password,
          cPassword: data.cPassword,
          otp: data.otp,
        });

        if (responseData.error) {
          setData({
            ...data,
            loading: false,
            error: responseData.error,
            password: "",
            cPassword: "",
            otp: "",
          });
        } else if (responseData.success) {
          setData({
            ...data,
            success: responseData.success,
            loading: false,
            error: false,
            tempUser: false, // Reset to indicate permanent registration
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Fragment>
      <div className="text-center text-2xl mb-6">Register</div>
      <form className="space-y-4">
        {data.success ? alert(data.success, "green") : ""}
        <div className="flex flex-col">
          <label htmlFor="name">
            Name<span className="text-sm text-gray-600 ml-1">*</span>
          </label>
          <input
            onChange={(e) =>
              setData({
                ...data,
                success: false,
                error: {},
                name: e.target.value,
              })
            }
            value={data.name}
            type="text"
            id="name"
            className={`${
              data.error.name ? "border-red-500" : ""
            } px-4 py-2 focus:outline-none border`}
          />
          {!data.error ? "" : alert(data.error.name, "red")}
        </div>
        <div className="flex flex-col">
          <label htmlFor="email">
            Email address<span className="text-sm text-gray-600 ml-1">*</span>
          </label>
          <input
            onChange={(e) =>
              setData({
                ...data,
                success: false,
                error: {},
                email: e.target.value,
              })
            }
            value={data.email}
            type="email"
            id="email"
            className={`${
              data.error.email ? "border-red-500" : ""
            } px-4 py-2 focus:outline-none border`}
          />
          {!data.error ? "" : alert(data.error.email, "red")}
        </div>
        <div className="flex flex-col">
          <label htmlFor="password">
            Password<span className="text-sm text-gray-600 ml-1">*</span>
          </label>
          <input
            onChange={(e) =>
              setData({
                ...data,
                success: false,
                error: {},
                password: e.target.value,
              })
            }
            value={data.password}
            type="password"
            id="password"
            className={`${
              data.error.password ? "border-red-500" : ""
            } px-4 py-2 focus:outline-none border`}
          />
          {!data.error ? "" : alert(data.error.password, "red")}
        </div>
        <div className="flex flex-col">
          <label htmlFor="cPassword">
            Confirm password
            <span className="text-sm text-gray-600 ml-1">*</span>
          </label>
          <input
            onChange={(e) =>
              setData({
                ...data,
                success: false,
                error: {},
                cPassword: e.target.value,
              })
            }
            value={data.cPassword}
            type="password"
            id="cPassword"
            className={`${
              data.error.cPassword ? "border-red-500" : ""
            } px-4 py-2 focus:outline-none border`}
          />
          {!data.error ? "" : alert(data.error.cPassword, "red")}
        </div>
        {data.tempUser && (
          <div className="flex flex-col">
            <label htmlFor="otp">
              OTP<span className="text-sm text-gray-600 ml-1">*</span>
            </label>
            <input
              onChange={(e) =>
                setData({
                  ...data,
                  success: false,
                  error: {},
                  otp: e.target.value,
                })
              }
              value={data.otp}
              type="text"
              id="otp"
              className={`${
                data.error.otp ? "border-red-500" : ""
              } px-4 py-2 focus:outline-none border`}
            />
            {!data.error ? "" : alert(data.error.otp, "red")}
          </div>
        )}
        <div
          onClick={(e) => formSubmit()}
          style={{ background: "#303031" }}
          className={`px-4 py-2 text-white text-center cursor-pointer font-medium ${
            (data.tempUser && !data.otp) || data.loading ? "opacity-50" : "" // Disable button if OTP is required and not entered or loading
          }`}
        >
          {data.tempUser ? "Send OTP" : "Create an account"}
        </div>
      </form>
    </Fragment>
  );
};

export default Signup;
