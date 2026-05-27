import { getCompanyColor } from "../constants/companyColors";

interface FallbackAvatarProps {
  name: string;
  company: string;
  className?: string;
}

export function FallbackAvatar({ name, company, className = "" }: FallbackAvatarProps) {
  const color = getCompanyColor(company);
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={`flex items-center justify-center text-2xl font-bold select-none tracking-tight ${className}`}
      style={{ backgroundColor: `${color.bg}18`, color: color.bg === "#e8e8ed" ? "#555" : color.bg }}
    >
      {initials}
    </div>
  );
}
