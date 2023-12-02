import React from "react";
import { PageTitle } from "../components/elements/BattlecodeStyle";
import Input from "../components/elements/Input";
import TextArea from "../components/elements/TextArea";

import { useCurrentUser } from "../contexts/CurrentUserContext";
import SectionCard from "../components/SectionCard";
import SelectMenu from "../components/elements/SelectMenu";
import { COUNTRIES } from "../utils/apiTypes";

import { GenderEnum, type CountryEnum } from "../utils/types";
import Button from "../components/elements/Button";
import FormLabel from "../components/elements/FormLabel";

const Account: React.FC = () => {
  const { user } = useCurrentUser();

  return (
    <div className="p-6">
      <PageTitle>User Settings</PageTitle>
      <div className="flex flex-col gap-8 xl:flex-row">
        <SectionCard title="Profile" className="flex-1 max-w-5xl">
          <div className="flex flex-col lg:flex-row lg:gap-8">
            <div className="flex flex-col items-center gap-6 p-4">
              <img
                className="h-24 w-24 rounded-full bg-gray-400 lg:h-48 lg:w-48"
                src={user?.profile?.avatar_url}
              />
              <div className="text-center text-xl font-semibold">
                {`${user?.first_name ?? ""} ${user?.last_name ?? ""}`}
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-4">
              <div className="grid grid-cols-2 gap-5">
                <Input disabled label="Username" value={user?.username} />
                <Input required label="Email" />
                <Input required label="First name" />
                <Input required label="Last name" />
                <SelectMenu<CountryEnum>
                  required
                  label="Country"
                  placeholder="Select country"
                  options={Object.entries(COUNTRIES).map(([code, name]) => ({
                    value: code as CountryEnum,
                    label: name,
                  }))}
                />
                <Input label="School" />
                <Input label="Kerberos" />
                <SelectMenu<GenderEnum>
                  required
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
              </div>

              <TextArea label="User biography" />
              <Button className="mb-10 mt-2" label="Save" type="submit" />

            </div>
          </div>
        </SectionCard>

        <SectionCard title="File Upload">
          <div className="flex flex-row gap-10 xl:flex-col ">
            <div>
              <FormLabel label="Profile picture" />
              <input type="file" accept="image/*" className="w-full" />
              <Button
                className="mt-2"
                label="Save profile picture"
                type="submit"
              />
            </div>

            <div>
              <FormLabel label="Resume" />
              <input type="file" accept=".pdf" className="w-full" />
              <Button className="mt-2" label="Save resume" type="submit" />
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default Account;
