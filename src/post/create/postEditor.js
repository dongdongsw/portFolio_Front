// src/post/post_create/postEditor.jsx  (WysiwygPostEditor.js)
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGlobalStyle } from "styled-components";

const EditorGlobalStyle = createGlobalStyle`
  .we-container {
    max-width: 860px;
    margin: 24px auto;
    display: grid;
    gap: 12px;
  }

  .we-title {
    padding: 12px 14px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    font-size: 18px;
    background: rgba(255,255,255,0.4);
    margin-top: 50px;
    margin-bottom: 40px;
  }

  .we-toolbar {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }

  .we-btn {
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px solid #d1d5db;
    background: #fff;
    cursor: pointer;
    font-size: 14px;
    line-height: 0;
    height: 40px;
  }
  .we-btn--active {
    border-color: #3b82f6;
    background: rgba(59,130,246,0.08);
  }

  .we-divider {
    width: 1px;
    height: 22px;
    background: #e5e7eb;
  }

  .we-select {
    padding: 8px 10px;
    border-radius: 10px;
    border: 1px solid #d1d5db;
    background: #fff;
    font-size: 14px;
  }

  .we-editor-wrap { position: relative; }

  .we-editor {
    min-height: 260px;
    padding: 14px;
    margin-bottom: 40px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    font-size: 16px;
    line-height: 1.6;
    outline: none;
    white-space: pre-wrap;
    word-break: break-word;
    overflow: auto;
    background: rgba(255, 255, 255, 0.4);
  }

  [contenteditable][data-placeholder]:empty:before {
    content: attr(data-placeholder);
    color: #9ca3af;
  }
  [contenteditable] img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 8px auto;
    outline: none;
  }
  [contenteditable] b, [contenteditable] strong { font-weight: 800; }

  .we-handle {
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 8px;
    background: rgba(59,130,246,1);
    box-shadow: 0 0 0 2px #fff;
    cursor: nwse-resize;
  }

  .we-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  .we-btn--cancel {
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    background: #f3f4f6;
    color: #374151;
    cursor: pointer;
    font-size: 14px;
  }
  .we-btn--submit {
    padding: 10px 14px;
    border-radius: 12px;
    border: none;
    background: #c7c8cc;
    color: #374151;
    cursor: pointer;
    font-size: 14px;
    box-shadow: 0 2px 6px rgba(59,130,246,0.35);
  }

  .we-menu {
    position: fixed;
    width: 180px;
    background: #fff;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    z-index: 9999;
    overflow: hidden;
  }
  .we-menu button {
    width: 100%;
    padding: 10px 12px;
    border: none;
    background: transparent;
    text-align: left;
    cursor: pointer;
    font-size: 14px;
  }
`;

const MAX_IMAGES = 5;

export default function WysiwygPostEditor({
  onSubmit,
  onCancel,
  onTitleChange,
  onContentChange,
  placeholderTitle = "제목을 입력하세요",
  placeholderBody = "여기에 내용을 입력하고, 사진 버튼으로 이미지를 삽입하세요.",
  imageUpload, // optional async(file) => url
}) {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const editorRef = useRef(null);
  const savedSelectionRef = useRef(null);
  const fileInputRef = useRef(null);

  const [boldActive, setBoldActive] = useState(false);

  const [selectedImg, setSelectedImg] = useState(null);
  const [overlay, setOverlay] = useState({ top: 0, left: 0, w: 0, h: 0 });

  const [ctx, setCtx] = useState({ visible: false, x: 0, y: 0, targetImg: null });

  useEffect(() => {
    editorRef.current?.setAttribute("data-placeholder", placeholderBody);
  }, [placeholderBody]);

  useEffect(() => { onTitleChange?.(title); }, [title, onTitleChange]);

  const notifyContentChange = () => {
    const html = (editorRef.current?.innerHTML || "").trim();
    onContentChange?.(html);
  };

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

  // 이미지 개수 세기 (blob: + /images/ 만 카운트)
  const countEditorImages = () => {
    const editor = editorRef.current;
    if (!editor) return 0;
    return editor.querySelectorAll('img[src^="blob:"], img[src^="/images/"]').length;
  };

  // 파일 리스트에서 이미지 + 중복 제거
  const filterAndDedupeImageFiles = (fileList) => {
    const seen = new Set();
    const out = [];
    for (const f of fileList) {
      if (!f || !f.type?.startsWith?.("image/")) continue;
      const sig = `${f.name}:${f.size}:${f.lastModified}`;
      if (seen.has(sig)) continue;
      seen.add(sig);
      out.push(f);
    }
    return out;
  };

  // ---- commands ----
  const selectionHasImage = () => {
    const sel = window.getSelection?.();
    if (!sel || sel.rangeCount === 0) return false;
    const range = sel.getRangeAt(0);
    const frag = range.cloneContents();
    return !!frag.querySelector?.("img");
  };

  const execCommand = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    try { setBoldActive(!!document.queryCommandState("bold")); } catch {}
  };

  // 이미지 선택 영역이면 Bold 방지
  const execBold = () => {
    if (!isSelectionInsideEditor()) return;
    if (selectionHasImage()) return;
    execCommand("bold");
  };

  // ---- font size ----
  const applyFontSizePx = (px) => {
    restoreSelection();
    const sel = window.getSelection?.();
    if (!sel || sel.rangeCount === 0 || !isSelectionInsideEditor()) return;
    const range = sel.getRangeAt(0);

    // 이미지 단독 선택 시 크기 변경 X
    const fragCheck = range.cloneContents();
    if (fragCheck.querySelector?.("img") && (fragCheck.textContent?.trim() ?? "") === "") {
      return;
    }

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
    // ✅ 파일 선택창 열기 전 현재 수정사항 부모에 반영
    saveSelection();
    notifyContentChange();
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (e) => {
    const raw = Array.from(e.target.files || []);
    e.target.value = "";
    if (!raw.length) return;

    // 이미지 + 중복 제거
    let files = filterAndDedupeImageFiles(raw);
    if (!files.length) return;

    // 현재 이미지 수 확인
    const current = countEditorImages();
    if (current >= MAX_IMAGES) {
      alert("이미지는 최대 5장 삽입 가능합니다. 현재 5장입니다.");
      return;
    }

    const available = MAX_IMAGES - current;
    if (files.length > available) {
      alert(`이미지는 최대 5장 삽입 가능합니다.\n현재 ${current}장, 선택 ${files.length}장 → ${available}장만 추가됩니다.`);
      files = files.slice(0, available);
    }

    editorRef.current?.focus();
    restoreSelection();

    for (const file of files) {
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
      notifyContentChange();
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
      notifyContentChange();
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
    notifyContentChange();
  };

  // ---- 취소/등록 ----
  const handleCancel = () => {
    const ok = window.confirm("글 작성을 정말 취소하시겠습니까?");
    if (!ok) return;
    onCancel?.();
    navigate("/postlist");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const html = (editorRef.current?.innerHTML || "").trim();
    const titleVal = title.trim();
    console.log("[EDITOR SUBMIT]", { titleVal, html });
    onSubmit?.({ title: titleVal, html });
  };

  const IconBtn = ({ title, onClick, active, children }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      aria-pressed={!!active}
      className={`we-btn ${active ? 'we-btn--active' : ''}`}
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
    <>
      <EditorGlobalStyle />
      <form onSubmit={handleSubmit} className="we-container">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={placeholderTitle}
          className="we-title"
        />

        {/* Toolbar */}
        <div className="we-toolbar">
          <IconBtn title="왼쪽 정렬" onClick={() => execCommand("justifyLeft")}>{AlignLeftIcon}</IconBtn>
          <IconBtn title="가운데 정렬" onClick={() => execCommand("justifyCenter")}>{AlignCenterIcon}</IconBtn>
          <IconBtn title="오른쪽 정렬" onClick={() => execCommand("justifyRight")}>{AlignRightIcon}</IconBtn>

          <div className="we-divider" />

          <IconBtn title="굵게 (드래그/커서 모두)" onClick={execBold} active={boldActive}>
            <span style={{ fontSize: 16, fontWeight: 800, lineHeight: 1, display: "inline-block" }}>가</span>
          </IconBtn>

          <label style={{ fontSize: 13, color: "#4b5563" }}>크기</label>
          <select
            onMouseDown={saveSelection}
            onChange={(e) => applyFontSizePx(Number(e.target.value))}
            defaultValue="16"
            className="we-select"
          >
            {[12, 14, 16, 18, 20, 24, 28, 32].map((n) => (
              <option key={n} value={n}>{n}px</option>
            ))}
          </select>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClickPhoto}
            className="we-btn"
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

        {/* Editor wrapper */}
        <div className="we-editor-wrap">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={() => { saveSelection(); notifyContentChange(); }}
            onMouseUp={() => { saveSelection(); if (selectedImg) updateOverlayFromImg(); }}
            onContextMenu={handleContextMenu}
            className="we-editor"
          />

          {/* Image resize handle */}
          {selectedImg && (
            <div
              className="we-handle"
              onMouseDown={onHandleMouseDown}
              title="드래그하여 크기 조절"
              style={{
                top: overlay.top + overlay.h - 10,
                left: overlay.left + overlay.w - 10,
              }}
            />
          )}
        </div>

        {/* Buttons */}
        <div className="we-actions">
          <button type="button" onClick={handleCancel} className="we-btn--cancel">취소</button>
          <button type="submit" className="we-btn--submit">등록</button>
        </div>

        {/* Image context menu */}
        {ctx.visible && (
          <div className="we-menu" style={{ top: ctx.y, left: ctx.x }}>
            <button onClick={handleDeleteImage}>🗑️ 이미지 삭제</button>
          </div>
        )}
      </form>
    </>
  );
}
