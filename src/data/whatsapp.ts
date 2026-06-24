export const WA_NUMBER = '5581983426557';

export function waLink(msg = 'Olá! Vim pelo site da Búfalo e quero saber mais.'): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export const waMsg = {
  produto: (n: string) => `Olá! Quero saber mais sobre ${n}.`,
  revendedor: 'Olá! Quero ser revendedor Búfalo.',
  atacado: 'Olá! Tenho interesse em comprar em volume para minha confecção.',
};
