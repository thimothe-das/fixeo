"use client";

import { User } from "@/lib/db/schema";
import { fetcher } from "@/lib/utils";
import { useState } from "react";
import useSWR from "swr";
import Form from "./Form";
import Presentation from "./Presentation";
import RequestModal from "./RequestModal";
import Title from "./Title";

export default function FixeoHomePage() {
  const { data: user } = useSWR<User>("/api/user", fetcher);
  const userEmail = user?.email;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCtaClick = () => {
    setSelectedCategory(undefined);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCategory(undefined);
  };

  return (
    <main className="bg-white">
      <RequestModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        userEmail={userEmail}
        preSelectedCategory={selectedCategory}
      />
      <section className="relative bg-gradient-to-br from-slate-50 to-blue-50 py-12 lg:py-16 min-h-[calc(100vh-80px)] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <Title onCtaClick={handleCtaClick} />
          <Form onCategoryClick={handleCategoryClick} />
        </div>
      </section>
      {/* How it Works */}
      <Presentation />
    </main>
  );
}
