import { EngagingLoader } from "@/components/layout/EngagingLoader";

export default function NihongoLoading() {
  return (
    <div className="min-h-[60vh] bg-[#0f0f12]">
      <EngagingLoader
        theme="squid"
        title="Nexus AI Nihongo lagi siap-siap"
        messages={[
          "Lagi nyiapin pelajaran kamu...",
          "Aichan lagi nulis kanji yang rapi 📝",
          "Mengasah pertanyaan yang pas buat hari ini...",
          "Sebentar ya, AI lagi ngeliat progres kamu kemarin...",
          "Mengetuk pintu ruang kelas digital...",
        ]}
        fullScreen
      />
    </div>
  );
}
