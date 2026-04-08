"use client";

import Image from "next/image";
import { FaTwitter, FaLinkedinIn, FaFacebookF, FaGlobe } from "react-icons/fa";
import { useState } from "react";

interface PersonCardProps {
  name: string;
  title: string;
  bio?: string;
  photoUrl?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    website?: string;
  };
}

export default function PersonCard({
  name,
  title,
  bio,
  photoUrl,
  socialLinks,
}: PersonCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex flex-col items-center text-center group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-48 h-48 mb-4 overflow-hidden rounded-2xl">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-4xl text-gray-400">
              {name.charAt(0)}
            </span>
          </div>
        )}
        {bio && isHovered && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4 transition-opacity duration-300">
            <p className="text-white text-xs leading-relaxed">{bio}</p>
          </div>
        )}
      </div>
      <h4 className="text-lg font-bold tracking-wider uppercase text-gray-700">
        {name}
      </h4>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
      {bio && !isHovered && (
        <div className="mt-2 px-4">
          <div className="border-t border-gray-200 pt-2">
            <p className="text-xs text-gray-400 line-clamp-2">{bio}</p>
          </div>
        </div>
      )}
      {socialLinks && (
        <>
          <div className="w-full max-w-[200px] border-t border-gray-200 mt-3" />
          <div className="flex gap-4 mt-3 text-gray-400">
            {socialLinks.twitter && (
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--color-primary)] transition-colors"
              >
                <FaTwitter size={18} />
              </a>
            )}
            {socialLinks.linkedin && (
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--color-primary)] transition-colors"
              >
                <FaLinkedinIn size={18} />
              </a>
            )}
            {socialLinks.facebook && (
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--color-primary)] transition-colors"
              >
                <FaFacebookF size={18} />
              </a>
            )}
            {socialLinks.website && (
              <a
                href={socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--color-primary)] transition-colors"
              >
                <FaGlobe size={18} />
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
}
