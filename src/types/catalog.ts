export type CatalogStatus = "published" | "draft" | "archived";

export type Catalog = {
  id: string;
  title: string;
  description: string | null;
  pdf_url: string | null;
  file_name: string | null;
  file_size: number | null;
  cover_image_url: string | null;
  language: string;
  status: CatalogStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CatalogPayload = {
  title: string;
  description: string | null;
  pdf_url: string | null;
  file_name: string | null;
  file_size: number | null;
  cover_image_url: string | null;
  language: string;
  status: CatalogStatus;
  is_active: boolean;
};
