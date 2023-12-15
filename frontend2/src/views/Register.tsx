import React, { useEffect, useState } from "react";
import Input from "../components/elements/Input";
import Button from "../components/elements/Button";
import { type SubmitHandler, useForm } from "react-hook-form";
import { AuthStateEnum, useCurrentUser } from "../contexts/CurrentUserContext";
import SelectMenu from "../components/elements/SelectMenu";
import { type Maybe } from "../utils/utilTypes";
import {
  GenderEnum,
  type CountryEnum,
  type UserCreateRequest,
} from "../api/_autogen";
import { COUNTRIES } from "../api/apiTypes";
import { FIELD_REQUIRED_ERROR_MSG } from "../utils/constants";
import { useNavigate } from "react-router-dom";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { useCreateUser } from "../api/user/useUser";
import { useQueryClient } from "@tanstack/react-query";

const Register: React.FC = () => {
  const { authState } = useCurrentUser();
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();
  const createUser = useCreateUser({ episodeId }, queryClient);
  const navigate = useNavigate();

  const {
    register,
    watch,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<UserCreateRequest>();
  const [gender, setGender] = useState<Maybe<GenderEnum>>();
  const [country, setCountry] = useState<Maybe<CountryEnum>>();
  const watchSchool = watch("profile.school");

  useEffect(() => {
    // redirect to home if already logged in
    if (authState === AuthStateEnum.AUTHENTICATED) {
      navigate(episodeId !== undefined ? `/${episodeId}/home` : "/");
    }
  }, [authState]);

  const onSubmit: SubmitHandler<UserCreateRequest> = async (data) => {
    if (gender === undefined || country === undefined) {
      return;
    }
    await createUser.mutateAsync({ userCreateRequest: data });
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-tr from-cyan-200 to-cyan-700 p-2">
      <div className="flex flex-1 items-end text-center font-display text-5xl tracking-wide text-white sm:text-6xl">
        BATTLECODE
      </div>
      {/* https://github.com/orgs/react-hook-form/discussions/8622 */}
      <form
        /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
        onSubmit={async (event) => {
          // validate gender and country
          await handleSubmit(onSubmit)(event);
          if (gender === undefined) {
            setError("profile.gender", { message: FIELD_REQUIRED_ERROR_MSG });
          }
          if (country === undefined) {
            setError("profile.country", { message: FIELD_REQUIRED_ERROR_MSG });
          }
        }}
        className="m-6 flex w-11/12 flex-col gap-5 rounded-lg bg-gray-100 p-6 shadow-md sm:w-[550px]"
      >
        <Input
          required
          placeholder="battlecode_player_6.9610"
          label="Username"
          errorMessage={errors.username?.message}
          {...register("username", { required: FIELD_REQUIRED_ERROR_MSG })}
        />
        <Input
          required
          placeholder="************"
          label="Password"
          type="password"
          errorMessage={errors.password?.message}
          {...register("password", { required: FIELD_REQUIRED_ERROR_MSG })}
        />
        <Input
          required
          placeholder="player@example.com"
          label="Email"
          type="email"
          errorMessage={errors.email?.message}
          {...register("email", { required: FIELD_REQUIRED_ERROR_MSG })}
        />
        <div className="grid grid-cols-2 gap-5">
          <Input
            className="flex-grow basis-0"
            required
            placeholder="Tim"
            label="First name"
            errorMessage={errors.first_name?.message}
            {...register("first_name", { required: FIELD_REQUIRED_ERROR_MSG })}
          />
          <Input
            className="flex-grow basis-0"
            required
            placeholder="Beaver"
            label="Last name"
            errorMessage={errors.last_name?.message}
            {...register("last_name", { required: FIELD_REQUIRED_ERROR_MSG })}
          />
        </div>
        {/* begin profile fields */}
        <div className="grid grid-cols-2 gap-5">
          <SelectMenu<CountryEnum>
            required
            onChange={(newCountry) => {
              setCountry(newCountry);
              setValue("profile.country", newCountry);
              clearErrors("profile.country");
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
          <Input
            placeholder="MIT"
            label="School"
            {...register("profile.school")}
          />
        </div>

        {["mit", "massachusetts institute of technology", "m.i.t."].includes(
          watchSchool?.toLowerCase() ?? "",
        ) && (
          <Input
            placeholder="timthebeaver"
            label="Kerberos"
            {...register("profile.kerberos")}
          />
        )}

        <div className="grid grid-cols-2 gap-5">
          <SelectMenu<GenderEnum>
            required
            onChange={(newGender) => {
              setGender(newGender);
              setValue("profile.gender", newGender);
              clearErrors("profile.gender");
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
        <Button
          className="mt-1"
          loading={createUser.isPending}
          disabled={createUser.isPending || !isDirty}
          fullWidth
          label="Register"
          type="submit"
          variant="dark"
        />
      </form>
      <div className="flex-1" />
    </div>
  );
};

export default Register;
