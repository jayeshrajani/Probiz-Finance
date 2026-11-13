import { useState } from "react";
import logo from "../images/Probiz-Logo.png";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";
import { postApihandler } from "../Apihandler";

const Login = () => {
  const Navigate = useNavigate();
  const [passwordShown, setPasswordShown] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const SubmitLogins = async () => {
    let item = {
      admin_Email: email,
      password: password,
    };
    let result = await postApihandler("/adminLogin", item);
    console.log("login result is", result);
    if (result.status == 200) {
      Navigate("/dashboard");
      swal({
        icon: "success",
        text: "You have successfully logged in ",
      });
    } else {
      swal({
        icon: "error",
        title: "Please Try Again",
        text: result.error.response.data.message,
      });
      console.log("false result is - ", result.error.response.data.message);
    }
  };
  return (
    <div className="container">
      <div className="card">
        {/* Logo */}
        <img src={logo} alt="Logo" className="logo" />

        {/* Email Input */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          className="input"
        />

        {/* Password Input */}
        <div className="password-container">
          <input
            type={passwordShown ? "text" : "password"}
            placeholder="Password"
            className="input"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <span
            className="eye-icon"
            onClick={() => setPasswordShown(!passwordShown)}
          >
            {passwordShown ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </span>
        </div>

        {/* Login Button */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={SubmitLogins}
            className="login-button"
            style={{ outline: "none" }}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
