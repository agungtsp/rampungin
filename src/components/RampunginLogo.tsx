import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & {
  title?: string;
};

/** Rampungin brand mark — blue gradient tile with R + prompt brace + spark. */
export function RampunginLogo({
  title = "Rampungin",
  className,
  ...props
}: Props) {
  const id = "rampungin-logo";
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className}
      {...props}
    >
      <defs>
        <linearGradient
          id={`${id}-g`}
          x1="8"
          y1="4"
          x2="56"
          y2="60"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1e40af" />
          <stop offset="0.45" stopColor="#2563eb" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient
          id={`${id}-shine`}
          x1="12"
          y1="8"
          x2="40"
          y2="36"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${id}-g)`} />
      <path
        d="M10 12c8-6 20-4 24 2"
        stroke={`url(#${id}-shine)`}
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M18 20c-3.5 0-5.5 2.2-5.5 5.2v4.2c0 1.6-1 2.6-2.5 2.6 1.5 0 2.5 1 2.5 2.6v4.2c0 3 2 5.2 5.5 5.2"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <path
        d="M28 42V22h9.2c4.8 0 7.8 2.6 7.8 6.4 0 3-1.7 5.2-4.5 6.1L46 42h-5.2l-5.1-7.2H32.8V42H28zm4.8-11.4h4.2c2.3 0 3.7-1.2 3.7-3.1s-1.4-3.1-3.7-3.1h-4.2v6.2z"
        fill="#fff"
      />
      <path
        d="M48.5 18.5l1.1 2.8 2.8 1.1-2.8 1.1-1.1 2.8-1.1-2.8-2.8-1.1 2.8-1.1 1.1-2.8z"
        fill="#fde68a"
      />
    </svg>
  );
}
