/** Slug do portal (`associations.slug`). Padrão ACAF. */
export const ASSOCIATION_SLUG = (import.meta.env.VITE_ASSOCIATION_SLUG as string | undefined)?.trim() || 'acaf';

export function associationPartnersPermission(slug: string = ASSOCIATION_SLUG): string {
  return `associacao.${slug}.parceiros`;
}
