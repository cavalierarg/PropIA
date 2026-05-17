"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const { isSignedIn } = useUser();

  return (
    <header className="w-full sticky top-0 z-50 bg-[#0f3460] shadow-md border-b border-[#00d4d4]/20">
      <div className="flex justify-between items-center px-6 gap-4 h-16 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png.png"
            alt="PropIA logo"
            width={38}
            height={38}
            className="rounded-full"
            priority
          />
          <span className="text-xl font-bold text-white tracking-tight">
            Prop<span className="text-[#00d4d4]">IA</span>
          </span>
        </Link>
        <div className="flex gap-4 items-center">
          {isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton>
              <Button className="bg-[#00d4d4] text-[#0f3460] font-semibold hover:bg-[#00bfbf] border-0 shadow-sm">
                Iniciar sesión
              </Button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
