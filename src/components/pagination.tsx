"use client";

import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PaginationComponent({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null; // pas besoin de pagination

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <Pagination className="mt-4 flex flex-col lg:flex-row justify-end items-center">
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious
        href="#"
        size="sm" // ← ajoute la taille
        onClick={(e) => {
          e.preventDefault();
          onPageChange(currentPage - 1);
        }}
      />
    </PaginationItem>

    {pages.map((page) => (
      <PaginationItem key={page}>
        <PaginationLink
          href="#"
          size="sm" // ← ajoute la taille
          isActive={currentPage === page}
          onClick={(e) => {
            e.preventDefault();
            onPageChange(page);
          }}
          className="text-[#1e1e2f]"
        >
          {page}
        </PaginationLink>
      </PaginationItem>
    ))}

    <PaginationItem>
      <PaginationNext
        href="#"
        size="sm" // ← ajoute la taille
        onClick={(e) => {
          e.preventDefault();
          onPageChange(currentPage + 1);
        }}
      />
    </PaginationItem>
  </PaginationContent>
</Pagination>

    // <Pagination className="mt-4 flex justify-end items-center">
    //   <PaginationContent>
    //     <PaginationItem>
    //       <PaginationPrevious
    //         href="#"
    //         onClick={(e) => {
    //           e.preventDefault();
    //           onPageChange(currentPage - 1);
    //         }}
    //       />
    //     </PaginationItem>

    //     {pages.map((page) => (
    //       <PaginationItem key={page}>
    //         <PaginationLink
    //           href="#"
    //           isActive={currentPage === page}
    //           onClick={(e) => {
    //             e.preventDefault();
    //             onPageChange(page);
    //           }}
    //           className="text-[#1e1e2f]"
    //         >
    //           {page}
    //         </PaginationLink>
    //       </PaginationItem>
    //     ))}

    //     <PaginationItem>
    //       <PaginationNext
    //         href="#"
    //         onClick={(e) => {
    //           e.preventDefault();
    //           onPageChange(currentPage + 1);
    //         }}
    //       />
    //     </PaginationItem>
    //   </PaginationContent>
    // </Pagination>
  );
}