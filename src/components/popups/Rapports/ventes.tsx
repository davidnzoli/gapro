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

interface utilisateurItem {
  id: string;
  name: string;
  postnom: string;
  prenom: string;
  role: string;
}

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

export default function RapportVenteEvent() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategorieItems[]>([]);
  const [produits, setProduits] = useState<ProduitItem[]>([]);
  const [produitIdParCat, setproduitIdParCat] = useState<ProduitItem[]>([]);
  const [selectedCategorieId, setSelectedCategorieId] = useState("");
  const [produitSelectionne, setProduitSelectionne] =
    useState<ProduitItem | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const componentRef = useRef<HTMLDivElement>(null);
  const [users, setUsers] = useState<utilisateurItem[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProduits = async () => {
      const res = await fetch("/api/produits");
      const data = await res.json();
      setProduits(data.data);
    };
    fetchProduits();
  }, []);

  useEffect(() => {
    const FetchUsers = async () => {
      const res = await fetch("/api/auth/register");
      const data = await res.json();
      setUsers(data.data);
    };

    FetchUsers();
  }, []);

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

  //fonction pour l'impression

  const handelPrint = useReactToPrint({
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
  return (
    <TabsContent value="ventes" className="w-full">
      <form onSubmit={(e) => {}}>
        <div className="grid sm:grid-cols-1 gap-4 w-[100%]">
          <div>
            <Label>Date de début</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-[100%] h-12"
            />
          </div>
          <div>
            <Label>Date de fin</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-[100%] h-12"
            />
          </div>
          <div>
            <Label>La marque</Label>
            <Select onValueChange={handleCategorieChange}>
              <SelectTrigger className="w-[100%] h-12">
                <SelectValue placeholder="Sélectionnez la marque" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((itm) => (
                  <SelectItem key={itm.id} value={itm.id}>
                    {itm.nom.replace("-", "")}
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
            <Label>Agent résponsable</Label>
            <Select
            // value={selectUser}
            // onValueChange={(value) => {
            //   setSelectUser(value);
            // }}
            >
              <SelectTrigger className="w-[100%] h-12">
                <SelectValue placeholder="Sélectionnez l'agent" />
              </SelectTrigger>

              <SelectContent>
                {users.map((itm) => (
                  <SelectItem key={itm.id} value={itm.id}>
                    {itm.name.replace("-", "")} {""} {itm.postnom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-[100%] h-12 bg-[#0EA5E9] hover:bg-[#7dd1f7] cursor-pointer"
          >
            {loading ? "Générer..." : "Générer"}
          </Button>
        </div>
      </form>
    </TabsContent>
  );
}
