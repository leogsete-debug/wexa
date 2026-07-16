export type CompanyContent = {
  id?: string;
  company_name: string;
  section_title: string;
  section_title_zh?: string | null;
  section_subtitle: string;
  section_subtitle_zh?: string | null;
  full_text: string;
  full_text_zh?: string | null;
  mission: string;
  mission_zh?: string | null;
  vision: string;
  vision_zh?: string | null;
  values: string;
  values_zh?: string | null;
  differentials: string;
  differentials_zh?: string | null;
  stat_20: string;
  stat_20_zh?: string | null;
  stat_35: string;
  stat_35_zh?: string | null;
  stat_500: string;
  stat_500_zh?: string | null;
  stat_100: string;
  stat_100_zh?: string | null;
  main_image_url: string;
  secondary_image_url: string;
  published?: boolean | null;
  created_at?: string;
  updated_at?: string;
};

export type MarketContent = {
  id: string;
  name: string;
  name_zh?: string | null;
  description?: string | null;
  description_zh?: string | null;
  icon?: string | null;
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
  title_zh?: string | null;
  description: string | null;
  description_zh?: string | null;
  icon: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type ContactContent = {
  id?: string;
  section_eyebrow?: string | null;
  section_eyebrow_zh?: string | null;
  section_title?: string | null;
  section_title_zh?: string | null;
  section_subtitle?: string | null;
  section_subtitle_zh?: string | null;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  google_maps: string;
  business_hours: string;
  whatsapp_card_title?: string | null;
  whatsapp_card_title_zh?: string | null;
  email_card_text?: string | null;
  email_card_text_zh?: string | null;
  show_whatsapp_card?: boolean | null;
  show_email_card?: boolean | null;
  show_phone_card?: boolean | null;
  created_at?: string;
  updated_at?: string;
};

export type FooterContent = {
  id?: string;
  logo_url?: string | null;
  copyright: string;
  rights_text?: string | null;
  rights_text_zh?: string | null;
  instagram: string;
  linkedin: string;
  facebook: string;
  youtube: string;
  whatsapp: string;
  email: string;
  institutional_text: string;
  institutional_text_zh?: string | null;
  company_column_title?: string | null;
  company_column_title_zh?: string | null;
  contact_column_title?: string | null;
  contact_column_title_zh?: string | null;
  export_column_title?: string | null;
  export_column_title_zh?: string | null;
  export_text?: string | null;
  export_text_zh?: string | null;
  links?: FooterLink[] | null;
  created_at?: string;
  updated_at?: string;
};

export type FooterLink = {
  label: string;
  label_zh?: string | null;
  href: string;
};

export type LocalizedValue = string | { pt?: string | null; zh?: string | null };

export type SiteSectionContent = Record<string, unknown>;

export type SiteSection = {
  id?: string;
  key: string;
  title: string | null;
  enabled: boolean;
  content: SiteSectionContent;
  created_at?: string;
  updated_at?: string;
};

export type GalleryItem = {
  id: string;
  title: string | null;
  title_zh?: string | null;
  caption: string | null;
  caption_zh?: string | null;
  alt_text: string | null;
  alt_text_zh?: string | null;
  image_url: string;
  sort_order: number;
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
};
