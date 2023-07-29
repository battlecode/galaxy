import React, { useState } from "react";
import { Auth } from "../utils/api";
import Input from "../components/elements/Input";
import Button from "../components/elements/Button";
import { type SubmitHandler, useForm, Controller } from "react-hook-form";
import { useCurrentUser } from "../contexts/CurrentUserContext";
import {
  type Gender,
  GenderEnum,
  type CreateUserInput,
} from "../utils/apiTypes";
import Dropdown from "../components/elements/Dropdown";

const Register: React.FC = () => {
  const { setUser } = useCurrentUser();
  const { register, handleSubmit, setValue } = useForm<CreateUserInput>();
  const [gender, setGender] = useState<Gender | undefined>(undefined);

  const onSubmit: SubmitHandler<CreateUserInput> = async (data) => {
    // https://stackoverflow.com/a/72815057
    console.log("submitted", data);
    try {
      const newUser = await Auth.register(data);
      setUser(newUser);
      console.log("logged in successfully");
    } catch (error) {
      console.log("failure to register", error);
    }
  };
  return (
    <div className="h-screen flex flex-col items-center bg-gray-50">
      <span className="text-center">BATTLECODE</span>
      {/* https://github.com/orgs/react-hook-form/discussions/8622 */}
      <form
        /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col w-96 h- gap-3 p-4 bg-gray-100"
      >
        <Input label="Username" {...register("username")} />
        <Input label="Password" {...register("password")} type="password" />
        <Input label="Email" {...register("email")} />
        <Input label="First name" {...register("firstName")} />
        <Input label="Last name" {...register("lastName")} />
        {/* begin profile fields */}
        <Input label="School" {...register("profile.school")} />
        <Dropdown
          onChange={(gender: string) => {
            setGender(gender as Gender);
            setValue("profile.gender", gender as Gender);
          }}
          value={gender}
          label="Gender"
          placeholder="select"
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

        <Input label="Country" {...register("profile.country")} />
        <Button label="Submit" type="submit" variant="dark" />
      </form>
    </div>
  );
};

export default Register;
