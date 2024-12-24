import { PageTitle } from "components/elements/BattlecodeStyle";
import Markdown from "components/elements/Markdown";
import SectionCard from "components/SectionCard";

const ENVIRONMENT = `
Maintaining a safe and inclusive environment for competitors is a top priority for Battlecode.
Battlecode strictly follows [MIT's Policies](https://policies-procedures.mit.edu/) on responsible and ethical conduct.

If someone makes you or anyone else feel unsafe or unwelcome, please report it to Teh Devs as soon as possible at [battlecode@mit.edu](mailto:battlecode@mit.edu).

Harassment and other code of conduct violations reduce the value of the competition for everyone. People like you make our community a better place, and we want you to be happy here.
`;

const HARASSMENT = `
Battlecode is dedicated to providing a harassment-free experience for everyone, regardless of gender, gender identity and expression, sexual orientation, disability, physical appearance, body size, race, age, religion, or nationality.

We do not tolerate harassment of competitors in any form. Participants asked to stop any harassing behavior are expected to comply immediately.

If you are being harassed, notice that someone else is being harassed, or have any other concerns, please contact Teh Devs immediately. If a participant engages in harassing behavior, Teh Devs may take any action they deem appropriate. This includes warning the offender and expulsion from the event with no prize (if applicable).
`;

const BUG_EXPLOITATION = `
Battlecode is a rapidly-growing competition with many infrastructural challenges. Let us know as soon as possible upon discovery of a potential security issue. Knowingly exposing vulnerabilities to the public as anything more than a minimal proof of concept is not allowed.

Intentionally exploiting bugs that compromise the fairness of scrimmages and tournaments, or the security of the competition, is not tolerated.
`;

const ACADEMIC_MISCONDUCT = `
Academic misconduct is conduct by which a person misrepresents their academic accomplishments, or impedes others' opportunities of being judged fairly for their academic work. This includes but is not limited to plagiarism and knowingly allowing another person to represent your work as their own.

Particularly, sharing bot code between teams falls under this clause, and is thus not allowed (even if no team ends up using the shared code in their final submission). Open-sourcing tools, such as visualizers or map makers, is, however, explicitly allowed. If anything in this policy is unclear, please reach out to us at [battlecode@mit.edu](mailto:battlecode@mit.edu).
`;

const CodeOfConduct: React.FC = () => (
  <div className="flex h-full w-full flex-col overflow-y-auto  p-6">
    <div className="flex flex-1 flex-col gap-8">
      <PageTitle>Code of Conduct</PageTitle>
      <SectionCard title="Environment">
        <Markdown text={ENVIRONMENT} />
      </SectionCard>

      <SectionCard title={"Harassment"}>
        <Markdown text={HARASSMENT} />
      </SectionCard>

      <SectionCard title={"Bug Exploitation"}>
        <Markdown text={BUG_EXPLOITATION} />
      </SectionCard>

      <SectionCard title={"Academic Misconduct"}>
        <Markdown text={ACADEMIC_MISCONDUCT} />
      </SectionCard>
    </div>
  </div>
);

export default CodeOfConduct;
