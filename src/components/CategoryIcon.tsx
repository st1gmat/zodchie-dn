type IconProps = {
  className?: string;
};

const base = {
  viewBox: "0 0 32 32",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function FaucetIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M9 22V11a3 3 0 0 1 3-3h6" />
      <path d="M18 8h5a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2" />
      <path d="M21 13v4a4 4 0 0 1-4 4" />
      <path d="M9 22h4" />
      <path d="M9 22a4 4 0 1 1-4-4" strokeOpacity={0.5} />
    </svg>
  );
}

function ToiletIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="9" y="6" width="9" height="5" rx="1.5" />
      <path d="M9 11v3.5a5 5 0 0 0 5 5h0a5 5 0 0 0 5-5V11" />
      <path d="M11 19.5 9.5 26h9L17 19.5" />
      <path d="M19.5 8h2.5" />
    </svg>
  );
}

function BathIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M5 17h22v2a6 6 0 0 1-6 6H11a6 6 0 0 1-6-6v-2Z" />
      <path d="M5 17v-3a3 3 0 0 1 3-3h1" />
      <path d="M9 11V8.5A2.5 2.5 0 0 1 11.5 6h0A2.5 2.5 0 0 1 14 8.5" />
      <path d="M9 25v2M21 25v2" />
    </svg>
  );
}

function SinkIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M5 14h22" />
      <path d="M7 14v4a9 9 0 0 0 18 0v-4" />
      <path d="M16 14V9" />
      <path d="M13 6h6" />
      <path d="M16 22v3" />
    </svg>
  );
}

function PipeIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="4" y="13" width="13" height="6" rx="1" />
      <path d="M17 15h4a3 3 0 0 1 3 3v6" />
      <circle cx="24" cy="24" r="2.2" />
      <path d="M7 13v-3M14 13v-3" />
    </svg>
  );
}

function HeatingIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="6" y="6" width="20" height="20" rx="2" />
      <path d="M11 6v20M16 6v20M21 6v20" />
    </svg>
  );
}

function FurnitureIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="6" y="6" width="20" height="11" rx="1.5" />
      <circle cx="22" cy="11.5" r="2" />
      <path d="M8 17v9M24 17v9" />
    </svg>
  );
}

function FittingsIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M12 8a4 4 0 0 1 5.5 5.5l8 8-2.5 2.5-8-8A4 4 0 0 1 9.5 10.5L6 7l3-3 3.5 3.5Z" />
    </svg>
  );
}

const icons: Record<string, (props: IconProps) => React.JSX.Element> = {
  faucets: FaucetIcon,
  toilets: ToiletIcon,
  baths: BathIcon,
  sinks: SinkIcon,
  pipes: PipeIcon,
  heating: HeatingIcon,
  furniture: FurnitureIcon,
  fittings: FittingsIcon,
};

export function CategoryIcon({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const Icon = icons[id];
  if (!Icon) return null;
  return <Icon className={className} />;
}