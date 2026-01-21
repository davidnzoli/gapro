import { NextResponse, NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await prisma.utilisateur.findMany();

    return NextResponse.json(
      {
        success: true,
        message: "Liste des utilisateurs récupérée avec succès.",
        data: user,
      },
      {
        status: 200,
      }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
export async function POST(req: NextRequest) {
  try {
    const {
      email,
      password,
      role,
      name,
      prenom,
      postnom,
      pays,
      ville,
      Etatcivil,
      commune,
      numerotelephone,
    } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    const userExist = await prisma.utilisateur.findUnique({ where: { email } });
    if (userExist) {
      return NextResponse.json(
        { error: "Cet utilisateur existe déjà" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const newUser = await prisma.utilisateur.create({
      data: {
        email,
        password: hashedPassword,
        role: role || "caissier",
        name,
        prenom,
        postnom,
        pays,
        ville,
        Etatcivil,
        commune,
        numerotelephone,
      },
    });

    return NextResponse.json({
      message: "Utilisateur créé avec succès",
      user: newUser,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}