/**
 * Script exécuté avant le premier rendu (balise <head>) : l'ouverture de la Maison ne joue que si la session
 * commence sur l'accueil, une seule fois, jamais avec « réduire les animations ». Sans JavaScript, elle n'apparaît pas.
 */
export const INTRO_HEAD_SCRIPT = `try{var d=document.documentElement;if(sessionStorage.getItem("mt-intro")){d.classList.add("intro-seen")}else if(location.pathname==="/"&&!matchMedia("(prefers-reduced-motion: reduce)").matches){d.classList.add("intro-play")}}catch(e){}`;
