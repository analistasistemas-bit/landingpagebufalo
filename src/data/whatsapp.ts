import config from './config.json';

export const WA_NUMBER = config.whatsapp;

export function waLink(msg = 'Olá! Vim pelo site da Búfalo e quero saber mais.'): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

// Formata WA_NUMBER ("5581983426557") como "+55 81 98342-6557" para exibição.
export function waDisplay(): string {
  const raw = WA_NUMBER;
  return `+${raw.slice(0, 2)} ${raw.slice(2, 4)} ${raw.slice(4, 9)}-${raw.slice(9)}`;
}

export const waMsg = {
  produto: (n: string) => `Olá! Quero saber mais sobre ${n}.`,
  revendedor: config.ctas.revendedorMsg,
  atacado: config.ctas.atacadoMsg,
};

export const EMAIL = config.email;
