import React, { useEffect } from "react";
import Input from "../components/elements/Input";
import Button from "../components/elements/Button";
import { login } from "../api/auth/authApi";
import { type SubmitHandler, useForm } from "react-hook-form";
import { FIELD_REQUIRED_ERROR_MSG } from "../utils/constants";
import { Link, useNavigate } from "react-router-dom";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { useCurrentUser, AuthStateEnum } from "../contexts/CurrentUserContext";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

interface LoginFormInput {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<LoginFormInput>();
  const { episodeId } = useEpisodeId();
  const { authState } = useCurrentUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    // redirect to home if already logged in
    if (authState === AuthStateEnum.AUTHENTICATED) {
      navigate(episodeId !== undefined ? `/${episodeId}/home` : "/");
    }
  }, [authState]);

  const onSubmit: SubmitHandler<LoginFormInput> = async (data) => {
    try {
      await toast.promise(login(data.username, data.password, queryClient), {
        loading: "Logging in...",
        success: "Logged in!",
        error:
          "Error logging in. Did you enter your username and password correctly?",
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-tr from-cyan-200 to-cyan-700 p-2">
      <div className="mb-6 flex flex-1 items-end text-center font-display text-5xl tracking-wide text-white sm:text-6xl">
        BATTLECODE
      </div>
      {/* https://github.com/orgs/react-hook-form/discussions/8622 */}
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-11/12 flex-col gap-5 rounded-lg bg-gray-100 p-6 shadow-md sm:w-[350px]"
      >
        <div className="text-center text-xl font-light text-gray-700">
          Log in to Battlecode
        </div>
        <Input
          label="Username"
          required
          {...register("username", { required: FIELD_REQUIRED_ERROR_MSG })}
        />
        <Input
          label="Password"
          required
          {...register("password", { required: FIELD_REQUIRED_ERROR_MSG })}
          type="password"
        />
        <Button
          label="Log in"
          loading={isSubmitting}
          disabled={isSubmitting || !isDirty}
          fullWidth
          className="mt-1"
          type="submit"
          variant="dark"
        />
        <div>
          <hr />
          <div className="mt-3 flex flex-row justify-between text-sm text-cyan-600">
            <Link to="/password_forgot">Forgot password?</Link>
            <Link to={episodeId !== undefined ? `/${episodeId}/home` : "/"}>
              Back to home
            </Link>
          </div>
        </div>
      </form>
      <div className="w-11/12 flex-1">
        <div className="text-light mx-auto mt-4 w-full rounded-lg bg-white p-6 text-center text-sm shadow-md sm:w-[350px]">
          Need an account?{" "}
          <Link className="text-cyan-600" to="/register">
            Register for one!
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
