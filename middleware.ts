

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import * as jose from 'jose'; 

// // Le secret doit être le même que celui utilisé pour signer les JWT lors de la connexion.
// const SECRET = process.env.JWT_SECRET || "secret_key_temporaire"; 
// const secretKey = new TextEncoder().encode(SECRET);

// interface JwtPayload {
//     id: string;
//     email: string;
//     role: string; // Ex: admin, caissier, gerant, etc.
// }

// export async function middleware(req: NextRequest) {
//     const token = req.cookies.get("token")?.value;
//     const url = req.nextUrl.pathname;
    
//     // Vrai si un token existe
//     const isAuthenticated = !!token;
    
//     // ------------------------------------
//     // 1. GESTION DE L'AUTHENTIFICATION
//     // ------------------------------------
    
//     // Si l'utilisateur n'a pas de token, il est redirigé vers la page de connexion.
//     if (!isAuthenticated) {
//         return NextResponse.redirect(new URL("/auth", req.url));
//     }

//     try {
//         // Vérification et décodage du token pour obtenir le rôle
//         const { payload } = await jose.jwtVerify(token, secretKey);
//         const decoded = payload as unknown as JwtPayload; 
//         const userRole = decoded.role;
        
//         // Définition claire des zones d'accès
//         const isDashboardAdmin = url.startsWith("/Dashboard") && !url.startsWith("/DashboardUser");
//         const isDashboardUser = url.startsWith("/DashboardUser");

//         // ------------------------------------
//         // 2. LOGIQUE D'AUTORISATION ET DE REDIRECTION (Blocage de fraude d'accès)
//         // ------------------------------------
        
//         // --- Cas de l'ADMIN (Rôle: "admin") ---
//         if (userRole === "admin") {
//             // Blocage de fraude : Si l'Admin essaie d'accéder à la zone utilisateur (/DashboardUser...)
//             if (isDashboardUser) {
//                  // Redirection vers sa zone autorisée (/Dashboard)
//                  return NextResponse.redirect(new URL("/Dashboard", req.url));
//             }
            
//             // Si l'Admin est sur /Dashboard (ou une de ses sous-routes), on autorise.
//             return NextResponse.next(); 
//         }

//         // --- Cas des Utilisateurs Simples (Rôle: Non-"admin") ---

//         // Blocage de fraude : Si un utilisateur non-Admin essaie d'accéder à la zone Admin (/Dashboard...)
//         if (isDashboardAdmin) {
//             console.log(`Accès Admin refusé pour le rôle: ${userRole}. Redirection vers zone utilisateur.`);
//             // Redirection vers sa zone autorisée (/DashboardUser)
//             return NextResponse.redirect(new URL("/DashboardUser", req.url));
//         }

//         // Si l'utilisateur simple accède à SA zone (/DashboardUser...)
//         if (isDashboardUser) {
//              return NextResponse.next(); // Autoriser l'accès
//         }

//         // Si la route est couverte par le matcher mais n'est pas gérée, on autorise (fail safe).
//         return NextResponse.next();

//     } catch (err) {
//         // 🚨 Gère les tokens invalides, expirés ou falsifiés (Protection contre les boucles)
//         console.error("Token invalide ou erreur de décodage:", err); 
        
//         // Supprime le cookie invalide et redirige vers la connexion
//         const redirectResponse = NextResponse.redirect(new URL("/auth", req.url));
//         redirectResponse.cookies.delete("token"); 
        
//         return redirectResponse;
//     }
// }

// // --- Configuration ---
// export const config = {
//     // Le middleware s'applique à toutes les routes nécessitant une vérification de rôle.
//     matcher: [
//         "/Dashboard/:path*",    
//         "/DashboardUser/:path*", 
//     ],
// };
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from 'jose';

// Utilisation de la même clé secrète que l'API
const SECRET = process.env.JWT_SECRET || "secret_key_temporaire";
const secretKey = new TextEncoder().encode(SECRET);

interface JwtPayload {
    id: string;
    email: string;
    role: string;
}

export async function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const { pathname } = req.nextUrl;

    // 1. EXCEPTION : Ne pas appliquer le middleware à la page d'authentification
    // Sinon, on crée une boucle de redirection infinie.
    if (pathname.startsWith("/auth") || pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    // 2. VÉRIFICATION DE L'EXISTENCE DU TOKEN
    if (!token) {
        // Rediriger vers /auth si on tente d'accéder à une page protégée sans token
        const loginUrl = new URL("/auth", req.url);
        return NextResponse.redirect(loginUrl);
    }

    try {
        // 3. VÉRIFICATION DU JWT (avec jose pour compatibilité Edge Runtime)
        const { payload } = await jose.jwtVerify(token, secretKey);
        const decoded = payload as unknown as JwtPayload;
        
        // Normalisation du rôle en minuscules pour éviter les erreurs de saisie
        const userRole = decoded.role?.toLowerCase();

        // Définition des zones
        const isDashboardAdmin = pathname.startsWith("/Dashboard") && !pathname.startsWith("/DashboardUser");
        const isDashboardUser = pathname.startsWith("/DashboardUser");

        // ------------------------------------
        // 4. LOGIQUE D'AUTORISATION
        // ------------------------------------

        // Cas ADMIN
        if (userRole === "admin") {
            // Si l'admin s'égare dans la zone user, on le ramène chez lui
            if (isDashboardUser) {
                return NextResponse.redirect(new URL("/Dashboard", req.url));
            }
            return NextResponse.next();
        }

        // Cas USER (Tout rôle qui n'est pas admin)
        if (isDashboardAdmin) {
            console.warn(`Accès refusé: ${decoded.email} tente d'accéder à la zone Admin.`);
            return NextResponse.redirect(new URL("/DashboardUser", req.url));
        }

        return NextResponse.next();

    } catch (err) {
        // 5. GESTION DES TOKENS INVALIDES / EXPIRÉS
        console.error("Erreur Middleware (JWT):", err);
        
        // On nettoie le cookie et on renvoie à la case départ
        const response = NextResponse.redirect(new URL("/auth", req.url));
        response.cookies.delete("token");
        return response;
    }
}

// --- CONFIGURATION DU MATCHER ---
export const config = {
    /*
     * Match toutes les routes sauf celles commençant par :
     * - api/auth (authentification)
     * - _next/static (fichiers statiques)
     * - _next/image (images)
     * - favicon.ico (icône navigateur)
     */
    matcher: [
        '/((?!api/auth|_next/static|_next/image|favicon.ico|auth).*)',
        '/Dashboard/:path*',
        '/DashboardUser/:path*',
    ],
};