import { cn } from "@/core/lib/utils";

interface AccountSettingsSectionProps {
  title: string;
  children: React.ReactNode;
  titleClassName?: string;
}

export default function AccountSettingsSection({ title, children, titleClassName }: AccountSettingsSectionProps) {
  return (
    <>
      <div className="py-8 space-y-4">
        <p className={cn("text-2xl font-[500]", titleClassName)}>{title}</p>
        {children}
      </div>
      <div className="border-t border-gray-400" />
    </>
  );
}
