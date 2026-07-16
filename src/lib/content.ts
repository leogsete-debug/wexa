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
  section_title: "SOBRE A TOP MAX",
  section_title_zh: "关于 TOP MAX",
  section_subtitle: "Importamos oportunidades globais para o mercado brasileiro.",
  section_subtitle_zh: "将全球优质产品引入巴西市场",
  full_text:
    "A Top Max atua na identificacao, negociacao e importacao de produtos de fabricantes internacionais.\n\nConectamos empresas brasileiras aos principais polos industriais da China, India e outros mercados estrategicos, oferecendo acesso a produtos competitivos, fornecedores confiaveis e solucoes adequadas a cada operacao.\n\nNossa equipe acompanha todas as etapas do processo: selecao de fornecedores, desenvolvimento do produto, negociacao, producao, inspecao de qualidade, logistica internacional, documentacao e chegada ao Brasil.\n\nNosso objetivo e simplificar a importacao e oferecer seguranca, previsibilidade e competitividade para distribuidores, atacadistas, varejistas e grandes redes.",
  full_text_zh:
    "Top Max 专注于寻找、谈判和进口国际制造商的产品。\n\n我们将巴西企业与中国、印度及其他战略市场的主要工业中心连接起来，为客户提供具有竞争力的产品、可靠的供应商和适合不同业务需求的进口解决方案。\n\n我们的团队全程跟进供应商选择、产品开发、商务谈判、生产、质量检验、国际物流、进口文件以及产品进入巴西市场的全过程。\n\n我们的目标是简化进口流程，为分销商、批发商、零售商和大型连锁企业提供安全、稳定且具有竞争力的供应服务。",
  mission: "Conectar o mercado brasileiro as melhores oportunidades globais.",
  mission_zh: "连接巴西市场与全球优质供应机会",
  vision: "Ser uma referencia em importacao e desenvolvimento internacional de fornecedores.",
  vision_zh: "成为国际采购、进口和供应商开发领域的专业合作伙伴",
  values: "Confianca, qualidade, transparencia e relacionamento de longo prazo.",
  values_zh: "信任、质量、透明和长期合作关系。",
  differentials: "Negociacao direta, controle de qualidade, logistica internacional e fornecimento em escala.",
  differentials_zh: "直接谈判、质量控制、国际物流和规模化供应",
  stat_20: "20+|Anos de experiencia",
  stat_20_zh: "20+|行业经验",
  stat_35: "35+|Mercados fornecedores",
  stat_35_zh: "35+|全球供应市场",
  stat_500: "500+|Produtos no portfolio",
  stat_500_zh: "500+|产品选择",
  stat_100: "100%|Foco em qualidade",
  stat_100_zh: "100%|质量承诺",
  main_image_url: "/images/galeria-2.jpeg",
  secondary_image_url: "/images/galeria-2.jpeg",
  published: true,
};

export const fallbackMarkets: MarketContent[] = [
  { id: "china", name: "China", name_zh: "中国", description: "Principal polo de desenvolvimento e fabricacao para diversas categorias.", description_zh: "多个品类的重要开发与制造中心。", icon: "globe", country: "China", continent: "Asia", image_url: null, sort_order: 0, published: true, created_at: "", updated_at: "" },
  { id: "india", name: "India", name_zh: "印度", description: "Mercado estrategico para produtos texteis, industriais e de consumo.", description_zh: "纺织、工业和消费品的重要战略市场。", icon: "globe", country: "India", continent: "Asia", image_url: null, sort_order: 1, published: true, created_at: "", updated_at: "" },
  { id: "sudeste-asiatico", name: "Sudeste Asiatico", name_zh: "东南亚", description: "Regiao fornecedora com variedade, escala e competitividade.", description_zh: "具备多样性、规模和竞争力的供应区域。", icon: "globe", country: null, continent: "Asia", image_url: null, sort_order: 2, published: true, created_at: "", updated_at: "" },
  { id: "mercados-estrategicos", name: "Outros mercados estrategicos", name_zh: "其他战略市场", description: "Desenvolvimento sob demanda conforme produto, volume e objetivo comercial.", description_zh: "根据产品、数量和商业目标按需开发。", icon: "globe", country: null, continent: null, image_url: null, sort_order: 3, published: true, created_at: "", updated_at: "" },
];

export const fallbackProcessSteps: ProcessStepContent[] = [
  { id: "demanda", title: "Entendimento da demanda", title_zh: "需求分析", description: "Analisamos o produto, volume, especificacoes, publico e objetivo comercial.", description_zh: "分析产品、数量、规格、目标客户和商业目标。", icon: "send", sort_order: 0, published: true, created_at: "", updated_at: "" },
  { id: "fornecedores", title: "Busca de fornecedores", title_zh: "寻找供应商", description: "Localizamos fabricantes internacionais compativeis com a necessidade da empresa.", description_zh: "寻找符合企业需求的国际制造商。", icon: "factory", sort_order: 1, published: true, created_at: "", updated_at: "" },
  { id: "negociacao", title: "Cotacao e negociacao", title_zh: "报价与谈判", description: "Negociamos preco, condicoes comerciais, prazo de producao e pedido minimo.", description_zh: "谈判价格、商业条件、生产周期和最低起订量。", icon: "clipboard", sort_order: 2, published: true, created_at: "", updated_at: "" },
  { id: "amostras", title: "Desenvolvimento e amostras", title_zh: "产品开发与样品", description: "Avaliamos materiais, especificacoes, embalagens, personalizacao e amostras.", description_zh: "评估材料、规格、包装、定制需求和样品。", icon: "package", sort_order: 3, published: true, created_at: "", updated_at: "" },
  { id: "producao", title: "Producao", title_zh: "生产跟进", description: "Acompanhamos o andamento da producao junto ao fabricante.", description_zh: "与制造商持续跟进生产进度。", icon: "factory", sort_order: 4, published: true, created_at: "", updated_at: "" },
  { id: "qualidade", title: "Inspecao de qualidade", title_zh: "质量检验", description: "Verificamos qualidade, acabamento, quantidade e conformidade antes do embarque.", description_zh: "在装运前检查质量、工艺、数量和合规性。", icon: "shield", sort_order: 5, published: true, created_at: "", updated_at: "" },
  { id: "logistica", title: "Logistica internacional", title_zh: "国际物流", description: "Organizamos transporte, consolidacao de carga e embarque internacional.", description_zh: "安排运输、集货和国际装运。", icon: "ship", sort_order: 6, published: true, created_at: "", updated_at: "" },
  { id: "documentacao", title: "Documentacao e nacionalizacao", title_zh: "文件与清关", description: "Acompanhamos documentos, importacao e desembaraco aduaneiro.", description_zh: "跟进口口文件、进口流程和清关手续。", icon: "clipboard", sort_order: 7, published: true, created_at: "", updated_at: "" },
  { id: "entrega-brasil", title: "Entrega no Brasil", title_zh: "巴西交付", description: "O produto chega pronto para distribuicao no mercado brasileiro.", description_zh: "产品抵达巴西后即可面向巴西市场进行分销。", icon: "package", sort_order: 8, published: true, created_at: "", updated_at: "" },
];

export const fallbackContactContent: ContactContent = {
  section_eyebrow: "IMPORTACAO SOB MEDIDA",
  section_eyebrow_zh: "定制进口解决方案",
  section_title: "Vamos encontrar a solucao ideal para sua empresa.",
  section_title_zh: "让我们为您的企业寻找合适的解决方案",
  section_subtitle:
    "Conte quais produtos, volumes e condicoes sua empresa procura. Nossa equipe analisara a demanda e apresentara uma solucao de importacao.",
  section_subtitle_zh: "请告诉我们您需要的产品、数量和采购条件，我们将分析需求并提供适合的进口方案。",
  phone: "Comercial de importacao",
  whatsapp: "",
  email: "comercial@topmaxexport.com",
  address: "Brasil | Fornecimento internacional",
  city: "",
  state: "",
  country: "Brasil",
  google_maps: "",
  business_hours: "Fale com nossa equipe comercial sobre produtos, importacao e fornecimento.",
  whatsapp_card_title: "WhatsApp",
  whatsapp_card_title_zh: "商务 WhatsApp",
  email_card_text: "Envie os detalhes da sua demanda para receber uma proposta direcionada.",
  email_card_text_zh: "请发送您的需求详情，我们将为您准备更精准的进口方案。",
  show_whatsapp_card: true,
  show_email_card: true,
  show_phone_card: true,
};

export const fallbackFooterContent: FooterContent = {
  logo_url: "",
  copyright: "2026 TopMax Export",
  rights_text: "Todos os direitos reservados",
  rights_text_zh: "版权所有",
  instagram: "#",
  linkedin: "#",
  facebook: "#",
  youtube: "#",
  whatsapp: "",
  email: "comercial@topmaxexport.com",
  institutional_text:
    "A Top Max conecta empresas brasileiras a fabricantes internacionais, oferecendo solucoes de importacao, desenvolvimento de produtos e fornecimento em escala.",
  institutional_text_zh:
    "Top Max 将巴西企业与国际制造商连接起来，提供进口、产品开发和规模化供应解决方案。",
  company_column_title: "Empresa",
  company_column_title_zh: "公司",
  contact_column_title: "Contato",
  contact_column_title_zh: "联系我们",
  export_column_title: "Importacao",
  export_column_title_zh: "进口业务",
  export_text:
    "Selecao de fornecedores, negociacao, qualidade, logistica internacional e suporte para entrada dos produtos no Brasil.",
  export_text_zh: "供应商选择、商务谈判、质量控制、国际物流以及产品进入巴西市场的支持服务。",
  links: [
    { label: "Empresa", label_zh: "公司", href: "#empresa" },
    { label: "Produtos", label_zh: "产品", href: "#produtos" },
    { label: "Catalogo", label_zh: "产品目录", href: "#catalogo" },
    { label: "Galeria", label_zh: "图片库", href: "#galeria" },
    { label: "Contato", label_zh: "联系我们", href: "#contato" },
  ],
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

  const { data, error } = await supabase
    .from("company_content")
    .select("*")
    .or("published.is.null,published.eq.true")
    .limit(1)
    .maybeSingle<CompanyContent>();
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
