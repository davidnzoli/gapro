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
export default function DeleteExpense({
  id,
  onDeletes,
}: {
  id: string;
  onDeletes: (id: string) => void;
}) {
  const handleDeleteDepense = async () => {
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Depense supprimée avec succès ✅");
        onDeletes(id);
      } else {
        toast.error(result.error || "Erreur lors de la suppression ❌");
      }
    } catch (err) {
      toast.error("Une erreur est survenue");
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger className="text-white ">
        <Trash className="h-5 w-5 items-center cursor-pointer space-x-2 text-red-500" />

        {/* <Trash className="h-5 w-5 text-red-500" /> */}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription className="">
            Êtes-vous sûr de vouloir supprimer cette depense ? Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction className="bg-red-500 text-white" onClick={handleDeleteDepense}>
            Confirmer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}