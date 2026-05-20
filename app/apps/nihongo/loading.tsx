import { EngagingLoader } from "@/components/layout/EngagingLoader";

export default function NihongoLoading() {
  return (
    <EngagingLoader
      title="Nexus Talenta Indonesia Academy lagi siap-siap"
      messages={[
        "Lagi nyiapin pelajaran kamu...",
        "Aichan lagi nulis kanji yang rapi...",
        "Mengasah pertanyaan yang pas buat hari ini...",
        "Sebentar ya, AI lagi ngeliat progres kamu kemarin...",
        "Mengetuk pintu ruang kelas digital...",
      ]}
      fullScreen
    />
  );
}
