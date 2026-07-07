import type { SiteSettings } from "@/types/site-settings";

type WhatsappButtonProps = {
  settings: SiteSettings;
};

export default function WhatsappButton({ settings }: WhatsappButtonProps) {
  return (
    <a
      href={settings.whatsapp_url}
      aria-label="Falar com a TopMax Export pelo WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_20px_55px_rgba(37,211,102,0.42)] transition duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-[#1ebe5d] hover:shadow-[0_24px_70px_rgba(37,211,102,0.52)] motion-safe:animate-[whatsappPulse_2.8s_ease-in-out_infinite] sm:bottom-7 sm:right-7"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        className="h-8 w-8"
        fill="currentColor"
      >
        <path d="M16.02 3.2A12.75 12.75 0 0 0 5.16 22.6L3.7 28.8l6.35-1.48a12.73 12.73 0 0 0 5.97 1.49h.01A12.8 12.8 0 0 0 16.02 3.2Zm0 23.43h-.01a10.56 10.56 0 0 1-5.38-1.47l-.39-.23-3.75.88.9-3.66-.25-.38a10.57 10.57 0 1 1 8.88 4.86Zm5.8-7.91c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.19.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.88-1.76-2.19-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.71-.98-2.34-.26-.62-.52-.53-.71-.54h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.08-1.11 2.64 0 1.56 1.14 3.06 1.3 3.27.16.21 2.24 3.42 5.43 4.79.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.15-1.51.27-.74.27-1.37.19-1.51-.08-.13-.29-.21-.61-.37Z" />
      </svg>
    </a>
  );
}
