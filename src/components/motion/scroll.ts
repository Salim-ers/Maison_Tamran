/**
 * Plage d'entrée d'une animation liée au défilement, bornée à [0, 1] et croissante.
 * Motion confie ces animations au navigateur (Web Animations + ScrollTimeline), qui refuse
 * des décalages hors de [0, 1] ou décroissants.
 */
export function span(...stops: number[]) {
  let prev = 0;
  return stops.map((v) => {
    const c = Math.min(1, Math.max(prev, v));
    prev = c;
    return c;
  });
}
