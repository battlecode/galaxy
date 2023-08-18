import React from "react";
import * as Auth from "../utils/auth";
import Input from "../components/elements/Input";
import Button from "../components/elements/Button";
import { type SubmitHandler, useForm } from "react-hook-form";

interface LoginFormInput {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const { register, handleSubmit } = useForm<LoginFormInput>();
  const onSubmit: SubmitHandler<LoginFormInput> = async (data) => {
    console.log("submitted");
    try {
      await Auth.login(data.username, data.password);
    } catch (error) {}
    console.log("logged in successfully");
  };
  return (
    <div className="flex h-screen flex-col items-center bg-gray-50">
      <span className="text-center">BATTLECODE</span>
      {/* https://github.com/orgs/react-hook-form/discussions/8622 */}
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-96 flex-col gap-3 bg-gray-100 p-4"
      >
        <Input label="Username" {...register("username")} />
        <Input label="Password" {...register("password")} type="password" />
        <Button label="Submit" type="submit" variant="dark" />
      </form>
    </div>
  );
};

export default Login;
