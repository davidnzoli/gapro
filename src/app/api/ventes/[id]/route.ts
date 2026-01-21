import { prisma } from "@/lib/prisma";
import { NextResponse,NextRequest } from "next/server";

// ✅ GET — Récupérer une vente par ID
export async function GET( request: NextRequest,
  context: { params: Promise<{ id: string }> }
) 
  {
  const { id } = await context.params;
  try {
    const vente = await prisma.vente.findUnique({
      where: { id },
      include: {
        ligneVente: {
          include: { produit: { select: { nom: true } } },
        },
        utilisateur: { select: { name: true } },
         client: { select: { nom: true, contact:true } }
      },
    });
    console.log("resultat :", vente)

    if (!vente)
      return NextResponse.json(
        { error: "Vente introuvable." },
        { status: 404 }
      );
      console.log("resultat :", vente)
    return NextResponse.json(vente, { status: 200 });
  } catch (error) {
    console.error("Erreur GET /ventes/[id] :", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la vente." },
      { status: 500 }
    );
  }
}

// ✅ DELETE — Supprimer et annuler l'impact d'une vente (Version finale)
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    // 1. LIRE : Récupérer les informations de la vente avec les lignes,
    // en incluant l'ID de l'opération d'emballage qui a été touchée.
    const venteToDelete = await prisma.vente.findUnique({
      where: { id },
      include: {
        ligneVente: true, // Doit contenir operationEmballageId
      },
    });

    if (!venteToDelete) {
      return NextResponse.json(
        { error: "Vente non trouvée." },
        { status: 404 }
      );
    }

    // Utiliser une transaction pour garantir que soit tout est annulé, soit rien.
    await prisma.$transaction(async (tx: any) => {

      // 2. ANNULATION : Pour chaque ligne de vente, annuler la décrémentation sur l'opération.
      const mouvementsACreer = [];
      
      for (const ligne of venteToDelete.ligneVente) {
        const operationId = ligne.produitId;
        
        // La quantité de cartons vendus n'est pas stockée directement dans LigneVente,
        // mais nous devons la calculer à nouveau ou l'inclure dans LigneVente (recommandé).
        // Si vous stockez 'nombreCartons' dans LigneVente :
        // const nombreCartonsVendus = ligne.nombreCartons; 
        
       

        // Inverser la décrémentation de l'opération d'emballage.
        if (operationId) {
            
            // Rechercher l'opération de produit pour obtenir les détails de la conversion
            const operation = await tx.produit.findUnique({
                where: { id: operationId },
            });

            if (!operation) {
                // Gérer le cas où l'opération de stock a été supprimée après la vente
                throw new Error(`Produit ${operationId} liée à la vente est introuvable.`);
            }
            
            // Annulation du stock (Incrémenter les quantités décrémentées lors de la vente)
            await tx.produit.update({
                where: { id: operationId },
                data: {
                    stock_initial: { increment: ligne.quantite },       // ⬆️ Remet les unités
                },
            });
        }


        // 3. TRAÇABILITÉ : Créer un mouvement d'annulation
        mouvementsACreer.push({
            produitId: ligne.produitId,
            date_mouvement: new Date(),
            type: "ANNULATION_VENTE",
            quantite: ligne.quantite,
            observation: `Annulation de la vente ID: ${id}. Stock d'opération (${operationId}) réintégré.`,
        });
      }

      // 4. CRÉER : Les mouvements d'annulation
      if (mouvementsACreer.length > 0) {
        await tx.mouvement.createMany({
          data: mouvementsACreer,
        });
      }
      
      // 5. SUPPRESSION : Supprimer la vente et ses lignes
      await tx.ligneVente.deleteMany({ where: { venteId: id } });
      await tx.vente.delete({ where: { id } });

    }); // Fin de la transaction

    return NextResponse.json(
      { message: "Vente supprimée et stocks réintégrés avec succès." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur DELETE /ventes/[id] :", error);
    return NextResponse.json(
      { error: "Erreur lors de l'annulation et la suppression de la vente." },
      { status: 500 }
    );
  }
}

// // ✅ DELETE — Supprimer une vente
// export async function DELETE(req: NextRequest,
//   context: { params: Promise<{ id: string }> }) {
//   const { id } = await context.params;

//   try {
//     // Supprimer les lignes associées d'abord
//     await prisma.ligneVente.deleteMany({ where: { venteId: id } });

//     // Supprimer la vente
//     await prisma.vente.delete({ where: { id } });

//     return NextResponse.json(
//       { message: "Vente supprimée avec succès." },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Erreur DELETE /ventes/[id] :", error);
//     return NextResponse.json(
//       { error: "Erreur lors de la suppression de la vente." },
//       { status: 500 }
//     );
//   }
// }