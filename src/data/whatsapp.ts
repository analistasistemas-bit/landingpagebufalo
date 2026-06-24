import config from './config.json';

export const WA_NUMBER = config.whatsapp;

export function waLink(msg = 'Olá! Vim pelo site da Búfalo e quero saber mais.'): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export const waMsg = {
  produto: (n: string) => `Olá! Quero saber mais sobre ${n}.`,
  revendedor: config.ctas.revendedorMsg,
  atacado: config.ctas.atacadoMsg,
};

export const EMAIL = config.email;
