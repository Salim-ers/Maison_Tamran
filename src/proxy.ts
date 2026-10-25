import { NextResponse, type NextRequest } from "next/server";

/**
 * Garde optimiste : sans cookie de session, inutile de rendre le back-office.
 * La vérification réelle (session valide + rôle admin) est faite côté serveur par requireAdmin().
 */
export function proxy(req: NextRequest) {
  if (!req.cookies.get("tb_session")) {
    const url = req.nextUrl.clone();
    url.pathname = "/compte/connexion";
    url.search = `?suite=${encodeURIComponent(req.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
