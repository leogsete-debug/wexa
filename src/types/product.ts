export type ProductStatus = "published" | "draft" | "hidden";

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  short_description: string | null;
  full_description: string | null;
  material: string | null;
  origin: string | null;
  status: ProductStatus;
  featured: boolean;
  sort_order: number;
  main_image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductPayload = {
  name: string;
  slug: string;
  category: string | null;
  short_description: string | null;
  full_description: string | null;
  material: string | null;
  origin: string | null;
  status: ProductStatus;
  featured: boolean;
  sort_order: number;
  main_image_url: string | null;
};
