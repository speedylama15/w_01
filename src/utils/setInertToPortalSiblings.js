const setInertToPortalSiblings = () => {
  const portal = document.querySelector(".portal");

  const siblings = Array.from(portal.parentNode.childNodes).filter(
    (dom) => dom !== portal,
  );

  siblings.forEach((dom) => dom.setAttribute("inert", true));

  document.body.style.overflow = "hidden";
};

export default setInertToPortalSiblings;
