/**
 * SEO meta por página — modelos da spec Site/04_Especificacao_Tecnica_SEO.md §6
 */

export interface PageSeo {
  title: string;
  description: string;
}

export const seo: Record<string, PageSeo> = {
  home: {
    title: 'Búfalo — Linhas de Costura e Aviamentos | Força e Qualidade',
    description:
      'Linhas de costura de alta resistência e aviamentos completos. A linha que não quebra na hora H. Centenas de cores, presença em todo o Brasil. Fale no WhatsApp.',
  },
  marca: {
    title: 'A Marca Búfalo — Força e Qualidade em cada carretel',
    description:
      'Conheça a Búfalo: marca brasileira de linhas de costura e aviamentos, reconhecida pela resistência e variedade de cores em todo o Brasil.',
  },
  produtos: {
    title: 'Produtos Búfalo — Linhas, Zíperes, Elásticos e Aviamentos',
    description:
      'Conheça o portfólio Búfalo: linhas de costura, fios de overloque, zíperes, elásticos, passamanarias, tesouras e mais.',
  },
  qualidade: {
    title: 'Qualidade Búfalo — Por que costurar com Búfalo',
    description:
      'Resistência comprovada, variedade de cores e atendimento nacional. Descubra por que profissionais de costura escolhem a Búfalo.',
  },
  revendedor: {
    title: 'Seja um Revendedor Búfalo — Leve a força para a sua loja',
    description:
      'Revenda Búfalo e ofereça ao seu cliente uma marca reconhecida em todo o Brasil. Portfólio completo de linhas e aviamentos. Fale no WhatsApp.',
  },
  contato: {
    title: 'Contato — Fale com a Búfalo no WhatsApp',
    description:
      'Entre em contato com a Búfalo pelo WhatsApp. Atendimento direto, sem rodeios. Tire dúvidas, faça pedidos e conheça nossos produtos.',
  },
};

/**
 * Gera SEO dinâmico para páginas de categoria.
 * Modelo: "[Categoria] Búfalo | Aviamentos e Linhas de Costura"
 */
export function categorySeo(nome: string, descricao: string): PageSeo {
  return {
    title: `${nome} Búfalo | Aviamentos e Linhas de Costura`,
    description: `${descricao} — qualidade Búfalo. Saiba mais no WhatsApp.`,
  };
}
