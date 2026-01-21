"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Box, Package } from "lucide-react";
import { SelectViewport } from "@radix-ui/react-select";
import { toast } from "sonner";
interface ItemsProduit {
  id: string;
  nom: string;
  categorieId: string;
  stock_initial: number | null;
  seuil_minimum: number | null;
  nombre_bars: number | null;
  date_creation: string;
  categorie?: { id: string; nom: string };
}

interface SheetDemoBoxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produitId: string | null;
}

export function SheetDemoBox({
  open,
  onOpenChange,
  produitId,
}: SheetDemoBoxProps) {
  const [produit, setProduit] = useState<ItemsProduit | null>(null);
  const [produitsFini, setProduitsFini] = useState<ItemsProduit[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduitFini, setSelectedProduitFini] = useState<string | null>(
    null
  );
  const [quantiteProduit, setQuantiteProduit] = useState<number>(0);
  const [quantiteEmballage, setQuantiteEmballage] = useState<number>(0);
  const fetchProduits = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/produits", { method: "GET" });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message);

      const produits = result.data as ItemsProduit[];
      console.log(
        "prod::",
        produits.filter(
          (p) =>
            normalizeString(p.categorie?.nom) ===
            normalizeString("matiere premiere")
        )
      );

      function normalizeString(str: string | undefined) {
        return str
          ? str
              .normalize("NFD") // décompose les accents
              .replace(/[\u0300-\u036f]/g, "") // supprime les accents
              .replace(/\s+/g, " ") // remplace plusieurs espaces par un seul
              .trim() // supprime espaces en début/fin
              .toLowerCase() // met en minuscules
          : "";
      }

      setProduitsFini(
        produits.filter(
          (p) =>
            normalizeString(p.categorie?.nom) ===
            normalizeString("produit fini")
        )
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des produits :", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProduitId = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/produits/${id}`);
      
      const data = await res.json();
      console.log("le donnees : ", data)
      if (!res.ok) throw new Error("Erreur lors de la récupération");
      setProduit(data);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!produit) return alert("Aucun emballage sélectionné !");
    if (!selectedProduitFini)
      return toast.error("Sélectionnez un produit fini.");
    if (produit.stock_initial === 0)
      return toast.error("Impossible : le stock de cet emballage est vide !");
    if (!produit.nombre_bars)
      return toast.error(
        "Impossible : le nombre de bars de cet emballage n'est pas défini."
      );

    // Vérifier correspondance quantité

    // const totalBarsDisponibles = (produit.nombre_bars || 0) * quantiteEmballage;
    // if (quantiteProduit !== totalBarsDisponibles) {
    //   return toast.message(
    //     `Incohérence : ${quantiteEmballage} emballage(s) × ${produit.nombre_bars} bars = ${totalBarsDisponibles} produits attendus, mais vous avez saisi ${quantiteProduit}.`
    //   );
    // }
    
    try {
      setLoading(true);
      const res = await fetch("/api/operationBoxs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produitFiniId: selectedProduitFini,
          emballageId: produit.id,
          quantiteProduit,
          quantiteEmballage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Erreur lors de l'enregistrement");
      } else {
        toast.success("Opération enregistrée avec succès !");
        onOpenChange(false);
        const event = new Event("produitAdded");
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur d'enregistrement. Vérifiez la console.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (produitId) {
      fetchProduitId(produitId);
      fetchProduits();
    }
  }, [produitId]);

  if (!produit) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/20 transition-opacity ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => onOpenChange(false)}
      />

      <div
        className={`fixed top-0 flex right-0 h-full lg:w-[40%] w-[80%] pt-24 pb-16 bg-white shadow-lg transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="text-gray-500 p-6 flex flex-col items-start justify-start w-full gap-8 h-full">
          <h1 className="text-[#0EA5E9] text-lg font-bold text-start flex-col justify-center items-center">
            Opération Emballage
            <span>
              {" "}
              <h1 className="text-start font-normal text-sm text-gray-600">
                Remplissez le formulaire ci-dessous pour faire l'opération de la
                mise en emballage
              </h1>
            </span>
          </h1>

          <div className="w-full h-48 border p-4 rounded-sm shadow-sm flex flex-col justify-end items-start gap-5 border-gray-300">
            <h1 className=" bg-[#eef2fe] relative p-3 w-[100px] h-12 gap-4 rounded-r-full flex flex-col justify-center items-center text-[#0EA5E9]">
             
             
                <span className="lg:text-lg text-md absolute bottom-  text-[#0EA5E9] font-medium">
                  {produit.nombre_bars || "-"} Barres
                </span>
            </h1>
            <div className="flex justify-between items-end w-full">
              <div className="flex flex-col justify-start gap-2 items-start w-full">
                <h2 className="text-xl text-md font-bold text-gray-800">
                  {produit.nom}
                </h2>
                <p className="text-sm text-gray-500">
                  Catégorie :{" "}
                  <span className="font-medium text-[#0EA5E9]">
                    {produit?.categorie?.nom || "—"}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Total en stock :{" "}
                  <span className="font-medium text-[#0EA5E9]">
                    {produit.stock_initial}
                  </span>
                </p>
              </div>
               
              <p className="">
                <Package className="w-6 h-6 text-success" />
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="text-gray-500 grid gap-4 py-4 w-full">
            <div className="grid gap-4 w-full">
              <div className="grid gap-2 w-[100%]">
                <Label htmlFor="produit fini">Produits Fini</Label>
                <Select
                  value={selectedProduitFini || ""}
                  onValueChange={(val) => setSelectedProduitFini(val)}
                >
                  <SelectTrigger id="categorie" className="w-full h-12">
                    <SelectValue placeholder="Sélectionner un produit fini" />
                  </SelectTrigger>
                  <SelectContent className="w-[90%]">
                    <SelectViewport className="max-h-60 overflow-y-auto">
                      {produitsFini.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.nom}
                        </SelectItem>
                      ))}
                    </SelectViewport>
                  </SelectContent>
                </Select>
              </div>
              {/* <div className="grid gap-2 w-[100%]">
                {" "}
                <Label htmlFor="quantiteProduit">Nombre de produits</Label>
                <Input
                  id="quantiteProduit"
                  name="quantiteProduit"
                  type="number"
                  placeholder="Ex: 9"
                  className="w-full h-12"
                  value={quantiteProduit || ""}
                  onChange={(e) =>
                    setQuantiteProduit(parseInt(e.target.value) || 0)
                  }
                />
              </div> */}
              <div className="grid gap-2 w-[100%]">
                <Label htmlFor="quantiteEmballage">
                  Nombre d'emballage {produit.nom}
                </Label>
                <Input
                  id="uantiteEmballage"
                  name="quantiteEmballage"
                  type="number"
                  placeholder="Ex: 100"
                  className="w-full h-12"
                  value={quantiteEmballage || ""}
                  onChange={(e) =>
                    setQuantiteEmballage(parseInt(e.target.value) || 0)
                  }
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#0EA5E9] hover:bg-[#7dc5fc] h-12 mt-10"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 "
            >
              Annuler
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
