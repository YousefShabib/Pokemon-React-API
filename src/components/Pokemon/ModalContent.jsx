import React, { useEffect, useMemo, useState } from "react";

export default function ModalContent({ p }) {
  if (!p) return null;

  const imgs = useMemo(() => {
    const list = p?.images?.length ? p.images : (p?.image ? [p.image] : []);
    return (list || []).filter(Boolean);
  }, [p]);

  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(0); }, [p?.name]);

  const prev = () => {
    if (!imgs.length) return;
    setIdx(i => (i - 1 + imgs.length) % imgs.length);
  };

  const next = () => {
    if (!imgs.length) return;
    setIdx(i => (i + 1) % imgs.length);
  };

  return (
    <div className="dialog-content">
      <div className="dialog-left">
        <div className="carousel">
          {imgs.length > 1 && (
            <button className="prev" aria-label="Previous" onClick={prev}>
              &#10094;
            </button>
          )}

          {imgs.length ? (
            <img src={imgs[idx]} alt={`${p.name} sprite`} />
          ) : (
            <div className="img-fallback">No Image</div>
          )}

          {imgs.length > 1 && (
            <button className="next" aria-label="Next" onClick={next}>
              &#10095;
            </button>
          )}
        </div>
      </div>

      <div className="dialog-info">
        <h2 style={{ textTransform: "capitalize", marginTop: 0 }}>{p.name}</h2>
        <p><strong>Height:</strong> {p.height ?? "-"}</p>
        <p><strong>Weight:</strong> {p.weight ?? "-"}</p>
        <p><strong>Types:</strong> {p.types || "-"}</p>
      </div>
    </div>
  );
}
