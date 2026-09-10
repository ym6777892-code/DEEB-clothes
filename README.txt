DEEB — website (rewritten, fixed)
================================

WHAT'S FIXED
------------
1. Broken paths: shop/lookbook/about/contact used ../pages/, ../images/, ../style.css
   but the repo is flat. ALL paths are now flat and consistent across all 6 pages.
2. Removed the stray debug <img> at the top of collections.html.
3. Hero price pill no longer shows the literal words "crossed out" — it uses <s>.
4. Homepage stats now match the real catalog (2 Wolf drops + 5 ALPHA styles).
5. Social links no longer open twice (removed duplicate JS window.open handlers).
6. Removed dead code: empty setupCloseOnOverlay() and the never-dispatched 'open-order' listener.
7. Modal accessibility: aria-hidden now toggles on open/close, focus is trapped in the dialog,
   focus returns to the trigger on close.
8. Order form validation: name, phone (Egyptian format 01xxxxxxxxx), and address are required,
   with inline error messages and red highlights. Empty orders can no longer be copied.
9. ALPHA colorways (Brown/Olive/Burgundy) can now actually be ordered — added to the color
   select and each ALPHA card has its own Order Now button that pre-fills product + color.
10. Single-source pricing: change CONFIG.priceCurrent / priceOld in script.js and every
    price on every page updates automatically (elements use data-price-current/old/save).
11. Added: favicon, dynamic footer year, theme-color + Open Graph meta tags, lazy loading,
    -webkit-backdrop-filter prefixes, Escape closes the mobile menu, animated hamburger icon,
    reduced-motion support, scroll-margin for anchor links, autocomplete attributes.

IMAGES
------
This zip contains only code. Keep your existing images in the SAME folder as these files:
  black-front.jpg  black-back.jpg  black-flat.jpg  black-flat-back.jpg
  white-front.jpg  white-back.jpg  white-flat.jpg  white-flat-back.jpg
  alpha-brown.JPG  alpha-black.JPG  alpha-white.JPG  alpha-olive.JPG  alpha-burgundy.jpg

DEPLOY
------
Delete the old .html/.css/.js files from your repo and upload these 8 files next to your images.
