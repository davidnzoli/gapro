import { NextResponse,NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "secret_key_temporaire";

export async function GET(req: NextRequest) {
 try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value; // Plus simple et fiable

    if (!token) {
      console.log("Aucun token trouvé dans les cookies");
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    console.log("Token reçu :", token);
console.log("Secret utilisé :", SECRET);

    // Vérifier et décoder le JWT
    const payload = jwt.verify(token, SECRET) as { id: string; email: string; role: string };

    // Récupérer l'utilisateur depuis la base (sans le mot de passe)
    const user = await prisma.utilisateur.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 404 });
    }

    return NextResponse.json({ authenticated: true, user });
  } catch (err) {
    console.error("Erreur /api/auth/me:", err);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
