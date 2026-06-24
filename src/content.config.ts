import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const paginas = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/paginas' }),
  schema: z.object({
    titulo: z.string().optional(),
    intro: z.string().optional(),

    // home — hero
    kicker: z.string().optional(),
    headline: z.string().optional(),
    subtitulo: z.string().optional(),
    ctaPrimarioLabel: z.string().optional(),
    ctaSecundarioLabel: z.string().optional(),

    // home — categorias
    categoriasHeading: z.string().optional(),
    categoriasIntro: z.string().optional(),

    // home — destaques
    destaquesHeading: z.string().optional(),

    // home — faixa institucional
    marcaTitulo: z.string().optional(),
    marcaTexto: z.string().optional(),
    marcaLinkLabel: z.string().optional(),

    // home — faixa revendedor (CTASection)
    revendedorCTATitulo: z.string().optional(),
    revendedorCTATexto: z.string().optional(),
    revendedorCTABotao: z.string().optional(),

    // a-marca
    abertura: z.string().optional(),
    missaoTexto: z.string().optional(),
    visaoTexto: z.string().optional(),
    valores: z
      .array(
        z.object({
          nome: z.string(),
          desc: z.string(),
        })
      )
      .optional(),
    posicionamentoFrase: z.string().optional(),
    posicionamentoTexto: z.string().optional(),
    presencaKicker: z.string().optional(),
    presencaTexto: z.string().optional(),
    ctaPrimario: z.string().optional(),
    ctaSecundario: z.string().optional(),

    // qualidade
    blocos: z
      .array(
        z.object({
          titulo: z.string(),
          texto: z.string(),
        })
      )
      .optional(),
    aplicacoesHeading: z.string().optional(),
    aplicacoes: z
      .array(
        z.object({
          tipo: z.string(),
          desc: z.string(),
        })
      )
      .optional(),
    ctaTitulo: z.string().optional(),
    ctaTexto: z.string().optional(),
    ctaBotao: z.string().optional(),

    // revendedor
    beneficiosHeading: z.string().optional(),
    beneficios: z
      .array(
        z.object({
          titulo: z.string(),
          desc: z.string(),
        })
      )
      .optional(),
  }),
});

export const collections = { paginas };
