import { AiChanWidget } from "@/components/platform/AiChanWidget";

export default function AppsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AiChanWidget />
    </>
  );
}
