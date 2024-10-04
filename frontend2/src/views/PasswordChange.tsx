import { usePasswordResetTokenValid, useResetPassword } from "api/user/useUser";
import Spinner from "components/Spinner";
import Button from "components/elements/Button";
import Input from "components/elements/Input";
import { useEpisodeId } from "contexts/EpisodeContext";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { FIELD_REQUIRED_ERROR_MSG } from "utils/constants";

interface PasswordChangeFormInput {
  password: string;
  passwordConfirm: string;
}

interface QueryParams {
  token: string;
}

const PasswordChange: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty },
    reset,
  } = useForm<PasswordChangeFormInput>();
  const { episodeId } = useEpisodeId();

  const [searchParams, _] = useSearchParams();
  const queryParams: QueryParams = useMemo(() => {
    return {
      token: searchParams.get("token") ?? "",
    };
  }, [searchParams]);

  const resetTokenValid = usePasswordResetTokenValid({
    resetTokenRequest: { token: queryParams.token },
  });
  const resetPassword = useResetPassword({ episodeId });

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-tr from-cyan-200 to-cyan-700 p-2">
      <span className="items-end text-center font-display tracking-wide text-white">
        <div className="mb-6 text-5xl sm:text-6xl">BATTLECODE</div>
      </span>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit((data) => {
          resetPassword.mutate({
            passwordTokenRequest: {
              password: data.password,
              token: queryParams.token,
            },
          });
          reset();
        })}
        className="flex w-11/12 flex-col gap-5 rounded-lg bg-gray-100 p-6 shadow-md sm:w-[350px]"
      >
        {(resetTokenValid.isLoading || resetTokenValid.isError) && (
          <>
            {resetTokenValid.isLoading && (
              <div className="flex flex-row items-center justify-center gap-6 text-center">
                <span>Verifying Token...</span>
                <Spinner size="md" />
              </div>
            )}
            {resetTokenValid.isError && (
              <div className="text-center text-xl font-light text-red-700">
                Invalid Token!
                <div className="mt-3 text-sm font-normal text-gray-600">
                  Your password reset token may be expired. Try requesting a new
                  token or contact battlecode@mit.edu if you encounter further
                  issues.
                </div>
              </div>
            )}
          </>
        )}
        {resetTokenValid.isSuccess && (
          <>
            <div className="text-center text-xl font-light text-gray-700">
              Reset Password
            </div>
            <div className="mt-3 text-sm font-normal text-gray-600">
              Enter a new password below to reset your password.
            </div>
            <Input
              label="New Password"
              required
              {...register("password", { required: FIELD_REQUIRED_ERROR_MSG })}
            />
            <Input
              label="Confirm Password"
              required
              {...register("passwordConfirm", {
                required: FIELD_REQUIRED_ERROR_MSG,
              })}
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
          </>
        )}
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

export default PasswordChange;
