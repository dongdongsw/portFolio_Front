// WysiwygPostEditor.js
import React, { useEffect, useRef, useState } from "react";


export default function WysiwygPostEditor({
  onSubmit,
  placeholderTitle = "제목을 입력하세요",
  placeholderBody = "여기에 내용을 입력하고, 사진 버튼으로 이미지를 삽입하세요.",
  imageUpload, // async (file) => string (최종 URL) | 선택
}) {

 
  const [title, setTitle] = useState("");
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const savedSelectionRef = useRef(null);

  const [selectedImg, setSelectedImg] = useState(null);
  const [overlay, setOverlay] = useState({ top: 0, left: 0, w: 0, h: 0 });

  // 커스텀 컨텍스트 메뉴 상태
  const [ctx, setCtx] = useState({
    visible: false,
    x: 0,
    y: 0,
    targetImg: null,
  });
 
  useEffect(() => {
    const el = editorRef.current;
    if (el) el.setAttribute("data-placeholder", placeholderBody);
  }, [placeholderBody]);

  // 클릭/리사이즈/스크롤/ESC로 오버레이/컨텍스트 메뉴 갱신/닫기
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const onClick = (e) => {
      const img = e.target?.closest?.("img");
      if (img && editor.contains(img)) {
        selectImage(img);
      } else {
        clearSelection();
      }
      // 외부 클릭 시 컨텍스트 메뉴 닫기
      if (!(e.target instanceof Node && (e.target === editor || editor.contains(e.target)))) {
        setCtx({ visible: false, x: 0, y: 0, targetImg: null });
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
    };

    document.addEventListener("click", onClick);
    window.addEventListener("resize", onResizeOrScroll);
    window.addEventListener("scroll", onResizeOrScroll, true);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResizeOrScroll);
      window.removeEventListener("scroll", onResizeOrScroll, true);
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImg, ctx.visible]);

  const saveSelection = () => {
    const sel = window.getSelection?.();
    if (!sel || sel.rangeCount === 0) return;
    savedSelectionRef.current = sel.getRangeAt(0);
  };
  const restoreSelection = () => {
    const range = savedSelectionRef.current;
    if (!range) return;
    const sel = window.getSelection?.();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
  };

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
      const img = insertImageAtCursor(previewSrc); // 에디터 내부 보장

      // 기본 너비: 에디터 폭 80%
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
  };

  // selection이 에디터 내부인지
  const isSelectionInsideEditor = () => {
    const sel = window.getSelection?.();
    const editor = editorRef.current;
    if (!sel || sel.rangeCount === 0 || !editor) return false;
    const container = sel.getRangeAt(0).commonAncestorContainer;
    return editor.contains(container.nodeType === 1 ? container : container.parentNode);
  };

  const moveCaretToEditorEnd = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const sel = window.getSelection?.();
    if (!sel) return;

    if (editor.childNodes.length === 0) {
      editor.appendChild(document.createTextNode(""));
    }

    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  // 이미지 삽입 (항상 중앙 정렬)
  const insertImageAtCursor = (src) => {
    const editor = editorRef.current;
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.style.display = "block";
    img.style.margin = "8px auto"; // 중앙 정렬 핵심

    if (!editor) return img;

    const sel = window.getSelection?.();
    if (!sel || sel.rangeCount === 0 || !isSelectionInsideEditor()) {
      moveCaretToEditorEnd();
    }

    const sel2 = window.getSelection?.();
    if (!sel2 || sel2.rangeCount === 0) {
      editor.appendChild(img);
      placeCaretAfterNode(img);
      return img;
    }

    const range = sel2.getRangeAt(0);
    range.deleteContents();
    range.insertNode(img);

    const br = document.createElement("br");
    img.after(br);
    placeCaretAfterNode(br);
    return img;
  };

  const placeCaretAfterNode = (node) => {
    const sel = window.getSelection?.();
    if (!sel) return;
    const range = document.createRange();
    range.setStartAfter(node);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const selectImage = (imgEl) => {
    if (!(imgEl instanceof HTMLImageElement)) return;
    if (selectedImg && selectedImg !== imgEl) selectedImg.style.outline = "none";
    imgEl.style.outline = "2px solid rgba(59,130,246,.8)";
    setSelectedImg(imgEl);
    updateOverlayFromImg(imgEl);
  };

  const clearSelection = () => {
    if (selectedImg instanceof HTMLImageElement) {
      selectedImg.style.outline = "none";
    }
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

  // ========== 드래그 리사이즈 ==========
  const dragStateRef = useRef(null);

  const onHandleMouseDown = (e) => {
    e.preventDefault();
    if (!(selectedImg instanceof HTMLImageElement)) return;
    const startWidth = selectedImg.getBoundingClientRect().width;
    dragStateRef.current = { startX: e.clientX, startWidth };

    document.addEventListener("mousemove", onDragging);
    document.addEventListener("mouseup", onDragEnd);
  };

  const onDragging = (e) => {
    const st = dragStateRef.current;
    if (!st || !(selectedImg instanceof HTMLImageElement)) return;

    const dx = e.clientX - st.startX;
    let newW = Math.round(st.startWidth + dx);

    // 에디터 패딩 감안 최대 폭
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

  // ========== 컨텍스트 메뉴(우클릭) ==========
  const handleContextMenu = (e) => {
    const editor = editorRef.current;
    if (!editor) return;
    const img = e.target?.closest?.("img");
    if (img && editor.contains(img)) {
      e.preventDefault();
      selectImage(img);

      // 화면 밖으로 안 튀게 살짝 보정
      const padding = 8;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const menuW = 180;
      const menuH = 44;
      let x = e.clientX;
      let y = e.clientY;
      if (x + menuW + padding > vw) x = vw - menuW - padding;
      if (y + menuH + padding > vh) y = vh - menuH - padding;

      setCtx({ visible: true, x, y, targetImg: img });
    }
  };

  const handleDeleteImage = () => {
    if (ctx.targetImg) {
      ctx.targetImg.remove();
    }
    setCtx({ visible: false, x: 0, y: 0, targetImg: null });
    clearSelection();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const html = (editorRef.current?.innerHTML || "").trim();
    if (!title.trim() && !html) {
      alert("제목이나 내용을 입력해 주세요.");
      return;
    }
    onSubmit?.({ title: title.trim(), html });
  };

  return (


    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: 860, margin: "24px auto", display: "grid", gap: 12 }}
    >
      <input
        type="text"
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
          marginBottom: 60,
        }}
      />

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button type="button" onClick={handleClickPhoto} style={btnStyle} title="사진 삽입">
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

      {/* 에디터 래퍼(핸들 기준) */}
      <div style={{ position: "relative" }}>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={saveSelection}
          onKeyUp={saveSelection}
          onMouseUp={() => {
            saveSelection();
            if (selectedImg) updateOverlayFromImg();
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

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button type="submit" style={btnStyle}>
          등록
        </button>
      </div>

      {/* 커스텀 컨텍스트 메뉴 */}
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
        /* 이미지 기본 스타일: 항상 중앙 정렬 */
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 8px auto;
        }
      `}</style>
    </form>

  );
}

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
  background: "rgba(255, 255, 255, 0.4)", // ✅ 흰색+60% 불투명
};

const btnStyle = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #d1d5db",
  background: "#fff",
  cursor: "pointer",
  fontSize: 14,
};
