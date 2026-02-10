"use client";
import * as React from "react";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/pagination";
import { useRouter } from "next/navigation";
import {
  Trash,
  Edit,
  Inbox,
  Loader2,
  Pencil,
  Eye,
  Banknote,
  FileText,
  Search,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { useParams } from "next/navigation";

import {
  Archive,
  ArrowDown,
  ArrowDownCircle,
  ArrowUp,
  ArrowUpCircle,
  BadgeDollarSign,
  BanknoteArrowDown,
  File,
  Layers,
  MessageCircle,
  Package,
  TriangleAlert,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Dialog,
  DialogTrigger,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";
import AllReport from "@/components/popups/Rapports/AllReport";
// import AddVente from "@/components/popups/addNews/addVente";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
const data = [
  { name: "Janvier", revenue: 4000, revenus: 2400 },
  { name: "Février", revenue: 3000, revenus: 1398 },
  { name: "Mars", revenue: 2000, revenus: 9800 },
  { name: "Avril", revenue: 2780, revenus: 3908 },
  { name: "Mai", revenue: 1890, revenus: 4800 },
  { name: "Juin", revenue: 2390, revenus: 3800 },
  { name: "Juillet", revenue: 3490, revenus: 4300 },
];

interface ItemsCategorie {
  id: string;
  nom: string;
  designation: string;
  date_categorie: string;
}

interface ItemsProduit {
  id: string;
  nom: string;
  unite: string;
  stock_initial: number | null;
  seuil_minimum: number | null;
  date_creation: string;
  categorie?: ItemsCategorie;
}
interface ItemsDepenses {
  amount: string;
  devise: string;
}
interface Mouvement {
  id: string;
  produitId: string;
  date_mouvement: string;
  type: string;
  quantite: string;
  observation: string;
  produit?: ItemsProduit;
}
interface LigneVente {
  quantite: number;
  produitId: string;
  produit?: ItemsProduit;
}
interface Client {
  id: string;
  nom: string;
}
interface VenteItem {
  id: string;
  client: Client | null;
  clientId: string;
  createdAt: string;
  total: number;
  ligneVente: LigneVente[];
}

interface VentesResponse {
  data: VenteItem[];
}
interface VentesResponse {
  data: VenteItem[];
}

import {
  Select, // Import pour le sélecteur de période
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Interface pour les nouvelles statistiques agrégées
interface AggregatedStats {
  totalVentes: number;
  totalProductionsEntree: number;
  totalProductionsSortie: number;
  totalProduitFiniOperationEmballage: number;
  totalDepenses: number;
}

export default function ChartDemo() {
  const route = useRouter();
  const params = useParams();
  const id = params?.id;
  const componentRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [opens, setOpens] = useState(false);
  const [produit, setProduit] = useState<ItemsProduit[]>([]);
  const [vente, setVente] = useState<VenteItem | null>(null);
  const [depense, setDepense] = useState<ItemsDepenses[]>([]);
  const [entree, setEntree] = useState(0);
  const [sortie, setSortie] = useState(0);
  const [totalStockInitial, setTotalStockInitial] = useState(0);
  const [totalDepense, setTotalDepense] = useState(0);
  const [ventes, setVentes] = useState<VenteItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [ventesPerPage] = useState(7);
  const [detailsOpenId, setDetailsOpenId] = useState<string | null>(null);
  const [printAfterLoad, setPrintAfterLoad] = useState(false);

  // 🟢 NOUVEAUX ÉTATS POUR LE FILTRAGE PAR DATE
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

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

      filtered = filtered.filter((vente) => {
        const venteDate = new Date(vente.createdAt).getTime();
        return venteDate >= start && venteDate <= end;
      });
    } else if (startDate) {
      // Filtrage si seule la date de début est fournie (pour le jour même)
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      const end = new Date(startDate).setHours(23, 59, 59, 999);

      filtered = filtered.filter((vente) => {
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
  const currentVentes = filteredVentes.slice(
    indexOfFirstVente,
    indexOfLastVente
  );

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Nouveaux états pour les statistiques agrégées
  const [stats, setStats] = useState<AggregatedStats>({
    totalVentes: 0,
    totalProductionsEntree: 0,
    totalProductionsSortie: 0,
    totalProduitFiniOperationEmballage: 0,
    totalDepenses: 0,
  });

  const handleVentesAdded = (vente: VenteItem) => {
    setVentes((prev) => [vente, ...prev]);
  };
  const fetchVentes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ventes");
      const result: VentesResponse = await res.json();
      if (res.ok && result) {
        setVentes(result.data || []);
        setPrintAfterLoad(true);
        // toast.success("Vente récupérée !");
      } else {
        toast.error("Vente introuvable");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des ventes :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepense();
    fetchProduits();
    fetchMouvements();
    fetchVentes();
    const handleVenteAdded = () => fetchVentes();
    window.addEventListener("venteAdded", handleVenteAdded);
    return () => window.removeEventListener("venteAdded", handleVenteAdded);
  }, []);

  const fetchMouvements = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mouvements");
      const data: { data: Mouvement[] } = await res.json();

      const mouvementsEntree = data.data?.filter(
        (mouvement: Mouvement) => mouvement.type === "ENTREE"
      );
      const totalEntree = mouvementsEntree.reduce(
        (acc: number, mouvement: Mouvement) => acc + Number(mouvement.quantite),
        0
      );

      const mouvementsSortie = data.data.filter(
        (mouvement: Mouvement) => mouvement.type === "SORTIE"
      );
      const totalSortie = mouvementsSortie.reduce(
        (acc: number, mouvement: Mouvement) => acc + Number(mouvement.quantite),
        0
      );
      setEntree(totalEntree);
      setSortie(totalSortie);
    } catch (error) {
      console.error("Erreur lors de la récupération des mouvements :", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepense = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/expenses");

      if (res.ok) {
        const data: { data: ItemsDepenses[] } = await res.json();

        const depensesArray = Array.isArray(data.data) ? data.data : [];
        const depenseAvecStock = depensesArray.filter(
          (depense) => Number(depense.amount) > 0
        );
        const totalDepense = depenseAvecStock.reduce(
          (acc: number, depense) => acc + Number(depense.amount),
          0
        );
        setTotalDepense(totalDepense);
        setDepense(depenseAvecStock);
      } else {
        toast.error("Échec de l’enregistrement.");
        return;
      }
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
      const data: { data: ItemsProduit[] } = await res.json();

      const produitsAvecStock = data.data.filter(
        (produit) => Number(produit.stock_initial) > 0
      );

      const totalStockInitials = produitsAvecStock.reduce(
        (acc: number, produit) => acc + Number(produit.stock_initial),
        0
      );
      setTotalStockInitial(totalStockInitials);
      setProduit(produitsAvecStock);
    } catch (error) {
      console.error("Erreur lors de la récupération des mouvements :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProduits = async () => {
      const res = await fetch("/api/produits");
      const data = await res.json();
      setProduit(data.data);
    };
    fetchProduits();
  }, []);

  // État pour la période sélectionnée
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month"); // Valeur par défaut

  // ------------------------------------------------
  // FONCTION UTILITAIRE POUR LES DATES
  // ------------------------------------------------

 const getPeriodDates = (period: string): { startDate: Date; endDate: Date } => {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();

  if (period === "day") {
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(now); // Aujourd'hui seulement
  } else if (period === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Dernier jour du mois
  } else if (period === "year") {
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31); // Dernier jour de l'année
  } else {
    startDate = new Date(2000, 0, 1);
    endDate = new Date(now.getFullYear() + 1, 0, 1);
  }

  return { startDate, endDate };
};

  // NOUVELLE FONCTION DE FETCH

 const fetchAggregatedStats = useCallback(async (period: string) => {
    setLoading(true);
    try {
        const { startDate, endDate } = getPeriodDates(period);
        const startISO = startDate.toISOString().split('T')[0];
        const endISO = endDate.toISOString().split('T')[0];

        const res = await fetch(`/api/dashboard-stats?start=${startISO}&end=${endISO}`);
        
        // VÉRIFICATION CRITIQUE DU TYPE DE RÉPONSE
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Le serveur n'a pas renvoyé de JSON. Vérifiez le terminal VS Code.");
        }

        const data = await res.json();

        if (res.ok) {
            setStats(data);
        } else {
            toast.error(data.message || "Erreur lors de la récupération");
        }
    } catch (error: any) {
        console.error("Erreur stats:", error);
        toast.error(error.message);
    } finally {
        setLoading(false);
    }
}, []);

  // ------------------------------------------------
  // MISE À JOUR DU useEffect
  // ------------------------------------------------
  useEffect(() => {
    // ... (autres fetchs)
    fetchAggregatedStats(selectedPeriod); // Appel initial
  }, [fetchAggregatedStats, selectedPeriod]); // Se déclenche quand la période change

  // Fonction de gestion du changement du sélecteur
  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="animate-spin h-16 w-16 text-[#1E3A8A]" />
        </div>
      ) : (
        <>
          <div className="text-gray-500 flex flex-col gap-3 justify-center pb-28 items-center mt-10 lg:mt-0">
            <div className="flex justify-between items-center w-[100%] pt-9 lg:pt-20">
              <h1 className="md:text-3xl text-md font-bold flex flex-row items-center gap-2 text-gray-700 text-center justify-center cursor-pointer">
                TABLEAU DE BORD
              </h1>
              <div className="w-100]">
                <Dialog open={opens} onOpenChange={setOpens}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="lg:text-xl text-sm font-bold flex flex-row items-center gap-2 text-[#1E3A8A] hover:text-[#1E3A8A] hover:bg-gray-100 border-1 border-gray-400 p-5 text-center justify-center cursor-pointer"
                    >
                      <File />
                      RAPPORTS
                    </Button>
                  </DialogTrigger>
                  <AllReport onClosed={() => setOpens(false)} />
                </Dialog>
              </div>
            </div>
            <div className="flex lg:flex-row flex-col lg:items-center items-start w-[100%] justify-between  gap-3">
              <div className="w-[100%] lg:w-[50%] h-48  p-4 rounded-sm shadow-sm shadow-gray-200  flex flex-col justify-end items-start gap-3  bg-white">
                <div className="flex flex-col justify-start items-start w-[100%]">
                  <div className="flex flex-col justify-start gap-5 lg:gap-1 items-start w-[100%]">
                    <div className="w-[100%] flex justify-between items-center gap-2 text-center">
                      <h1 className=" bg-[#eef2fe] p-4 rounded-b-full rounded-t-full text-[#0EA5E9]">
                        <Layers className="w-6 h-6 text-success" />
                      </h1>
                      <Button
                        variant="ghost"
                        className="lg:text-md text-[12px] font-normal flex flex-row items-center gap-2 text-[#1E3A8A] hover:text-[#1E3A8A] hover:bg-gray-100 border-1 border-gray-400 p-5 text-center justify-center cursor-pointer"
                        onClick={() => route.push("/Dashboard/produits")}
                      >
                        Voir tous les produits
                      </Button>
                    </div>
                    <h1 className="font-medium lg:text-xl text-[13px] text-gray-700">
                      {totalStockInitial}
                    </h1>
                  </div>
                </div>

                <div className=" w-[100%] gap-1 flex justify-between items-center text-center">
                  <h1 className="font-normal lg:text-md text-[12px] text-gray-400">
                    {" "}
                    PRODUITS EN STOCK
                  </h1>
                  <h1 className="lg:text-md text-[12px] text-[#0EA5E9] flex gap-1 text-center justify-center items-center">
                    Total des articles en générale
                    <span>
                      <Package />
                    </span>
                  </h1>
                </div>
              </div>
              <div className=" w-[100%]  flex lg:flex-row flex-col lg:h-48 h-[100%] justify-between items-center rounded-sm shadow-sm shadow-gray-200  gap-3 bg-white ">
                <div className="w-[100%] lg:w-[50%] lg:h-42 p-4 flex flex-col justify-end items-start gap-3 border-r-gray-200 border-r-1">
                  <h1 className=" bg-[#eef2fe] p-4 rounded-b-full rounded-t-full text-[#0EA5E9]">
                    <ArrowDownCircle className="w-6 h-6 text-success" />
                  </h1>
                  <h1 className="font-medium lg:text-xl text-[13px] text-gray-700">
                    {stats.totalProductionsEntree.toLocaleString("fr-FR")}
                  </h1>

                  <div className=" w-[100%] gap-1 flex justify-between items-center text-center">
                    <h1 className="font-normal lg:text-md text-[12px] text-gray-400">
                      ENTRÉES
                    </h1>
                    <h1 className="lg:text-md text-[12px] text-[#0EA5E9] flex gap-1 text-center justify-center items-center">
                      Total entrée des articles
                      <span>
                        <ArrowDown />
                      </span>
                    </h1>
                  </div>
                </div>
                <div className="w-[100%] lg:w-[50%] lg:h-42 p-4 flex flex-col justify-end items-start gap-3 border-r-gray-200 border-r-1">
                  <h1 className=" bg-[#eef2fe] p-4 rounded-b-full rounded-t-full text-[#0EA5E9]">
                    <ArrowUpCircle className="w-6 h-6" />
                  </h1>
                  <h1 className="font-medium lg:text-xl text-[13px] text-gray-700">
                    {(stats.totalProductionsSortie || 0).toLocaleString()}
                  </h1>
                  <div className=" w-[100%] gap-1 flex justify-between items-center text-center">
                    <h1 className="font-normal lg:text-md text-[12px] text-gray-400">
                      SORTIES
                    </h1>
                    <h1 className="lg:text-md text-[12px] text-[#0EA5E9] flex gap-1 text-center justify-center items-center">
                      Total sortie des articles
                      <span>
                        <ArrowUp />
                      </span>
                    </h1>
                  </div>
                </div>
                <div className="w-[100%] lg:w-[50%] h-42  p-4 flex flex-col justify-end items-start gap-4 ">
                  <h1 className=" bg-[#eef2fe] rounded-b-full rounded-t-full p-4 text-[#0EA5E9]">
                    <MessageCircle className="w-6 h-6" />
                  </h1>

                  <h1 className="font-medium lg:text-md text-[12px] text-red-500">
                    Messages
                  </h1>

                  <div className=" w-[100%] flex justify-between gap-1 items-center text-center">
                    <Badge
                      variant="destructive"
                      className="font-normal text-sm text-white"
                    >
                      Alerte
                    </Badge>

                    <span>
                      <TriangleAlert className="text-red-500" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-[100%] flex lg:flex-row flex-col lg:h-72  justify-center lg:items-center items-start rounded-sm">
              <div className=" lg:w-[100%] w-[100%] p-1 flex lg:flex-col h-full flex-col justify-start lg:items-start items-start gap-1 ">
                <div className="flex justify-between text-center items-start w-[100%] pb-5">
                  <h2 className="w-full text-left font-bold text-lg text-gray-700">
                    Synthèse de la Période
                  </h2>

                  {/* Sélecteur de Période */}
                  <Select
                    value={selectedPeriod}
                    onValueChange={handlePeriodChange}
                  >
                    <SelectTrigger className="w-[180px] lg:text-md text-sm">
                      <SelectValue placeholder="Sélectionner Période" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="total">Depuis le début</SelectItem>
                      <SelectItem value="year">Cette Année</SelectItem>
                      <SelectItem value="month">Ce Mois</SelectItem>
                      <SelectItem value="day">Aujourd'hui</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid lg:grid-cols-3 grid-cols-1 w-[100%] gap-3">
                  {/* Carte 1: Ventes Totales */}
                  <div className="w-[100%] h-48 p-4 rounded-sm shadow-sm shadow-gray-200 flex flex-col justify-between bg-white border-l-4 border-blue-500">
                    <div className="flex justify-between items-start w-full">
                      <h1 className="text-xl font-bold text-gray-800">
                        {stats.totalVentes.toLocaleString("fr-FR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        FC
                      </h1>
                      <Banknote className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                      <h1 className="font-normal text-md text-gray-500">
                        VENTES TOTALES
                      </h1>
                      <h1 className="text-sm text-gray-400">
                        Période sélectionnée
                      </h1>
                    </div>
                  </div>

                  {/* Carte 2: Production Totale */}
                  {/* <div className="w-[100%] h-48 p-4 rounded-sm shadow-sm shadow-gray-200 flex flex-col justify-between bg-white border-l-4 border-green-500">
                    <div className="flex justify-between items-start w-full">
                      <h1 className="text-xl font-bold text-gray-800">
                        {stats.totalProduitFiniOperationEmballage.toLocaleString(
                          "fr-FR"
                        )}{" "}
                        PF
                      </h1>
                      <Layers className="w-8 h-8 text-green-500" />
                    </div>
                    <div>
                      <h1 className="font-normal text-md text-gray-500">
                        PRODUCTION TOTALE
                      </h1>
                      <h1 className="text-sm text-gray-400">
                        Quantité des articles déjà emballés
                      </h1>
                    </div>
                  </div> */}

                  {/* Carte 3: Dépenses Totales */}
                  <div className="w-[100%] h-48 p-4 rounded-sm shadow-sm shadow-gray-200 flex flex-col justify-between bg-white border-l-4 border-red-500">
                    <div className="flex justify-between items-start w-full">
                      <h1 className="text-xl font-bold text-gray-800">
                        {stats.totalDepenses.toLocaleString("fr-FR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        FC
                      </h1>
                      <FileText className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                      <h1 className="font-normal text-md text-gray-500">
                        DÉPENSES TOTALES
                      </h1>
                      <h1 className="text-sm text-gray-400">Total payé</h1>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[100%] flex flex-col justify-start items-start gap-3 mt-20 md:mt-10 lg:mt-1">
              {/* Table */}
              <h1 className="text-gray-700">Liste des ventes</h1>
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
              <div className="border border-gray-200 lg:p-6 w-full bg-white flex flex-col gap-4">
                <Table className="w-full border border-gray-200">
                  <TableHeader className="border border-gray-200 bg-[#eef2fe] w-[100%]">
                    <TableRow className="w-[100%]">
                      <TableHead className="text-[12px] text-start lg:text-md">
                        Date
                      </TableHead>
                      <TableHead className="text-[12px] text-start lg:text-md">
                        Nombre d’articles
                      </TableHead>
                      <TableHead className="text-[12px] text-start lg:text-md">
                        Total
                      </TableHead>
                      <TableHead className="text-[12px] text-start lg:text-md">
                        Catégorie
                      </TableHead>
                      <TableHead className="text-[12px] text-start lg:text-md">
                        Produits
                      </TableHead>
                      <TableHead className="text-[12px] text-start lg:text-md">
                        Acheteur
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentVentes.length > 0 ? (
                      currentVentes.map((vente, index) => (
                        <TableRow key={vente.id || index}>
                          <TableCell className="text-[12px] lg:text-md">
                            {new Date(vente.createdAt).toLocaleString("fr-FR")}
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
                                }) + " FC"
                              : 0}
                          </TableCell>
                          <TableCell className="text-[12px] lg:text-md">
                            produit fini gapro
                          </TableCell>
                          <TableCell className="text-[12px] flex space-x-1 justify-start items-start gap-1 lg:text-md">
                            {vente.ligneVente.map((el, index) => (
                              <h1 key={index}>{el.produit?.nom}</h1>
                            ))}
                          </TableCell>

                          <TableCell className="text-[12px] lg:text-md">
                            {vente.client?.nom || "—"}
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
              {ventes.length > ventesPerPage && (
                <div className="w-[99%]  flex justify-center mt-2">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>

            <div className="w-full h-[400px] p-4 rounded-2xl shadow-sm bg-white">
              <h2 className="lg:text-md text-[12px] text-primary font-semibold mb-4">
                Revenus vs Dépenses
              </h2>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="dépenses"
                    fill="#f87171"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar dataKey="revenus" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </>
  );
}