import { cn } from "@/lib/utils";

export const ColumnRight = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-12 lg:col-span-3 lg:col-start-4",
        className,
      )}
      {...props}
    />
  );
};
