import React, { useEffect, useState } from "react";
import {client} from "../../contentfulClient"; // 👈 importa tu cliente de Contentful

const Footer = () => {
  const [footerData, setFooterData] = useState(null);

  useEffect(() => {
    client
      .getEntries({ content_type: "footer" }) // 👈 Debes crear un modelo "footer" en Contentful
      .then((res) => {
        if (res.items.length > 0) {
          setFooterData(res.items[0].fields);
        }
      })
      .catch(console.error);
  }, []);

  if (!footerData) {
    return null; // ⏳ Esperando data
  }

  return (
    <footer className="text-gray-400 border-t bg-dark-900 border-nature-700/30">
      <div className="flex flex-col items-center px-6 py-10 mx-auto space-y-6 max-w-7xl">
        
        {/* Logo + descripción */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white font-display">
            <span className="text-nature-500">🌿</span> {footerData.logoTitle}
          </h2>
          <p className="max-w-md mx-auto mt-2 text-sm text-gray-400">
            {footerData.description}
          </p>
        </div>

        {/* Contacto */}
        <div className="space-y-1 text-sm text-center">
          <p>📍 {footerData.address}</p>
          <p>📞 {footerData.phone}</p>
          <p>📧 {footerData.email}</p>
        </div>

        

        {/* Copyright */}
        <div className="w-full pt-4 text-xs text-center text-gray-500 border-t border-nature-700/20">
          © {new Date().getFullYear()} {footerData.logoTitle}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
