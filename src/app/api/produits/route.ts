import { prisma } from "@/lib/prisma";
import { NextResponse,NextRequest } from "next/server";


export async function GET(req:NextRequest) {
  const { searchParams } = new URL(req.url);
  const categorieId = searchParams.get("categorieId");
  const produitId = searchParams.get("produitId"); 

  try {
    let produits;
if (produitId) {
      produits = await prisma.produit.findUnique({
        where: { id: produitId },
        include: { categorie: true },
      });}
    else if (categorieId) {
      produits = await prisma.produit.findMany({
        where: { categorieId: categorieId },
        include: { categorie: true },
      });
    }
     else {
      produits = await prisma.produit.findMany({
        include: { categorie: true },
      });
    }
    return NextResponse.json({ success: true, data: produits });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const produit = await prisma.produit.create({
      data: {
        nom: body.nom,
        categorieId: body.categorieId,
        stock_initial: body.stock_initial,
        prix: body.prix || null,
        seuil_minimum: body.seuil_minimum,
        nombre_bars:body.nombre_bars || null,
      },
      include: { categorie: true },
    });

    console.log("POST /api/produits body:", body);

    return NextResponse.json({
      success: true,
      data: produit,
      message: "Produit ajouté avec succès",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}