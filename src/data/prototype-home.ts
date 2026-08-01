export type AudiencePath = {
  id: 'industria' | 'atelie' | 'loja' | 'artesanato';
  title: string;
  description: string;
  imageCategorySlug: string;
  categorySlugs: readonly string[];
};

export type AnalysisNote = {
  id: number;
  target: string;
  title: string;
  problem: string;
  change: string;
  benefit: string;
};

export const priorityCategorySlugs = [
  'linhas-de-costura', 'fios-overloque', 'ziperes', 'elasticos',
  'passamanarias', 'botoes-de-pressao', 'tesouras', 'fita-metrica',
] as const;

export const audiencePaths: readonly AudiencePath[] = [
  { id: 'industria', title: 'Produção industrial e confecções', description: 'Resistência, ficha técnica e fornecimento para produção em escala.', imageCategorySlug: 'linhas-de-costura', categorySlugs: ['linhas-de-costura', 'fios-overloque'] },
  { id: 'atelie', title: 'Ateliês e costureiras', description: 'Materiais confiáveis para máquina doméstica, ajustes e peças sob medida.', imageCategorySlug: 'ziperes', categorySlugs: ['ziperes', 'elasticos'] },
  { id: 'loja', title: 'Lojas e armarinhos', description: 'Produtos reconhecidos, variedade e itens de recompra para o balcão.', imageCategorySlug: 'botoes-de-pressao', categorySlugs: ['botoes-de-pressao', 'fita-metrica'] },
  { id: 'artesanato', title: 'Artesanato e consumidor final', description: 'Acabamentos, cores e ferramentas para projetos criativos.', imageCategorySlug: 'passamanarias', categorySlugs: ['passamanarias', 'tesouras'] },
] as const;

export const analysisNotes: readonly AnalysisNote[] = [
  { id: 1, target: 'hero', title: 'Uma prova comercial coerente', problem: 'A página alternava entre “100+” e “500 cores”.', change: 'A mensagem foi unificada em “500 cores”.', benefit: 'Mais confiança nas provas comerciais.' },
  { id: 2, target: 'caminhos', title: 'Orientação desde o início', problem: 'O público não encontrava uma entrada adequada ao seu trabalho.', change: 'Quatro caminhos por público e uso orientam a navegação.', benefit: 'Decisão mais rápida.' },
  { id: 3, target: 'categorias', title: 'Catálogo com prioridade', problem: 'Vinte e quatro categorias tinham o mesmo peso na home.', change: 'Oito categorias prioritárias representam a amplitude do catálogo.', benefit: 'Menor carga cognitiva e menos rolagem.' },
  { id: 4, target: 'prova', title: 'Prova antes da conversão', problem: 'A evidência técnica aparecia tarde na jornada.', change: 'Produtos e dados técnicos reais aparecem antes dos CTAs finais.', benefit: 'Mais segurança para compradores profissionais.' },
  { id: 5, target: 'legibilidade', title: 'Leitura mais confortável', problem: 'Texto auxiliar pequeno e contraste insuficiente dificultavam a leitura.', change: 'Corpo e cor foram ajustados para o nível AA.', benefit: 'Melhor leitura em mobile e para pessoas com baixa visão.' },
  { id: 6, target: 'menu', title: 'Menu móvel acessível', problem: 'O controle era pequeno e incompleto para teclado.', change: 'O alvo agora tem 44px, fecha com Escape e restaura o foco.', benefit: 'Melhor uso com uma mão e teclado.' },
  { id: 7, target: 'rodape', title: 'Fechamento confiável', problem: 'O rodapé publicava canais ainda pendentes.', change: 'Somente canais confirmados são exibidos.', benefit: 'Um fechamento mais confiável.' },
] as const;
