import React, { useState } from "react";
import { PostRequest } from "../components/api-handler";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import swal from "sweetalert";
import { useRouter } from "next/router";
import HeaderSec from "../components/common-component/HeaderSec";
import Footer from "../components/common-component/Footer";

export default function SignIn() {
  const [email, setEmail] = useState("");
  // console.log("email is ------>", email);

  const [password, setPassword] = useState("");
  // console.log("password is ------>", password);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const UserSignin = async (event) => {
    event.preventDefault(); // Prevents the form from refreshing the page
    const data = {
      user_Email: email,
      password: password,
    };
    const res = await PostRequest("userLogin", data);
    if (res.status === 200) {
      swal("Success", "Signin Successfully", "success");
      localStorage.setItem("userData", JSON.stringify(res.data));
      router.push("/home");

    }else{
      swal("Error", res.message, "error");
    }
  };

  return (
    <>
       <HeaderSec /> 
        <div className="mt-10 pl-0 md:pl-6">
          <div className="grid md:grid-cols-12 ">
            <div className="col-span-6  px-16 hidden md:block">
              
              <h1 className="text-5xl text-[#010101] font-[700] py-12">
                We take care of <br /> your money...
              </h1>
              <p className="text-[#676767] text-lg mt-5">
                At ProBiz Management Services, we simplify the complexities of financial and business management so you can focus on what really matters — growth and success.
              </p>
              <div className="mt-5">
                <label className="inline-flex items-center text-lg">
                  <input
                    type="checkbox"
                    name="option1"
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-3 text-[#676767] ">
                    Customized financial planning for individuals and businesses
                  </span>
                </label>
                <label className="inline-flex items-center text-lg mt-3">
                  <input
                    type="checkbox"
                    name="option2"
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-3 text-[#676767] ">
                    End-to-end tax and compliance solutions
                  </span>
                </label>
                <label className="inline-flex items-center text-lg mt-3">
                  <input
                    type="checkbox"
                    name="option2"
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-3 text-[#676767] ">
                    Smart tools for tracking, saving, and investing wisely
                  </span>
                </label>
              </div>
              <div className="flex mt-3">
                <img src="/images/call.png" alt="Banner" />
                <p className="font-[700] ps-3 pr-7">Need help? Call us: +91 8770052912

</p>
              <a href="https://www.facebook.com/probizmanagement"> <img className="pe-2" src="/images/facebook.png" alt="Banner" /></a>
                <a href="https://www.youtube.com/@probizfinance"><img className="pe-2" src="/images/youtube.png" alt="Banner" /></a>
                 <a href="https://linkedin.com/company/probizmanagement"><img className="pe-2" src="/images/linkedin.png" alt="Banner" /></a>
                  <a href="https://www.instagram.com/financeprobiz/"><img
                  className="pe-2"
                  src="/images/instagram.png"
                  alt="Banner"
                /></a> 
              </div>
            </div> 
            <div
              className=" bg-[#FF7F00] relative col-span-6 flex  justify-center min-h-screen"
              style={{
                padding: "30px",
              }}
            >
              
              <div className="bg-white p-10 rounded-lg shadow-lg max-w-md w-full mt-10">
                <a href="/home">
                  <div className="flex justify-center mb-5">
                    <img src="/images/logo.png" alt="Logo" className="h-16" />
                  </div>
                </a>
                <h2 className="text-xl font-semibold text-center mb-5">
                  Login Here to access your account
                </h2>
                <form className="space-y-4" onSubmit={UserSignin}>
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      onChange={(e) => setPassword(e.target.value)}
                      value={password}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center px-4"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <VisibilityIcon sx={{ color: "#4C1F7A" }} />
                      ) : (
                        <VisibilityOffIcon sx={{ color: "#4C1F7A" }} />
                      )}
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <label className="inline-flex items-center text-lg">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                      <span className="ml-3 text-[#676767]">Remember Me</span>
                    </label>
                    <a href="/forgot-password">
                      <h6 className="text-[#4C1F7A] text-lg">
                        Forgot Password
                      </h6>
                    </a>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#4C1F7A] text-white rounded-lg hover:bg-purple-700 transition duration-200"
                  >
                    PROCEED TO LOGIN
                  </button>
                </form>
                <p className="text-center mt-4 text-[#676767]">
                  Don't have an account?{" "}
                  <a
                    href="/sign-up"
                    className="text-purple-600 hover:underline"
                  >
                    Sign Up
                  </a>{" "}
                  Here...!!!
                </p>
              </div>
              <div className="absolute bottom-0 right-0">
                <img src="/images/tree.png" alt="tree" />
              </div>
            </div>
          </div>
        </div>
        <Footer/>
    
    </>
  );
}
