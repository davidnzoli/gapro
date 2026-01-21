import { NextResponse,NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest,
  context: { }) {
  try {
    const mouvements = await prisma.mouvement.findMany({
      include: {
        produit: true,
      },
      orderBy: { date_mouvement: "desc" },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Liste des mouvements récupérée avec succès.",
        data: mouvements,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des mouvements :", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur. Impossible de récupérer les mouvements.",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { produitId, type, quantite, observation,unite } = await req.json();

    if (type !== "ENTREE" && type !== "SORTIE") {
      return NextResponse.json(
        { error: "Type de mouvement invalide" },
        { status: 400 }
      );
    }

    const quantiteNum = Number(quantite);
    if (isNaN(quantiteNum) || quantiteNum <= 0) {
      return NextResponse.json({ error: "Quantité invalide" }, { status: 400 });
    }

    const produit = await prisma.produit.findUnique({
      where: { id: produitId },
    });
    if (!produit)
      return NextResponse.json(
        { error: "Produit introuvable" },
        { status: 404 }
      );

    const stockInitialNum = Number(produit.stock_initial) || 0;
    const nouveauStock =
      type === "ENTREE"
        ? stockInitialNum + quantiteNum
        : stockInitialNum - quantiteNum;

    if (type === "SORTIE" && quantiteNum > stockInitialNum) {
      return NextResponse.json(
        { error: "Quantité supérieure au stock disponible" },
        { status: 400 }
      );
    }

    const mouvement = await prisma.mouvement.create({
      data: {
        produitId,
        type: type,
        quantite: quantiteNum,
        observation: observation || null,
        unite: unite || null
      },
      include: { produit: true },
    });

    await prisma.produit.update({
      where: { id: produitId },
      data: { stock_initial: nouveauStock },
    });

    return NextResponse.json({
      success: true,
      message: "Mouvement enregistré",
      mouvement,
    });
  } catch (error) {
    console.error("Erreur POST /api/mouvements :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}