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
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash, Edit } from "lucide-react";

export default function DeleteVente({
  id,
  onDeletes,
}: {
  id: string;
  onDeletes: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleDeleteVente = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ventes/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("vente supprimée avec succès ✅");
        onDeletes(id);
        window.dispatchEvent(new Event("venteAdded"));
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
      <AlertDialogTrigger  
       className="bg-red-500 font-normal flex items-center justify-center p-1 text-center text-[12px] xl:text-base  rounded-none cursor-pointer hover:bg-[#ce6d64]">
       
          <Trash className="h-5 w-5 items-center cursor-pointer space-x-2 text-blue-500" />
          Annuler la vente
     
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
              handleDeleteVente();
              router.push("/Dashboard/ventes")
            }}
            
          >
            {loading ? "Suppression..." : "Confirmer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
