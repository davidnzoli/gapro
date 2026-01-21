"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UpdateExpenseItemsProps {
  onClose: () => void;
  id: string;
  onUpdate: () => void;
}

const Devises = [
  { code: "USD", name: "Dollar américain" },
  { code: "CDF", name: "Franc congolais" },
];

export default function UpdatedExpense({ onClose, id, onUpdate }: UpdateExpenseItemsProps) {
  const [libelle, setLibelle] = React.useState("");
  const [rubriqueName, setRubriqueName] = React.useState("");
  const [beneficiaire, setBeneficiaire] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [userName, setUserName] = React.useState("");
  const [supplierName, setSupplierName] = React.useState("");
  const [serviceName, setServiceName] = React.useState("");
  const [projectName, setProjectName] = React.useState("");
  const [devise, setDevise] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [Suppliers, setSuppliers] = React.useState<{ email: string; id: string }[]>([]);
  const [Rubriques, setRubriques] = React.useState<{ name: string; id: string }[]>([]);
  const [Projects, setProjects] = React.useState<{ name: string; id: string }[]>([]);
  const [Services, setServices] = React.useState<{ name: string; id: string }[]>([]);
  const [Users, setUsers] = React.useState<{ name: string; id: string }[]>([]);

  // Charger une dépense
  React.useEffect(() => {
    const fetchExpense = async () => {
      try {
        const res = await fetch(`/api/expenses/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        console.log("les data", data);

        setLibelle(data.libelle || "");
        setBeneficiaire(data.beneficiaire || "");
        setDevise(data.devise || "");
        setAmount(data.amount ? String(data.amount) : "");
        setRubriqueName(data.rubriqueName || "");
        setUserName(data.userName || "");
        setSupplierName(data.supplierName || "");
        setServiceName(data.serviceName || "");
        setProjectName(data.projectName || "");
      } catch (error) {
        console.error("Erreur lors du chargement de expense", error);
      }
    };

    if (id) fetchExpense();
  }, [id]);

  // Charger les listes
  React.useEffect(() => {
    async function fetchLists() {
      const res = await fetch("/api/expenses");
      const result = await res.json();
      console.log("suppliers sont : ", result.suppliers);
      setRubriques(result.rubriques || []);
      setServices(result.services || []);
      setProjects(result.projects || []);
      setSuppliers(result.suppliers || []);
      setUsers(result.users || []);
    }
    fetchLists();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`/api/expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          libelle,
          rubriqueName,
          beneficiaire,
          devise,
          amount: parseFloat(amount),
          userName,
          supplierName,
          projectName,
          serviceName,
        }),
      });
      onUpdate();
      onClose();
      toast.success("Dépense modifiée avec succès ✅");
    } catch (error) {
      console.error("Erreur de mise à jour :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Modifier cette dépense</DialogTitle>
        <DialogDescription>
          Remplissez le formulaire ci-dessous et cliquez sur Enregistrer.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        {/* Service */}
        <div className="grid gap-2">
          <Select value={serviceName} onValueChange={setServiceName}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez un service" />
            </SelectTrigger>
            <SelectContent>
              {Services.map((s) => (
                <SelectItem key={s.id} value={s.name}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Projet */}
        <div className="grid gap-2">
          <Select value={projectName} onValueChange={setProjectName}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez un projet" />
            </SelectTrigger>
            <SelectContent>
              {Projects.map((p) => (
                <SelectItem key={p.id} value={p.name}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Rubrique */}
        <div className="grid gap-2">
          <Select value={rubriqueName} onValueChange={setRubriqueName}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez une rubrique" />
            </SelectTrigger>
            <SelectContent>
              {Rubriques.map((r) => (
                <SelectItem key={r.id} value={r.name}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Libellé */}
        <div className="grid gap-2 w-full">
          <Label htmlFor="libelle">Libellé</Label>
          <Input
            id="libelle"
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
            required
          />
        </div>
        {/* Utilisateur */}
        <div className="grid gap-2">
          <Select value={userName} onValueChange={setUserName}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez un agent de suivis" />
            </SelectTrigger>
            <SelectContent>
              {Users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Devise */}
        <div className="grid gap-2">
          <Select value={devise} onValueChange={setDevise}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez une devise" />
            </SelectTrigger>
            <SelectContent>
              {Devises.map((d) => (
                <SelectItem key={d.code} value={d.code}>
                  {d.name} - {d.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Montant */}
        <div className="grid gap-2 w-full">
          <Label htmlFor="amount">Montant</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        {/* Fournisseur */}
        <div className="grid gap-2">
          <Select value={supplierName} onValueChange={setSupplierName}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez un fournisseur" />
            </SelectTrigger>
            <SelectContent>
              {Suppliers.map((s) => (
                <SelectItem key={s.id} value={s.email}>
                  {s.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter className="mt-4 flex gap-2 justify-end">
          <Button variant="outline" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}