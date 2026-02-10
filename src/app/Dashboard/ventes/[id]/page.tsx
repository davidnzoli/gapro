"use client";
import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DialogContent } from "@/components/ui/dialog";
import { Dialog, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BadgeDollarSign,
  BanknoteArrowDown,
  BookAlert,
  FileChartColumnIncreasing,
  FileText,
  Printer,
} from "lucide-react";
import Pagination from "@/components/pagination";
import { Trash, Edit, Loader2, Pencil, Eye } from "lucide-react";
import AddExpense from "@/components/popups/addNews/addExpense";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import DeleteVente from "@/components/popups/DeleteItems/deleteVente";

interface Client {
  id: string;
  nom: string;
}
interface utulisateur {
  id: string;
  nom: string;
}
interface ItemsProduit {
  id: string;
  nom: string;
  unite: string;
  prix?: number;
  devise:String;
  stock_initial: number | null;
  seuil_minimum: number | null;
  date_creation: string;
}

interface LigneVente {
  id: string;
  quantite: number;
  produitId: string;
  prixUnitaire: number;
  sousTotal: number;
  vente?: VenteItem[];
  produit?: ItemsProduit;
}

interface VenteItem {
  id: string;
  client: Client;
  clientId: string;
  createdAt: string;
  total: number;
  utilisateur: utulisateur[];
  ligneVente: LigneVente[];
}
interface VentesResponse {
  data: VenteItem[];
}

export default function DetailVente() {
  const [loading, setLoading] = useState(true);
  const [itemsVente, setItemsVente] = useState<VenteItem[]>([]);
  const [ventes, setVentes] = useState<VenteItem | null>(null);
  const [printAfterLoad, setPrintAfterLoad] = useState(false);

  const componentRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const id = params?.id as string;

  const handleDeleteVente = (id: string) => {
    setItemsVente((prev) => prev.filter((p) => p.id !== id));
  };

  const fetchventesId = async (id: string) => {
    try {
      const res = await fetch(`/api/ventes/${id}`);
      const result = await res.json();
      if (res.ok && result) {
        setVentes(result);
        setPrintAfterLoad(true);
        toast.success("Vente récupérée !");
      } else {
        toast.error("Vente introuvable");
      }
    } catch (err) {
      toast.error("Erreur lors du chargement de la vente");
    }
  };

  async function fetchventesPourDetatil() {
    setLoading(true);
    try {
      const res = await fetch(`/api/ventes/${id}`);
      const result = await res.json();
      setVentes(result);
      console.log("resultat :", result);
      setLoading(false);
      // setPrintAfterLoad(true);
    } catch (error) {
      console.error("erreur de recupération ", error);
      return null;
    }
  }

  const TotalVente = ventes?.ligneVente?.reduce((accumulateur, lignes) => {
    const sousTotal = lignes.sousTotal ?? 0;
    return accumulateur + Number(sousTotal);
  }, 0);

  const PrixTotalFormat = (TotalVente ?? 0).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: ventes
      ? `Rapport_${ventes.client?.nom || "Inconnu"}`
      : "Rapport",

    onAfterPrint: () => toast.message("Impression terminée"),
    onPrintError: (error) => {
      console.error("Erreur d'impression :", error);
      toast.error("Erreur lors de l'impression.");
    },
  });

  useEffect(() => {
    if (ventes && printAfterLoad) {
      handlePrint();
      setPrintAfterLoad(false); // réinitialiser le flag
    }
  }, [ventes, printAfterLoad]);

  useEffect(() => {
    if (id) fetchventesPourDetatil();
  }, [id]);

  return (
    <>
      <div className="w-[100%] flex flex-col border-0.5 shadow-sm bg-white border-gray-300  rounded-md mt-20 text-[12px] text-gray-700 p-5 gap-2">
        <div className="flex flex-col xl:flex-row  gap-6 xl:justify-between justify-center xl:items-start items-start w-[100%] p-2 border-b-1 border-gray-100 bg-[#fcfcff] rounded-md ">
          <div className="flex flex-col">
            <h1 className="pl-2 lg:text-2xl text-2xl lg:w-xl w-[100%] text-[#33334b] ">
              Détail de vente
              <span className="text-base"> ##{ventes?.client?.nom}</span>
            </h1>

            <h1 className="pl-2 lg:text-md text-[13px] w-[100%] text-gray-500">
              Id: {ventes?.clientId}
            </h1>
          </div>

          <div className="xl:flex font-normal grid md:grid-cols-4 grid-cols-2 justify-start items-start gap-1">
            {/* <Button className="bg-[#0EA5E9] font-normal text-[12px] xl:text-base rounded-none p-3 cursor-pointer hover:bg-[#7fc4f9]">
              Modifier la vente
            </Button> */}
            <Button className="bg-[#1E3A8A] font-normal text-[12px] xl:text-base  rounded-none p-3 cursor-pointer hover:bg-[#7fc4f9]">
              Bon de production
            </Button>

            {ventes && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    fetchventesId(ventes.id);
                  }}
                  className=" bg-gray-700 font-normal text-[12px] xl:text-base text-white rounded-none  p-3 cursor-pointer hover:bg-[#7fc4f9]"
                >
                  Imprimer la facture
                  <Printer className="h-8 w-8 cursor-pointer" />
                </Button>
                <DeleteVente id={ventes.id} onDeletes={handleDeleteVente} />
              </>
            )}
          </div>
        </div>
        <h1 className="pl-2 lg:text-xl text-2xl lg:w-xl w-[100%]  text-[#33334b]">
          Information générales
        </h1>
        <div className="flex flex-row gap-20 justify-start items-center  p-2 border-gray-100 border-b-1 border-b-gray">
          <h1 className=" w-md ">Id d'opération</h1>
          <h1 className="w-3xl">{ventes?.id} </h1>
        </div>
        <div className="flex flex-row gap-20 justify-start items-center  p-2 border-gray-100 border-b-1 border-b-gray">
          <h1 className=" w-md ">Date de la commande: {ventes?.createdAt}</h1>
          <h1 className="w-3xl">Confirmée 🟢</h1>
        </div>

        <div className="flex flex-row gap-20  justify-start items-center bg-[#f2faff]  p-2 border-b-1 border-gray-100 border-b-gray">
          <h1 className="w-md">Statut de vente 🟢</h1>
          <h1 className=" w-3xl">
            Date:{" "}
            {new Date().toLocaleString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
          </h1>
        </div>
      </div>

      <div className="w-[100%] mt-6  flex flex-col xl:flex-row justify-center xl:justify-between items-start gap-3 xl:gap-1 text-[12px]">
        <div className=" xl:w-2/3 w-full flex flex-col border-0.5 shadow-sm bg-white border-gray-300  rounded-md text-[12px] text-gray-700 p-5 gap-2">
          <h1 className="lg:text-xl text-md">Détails des Articles Commandés</h1>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin h-6 w-6 text-[#1E3A8A]" />
            </div>
          ) : (
            <Table className="border border-gray-200">
              <TableHeader className="border border-gray-200 bg-[#eef2fe]">
                <TableRow className="border-none">
                  <TableHead className="font-medium lg:text-md text-[12px]">
                    ARTICLE
                  </TableHead>
                  <TableHead className="font-medium lg:text-md text-[12px]">
                    QTE. COMMANDEE
                  </TableHead>
                  <TableHead className="font-medium lg:text-md text-[12px]">
                    PRIX UNITAIRE
                  </TableHead>
                  <TableHead className="font-medium lg:text-md text-[12px]">
                    TOTAL LIGNE
                  </TableHead>
                  <TableHead className="font-center lg:text-md text-[12px]">
                    STATUT PRODUCTION
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="border border-gray-200">
                {ventes?.ligneVente && ventes.ligneVente.length > 0 ? (
                  ventes.ligneVente.map((ligne, index) => (
                    <TableRow key={ligne.id} className="border border-gray-200">
                      <TableCell className="text-left lg:text-md text-[12px]">
                        {ligne.produit?.nom}
                      </TableCell>
                      <TableCell className="text-left lg:text-md text-[12px]">
                        {ligne.quantite} Pièce(s)
                      </TableCell>
                      <TableCell className="text-left lg:text-md text-[12px]">
                        {ligne.prixUnitaire ?? 0} {""}$
                      </TableCell>
                      <TableCell className="text-center lg:text-md text-[12px]">
                        <span className="p-1 rounded-full text-[10px] bg-yellow-100 text-yellow-800">
                          {(
                            Number(ligne.prixUnitaire) * Number(ligne.quantite)
                          ).toLocaleString("fr-FR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                          {""} $
                        </span>
                      </TableCell>
                      <TableCell className="text-center ">✅</TableCell>
                    </TableRow>
                  ))
                ) : (
                  // Message si aucune ligne de commande n'est trouvée
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex flex-col lg:text-md text-[12px] justify-center items-center text-[#1e1e2f] text-base">
                        Aucun articles trouvé pour cette vente.
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
        <div className=" xl:w-[32%] w-full  flex flex-col border-0.5 shadow-sm bg-white border-gray-300  rounded-md text-[12px] text-gray-700 p-5 gap-2">
          <h1 className="text-2xl">Recap Financière</h1>
          <div className="p-2 flex flex-col gap-3 justify-start items-start">
            <p>item de ttc et autres</p>
            <p>item de TVA : 370(25%)</p>
            <p>item de ACCOMPTE 2230 $ </p>
            <p>item Accompte Piece Virement</p>
            <p>item Modele de payement: 0.00$</p>
            <p>item solde d'ù: 1720 $</p>
          </div>
        </div>
      </div>

      <div className="w-[100%] mt-6  xl:h-44 h-80  flex flex-col xl:flex-row xl:justify-between justify-center items-center xl:gap-1 gap-3 text-[12px]">
        <div className=" xl:w-2/3 w-full h-44 flex flex-col border-0.5 shadow-sm bg-white border-gray-300  rounded-md text-[12px] text-gray-700 p-5 gap-2">
          <h1 className="text-2xl">Historique et Notes</h1>
          <div className="p-2 flex flex-col gap-3 justify-start items-start">
            <p>log des actions</p>
            <p className="p-1">
              {" "}
              . Crée par "Jean de Dieu mutombo" le 10/12/200
            </p>
            <p className="p-1">
              {" "}
              . Modifié par "Alice de tick mulongo" le 10/12/200
            </p>
          </div>
        </div>
        <div className=" xl:w-[32%] w-full flex flex-col border-0.5 shadow-sm bg-white border-gray-300  rounded-md text-[12px] text-gray-700 p-5 gap-2">
          <h1>Recap Financière</h1>
          <div className="p-2 flex flex-col gap-3 justify-start items-start">
            <p>item de ttc et autres</p>
          </div>
        </div>
      </div>

      {/* Div caché pour impression */}
      <div style={{ display: "none" }}>
        <div ref={componentRef}>
          <div className="flex flex-col w-[100%] p-10 justify-center gap-15 items-center">
            <div className="flex flex-col w-[100%] justify-center p-0 items-center font-bold text-gray-700">
              <h1>GA-PRO BUSINESS</h1>
              <div className="flex w-[100%] items-center justify-center">
                <Image
                  src="/gaprojob.png"
                  alt="logo"
                  width={100}
                  height={0}
                   className=" mt-4 h-50 text-red-500 object-cover p-0 "
                  // className="rounded-4xl  pb-8 lg:pb-1 h-50 m-0 object-cover p-0 "
                />
              </div>
              <h1 className="text-xl font-bold text-black">FACTURE</h1>
            </div>

            <div className="flex flex-col w-[100%] gap-4 justify-center items-start">
              <div className="flex flex-col w-[100%] gap-1 justify-center items-start">
                <h1 className="text-[18px] text-bold text-gray-700">
                  Informations spécifique
                </h1>
                <div className="w-[100%] flex justify-between items-start font-bold text-gray-700">
                  <div className="flex flex-col w-[100%] gap-1 justify-start items-start">
                    Numéro rapport :{" "}
                    {String(Math.floor(10000 + Math.random() * 90000))}
                    <h1 className="font-bold text-gray-700">
                      Client : {""} {ventes?.client?.nom}
                    </h1>
                    <h1 className="font-bold text-gray-700">
                      Id Vente: {""} {ventes?.id}
                    </h1>
                    <h1 className="font-bold text-gray-700">
                      Date : {""}
                      {new Date().toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </h1>
                  </div>

                  <div className="flex flex-col w-[100%] gap-1 justify-end items-end">
                    <h1 className="font-bold text-gray-700text-end ">
                      GA-PRO Boutique de vente Téléphone
                    </h1>
                    <h1 className="font-bold text-gray-700 text-end">
                      Experience de plus de 3ans dans l'industrualisation
                    </h1>
                    <h1 className="font-bold text-gray-700 text-end">
                      Email professionnel : ga-pro9@gmail.com Tél : +243
                      992700451
                    </h1>
                    <h1 className="font-bold text-gray-700 text-end">
                      Adresse :
                    </h1>
                    <h1 className="font-bold text-gray-700 text-end">
                      RCCM : BIA/RCCM/21-A-1301099 ID: 07-G4701-N94649
                    </h1>
                    <h1 className="font-bold text-gray-700 text-end">NI :</h1>
                  </div>
                </div>
                <table className="table-auto mt-10 border-collapse border w-full mb-4">
                  <thead>
                    <tr className="bg-[#eef2fe] text-center">
                      <th className="border px-2 py-1 text-center">Date</th>
                      <th className="border px-2 py-1 text-center">Articles</th>
                      <th className="border px-2 py-1 text-center" colSpan={2}>
                        Prix unitaire PF & Quantité
                      </th>
                      <th className="border px-2 py-1 text-center">
                        Total Prix PF
                      </th>
                      <th className="border px-2 py-1 text-center">Payement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventes?.ligneVente?.map((el, index) => (
                      <tr key={index}>
                        <td className="border px-2 py-1 text-center font-semibold text-gray-700">
                          {new Date(ventes?.createdAt || "").toLocaleDateString(
                            "fr-FR"
                          )}
                        </td>
                        <td className="px-2 py-1 text-center font-semibold text-gray-700">
                          {el.produit?.nom}
                        </td>

                        <td className="border px-2 py-1 text-center font-semibold text-gray-700">
                          {Number(el.prixUnitaire).toLocaleString("fr-FR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{el.produit?.devise}
                        </td>
                        <td className="border px-2 py-1 text-center font-semibold text-gray-700">
                          {el.quantite}{" "}
                        </td>
                        <td className="border px-2 py-1 text-center font-semibold text-gray-700">
                          {Number(el.sousTotal).toLocaleString("fr-FR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}$
                        </td>
                        <td className="border px-2 py-1 text-center font-semibold text-gray-700">
                          Espèce
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td
                        colSpan={3}
                        className="border px-2 py-1 text-center font-bold text-lg bg-gray-100"
                      >
                        TOTAL À PAYER :
                      </td>
                      <td
                        colSpan={3}
                        className="border px-2 py-1 text-center font-bold text-lg bg-gray-100"
                      >
                        {PrixTotalFormat.toLocaleString()} $
                        
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className=" w-full border-1 border-gray-300  "></div>
            <h1 className="text-blue-300">Merci pour votre confiance ! À BIENTÔT</h1>
            <div className=" w-full border-1 border-gray-300"></div>
          </div>
        </div>
      </div>
    </>
  );
}
