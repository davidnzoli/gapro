import { NextResponse,NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// export async function GET(request: Request, context: { params: { id: string } }) {
//   const { id } = context.params;

//   if (!id) {
//     return NextResponse.json({ error: "ID non fourni." }, { status: 400 });
//   }

//   const expense = await prisma.produit.findUnique({
//     where: { id },
//   });

//   if (!expense) {
//     return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
//   }

//   return NextResponse.json({ ...expense });
// }


// export async function PUT(request: Request, context: { params: { id: string } }) {
//   try {
//     const { id } = context.params;
//     const body = await request.json();

//     const updateData = {
//       nom: body.nom,
//       unite: body.unite,
//       seuil_minimum: body.seuil_minimum,
//       stock_initial: body.stock_initial,
//       updatedAt: new Date(),
//     };

//     const updatedProduit = await prisma.produit.update({
//       where: { id },
//       data: updateData,
//     });

//     return NextResponse.json(updatedProduit, { status: 200 });
//   } catch (error) {
//     console.error("❌ Erreur lors de l'update :", error);
//     return NextResponse.json({ error: "Erreur lors de la mise à jour." }, { status: 500 });
//   }
// }


export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // On définit "tx" comme argument de la fonction fléchée
    const result = await prisma.$transaction(async (tx) => {
      const mouvement = await tx.mouvement.findUnique({ where: { id } });

      if (!mouvement || !mouvement.produitId) {
        throw new Error("Mouvement ou produit lié introuvable");
      }

      const produit = await tx.produit.findUnique({ 
        where: { id: mouvement.produitId } 
      });

      if (!produit) throw new Error("Produit introuvable");

      const quantite = Number(mouvement.quantite);
      const stockActuel = Number(produit.stock_initial || 0);
      
      let nouveauStock = mouvement.type === "ENTREE" 
        ? stockActuel - quantite 
        : stockActuel + quantite;

      await tx.produit.update({
        where: { id: produit.id },
        data: { stock_initial: nouveauStock },
      });

      await tx.mouvement.delete({ where: { id } });

      return { success: true };
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Erreur DELETE:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}