import { muted } from "../../components/ui/tokens";

export const Ltr = ({ children }) => <bdi dir="ltr">{children}</bdi>;

export function Created({ iso, fmt }) {
  const exact = fmt.date.format(new Date(iso));

  return (
    <time dateTime={iso} title={exact} className="block leading-tight">
      <span className="font-medium">{fmt.fromNow(iso)}</span>
      <span className={`block text-xs ${muted}`}>{exact}</span>
    </time>
  );
}
