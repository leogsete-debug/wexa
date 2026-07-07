export type MediaFileType = "image" | "video" | "pdf" | "logo" | "other";
export type MediaFolder = "images" | "videos" | "pdfs" | "logos";

export type MediaItem = {
  id: string;
  name: string | null;
  file_name: string | null;
  file_type: MediaFileType | string | null;
  mime_type: string | null;
  file_url: string | null;
  folder: MediaFolder | string | null;
  size: number | null;
  alt_text: string | null;
  created_at: string;
  updated_at: string;
};

export type MediaPayload = {
  name: string;
  file_name: string;
  file_type: MediaFileType;
  mime_type: string;
  file_url: string;
  folder: MediaFolder;
  size: number;
  alt_text: string | null;
};
