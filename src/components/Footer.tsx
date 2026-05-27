import React from "react";

function Footer() {
  return (
    <footer className="py-8 flex items-center justify-center">
      <a
        href="https://www.instagram.com/elrincondeldev/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-[#aaa] text-sm hover:text-[#111] transition-colors duration-200"
      >
        Made with ♥ by
        <span className="font-semibold text-[#111]">@elrincondeldev</span>
      </a>
    </footer>
  );
}

export default Footer;
