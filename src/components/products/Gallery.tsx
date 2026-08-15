"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { Button } from "@/components/ui/button";

export function Gallery({
  images,
  title,
  children,
}: {
  images: string[];
  title: string;
  children?: React.ReactNode;
}) {
  const [activeImg, setActiveImg] = useState(0);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted"
      >
        {images[activeImg] && (
          <Zoom>
            <Image src={images[activeImg]} alt={title} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </Zoom>
        )}
        {children}
      </motion.div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <Button
              key={i}
              variant="ghost"
              size="icon"
              onClick={() => setActiveImg(i)}
              className={`relative aspect-square h-auto w-auto overflow-hidden rounded-md border-2! p-0 ${i === activeImg ? "border-primary!" : "border-transparent"}`}
            >
              <Image src={img} alt="" fill sizes="96px" className="object-cover" />
            </Button>
          ))}
        </div>
      )}
    </>
  );
}