interface PageTitleProps {
  children?: React.ReactNode;
  variant?: string;
}

const variants: Record<string, string> = {
  "": "",
  bold: "font-bold",
  thin: "font-thin",
};

const PageTitle: React.FC<PageTitleProps> = ({
  children,
  variant = "",
}: PageTitleProps) => {
  const variantStyle = `${variants[variant]}`;

  return (
    <h1 className={`mb-5 text-3xl leading-7 text-gray-900 ${variantStyle}`}>
      {children}
    </h1>
  );
};

export default PageTitle;
