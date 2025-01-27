import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";

const Register = () => {
  const navigate = useNavigate();
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm();

  const handleRegister = async (data) => {
    try {
      const response = await axios.post(
        "http://localhost:5500/api/v1/user/register",
        data,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      toast.success(response.data.message);
      navigate(`/otp-verification/${data.email}/${data.phone}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div>
      <form
        className="auth-form"
        onSubmit={handleSubmit(handleRegister)}
      >
        <h2>Register</h2>
        
        {/* Name Field */}
        <input
          type="text"
          placeholder="Name"
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && <span>{errors.name.message}</span>}
        
        {/* Email Field */}
        <input
          type="email"
          placeholder="Email"
          {...register("email", { required: "Email is required" })}
        />
        {errors.email && <span>{errors.email.message}</span>}
        
        {/* Phone Field */}
        <div>
          <span>+91</span>
          <input
            type="number"
            placeholder="Phone"
            {...register("phone", {
              required: "Phone number is required",
              minLength: { value: 10, message: "Phone number must be 10 digits" },
              maxLength: { value: 10, message: "Phone number must be 10 digits" },
            })}
          />
        </div>
        {errors.phone && <span>{errors.phone.message}</span>}
        
        {/* Password Field */}
        <input
          type="password"
          placeholder="Password"
          {...register("password", {
            required: "Password is required",
            minLength: { value: 8, message: "Password must be at least 8 characters" },
          })}
        />
        {errors.password && <span>{errors.password.message}</span>}
        
        {/* Verification Method */}
        <div className="verification-method">
          <p>Select Verification Method</p>
          <div className="wrapper">
            <label>
              <input
                type="radio"
                name="verificationMethod"
                value="email"
                {...register("verificationMethod", {
                  required: "Please select a verification method",
                })}
              />
              Email
            </label>
            <label>
              <input
                type="radio"
                name="verificationMethod"
                value="phone"
                {...register("verificationMethod", {
                  required: "Please select a verification method",
                })}
              />
              Phone
            </label>
          </div>
          {errors.verificationMethod && (
            <span>{errors.verificationMethod.message}</span>
          )}
        </div>

        {/* Submit Button */}
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
