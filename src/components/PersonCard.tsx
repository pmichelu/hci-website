"use client";

import DynamicImage from "@/components/DynamicImage";
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
      <div className="relative w-full max-w-[280px] aspect-square mb-5 overflow-hidden rounded-3xl">
        {photoUrl ? (
          <DynamicImage
            src={photoUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <DynamicImage
            src="/images/people/placeholder-person.svg"
            alt={name}
            fill
            className="object-cover"
          />
        )}
        {bio && isHovered && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-5 transition-opacity duration-300">
            <p className="text-white text-sm leading-relaxed">{bio}</p>
          </div>
        )}
      </div>
      <h4 className="text-base font-bold tracking-wider uppercase text-gray-700">
        {name}
      </h4>
      <p className="text-sm text-gray-500 mt-1 whitespace-pre-line">{title}</p>
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
