// "use client";

// import * as React from "react";
// import { useEffect, useState, useMemo } from "react";
// import { toast } from "sonner";
// import { useCurrentUser } from "@/hooks/useCurrentUser";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Trash } from "lucide-react";

// interface OperationEmballage {
//   id: string;
//   produitFini: { id: string; nom: string; prix: number };
//   emballage: { id: string; nom: string; nombre_bars: number };
//   quantiteProduit: number;
//   quantiteEmballage: number;
//   prix: number;
// }

// interface LigneVenteCarton {
//   operationEmballageId: string;
//   nombreCartons: number; // nombre de cartons à vendre
// }

// interface AddVenteCartonProps {
//   onCloseds: () => void;
//   onAdd: (vente: any) => void;
// }

// export default function AddVenteCarton({
//   onCloseds,
//   onAdd,
// }: AddVenteCartonProps) {
//   const [loading, setLoading] = useState(false);
//   const [operations, setOperations] = useState<OperationEmballage[]>([]);
//   const { user } = useCurrentUser();
//   const [formData, setFormData] = useState<{
//     client: string;
//     utilisateurId: string;
//     lignes: LigneVenteCarton[];
//   }>({
//     client: "",
//     lignes: [],
//     utilisateurId: user?.id || "",
//   });

  
//   // useEffect(() => {
   

//   //   const handleAdded = () => fetchOperations();
//   //   window.addEventListener("venteAdded", handleAdded);
//   //   return () => window.removeEventListener("venteAdded", handleAdded);
//   // }, []);

//   // Ajouter une ligne
//   const ajouterLigne = () => {
//     setFormData((prev) => ({
//       ...prev,
//       lignes: [...prev.lignes, { operationEmballageId: "", nombreCartons: 1 }],
//     }));
//   };

//   // Supprimer une ligne
//   const supprimerLigne = (index: number) => {
//     setFormData((prev) => ({
//       ...prev,
//       lignes: prev.lignes.filter((_, i) => i !== index),
//     }));
//   };

//   // Mettre à jour l'opération sélectionnée
//   const updateOperation = (index: number, operationId: string) => {
//     const op = operations.find((o) => o.id === operationId);
//     if (!op) return;

//     if (op.quantiteEmballage === 0) {
//       toast(`L'opération "${op.produitFini.nom}" est vide !`);
//       return;
//     }

//     setFormData((prev) => {
//       const updated = [...prev.lignes];
//       updated[index] = {
//         ...updated[index],
//         operationEmballageId: operationId,
//         nombreCartons: 1,
//       };
//       return { ...prev, lignes: updated };
//     });
//   };

//   // Mettre à jour le nombre de cartons
//   const updateNombreCartons = (index: number, nombre: number) => {
//     const ligne = formData.lignes[index];
//     const op = operations.find((o) => o.id === ligne.operationEmballageId);
//     if (!op) return;

//     if (nombre > op.quantiteEmballage) {
//       toast(
//         `Nombre de cartons (${nombre}) dépasse le stock disponible (${op.quantiteEmballage}) pour "${op.produitFini.nom}"`
//       );
//       return;
//     }

//     setFormData((prev) => {
//       const updated = [...prev.lignes];
//       updated[index] = { ...updated[index], nombreCartons: nombre };
//       return { ...prev, lignes: updated };
//     });
//   };

//   // Calcul du total
//   const total = useMemo(() => {
//     return formData.lignes.reduce((acc, ligne) => {
//       const op = operations.find((o) => o.id === ligne.operationEmballageId);
//       if (!op) return acc;
//       const totalProduits = ligne.nombreCartons * op.emballage.nombre_bars;
//       return acc + totalProduits * op.produitFini.prix;
//     }, 0);
//   }, [formData.lignes, operations]);

//   // Soumission
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (formData.client.trim() === "" || formData.lignes.length === 0) {
//       toast.error("Veuillez saisir un client et au moins un emballage.");
//       return;
//     }

//     setLoading(true);
//     try {
//       // Préparer le body
//       const body = {
//         client: formData.client,
//         utilisateurId: formData.utilisateurId,
//         lignes: formData.lignes.map((ligne) => ({
//           operationEmballageId: ligne.operationEmballageId,
//           nombreCartons: ligne.nombreCartons,
//         })),
//       };

//       const res = await fetch("/api/ventes", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//       });

//       const result = await res.json();
//       if (!res.ok || !result.success) {
//         toast.error(result.message || "Échec de l’enregistrement.");
//         setFormData({
//           client: "",
//           utilisateurId: formData.utilisateurId,
//           lignes: [],
//         });
//         return;
//       }

//       toast.success("Vente par carton enregistrée ✅");
//       onAdd(result.data);
//       await fetchOperations();

//       // 🚨 Émettre l'événement global UNIQUEMENT après le succès pour les autres composants
//       window.dispatchEvent(new Event("venteAdded"));
//       onCloseds();
//       setFormData({
//         client: "",
//         utilisateurId: formData.utilisateurId,
//         lignes: [],
//       });
//     } catch (error: any) {
//       console.error(error);
//       toast.error(error.message || "Erreur serveur");
//     } finally {
//       setLoading(false);
//     }
//   };
//   // fusionner les opérations
//   const groupedOperations = operations.reduce((acc: any[], curr) => {
//     const found = acc.find(
//       (item) =>
//         item.produitFini.id === curr.produitFini.id &&
//         item.emballage.id === curr.emballage.id
//     );

//     if (found) {
//       found.quantiteEmballage += curr.quantiteEmballage; // additionner les quantités
//     } else {
//       acc.push({ ...curr }); // ajouter une nouvelle entrée
//     }

//     return acc;
//   }, []);

//   return (
//     <DialogContent className="text-gray-500 w-[90%] lg:w-[100%]">
//       <DialogHeader className="flex flex-col justify-start items-start">
//         <DialogTitle className="text-[#0EA5E9] ">
//           Nouvelle des articles
//         </DialogTitle>
//         <DialogDescription className=" text-start">
//           Saisissez le nom du client et sélectionnez les articles à vendre.
//         </DialogDescription>
//       </DialogHeader>

//       <form onSubmit={handleSubmit} className="text-gray-500 grid gap-4 py-4">
//         {/* Client */}
//         <div className="grid gap-2">
//           <Label htmlFor="client">Client</Label>
//           <Input
//             type="text"
//             value={formData.client}
//             onChange={(e) =>
//               setFormData((prev) => ({ ...prev, client: e.target.value }))
//             }
//             placeholder="Nom du client"
//           />
//         </div>

//         {/* Responsable */}
//         <div className="grid gap-2">
//           <Label>Responsable</Label>
//           <Select
//             value={formData.utilisateurId}
//             onValueChange={(val) =>
//               setFormData((prev) => ({ ...prev, utilisateurId: val }))
//             }
//           >
//             <SelectTrigger className="w-full">
//               <SelectValue placeholder="Sélectionnez le responsable" />
//             </SelectTrigger>
//             <SelectContent>
//               {user && <SelectItem value={user.id}>{user.email}</SelectItem>}
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Lignes ventes carton */}
//         <div className="grid gap-3">
//           <Label>article</Label>
//           <div className="space-y-3 pr-2 lg:max-h-[40vh] max-h-[25vh] overflow-y-auto">
//             {formData.lignes.map((ligne, index) => {
//               const op = operations.find(
//                 (o) => o.id === ligne.operationEmballageId
//               );
//               return (
//                 <div
//                   key={index}
//                   className="flex flex-col lg:flex-row justify-center items-center text-center gap-2 border p-3 rounded-md"
//                 >
//                   <Select
//                     value={ligne.operationEmballageId}
//                     onValueChange={(val) => updateOperation(index, val)}
//                   >
//                     <SelectTrigger className="w-full lg:w-2/3 h-12">
//                       <SelectValue placeholder="Sélectionner un emballage" />
//                     </SelectTrigger>
//                     {/* <SelectContent>
//                     {operations.map((o) => (
//                       <SelectItem key={o.id} value={o.id}>
//                         {o.produitFini.nom} - {o.emballage.nom} (
//                         {o.quantiteEmballage} dispo)
//                       </SelectItem>
//                     ))}
//                   </SelectContent> */}
//                     <SelectContent>
//                       {groupedOperations.map((o) => (
//                         <SelectItem key={o.id} value={o.id}>
//                           {o.produitFini.nom} - {o.emballage.nom} (
//                           {o.quantiteEmballage} dispo)
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>

//                   <Input
//                     type="number"
//                     min={1}
//                     value={ligne.nombreCartons}
//                     onChange={(e) =>
//                       updateNombreCartons(index, Number(e.target.value))
//                     }
//                     placeholder="Nombre de cartons"
//                     className="w-full lg:w-1/3 h-12"
//                   />
//                   <Trash
//                     onClick={() => supprimerLigne(index)}
//                     className="h-5 w-5 items-center cursor-pointer space-x-2 text-red-500"
//                   />
//                 </div>
//               );
//             })}
//           </div>

//           <Button
//             type="button"
//             className="cursor-pointer"
//             onClick={ajouterLigne}
//             variant="outline"
//           >
//             + Ajouter un article
//           </Button>
//         </div>

//         {/* Total */}
//         <div className="flex justify-between mt-3 text-lg font-semibold">
//           <span>Total :</span>
//           <span className="text-blue-600">{total.toFixed(2)} CDF</span>
//         </div>

//         {/* Boutons */}
//         <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-5 sm:justify-end">
//           <Button
//             type="button"
//             variant="outline"
//             onClick={onCloseds}
//             className="h-12"
//           >
//             Annuler
//           </Button>
//           <Button
//             type="submit"
//             disabled={loading}
//             className="bg-[#0EA5E9] cursor-pointer  hover:bg-[#7fc4f9] h-12"
//           >
//             {loading ? "Enregistrement..." : "Enregistrer"}
//           </Button>
//         </DialogFooter>
//       </form>
//     </DialogContent>
//   );
// }
