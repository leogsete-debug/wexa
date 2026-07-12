import { createClient } from "@supabase/supabase-js";
import type {
  CompanyContent,
  ContactContent,
  FooterContent,
  MarketContent,
  ProcessStepContent,
} from "@/types/content";

export const fallbackCompanyContent: CompanyContent = {
  company_name: "TopMax Export",
  section_title: "Sobre a TopMax Export",
  section_subtitle: "Conectando fabricantes brasileiros ao mercado global",
  full_text:
    "A TopMax Export conecta fabricantes brasileiros a compradores internacionais por meio de uma estrutura comercial de alto padrão, orientada por confiança, clareza e parcerias de longo prazo.\n\nDa seleção de fornecedores à apresentação dos produtos, alinhamento de qualidade e suporte à exportação, ajudamos importadores a acessar o potencial produtivo do Brasil com segurança e profissionalismo.",
  mission: "Conectar fabricantes brasileiros a compradores internacionais com clareza e confianca.",
  vision: "Ser referencia em curadoria comercial para exportacao brasileira.",
  values: "Confianca, qualidade, transparencia e relacionamento de longo prazo.",
  differentials: "Fornecedor seguro para compradores internacionais",
  stat_20: "20+|Anos de experiência",
  stat_35: "35+|Países atendidos",
  stat_500: "500+|Produtos no portfólio",
  stat_100: "100%|Foco em qualidade",
  main_image_url: "/images/galeria-2.jpeg",
  secondary_image_url: "/images/galeria-2.jpeg",
};

export const fallbackMarkets: MarketContent[] = [
  { id: "brasil", name: "Brasil", country: "Brasil", continent: "América do Sul", image_url: null, sort_order: 0, published: true, created_at: "", updated_at: "" },
  { id: "latam", name: "América Latina", country: null, continent: "América Latina", image_url: null, sort_order: 1, published: true, created_at: "", updated_at: "" },
  { id: "europa", name: "Europa", country: null, continent: "Europa", image_url: null, sort_order: 2, published: true, created_at: "", updated_at: "" },
  { id: "america-norte", name: "América do Norte", country: null, continent: "América do Norte", image_url: null, sort_order: 3, published: true, created_at: "", updated_at: "" },
  { id: "asia", name: "Ásia", country: null, continent: "Ásia", image_url: null, sort_order: 4, published: true, created_at: "", updated_at: "" },
];

export const fallbackProcessSteps: ProcessStepContent[] = [
  { id: "solicitacao", title: "Solicitação", description: "Recebemos a demanda, destino, volume e requisitos comerciais.", icon: "send", sort_order: 0, published: true, created_at: "", updated_at: "" },
  { id: "cotacao", title: "Cotação", description: "Estruturamos preço, prazos, condições e escopo de fornecimento.", icon: "clipboard", sort_order: 1, published: true, created_at: "", updated_at: "" },
  { id: "producao", title: "Produção", description: "Coordenamos produção ou separação com fornecedores qualificados.", icon: "factory", sort_order: 2, published: true, created_at: "", updated_at: "" },
  { id: "qualidade", title: "Controle de qualidade", description: "Validamos padrões, documentação e consistência do pedido.", icon: "shield", sort_order: 3, published: true, created_at: "", updated_at: "" },
  { id: "embarque", title: "Embarque", description: "Organizamos logística, exportação e acompanhamento operacional.", icon: "ship", sort_order: 4, published: true, created_at: "", updated_at: "" },
  { id: "entrega", title: "Entrega", description: "Acompanhamos a chegada e o pós-venda com visão de longo prazo.", icon: "package", sort_order: 5, published: true, created_at: "", updated_at: "" },
];

export const fallbackContactContent: ContactContent = {
  phone: "Comercial internacional",
  whatsapp: "https://wa.me/5500000000000",
  email: "comercial@topmaxexport.com",
  address: "Brasil | Mercados internacionais",
  city: "",
  state: "",
  country: "Brasil",
  google_maps: "",
  business_hours: "Atendimento comercial para compradores corporativos.",
};

export const fallbackFooterContent: FooterContent = {
  copyright: "2026 TopMax Export",
  instagram: "#",
  linkedin: "#",
  facebook: "#",
  youtube: "#",
  whatsapp: "https://wa.me/5500000000000",
  email: "comercial@topmaxexport.com",
  institutional_text:
    "Empresa internacional de exportação conectando produtos brasileiros a compradores globais com padrão internacional.",
};

function createPublicClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}

export async function getPublicCompanyContent() {
  const supabase = createPublicClient();
  if (!supabase) return fallbackCompanyContent;

  const { data, error } = await supabase.from("company_content").select("*").limit(1).maybeSingle<CompanyContent>();
  return error || !data ? fallbackCompanyContent : { ...fallbackCompanyContent, ...data };
}

export async function getPublicMarkets() {
  const supabase = createPublicClient();
  if (!supabase) return fallbackMarkets;

  const { data, error } = await supabase
    .from("markets")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return error || !data || data.length === 0 ? fallbackMarkets : (data as MarketContent[]);
}

export async function getPublicProcessSteps() {
  const supabase = createPublicClient();
  if (!supabase) return fallbackProcessSteps;

  const { data, error } = await supabase
    .from("export_process_steps")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return error || !data || data.length === 0 ? fallbackProcessSteps : (data as ProcessStepContent[]);
}

export async function getPublicContactContent() {
  const supabase = createPublicClient();
  if (!supabase) return fallbackContactContent;

  const { data, error } = await supabase.from("contact_content").select("*").limit(1).maybeSingle<ContactContent>();
  return error || !data ? fallbackContactContent : { ...fallbackContactContent, ...data };
}

export async function getPublicFooterContent() {
  const supabase = createPublicClient();
  if (!supabase) return fallbackFooterContent;

  const { data, error } = await supabase.from("footer_content").select("*").limit(1).maybeSingle<FooterContent>();
  return error || !data ? fallbackFooterContent : { ...fallbackFooterContent, ...data };
}
