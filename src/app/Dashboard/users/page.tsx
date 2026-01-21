"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
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
import { ArrowRight, Search } from "lucide-react";
import Pagination from "@/components/pagination";
import { Trash, Edit, Loader2 } from "lucide-react";

type FormType = {
  name: string;
  postnom: string;
  prenom: string;
  email: string;
  password: string;
  role: "admin" | "caissier" | "magasinier" | "comptable";
  pays: string;
  ville: string;
  commune: string;
  Etatcivil: string;
  numerotelephone: string;
};

interface utilisateurItems{
  id: string;
  name:string;
  postnom:string;
  prenom: string;
  ville:string;
  email:string;
  role:string;
  Etatcivil:string;
  commune:string;
  numerotelephone:string;
  pays:string;

}
export default function AddUser() {
  const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [opens, setOpens] = useState(false);
    const [utilisateur, setUtilisateur] = useState<utilisateurItems[]>([]);
  const [form, setForm] = useState<FormType>({
    name: "",
    postnom: "",
    prenom: "",
    email: "",
    password: "",
    role: "caissier",
    pays: "",
    ville: "",
    commune: "",
    Etatcivil: "",
    numerotelephone: "",
  });

    const [currentPage, setCurrentPage] = useState(1);
    const [categoriesPerPage] = useState(7);
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
      null
    );
  
    // const totalCategories = depenses.length;
    const totalCategories = utilisateur?.length ?? 0;
    const totalPages = Math.ceil(totalCategories / categoriesPerPage);
  
    const indexOfLastCategory = currentPage * categoriesPerPage;
    const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
   const currentCategories = utilisateur && utilisateur.length
  ? utilisateur.slice(indexOfFirstCategory, indexOfLastCategory)
  : [];
  
    const handlePageChange = (pageNumber: number) => {
      setCurrentPage(pageNumber);
    };

  const handleChange = (key: keyof FormType, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const fetchUser = async ()=>{
    setLoading(true)
    try{

      const res = await fetch("/api/auth/register")
      
        if (res.ok) {
          const result = await res.json();
            setUtilisateur(result.data)
            console.log(result.data)
            } else {
              toast.error("Échec de l’enregistrement.");
              return;
            }

      }catch(err){
        console.error("Erreur lors de la récupération des service:");
      setUtilisateur([]);
      }finally {
      setLoading(false);
    }
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Utilisateur créé !");
        await fetchUser();
        setForm({
          name: "",
          postnom: "",
          prenom: "",
          email: "",
          password: "",
          role: "caissier",
          pays: "",
          ville: "",
          commune: "",
          Etatcivil: "",
          numerotelephone: "",
        });
      } else {
        toast.error(data.error || "Erreur lors de la création");
      }
    } catch (err) {
      toast.error("Erreur serveur");
    }
  };
   useEffect(() => {
     fetchUser();
 
     const handleVenteAdded = () => fetchUser();
     window.addEventListener("venteAdded", handleVenteAdded);
     return () => window.removeEventListener("venteAdded", handleVenteAdded);
   }, []);


  return (
    <div className="w-[100%] text-gray-500 flex flex-col justify-start items-start py-15 lg:10 mt-5 gap-3">
      <form
        onSubmit={handleSubmit}
        className="bg-white flex flex-col justify-center items-start border border-gray-200 rounded-md  w-[100%] lg:p-20 p-3 pt-8"
      >
       <div className="w-[100%] flex flex-col md:flex-row gap-3 justify-between text-center items-center">
         <h2 className="lg:text-xl text-md font-bold text-gray-700 text-center">
          Ajouter un nouvel utilisateur
        </h2>
        <Button type="submit" className=" h-12 w-[60%] md:w-56 bg-[#1E3A8A] text-white p-3 rounded-sm cursor-pointer hover:bg-blue-950 transition-colors"> 
          Créer utilisateur
        </Button>
       </div>
        <div  className="w-[100%] lg:border-1 lg:border-gray-200 lg:mb-15 mt-5"></div>

        <div className="grid justify-center items-center w-[100%] grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: "Nom", key: "name" },
            { label: "Postnom", key: "postnom" },
            { label: "Prénom", key: "prenom" },
            { label: "Email", key: "email", type: "email" },
            { label: "Mot de passe", key: "password", type: "password" },
            { label: "Rôle", key: "role", type: "select", options: ["admin", "caissier", "magasinier", "comptable"] },
            { label: "Pays", key: "pays" },
            { label: "Ville", key: "ville" },
            { label: "Commune", key: "commune" },
            { label: "État civil", key: "Etatcivil" },
            { label: "Numéro de téléphone", key: "numerotelephone" },
          ].map((field) => (
            <div key={field.key} className="flex flex-col gap-2  w-full">
              <Label>{field.label}</Label>
              {field.type === "select" ? (
                <select
                  value={form[field.key as keyof FormType]}
                  onChange={(e) =>
                    handleChange(field.key as keyof FormType, e.target.value)
                  }
                  className="border p-3 rounded-sm w-full text-[12px]"
                >
                  {(field.options || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  type={field.type || "text"}
                  placeholder={field.type ? field.type : field.label}
                  value={form[field.key as keyof FormType]}
                  onChange={(e) =>
                    handleChange(field.key as keyof FormType, e.target.value)
                  }
                  className="w-full h-12 rounded-sm shadow-none "
                  required
                />
              )}
            </div>
          ))}
        </div>

        
      </form>

      <div className="justify-center  items-center w-[100%] h-full">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin h-16 w-15 text-[#1E3A8A]" />
          </div>
        ) : (
          <>
            <div className="text-gray-500 flex h-16 bg-white mb-1 justify-between items-center gap-3.5">
              <div className="flex justify-start  w-[100%] items-center gap-2">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Filtrer par nom du rubrique"
                    className="pl-10 pr-4 h-12 text-[12px] lg:text-md w-full border-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
            </div>
            <Table className="border border-gray-200">
              <TableHeader className="border border-gray-200  bg-[#eef2fe]">
                <TableRow className="border-none">
                  
                   <TableHead className="font-medium lg:text-md text-[12px]">
                    Email
                  </TableHead>
                  <TableHead className="font-medium lg:text-md text-[12px]">
                    Ville
                  </TableHead>
                  <TableHead className="font-medium lg:text-md text-[12px]">
                    Commune
                  </TableHead>
                  <TableHead className="font-medium lg:text-md text-[12px]">
                    Téléphone
                  </TableHead>
                   <TableHead className="font-medium lg:text-md text-[12px]">
                    Rôle
                  </TableHead>
                  <TableHead className="text-end lg:text-md text-[12px]">
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="border border-gray-200">
                {currentCategories && currentCategories.length > 0 ? (
                  currentCategories.map((utilisateur) => (
                    <TableRow
                      key={utilisateur.id}
                      className="border border-gray-200"
                    >
                      <TableCell className="text-left lg:text-md text-[12px]">
                        {utilisateur.email}
                      </TableCell>
                      <TableCell className="text-left lg:text-md text-[12px]">
                        {utilisateur.ville?utilisateur.ville : "-"}
                      </TableCell>
                      <TableCell className="text-left lg:text-md text-[12px]">
                        {utilisateur.commune ? utilisateur.commune : "-"}
                      </TableCell>
                       <TableCell className="text-left lg:text-md text-[12px]">
                        {utilisateur.numerotelephone ? utilisateur.numerotelephone : "-"}
                      </TableCell>
                      <TableCell className="text-left lg:text-md text-[12px]">
                        {utilisateur.role}
                      </TableCell>
                      <TableCell className="text-left lg:text-md text-[12px]">
                        <div className="text-right flex items-rigth justify-end gap-2">
                          {/* <DeletePopupCategory
                      categoryId={categorie.id}
                      onDeletes={handleDelete}
                    /> */}

                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedServiceId(utilisateur.id);
                              setOpen(true);
                            }}
                            className="flex items-center cursor-pointer border-1 border-gray-100 space-x-2"
                          >
                            <Edit className="h-5 w-5 text-[#1e1e2f]" />
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedServiceId(utilisateur.id);
                              setOpen(true);
                            }}
                            className="flex items-center cursor-pointer border-1 border-gray-100 space-x-2"
                          >
                            <Trash className="h-5 w-5 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 ext-left lg:text-md text-[12px]"
                    >
                      <div className="flex flex-col justify-center items-center text-[#1e1e2f] text-base">
                        <img
                          src="/undraw_no-data_ig65.svg"
                          className="w-48 h-48 mb-4"
                          alt="svg-no-data"
                        />
                        Aucun projet trouvé dans cette table, veuillez ajouter
                        un <br /> projet puis vérifier après !
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <Dialog open={open} onOpenChange={setOpen}>
              {/* <DialogContent>
          <DialogTitle>Modifier la depense</DialogTitle>
          {selectedCategoryId && (
            <UpdatedCategory
              categoryId={selectedCategoryId}
              onClose={() => setOpen(false)}
              onUpdate={fetchCategories}
            />
          )}
        </DialogContent> */}
            </Dialog>
            <div className="flex justify-center mt-2">
              {setUtilisateur.length > 10 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}