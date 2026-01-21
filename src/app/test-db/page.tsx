import { prisma } from "@/lib/prisma";

export default async function TestConnectionPage() {
  try {
    // 1. Tentative de connexion et lecture
    // Remplace 'utilisateur' par le nom d'une de tes tables (en minuscule)
    const result = await prisma.$queryRaw`SELECT 1 as connection`;
    
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: 'green' }}>✅ Connexion Réussie !</h1>
        <p>Prisma a réussi à communiquer avec Neon via l'adaptateur WebSocket.</p>
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </div>
    );
  } catch (error) {
    console.error("Erreur de connexion :", error);
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: 'red' }}>❌ Échec de la connexion</h1>
        <p>Erreur : {error instanceof Error ? error.message : "Erreur inconnue"}</p>
        <p>Vérifie tes variables d'environnement dans <code>.env</code></p>
      </div>
    );
  }
}