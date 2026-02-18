"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { SelectViewport } from "@radix-ui/react-select";
import RapportProduitEvent from "./produits";
import RapportVenteEvent from "./ventes";

interface utilisateurItem {
  id: string;
  name: string;
  postnom: string;
  prenom: string;
  role: string;
}
interface ProduitItem {
  id: string;
  nom: string;
  unite: string;
  stock_initial: number | null;
  seuil_minimum: number | null;
  nombre_bars: string | null;
  date_creation: string;
  categorie?: { id: string; nom: string };
}

interface Mouvement {
  id: string;
  type: "ENTREE" | "SORTIE";
  quantite: number;
  produitId: string;
  observation?: string;
  date_mouvement: string;
  produit: ProduitItem;
}

interface CategorieItems {
  id: string;
  nom: string;
  designation: string;
  date_categorie: string;
}

interface AddDataDialogContent {
  onClosed: () => void;
}

export default function AllReport({ onClosed }: AddDataDialogContent) {
  const [loading, setLoading] = useState(false);
  const [produits, setProduits] = useState<ProduitItem[]>([]);
  const [user, setUser] = useState<utilisateurItem[]>([]);
  const [mouvements, setMouvements] = useState<Mouvement[]>([]);
  const [totalEntree, setTotalEntree] = useState<number>(0);
  const [totalSortie, setTotalSortie] = useState<number>(0);
  const [StockFinale, setStockFinale] = useState<number>(0);
  const [produitSelectionne, setProduitSelectionne] =
    useState<ProduitItem | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mouvementsFiltres, setMouvementsFiltres] = useState<Mouvement[]>([]);
  const componentRef = useRef<HTMLDivElement>(null);
  const [produitIdParCat, setproduitIdParCat] = useState<ProduitItem[]>([]);
  const [selectedCategorieId, setSelectedCategorieId] = useState("");
  const [selectedProduit, setSelectedProduit] = useState("");
  const [selectUser, setSelectUser] = useState("");
  const [categories, setCategories] = useState<CategorieItems[]>([]);
  const [op, setOp] = useState<String>("");

  const [mouvementsGeneraux, setMouvementsGeneraux] = useState<any[]>([]);
  const [totalEntreeGenerale, setTotalEntreeGenerale] = useState(0);
  const [totalSortieGenerale, setTotalSortieGenerale] = useState(0);
  const [stockFinalGenerale, setStockFinalGenerale] = useState(0);

  

  const handleGenerateGenerales = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      toast.error(
        "Veuillez sélectionner une date de début et une date de fin."
      );
      return;
    }

    setLoading(true);

    try {
      console.log("Valeur startDate:", startDate);
      console.log("Valeur endDate:", endDate);

      // const [resMouvements, resEmballages] = await Promise.all([
      //   fetch("/api/mouvements"),
      //   fetch("/api/operationBoxs"),
      // ]);

      // useEffect(()=>{
      //   const fetchMouvements = async () => {
      //   const res = await fetch("/api/mouvements");
      //   const data = await res.json();

      //   if (res.ok && data.success) {
      //     setMouvements(data.data);
      //   } else {
      //     setMouvements([]);
      //   }
      // };

      // fetchMouvements()
      // },[])
      // const dataMouvements = await resMouvements.json();
      // const dataEmballages = await resEmballages.json();

      // 🔹 Conversion ISO sûre
      const start = new Date(`${startDate}T00:00:00`).getTime();
      const end = new Date(`${endDate}T23:59:59`).getTime();

      console.log("Plage de comparaison:", {
        start: new Date(start),
        end: new Date(end),
      });

      // 🔹 Filtrage mouvements
      //       const filtresMouv = (dataMouvements?.data ?? []).filter((m: any) => {
      //   const dateMouvement = new Date(m.date_mouvement?.replace(" ", "T")).getTime();
      //   return !isNaN(dateMouvement);
      // });

      const filtresMouv = (mouvements ?? []).filter((m: Mouvement) => {
        const dateMouvement = new Date(
          m.date_mouvement.replace(" ", "T")
        ).getTime();
        console.log(
          "Date mouvement:",
          m.date_mouvement,
          "=>",
          new Date(dateMouvement)
        );
        return dateMouvement >= start && dateMouvement <= end;
      });

      // state des errors

      if (!mouvements.length)
        return (
          <div className="text-gray-500 w-[100%] h-full flex justify-center items-center text-center p-4">
            Aucun mouvement trouvé pour le moment.
          </div>
        );

      // 🔹 Filtrage emballages

      console.log("Mouvements filtrés:", filtresMouv);

      // 🔹 Totaux
      const totalEntree = filtresMouv
        .filter((m: any) => m.type === "ENTREE")
        .reduce((acc: number, m: any) => acc + Number(m.quantite), 0);

      const totalSortie = filtresMouv
        .filter((m: any) => m.type === "SORTIE")
        .reduce((acc: number, m: any) => acc + Number(m.quantite), 0);

      setMouvementsGeneraux([...filtresMouv]);
      setTotalEntreeGenerale(totalEntree);
      setTotalSortieGenerale(totalSortie);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la génération du rapport.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/auth/register");
      const Userdata = await res.json();

      setUser(Userdata.data);
    };

    fetchUser();
  }, []);

  



  return (
    <div className="flex flex-col justify-center items-center">
      <DialogContent className=" lg:w-[40vw] w-[95vw] max-w-none bg-white lg:p-6 p-3 rounded-xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-[#0EA5E9] text-2xl font-semibold">
            RAPPORTS
          </DialogTitle>
        </DialogHeader>
        <div className=" w-full bg-white flex flex-col gap-3 justify-center items-center">
          <Tabs defaultValue="produits" className=" w-full ">
            <TabsList className="grid justify-center items-center grid-cols-3 md:grid-cols-5 w-full pb-14 md:pb-1 lg:p-1 mb-6 bg-[#eef2fe]">
              <TabsTrigger
                value="mouvements"
                className="lg:text-md text-[12px]"
              >
                PRODUITS
              </TabsTrigger>
              <TabsTrigger value="ventes" className="lg:text-md text-[12px]">
                OPÉRATIONS
              </TabsTrigger>
              <TabsTrigger value="generales" className="lg:text-md text-[12px]">
                GÉNÉRALES
              </TabsTrigger>
              <TabsTrigger value="agents" className="lg:text-md text-[12px]">
                AGENTS
              </TabsTrigger>
              <TabsTrigger value="depenses" className="lg:text-md text-[12px]">
                DÉPENSES
              </TabsTrigger>
            </TabsList>
            <div className="border border-gray-200 w-full lg:p-5 p-2 bg-white flex justify-center items-center">
              {/* 1 */}

              
              
              <RapportProduitEvent />

              {/* 2 */}
              <RapportVenteEvent />
              
              <TabsContent value="generales" className="w-full">
                <form onSubmit={handleGenerateGenerales}>
                  <div className="grid sm:grid-cols-1 gap-4 w-[100%]">
                    <div>
                      <Label>Date de début</Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-[100%] h-12"
                      />
                    </div>

                    <div>
                      <Label>Date de fin</Label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-[100%] h-12"
                      />
                    </div>
                    <Select
                    // onValueChange={(val) => setProduitId(val)}
                    >
                      <SelectTrigger className="w-[100%] h-12">
                        <SelectValue placeholder="Agent responsable" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* {Array.isArray(produits) &&
                      produits.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.nom}
                        </SelectItem>
                      ))} */}
                      </SelectContent>
                    </Select>

                    <Button
                      type="submit"
                      // onClick={handlePrint}
                      className="w-[100%] h-12 bg-[#0EA5E9] hover:bg-[#7dd1f7] cursor-pointer"
                    >
                      {loading ? "Générer..." : "Générer"}
                    </Button>
                  </div>
                </form>

                {/* <div style={{ display: "none" }}>
                  <div ref={componentRef}>
                    <h1>Rapport Général des Mouvements</h1>
                    <p>
                      Date: {startDate} - {endDate}
                    </p> */}
                <div style={{ display: "none" }}>
                  <div ref={componentRef}>
                    <div className="flex flex-col w-[100%] p-10 justify-center gap-15 items-center">
                      <div className="flex flex-col w-[100%] justify-center items-center font-bold text-gray-700">
                        <h1>GA-PRO BUSINESS</h1>
                        <div className="flex w-[100%] items-center  justify-center">
                          <Image
                            src="/gaprojob.png"
                            alt="logo"
                            width={100}
                            height={0}
                            className="rounded-xl m-0 object-cover p-2 "
                          />
                        </div>
                        <h1>Informations spécifique</h1>
                      </div>

                      <div className="flex flex-col w-[100%] gap-4 justify-center items-start">
                        <div className="flex flex-col w-[100%] gap-1 justify-center items-start">
                          <div className="w-[100%] flex justify-between items-end font-bold text-gray-700">
                            <div>
                              <h1 className="font-bold text-gray-700">
                                Rapport générale sur les Produits
                              </h1>
                              <h1 className="font-bold text-gray-700">
                                Date de l'impression : {""}
                                {new Date().toLocaleString("fr-FR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </h1>
                            </div>
                            <div className="flex flex-col justify-start items-end">
                              <h1>
                                {" "}
                                Du : {startDate} au {endDate}
                              </h1>
                              Numéro rapport :{" "}
                              {String(
                                Math.floor(10000 + Math.random() * 90000)
                              )}
                            </div>
                          </div>
                          <table className="table-auto mt-10 border-collapse border w-full mb-4">
                            <thead>
                              <tr className="bg-[#eef2fe]">
                                <th className="border px-2 py-1">Dates</th>
                                <th className="border px-2 py-1">Produits</th>
                                <th className="border px-2 py-1">Categories</th>
                                <th className="border px-2 py-1">stocks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {produits &&
                                produits.map((m) => {
                                  // const produitAssocie = produits.find((p) => p.id === m.produitId);
                                  return (
                                    <tr key={m.id}>
                                      <td className="border px-2 py-1">
                                        {new Date(
                                          m.date_creation
                                        ).toLocaleDateString()}
                                      </td>
                                      <td className="border px-2 py-1">
                                        {m.nom}
                                      </td>
                                      <td className="border px-2 py-1">
                                        {" "}
                                        {m?.categorie?.nom}
                                      </td>
                                      <td className="border px-2 py-1">
                                        {m.stock_initial}
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="agents" className="w-full">
                <form onSubmit={(e) => {}}>
                  <div className="grid sm:grid-cols-1 gap-4 w-[100%]">
                    <Select
                    // onValueChange={(val) => setProduitId(val)}
                    >
                      <SelectTrigger className="w-[100%] h-12">
                        <SelectValue placeholder="Par defaut" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* {Array.isArray(produits) &&
                      produits.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.nom}
                        </SelectItem>
                      ))} */}
                      </SelectContent>
                    </Select>

                    <Button
                      type="submit"
                      className="w-[100%] h-12 bg-[#0EA5E9] hover:bg-[#7dd1f7] cursor-pointer"
                    >
                      {loading ? "Générer..." : "Générer"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="depenses" className="w-full">
                <form onSubmit={(e) => {}}>
                  <div className="grid sm:grid-cols-1 gap-4 w-[100%]">
                    <div>
                      <Label>Date de début</Label>
                      <Input
                        type="date"
                        // onChange={(e) =>
                        //   setFilters({ ...filters, startDate: e.target.value })
                        // }
                        className="w-[100%] h-12"
                      />
                    </div>
                    <div>
                      <Label>Date de fin</Label>
                      <Input
                        type="date"
                        // onChange={(e) =>
                        //   setFilters({ ...filters, endDate: e.target.value })
                        // }
                        className="w-[100%] h-12"
                      />
                    </div>
                    <Select
                    // onValueChange={(val) => setProduitId(val)}
                    >
                      <SelectTrigger className="w-[100%] h-12">
                        <SelectValue placeholder="Sélectionner une devise" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* {Array.isArray(produits) &&
                      produits.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.nom}
                        </SelectItem>
                      ))} */}
                      </SelectContent>
                    </Select>
                    <Select
                    // onValueChange={(val) => setProduitId(val)}
                    >
                      <SelectTrigger className="w-[100%] h-12">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* {Array.isArray(produits) &&
                      produits.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.nom}
                        </SelectItem>
                      ))} */}
                      </SelectContent>
                    </Select>
                    <Select
                    // onValueChange={(val) => setProduitId(val)}
                    >
                      <SelectTrigger className="w-[100%] h-12">
                        <SelectValue placeholder="Agent responsable" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* {Array.isArray(produits) &&
                      produits.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.nom}
                        </SelectItem>
                      ))} */}
                      </SelectContent>
                    </Select>
                    <Button
                      type="submit"
                      className="w-[100%] h-12 bg-[#0EA5E9] hover:bg-[#7dd1f7] cursor-pointer"
                    >
                      {loading ? "Générer..." : "Générer"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </div>
  );
}
