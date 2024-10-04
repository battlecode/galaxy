import { useForgotPassword } from "api/user/useUser";
import Button from "components/elements/Button";
import Input from "components/elements/Input";
import { useEpisodeId } from "contexts/EpisodeContext";
import React from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { FIELD_REQUIRED_ERROR_MSG } from "utils/constants";

interface PasswordForgotFormInput {
  email: string;
}

const PasswordForgot: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty, errors },
    reset,
  } = useForm<PasswordForgotFormInput>();
  const { episodeId } = useEpisodeId();
  const forgot = useForgotPassword({ episodeId });

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-tr from-cyan-200 to-cyan-700 p-2">
      <span className="items-end text-center font-display tracking-wide text-white">
        <div className="mb-6 text-5xl sm:text-6xl">BATTLECODE</div>
      </span>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit((data) => {
          forgot.mutate(data.email);
          reset();
        })}
        className="flex w-11/12 flex-col gap-5 rounded-lg bg-gray-100 p-6 shadow-md sm:w-[350px]"
      >
        <div className="text-center text-xl font-light text-gray-700">
          Forgot Password
          <div className="mt-3 text-sm font-normal text-gray-600">
            Enter your email below to receive a password reset email. Contact
            battlecode@mit.edu if you encounter any issues.
          </div>
        </div>
        <Input
          label="Email"
          required
          type="email"
          errorMessage={errors.email?.message}
          {...register("email", { required: FIELD_REQUIRED_ERROR_MSG })}
        />
        <Button
          label="Submit"
          fullWidth
          className="mt-1"
          type="submit"
          variant="dark"
          loading={isSubmitting}
          disabled={isSubmitting || !isDirty}
        />
        <div>
          <hr />
          <div className="mt-3 flex flex-row justify-between text-sm text-cyan-600">
            <Link to="/login">Login</Link>
            <Link to={episodeId !== undefined ? `/${episodeId}/home` : "/"}>
              Back to home
            </Link>
          </div>
        </div>
      </form>
      <div className="w-11/12">
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

export default PasswordForgot;
