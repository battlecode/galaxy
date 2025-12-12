import type React from "react";
import { useState } from "react";
import {
  PageTitle,
  PageContainer,
} from "../components/elements/BattlecodeStyle";
import Input from "../components/elements/Input";
import TextArea from "../components/elements/TextArea";
import { AuthStateEnum, useCurrentUser } from "../contexts/CurrentUserContext";
import SectionCard from "../components/SectionCard";
import SelectMenu from "../components/elements/SelectMenu";
import type { Maybe } from "../utils/utilTypes";
import {
  GenderEnum,
  type CountryEnum,
  type PatchedUserPrivateRequest,
} from "../api/_autogen";
import { COUNTRIES } from "../api/apiTypes";
import { FIELD_REQUIRED_ERROR_MSG } from "../utils/constants";
import { type SubmitHandler, useForm } from "react-hook-form";
import Button from "../components/elements/Button";
import FormLabel from "../components/elements/FormLabel";
import {
  useDownloadResume,
  useUpdateCurrentUserInfo,
  useUpdateUserAvatar,
  useResumeUpload,
  useResendVerificationEmail,
} from "../api/user/useUser";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/query-core";
import UserChart from "components/compete/chart/UserChart";

interface FileInput {
  file: FileList;
}

const Account: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();
  const uploadAvatar = useUpdateUserAvatar({ episodeId }, queryClient);
  const uploadResume = useResumeUpload({ episodeId }, queryClient);
  const downloadResume = useDownloadResume({ episodeId });
  const { authState, user } = useCurrentUser();

  const { register: avatarRegister, handleSubmit: handleAvatarSubmit } =
    useForm<FileInput>();

  const { register: resumeRegister, handleSubmit: handleResumeSubmit } =
    useForm<FileInput>();

  const onAvatarSubmit: SubmitHandler<FileInput> = (data) => {
    if (uploadAvatar.isPending) return;
    uploadAvatar.mutate({ avatar: data.file[0] });
  };

  const onResumeSubmit: SubmitHandler<FileInput> = (data) => {
    if (uploadResume.isPending) return;
    uploadResume.mutate({ resume: data.file[0] });
  };

  return (
    <PageContainer>
      <PageTitle>User Settings</PageTitle>
      <div className="flex flex-1 flex-col gap-8 xl:max-w-4xl">
        <ProfileForm episodeId={episodeId} queryClient={queryClient} />
        <SectionCard
          title="File Upload"
          loading={authState === AuthStateEnum.LOADING}
        >
          <div className="flex flex-row gap-10 xl:flex-col">
            <form
              onSubmit={(e) => {
                void handleAvatarSubmit(onAvatarSubmit)(e);
              }}
            >
              <FormLabel label="Profile picture" />
              <input
                type="file"
                accept="image/*"
                className="w-full"
                {...avatarRegister("file", {
                  required: FIELD_REQUIRED_ERROR_MSG,
                })}
              />
              <Button
                className="mt-2"
                label="Save profile picture"
                type="submit"
                loading={uploadAvatar.isPending}
                disabled={uploadAvatar.isPending}
              />
            </form>

            <form
              onSubmit={(e) => {
                void handleResumeSubmit(onResumeSubmit)(e);
              }}
            >
              <FormLabel label="Resume" />
              <input
                type="file"
                accept=".pdf"
                className="w-full"
                {...resumeRegister("file", {
                  required: FIELD_REQUIRED_ERROR_MSG,
                })}
              />
              <Button
                className="mt-2"
                label="Save resume"
                type="submit"
                loading={uploadResume.isPending}
                disabled={uploadResume.isPending}
              />
              {user.data?.profile?.has_resume ?? false ? (
                <p className="text-sm">
                  Resume uploaded!{" "}
                  <button
                    className="text-cyan-600 hover:underline"
                    onClick={() => {
                      if (user.isSuccess)
                        downloadResume.mutate({ id: user.data.id });
                    }}
                  >
                    Download
                  </button>
                </p>
              ) : (
                <p className="text-sm">No resume uploaded.</p>
              )}
            </form>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Rating History"
        className="w-full flex-1"
        loading={user.isLoading}
      >
        {user.isSuccess && <UserChart userId={user.data.id} />}
      </SectionCard>
    </PageContainer>
  );
};

const ProfileForm: React.FC<{
  episodeId: string;
  queryClient: QueryClient;
}> = ({ episodeId, queryClient }) => {
  const { user } = useCurrentUser();
  const updateCurrentUser = useUpdateCurrentUserInfo(
    { episodeId },
    queryClient,
  );
  const resendEmailMutation = useResendVerificationEmail({ episodeId });

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<PatchedUserPrivateRequest>({
    defaultValues: {
      email: user.data?.email,
      first_name: user.data?.first_name,
      last_name: user.data?.last_name,
      profile: {
        school: user.data?.profile?.school,
        kerberos: user.data?.profile?.kerberos,
        biography: user.data?.profile?.biography,
      },
    },
  });

  const watchFirstName = watch("first_name");
  const watchLastName = watch("last_name");
  const [gender, setGender] = useState<Maybe<GenderEnum>>(
    user.data?.profile?.gender,
  );
  const [country, setCountry] = useState<Maybe<CountryEnum>>(
    user.data?.profile?.country,
  );

  const onProfileSubmit: SubmitHandler<PatchedUserPrivateRequest> = (data) => {
    updateCurrentUser.mutate({ patchedUserPrivateRequest: data });
  };

  return (
    <SectionCard title="Profile" className="max-w-5xl flex-1">
      <div className="flex flex-col lg:flex-row lg:gap-8">
        <div className="flex flex-col items-center gap-6 p-4">
          <img
            className="h-24 w-24 rounded-full bg-gray-400 lg:h-48 lg:w-48"
            src={
              user.data?.profile?.avatar_url ?? "/default_profile_picture.png"
            }
          />
          <div className="text-center text-xl font-semibold">
            {`${watchFirstName ?? ""} ${watchLastName ?? ""}`}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            void handleSubmit(onProfileSubmit)(e);
          }}
          className="flex flex-1 flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-5">
            <Input disabled label="Username" value={user.data?.username} />
            <Input
              required
              label="Email"
              errorMessage={errors.email?.message}
              {...register("email", { required: FIELD_REQUIRED_ERROR_MSG })}
            />
            {/* Warning about email change and resend verification button */}
            <div className="col-span-2">
              <p className="text-xs text-gray-500">
                Note: Changing your email will require re-verification.
              </p>
              {user.data?.email_verified === false && (
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-xs text-yellow-700">
                    Your email is not verified.
                  </p>
                  <Button
                    label="Resend Verification Email"
                    onClick={() => {
                      resendEmailMutation.mutate(undefined);
                    }}
                    loading={resendEmailMutation.isPending}
                    disabled={resendEmailMutation.isPending}
                    variant="dark"
                    className="text-xs"
                  />
                </div>
              )}
            </div>

            <Input
              required
              label="First name"
              errorMessage={errors.first_name?.message}
              {...register("first_name", {
                required: FIELD_REQUIRED_ERROR_MSG,
              })}
            />
            <Input
              required
              label="Last name"
              errorMessage={errors.last_name?.message}
              {...register("last_name", { required: FIELD_REQUIRED_ERROR_MSG })}
            />
            <SelectMenu<CountryEnum>
              required
              onChange={(newCountry) => {
                setCountry(newCountry);
                setValue("profile.country", newCountry);
              }}
              errorMessage={errors.profile?.country?.message}
              value={country}
              label="Country"
              placeholder="Select country"
              options={Object.entries(COUNTRIES).map(([code, name]) => ({
                value: code as CountryEnum,
                label: name,
              }))}
            />
            <Input label="School" {...register("profile.school")} />
            <Input label="Kerberos" {...register("profile.kerberos")} />
            <SelectMenu<GenderEnum>
              required
              onChange={(newGender) => {
                setGender(newGender);
                setValue("profile.gender", newGender);
              }}
              errorMessage={errors.profile?.gender?.message}
              value={gender}
              label="Gender identity"
              placeholder="Select gender"
              options={[
                { value: GenderEnum.F, label: "Female" },
                { value: GenderEnum.M, label: "Male" },
                { value: GenderEnum.N, label: "Non-binary" },
                {
                  value: GenderEnum.Star,
                  label: "Prefer to self describe",
                },
                { value: GenderEnum.QuestionMark, label: "Rather not say" },
              ]}
            />
            {gender === GenderEnum.Star && (
              <Input
                label="Self described gender identity"
                {...register("profile.gender_details")}
              />
            )}
          </div>

          <TextArea label="User biography" {...register("profile.biography")} />
          <Button
            className="mt-2"
            loading={updateCurrentUser.isPending}
            disabled={updateCurrentUser.isPending}
            label="Save"
            type="submit"
          />
        </form>
      </div>
    </SectionCard>
  );
};

export default Account;
