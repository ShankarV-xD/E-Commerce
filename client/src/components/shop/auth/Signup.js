import React, { Fragment, useState } from "react";
import { signupReq } from "./fetchApi";

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
    tempUser: false, // Set tempUser to false initially
    showOtpField: false, // New state to manage OTP field visibility
  });

  // ... (rest of the component remains unchanged)

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
        // ... (unchanged)
      } else {
        if (!data.otp) {
          return setData({
            ...data,
            loading: false,
            error: { otp: "Please enter the OTP" },
          });
        }

        let responseData = await signupReq({
          name: data.name,
          email: data.email,
          password: data.password,
          cPassword: data.cPassword,
          otp: data.otp,
        });

        if (responseData.error) {
          // ... (unchanged)
        } else if (responseData.success) {
          setData({
            ...data,
            success: responseData.success,
            loading: false,
            error: false,
            tempUser: false,
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to handle "Send OTP" button click
  const sendOtpClick = () => {
    setData({ ...data, showOtpField: true });
    // You may add logic to send OTP via email here if needed
  };

  return (
    <Fragment>
      {/* ... (unchanged) */}
      {data.tempUser && data.showOtpField && (
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
          (data.tempUser && !data.otp) || !data.loading ? "opacity-50" : ""
        }`}
      >
        {data.tempUser ? "Send OTP" : "Create an account"}
      </div>
    </Fragment>
  );
};

export default Signup;
