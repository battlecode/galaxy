import { useVerifyEmail } from "api/user/useUser";
import Spinner from "components/Spinner";
import { useEpisodeId } from "contexts/EpisodeContext";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

interface QueryParams {
  token: string;
}

const COUNTDOWN_START = 3;
const COUNTDOWN_INTERVAL_MS = 1000;

const EmailVerify: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryParams: QueryParams = useMemo(
    () => ({
      token: searchParams.get("token") ?? "",
    }),
    [searchParams],
  );

  const verifyEmailMutation = useVerifyEmail({ episodeId }, queryClient);
  const [countdown, setCountdown] = useState(COUNTDOWN_START);

  useEffect(() => {
    if (queryParams.token !== "") {
      verifyEmailMutation.mutate(queryParams.token);
    }
  }, [queryParams.token]);

  // Countdown and redirect on success
  useEffect(() => {
    if (verifyEmailMutation.isSuccess && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, COUNTDOWN_INTERVAL_MS);
      return () => {
        clearTimeout(timer);
      };
    }
    if (verifyEmailMutation.isSuccess && countdown === 0) {
      navigate(`/${episodeId}/home`);
    }
  }, [verifyEmailMutation.isSuccess, countdown, navigate, episodeId]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-tr from-cyan-200 to-cyan-700 p-2">
      <span className="items-end text-center font-display tracking-wide text-white">
        <div className="mb-6 text-5xl sm:text-6xl">BATTLECODE</div>
      </span>

      <div className="flex w-11/12 flex-col gap-5 rounded-lg bg-gray-100 p-6 shadow-md sm:w-[350px]">
        {verifyEmailMutation.isPending && (
          <div className="flex flex-row items-center justify-center gap-6 text-center">
            <span>Verifying email...</span>
            <Spinner size="md" />
          </div>
        )}

        {verifyEmailMutation.isError && (
          <div className="text-center text-xl font-light text-red-700">
            Verification Failed!
            <div className="mt-3 text-sm font-normal text-gray-600">
              {verifyEmailMutation.error.message}
              <br />
              Try requesting a new verification email from your account page.
            </div>
          </div>
        )}

        {verifyEmailMutation.isSuccess && (
          <div className="text-center text-xl font-light text-green-700">
            Email Verified! ✓
            <div className="mt-3 text-sm font-normal text-gray-600">
              Redirecting to home in {countdown}...
            </div>
          </div>
        )}

        <div>
          <hr />
          <div className="mt-3 flex flex-row justify-between text-sm text-cyan-600">
            <Link to="/login">Login</Link>
            <Link to={`/${episodeId}/home`}>Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerify;
