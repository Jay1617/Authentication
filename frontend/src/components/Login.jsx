import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const { setIsAuthenticated, setUser } = useContext(Context);
  const navigateTo = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleLogin = async (data) => {
    try {
      const response = await axios.post(
        "http://localhost:5500/api/v1/user/login",
        data,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(response.data.message);
      setIsAuthenticated(true);
      setUser(response.data);
      navigateTo("/");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <form
      className="auth-form"
      onSubmit={handleSubmit((data) => handleLogin(data))}
    >
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        required
        {...register("email", { required: "Email is required" })}
      />
      {errors.email && <span>{errors.email.message}</span>}

      <input
        type="password"
        placeholder="Password"
        required
        {...register("password", { required: "Password is required" })}
      />
      {errors.password && <span>{errors.password.message}</span>}

      <p className="forgot-password">
        <Link to={"/password/forgot"}>Forgot password?</Link>
      </p>
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
