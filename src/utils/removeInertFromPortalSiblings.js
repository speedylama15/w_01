const removeInertFromPortalSiblings = () => {
  const portal = document.querySelector(".portal");

  const siblings = Array.from(portal.parentNode.childNodes).filter(
    (dom) => dom !== portal,
  );

  siblings.forEach((dom) => dom.removeAttribute("inert"));

  document.body.style.overflow = "";
};

export default removeInertFromPortalSiblings;
