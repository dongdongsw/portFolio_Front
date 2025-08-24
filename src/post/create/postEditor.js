// WysiwygPostEditor.js
// align icons, bold stable, font-size unify, photo insert, image resize handle + context menu delete
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function WysiwygPostEditor({
  onSubmit,
  onCancel, // 선택: 부모 콜백
  placeholderTitle = "제목을 입력하세요",
  placeholderBody = "여기에 내용을 입력하고, 사진 버튼으로 이미지를 삽입하세요.",
  imageUpload, // optional async(file) => url
}) {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const editorRef = useRef(null);
  const savedSelectionRef = useRef(null);
  const fileInputRef = useRef(null);

  // toolbar state
  const [boldActive, setBoldActive] = useState(false);

  // image selection/overlay state
  const [selectedImg, setSelectedImg] = useState(null);
  const [overlay, setOverlay] = useState({ top: 0, left: 0, w: 0, h: 0 });

  // custom context menu for image
  const [ctx, setCtx] = useState({ visible: false, x: 0, y: 0, targetImg: null });

  useEffect(() => {
    editorRef.current?.setAttribute("data-placeholder", placeholderBody);
  }, [placeholderBody]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const onSelectionChange = () => {
      if (!isSelectionInsideEditor()) {
        setBoldActive(false);
        return;
      }
      try { setBoldActive(!!document.queryCommandState("bold")); } catch {}
    };

    const onClick = (e) => {
      const img = e.target?.closest?.("img");
      if (img && editor.contains(img)) {
        selectImage(img);
      } else {
        clearImageSelection();
      }
      if (ctx.visible) setCtx((p) => ({ ...p, visible: false }));
    };

    const onResizeOrScroll = () => {
      updateOverlayFromImg();
      if (ctx.visible) setCtx((p) => ({ ...p, visible: false }));
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setCtx({ visible: false, x: 0, y: 0, targetImg: null });
        clearImageSelection();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        execBold();
      }
    };

    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("click", onClick);
    window.addEventListener("resize", onResizeOrScroll);
    window.addEventListener("scroll", onResizeOrScroll, true);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
      document.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResizeOrScroll);
      window.removeEventListener("scroll", onResizeOrScroll, true);
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.visible, selectedImg]);

  // ---- selection helpers ----
  const saveSelection = () => {
    const sel = window.getSelection?.();
    if (sel && sel.rangeCount > 0) savedSelectionRef.current = sel.getRangeAt(0);
  };
  const restoreSelection = () => {
    const range = savedSelectionRef.current;
    if (!range) return;
    const sel = window.getSelection?.();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
  };
  const isSelectionInsideEditor = () => {
    const sel = window.getSelection?.();
    const editor = editorRef.current;
    if (!sel || sel.rangeCount === 0 || !editor) return false;
    const container = sel.getRangeAt(0).commonAncestorContainer;
    return editor.contains(container.nodeType === 1 ? container : container.parentNode);
  };

  // ---- commands ----
  const execCommand = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    try { setBoldActive(!!document.queryCommandState("bold")); } catch {}
  };
  const execBold = () => execCommand("bold");

  // ---- font size ----
  const applyFontSizePx = (px) => {
    restoreSelection();
    const sel = window.getSelection?.();
    if (!sel || sel.rangeCount === 0 || !isSelectionInsideEditor()) return;
    const range = sel.getRangeAt(0);

    if (range.collapsed) {
      const span = document.createElement("span");
      span.style.fontSize = `${px}px`;
      span.appendChild(document.createTextNode("\u200B"));
      range.insertNode(span);
      const r = document.createRange();
      r.setStart(span.firstChild, 1);
      r.collapse(true);
      sel.removeAllRanges();
      sel.addRange(r);
      return;
    }

    const frag = range.extractContents();

    const walkerEl = document.createTreeWalker(frag, NodeFilter.SHOW_ELEMENT, null);
    while (walkerEl.nextNode()) {
      const el = /** @type {HTMLElement} */ (walkerEl.currentNode);
      el.style.fontSize = "";
      if (el.tagName === "FONT" && el.hasAttribute("size")) el.removeAttribute("size");
    }

    const walkerText = document.createTreeWalker(frag, NodeFilter.SHOW_TEXT, null);
    const textNodes = [];
    while (walkerText.nextNode()) {
      const tn = walkerText.currentNode;
      if (/\S/.test(tn.nodeValue || "")) textNodes.push(tn);
    }
    textNodes.forEach((tn) => {
      const span = document.createElement("span");
      span.style.fontSize = `${px}px`;
      tn.parentNode.insertBefore(span, tn);
      span.appendChild(tn);
    });

    range.insertNode(frag);

    const after = document.createRange();
    after.setStartAfter(range.endContainer);
    after.collapse(true);
    sel.removeAllRanges();
    sel.addRange(after);
  };

  // ---- image insert ----
  const handleClickPhoto = () => {
    saveSelection();
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    editorRef.current?.focus();
    restoreSelection();

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;

      const previewSrc = URL.createObjectURL(file);
      const img = insertImageAtCursor(previewSrc);

      const editorW = editorRef.current?.clientWidth || 800;
      img.style.width = Math.round(Math.min(editorW * 0.8, 1200)) + "px";

      if (imageUpload) {
        try {
          const finalUrl = await imageUpload(file);
          if (img instanceof HTMLImageElement) img.src = finalUrl;
        } catch (err) {
          console.error(err);
          alert("이미지 업로드에 실패했습니다.");
        }
      }
    }
  };

  const moveCaretToEditorEnd = () => {
    const editor = editorRef.current;
    const sel = window.getSelection?.();
    if (!editor || !sel) return;
    if (editor.childNodes.length === 0) editor.appendChild(document.createTextNode(""));
    const r = document.createRange();
    r.selectNodeContents(editor);
    r.collapse(false);
    sel.removeAllRanges();
    sel.addRange(r);
  };

  const isSelectionInside = () => {
    const sel = window.getSelection?.();
    const editor = editorRef.current;
    if (!sel || sel.rangeCount === 0 || !editor) return false;
    const container = sel.getRangeAt(0).commonAncestorContainer;
    return editor.contains(container.nodeType === 1 ? container : container.parentNode);
  };

  const insertImageAtCursor = (src) => {
    const editor = editorRef.current;
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.style.display = "block";
    img.style.margin = "8px auto";

    if (!editor) return img;

    const sel = window.getSelection?.();
    if (!sel || sel.rangeCount === 0 || !isSelectionInside()) {
      moveCaretToEditorEnd();
    }

    const sel2 = window.getSelection?.();
    if (!sel2 || sel2.rangeCount === 0) {
      editor.appendChild(img);
      placeCaretAfterNode(img);
      selectImage(img);
      return img;
    }

    const range = sel2.getRangeAt(0);
    range.deleteContents();
    range.insertNode(img);

    const br = document.createElement("br");
    img.after(br);
    placeCaretAfterNode(br);
    selectImage(img);
    return img;
  };

  const placeCaretAfterNode = (node) => {
    const sel = window.getSelection?.();
    if (!sel) return;
    const r = document.createRange();
    r.setStartAfter(node);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);
    saveSelection();
  };

  // ---- image selection & overlay ----
  const selectImage = (imgEl) => {
    if (!(imgEl instanceof HTMLImageElement)) return;
    if (selectedImg && selectedImg !== imgEl) selectedImg.style.outline = "none";
    imgEl.style.outline = "2px solid rgba(59,130,246,.8)";
    setSelectedImg(imgEl);
    updateOverlayFromImg(imgEl);
  };
  const clearImageSelection = () => {
    if (selectedImg instanceof HTMLImageElement) selectedImg.style.outline = "none";
    setSelectedImg(null);
    setOverlay({ top: 0, left: 0, w: 0, h: 0 });
  };
  function updateOverlayFromImg(imgParam) {
    const img = imgParam || selectedImg;
    const editor = editorRef.current;
    if (!(img instanceof HTMLElement) || !editor) return;
    const imgRect = img.getBoundingClientRect();
    const edRect = editor.getBoundingClientRect();
    setOverlay({
      top: imgRect.top - edRect.top + editor.scrollTop,
      left: imgRect.left - edRect.left + editor.scrollLeft,
      w: imgRect.width,
      h: imgRect.height,
    });
  }

  // ---- image resize handle ----
  const dragStateRef = useRef(null);
  const onHandleMouseDown = (e) => {
    e.preventDefault();
    if (!(selectedImg instanceof HTMLImageElement)) return;
    const startWidth = selectedImg.getBoundingClientRect().width;
    dragStateRef.current = { startX: e.clientX, startWidth };

    const onDragging = (ev) => {
      const st = dragStateRef.current;
      if (!st || !(selectedImg instanceof HTMLImageElement)) return;
      const dx = ev.clientX - st.startX;
      let newW = Math.round(st.startWidth + dx);
      const editorMax = (editorRef.current?.clientWidth || 800) - 8;
      newW = Math.max(80, Math.min(newW, 1200, editorMax));
      selectedImg.style.width = newW + "px";
      updateOverlayFromImg();
    };
    const onDragEnd = () => {
      dragStateRef.current = null;
      document.removeEventListener("mousemove", onDragging);
      document.removeEventListener("mouseup", onDragEnd);
    };

    document.addEventListener("mousemove", onDragging);
    document.addEventListener("mouseup", onDragEnd);
  };

  // ---- image context menu (delete) ----
  const handleContextMenu = (e) => {
    const editor = editorRef.current;
    if (!editor) return;
    const img = e.target?.closest?.("img");
    if (img && editor.contains(img)) {
      e.preventDefault();
      selectImage(img);
      const padding = 8, vw = window.innerWidth, vh = window.innerHeight;
      const menuW = 180, menuH = 44;
      let x = e.clientX, y = e.clientY;
      if (x + menuW + padding > vw) x = vw - menuW - padding;
      if (y + menuH + padding > vh) y = vh - menuH - padding;
      setCtx({ visible: true, x, y, targetImg: img });
    }
  };
  const handleDeleteImage = () => {
    if (ctx.targetImg) ctx.targetImg.remove();
    setCtx({ visible: false, x: 0, y: 0, targetImg: null });
    clearImageSelection();
  };

  // ---- 취소/등록 라우팅 ----
  const handleCancel = () => {
    const ok = window.confirm("글 작성을 정말 취소하시겠습니까?");
    if (!ok) return;
    if (typeof onCancel === "function") onCancel();
    navigate("/postlist"); // 취소 → 목록
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const html = (editorRef.current?.innerHTML || "").trim();
    onSubmit?.({ title: title.trim(), html });
    navigate("/postlist/postdetail"); // 등록 → 상세 (라우트에 맞게 수정)
  };

  // ---- UI helpers ----
  const IconBtn = ({ title, onClick, active, children }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      aria-pressed={!!active}
      style={{
        ...btnStyle,
        padding: "8px 10px",
        borderColor: active ? "#3b82f6" : "#d1d5db",
        background: active ? "rgba(59,130,246,0.08)" : "#fff",
        lineHeight: 0,
      }}
    >
      {children}
    </button>
  );

  const AlignLeftIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M3 6h14v2H3zM3 11h10v2H3zM3 16h14v2H3z" />
    </svg>
  );
  const AlignCenterIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M4 6h16v2H4zM7 11h10v2H7zM7 16h10v2H7z" />
    </svg>
  );
  const AlignRightIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M7 6h14v2H7zM10 11h11v2H10zM7 16h14v2H7z" />
    </svg>
  );

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 860, margin: "24px auto", display: "grid", gap: 12 }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={placeholderTitle}
        style={{
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          fontSize: 18,
          background: "rgba(255,255,255,0.4)",
          marginTop: 50,
          marginBottom: 40,
        }}
      />

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <IconBtn title="왼쪽 정렬" onClick={() => execCommand("justifyLeft")}>{AlignLeftIcon}</IconBtn>
        <IconBtn title="가운데 정렬" onClick={() => execCommand("justifyCenter")}>{AlignCenterIcon}</IconBtn>
        <IconBtn title="오른쪽 정렬" onClick={() => execCommand("justifyRight")}>{AlignRightIcon}</IconBtn>

        <div style={{ width: 1, height: 22, background: "#e5e7eb" }} />

        <IconBtn title="굵게 (드래그/커서 모두)" onClick={execBold} active={boldActive}>
          <span style={{ fontSize: 16, fontWeight: 800, lineHeight: 1, display: "inline-block" }}>가</span>
        </IconBtn>

        <label style={{ fontSize: 13, color: "#4b5563" }}>크기</label>
        <select
          onMouseDown={saveSelection}
          onChange={(e) => applyFontSizePx(Number(e.target.value))}
          defaultValue="16"
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid #d1d5db",
            background: "#fff",
            fontSize: 14,
          }}
        >
          {[12, 14, 16, 18, 20, 24, 28, 32].map((n) => (
            <option key={n} value={n}>{n}px</option>
          ))}
        </select>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleClickPhoto}
          style={btnStyle}
          title="사진 삽입"
        >
          📷 사진
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={handleFilesSelected}
        />
      </div>

      {/* Editor wrapper (for resize handle positioning) */}
      <div style={{ position: "relative" }}>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={saveSelection}
          onMouseUp={() => { saveSelection(); if (selectedImg) updateOverlayFromImg(); }}
          onContextMenu={handleContextMenu}
          style={editorStyle}
        />

        {/* Image resize handle */}
        {selectedImg && (
          <div
            onMouseDown={onHandleMouseDown}
            title="드래그하여 크기 조절"
            style={{
              position: "absolute",
              top: overlay.top + overlay.h - 10,
              left: overlay.left + overlay.w - 10,
              width: 16,
              height: 16,
              borderRadius: 8,
              background: "rgba(59,130,246,1)",
              boxShadow: "0 0 0 2px #fff",
              cursor: "nwse-resize",
            }}
          />
        )}
      </div>

      {/* Buttons: 취소 + 등록 (스타일 분리) */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button type="button" onClick={handleCancel} style={cancelBtnStyle}>취소</button>
        <button type="submit" style={submitBtnStyle}>등록</button>
      </div>

      {/* Image context menu */}
      {ctx.visible && (
        <div
          style={{
            position: "fixed",
            top: ctx.y,
            left: ctx.x,
            width: 180,
            background: "#fff",
            border: "1px solid #d1d5db",
            borderRadius: 10,
            boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
            zIndex: 9999,
            overflow: "hidden",
          }}
        >
          <button
            onClick={handleDeleteImage}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "none",
              background: "transparent",
              textAlign: "left",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            🗑️ 이미지 삭제
          </button>
        </div>
      )}

      <style>{`
        [contenteditable][data-placeholder]:empty:before { content: attr(data-placeholder); color: #9ca3af; }
        [contenteditable] img { max-width: 100%; height: auto; display: block; margin: 8px auto; }
        [contenteditable] b, [contenteditable] strong { font-weight: 800; }
      `}</style>
    </form>
  );
}

// 공통 툴바/기본 버튼 스타일
const btnStyle = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #d1d5db",
  background: "#fff",
  cursor: "pointer",
  fontSize: 14,
};

// 에디터 영역 스타일
const editorStyle = {
  minHeight: 260,
  padding: 14,
  marginBottom: 40,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  fontSize: 16,
  lineHeight: 1.6,
  outline: "none",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  overflow: "auto",
  background: "rgba(255, 255, 255, 0.4)",
};

// ✅ 취소 / 등록 버튼 전용 스타일 (다른 버튼과 다르게)
const cancelBtnStyle = {
  ...btnStyle,
  
  background: "#f3f4f6", // 연한 회색
  color: "#374151",
  borderColor: "#e5e7eb",
};

const submitBtnStyle = {
  ...btnStyle,
  background: "#c7c8cc",
  color: "#374151",
  border: "none",
  boxShadow: "0 2px 6px rgba(59,130,246,0.35)",
};
