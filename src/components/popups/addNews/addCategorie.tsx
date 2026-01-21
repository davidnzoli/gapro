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

interface CategorieItems {
  id: string;
  nom: string;
  designation: string;
  date_categorie: string;
}

// const CategorieItems = [
//   { id: "PRODUIT_FINI", name: "Produit Fini" },
//   { id: "EMBALLAGE", name: "Emballage" },
// ];

interface AddDataDialogContent {
  onClosed: () => void;
  onAddCat: (categorie: CategorieItems) => void;
}

export default function AddCategorie({ onClosed, onAddCat }: AddDataDialogContent) {
  const [loading, setLoading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    nom: "",
    designation: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submittingRef = React.useRef(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (submittingRef.current) return;
  submittingRef.current = true;
    setLoading(true);

    if (!formData.nom) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      setLoading(false);
      return;
    }

    const data = { 
      nom: formData.nom,
      designation: formData.designation,
    };

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      console.log(result.data)
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Erreur lors de l'ajout du catégorie.");
      }

      const nouveauProduit: CategorieItems = result.data;
      onAddCat(nouveauProduit);

      toast.success("Produit enregistré avec succès ✅");
      formData.nom = "",
      formData.designation=""
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
      <DialogHeader>
        <DialogTitle className="text-[#0EA5E9]">Ajoutez une catégorie</DialogTitle>
        <DialogDescription>
          Remplissez le formulaire ci-dessous pour ajouter une nouvelle catégorie.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="nom">Nom de la catégorie</Label>
          <Input
            id="nom"
            name="nom"
            type="text"
            value={formData.nom}
            onChange={handleChange}
            placeholder="Ex: Tecno"
            required
            className="w-full h-12"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="designation">Designation</Label>
          <Input
            id="designation"
            name="designation"
            type="text"
            value={formData.designation}
            onChange={handleChange}
            placeholder="Ex: text de designation"
            className="w-full h-12"
          />
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClosed}>
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#0EA5E9] hover:bg-[#7fc4f9]"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
