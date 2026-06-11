import React from "react";

interface SparkleIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export function SparkleIcon({
  size = 24,
  className,
  role,
  ...props
}: SparkleIconProps) {
  const hasAccessibleName =
    !!role || !!props["aria-label"] || !!props["aria-labelledby"];
  const ariaHidden = props["aria-hidden"] ?? (hasAccessibleName ? undefined : true);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden={ariaHidden}
      role={role}
      {...props}
    >
      <path d="M12 2C12 2 13.5 10.5 22 12C13.5 13.5 12 22 12 22C12 22 10.5 13.5 2 12C10.5 10.5 12 2 12 2Z" />
    </svg>
  );
}
