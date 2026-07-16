-- Reposiciona a comunicacao da Top Max para importacao e fornecimento global.
-- Execute manualmente no Supabase SQL Editor. Nao apaga dados e atualiza apenas textos antigos conhecidos.

alter table public.site_settings
  add column if not exists company_name_zh text,
  add column if not exists hero_badge_zh text,
  add column if not exists hero_title_zh text,
  add column if not exists hero_subtitle_zh text,
  add column if not exists hero_primary_button_text_zh text,
  add column if not exists hero_secondary_button_text_zh text,
  add column if not exists catalog_title_zh text,
  add column if not exists catalog_subtitle_zh text,
  add column if not exists seo_title text,
  add column if not exists seo_title_zh text,
  add column if not exists seo_description text,
  add column if not exists seo_description_zh text,
  add column if not exists seo_keywords text;

alter table public.company_content
  add column if not exists section_title_zh text,
  add column if not exists section_subtitle_zh text,
  add column if not exists full_text_zh text,
  add column if not exists mission_zh text,
  add column if not exists vision_zh text,
  add column if not exists differentials_zh text,
  add column if not exists stat_20_zh text,
  add column if not exists stat_35_zh text,
  add column if not exists stat_500_zh text,
  add column if not exists stat_100_zh text;

alter table public.export_process_steps
  add column if not exists title_zh text,
  add column if not exists description_zh text;

alter table public.markets
  add column if not exists name_zh text,
  add column if not exists description text,
  add column if not exists description_zh text,
  add column if not exists icon text;

alter table public.contact_content
  add column if not exists section_eyebrow text,
  add column if not exists section_eyebrow_zh text,
  add column if not exists section_title text,
  add column if not exists section_title_zh text,
  add column if not exists section_subtitle text,
  add column if not exists section_subtitle_zh text,
  add column if not exists whatsapp_card_title text,
  add column if not exists whatsapp_card_title_zh text,
  add column if not exists email_card_text text,
  add column if not exists email_card_text_zh text;

alter table public.footer_content
  add column if not exists institutional_text_zh text,
  add column if not exists export_column_title text,
  add column if not exists export_column_title_zh text,
  add column if not exists export_text text,
  add column if not exists export_text_zh text;

update public.site_settings
set
  hero_badge = 'IMPORTACAO E FORNECIMENTO GLOBAL',
  hero_badge_zh = '全球采购与进口供应',
  hero_title = 'Conectando o Brasil aos melhores fabricantes do mundo.',
  hero_title_zh = '连接巴西企业与全球优质制造商',
  hero_subtitle = 'Importamos produtos da China, India e outros mercados estrategicos, oferecendo solucoes completas para distribuidores, atacadistas, varejistas e grandes redes brasileiras.',
  hero_subtitle_zh = '我们从中国、印度及其他战略市场进口产品，为巴西的分销商、批发商、零售商和大型连锁企业提供完整的供应解决方案。',
  hero_primary_button_text = 'Solicitar cotacao',
  hero_primary_button_text_zh = '申请报价',
  hero_secondary_button_text = 'Conhecer produtos',
  hero_secondary_button_text_zh = '查看产品',
  catalog_title = 'Conheca nosso portfolio de produtos importados.',
  catalog_title_zh = '了解我们的进口产品组合',
  catalog_subtitle = 'Baixe o catalogo completo e encontre produtos para distribuicao, atacado, varejo e grandes redes.',
  catalog_subtitle_zh = '下载完整目录，查看适合分销、批发、零售和大型连锁企业的产品。',
  seo_title = 'Top Max | Importacao da China, India e mercados internacionais',
  seo_title_zh = 'Top Max | 巴西进口与国际供应解决方案',
  seo_description = 'A Top Max conecta empresas brasileiras a fabricantes internacionais, oferecendo importacao, desenvolvimento de fornecedores, controle de qualidade e logistica global.',
  seo_description_zh = 'Top Max 连接巴西企业与中国、印度及其他国际市场的制造商，提供进口、供应商开发、质量控制和国际物流服务。',
  seo_keywords = 'importacao da China, importacao da India, empresa de importacao, trading company Brasil, fornecedores internacionais, produtos importados, importacao cama mesa e banho, importacao de produtos texteis, desenvolvimento de fornecedores, marca propria'
where hero_title in (
  'Conectando a excelência brasileira ao mercado global',
  'Conectando a excelencia brasileira ao mercado global'
)
or hero_badge in ('Vitrine internacional de exportação', 'Vitrine internacional de exportacao');

update public.company_content
set
  section_title = 'SOBRE A TOP MAX',
  section_title_zh = '关于 TOP MAX',
  section_subtitle = 'Importamos oportunidades globais para o mercado brasileiro.',
  section_subtitle_zh = '将全球优质产品引入巴西市场',
  full_text = 'A Top Max atua na identificacao, negociacao e importacao de produtos de fabricantes internacionais.' || chr(10) || chr(10) || 'Conectamos empresas brasileiras aos principais polos industriais da China, India e outros mercados estrategicos, oferecendo acesso a produtos competitivos, fornecedores confiaveis e solucoes adequadas a cada operacao.' || chr(10) || chr(10) || 'Nossa equipe acompanha todas as etapas do processo: selecao de fornecedores, desenvolvimento do produto, negociacao, producao, inspecao de qualidade, logistica internacional, documentacao e chegada ao Brasil.' || chr(10) || chr(10) || 'Nosso objetivo e simplificar a importacao e oferecer seguranca, previsibilidade e competitividade para distribuidores, atacadistas, varejistas e grandes redes.',
  full_text_zh = 'Top Max 专注于寻找、谈判和进口国际制造商的产品。' || chr(10) || chr(10) || '我们将巴西企业与中国、印度及其他战略市场的主要工业中心连接起来，为客户提供具有竞争力的产品、可靠的供应商和适合不同业务需求的进口解决方案。' || chr(10) || chr(10) || '我们的团队全程跟进供应商选择、产品开发、商务谈判、生产、质量检验、国际物流、进口文件以及产品进入巴西市场的全过程。' || chr(10) || chr(10) || '我们的目标是简化进口流程，为分销商、批发商、零售商和大型连锁企业提供安全、稳定且具有竞争力的供应服务。',
  mission = 'Conectar o mercado brasileiro as melhores oportunidades globais.',
  mission_zh = '连接巴西市场与全球优质供应机会',
  vision = 'Ser uma referencia em importacao e desenvolvimento internacional de fornecedores.',
  vision_zh = '成为国际采购、进口和供应商开发领域的专业合作伙伴',
  differentials = 'Negociacao direta, controle de qualidade, logistica internacional e fornecimento em escala.',
  differentials_zh = '直接谈判、质量控制、国际物流和规模化供应',
  stat_35 = regexp_replace(coalesce(stat_35, '35+|Paises atendidos'), '\|.*$', '|Mercados fornecedores'),
  stat_35_zh = regexp_replace(coalesce(stat_35_zh, '35+|合作国家'), '\|.*$', '|全球供应市场')
where section_subtitle = 'Conectando fabricantes brasileiros ao mercado global'
or mission = 'Conectar fabricantes brasileiros a compradores internacionais com clareza e confianca.';

delete from public.export_process_steps
where title in ('Solicitacao', 'Cotacao', 'Controle de qualidade', 'Embarque', 'Entrega')
  and exists (
    select 1 from public.export_process_steps
    where title = 'Embarque'
      and description ilike '%exportacao%'
  );

insert into public.export_process_steps (title, title_zh, description, description_zh, icon, sort_order, published)
select * from (
  values
    ('Entendimento da demanda', '需求分析', 'Analisamos o produto, volume, especificacoes, publico e objetivo comercial.', '分析产品、数量、规格、目标客户和商业目标。', 'send', 0, true),
    ('Busca de fornecedores', '寻找供应商', 'Localizamos fabricantes internacionais compativeis com a necessidade da empresa.', '寻找符合企业需求的国际制造商。', 'factory', 1, true),
    ('Cotacao e negociacao', '报价与谈判', 'Negociamos preco, condicoes comerciais, prazo de producao e pedido minimo.', '谈判价格、商业条件、生产周期和最低起订量。', 'clipboard', 2, true),
    ('Desenvolvimento e amostras', '产品开发与样品', 'Avaliamos materiais, especificacoes, embalagens, personalizacao e amostras.', '评估材料、规格、包装、定制需求和样品。', 'package', 3, true),
    ('Producao', '生产跟进', 'Acompanhamos o andamento da producao junto ao fabricante.', '与制造商持续跟进生产进度。', 'factory', 4, true),
    ('Inspecao de qualidade', '质量检验', 'Verificamos qualidade, acabamento, quantidade e conformidade antes do embarque.', '在装运前检查质量、工艺、数量和合规性。', 'shield', 5, true),
    ('Logistica internacional', '国际物流', 'Organizamos transporte, consolidacao de carga e embarque internacional.', '安排运输、集货和国际装运。', 'ship', 6, true),
    ('Documentacao e nacionalizacao', '文件与清关', 'Acompanhamos documentos, importacao e desembaraco aduaneiro.', '跟进口文件、进口流程和清关手续。', 'clipboard', 7, true),
    ('Entrega no Brasil', '巴西交付', 'O produto chega pronto para distribuicao no mercado brasileiro.', '产品抵达巴西后即可面向巴西市场进行分销。', 'package', 8, true)
) as seed(title, title_zh, description, description_zh, icon, sort_order, published)
where not exists (select 1 from public.export_process_steps where title = seed.title);

insert into public.markets (name, name_zh, description, description_zh, icon, country, continent, sort_order, published)
select * from (
  values
    ('China', '中国', 'Principal polo de desenvolvimento e fabricacao para diversas categorias.', '多个品类的重要开发与制造中心。', 'globe', 'China', 'Asia', 0, true),
    ('India', '印度', 'Mercado estrategico para produtos texteis, industriais e de consumo.', '纺织、工业和消费品的重要战略市场。', 'globe', 'India', 'Asia', 1, true),
    ('Sudeste Asiatico', '东南亚', 'Regiao fornecedora com variedade, escala e competitividade.', '具备多样性、规模和竞争力的供应区域。', 'globe', null, 'Asia', 2, true),
    ('Outros mercados estrategicos', '其他战略市场', 'Desenvolvimento sob demanda conforme produto, volume e objetivo comercial.', '根据产品、数量和商业目标按需开发。', 'globe', null, null, 3, true)
) as seed(name, name_zh, description, description_zh, icon, country, continent, sort_order, published)
where not exists (select 1 from public.markets where markets.name = seed.name);

update public.contact_content
set
  section_eyebrow = 'IMPORTACAO SOB MEDIDA',
  section_eyebrow_zh = '定制进口解决方案',
  section_title = 'Vamos encontrar a solucao ideal para sua empresa.',
  section_title_zh = '让我们为您的企业寻找合适的解决方案',
  section_subtitle = 'Conte quais produtos, volumes e condicoes sua empresa procura. Nossa equipe analisara a demanda e apresentara uma solucao de importacao.',
  section_subtitle_zh = '请告诉我们您需要的产品、数量和采购条件，我们将分析需求并提供适合的进口方案。',
  email_card_text = 'Envie os detalhes da sua demanda para receber uma proposta direcionada.',
  email_card_text_zh = '请发送您的需求详情，我们将为您准备更精准的进口方案。',
  business_hours = 'Fale com nossa equipe comercial sobre produtos, importacao e fornecimento.',
  address = 'Brasil | Fornecimento internacional'
where section_title is null
or section_title = 'Vamos estruturar sua proxima compra internacional.';

update public.footer_content
set
  institutional_text = 'A Top Max conecta empresas brasileiras a fabricantes internacionais, oferecendo solucoes de importacao, desenvolvimento de produtos e fornecimento em escala.',
  institutional_text_zh = 'Top Max 将巴西企业与国际制造商连接起来，提供进口、产品开发和规模化供应解决方案。',
  export_column_title = 'Importacao',
  export_column_title_zh = '进口业务',
  export_text = 'Selecao de fornecedores, negociacao, qualidade, logistica internacional e suporte para entrada dos produtos no Brasil.',
  export_text_zh = '供应商选择、商务谈判、质量控制、国际物流以及产品进入巴西市场的支持服务。'
where institutional_text = 'Empresa internacional de exportacao conectando produtos brasileiros a compradores globais com padrao internacional.'
or export_column_title = 'Exportacao';

update public.site_sections
set content = jsonb_set(content, '{stats}', '[{"value":"20+","label":"Anos de experiencia","label_zh":"行业经验","sort_order":0},{"value":"35+","label":"Mercados fornecedores","label_zh":"全球供应市场","sort_order":1},{"value":"500+","label":"Produtos no portfolio","label_zh":"产品组合","sort_order":2},{"value":"100%","label":"Compromisso com qualidade","label_zh":"质量承诺","sort_order":3}]'::jsonb, true)
where key = 'hero'
  and content->'stats' @> '[{"label":"Paises"}]'::jsonb;
