"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { DialogContent } from "@radix-ui/react-dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import Pagination from "@/components/pagination";
import AddProduit from "@/components/popups/addNews/addProduit";
import DeleteProduit from "@/components/popups/DeleteItems/deleteProduct";
import UpdatedProduit from "@/components/popups/updateItems/updateProduit";
import { Trash, Edit, Inbox, Loader2, Pencil, Eye } from "lucide-react";
import ListeProduits from "../produits/page";
import DeleteMouvement from "@/components/popups/DeleteItems/deleteMouvement";

interface Produit {
  id: number;
  nom: string;
  categorieId: string;
  stock_initial: string;
  seuil_minimum: string;
  date_creation: string;
  categorie?: { id: string; nom: string };
}
interface CategorieItems {
  id: string;
  nom: string;
  designation: string;
  date_categorie: string;
}
interface ProduitCat {
  id: number;
  nom: string;
  categorieId: string;
  categorie?: { id: string; nom: string };
}
interface Mouvement {
  id: string;
  produitId: string;
  unite: string;
  date_mouvement: string;
  type: string;
  quantite: string;
  observation: string;
  produit?: Produit;
}
const tabUnite = [
  { id: 1, unite: "kg" },
  { id: 2, unite: "gm" },
  { id: 3, unite: "sac" },
  { id: 4, unite: "kl" },
  { id: 5, unite: "g" },
];
export default function mouvements() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [produits, setProduits] = useState<Produit[]>([]);
  const [produitCat, setProduitCat] = useState<ProduitCat[]>([]);
  const [mouvement, setMouvement] = useState<Mouvement[]>([]);
  const [produitId, setProduitId] = useState<string | null>(null);
  const [produitIdParCat, setproduitIdParCat] = useState<Produit[]>([]);
  const [quantite, setQuantite] = useState<number>(0);
  const [observation, setObservation] = useState("");
  const [unite, setUnite] = useState("");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategorieItems[]>([]);
  const [selectedCategorieId, setSelectedCategorieId] = useState("");
  const [selectedProduit, setSelectedProduit] = useState("");

  const [open, setOpen] = useState(false);
  const [opens, setOpens] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoriesPerPage] = useState(7);

  const [currentPages, setCurrentPages] = useState(1);
  const [produitPerPage] = useState(7);

  const [formData, setFormData] = useState({
    nom: "",
    categorieId: "",
    stock_initial: "",
    seuil_minimum: "",
    nombre_bars: "",
    unite: "",
  });

  function normalizeString(str: string) {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  const handleCategorieChange = async (selectedId: string) => {
    setSelectedCategorieId(selectedId);

    if (!selectedId) {
      setproduitIdParCat([]);
      return;
    }

    try {
      const res = await fetch(`/api/produits?categorieId=${selectedId}`);
      const result = await res.json();
      console.log("Resultat par cat : ", result);
      if (result.success) {
        setproduitIdParCat(result.data);
        console.log("Resultat par cat .data : ", result.data);
      }
    } catch (error) {
      console.error("Erreur de chargement des produits :", error);
    }
  };

  useEffect(() => {
    const fetchCategorie = async () => {
      try {
        const res = await fetch("/api/categories");
        const result = await res.json();
        console.log(result);
        if (res.ok && result.success) {
          setCategories(result.data);
          console.log(result.data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des catégories :", error);
        setCategories([]);
      }
    };

    fetchCategorie();
  }, []);

  useEffect(() => {
    fetchProduits();
  }, []);

  useEffect(() => {
    fetch("/api/mouvements")
      .then((res) => res.json())
      .then((data) => setMouvement(data.data));
    fetchMouvements();
    fetchProduits();
  }, []);

  const fetchMouvements = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mouvements", {});
      const data = await res.json();
      setMouvement(data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des mouvements :", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProduits = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/produits");
      const data = await res.json();
      setProduits(data.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des produits :", error);
    } finally {
      setLoading(false);
    }
  };

  //pagination mouvements
  const totalCategories = mouvement?.length || 0;
  const totalPages = Math.ceil(totalCategories / categoriesPerPage);

  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories =
    mouvement?.slice(indexOfFirstCategory, indexOfLastCategory) || [];

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  //pagination dépot
  const totalProduit = produits?.length || 0;
  const totalPagesProduit = Math.ceil(totalProduit / produitPerPage);

  const indexOfLastProduits = currentPages * produitPerPage;
  const indexOfFirstProduit = indexOfLastProduits - produitPerPage;
  const currentProduit =
    produits?.slice(indexOfFirstProduit, indexOfLastProduits) || [];

  const handlePageChangeProduit = (pageNumber: number) => {
    setCurrentPages(pageNumber);
  };

  const [allUsers, setAllUsers] = useState(produits);

  // const handleDelete = (id: string) => {
  //   setProduits((prev) =>
  //     prev.filter((produit) => produit.id !== parseInt(id))
  //   );
  // };

  const handleDeleteMouvement = (id: string) => {
    setMouvement((prev) => prev.filter((p) => p.id !== id));
    
  };

  useEffect(() => {
    fetchProduits();

    const handleProduitAdded = () => fetchProduits();
    window.addEventListener("produitAdded", handleProduitAdded);
    return () => window.removeEventListener("produitAdded", handleProduitAdded);
  }, []);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    mouvementType: "ENTREE" | "SORTIE"
  ) => {
    setLoading(true);
    e.preventDefault();
    console.log("produiId : ", selectedProduit, "Quantite : ", quantite);

    // Vérifier produit et quantité
    if (!selectedProduit || quantite <= 0) {
      toast.message("Sélectionnez un produit, une quantité > 0 et une unité.");
      setLoading(false);
      return;
    }

    // Vérifier unité si catégorie = matière première
    const selectedCat = categories.find((c) => c.id === selectedCategorieId);
    const nomCat = normalizeString(selectedCat?.nom || "");

    if (nomCat === "matiere premiere" && !unite) {
      toast.error("Veuillez choisir une unité de mesure !");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/mouvements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produitId: selectedProduit,
          type: mouvementType,
          quantite,
          observation,
          unite,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Mouvement enregistré !");
        setMouvement((prev) => [data.mouvement, ...prev]);
        setQuantite(0);
        setProduitId(null);
        setObservation("");
        setUnite("");
        fetchProduits();
      } else {
        toast.error(data.error || "Erreur serveur");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur d'enregistrement. Vérifiez la console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="animate-spin h-16 w-16 text-[#1E3A8A]" />
        </div>
      ) : (
        <>
          <div className="text-gray-500 lg:p-6 p-0 flex flex-col justify-center items-center w-full gap-6 mt-15">
            <div className="border border-gray-200 lg:p-15 p-3 lg:w-[95%] w-[100%] bg-white flex flex-col gap-4 justify-center items-start ">
              <h2 className="lg:text-xl text-md font-bold mb-6 flex items-start gap-2 text-gray-700 flex-col justify-center">
                OPÉRATIONS DES ENTRÉES ET DES SORTIES
                <span className="lg:text-[17px] text-[15px] text-base font-normal">
                  Utilisez ce formulaire pour établir les mouvements.
                </span>
              </h2>

              <Tabs defaultValue="production" className="w-full ">
                <TabsList className="grid grid-cols-2 text-center sm:grid-cols-2 md:grid-cols-2 w-full mb-6 h-[100%] bg-[#eef2fe]">
                  <TabsTrigger
                    value="production"
                    className="w-[100%] h-12 lg:text-md text-[13px]"
                  >
                    ENTRÉE D'UN ARTICLE
                  </TabsTrigger>
                  <TabsTrigger
                    value="expedition"
                    className="w-[100%] h-12 lg:text-md text-[13px] "
                  >
                    SORTIE D'UN ARTICLE
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="production">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubmit(e, "ENTREE");
                    }}
                    className="space-y-6"
                  >
                    <div className="grid sm:grid-cols-2 gap-4 w-[100%]">
                      <div className="grid gap-2">
                        <Label htmlFor="catégories">Catégories</Label>
                        <Select onValueChange={handleCategorieChange}>
                          <SelectTrigger className="w-[100%] h-12">
                            <SelectValue placeholder="Choisir une catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.nom.replace("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="produits">Produits</Label>
                        <Select
                          value={selectedProduit}
                          onValueChange={setSelectedProduit}
                          disabled={
                            !selectedCategorieId || produitIdParCat.length === 0
                          }
                        >
                          <SelectTrigger className="w-[100%] h-12">
                            <SelectValue
                              placeholder={
                                !selectedCategorieId
                                  ? "Choisir une catégorie d'abord"
                                  : produitIdParCat.length === 0
                                    ? "Aucun produit trouvé"
                                    : "Choisir un produit"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {produitIdParCat.map((p) => (
                              <SelectItem key={p.id} value={p.id.toString()}>
                                {p.nom}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="quantité">Quantité</Label>
                        <Input
                          type="number"
                          placeholder="Quantité"
                          value={quantite}
                          onChange={(e) => setQuantite(Number(e.target.value))}
                          className="w-[100%] h-12"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="observation">Observation</Label>
                        <Input
                          placeholder="Observation (facultatif)"
                          value={observation}
                          onChange={(e) => setObservation(e.target.value)}
                          className="w-[100%] h-12 lg:text-md text-[14px]"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-[100%] h-12 cursor-pointer bg-[#0EA5E9] hover:bg-[#7dc5fc]"
                      >
                        {loading
                          ? "Enregistrement..."
                          : "Enregistrez une Production"}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                <TabsContent value="expedition">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubmit(e, "SORTIE");
                    }}
                    className="space-y-6"
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="categorie">Catégories</Label>
                        <Select onValueChange={handleCategorieChange}>
                          <SelectTrigger className="w-[100%] h-12">
                            <SelectValue placeholder="Choisir une catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.nom.replace("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="produit">Produits</Label>
                        <Select
                          value={selectedProduit}
                          onValueChange={setSelectedProduit}
                          disabled={
                            !selectedCategorieId || produitIdParCat.length === 0
                          }
                        >
                          <SelectTrigger className="w-[100%] h-12">
                            <SelectValue
                              placeholder={
                                !selectedCategorieId
                                  ? "Choisir une catégorie d'abord"
                                  : produitIdParCat.length === 0
                                    ? "Aucun produit trouvé"
                                    : "Choisir un produit"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {produitIdParCat && produitIdParCat.length > 0
                              ? produitIdParCat.map((p) => (
                                  <SelectItem
                                    key={p.id}
                                    value={p.id.toString()}
                                  >
                                    {p.nom}
                                  </SelectItem>
                                ))
                              : ""}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="unite">Quantité</Label>
                        <Input
                          type="number"
                          placeholder="Quantité"
                          value={quantite}
                          onChange={(e) => setQuantite(Number(e.target.value))}
                          className="w-[100%] h-12 lg:text-md text-[14px]"
                        />
                      </div>

                     
                      <Input
                        placeholder="Observation (facultatif)"
                        value={observation}
                        onChange={(e) => setObservation(e.target.value)}
                        className="w-[100%] h-12 lg:text-md text-[14px]"
                      />

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-[100%] cursor-pointer h-12 bg-[#0EA5E9] hover:bg-[#7dc5fc]"
                      >
                        {loading
                          ? "Enregistrement..."
                          : "Enregistrez une Expedition"}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </div>

            <>
              <>
                <div className="border border-gray-200 lg:p-15 p-1 lg:w-[95%] w-[100%] bg-white flex flex-col gap-1 justify-center items-start ">
                  <h2 className="lg:text-xl text-md font-bold flex items-start gap-2 text-gray-700 flex-col justify-center">
                    MOUVEMENTS
                  </h2>
                  <Table className="border border-gray-200">
                    <TableHeader className="border border-gray-200  bg-[#eef2fe]">
                      <TableRow className="border-none">
                        <TableHead className="font-medium lg:text-md text-[12px]">
                          PRODUIT
                        </TableHead>
                        <TableHead className="font-medium lg:text-md text-[12px]">
                          TYPE D'OPERATION
                        </TableHead>
                        <TableHead className="font-medium lg:text-md text-[12px]">
                          QUANTITÉ
                        </TableHead>
                        <TableHead className="font-medium lg:text-md text-[12px]">
                          {" "}
                          OBSERVATION
                        </TableHead>
                        <TableHead className="font-center lg:text-md text-[12px]">
                          DATE DU MOUVEMENT
                        </TableHead>
                        <TableHead className="text-center lg:text-md text-[12px]">
                          ACTIONS
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="border border-gray-200">
                      {currentCategories && currentCategories.length > 0 ? (
                        currentCategories.map((mouvement) => (
                          <TableRow
                            key={mouvement.id}
                            className="border border-gray-200"
                          >
                            <TableCell className="text-left lg:text-md text-[12px]">
                              {mouvement.produit?.nom}
                            </TableCell>
                            <TableCell className="text-left lg:text-md text-[12px]">
                              {mouvement.type}
                            </TableCell>
                            <TableCell className="text-left lg:text-md text-[12px]">
                              {mouvement.quantite}
                              {mouvement.unite}
                            </TableCell>
                            <TableCell className="text-left lg:text-md text-[12px]">
                              {mouvement.observation || "-"}
                            </TableCell>
                            <TableCell className="text-left lg:text-md text-[12px]">
                              {new Date(
                                mouvement.date_mouvement
                              ).toLocaleString("fr-FR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </TableCell>

                            <TableCell className="text-right lg:text-md text-[12px]">
                              <div className="text-center flex items-center justify-center gap-2">
                                <DeleteMouvement
                                  id={mouvement.id}
                                  onDeletes={handleDeleteMouvement}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10">
                            <div className="flex flex-col lg:text-md text-[12px] justify-center items-center text-[#1e1e2f] text-base">
                              <img
                                src="/undraw_no-data_ig65.svg"
                                className="w-48 h-48 mb-4"
                                alt="svg-no-data"
                              />
                              Aucun mouvement trouvé dans cette table, veuillez
                              ajouter un <br /> mouvement puis vérifier après !
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <div className=" p-2 text-center  text-[12px] w-[100%] mt-2">
                    {mouvement?.length > 10 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    )}
                  </div>
                </div>
              </>
            </>

            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin h-16 w-15 text-[#1E3A8A]" />
              </div>
            ) : (
              <>
                <div className="border  border-gray-200 lg:p-15 p-1 lg:w-[95%] w-[100%] bg-white flex flex-col gap-4 justify-center items-start ">
                  <h2 className="lg:text-xl text-md font-bold flex items-start gap-2 text-gray-700 flex-col justify-center">
                    DÉPÔT
                  </h2>
                  <Table className="border border-gray-200">
                    <TableHeader className="border border-gray-200  bg-[#eef2fe]">
                      <TableRow className="border-none">
                        <TableHead className="font-medium lg:text-md text-[12px]">
                          {" "}
                          Nom
                        </TableHead>
                        <TableHead className="font-medium lg:text-md text-[12px]">
                          {" "}
                          Catégorie
                        </TableHead>
                        <TableHead className="font-medium lg:text-md text-[12px]">
                          {" "}
                          Stock Initial
                        </TableHead>
                        <TableHead className="font-medium lg:text-md text-[12px]">
                          {" "}
                          Seuil Minimum
                        </TableHead>
                        <TableHead className="font-center lg:text-md text-[12px]">
                          Creation
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="border border-gray-200">
                      {currentProduit && currentProduit.length > 0 ? (
                        currentProduit.map((produit) => (
                          <TableRow
                            key={produit.id}
                            className="border border-gray-200"
                          >
                            <TableCell className="text-left lg:text-md text-[12px]">
                              {produit.nom}
                            </TableCell>
                            <TableCell className="text-left lg:text-md text-[12px]">
                              {produit?.categorie?.nom}
                            </TableCell>
                            <TableCell className="text-left lg:text-md text-[12px]">
                              {produit.stock_initial}
                            </TableCell>
                            <TableCell className="text-left lg:text-md text-[12px]">
                              {produit.seuil_minimum}
                            </TableCell>
                            <TableCell className="text-left lg:text-md text-[12px]">
                              {new Date(produit.date_creation).toLocaleString(
                                "fr-FR",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </TableCell>

                            {/* <TableCell className="text-right lg:text-md text-[12px]">
                              <div className="text-center flex items-center justify-center gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedProduitId(produit.id);
                                    setOpen(true);
                                  }}
                                  className="flex items-center border border-gray-100"
                                >
                                  <Edit className="h-5 w-5 text-[#1e1e2f]" />
                                </Button>
                                
                              </div>
                            </TableCell> */}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10">
                            <div className="flex lg:text-md text-[12px] flex-col justify-center items-center text-[#1e1e2f] text-base">
                              <img
                                src="/undraw_no-data_ig65.svg"
                                className="w-48 h-48 mb-4"
                                alt="svg-no-data"
                              />
                              Aucun produit trouvé dans cette table, veuillez
                              ajouter un <br /> produit puis vérifier après !
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <div className="p-2 items-start text-center  text-[12px] w-[100%] mt-2">
                    {produits?.length > 10 && (
                      <Pagination
                        currentPage={currentPages}
                        totalPages={totalPagesProduit}
                        onPageChange={handlePageChangeProduit}
                      />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}