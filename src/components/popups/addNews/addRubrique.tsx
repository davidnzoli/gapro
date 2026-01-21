"use client";

import * as React from "react";
import { toast } from "sonner";
import { useEffect } from "react";

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  // SelectViewport,
  SelectItem,
} from "@/components/ui/select";

import { SelectViewport } from "@radix-ui/react-select";

interface Rubrique {
  id: string;
  name: string;
}

interface AddDataDialogContent {
  onClosed: () => void;
}

export default function AddRubrique({ onClosed }: AddDataDialogContent) {
  const [Rubrique, setRubrique] = React.useState<Rubrique[]>([]);
  const [formData, setFormData] = React.useState({
    id: "",
    name: "",
  });

  async function fetchRubrique() {
    try {
      const res = await fetch("/api/rubriques");
      const result = await res.json();
      console.log("Réponse brute : ", result);

      if (!result || !Array.isArray(result.data)) {
        // console.error("Structure inattendue:", result);
        setRubrique([]);
        return;
      }

      setRubrique(result.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des service:", error);
      setRubrique([]);
    }
  }
  useEffect(() => {
    fetchRubrique();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!formData.serviceId) {
    //   toast.error("Veuillez sélectionner un service.");
    //   return;
    // }
    try {
      const res = await fetch("/api/rubriques", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      console.log(formData);
      if (!res.ok) {
        const err = await res.json();
        console.log(err);
        throw new Error(err.error || "Erreur lors de l'ajout de rubrique");
      }
      if (res.status === 409) {
        toast.error("Conflit de données : doublon détecté. Cette element existe déjà !");
      }
      setFormData({
        id: "",
        name: "",
      });
      onClosed();
      toast.success("Rubrique ajoutée avec succès ✅");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("expenseAdded"));
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout :", error);
      toast.error("Échec de l'ajout du rubrique ❌");
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="text-[#0EA5E9]">Ajouter une Rubrique</DialogTitle>
        <DialogDescription>
          Remplissez le formulaire ci-dessous pour ajouter une rubrique.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nom de Rubrique</Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: Ration"
            required
          />
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClosed}>
            Annuler
          </Button>
          <Button type="submit" className="bg-[#0EA5E9] hover:bg-[#7fc4f9]">Enregistrer</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}