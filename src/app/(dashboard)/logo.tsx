import Link from "next/link";
import Image from "next/image";
import { Space_Grotesk } from "next/font/google";

import { cn } from "@/lib/utils";

const font = Space_Grotesk({
  weight: ["700"],
  subsets: ["latin"],
});

export const Logo = () => {
  return (
    <Link href="/">
      <div className="flex w-full hover:opacity-75 transition h-[68px] px-4">
        <Image 
          src="https://sovanza.com/assert/asad/asad/Logo.svg" 
          alt="Arcus AI Logo" 
          width={150} 
          height={50} 
          className="object-contain"
        />
      </div>
    </Link>
  );
};
