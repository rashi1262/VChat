// components/VersionSelector.js
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, ChevronUp } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const VersionSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState("Gemini");
  const dropdownRef = useRef(null);
  const router = useRouter();

  const versions = [
    {
      name: "Gemini",
      icon: "/assests/gemini-color.png",
      url: "/model",
    },
    {
      name: "VChat",
      icon: "/assests/vlogo.avif",
      url: "/vChat",
    },
    {
      name: "OpenAI",
      icon: "/assests/svgviewer-output.svg",
      url: "/openAI",
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleVersionSelect = (version) => {
    setSelectedVersion(version.name);
    setIsOpen(false);
    router.push(version.url);
  };

  const currentVersion =
    versions.find((v) => v.name === selectedVersion) || versions[0];

  return (
    <div className="relative mr-4 mt-4" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2  rounded-full bg-gray-200 p-2.5 transition-colors duration-200 hover:bg-gray-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="h-6 w-6 relative">
          <Image
            src={currentVersion.icon}
            alt={currentVersion.name}
            fill
            className="object-contain"
          />
        </div>
        <span className="truncate text-sm font-medium">{selectedVersion}</span>
        <ChevronUp
          className={`h-4 w-4 text-black transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          className="absolute bottom-full left-0 z-50 mb-2 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
          role="listbox"
        >
          {versions.map((version) => (
            <li key={version.name} role="option">
              <div
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-gray-50 ${
                  selectedVersion === version.name
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700"
                }`}
                onClick={() => handleVersionSelect(version)}
                aria-selected={selectedVersion === version.name}
              >
                <div className="flex items-center gap-2">
                  <div className="relative h-5 w-5">
                    <Image
                      src={version.icon}
                      alt={version.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span>{version.name}</span>
                </div>
                {selectedVersion === version.name && (
                  <Check className="h-4 w-4 text-blue-500" />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VersionSelector;
