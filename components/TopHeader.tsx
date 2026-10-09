"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageSquare } from "lucide-react";
import FeedbackForm from "@/components/FeedbackForm";

export default function TopHeader() {
  const [buka, setBuka] = useState(false);

  return (
    <header className="flex w-full items-center justify-between bg-header px-4 py-3">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/images/soilmate.png"
          alt="Soilmate"
          width={160}
          height={40}
          priority
          className="h-8 w-auto"
        />
      </Link>

      <button
        onClick={() => setBuka(true)}
        className="flex items-center gap-1.5 rounded-full bg-cream-light/15 px-3 py-1.5 text-xs font-semibold text-cream-light hover:bg-cream-light/25"
      >
        <MessageSquare className="h-3.5 w-3.5" /> Masukan
      </button>

      <FeedbackForm
        open={buka}
        onClose={() => setBuka(false)}
        jenis="aplikasi"
      />
    </header>
  );
}
