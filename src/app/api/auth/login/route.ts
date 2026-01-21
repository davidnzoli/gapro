import { NextResponse,NextRequest } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "secret_key_temporaire";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const user = await prisma.utilisateur.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });

    const isValid = await compare(password, user.password);
    if (!isValid) return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, SECRET, {
      expiresIn: "1d",
    });

  const res = NextResponse.json({ success: true });

  // ✅ Important : cookie httpOnly + path root
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60,
    path: "/",
    sameSite: "strict",
  });

  return res;
}
 catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}


// import { NextResponse, NextRequest } from "next/server";
// import { compare } from "bcryptjs";
// import { prisma } from "@/lib/prisma";
// import jwt from "jsonwebtoken";

// export async function POST(req: NextRequest) {
//   try {
//     const { email, password } = await req.json();
//     const user = await prisma.utilisateur.findUnique({ where: { email } });
    
//     if (!user) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    
//     const isValid = await compare(password, user.password);
//     if (!isValid) return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });

//     // ... reste du code JWT ...
//     return NextResponse.json({ success: true });
//   } catch (err: any) {
//     console.error("ERREUR LOGIN:", err.message);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }