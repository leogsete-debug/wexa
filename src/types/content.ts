export type CompanyContent = {
  id?: string;
  company_name: string;
  section_title: string;
  section_subtitle: string;
  full_text: string;
  mission: string;
  vision: string;
  values: string;
  differentials: string;
  stat_20: string;
  stat_35: string;
  stat_500: string;
  stat_100: string;
  main_image_url: string;
  secondary_image_url: string;
  created_at?: string;
  updated_at?: string;
};

export type MarketContent = {
  id: string;
  name: string;
  country: string | null;
  continent: string | null;
  image_url: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type ProcessStepContent = {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type ContactContent = {
  id?: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  google_maps: string;
  business_hours: string;
  created_at?: string;
  updated_at?: string;
};

export type FooterContent = {
  id?: string;
  copyright: string;
  instagram: string;
  linkedin: string;
  facebook: string;
  youtube: string;
  whatsapp: string;
  email: string;
  institutional_text: string;
  created_at?: string;
  updated_at?: string;
};
