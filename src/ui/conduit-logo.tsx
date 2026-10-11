import conduitLogoUrl from "#realworld-submodule/assets/media/conduit-logo.svg";

interface ConduitLogoProps {
  className: string;
}

export function ConduitLogo({ className }: ConduitLogoProps) {
  return <img src={conduitLogoUrl} alt="Conduit" className={className} />;
}
