"use client";
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ProduitItem {
  id: string;
  nom: string;
  unite: string;
  stock_initial: number | null;
  seuil_minimum: number | null;
  nombre_bars: string | null;
  date_creation: string;
  categorie?: { id: string; nom: string };
}

interface Mouvement {
  id: string;
  type: "ENTREE" | "SORTIE";
  quantite: number;
  produitId: string;
  observation?: string;
  date_mouvement: string;
  produit: ProduitItem;
}

interface CategorieItems {
  id: string;
  nom: string;
  designation: string;
  date_categorie: string;
}

interface AddDataDialogContent {
  onClosed: () => void;
}

export default function RapportProduitEvent() {
  const [loading, setLoading] = useState(false);
  const [produits, setProduits] = useState<ProduitItem[]>([]);
  const [mouvements, setMouvements] = useState<Mouvement[]>([]);
  const [totalEntree, setTotalEntree] = useState<number>(0);
  const [totalSortie, setTotalSortie] = useState<number>(0);
  const [StockFinale, setStockFinale] = useState<number>(0);
  const [produitSelectionne, setProduitSelectionne] =
    useState<ProduitItem | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mouvementsFiltres, setMouvementsFiltres] = useState<Mouvement[]>([]);
  const componentRef = useRef<HTMLDivElement>(null);
  const [produitIdParCat, setproduitIdParCat] = useState<ProduitItem[]>([]);
  const [selectedCategorieId, setSelectedCategorieId] = useState("");
  const [categories, setCategories] = useState<CategorieItems[]>([]);

  const handleCategorieChange = async (selectedId: string) => {
    setSelectedCategorieId(selectedId);

    if (!selectedId) {
      setproduitIdParCat([]);
      return;
    }

    try {
      const res = await fetch(`/api/produits?categorieId=${selectedId}`);
      const result = await res.json();
      console.log("Resultat par cat : ", result);
      if (result.success) {
        setproduitIdParCat(result.data);
        console.log("Resultat par cat .data : ", result.data);
      }
    } catch (error) {
      console.error("Erreur de chargement des produits :", error);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: produitSelectionne
      ? `Rapport_${produitSelectionne.nom}`
      : "Rapport",
    onAfterPrint: () => toast.message("Message Annulé"),
    onPrintError: (error) => {
      console.error("Erreur d'impression :", error);
      toast.error("Erreur lors de l'impression. Réessayez plus tard.");
    },
  });

  // Fetching categorie
  useEffect(() => {
    const fetchCategorie = async () => {
      try {
        const res = await fetch("/api/categories");
        const result = await res.json();
        console.log(result);
        if (res.ok && result.success) {
          setCategories(result.data);
          console.log(result.data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des catégories :", error);
        setCategories([]);
      }
    };

    fetchCategorie();
  }, []);

  // Fetching Produits
  useEffect(() => {
    const fetchProduits = async () => {
      const res = await fetch("/api/produits");
      const data = await res.json();
      setProduits(data.data);
    };
    fetchProduits();
  }, []);

  // Fetching and filtre mouvement par date selectionnee
  useEffect(() => {
    const fetchMouvements = async () => {
      if (!produitSelectionne || !startDate || !endDate) return;

      setLoading(true);
      try {
        const [res] = await Promise.all([fetch("/api/mouvements")]);

        const data = await res.json();

        const start = new Date(startDate + "T00:00:00").getTime();
        const end = new Date(endDate + "T23:59:59").getTime();

        // Filtrer mouvements classiques
        const filtresMouv = data.data.filter((m: Mouvement) => {
          const dateMouvement = new Date(m.date_mouvement).getTime();
          return (
            m.produitId.toString() === produitSelectionne.id.toString() &&
            dateMouvement >= start &&
            dateMouvement <= end
          );
        });

        const totalEntree = filtresMouv
          .filter((m: Mouvement) => m.type === "ENTREE")
          .reduce((acc: number, m: Mouvement) => acc + Number(m.quantite), 0);

        const totalSortie = filtresMouv
          .filter((m: Mouvement) => m.type === "SORTIE")
          .reduce((acc: number, m: Mouvement) => acc + Number(m.quantite), 0);

        // Combiner les mouvements pour affichage
        setMouvementsFiltres([...filtresMouv]);
        setTotalEntree(totalEntree);
        setTotalSortie(totalSortie);
        setStockFinale(totalEntree - totalSortie);
      } catch (err) {
        console.error("Erreur lors de la récupération des mouvements :", err);
        // Ici tu peux ajouter un toast si tu utilises sonner ou shadcn toast
        // toast({ title: "Erreur", description: "Impossible de récupérer les mouvements", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchMouvements();
  }, [produitSelectionne, startDate, endDate]);

  return (
    <TabsContent value="mouvements" className="w-full ">
      <form>
        <div className="grid sm:grid-cols-1 gap-4 w-[100%]">
          <div>
            <Label>Marque de Téléphone</Label>
            <Select onValueChange={handleCategorieChange}>
              <SelectTrigger className="w-[100%] h-12">
                <SelectValue placeholder="Choisissez une marque" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.nom.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Produit</Label>
            <Select
             
              onValueChange={(val) => {
                const p = produits.find((p) => p.id === val);
                setProduitSelectionne(p || null);
               
              }}
              disabled={!selectedCategorieId || produitIdParCat.length === 0}
            >
              <SelectTrigger className="w-[100%] h-12">
                <SelectValue
                  placeholder={
                    !selectedCategorieId
                      ? "Choisir une catégorie d'abord"
                      : produitIdParCat.length === 0
                      ? "Aucun produit trouvé"
                      : "Choisir un produit"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {produitIdParCat.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Date de début</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-[95%] lg:w-[100%] h-12"
            />
          </div>

          <div>
            <Label>Date de fin</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-[95%] lg:w-[100%] h-12"
            />
          </div>
        </div>
      </form>

      {produitSelectionne && (
        <div className=" mt-6 p-4 bg-white shadow rounded">
          <h2 className="text-xl font-semibold mb-4">
            {produitSelectionne.nom}
            {""}
            {produitSelectionne.nombre_bars} barres
          </h2>
          <div className="font-bold">
            <p>Total Entrées: {totalEntree == 0 ? 0 : totalEntree}</p>
            <p>Total Sorties: {totalSortie == 0 ? 0 : totalSortie}</p>
            <p>Stock final: {StockFinale == 0 ? 0 : StockFinale}</p>
          </div>

          {/* Div caché pour impression */}
          <div style={{ display: "none" }}>
            <div ref={componentRef}>
              <div className="flex flex-col w-[100%] p-10 justify-center gap-15 items-center">
                <div className="flex flex-col w-[100%] justify-center items-center font-bold text-gray-700">
                  <h1>GA-PRO BUSINESS</h1>
                  <div className="flex w-[100%] items-center  justify-center">
                    <Image
                      src="/gaprojob.png"
                      alt="logo"
                      width={100}
                      height={0}
                      className="rounded-xl m-0 object-cover p-2 "
                    />
                  </div>
                  <h1>RAPPORT SUR LE PRODUIT</h1>
                </div>

                <div className="flex flex-col w-[100%] gap-4 justify-center items-start">
                  <div className="flex flex-col w-[100%] gap-1 justify-center items-start">
                    <div className="w-[100%] flex justify-between items-end font-bold text-gray-700">
                      <div>
                        <h1 className="font-bold text-gray-700">
                          Rapport pour : {""}
                          {produitSelectionne?.nom}
                        </h1>
                        <h1 className="font-bold text-gray-700">
                          Id : {""} {produitSelectionne?.id}
                        </h1>
                        <h1 className="font-bold text-gray-700">
                          Date de l'impression : {""}
                          {new Date().toLocaleString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </h1>
                      </div>
                      <div className="flex flex-col justify-start items-end">
                        <h1>
                          {" "}
                          Du : {startDate} au {endDate}
                        </h1>
                        Numéro rapport :{" "}
                        {String(Math.floor(10000 + Math.random() * 90000))}
                      </div>
                    </div>
                    <table className="table-auto mt-10 border-collapse border w-full mb-4">
                      <thead>
                        <tr className="bg-[#eef2fe]">
                          <th className="border px-2 py-1">Date</th>
                          <th className="border px-2 py-1">Produit</th>
                          <th className="border px-2 py-1">Stock</th>
                          <th className="border px-2 py-1">Type</th>
                          <th className="border px-2 py-1">Observation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mouvementsFiltres.map((m) => {
                          const produitAssocie = produits.find(
                            (p) => p.id === m.produitId
                          );
                          const categorieNom =
                            produitAssocie?.categorie?.nom || "—";

                          return (
                            <tr key={m.id}>
                              <td className="border px-2 py-1">
                                {new Date(
                                  m.date_mouvement
                                ).toLocaleDateString()}
                              </td>
                              <td className="border px-2 py-1">
                                {categorieNom}{" "}
                                {produitAssocie?.nom || "Emballage"}
                              </td>
                              <td className="border px-2 py-1">{m.quantite}</td>
                              <td className="border px-2 py-1">{m.type}</td>
                              <td className="border px-2 py-1">
                                {m.observation || "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>

                      <tbody>
                        {/* Ligne 1 : 3 colonnes alignées */}
                        <tr>
                          <td className="border px-2 py-1 font-semibold text-gray-700">
                            Total Entrées : {totalEntree}
                          </td>
                          <td className="border px-2 py-1 font-semibold text-gray-700">
                            Total Sorties : {totalSortie}
                          </td>
                          <td className="border px-2 py-1 font-semibold text-gray-700">
                            Stock final : {StockFinale}
                          </td>
                          <td
                            className=" px-2 py-1 text-center font-semibold text-gray-700"
                            colSpan={2}
                          >
                            Signature
                          </td>
                        </tr>

                        {/* Ligne 2 : occupe toute la largeur */}
                        <tr>
                          <td
                            className="border font-bold text-gray-700 px-2 py-1 text-center bg-gray-50"
                            colSpan={3}
                          >
                            Stock initial : {produitSelectionne?.stock_initial}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handlePrint}
            className="mt-4 w-[100%] cursor-pointer h-12 bg-[#0EA5E9] hover:bg-[#7dd1f7]"
          >
            {loading ? "Imprimer..." : "Imprimer le rapport"}
          </Button>
        </div>
      )}
    </TabsContent>
  );
}
