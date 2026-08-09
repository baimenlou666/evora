(() => {
  const alphabet = "01ABCDEF";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function randomString(length) {
    return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("\n");
  }

  document.querySelectorAll(".robot-data-stream").forEach((stream, streamIndex) => {
    const fragment = document.createDocumentFragment();
    const columnCount = reducedMotion ? 5 : 11;

    for (let index = 0; index < columnCount; index += 1) {
      const column = document.createElement("span");
      column.className = "robot-data-column";
      column.textContent = randomString(7 + Math.floor(Math.random() * 9));
      column.style.setProperty("--x", `${5 + Math.random() * 88}%`);
      column.style.setProperty("--size", `${0.62 + Math.random() * 0.38}rem`);
      column.style.setProperty("--alpha", `${0.35 + Math.random() * 0.5}`);
      column.style.setProperty("--duration", `${10 + Math.random() * 11}s`);
      column.style.setProperty("--delay", `${-Math.random() * 18 - streamIndex * 0.4}s`);
      fragment.appendChild(column);
    }

    stream.appendChild(fragment);
  });
})();
