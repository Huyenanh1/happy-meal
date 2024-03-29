import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import styles from "../auth.module.scss";
import { AiOutlineGoogle, AiFillEye } from "react-icons/ai";
import { MdEmail } from "react-icons/md";
import Input from "../../components/Input";
import Seo from "../../components/Seo";
import { validateEmail, validatePassword, validateAll } from "../../utils/formValidate";
import { fetchUserAuth, fetchUserLogout } from "../../redux/thunks/userThunk";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const isAuthenticated = useSelector((state) => state.user.account.isAuthenticated);
  const authProcessStatus = useSelector((state) => state.user.status.authProcessStatus);
  const toastMessage = useSelector((state) => state.user.toast.toastMessage);

  const [email, setEmail] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });
  const [isAbleToValidate, setIsAbleToValidate] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (mode === "resetPassword") {
      dispatch(fetchUserLogout());
    } else if (isAuthenticated) {
      navigate(state?.redirectTo || "/", { replace: true });
    }
  }, [isAuthenticated, mode]);

  useEffect(() => {
    if (!isSubmitted) return;
    if (authProcessStatus === "idle") return;

    if (authProcessStatus === "pending") {
      toast.loading("Logging in...");
    } else {
      toast.dismiss();

      if (authProcessStatus === "fulfilled") {
        toast.success("Logged in successfully!");
      } else if (authProcessStatus === "rejected") {
        setIsSubmitted(false);
        toast.error(toastMessage);
      }
    }
  }, [authProcessStatus, toastMessage, isSubmitted]);

  function handleChangeEmail(event) {
    let message = isAbleToValidate ? validateEmail(event.target.value).message : "";
    setEmail({ value: event.target.value, error: message });
  }

  function handleChangePassword(event) {
    let message = isAbleToValidate ? validatePassword(event.target.value).message : "";
    setPassword({ value: event.target.value, error: message });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsAbleToValidate(true); // Only start validating after user has submitted the form

    setEmail({ ...email, error: validateEmail(email.value).message });
    setPassword({ ...password, error: validatePassword(password.value).message });
    let validated = validateAll(validateEmail(email.value), validatePassword(password.value));

    if (validated) {
      setIsSubmitted(true);
      dispatch(fetchUserAuth({ email: email.value, password: password.value, type: "login" }));
    }
  }

  async function handleGoogleLogin() {
    setIsSubmitted(true);
    dispatch(fetchUserAuth({ method: "google" }));
  }

  return (
    <>
      <Seo title="Login" />
      <div className={styles.wrapper}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formTop}>
            <h1>Welcome back</h1>
            <p>Please enter your details</p>
          </div>
          <div className={styles.formMain}>
            <Input
              icon={<MdEmail />}
              label="Username"
              type="email"
              placeholder="Enter email"
              value={email.value}
              handleChangeValue={handleChangeEmail}
              error={email.error}
            />
            <Input
              icon={<AiFillEye />}
              label="Password"
              type="password"
              placeholder="Password"
              password={password.value}
              handleChangeValue={handleChangePassword}
              error={password.error}
            />
            <Link className={styles.forgotMessage} to="/forgot-password">
              Forgot Password?
            </Link>
            <button className={styles.submit} type="submit" disabled={isSubmitted}>
              Log in
            </button>
            <p className={styles.snsMessage}>Or Log in with</p>
            <button className={styles.snsButton} type="button" onClick={handleGoogleLogin}>
              <AiOutlineGoogle /> Google
            </button>
            <p className={styles.changeActionMessage}>
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </div>
        </form>
      </div>
    </>
  );
}

export default Login;
