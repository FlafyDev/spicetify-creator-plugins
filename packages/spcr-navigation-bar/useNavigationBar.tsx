import React, { useState } from "react";
import NavbarContent, { SelectLinkCallbackType } from "./navBar";

const useNavigationBar = (links: string[]): [JSX.Element, string, SelectLinkCallbackType] => {
  const [activeLink, setActiveLink] = useState(links[0]);
  const navbar = <NavbarContent links={links} activeLink={activeLink} switchCallback={(link) => setActiveLink(link)} />

  return [navbar, activeLink, setActiveLink];
}

export default useNavigationBar;
