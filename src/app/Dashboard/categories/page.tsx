"use client";
import * as React from "react";
import { useEffect, useState } from "react";
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
import { ArrowRight, Edit, Loader2, Search } from "lucide-react";
import Pagination from "@/components/pagination";
import AddProduit from "@/components/popups/addNews/addProduit";
import DeleteProduit from "@/components/popups/DeleteItems/deleteProduct";
import UpdatedProduit from "@/components/popups/updateItems/updateProduit";
import AddCategorie from "@/components/popups/addNews/addCategorie";
import DeleteCategorieProduit from "@/components/popups/DeleteItems/deleteCategorieProduits";
import UpdatedCategorie from "@/components/popups/updateItems/updateCategorie";

interface ItemsCategorie {
  id: string;
  nom: string;
  designation: string;
  date_categorie: string;
}

export default function ListeCategorie() {
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [opens, setOpens] = useState(false);
  const [categorie, setCategorie] = useState<ItemsCategorie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoriesPerPage] = useState(7);
  const [selectedCategorieId, setSelectedCategorieId] = useState<string | null>(
    null
  );
  const [deleteOpenId, setDeleteOpenId] = useState<string | null>(null);

  const totalCategories = categorie?.length || 0;
  const totalPages = Math.ceil(totalCategories / categoriesPerPage);
  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories =
    categorie?.slice(indexOfFirstCategory, indexOfLastCategory) || [];
  const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleDelete = (id: string) => {
    setCategorie((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCategorieAdded = (nouveauProduit: ItemsCategorie) => {
    setCategorie((prev) => [nouveauProduit, ...prev]);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/categories", { method: "GET" });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message);
      setCategorie(result.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des produits :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();

    const handleCategorieAddedEvent = () => fetchCategories();

    return () =>
      window.removeEventListener("produitAdded", handleCategorieAddedEvent);
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
            <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Filtrer par nom de la catégorie"
                    className="pl-10 pr-4 h-12 text-[12px] lg:text-md w-full border-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
            <Dialog open={opens} onOpenChange={setOpens}>
              <DialogTrigger asChild>
                <Button className="bg-[#1E3A8A] cursor-pointer flex items-center">
                  Ajouter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogTrigger>
              <AddCategorie
                onClosed={() => setOpens(false)}
                onAddCat={handleCategorieAdded}
              />
            </Dialog>
          </div>

          {/* Table produits */}
          <div className="border border-gray-200 p-6 w-[100%] bg-white flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-700">
              TABLE DES CATÉGORIES
            </h2>
            <Table className="border border-gray-200">
              <TableHeader className="border border-gray-200 bg-[#eef2fe]">
                <TableRow className="border-none">
                  <TableHead>Id</TableHead>
                  <TableHead className="text-[12px] lg:text-md">Nom</TableHead>
                  <TableHead className="text-[12px] lg:text-md">désignation</TableHead>
                  <TableHead className="text-[12px] lg:text-md">Création</TableHead>
                  <TableHead className="text-[12px] lg:text-md">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentCategories.length > 0 ? (
                  currentCategories.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-[12px] lg:text-md">{p.id}</TableCell>
                      <TableCell className="text-[12px] lg:text-md">{p.nom}</TableCell>
                      <TableCell className="text-[12px] lg:text-md">
                        {p.designation || "-"}
                      </TableCell>
                      <TableCell className="text-[12px] lg:text-md">
                        {new Date(p.date_categorie).toLocaleString("fr-FR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2 text-[12px] lg:text-md">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedCategorieId(p.id);
                              setOpen(true);
                            }}
                          >
                            <Edit className="h-5 w-5" />
                          </Button>
                          <DeleteCategorieProduit
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
                      <div className="flex text-[12px] lg:text-md flex-col justify-center items-center text-base text-gray-700">
                        <img
                          src="/undraw_no-data_ig65.svg"
                          className="w-48 h-48 mb-4"
                          alt="aucun produit"
                        />
                        Aucune categorie trouvée, veuillez ajouter une categorie
                        puis vérifier après.
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Modifier categorie */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogTitle className="text-[12px] lg:text-md">Modifier la catégorie</DialogTitle>
              {selectedCategorieId && (
                <UpdatedCategorie
                  id={selectedCategorieId}
                  onClose={() => setOpen(false)}
                  onUpdate={fetchCategories}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Pagination */}
          {categorie.length > categoriesPerPage && (
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