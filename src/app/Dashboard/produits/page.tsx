
"use client";
import * as React from "react";
import { useEffect, useState, useMemo } from "react"; // 🟢 Ajout de useMemo
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Edit, Loader2, MousePointerClick } from "lucide-react";
import Pagination from "@/components/pagination";
import AddProduit from "@/components/popups/addNews/addProduit";
import DeleteProduit from "@/components/popups/DeleteItems/deleteProduct";
import UpdatedProduit from "@/components/popups/updateItems/updateProduit";
import { SheetDemoBox } from "@/components/popups/addNews/sheetDemoBox";

interface ItemsProduit {
  id: string;
  nom: string;
  categorieId: string;
  stock_initial: number | null;
  prix: number | null;
  devise:string;
  seuil_minimum: number | null;
  nombre_bars: number | null;
  date_creation: string;
  categorie?: { id: string; nom: string };
}

export default function ListeProduits() {
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [opens, setOpens] = useState(false);
  const [produit, setProduit] = useState<ItemsProduit[]>([]);
  
  // États de pagination

  const [currentPageProduitfin, setCurrentPageProduitfin] = useState(1);

  const [categoriesPerPage] = useState(7); // Nombre d'éléments par page

  const [selectedProduitId, setSelectedProduitId] = useState<string | null>(null);
  const [openSheet, setOpenSheet] = useState(false);
  const [deleteOpenId, setDeleteOpenId] = useState<string | null>(null);

  // 🟢 État de recherche
  const [searchTerm, setSearchTerm] = useState('');

  // -----------------------------------------------------------
  // FONCTIONS DE MISE À JOUR DES DONNÉES
  // -----------------------------------------------------------

  const handleDelete = (id: string) => {
    // Supprime l'élément de toutes les listes
    setProduit((prev) => prev.filter((p) => p.id !== id));

    setDeleteOpenId(null);
  };

  const handleProduitAdded = (nouveauProduit: ItemsProduit) => {
    setProduit((prev) => [nouveauProduit, ...prev]);
    // Note: fetchProduits est appelé via l'eventListener après l'ajout pour recharger et re-trier
  };

  
  const fetchProduits = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/produits", { method: "GET" });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message);

      const produits = result.data as ItemsProduit[];

    setProduit(produits)
     
    } catch (error) {
      console.error("Erreur lors de la récupération des produits :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);

    // Réinitialiser la pagination de TOUS les tableaux lors d'une nouvelle recherche

    setCurrentPageProduitfin(1);

  };


  // ------------------------------------------------------------------
  // 🟢 LOGIQUE DE FILTRAGE ET PAGINATION POUR PRODUITS
  // ------------------------------------------------------------------
  const { totalProduitFini, totalPagesProduitfini, currentProduit } = useMemo(() => {
      const lowerCaseSearch = searchTerm.toLowerCase();

      // Filtrage
      const filtered = produit.filter(p => 
          p.nom.toLowerCase().includes(lowerCaseSearch)
      );

      // Pagination
      const total = filtered.length;
      const totalPages = Math.ceil(total / categoriesPerPage);
      const indexOfLast = currentPageProduitfin * categoriesPerPage;
      const indexOfFirst = indexOfLast - categoriesPerPage;
      const current = filtered.slice(indexOfFirst, indexOfLast);

      return { totalProduitFini: total, totalPagesProduitfini: totalPages, currentProduit: current };
  }, [produit, searchTerm, currentPageProduitfin, categoriesPerPage]);

  const handlePageChangeProduitfini = (pageNumber: number) => setCurrentPageProduitfin(pageNumber);


  useEffect(() => {
    fetchProduits();
    const handleProduitAddedEvent = () => fetchProduits();
    window.addEventListener("produitAdded", handleProduitAddedEvent);

    return () => {
      window.removeEventListener("produitAdded", handleProduitAddedEvent);
    };
  }, []);

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="animate-spin h-16 w-16 text-[#1E3A8A]" />
        </div>
      ) : (
        <>
          <div className="text-gray-500 flex h-16 bg-[#ffffff] border border-gray-200 p-4 lg:p-9 mb-1 justify-between items-center gap-3.5 mt-15">
            <Input
              type="text"
              className=" w-96 h-12 text-[12px] lg:text-md"
              placeholder="Filtrer par le nom du produit"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Dialog open={opens} onOpenChange={setOpens}>
              <DialogTrigger asChild>
                <Button className="bg-[#1E3A8A] cursor-pointer flex items-center">
                  Ajouter
                  <ArrowRight className="ml-2 h-4 w-4 " />
                </Button>
              </DialogTrigger>
              <AddProduit
                onClosed={() => setOpens(false)}
                onAdd={handleProduitAdded}
              />
            </Dialog>
          </div>

          {/* Table produits */}
          <div className="border border-gray-200 p-6 w-[100%] bg-white flex flex-col gap-8">
           
            
            <h2 className="lg:text-xl text-md font-bold text-gray-700">
              TABLE DES ARTICLES
            </h2>
            <Table className="border border-gray-200">
              <TableHeader className="border border-gray-200 bg-[#eef2fe]">
                <TableRow className="border-none">
                  <TableHead className="lg:text-md text-[12px]">Nom</TableHead>
                  <TableHead className="lg:text-md text-[12px]">
                    Catégorie
                  </TableHead>
                  <TableHead className="lg:text-md text-[12px]">
                    Reste en Stock
                  </TableHead>
                  <TableHead className="lg:text-md text-[12px]">Prix</TableHead>
                  <TableHead className="lg:text-md text-[12px]">
                    Création
                  </TableHead>
                  <TableHead className="lg:text-md text-[12px]">
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentProduit.length > 0 ? (
                  currentProduit.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="lg:text-md text-[12px]">
                        {p.nom}
                      </TableCell>
                      <TableCell className="lg:text-md text-[12px]">
                        {p.categorie ? p.categorie.nom : "—"}
                      </TableCell>
                      <TableCell className="lg:text-md text-[12px]">
                        {p.stock_initial}
                      </TableCell>
                      <TableCell className="lg:text-md text-[12px]">
                        {p.prix?.toLocaleString("fr-FR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }) }{" "}{p.devise}
                      </TableCell>
                      <TableCell className="lg:text-md text-[12px]">
                        {new Date(p.date_creation).toLocaleString("fr-FR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedProduitId(p.id);
                              setOpen(true);
                            }}
                          >
                            <Edit className="h-5 w-5" />
                          </Button>
                          <DeleteProduit
                            id={p.id}
                            open={deleteOpenId === p.id}
                            onOpenChange={(open) =>
                              setDeleteOpenId(open ? p.id : null)
                            }
                            onDeletes={handleDelete}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex lg:text-md lg:text-md text-[12px] flex-col justify-center items-center text-base text-gray-700">
                        <img
                          src="/undraw_no-data_ig65.svg"
                          className="w-48 h-48 mb-4"
                          alt="aucun produit"
                        />
                        Aucun produit trouvé, veuillez ajouter un produit puis
                        vérifier après.
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {/* Pagination Produits Finis */}
            {totalProduitFini > categoriesPerPage && (
              <div className="flex justify-center mt-2">
                <Pagination
                  currentPage={currentPageProduitfin}
                  totalPages={totalPagesProduitfini}
                  onPageChange={handlePageChangeProduitfini}
                />
              </div>
            )}

            
          </div>

          {/* Modifier produit */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogTitle>Modifier le produit</DialogTitle>
              {selectedProduitId && (
                <UpdatedProduit
                  id={selectedProduitId}
                  onClose={() => setOpen(false)}
                  onUpdate={fetchProduits}
                />
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
}