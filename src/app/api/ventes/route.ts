import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

// 1. Types pour la validation
interface LigneVenteInput {
  produitId: string;
  quantite: number;
}

interface VenteArticleBody {
  client: string;
  utilisateurId: string;
  lignes: LigneVenteInput[];
}

export async function GET() {
  try {
    const ventes = await prisma.vente.findMany({
      include: {
        client: true,
        ligneVente: { include: { produit: true } },
        utilisateur: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: ventes });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: VenteArticleBody = await req.json();
    const { client, utilisateurId, lignes } = body;

    if (!lignes || lignes.length === 0) {
      throw new Error("Le panier est vide.");
    }

    const result = await prisma.$transaction(
      async (tx) => {
        // 2. Gestion du Client (Trouver ou Créer)
        let clientRecord = await tx.client.findFirst({
          where: { nom: { equals: client, mode: "insensitive" } },
        });
        if (!clientRecord) {
          clientRecord = await tx.client.create({ data: { nom: client } });
        }

        let totalVenteGlobal = 0;
        // On définit le type pour éviter les erreurs TS sur le map plus bas
        const finalLignesData: {
          produitId: string;
          quantite: number;
          prixUnitaire: number;
          sousTotal: number;
        }[] = [];

        // 3. Boucle sur les produits pour vérifier le stock et calculer les prix
        for (const ligne of lignes) {
          const produit = await tx.produit.findUnique({
            where: { id: ligne.produitId },
          });

          if (!produit)
            throw new Error(`Produit ID ${ligne.produitId} introuvable.`);

          // Vérification du stock
          const stockDisponible = produit.stock_initial || 0;
          if (stockDisponible < ligne.quantite) {
            throw new Error(
              `Stock insuffisant pour ${produit.nom}. Disponible: ${stockDisponible}, Demandé: ${ligne.quantite}`
            );
          }

          const prixUnitaire = produit.prix || 0;
          const sousTotal = prixUnitaire * ligne.quantite;
          totalVenteGlobal += sousTotal;

          // Préparation des données
          finalLignesData.push({
            produitId: produit.id,
            quantite: ligne.quantite,
            prixUnitaire: prixUnitaire,
            sousTotal: sousTotal,
          });

          // 4. Mise à jour du stock (Décrémentation atomique)
          await tx.produit.update({
            where: { id: produit.id },
            data: { stock_initial: { decrement: ligne.quantite } },
          });

          // 5. Création du mouvement de stock pour la traçabilité
          await tx.mouvement.create({
            data: {
              produitId: produit.id,
              quantite: ligne.quantite,
              type: "SORTIE",
              observation: `Vente client: ${client}`,
            },
          });
        }

        // 6. Création de la Vente et de ses Lignes (Correction syntaxe Connect)
        const venteCreated = await tx.vente.create({
          data: {
            clientId: clientRecord.id,
            utilisateurId: utilisateurId,
            total: totalVenteGlobal,
            ligneVente: {
              create: finalLignesData.map((l) => ({
                quantite: l.quantite,
                prixUnitaire: l.prixUnitaire,
                sousTotal: l.sousTotal,
                // On transforme produitId en relation Prisma Connect
                produit: {
                  connect: { id: l.produitId }
                }
              })),
            },
          },
          include: { ligneVente: true },
        });

        return venteCreated;
      },
      { timeout: 20000 }
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Erreur vente produit:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Erreur lors de la vente" },
      { status: 500 }
    );
  }
}