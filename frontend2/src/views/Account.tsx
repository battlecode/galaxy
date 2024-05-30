import React, { type EventHandler, useState } from "react";
import { PageTitle } from "../components/elements/BattlecodeStyle";
import Input from "../components/elements/Input";
import TextArea from "../components/elements/TextArea";
import Loading from "../components/Loading";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import SectionCard from "../components/SectionCard";
import SelectMenu from "../components/elements/SelectMenu";
import { type Maybe } from "../utils/utilTypes";
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
  useAvatarUpload,
  useResumeUpload,
} from "../api/user/useUser";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { useQueryClient } from "@tanstack/react-query";
import { type QueryClient } from "@tanstack/query-core";

interface FileInput {
  file: FileList;
}

const Account: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();
  const uploadAvatar = useAvatarUpload({ episodeId }, queryClient);
  const uploadResume = useResumeUpload({ episodeId }, queryClient);
  const downloadResume = useDownloadResume({ episodeId });
  const { user } = useCurrentUser();


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

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const onResumeDownload: EventHandler<React.MouseEvent<HTMLButtonElement>> = async () => {
    await downloadResume.mutateAsync({ id: user?.id ?? 0 });
  };

  return (
    <div className="p-6">
      <PageTitle>User Settings</PageTitle>
      <div className="flex flex-col gap-8 xl:flex-row">
        {user !== undefined ? (
          <ProfileForm episodeId={episodeId} queryClient={queryClient} />
        ) : (
          <Loading />
        )}

        <SectionCard title="File Upload">
          <div className="flex flex-row gap-10 xl:flex-col ">
            <form
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onSubmit={handleAvatarSubmit(onAvatarSubmit)}
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
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onSubmit={handleResumeSubmit(onResumeSubmit)}
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
              {user?.profile?.has_resume ?? false

                ? (<p className="text-sm">
                  Resume uploaded! <button className="text-cyan-600 hover:underline"
                    onClick={onResumeDownload}>Download</button>
                </p>)
                : <p className="text-sm">No resume uploaded.</p>
              }
            </form>
          </div>
        </SectionCard>
      </div >
    </div >
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

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<PatchedUserPrivateRequest>({
    defaultValues: {
      email: user?.email,
      first_name: user?.first_name,
      last_name: user?.last_name,
      profile: {
        school: user?.profile?.school,
        kerberos: user?.profile?.kerberos,
        biography: user?.profile?.biography,
      },
    },
  });

  const watchFirstName = watch("first_name");
  const watchLastName = watch("last_name");
  const [gender, setGender] = useState<Maybe<GenderEnum>>(
    user?.profile?.gender,
  );
  const [country, setCountry] = useState<Maybe<CountryEnum>>(
    user?.profile?.country,
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
            src={user?.profile?.avatar_url}
          />
          <div className="text-center text-xl font-semibold">
            {`${watchFirstName ?? ""} ${watchLastName ?? ""}`}
          </div>
        </div>

        <form
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={handleSubmit(onProfileSubmit)}
          className="flex flex-1 flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-5">
            <Input disabled label="Username" value={user?.username} />
            <Input
              required
              label="Email"
              errorMessage={errors.email?.message}
              {...register("email", { required: FIELD_REQUIRED_ERROR_MSG })}
            />
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
