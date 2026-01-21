import * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { Trash, Edit } from "lucide-react";

export default function DeleteMouvement({
  id,
  onDeletes,
}: {
  id: string;
  onDeletes: (id: string) => void;
}) {
    const [loading, setLoading] = useState(false);
  const handleDeleteProduit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/mouvements/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("mouvement supprimé avec succès ✅");
        onDeletes(id);
        window.dispatchEvent(new Event("produitAdded"));

      } else {
        toast.error(result.error || "Erreur lors de la suppression ❌");
      }
    } catch (err) {
      toast.error("Une erreur est survenue");
     } finally {
    setLoading(false);
  }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger className="text-white ">
        <Trash className="h-5 w-5 items-center cursor-pointer space-x-2 text-red-500" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription className="">
            Êtes-vous sûr de vouloir supprimer ce mouvement ? Cette action est
            irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 text-white"
            onClick={(e) => {
              e.preventDefault(); 
              handleDeleteProduit();
            }}
          >
            {loading ? "Suppression..." : "Confirmer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
