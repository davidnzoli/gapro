"use client";

import * as React from "react";
import { toast } from "sonner";
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
import { SelectViewport } from "@radix-ui/react-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Devise } from "@/components/types/AllTypeTables";

interface UpdateProduitItemsProps {
  onClose: () => void;
  id: string;
  onUpdate: () => void;
}

export default function UpdatedProduit({
  onClose,
  id,
  onUpdate,
}: UpdateProduitItemsProps) {
  const [nom, setNom] = React.useState("");
  const [unite, setUnite] = React.useState("");
  const [seuil_minimum, setSeuil_minimum] = React.useState("");
  const [stock_initial, setStock_initial] = React.useState("");
  const [prix, setPrix] = React.useState("");
  const [devise, setDevise] = React.useState("");
  const [nombre_bars, setNombre_bars] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [produitFini, setProduitFini] = React.useState(false);
  const [Emballage, setEmballage] = React.useState(false);
  const [matierePremiere, setMatierePremiere] = React.useState(false);

  React.useEffect(() => {
    const fetchExpense = async () => {
      try {
        const res = await fetch(`/api/produits/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        console.log("les dataz", data.categorie.nom);

        setNom(data.nom || "");
        setUnite(data.unite || "");
        setPrix(data.prix || "");
        setDevise(data.devise || "")
        setNombre_bars(data.nombre_bars || "");
        setSeuil_minimum(data.seuil_minimum ? String(data.seuil_minimum) : "");
        setStock_initial(data.stock_initial ? String(data.stock_initial) : "");

        const nomCategorie = data.categorie?.nom || "";

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

        if (normalizeString(nomCategorie) === normalizeString("emballage")) {
          setEmballage(true);
        } else if (
          normalizeString(nomCategorie) === normalizeString("produit fini")
        ) {
          setProduitFini(true);
        } else if (
          normalizeString(nomCategorie) === normalizeString("matiere premiere")
        ) {
          setMatierePremiere(true);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de produit", error);
      }
    };

    if (id) fetchExpense();
  }, [id]);

  React.useEffect(() => {
    async function fetchLists() {
      const res = await fetch("/api/produits");
      const result = await res.json();
    }

    fetchLists();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`/api/produits/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom,
          unite,
          seuil_minimum: parseFloat(seuil_minimum) || null,
          stock_initial: parseFloat(stock_initial) || null,
          prix: parseFloat(prix) || null,
          devise,
          nombre_bars: parseFloat(nombre_bars) || null,
        }),
      });
      onUpdate();
      onClose();
      toast.success("Produit modifié avec succès ✅");
    } catch (error) {
      console.error("Erreur de mise à jour :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="text-[#0EA5E9]">
          Modifier ce Produit
        </DialogTitle>
        <DialogDescription>
          Remplissez le formulaire ci-dessous et cliquez sur Enregistrer.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        <div className="grid gap-2">
          <div className="grid gap-2 w-full">
            <Label htmlFor="nom">Nom</Label>
            <Input
              id="nom"
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid gap-2 w-full">
          <Label htmlFor="seuil_minimum">Seuil_minimum</Label>
          <Input
            id="seuil_minimum"
            type="number"
            value={seuil_minimum}
            onChange={(e) => setSeuil_minimum(e.target.value)}
            required
            className="w-[100%] h-12"
          />
        </div>
        <div className="grid gap-2 w-full">
          <Label htmlFor="prix">Prix unitaire</Label>
          <Input
            id="prix"
            type="number"
            value={prix}
            onChange={(e) => setPrix(e.target.value)}
            required
            className="w-[100%] h-12"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="devise">Devise</Label>
          <Select
            value={devise}
            required
            onValueChange={setDevise}
          >
            <SelectTrigger id="devise" className="w-full h-12">
              <SelectValue placeholder="Sélectionner une devise" />
            </SelectTrigger>
            <SelectContent className="w-[90%]">
              <SelectViewport className="max-h-60 overflow-y-auto">
                {Devise.map((cat) => (
                  <SelectItem key={cat.id} value={cat.indice2}>
                    {cat.designation}
                  </SelectItem>
                ))}
              </SelectViewport>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2 w-full">
          <Label htmlFor="stock_initial">stock_initial</Label>
          <Input
            id="stock_initial"
            type="number"
            value={stock_initial}
            onChange={(e) => setStock_initial(e.target.value)}
            required
            className="w-[100%] h-12"
          />
        </div>

        <DialogFooter className="mt-4 flex flex-col gap-2 justify-end">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            className="cursor-pointer"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#0EA5E9] cursor-pointer hover:bg-[#7fc4f9]"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
