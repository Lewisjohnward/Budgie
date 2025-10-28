import { ReactNode } from "react";
import { Separator } from "./Separator";
import clsx from "clsx";

type AccountLayoutProps = {
  alert?: ReactNode;
  header: ReactNode;
  info: ReactNode;
  actions: ReactNode;
  table: ReactNode;
};

export function AccountLayout({
  alert,
  header,
  info,
  actions,
  table,
}: AccountLayoutProps) {
  return (
    <div className={clsx("flex flex-col h-full space-y-1", !alert && "pt-4")}>
      {alert}
      <Container>{header}</Container>
      <Separator />
      <Container>{info}</Container>
      <Separator />
      <div className="px-2 py-1">{actions}</div>
      {table}
    </div>
  );
}

function Container({ children }: { children: ReactNode }) {
  return <div className="px-4 py-2">{children}</div>;
}
