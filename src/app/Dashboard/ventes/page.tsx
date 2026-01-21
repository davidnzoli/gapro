"use client";

import * as React from "react";
import { useState, useEffect, useRef, useMemo } from "react"; // 🟢 Ajout de useMemo
import { useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { useParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Printer,
  PrinterCheck,
  PrinterIcon,
  Search,
  ShoppingCart,
  Calendar, // 🟢 Import pour l'icône calendrier
} from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";
import { Loader2, Eye, FileText } from "lucide-react";
import Pagination from "@/components/pagination";
import AddVenteCarton from "@/components/popups/addNews/addVente";
import AddVente from "@/components/popups/addNews/addVente";

// Interfaces (laissez-les telles quelles)
interface Client {
  id: string;
  nom: string;
}
interface LigneVente {
  quantite: number;
  produitId: string;
  produit?: ItemsProduit;
  prixUnitaire?: number;
  sousTotal?: number;
}
interface VenteItem {
  id: string;
  client: Client;
  clientId: string;
  createdAt: string; // Date de vente
  total: number;
  ligneVente: LigneVente[];
}

interface ItemsProduit {
  id: string;
  nom: string;
  unite: string;
  stock_initial: number | null;
  seuil_minimum: number | null;
  date_creation: string;
}
interface ItemsDepenses {
  amount: string;
  devise: string;
}
interface VentesResponse {
  data: VenteItem[];
}

export default function ListeVentes() {
  const params = useParams();
  const id = params?.id;
  const componentRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [ventes, setVentes] = useState<VenteItem[]>([]);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [ventesPerPage] = useState(7);
  const [vente, setVente] = useState<VenteItem | null>(null);
  const [printAfterLoad, setPrintAfterLoad] = useState(false);

  // 🟢 NOUVEAUX ÉTATS POUR LE FILTRAGE PAR DATE
  const [startDate, setStartDate] = useState<string>(""); 
  const [endDate, setEndDate] = useState<string>(""); 

  const route = useRouter();

  const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleVentesAdded = (vente: VenteItem) => {
    // Ajouter la nouvelle vente au début de la liste
    setVentes((prev) => [vente, ...prev]); 
  };

  const fetchVentes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ventes");
      const result: VentesResponse = await res.json();

      if (res.ok && result) {
        setVentes(result.data || []);
      } else {
        toast.error("Pas de Vente enregistré ");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des ventes :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVentes();

    const handleVenteAdded = () => fetchVentes();
    window.addEventListener("venteAdded", handleVenteAdded);
    return () => window.removeEventListener("venteAdded", handleVenteAdded);
  }, []);

  // -----------------------------------------------------
  // 🟢 LOGIQUE DE FILTRAGE ET PAGINATION COMBINÉE (useMemo)
  // -----------------------------------------------------
  const filteredVentes = useMemo(() => {
    // 1. Début du filtrage (toutes les ventes)
    let filtered = ventes;

    // 2. FILTRAGE PAR PÉRIODE (Date de Vente)
    if (startDate && endDate) {
      const start = new Date(startDate).setHours(0, 0, 0, 0); // Début du jour
      const end = new Date(endDate).setHours(23, 59, 59, 999); // Fin du jour
      
      if (isNaN(start) || isNaN(end)) {
          // Gérer le cas où les dates sont invalides (ne devrait pas arriver avec type="date")
          return [];
      }

      filtered = filtered.filter(vente => {
        const venteDate = new Date(vente.createdAt).getTime();
        return venteDate >= start && venteDate <= end;
      });
    } else if (startDate) {
        // Filtrage si seule la date de début est fournie (pour le jour même)
        const start = new Date(startDate).setHours(0, 0, 0, 0);
        const end = new Date(startDate).setHours(23, 59, 59, 999);

        filtered = filtered.filter(vente => {
            const venteDate = new Date(vente.createdAt).getTime();
            return venteDate >= start && venteDate <= end;
        });
    }

    // Réinitialiser la pagination si le filtre change
    // (Nous le faisons manuellement dans le onChange pour un meilleur contrôle)
    
    return filtered;

  }, [ventes, startDate, endDate]); // Dépend de la liste complète et des dates de filtre

  // 3. CALCUL DE LA PAGINATION
  const totalVentesFiltered = filteredVentes.length;
  const totalPages = Math.ceil(totalVentesFiltered / ventesPerPage);
  const indexOfLastVente = currentPage * ventesPerPage;
  const indexOfFirstVente = indexOfLastVente - ventesPerPage;

  // 4. VENTES ACTUELLES AFFICHÉES
  const currentVentes = filteredVentes.slice(indexOfFirstVente, indexOfLastVente);


  return (
    <>
      {loading && ventes.length === 0 ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="animate-spin h-16 w-16 text-[#1E3A8A]" />
        </div>
      ) : (
        <>
          <div className="w-100% lg:mt-15 mt-20">
            <h2 className="md:text-xl text-md mb-3 font-bold text-gray-700">
              Liste des Ventes
            </h2>
            <div className="text-gray-500 flex lg:h-16 h-auto  border border-gray-200 lg:p-4 p-2 mb-1 lg:flex-row flex-col justify-center items-center bg-[#ffffff] lg:justify-between lg:items-center gap-3.5 ">
              <div className="flex w-full lg:w-3/5 gap-3 items-center justify-start">
                  
                  {/* Date de Début */}
                  <div className="relative w-full">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                          type="date"
                          placeholder="Date de Début"
                          className="pl-10 pr-4 h-12 text-[12px] lg:text-md w-full border-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0"
                          value={startDate}
                          onChange={(e) => {
                            setStartDate(e.target.value);
                            setCurrentPage(1); // Réinitialiser la pagination
                          }}
                      />
                  </div>
                  
                  <div className="text-gray-400 text-lg lg:text-xl font-bold">
                    <ArrowRight className="w-5 h-5" />
                  </div>

                  {/* Date de Fin */}
                  <div className="relative w-full">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                          type="date"
                          placeholder="Date de Fin"
                          className="pl-10 pr-4 h-12 text-[12px] lg:text-md w-full border-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0"
                          value={endDate}
                          onChange={(e) => {
                            setEndDate(e.target.value);
                            setCurrentPage(1); // Réinitialiser la pagination
                          }}
                          // Désactiver le champ de fin si la date de début n'est pas définie
                          // disabled={!startDate} 
                      />
                  </div>
              </div>
              
              {/* 🛑 SUPPRESSION DE L'ANCIEN CHAMP DE RECHERCHE TEXTE (ou le laisser si vous le voulez) */}
              {/* <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Filtrer par le nom du produit"
                  className="pl-10 pr-4 h-12 text-[12px] lg:text-md w-[100%] border-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div> */}
              {/* ------------------------------------------- */}
              
              <div className=" w-full lg:w-2/5 flex gap-3  justify-start items-start lg:items-end lg:justify-end">
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#1E3A8A] cursor-pointer flex items-center  w-[50%] md:w-48 lg:w-56">
                      Vente
                      <ShoppingCart className="ml-2 h-4 w-4 text-red-400" />
                    </Button>
                  </DialogTrigger>
                  <AddVente
                    onClosed={() => setOpen(false)}
                    onAdd={handleVentesAdded}
                  />
                </Dialog>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="border border-gray-200 lg:p-6 p-0 w-full bg-white flex flex-col gap-4">
            <Table className="border border-gray-200">
              <TableHeader className="border border-gray-200 bg-[#eef2fe]">
                <TableRow>
                  <TableHead className="text-[12px] lg:text-md">Date</TableHead>
                  <TableHead className="text-[12px] lg:text-md">
                    Client
                  </TableHead>
                  <TableHead className="text-[12px] lg:text-md">
                    Nombre d’articles
                  </TableHead>
                  <TableHead className="text-[12px] lg:text-md">
                    Total
                  </TableHead>

                  <TableHead className="text-[12px] lg:text-md text-center">
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentVentes.length > 0 ? (
                  currentVentes.map((vente, index) => (
                    <TableRow key={vente.id || index}>
                      <TableCell className="text-[12px] lg:text-md">
                        {/* Affichage de la date */}
                        {new Date(vente.createdAt).toLocaleDateString("fr-FR", {
                           day: '2-digit', 
                           month: '2-digit', 
                           year: 'numeric',
                           hour: '2-digit',
                           minute: '2-digit',
                        })}
                      </TableCell>

                      <TableCell className="text-[12px] lg:text-md">
                        {vente.client?.nom}
                      </TableCell>

                      <TableCell className="text-[12px] lg:text-md">
                        {vente.ligneVente
                          ? vente.ligneVente.reduce(
                              (acc, l) => acc + l.quantite,
                              0
                            )
                          : ""}
                      </TableCell>
                      <TableCell className="text-[12px] lg:text-md">
                        {vente.total
                          ? vente.total.toLocaleString("fr-FR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }) + "$"
                          : 0}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-[12px] lg:text-md text-end">
                        <div className="flex gap-2 justify-center text-end">
                          {/* Voir détails */}
                          <Button
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() =>
                              route.push(`/Dashboard/ventes/${vente.id}`)
                            }
                          >
                            <Eye className="h-8 w-8 cursor-pointer" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      <div className="flex flex-col justify-center items-center text-gray-700">
                        <img
                          src="/undraw_no-data_ig65.svg"
                          className="w-48 h-48 mb-4"
                          alt="aucune vente"
                        />
                        Aucune vente trouvée.
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalVentesFiltered > ventesPerPage && (
            <div className="flex justify-center mt-2">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}