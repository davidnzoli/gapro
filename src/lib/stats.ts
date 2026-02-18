
import { useReactToPrint } from "react-to-print";
import { prisma } from "./prisma";
import { toast } from "sonner";


interface PeriodData {
  totalVentes: number;
  totalProductionsEntree: number;
  totalProductionsSortie: number;
  totalProduitOperation: number;
  totalDepenses: number;
}

export async function getAggregatedData(
  startDate: Date,
  endDate: Date
): Promise<PeriodData> {
  try {
    // 1. Ventes Totales
    const ventesAggregate = await prisma.vente.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    // 2. Productions (ENTRÉES)
    const entreeAggregate = await prisma.mouvement.aggregate({
      _sum: { quantite: true },
      where: {
        type: "ENTREE",
        date_mouvement: { gte: startDate, lte: endDate }
      },
    });

    // 3. Sorties
    const sortiesAggregate = await prisma.mouvement.aggregate({
      _sum: { quantite: true },
      where: {
        type: "SORTIE",
        date_mouvement: { gte: startDate, lte: endDate },
      },
    });

    // 4. Stock Actuel des produits finis (Simulation de l'emballage)
    const stockFini = await prisma.produit.aggregate({
      _sum: { stock_initial: true }
    });

    return {
      totalVentes: ventesAggregate._sum.total || 0,
      totalProductionsEntree: Number(entreeAggregate._sum.quantite) || 0,
      totalProductionsSortie: Number(sortiesAggregate._sum.quantite) || 0,
      totalProduitOperation: Number(stockFini._sum.stock_initial) || 0,
      totalDepenses: 0, // À connecter avec votre table dépenses plus tard
    };
  } catch (error) {
    console.error("ERREUR PRISMA STATS:", error);
    throw error;
  }
}

