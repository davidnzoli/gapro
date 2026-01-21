
import { prisma } from "@/lib/prisma";
import { NextResponse,NextRequest } from "next/server";

export async function GET() {
  try {
    const categorie = await prisma.categorie.findMany();

    return NextResponse.json(
      {
        success: true,
        message: "Liste des categories récupérée avec succès.",
        data: categorie,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des categories :", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur. Impossible de récupérer les categories.",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const produit = await prisma.categorie.create({
      data: {
        nom: body.nom,
        designation: body.designation || null,
      },
    });

    console.log("POST /api/categorie - body:", body);

    return NextResponse.json({
      success: true,
      data: produit,
      message: "Catégorie ajoutée avec succès",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Erreur inconnue",
    }, { status: 500 });
  }
}