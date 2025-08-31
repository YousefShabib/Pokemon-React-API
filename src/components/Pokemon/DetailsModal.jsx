import { useEffect, useRef, useState } from "react";

export default function DetailsModal({ open, onClose, p }) {
  const dialogRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const imgs = p?.images?.length ? p.images : (p?.image ? [p.image] : []);


  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onNativeClose = () => onClose();
    dialog.addEventListener("close", onNativeClose);

    if (open) {
      if (!dialog.open) dialog.showModal();
      setIdx(0);
    } else {
      if (dialog.open) dialog.close();
    }
    return () => dialog.removeEventListener("close", onNativeClose);
  }, [open, onClose, p?.name]);

  // يس يكبس برا الكارد يطلع
  const onBackdropClick = (e) => {
    const content = dialogRef.current?.querySelector(".dialog-content");
    if (content && !content.contains(e.target)) dialogRef.current?.close();
  };

  if (!p) return null;

  return (
    <dialog id="pokemonDialog" className="dialog" ref={dialogRef} onClick={onBackdropClick}>
      <div className="dialog-content">
        <div className="dialog-left">
          <div className="carousel">
            <button
              className="prev"
              aria-label="Previous"
              onClick={() => setIdx(i => (i - 1 + imgs.length) % imgs.length)}
            >
              &#10094;
            </button>
            {imgs.length ? (
              <img id="dialogImage" src={imgs[idx]} alt={`${p.name} sprite`} />
            ) : (
              <div className="img-fallback">No Image</div>
            )}
            <button
              className="next"
              aria-label="Next"
              onClick={() => setIdx(i => (i + 1) % imgs.length)}
            >
              &#10095;
            </button>
          </div>
        </div>

        <div className="dialog-info">
          <h2 id="dialogName">{p.name}</h2>
          <p><strong>Height:</strong> <span id="dialogHeight">{p.height ?? "-"}</span></p>
          <p><strong>Weight:</strong> <span id="dialogWeight">{p.weight ?? "-"}</span></p>
          <p><strong>Types:</strong> <span id="dialogTypes">{p.types || "-"}</span></p>
        </div>
      </div>
    </dialog>
  );
}
