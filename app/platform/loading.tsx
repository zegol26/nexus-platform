import { EngagingLoader } from "@/components/layout/EngagingLoader";

export default function PlatformLoading() {
  return (
    <EngagingLoader
      title="Nexus Platform lagi nyalain layar"
      messages={[
        "Menarik data terbaru kamu...",
        "Aichan lagi cek pengingat hari ini...",
        "Menyusun dashboard biar enak dilihat...",
        "Sebentar ya, server lagi peregangan...",
      ]}
      fullScreen
    />
  );
}
