"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";
import { useMemo } from "react";
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
import { Trash } from "lucide-react";

interface ItemsProduit {
  id: string;
  nom: string;
  categorieId: string;
  stock_initial: number | null;
  seuil_minimum: number | null;
  nombre_bars: number | null;
  prix: number;
  date_creation: string;
  categorie?: { id: string; nom: string };
}

interface LigneVente {
  produitId: string;
  quantite: number;
  prix_unitaire: number;
}

interface AddVenteProps {
  onClosed: () => void;
  onAdd: (vente: any) => void;
}

export default function AddVente({ onClosed, onAdd }: AddVenteProps) {
  const [loading, setLoading] = useState(false);
  const [produits, setProduits] = useState<ItemsProduit[]>([]);
  const { user, error, refresh } = useCurrentUser();
  const [formData, setFormData] = useState<{
    client: string;
    dateVente: string;
    utilisateurId: string;
    lignes: LigneVente[];
  }>({
    client: "",
    dateVente: new Date().toISOString().split("T")[0],
    lignes: [],
    utilisateurId: "",
  });

  const submittingRef = React.useRef(false);


  // Charger les produits
 const fetchProduits = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/produits", { method: "GET" });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message);

      const produits = result.data as ItemsProduit[];

    setProduits(produits)
     
    } catch (error) {
      console.error("Erreur lors de la récupération des produits :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      fetchProduits();
      const handleProduitAddedEvent = () => fetchProduits();
      window.addEventListener("produitAdded", handleProduitAddedEvent);
  
      return () => {
        window.removeEventListener("produitAdded", handleProduitAddedEvent);
      };
    }, []);

    

  // Ajouter une ligne
  const ajouterLigne = () => {
    setFormData((prev) => ({
      ...prev,
      lignes: [
        ...prev.lignes,
        { produitId: "", quantite: 1, prix_unitaire: 0 },
      ],
    }));
  };

  // Supprimer une ligne
  const supprimerLigne = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      lignes: prev.lignes.filter((_, i) => i !== index),
    }));
  };

  // Mettre à jour un produit sélectionné
  const updateProduit = (index: number, produitId: string) => {
    const produit = produits.find((p) => p.id === produitId);
    if (!produit) return;

    // 🔎 Vérification stock avant mise à jour
    if (!produit.stock_initial || produit.stock_initial === 0) {
      toast(`Le produit "${produit.nom}" est en rupture de stock !`);
      return;
    }

    setFormData((prev) => {
      const updated = [...prev.lignes];
      updated[index] = {
        ...updated[index],
        produitId,
        prix_unitaire: produit.prix,
        quantite: 1, // Valeur par défaut si rien n'est encore saisi
      };
      return { ...prev, lignes: updated };
    });
  };

  // Mettre à jour la quantité
  const updateQuantite = (index: number, quantite: number) => {
    const ligne = formData.lignes[index];
    const produit = produits.find((p) => p.id === ligne.produitId);
    if (!produit) return;

    // 🔎 Vérification du stock disponible
    if (!produit.stock_initial || produit.stock_initial === 0) {
      toast(`Le produit "${produit.nom}" est en rupture de stock !`);
      return;
    }

    if (quantite > produit.stock_initial) {
      toast(
        `Quantité demandée (${quantite}) dépasse le stock disponible (${produit.stock_initial}) pour "${produit.nom}".`
      );
      return;
    }

    // ✅ Mise à jour si tout est correct
    setFormData((prev) => {
      const updated = [...prev.lignes];
      updated[index] = {
        ...updated[index],
        quantite,
      };
      return { ...prev, lignes: updated };
    });
  };

  // Calcul du total
  const total = useMemo(() => {
    return formData.lignes.reduce(
      (acc, item) => acc + (item.quantite || 0) * (item.prix_unitaire || 0),
      0
    );
  }, [formData.lignes]);


  // Soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);

    if (!formData.client || formData.lignes.length === 0) {
      toast.error("Veuillez saisir un client et au moins un produit.");
      setLoading(false);
      submittingRef.current = false;
      return;
    }

    try {
      // Préparer le body correctement
      const body = {
        client: formData.client,
        lignes: formData.lignes.map((ligne) => ({
          produitId: ligne.produitId,
          quantite: ligne.quantite,
          prixUnitaire:
            produits.find((p) => p.id === ligne.produitId)?.prix || 0,
        })),
        utilisateurId: formData.utilisateurId || undefined,
      };

      console.log("Payload envoyé:", body);

      const res = await fetch("/api/ventes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body), // <-- envoyer 'body' et non 'formData'
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        toast.error(result.message || "Échec de l’enregistrement.");
        setFormData({
          client: "",
          dateVente: new Date().toISOString().split("T")[0],
          lignes: [],
          utilisateurId: formData.utilisateurId,
        });
        return;
      }
      console.log("🧮 Total calculé côté serveur :", total);

      toast.success("Vente enregistrée avec succès ✅");
      onAdd(result.data);

      onClosed();
      await fetchProduits();
      // 🚨 Émettre l'événement global UNIQUEMENT après le succès pour les autres composants
      window.dispatchEvent(new Event("venteAdded"));
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur inconnue");
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  return (
    <DialogContent className="text-gray-500 w-[90%] lg:w-[100%]">
      <DialogHeader className="flex flex-col justify-start items-start">
        <DialogTitle className="text-[#0EA5E9] ">
          Nouvelle des articles
        </DialogTitle>
        <DialogDescription className=" text-start">
          Saisissez le nom du client et sélectionnez les articles à vendre.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="text-gray-500 grid gap-4 py-4">
        {/* Client */}
        <div className="grid gap-2">
          <Label htmlFor="client">Client</Label>
          <Input
            type="text"
            value={formData.client}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, client: e.target.value }))
            }
            placeholder="Nom du client"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="libele">Responsable</Label>
          <Select
            value={formData.utilisateurId}
            required
            onValueChange={(val) =>
              setFormData((prev) => ({ ...prev, utilisateurId: val }))
            }
          >
            <SelectTrigger id="responsable" className="w-full">
              <SelectValue placeholder="Sélectionnez le responsable" />
            </SelectTrigger>
            <SelectContent className="w-full">
              {user && (
                <SelectItem
                  key={user.id}
                  value={user.id}
                  className="hover:bg-[#4895b7] hover:text-white"
                >
                  {user.email}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Lignes produits */}
        <div className="grid gap-3">
          <Label>Produits</Label>
          {formData.lignes.map((ligne, index) => (
            <div
              key={index}
              className="flex flex-col lg:flex-row gap-2 justify-center items-center text-center border p-3 rounded-md"
            >
              <Select
                value={ligne.produitId}
                onValueChange={(val) => updateProduit(index, val)}
              >
                <SelectTrigger className="w-full lg:w-2/3 h-12">
                  <SelectValue placeholder="Sélectionner un produit" />
                </SelectTrigger>
                <SelectContent>
                  {produits.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                value={ligne.quantite}
                min={1}
                onChange={(e) => updateQuantite(index, Number(e.target.value))}
                placeholder="Quantité"
                className="w-full lg:w-1/3"
              />
              <Trash
                onClick={() => supprimerLigne(index)}
                className="h-5 w-5 items-center cursor-pointer space-x-2 text-red-500"
              />
            </div>
          ))}
          <Button
            type="button"
            className="cursor-pointer"
            onClick={ajouterLigne}
            variant="outline"
          >
            + Ajouter un produit
          </Button>
        </div>

        {/* Total */}
        <div className="flex justify-between mt-3 text-lg font-semibold">
          <span>Total :</span>
          <span className="text-blue-600">{total.toFixed(2)}</span>
        </div>

        {/* Boutons */}
        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-5 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClosed}
            className="h-12"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#0EA5E9] cursor-pointer hover:bg-[#7fc4f9] h-12"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
