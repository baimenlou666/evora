document.addEventListener('DOMContentLoaded', () => {
  const gifArea = document.querySelector('#under-construction-banner .under-construction-gifs');
  if (!gifArea) return;

  const fragment = document.createDocumentFragment();

  for (let index = 0; index < 7; index += 1) {
    const number = Math.floor(Math.random() * 26) + 1;
    const image = document.createElement('img');
    image.src = `/assets/images/under-construction/${String(number).padStart(2, '0')}.gif`;
    image.alt = '';
    fragment.append(image);
  }

  gifArea.replaceChildren(fragment);
});
