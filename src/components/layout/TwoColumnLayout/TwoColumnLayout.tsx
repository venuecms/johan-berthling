import { cn } from "@/lib/utils";

export const TwoColumnLayout = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        // 8-column grid with 20px gutters from lg up; stacked below that.
        "flex w-full flex-col gap-12 py-6 lg:grid lg:grid-cols-8 lg:gap-x-5 lg:gap-y-12 lg:py-24",
        className,
      )}
    >
      {children}
    </div>
  );
};
