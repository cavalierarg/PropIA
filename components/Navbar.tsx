"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const { isSignedIn } = useUser();

  return (
    <header className="flex justify-between items-center p-4 gap-4 h-16 max-w-7xl mx-auto">
      <Link href="/" className="text-2xl font-bold">
        PropIA
      </Link>
      <div className="flex gap-4 items-center">
        {isSignedIn ? (
          <UserButton />
        ) : (
          <SignInButton>
            <Button>Sign In</Button>
          </SignInButton>
        )}
      </div>
    </header>
  );
};

export default Navbar;
