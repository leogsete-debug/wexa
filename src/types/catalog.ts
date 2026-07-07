export type CatalogStatus = "published" | "draft" | "hidden";

export type Catalog = {
  id: string;
  title: string;
  description: string | null;
  pdf_url: string | null;
  cover_image_url: string | null;
  language: string;
  status: CatalogStatus;
  created_at: string;
  updated_at: string;
};

export type CatalogPayload = {
  title: string;
  description: string | null;
  pdf_url: string | null;
  cover_image_url: string | null;
  language: string;
  status: CatalogStatus;
};
