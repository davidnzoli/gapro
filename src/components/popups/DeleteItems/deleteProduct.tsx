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
// export default function DeleteProduit({
//  id,
//   onDeletes,
//   onOpenChange,
// }: {
//   id: string;
//   onDeletes: (id: string) => void;
//   onOpenChange: (open: boolean) => void;
// }) {
//   const [loading, setLoading] = useState(false);
//   const handleDeleteProduit = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/produits/${id}`, { method: "DELETE" });
//       onDeletes(id);
//       const result = await res.json();

//       if (res.ok) {
//         toast.success("Produit supprimé avec succès ✅");
//         onDeletes(id);
//         onOpenChange(false);
//       } else {
//         toast.error(result.error || "Erreur lors de la suppression ❌");
//       }
//     } catch (err) {
//       toast.error("Une erreur est survenue");
//     } finally {
//       setLoading(false);
//     }
//   };
//   return (
//     <AlertDialog>
//       <AlertDialogTrigger className="text-white ">
//         <Trash className="h-5 w-5 items-center cursor-pointer space-x-2 text-red-500" />
//       </AlertDialogTrigger>
//       <AlertDialogContent>
//         <AlertDialogHeader>
//           <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
//           <AlertDialogDescription className="">
//             Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est
//             irréversible.
//           </AlertDialogDescription>
//         </AlertDialogHeader>
//         <AlertDialogFooter>
//           <AlertDialogCancel>Annuler</AlertDialogCancel>
//           <AlertDialogAction
//             className="bg-red-500 text-white"
//             onClick={(e) => {
//               e.preventDefault(); 
//               handleDeleteProduit();
//             }}
//           >
//             {loading ? "Suppression..." : "Confirmer"}
//           </AlertDialogAction>
//         </AlertDialogFooter>
//       </AlertDialogContent>
//     </AlertDialog>
//   );
// }

export default function DeleteProduit({
  id,
  onDeletes,
  open,
  onOpenChange,
}: {
  id: string;
  onDeletes: (id: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDeleteProduit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/produits/${id}`, { method: "DELETE" });
      const result = await res.json();

      if (res.ok) {
        toast.success("Produit supprimé avec succès ✅");
        onDeletes(id); // Supprime du tableau parent
        onOpenChange(false); // Ferme le popup
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger>
        <Trash className="h-5 w-5 cursor-pointer text-red-500" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est
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
