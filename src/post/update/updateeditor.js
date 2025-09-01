// portFolio_Front/src/post/update/updateeditor.js
import React, { useEffect, useRef, useState, useCallback } from "react";

const MAX_IMAGES = 5;

export default function UpdateEditor({
  initialTitle = "",
  initialHtml = "",
  placeholderTitle = "제목을 입력하세요",
  placeholderBody = "여기에 내용을 입력하고, 사진 버튼으로 이미지를 삽입하세요.",
  imageUpload,
  onTitleChange,
  onContentChange,
}) {
  const [title, setTitle] = useState(initialTitle);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const savedSelectionRef = useRef(null);

  const [selectedImg, setSelectedImg] = useState(null);
  const [overlay, setOverlay] = useState({ top: 0, left: 0, w: 0, h: 0 });

  const [ctx, setCtx] = useState({
    visible: false,
    x: 0,
    y: 0,
    targetImg: null,
  });

  const [boldActive, setBoldActive] = useState(false);

  // 부모로 HTML 전달
  const updateEditorContent = useCallback(() => {
    onContentChange?.((editorRef.current?.innerHTML || "").trim());
  }, [onContentChange]);

  // 초기 HTML 주입
  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = initialHtml || "";
  }, [initialHtml]);

  // placeholder
  useEffect(() => {
    editorRef.current?.setAttribute("data-placeholder", placeholderBody);
  }, [placeholderBody]);

  // 툴바 상태
  const updateToolbarState = useCallback(() => {
    try {
      setBoldActive(!!document.queryCommandState("bold"));
    } catch {
      setBoldActive(false);
    }
  }, []);

  // 에디터 내부 선택 여부
  const isSelectionInsideEditor = useCallback(() => {
    const sel = window.getSelection?.();
    const editor = editorRef.current;
    if (!sel || sel.rangeCount === 0 || !editor) return false;
    const container = sel.getRangeAt(0).commonAncestorContainer;
    return editor.contains(container.nodeType === 1 ? container : container.parentNode);
  }, []);

  // 현재 에디터 이미지 개수 (blob: + /images/)
  const countEditorImages = useCallback(() => {
    const ed = editorRef.current;
    if (!ed) return 0;
    return ed.querySelectorAll('img[src^="blob:"], img[src^="/images/"]').length;
  }, []);

  // 파일에서 이미지 + 중복 제거
  const filterAndDedupeImageFiles = (list) => {
    const seen = new Set();
    const out = [];
    for (const f of list) {
      if (!f || !f.type?.startsWith?.("image/")) continue;
      const sig = `${f.name}:${f.size}:${f.lastModified}`;
      if (seen.has(sig)) continue;
      seen.add(sig);
      out.push(f);
    }
    return out;
  };

  // selection 저장/복원
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

  // 리스너들
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const onSelectionChange = () => {
      if (isSelectionInsideEditor()) updateToolbarState();
      else setBoldActive(false);
    };

    const onClick = (e) => {
      const img = e.target?.closest?.("img");
      if (img && editor.contains(img)) {
        selectImage(img);
      } else {
        clearSelection();
      }
      if (!(e.target instanceof Node && (e.target === editor || editor.contains(e.target)))) {
        setCtx((p) => ({ ...p, visible: false }));
      }
    };

    const onResizeOrScroll = () => {
      updateOverlayFromImg();
      if (ctx.visible) setCtx((p) => ({ ...p, visible: false }));
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setCtx({ visible: false, x: 0, y: 0, targetImg: null });
        clearSelection();
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
  }, [ctx.visible, selectedImg, isSelectionInsideEditor, updateToolbarState]);

  // 명령
  const execCommand = useCallback(
    (cmd, value = null) => {
      document.execCommand(cmd, false, value);
      editorRef.current?.focus();
      updateEditorContent();
      updateToolbarState();
    },
    [updateEditorContent, updateToolbarState]
  );

  // 이미지 포함 선택이면 굵게 무시
  const selectionHasImage = () => {
    const sel = window.getSelection?.();
    if (!sel || sel.rangeCount === 0) return false;
    const range = sel.getRangeAt(0);
    const frag = range.cloneContents();
    return !!frag.querySelector?.("img");
  };

  const execBold = () => {
    if (!isSelectionInsideEditor()) return;
    if (selectionHasImage()) return;
    execCommand("bold");
  };

  // 폰트 크기
  const applyFontSizePx = useCallback(
    (px) => {
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
        updateEditorContent();
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

      updateEditorContent();
      updateToolbarState();
    },
    [isSelectionInsideEditor, restoreSelection, updateEditorContent, updateToolbarState]
  );

  // 사진 버튼: **누르기 직전 수정내용 반영**
  const handleClickPhoto = () => {
    saveSelection();
    updateEditorContent(); // ✅ 부모에 현재 내용 즉시 전달
    fileInputRef.current?.click();
  };

  // 파일 선택 처리: **최대 5장 제한 + 중복 제거**
  const handleFilesSelected = async (e) => {
    let files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    files = filterAndDedupeImageFiles(files);

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

      selectImage(img);

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
    updateEditorContent();
  };

  // 캐럿 이동
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

  // 이미지 삽입
  const isSelectionInside = () => isSelectionInsideEditor();

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

  // 이미지 선택/오버레이
  const selectImage = (imgEl) => {
    if (!(imgEl instanceof HTMLImageElement)) return;
    if (selectedImg && selectedImg !== imgEl) selectedImg.style.outline = "none";
    imgEl.style.outline = "2px solid rgba(59,130,246,.8)";
    setSelectedImg(imgEl);
    updateOverlayFromImg(imgEl);
  };
  const clearSelection = () => {
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

  // 드래그 리사이즈
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
      updateEditorContent(); // 리사이즈 후 동기화
    };

    document.addEventListener("mousemove", onDragging);
    document.addEventListener("mouseup", onDragEnd);
  };

  // 컨텍스트 메뉴 (삭제)
  const handleContextMenu = (e) => {
    const editor = editorRef.current;
    if (!editor) return;
    const img = e.target?.closest?.("img");
    if (img && editor.contains(img)) {
      e.preventDefault();
      selectImage(img);
      const padding = 8,
        vw = window.innerWidth,
        vh = window.innerHeight;
      const menuW = 180,
        menuH = 44;
      let x = e.clientX,
        y = e.clientY;
      if (x + menuW + padding > vw) x = vw - menuW - padding;
      if (y + menuH + padding > vh) y = vh - menuH - padding;
      setCtx({ visible: true, x, y, targetImg: img });
    }
  };
  const handleDeleteImage = () => {
    if (ctx.targetImg) ctx.targetImg.remove();
    setCtx({ visible: false, x: 0, y: 0, targetImg: null });
    clearSelection();
    updateEditorContent();
  };

  // 타이틀 변경
  const handleTitleInputChange = (e) => {
    setTitle(e.target.value);
    onTitleChange?.(e.target.value);
  };

  // 입력 변경
  const handleContentInput = () => {
    updateEditorContent();
  };

  // 스타일
  const editorStyle = {
    minHeight: 260,
    padding: 14,
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

  const commonBtnStyle = {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
    fontSize: 14,
  };

  const IconBtn = ({ children, onClick, title, active }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      aria-pressed={!!active}
      style={{
        ...commonBtnStyle,
        padding: "8px 10px",
        borderColor: active ? "#3b82f6" : "#d1d5db",
        background: active ? "rgba(59,130,246,0.08)" : "#fff",
        color: active ? "#3b82f6" : "inherit",
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
    <div style={{ maxWidth: 860, margin: "24px auto", display: "grid", gap: 12 }}>
      <input
        type="text"
        value={title}
        onChange={handleTitleInputChange}
        placeholder={placeholderTitle}
        style={{
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          fontSize: 18,
          background: "rgba(255,255,255,0.4)",
          marginTop: 50,
          marginBottom: 60,
        }}
      />

      {/* 툴바 */}
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
          style={commonBtnStyle}
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

      {/* 에디터 */}
      <div style={{ position: "relative" }}>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentInput}
          onKeyUp={() => {
            saveSelection();
            updateToolbarState();
          }}
          onMouseUp={() => {
            saveSelection();
            if (selectedImg) updateOverlayFromImg();
            updateToolbarState();
          }}
          onBlur={saveSelection}
          onContextMenu={handleContextMenu}
          style={editorStyle}
        />

        {/* 리사이즈 핸들 */}
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

      {/* 컨텍스트 메뉴 */}
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
        [contenteditable] *[style*="font-size: 12px"] { font-size: 12px !important; }
        [contenteditable] *[style*="font-size: 14px"] { font-size: 14px !important; }
        [contenteditable] *[style*="font-size: 16px"] { font-size: 16px !important; }
        [contenteditable] *[style*="font-size: 18px"] { font-size: 18px !important; }
        [contenteditable] *[style*="font-size: 20px"] { font-size: 20px !important; }
        [contenteditable] *[style*="font-size: 24px"] { font-size: 24px !important; }
        [contenteditable] *[style*="font-size: 28px"] { font-size: 28px !important; }
        [contenteditable] *[style*="font-size: 32px"] { font-size: 32px !important; }
        [contenteditable] b, [contenteditable] strong { font-weight: 800; }
      `}</style>
    </div>
  );
}
