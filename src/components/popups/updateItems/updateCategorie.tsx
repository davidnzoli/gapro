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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UpdateProduitItemsProps {
  onClose: () => void;
  id: string;
  onUpdate: () => void;
}

export default function UpdatedCategorie({
  onClose,
  id,
  onUpdate,
}: UpdateProduitItemsProps) {
  const [nom, setNom] = React.useState("");
  const [designation, setDesignation] = React.useState("");

  const [loading, setLoading] = React.useState(false);



  React.useEffect(() => {
    const fetchCategorie = async () => {
      try {
        const res = await fetch(`/api/categories/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        // console.log("les dataz", data.categorie.nom);

        setNom(data.nom || "");
        setDesignation(data.designation || "");
         
        
      } catch (error) {
        console.error("Erreur lors du chargement de categores", error);
      }
    };

    if (id) fetchCategorie();
  }, [id]);

  React.useEffect(() => {
    async function fetchLists() {
      const res = await fetch("/api/categories");
      const result = await res.json(); 
    }

    fetchLists();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom,
          designation,
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
        <DialogTitle className="text-[#0EA5E9]">Modifier cette catégorie</DialogTitle>
        <DialogDescription>
          Remplissez le formulaire ci-dessous et cliquez sur Enregistrer.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="grid gap-4 py-4">

        <div className="grid gap-2 w-full">
          <Label htmlFor="nom">Entrer le nom de la catégorie</Label>
          <Input
            id="nom"
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            className="w-[100%] h-12"
          />
        </div>
         <div className="grid gap-2 w-full">
          <Label htmlFor="designation">Entrer la designation</Label>
          <Input
            id="designation"
            type="text"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            required
            className="w-[100%] h-12"
          />
        </div>
        
        <DialogFooter className="mt-4 flex flex-col gap-2 justify-end">
          <Button variant="outline" type="button" onClick={onClose} className="cursor-pointer" >
            Annuler
          </Button>
          <Button type="submit" disabled={loading} className="bg-[#0EA5E9] cursor-pointer hover:bg-[#7fc4f9]">
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
