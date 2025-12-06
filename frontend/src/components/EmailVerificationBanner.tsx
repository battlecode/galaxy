import type React from "react";
import { useState } from "react";
import Button from "./elements/Button";
import { useResendVerificationEmail } from "../api/user/useUser";
import { useEpisodeId } from "../contexts/EpisodeContext";

interface EmailVerificationBannerProps {
  email: string;
}

const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({
  email,
}) => {
  const [dismissed, setDismissed] = useState(false);
  const { episodeId } = useEpisodeId();
  const resendEmailMutation = useResendVerificationEmail({ episodeId });

  if (dismissed) return null;

  return (
    <div className="rounded border-l-4 border-yellow-500 bg-yellow-100 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-start">
          <div className="flex-shrink-0">
            <svg
              className="mt-0.5 h-5 w-5 text-yellow-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-800">
              <strong className="font-semibold">
                Verify your email address
              </strong>{" "}
              to access all features. We sent a verification link to{" "}
              <strong className="font-semibold">{email}</strong>.
            </p>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <Button
            label="Resend Email"
            onClick={() => {
              resendEmailMutation.mutate(undefined);
            }}
            loading={resendEmailMutation.isPending}
            disabled={resendEmailMutation.isPending}
            variant="dark"
            className="whitespace-nowrap"
          />
          <button
            onClick={() => {
              setDismissed(true);
            }}
            className="p-1 text-yellow-700 hover:text-yellow-900"
            aria-label="Dismiss"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
