import { NextResponse,NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "ID non fourni." }, { status: 400 });
  }

  try {
    const produit = await prisma.produit.findUnique({
      where: { id },
      include: { categorie: true },
    });

    if (!produit) {
      return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
    }

    // console.log("✅ result :", produit);

    return NextResponse.json(produit);
  } catch (error) {
    console.error("Erreur serveur :", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}


export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updateData = {
      nom: body.nom,
      unite: body.unite || null,
      seuil_minimum: body.seuil_minimum || null,
      stock_initial: body.stock_initial || null,
      prix:body.prix || null,
      nombre_bars:body.nombre_bars || null,
      updatedAt: new Date(),
    };

    const updatedProduit = await prisma.produit.update({
      where: { id },
      data: updateData,
    });

    console.log("les DR: ",updateData)
    return NextResponse.json(updatedProduit, { status: 200 });
  } catch (error) {
    console.error("❌ Erreur lors de l'update :", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const produit = await prisma.produit.findUnique({ where: { id } });

    if (!produit) {
      return NextResponse.json(
        { error: "Produit non trouvé ou déjà supprimé." },
        { status: 404 }
      );
    }

    // Supprimer toutes les opérations liées (EmballageOperation)
    await prisma.emballageOperation.deleteMany({
      where: {
        OR: [
          { produitFiniId: id },
          { emballageId: id },
        ],
      },
    });

    // Supprimer le produit
    await prisma.produit.delete({ where: { id } });

    return NextResponse.json({ message: "Produit supprimé avec succès" });
  } catch (error) {
    console.error("Erreur de suppression:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}


