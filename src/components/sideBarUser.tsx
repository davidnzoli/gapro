"use client";

import { useState,useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  LayoutDashboard,
  LogOut,
  Wallet,
  FolderKanban,
  Archive,
  Calculator,
  Truck,
  UserCog,
  UserCircle,
  Settings,
  FileText,
  Building2,
  Anvil,
  Menu,
  X,
  ChevronDown,
  UserRound,
  ChartNoAxesGantt,
  Tags,
  ShoppingCart,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Image from "next/image";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const menuSections = [
  {
    title: "SYSTÈME",
    items: [
      {
        text: "TABLEAU DE BORD",
        icon: <LayoutDashboard className="h-5 w-5" />,
        href: "/DashboardUser",
      },
    ],
  },
  {
    title: "OPÉRATION",
    items: [
        {
        text: "OPÉRATIONS PRODUITS",
        icon: <Building2 className="h-5 w-5" />,
        href: "/DashboardUser/mouvements",
      },
      {
        text: "OPÉRATIONS DE VENTE",
        icon: <ShoppingCart className="ml-2 h-4 w-4" />,
        href: "/DashboardUser/ventes",
      },
      
    ],
  },
];

export default function SidebarUser() {
  const { user, loading, error, refresh } = useCurrentUser();

  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Utilisation de useCallback pour stabiliser la fonction
  const handleLogout = useCallback(async () => {
    try {
      // NOTE: L'API /api/auth/logout n'est pas définie dans le contexte,
      // la déconnexion sera simulée pour l'environnement.
      
      // const res = await fetch("/api/auth/logout", { method: "POST" });

      // if (res.ok) {
        toast.success("Déconnexion réussie ! (Simulée)");
        // refresh(); // Désactivé car rafraîchissement non supporté dans le mock
        router.push("/auth");
      // } else {
      //   toast.error("Impossible de se déconnecter");
      // }
    } catch (err) {
      toast.error("Erreur serveur (Simulée)");
    }
  }, [router]);

  let content;

  if (loading) {
    content = <div></div>;
  } else if (error) {
    content = <div className="text-red-500">{error}</div>;
  } else if (!user) {
    content = (
      <div>
        <Link href="/auth">Se connecter</Link>
      </div>
    );
  } else {
    content = (
      <>
        <header className="fixed top-0 left-0 right-0 h-16 bg-white flex items-center justify-between lg:pr-15 pr-12 lg:pl-5 pl-2 shadow-md z-50 ">
          <Button
            variant="ghost"
            className="p-2 w-16 cursor-pointer hover:bg-[#eef2fe] rounded-sm"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X width={30} height={30} />
            ) : (
              <ChartNoAxesGantt width={30} height={30} />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center justify-end gap-2">
                <div className="w-[100%] flex items-center justify-end gap-2 cursor-pointer">
                  <UserRound />
                  <span className="lg:text-sm text-[12px] font-medium text-gray-900">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 lg:w-52" align="start">
              <DropdownMenuLabel className="text-gray-500 text-sm lg:text-md">
                Mon compte
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer font-base text-md">
                  Profile
                  <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer font-base text-md">
                  Paramètre
                  <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer font-base text-md"
              >
                Déconnecter
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* ✅ Sidebar en mode desktop (toujours affiché) */}
        <aside className="hidden lg:flex w-72 h-screen fixed left-0 top-0 bg-[#1E3A8A] text-[#FFFFFF] font-poppins font-bold flex-col justify-between z-200">
          <ScrollArea className="h-full w-full pt-16">
            <SidebarContent />
          </ScrollArea>
        </aside>

        {/* ✅ Sidebar en mode mobile (slide-in) */}
        <aside
          className={`lg:hidden fixed top-0 left-0 h-screen w-72 bg-[#1E3A8A] text-[#FFFFFF] font-poppins font-bold flex flex-col justify-between z-40 transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <ScrollArea className="h-full w-full pt-16">
            <SidebarContent onClickLink={() => setIsOpen(false)} />
          </ScrollArea>
        </aside>
      </>
    );
  }

  return content;
}

function SidebarContent({ onClickLink }: { onClickLink?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  // Utilisation de useCallback pour stabiliser la fonction
  const handleLogout = useCallback(async () => {
    try {
        toast.success("Déconnexion réussie ! (Simulée)");
        router.push("/auth");
    } catch (err) {
      toast.error("Erreur serveur (Simulée)");
    }
  }, [router]);
  
  return (
    <div className="w-[100%] flex flex-col items-start justify-center">
      <div className="flex w-[100%] h-50  items-center  justify-center">
        <Image
          src="/logopro.svg"
          alt="logo"
          width={170}
          height={0}
          className="rounded-4xl m-0 object-cover p-0 "
        />
      </div>
      <nav className="p-4 flex flex-col w-[100%]    gap-2">
        {menuSections.map((section, i) => (
          <div key={i} className="w-full ">
            <div className="px-4 py-2 text-gray-400 uppercase text-sm font-semibold">
              {section.title}
            </div>
            {section.items.map((menu, index) =>
              (
                // 2. Logique des menus simples
                <Link
                  key={index}
                  href={menu.href || "#"}
                  onClick={onClickLink} // Ferme le menu mobile
                  className={`
                    w-full p-2 flex text-sm lg:text-md items-center gap-2 py-2 font-normal rounded transition-colors
                     ${
                      pathname === menu.href
                      // Style actif
                        ? "text-[#2e2e40] bg-[#eaeaea]"
                      // Style inactif
                        : "text-gray-200  hover:font-bold"
                    }
                  `}
                >
                  {menu.icon}
                  <span className="w-full">{menu.text}</span>
                </Link>
              )
            )}
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10 pb-20">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-gray-200 hover:bg-[#2e2e40] hover:text-white"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
}
// export default function SidebarUser() {
//   const { user, loading, error, refresh } = useCurrentUser();

//   const [isOpen, setIsOpen] = useState(false);
//   const pathname = usePathname();

//   const router = useRouter();

//   const handleLogout = async () => {
//     try {
//       const res = await fetch("/api/auth/logout", { method: "POST" });

//       if (res.ok) {
//         toast.success("Déconnexion réussie !");
//         refresh();
//         router.push("/auth");
//       } else {
//         toast.error("Impossible de se déconnecter");
//       }
//     } catch (err) {
//       toast.error("Erreur serveur");
//     }
//   };

//   let content;

//   if (loading) {
//     content = <div></div>;
//   } else if (error) {
//     content = <div>{error}</div>;
//   } else if (!user) {
//     content = (
//       <div>
//         <a href="/auth">Se connecter</a>
//       </div>
//     );
//   } else {
//     content = (
//       <>
//         <header className="fixed top-0 left-0 right-0 h-16 bg-white flex items-center justify-between lg:pr-15 pr-12 lg:pl-5 pl-2 shadow-md z-50 ">
//           <Button
//             variant="ghost"
//             className="p-2 w-16 cursor-pointer hover:bg-[#eef2fe] rounded-sm"
//             onClick={() => setIsOpen(!isOpen)}
//           >
//             {isOpen ? (
//               <X width={30} height={30} />
//             ) : (
//               <ChartNoAxesGantt width={30} height={30} />
//             )}
//           </Button>

//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <div className="flex items-center justify-end gap-2">
//                 <div className="w-[100%] flex items-center justify-end gap-2 cursor-pointer">
//                   <UserRound />
//                   <span className="lg:text-sm text-[12px] font-medium text-gray-900">
//                     {user.email}
//                   </span>
//                 </div>
//               </div>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent className="w-48 lg:w-52" align="start">
//               <DropdownMenuLabel className="text-gray-500 text-sm lg:text-md">
//                 Mon compte
//               </DropdownMenuLabel>
//               <DropdownMenuGroup>
//                 <DropdownMenuItem className="cursor-pointer font-base text-md">
//                   Profile
//                   <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem className="cursor-pointer font-base text-md">
//                   Paramètre
//                   <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
//                 </DropdownMenuItem>
//               </DropdownMenuGroup>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem
//                 onClick={handleLogout}
//                 className="cursor-pointer font-base text-md"
//               >
//                 Déconnecter
//                 <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </header>

//         {/* ✅ Sidebar en mode desktop (toujours affiché) */}
//         <aside className="hidden lg:flex w-72 h-screen fixed left-0 top-0 bg-[#1E3A8A] text-[#FFFFFF] font-poppins font-bold flex-col justify-between z-200">
//           <ScrollArea className="h-full w-full pt-16">
//             <SidebarContent />
//           </ScrollArea>
//         </aside>

//         {/* ✅ Sidebar en mode mobile (slide-in) */}
//         <aside
//           className={`lg:hidden fixed top-0 left-0 h-screen w-72 bg-[#1E3A8A] text-[#FFFFFF] font-poppins font-bold flex flex-col justify-between z-40 transform transition-transform duration-300
//         ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
//         >
//           <ScrollArea className="h-full w-full pt-16">
//             <SidebarContent onClickLink={() => setIsOpen(false)} />
//           </ScrollArea>
//         </aside>
//       </>
//     );
//   }

//   return content;
// }

// function SidebarContent({ onClickLink }: { onClickLink?: () => void }) {
//   const pathname = usePathname();
//   const { user, loading, error, refresh } = useCurrentUser();
//   const router = useRouter();
//   const handleLogout = async () => {
//     try {
//       const res = await fetch("/api/auth/logout", { method: "POST" });

//       if (res.ok) {
//         toast.success("Déconnexion réussie !");
//         refresh();
//         router.push("/auth");
//       } else {
//         toast.error("Impossible de se déconnecter");
//       }
//     } catch (err) {
//       toast.error("Erreur serveur");
//     }
//   };
//   return (
//     <div className="w-[100%] flex flex-col items-start justify-center">
//       <div className="flex w-[100%] h-50  items-center  justify-center">
//         <Image
//           src="/logopro.svg"
//           alt="logo"
//           width={170}
//           height={0}
//           className="rounded-4xl m-0 object-cover p-0 "
//         />
//       </div>
//       <nav className="p-4 flex flex-col w-[100%]    gap-2">
//         {menuSections.map((section, i) => (
//           <div key={i} className="w-full ">
//             <div className="px-4py-2 text-gray-400 uppercase text-sm font-semibold">
//               {section.title}
//             </div>
//             {section.items.map((menu, index) =>
//               menu.subItems ? (
//                 <Collapsible key={index}>
//                   <CollapsibleTrigger asChild>
//                     <Button
//                       variant="ghost"
//                       className="w-full justify-between font-normal text-left text-gray-200 text-base hover:bg-[#2e2e40] hover:text-white"
//                     >
//                       <div className="flex items-center lg:text-md w-full gap-2 py-5 text-sm mr-5">
//                         <span className="">{menu.icon}</span>
//                         {menu.text}
//                       </div>
//                       <ChevronDown className="h-4 w-4" />
//                     </Button>
//                   </CollapsibleTrigger>
//                   <CollapsibleContent className="pl-8 space-y-1">
//                     {menu.subItems.map((subItem, subIndex) => (
//                       <Link
//                         className={`w-[100%]  flex text-sm lg:text-md items-center font-normal hover:text-[#6998ff] rounded ${
//                           pathname === menu.href
//                             ? "w-[100%] text-[#2563EB] bg-[#e7e7e7]"
//                             : ""
//                         }`}
//                         key={subIndex}
//                         href={subItem.href}
//                       >
//                         <Button
//                           variant="ghost"
//                           className="w-full justify-start font-normal text-sm text-gray-200 hover:bg-[#2e2e40] hover:text-white"
//                           onClick={onClickLink}
//                         >
//                           {subItem.text}
//                         </Button>
//                       </Link>
//                     ))}
//                   </CollapsibleContent>
//                 </Collapsible>
//               ) : (
//                 <Link
//                   key={index}
//                   href={menu.href || "#"}
//                   className={`w-[100%] p-2 flex text-sm lg:text-md items-center gap-2 py-2 font-normal hover:text-[#6998ff] rounded ${
//                     pathname === menu.href
//                       ? "w-[100%] text-[#2563EB] bg-[#e7e7e7]"
//                       : ""
//                   }`}
//                 >
//                   {menu.icon}
//                   <span className="w-full">{menu.text}</span>
//                 </Link>
//               )
//             )}
//           </div>
//         ))}
//       </nav>
//       <div className="p-4 border-t border-white/10 pb-20">
//         <Button
//           variant="ghost"
//           onClick={handleLogout}
//           className="w-full justify-start text-gray-200 hover:bg-[#2e2e40] hover:text-white"
//         >
//           <LogOut className="h-5 w-5 mr-3" />
//           Déconnexion
//         </Button>
//       </div>
//     </div>
//   );
// }
