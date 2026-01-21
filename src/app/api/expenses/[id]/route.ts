import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ─── GET ONE EXPENSE WITH NAMES ─────────────────────────────

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Correct selon la doc Next.js 15+
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "ID non fourni." }, { status: 400 });
  }

  const expense = await prisma.expense.findUnique({
    where: { id },
    include: {
      rubrique: true,
      utilisateur: true,
    },
  });

  if (!expense) {
    return NextResponse.json({ error: "Dépense introuvable." }, { status: 404 });
  }

  return NextResponse.json({
    ...expense,
    rubriqueName: expense.rubrique?.name ?? null,
    utilisateurName: expense.utilisateur?.name ?? null, // attention à bien utiliser "utilisateur"
  });
}


// ─── HELPERS ─────────────────────────────
async function getRubriqueIdByName(name: string) {
  if (!name) return null;
  const rubrique = await prisma.rubrique.findFirst({ where: { name } });
  return rubrique?.id ?? null;
}
async function getUtilisateurIdByName(name: string) {
  if (!name) return null;
  const user = await prisma.utilisateur.findFirst({ where: { name } });
  return user?.id ?? null;
}

// ─── PUT : UPDATE EXPENSE BY NAME ─────────────────────────────
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    console.log("📩 Données reçues :", body);

    const rubriqueId = await getRubriqueIdByName(body.rubriqueName);
    const utilisateurId = await getUtilisateurIdByName(body.utilisateurName);

    const updateData = {
      libelle: body.libelle,
      beneficiaire: body.beneficiaire,
      amount: body.amount,
      fournisseur:body.fournisseur,
      devise: body.devise,
      rubriqueId: rubriqueId ?? undefined,
      utilisateurId: utilisateurId ?? undefined,
      updatedAt: new Date(),
    };

    console.log("➡️ Données à mettre à jour :", updateData);

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedExpense, { status: 200 });
  } catch (error) {
    console.error("❌ Erreur lors de l'update :", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour." }, { status: 500 });
  }
}

// // ─── DELETE ─────────────────────────────
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const expense = await prisma.expense.findUnique({ where: { id } });

    if (!expense) {
      return NextResponse.json(
        { error: "Dépense non trouvée ou déjà supprimée." },
        { status: 404 }
      );
    }

    await prisma.expense.delete({ where: { id } });

    return NextResponse.json({ message: "Dépense supprimée avec succès" });
  } catch (error) {
    console.error("Erreur de suppression:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}