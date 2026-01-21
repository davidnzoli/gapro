import { prisma } from "@/lib/prisma";
import { NextResponse ,NextRequest} from "next/server";

export async function GET(req: NextRequest, context: { params: Promise<{}> }) {
  try {
    const expenses = await prisma.expense.findMany({
      select: {
        id: true,
        libelle: true,
        beneficiaire: true,
        amount: true,
        date: true,
        devise: true,
        fournisseur:true,
        createdAt: true,
        updatedAt: true,
        rubrique: { select: { name: true } },
        utilisateur: { select: { name: true } },
      },
    });

    const formatted = expenses.map((e:any) => ({
      ...e,
      rubriqueName: e.rubrique?.name || null,
      utilisateurName: e.utilisateur?.name || null,
      utilisateur: undefined,
      rubrique: undefined,
    }));

    const rubriques = await prisma.rubrique.findMany({
      select: { id: true, name: true },
    });

  
    return NextResponse.json(
      {
        success: true,
        message: "Liste des dépenses récupérée avec succès.",
        data: formatted,
        rubriques,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des dépenses :", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur. Impossible de récupérer les dépenses.",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("reponse a la requete :", body);
    const newExpense = await prisma.expense.create({
      data: {
        libelle: body.libelle || null,
        devise: body.devise || null,
        rubriqueId: body.rubriqueId || null,
        beneficiaire: body.beneficiaire || null,
        fournisseur: body.fournisseur || null,
        amount: parseFloat(body.amount),
        utilisateurId: body.utilisateurId || null,
      },
    });

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error: any) {
    console.error("❌ Erreur lors de la création :", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'ajout de dépense." },
      { status: 500 }
    );
  }
}