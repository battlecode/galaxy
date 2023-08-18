import React, { useState } from "react";
import * as Auth from "../utils/auth";
import Input from "../components/elements/Input";
import Button from "../components/elements/Button";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import {
  GenderEnum,
  type Country,
  type CreateUserInput,
  COUNTRIES,
} from "../utils/apiTypes";
import SelectMenu from "../components/elements/SelectMenu";
import { type Maybe } from "../utils/utilTypes";

const REQUIRED_ERROR_MSG = "This field is required.";

const Register: React.FC = () => {
  const { login } = useCurrentUser();
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CreateUserInput>();
  const [gender, setGender] = useState<Maybe<GenderEnum>>();
  const [country, setCountry] = useState<Maybe<Country>>();

  const onSubmit: SubmitHandler<CreateUserInput> = async (data) => {
    if (gender === undefined || country === undefined) {
      return;
    }
    try {
      const newUser = await Auth.register(data);
      login(newUser);
      console.log("logged in successfully");
    } catch (error) {
      console.log("failure to register", error);
    }
  };
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-tr from-cyan-200 to-cyan-700 p-2">
      <h2 className="flex flex-1 items-end text-center font-display text-5xl tracking-wide text-white sm:text-6xl">
        BATTLECODE
      </h2>
      {/* https://github.com/orgs/react-hook-form/discussions/8622 */}
      <form
        /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
        onSubmit={async (event) => {
          // validate gender and country
          await handleSubmit(onSubmit)(event);
          if (gender === undefined) {
            setError("profile.gender", { message: REQUIRED_ERROR_MSG });
          }
          if (country === undefined) {
            setError("profile.country", { message: REQUIRED_ERROR_MSG });
          }
        }}
        className="m-6 w-11/12 sm:w-[550px] flex flex-col gap-5 rounded-lg bg-gray-100 p-6 shadow-md"
      >
        <Input
          required
          placeholder="battlecode_player_6.9610"
          label="Username"
          errorMessage={errors.username?.message}
          {...register("username", { required: REQUIRED_ERROR_MSG })}
        />
        <Input
          required
          placeholder="************"
          label="Password"
          type="password"
          errorMessage={errors.password?.message}
          {...register("password", { required: REQUIRED_ERROR_MSG })}
        />
        <Input
          required
          placeholder="player@example.com"
          label="Email"
          type="email"
          errorMessage={errors.email?.message}
          {...register("email", { required: REQUIRED_ERROR_MSG })}
        />
        <div className="grid grid-cols-2 gap-5">
          <Input
            className="flex-grow basis-0"
            required
            placeholder="Tim"
            label="First name"
            errorMessage={errors.firstName?.message}
            {...register("firstName", { required: REQUIRED_ERROR_MSG })}
          />
          <Input
            className="flex-grow basis-0"
            required
            placeholder="Beaver"
            label="Last name"
            errorMessage={errors.lastName?.message}
            {...register("lastName", { required: REQUIRED_ERROR_MSG })}
          />
        </div>
        {/* begin profile fields */}
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
              { value: GenderEnum.FEMALE, label: "Female" },
              { value: GenderEnum.MALE, label: "Male" },
              { value: GenderEnum.NONBINARY, label: "Non-binary" },
              {
                value: GenderEnum.SELF_DESCRIBED,
                label: "Prefer to self describe",
              },
              { value: GenderEnum.RATHER_NOT_SAY, label: "Rather not say" },
            ]}
          />
          <Input
            placeholder="MIT"
            label="School"
            {...register("profile.school")}
          />
        </div>
        <SelectMenu<Country>
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
            value: code as Country,
            label: name,
          }))}
        />
        <Button
          className="mt-1"
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
