"use client";

import * as React from "react";
import { useEffect } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SelectViewport } from "@radix-ui/react-select";

interface ProduitItem {
  id: string;
  nom: string;
  categorieId: string;
  nombre_bars: number | null;
  stock_initial: number | null;
  prix: number | null;
  seuil_minimum: number | null;
  date_creation: string;
  categorie: {
    id: string;
    nom: string;
  };
}

interface ItemsCategorie {
  id: string;
  nom: string;
  designation: string;
  date_categorie: string;
}

interface AddDataDialogContent {
  onClosed: () => void;
  onAdd: (produit: ProduitItem) => void;
}

export default function AddProduit({ onClosed, onAdd }: AddDataDialogContent) {
  const [loading, setLoading] = React.useState(false);
  const [categorie, setCategorie] = React.useState<ItemsCategorie[]>([]);
  const [selectedCategorie, setSelectedCategorie] = React.useState<string>("");

  const [formData, setFormData] = React.useState({
    nom: "",
    categorieId: "",
    stock_initial: "",
    seuil_minimum: "",
    nombre_bars: "",
    prix: "",
    devise: "",
  });

  const Devise = [
    { id: "1", name: "Dollar Americain", indice: "USD" },
    { id: "2", name: "Francs Congolais", indice: "CDF" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchCategorie = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/categories", { method: "GET" });
        const result = await res.json();
        if (!res.ok || !result.success) toast.error("pas de resultat");
        setCategorie(result.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategorie();
  }, []);

  const submittingRef = React.useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);

    if (!formData.nom || !formData.categorieId) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      setLoading(false);
      submittingRef.current = false;
      return;
    }

    const data: any = {
      nom: formData.nom,
      categorieId: formData.categorieId,
      nombre_bars: formData.nombre_bars,
      prix: formData.prix !== "" ? Number(formData.prix) : 0,
      stock_initial:
        formData.stock_initial !== "" ? Number(formData.stock_initial) : 0,
      seuil_minimum:
        formData.seuil_minimum !== "" ? Number(formData.seuil_minimum) : 0,
        devise:formData.devise
    };

    try {
      const res = await fetch("/api/produits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      console.log("Resultats :", result);

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Erreur lors de l'ajout du produit.");
      }

      const nouveauProduit: ProduitItem = result.data;

      onAdd(nouveauProduit);

      toast.success("Produit enregistré avec succès ✅");
      const event = new Event("produitAdded");
      window.dispatchEvent(event);

      setFormData({
        nom: "",
        categorieId: "",
        stock_initial: "",
        seuil_minimum: "",
        nombre_bars: "",
        prix: "",
        devise:""
      });
      onClosed();
    } catch (error: any) {
      console.error("Erreur lors de l'ajout :", error);
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  return (
    <DialogContent className="w-[90%] lg:w-[100%]">
      <DialogHeader className="flex flex-col justify-start items-start">
        <DialogTitle className="text-[#0EA5E9]">Ajoutez un Produit</DialogTitle>
        <DialogDescription className="text-start">
          Remplissez le formulaire ci-dessous pour ajouter un nouveau produit.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="nom">Nom du produit</Label>
          <Input
            id="nom"
            name="nom"
            type="text"
            value={formData.nom}
            onChange={handleChange}
            placeholder="Ex: Iphone"
            required
            className="w-full h-12"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="categorie">Catégorie</Label>
          <Select
            value={formData.categorieId}
            required
            onValueChange={(val) => {
              setFormData((prev) => ({ ...prev, categorieId: val }));
              setSelectedCategorie(val);
            }}
          >
            <SelectTrigger id="categorie" className="w-full h-12">
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent className="w-[90%]">
              <SelectViewport className="max-h-60 overflow-y-auto">
                {categorie.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.nom}
                  </SelectItem>
                ))}
              </SelectViewport>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="devise">Devise</Label>
          <Select
            value={formData.devise}
            required
            onValueChange={(val) => {
              setFormData((prev) => ({ ...prev, devise: val }));
              setSelectedCategorie(val);
            }}
          >
            <SelectTrigger id="devise" className="w-full h-12">
              <SelectValue placeholder="Sélectionner une devise" />
            </SelectTrigger>
            <SelectContent className="w-[90%]">
              <SelectViewport className="max-h-60 overflow-y-auto">
                {Devise.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectViewport>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2 w-full">
          <Label htmlFor="prix">Prix unitaire</Label>
          <Input
            id="prix"
            name="prix"
            type="number"
            value={formData.prix}
            onChange={handleChange}
            required
            placeholder="Ex: 100"
            className="w-[100%] h-12"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="seuil_minimum">Seuil Minimum</Label>
          <Input
            id="seuil_minimum"
            name="seuil_minimum"
            type="number"
            value={formData.seuil_minimum}
            onChange={handleChange}
            placeholder="Ex: 10"
            className="w-full h-12"
          />
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-5 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClosed}
            className="h-12 cursor-pointer"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#0EA5E9] hover:bg-[#7fc4f9] h-12 cursor-pointer"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
