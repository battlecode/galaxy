import React from "react";
import type { Key } from "react";
import Markdown from "./elements/Markdown";
import SectionCard from "./SectionCard";

interface OptionalSectionCardMarkdownProps<T extends Key> {
  children?: React.ReactNode;
  title: T;
  textRecord: Partial<Record<T, string>>;
}

const OptionalSectionCardMarkdown: React.FC<
  OptionalSectionCardMarkdownProps<string>
> = <T extends string>({
  children,
  title,
  textRecord,
}: OptionalSectionCardMarkdownProps<T>) => {
  if (textRecord[title] !== undefined) {
    return (
      <SectionCard title={title}>
        <Markdown text={textRecord[title] ?? ""} />
        {children}
      </SectionCard>
    );
  } else {
    return null;
  }
};

export default OptionalSectionCardMarkdown;
