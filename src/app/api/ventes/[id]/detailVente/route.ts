
import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function GET (req:NextRequest, context: { params: Promise<{ id: string }> } ){
    const {id} = await context.params;
    try{
        const DetailVente = await prisma.vente.findUnique({
      where: { id },
      include: {
        ligneVente: {
          include: { produit: { select: { nom: true } } },
        },
        utilisateur: { select: { name: true } },
         client: { select: { nom: true, contact:true } }
      },
    });
    console.log("resultat :", DetailVente)

    if (!DetailVente)
      return NextResponse.json(
        { error: "Vente introuvable." },
        { status: 404 }
      );
      console.log("resultat :", DetailVente)
    return NextResponse.json(DetailVente, { status: 200 });
  } catch (error) {
    console.error("Erreur GET /ventes/[id] :", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la vente." },
      { status: 500 }
    );
  }
}