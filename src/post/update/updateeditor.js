// import React, { useEffect, useRef, useState } from "react";

// export default function UpdateEditor({
//   initialTitle = "",
//   initialHtml = "",
//   placeholderTitle = "제목을 입력하세요",
//   placeholderBody = "여기에 내용을 입력하고, 사진 버튼으로 이미지를 삽입하세요.",
//   imageUpload, // 이미지 업로드 핸들러
//   onTitleChange, // 부모의 title 상태를 업데이트하기 위한 콜백
//   onContentChange, // 부모의 content (HTML) 상태를 업데이트하기 위한 콜백
// }) {
 
//   const [title, setTitle] = useState(initialTitle); // 내부적으로 title 상태 관리
//   const editorRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const savedSelectionRef = useRef(null);

//   const [selectedImg, setSelectedImg] = useState(null);
//   const [overlay, setOverlay] = useState({ top: 0, left: 0, w: 0, h: 0 });

//   const [ctx, setCtx] = useState({
//     visible: false,
//     x: 0,
//     y: 0,
//     targetImg: null,
//   });
 
//   // 컴포넌트 마운트 시 initialHtml을 에디터에 설정 (contentEditable div)
//   // initialHtml 변경 시 업데이트되도록 종속성 배열에 initialHtml 추가
//   useEffect(() => {
//     const editor = editorRef.current;
//     if (editor) {
//       editor.innerHTML = initialHtml;
//     }
//   }, [initialHtml]); // <-- initialHtml 변경될 때 에디터 내용 업데이트

//   // 플레이스홀더 설정
//   useEffect(() => {
//     const el = editorRef.current;
//     if (el) el.setAttribute("data-placeholder", placeholderBody);
//   }, [placeholderBody]);

//   // 클릭/리사이즈/스크롤/ESC로 오버레이/컨텍스트 메뉴 갱신/닫기
//   useEffect(() => {
//     const editor = editorRef.current;
//     if (!editor) return;

//     const onClick = (e) => {
//       const img = e.target?.closest?.("img");
//       if (img && editor.contains(img)) {
//         selectImage(img);
//       } else {
//         clearSelection();
//       }
//       if (!(e.target instanceof Node && (e.target === editor || editor.contains(e.target)))) {
//         setCtx({ visible: false, x: 0, y: 0, targetImg: null });
//       }
//     };

//     const onResizeOrScroll = () => {
//       updateOverlayFromImg();
//       if (ctx.visible) setCtx((p) => ({ ...p, visible: false }));
//     };

//     const onKeyDown = (e) => {
//       if (e.key === "Escape") {
//         setCtx({ visible: false, x: 0, y: 0, targetImg: null });
//         clearSelection();
//       }
//     };

//     document.addEventListener("click", onClick);
//     window.addEventListener("resize", onResizeOrScroll);
//     window.addEventListener("scroll", onResizeOrScroll, true);
//     document.addEventListener("keydown", onKeyDown);

//     return () => {
//       document.removeEventListener("click", onClick);
//       window.removeEventListener("resize", onResizeOrScroll);
//       window.removeEventListener("scroll", onResizeOrScroll, true);
//       document.removeEventListener("keydown", onKeyDown);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedImg, ctx.visible]);

//   const saveSelection = () => {
//     const sel = window.getSelection?.();
//     if (!sel || sel.rangeCount === 0) return;
//     savedSelectionRef.current = sel.getRangeAt(0);
//   };
//   const restoreSelection = () => {
//     const range = savedSelectionRef.current;
//     if (!range) return;
//     const sel = window.getSelection?.();
//     if (!sel) return;
//     sel.removeAllRanges();
//     sel.addRange(range);
//   };

//   const handleClickPhoto = () => {
//     saveSelection();
//     fileInputRef.current?.click();
//   };

//   const handleFilesSelected = async (e) => {
//     const files = Array.from(e.target.files || []);
//     e.target.value = "";
//     if (!files.length) return;

//     editorRef.current?.focus();
//     restoreSelection();

//     for (const file of files) {
//       if (!file.type.startsWith("image/")) continue;

//       const previewSrc = URL.createObjectURL(file);
//       const img = insertImageAtCursor(previewSrc); // 에디터 내부 보장

//       const editorW = editorRef.current?.clientWidth || 800;
//       img.style.width = Math.round(Math.min(editorW * 0.8, 1200)) + "px";

//       selectImage(img);

//       if (imageUpload) {
//         try {
//           const finalUrl = await imageUpload(file);
//           if (img instanceof HTMLImageElement) img.src = finalUrl;
//         } catch (err) {
//           console.error(err);
//           alert("이미지 업로드에 실패했습니다.");
//         }
//       }
//     }
//   };

//   const isSelectionInsideEditor = () => {
//     const sel = window.getSelection?.();
//     const editor = editorRef.current;
//     if (!sel || sel.rangeCount === 0 || !editor) return false;
//     const container = sel.getRangeAt(0).commonAncestorContainer;
//     return editor.contains(container.nodeType === 1 ? container : container.parentNode);
//   };

//   const moveCaretToEditorEnd = () => {
//     const editor = editorRef.current;
//     if (!editor) return;
//     const sel = window.getSelection?.();
//     if (!sel) return;

//     if (editor.childNodes.length === 0) {
//       editor.appendChild(document.createTextNode(""));
//     }

//     const range = document.createRange();
//     range.selectNodeContents(editor);
//     range.collapse(false);
//     sel.removeAllRanges();
//     sel.addRange(range);
//   };

//   const insertImageAtCursor = (src) => {
//     const editor = editorRef.current;
//     const img = document.createElement("img");
//     img.src = src;
//     img.alt = "";
//     img.style.maxWidth = "100%";
//     img.style.height = "auto";
//     img.style.display = "block";
//     img.style.margin = "8px auto"; // 중앙 정렬 핵심

//     if (!editor) return img;

//     const sel = window.getSelection?.();
//     if (!sel || sel.rangeCount === 0 || !isSelectionInsideEditor()) {
//       moveCaretToEditorEnd();
//     }

//     const sel2 = window.getSelection?.();
//     if (!sel2 || sel2.rangeCount === 0) {
//       editor.appendChild(img);
//       placeCaretAfterNode(img);
//       return img;
//     }

//     const range = sel2.getRangeAt(0);
//     range.deleteContents();
//     range.insertNode(img);

//     const br = document.createElement("br");
//     img.after(br);
//     placeCaretAfterNode(br);
//     return img;
//   };

//   const placeCaretAfterNode = (node) => {
//     const sel = window.getSelection?.();
//     if (!sel) return;
//     const range = document.createRange();
//     range.setStartAfter(node);
//     range.collapse(true);
//     sel.removeAllRanges();
//     sel.addRange(range);
//   };

//   const selectImage = (imgEl) => {
//     if (!(imgEl instanceof HTMLImageElement)) return;
//     if (selectedImg && selectedImg !== imgEl) selectedImg.style.outline = "none";
//     imgEl.style.outline = "2px solid rgba(59,130,246,.8)";
//     setSelectedImg(imgEl);
//     updateOverlayFromImg(imgEl);
//   };

//   const clearSelection = () => {
//     if (selectedImg instanceof HTMLImageElement) {
//       selectedImg.style.outline = "none";
//     }
//     setSelectedImg(null);
//     setOverlay({ top: 0, left: 0, w: 0, h: 0 });
//   };

//   function updateOverlayFromImg(imgParam) {
//     const img = imgParam || selectedImg;
//     const editor = editorRef.current;
//     if (!(img instanceof HTMLElement) || !editor) return;

//     const imgRect = img.getBoundingClientRect();
//     const edRect = editor.getBoundingClientRect();
//     setOverlay({
//       top: imgRect.top - edRect.top + editor.scrollTop,
//       left: imgRect.left - edRect.left + editor.scrollLeft,
//       w: imgRect.width,
//       h: imgRect.height,
//     });
//   }

//   // ========== 드래그 리사이즈 ==========
//   const dragStateRef = useRef(null);

//   const onHandleMouseDown = (e) => {
//     e.preventDefault();
//     if (!(selectedImg instanceof HTMLImageElement)) return;
//     const startWidth = selectedImg.getBoundingClientRect().width;
//     dragStateRef.current = { startX: e.clientX, startWidth };

//     document.addEventListener("mousemove", onDragging);
//     document.addEventListener("mouseup", onDragEnd);
//   };

//   const onDragging = (e) => {
//     const st = dragStateRef.current;
//     if (!st || !(selectedImg instanceof HTMLImageElement)) return;

//     const dx = e.clientX - st.startX;
//     let newW = Math.round(st.startWidth + dx);

//     const editorMax = (editorRef.current?.clientWidth || 800) - 8;
//     newW = Math.max(80, Math.min(newW, 1200, editorMax));

//     selectedImg.style.width = newW + "px";
//     updateOverlayFromImg();
//   };

//   const onDragEnd = () => {
//     dragStateRef.current = null;
//     document.removeEventListener("mousemove", onDragging);
//     document.removeEventListener("mouseup", onDragEnd);
//   };

//   // ========== 컨텍스트 메뉴(우클릭) ==========
//   const handleContextMenu = (e) => {
//     const editor = editorRef.current;
//     if (!editor) return;
//     const img = e.target?.closest?.("img");
//     if (img && editor.contains(img)) {
//       e.preventDefault();
//       selectImage(img);

//       const padding = 8;
//       const vw = window.innerWidth;
//       const vh = window.innerHeight;
//       const menuW = 180;
//       const menuH = 44;
//       let x = e.clientX;
//       let y = e.clientY;
//       if (x + menuW + padding > vw) x = vw - menuW - padding;
//       if (y + menuH + padding > vh) y = vh - menuH - padding;

//       setCtx({ visible: true, x, y, targetImg: img });
//     }
//   };

//   const handleDeleteImage = () => {
//     if (ctx.targetImg) {
//       ctx.targetImg.remove();
//     }
//     setCtx({ visible: false, x: 0, y: 0, targetImg: null });
//     clearSelection();
//   };


//   // onTitleChange 콜백 (부모에게 title 변경 사항 알림)
//   const handleTitleInputChange = (e) => {
//     setTitle(e.target.value);
//     onTitleChange?.(e.target.value); // 부모에게 변경된 title 전달
//   };

//   // onContentChange 콜백 (부모에게 html 변경 사항 알림)
//   // onInput 이벤트 시 호출되며, 에디터의 현재 HTML 내용을 부모에게 전달
//   const handleContentInput = () => {
//     onContentChange?.(editorRef.current?.innerHTML || ""); // 부모에게 변경된 html 전달
//   };

//   // 스타일 정의
//   const editorStyle = {
//     minHeight: 260,
//     padding: 14,
//     borderRadius: 12,
//     border: "1px solid #e5e7eb",
//     fontSize: 16,
//     lineHeight: 1.6,
//     outline: "none",
//     whiteSpace: "pre-wrap",
//     wordBreak: "break-word",
//     overflow: "auto",
//     background: "rgba(255, 255, 255, 0.4)", // ✅ 흰색+60% 불투명
//   };
  
//   const commonBtnStyle = { 
//     padding: "10px 14px",
//     borderRadius: 12,
//     border: "1px solid #d1d5db",
//     background: "#fff",
//     cursor: "pointer",
//     fontSize: 14,
//   };


//   return (
//     <div style={{ maxWidth: 860, margin: "24px auto", display: "grid", gap: 12 }}>
//       <input
//         type="text"
//         value={title}
//         onChange={handleTitleInputChange}
//         placeholder={placeholderTitle}
//         style={{
//           padding: "12px 14px",
//           borderRadius: 12,
//           border: "1px solid #e5e7eb",
//           fontSize: 18,
//           background: "rgba(255,255,255,0.4)",
//           marginTop: 50,
//           marginBottom: 60,
//         }}
//       />

//       <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//         <button type="button" onClick={handleClickPhoto} style={commonBtnStyle} title="사진 삽입">
//           📷 사진
//         </button>
//         <input
//           ref={fileInputRef}
//           type="file"
//           accept="image/*"
//           multiple
//           style={{ display: "none" }}
//           onChange={handleFilesSelected}
//         />
//       </div>

//       {/* 에디터 래퍼(핸들 기준) */}
//       <div style={{ position: "relative" }}>
//         <div
//           ref={editorRef}
//           contentEditable
//           suppressContentEditableWarning
//           onInput={handleContentInput} 
//           onKeyUp={saveSelection}
//           onMouseUp={() => {
//             saveSelection();
//             if (selectedImg) updateOverlayFromImg();
//           }}
//           onBlur={saveSelection}
//           onContextMenu={handleContextMenu}
//           style={editorStyle}
//         />

//         {/* 리사이즈 핸들 */}
//         {selectedImg && (
//           <div
//             onMouseDown={onHandleMouseDown}
//             title="드래그하여 크기 조절"
//             style={{
//               position: "absolute",
//               top: overlay.top + overlay.h - 10,
//               left: overlay.left + overlay.w - 10,
//               width: 16,
//               height: 16,
//               borderRadius: 8,
//               background: "rgba(59,130,246,1)",
//               boxShadow: "0 0 0 2px #fff",
//               cursor: "nwse-resize",
//             }}
//           />
//         )}
//       </div>

//       {/* 커스텀 컨텍스트 메뉴 */}
//       {ctx.visible && (
//         <div
//           style={{
//             position: "fixed",
//             top: ctx.y,
//             left: ctx.x,
//             width: 180,
//             background: "#fff",
//             border: "1px solid #d1d5db",
//             borderRadius: 10,
//             boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
//             zIndex: 9999,
//             overflow: "hidden",
//           }}
//         >
//           <button
//             onClick={handleDeleteImage}
//             style={{
//               width: "100%",
//               padding: "10px 12px",
//               border: "none",
//               background: "transparent",
//               textAlign: "left",
//               cursor: "pointer",
//               fontSize: 14,
//             }}
//           >
//             🗑️ 이미지 삭제
//           </button>
//         </div>
//       )}

//       <style>{`
//         [contenteditable][data-placeholder]:empty:before {
//           content: attr(data-placeholder);
//           color: #9ca3af;
//         }
//         /* 이미지 기본 스타일: 항상 중앙 정렬 */
//         [contenteditable] img {
//           max-width: 100%;
//           height: auto;
//           display: block;
//           margin: 8px auto;
//         }
//       `}</style>
//     </div>
//   );
// }
// portFolio_Front\src\post\update\updateeditor.js
// portFolio_Front\src\post\update\updateeditor.js
// portFolio_Front\src\post\update\updateeditor.js
import React, { useEffect, useRef, useState, useCallback } from "react";


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

  const [boldActive, setBoldActive] = useState(false); // 굵게 상태
  
  // 에디터 내용이 변경될 때마다 부모에게 알림 (callback으로 최적화)
  const updateEditorContent = useCallback(() => {
    onContentChange?.(editorRef.current?.innerHTML || "");
  }, [onContentChange]);


  // 컴포넌트 마운트 시 initialHtml을 에디터에 설정 (contentEditable div)
  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      editor.innerHTML = initialHtml;
    }
  }, [initialHtml]);

  // 플레이스홀더 설정
  useEffect(() => {
    const el = editorRef.current;
    if (el) el.setAttribute("data-placeholder", placeholderBody);
  }, [placeholderBody]);

  // 툴바 상태 업데이트 함수 (선택 영역에 따라 굵게, 기울임꼴 등의 상태 변경)
  const updateToolbarState = useCallback(() => {
    if (!editorRef.current) return;
    try { 
      setBoldActive(!!document.queryCommandState("bold"));
    } catch (e) {
      // document.queryCommandState 예외 처리 (에디터 포커스 잃었을 때 등)
      setBoldActive(false); 
    }
  }, []);


  // 클릭/리사이즈/스크롤/ESC로 오버레이/컨텍스트 메뉴 갱신/닫기
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const onSelectionChange = () => {
        // 선택 영역이 에디터 내부일 때만 툴바 상태 업데이트
        if (isSelectionInsideEditor()) {
            updateToolbarState();
        } else {
            // 에디터 밖으로 선택 영역이 벗어나면 툴바 상태 초기화
            setBoldActive(false); 
        }
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
      // Ctrl/Cmd + B 단축키로 굵게 토글
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault(); // 기본 브라우저 동작 방지
        execBold(); // 직접 굵게 명령 실행
      }
    };

    document.addEventListener("selectionchange", onSelectionChange); // <-- 툴바 상태 업데이트 핵심 리스너
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
  }, [selectedImg, ctx.visible, updateToolbarState]); 


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

  const handleClickPhoto = () => {
    saveSelection(); // 현재 캐럿 위치 저장
    fileInputRef.current?.click(); // 숨겨진 파일 인풋 클릭
  };

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // 동일 파일 재선택 가능하게 인풋 클리어
    if (!files.length) return;

    editorRef.current?.focus(); // 에디터에 포커스
    restoreSelection(); // 저장된 선택 영역 복원 (이미지 삽입 위치)

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;

      const previewSrc = URL.createObjectURL(file);
      const img = insertImageAtCursor(previewSrc); 

      const editorW = editorRef.current?.clientWidth || 800; // 에디터 너비 기준
      img.style.width = Math.round(Math.min(editorW * 0.8, 1200)) + "px"; // 초기 이미지 너비 설정

      selectImage(img); // 삽입된 이미지 선택

      if (imageUpload) {
        try {
          const finalUrl = await imageUpload(file); // 실제 이미지 업로드 (부모 prop)
          if (img instanceof HTMLImageElement) img.src = finalUrl; // 최종 URL로 변경
        } catch (err) {
          console.error(err);
          alert("이미지 업로드에 실패했습니다.");
        }
      }
    }
    updateEditorContent(); // 이미지 삽입 후 content 변경 알림
  };

  const isSelectionInsideEditor = () => {
    const sel = window.getSelection?.();
    const editor = editorRef.current;
    if (!sel || sel.rangeCount === 0 || !editor) return false;
    const container = sel.getRangeAt(0).commonAncestorContainer;
    return editor.contains(container.nodeType === 1 ? container : container.parentNode);
  };
  
  // 캐럿을 에디터 끝으로 이동
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
    if (!sel || sel.rangeCount === 0 || !isSelectionInsideEditor()) {
      moveCaretToEditorEnd();
    }

    const sel2 = window.getSelection?.(); // 현재 선택영역 다시 가져옴
    if (!sel2 || sel2.rangeCount === 0) { // 선택 영역이 없으면 그냥 에디터 끝에 추가
      editor.appendChild(img);
      placeCaretAfterNode(img); // 이미지 뒤로 캐럿 이동
      selectImage(img); // 삽입된 이미지 선택
      return img;
    }

    const range = sel2.getRangeAt(0);
    range.deleteContents(); // 선택된 내용 삭제
    range.insertNode(img); // 그 자리에 이미지 삽입

    const br = document.createElement("br"); // 이미지 뒤에 <br> 삽입하여 줄바꿈
    img.after(br);
    placeCaretAfterNode(br); // <br> 뒤로 캐럿 이동
    selectImage(img); // 삽입된 이미지 선택
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
    saveSelection(); // 선택 영역 저장
  };

  const selectImage = (imgEl) => {
    if (!(imgEl instanceof HTMLImageElement)) return;
    if (selectedImg && selectedImg !== imgEl) selectedImg.style.outline = "none";
    imgEl.style.outline = "2px solid rgba(59,130,246,.8)";
    setSelectedImg(imgEl);
    updateOverlayFromImg(imgEl);
  };

  const clearSelection = () => { // 기존 clearImageSelection 이름 통일
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
    e.preventDefault(); // 기본 드래그 동작 방지
    if (!(selectedImg instanceof HTMLImageElement)) return;
    const startWidth = selectedImg.getBoundingClientRect().width;
    dragStateRef.current = { startX: e.clientX, startWidth };

    const onDragging = (ev) => { // 마우스 이동 시
      const st = dragStateRef.current;
      if (!st || !(selectedImg instanceof HTMLImageElement)) return;
      const dx = ev.clientX - st.startX; // 초기 위치로부터의 이동 거리
      let newW = Math.round(st.startWidth + dx); // 새로운 너비 계산
      const editorMax = (editorRef.current?.clientWidth || 800) - 8; // 에디터 최대 너비 (패딩 감안)
      newW = Math.max(80, Math.min(newW, 1200, editorMax)); // 최소, 최대, 에디터 폭 제한
      selectedImg.style.width = newW + "px"; // 너비 적용
      updateOverlayFromImg(); // 오버레이 위치 업데이트
    };

    const onDragEnd = () => { // 마우스 뗄 때
      dragStateRef.current = null;
      document.removeEventListener("mousemove", onDragging);
      document.removeEventListener("mouseup", onDragEnd);
      updateEditorContent(); // 리사이즈 후 content 변경 알림
    };

    document.addEventListener("mousemove", onDragging);
    document.addEventListener("mouseup", onDragEnd);
  };

  // ========== 컨텍스트 메뉴(우클릭) ==========
  const handleContextMenu = (e) => {
    const editor = editorRef.current;
    if (!editor) return;
    const img = e.target?.closest?.("img"); // 클릭된 요소가 이미지인지 확인
    if (img && editor.contains(img)) {
      e.preventDefault(); // 기본 컨텍스트 메뉴 방지
      selectImage(img); // 이미지 선택

      // 컨텍스트 메뉴가 화면 밖으로 나가지 않도록 위치 보정
      const padding = 8, vw = window.innerWidth, vh = window.innerHeight;
      const menuW = 180, menuH = 44; // 메뉴의 예상 너비/높이
      let x = e.clientX, y = e.clientY;
      if (x + menuW + padding > vw) x = vw - menuW - padding;
      if (y + menuH + padding > vh) y = vh - menuH - padding;
      setCtx({ visible: true, x, y, targetImg: img });
    }
  };

  const handleDeleteImage = () => {
    if (ctx.targetImg) ctx.targetImg.remove(); // 이미지 삭제
    setCtx({ visible: false, x: 0, y: 0, targetImg: null });
    clearSelection(); // 선택 해제
    updateEditorContent(); 
  };


  // onTitleChange 콜백 (부모에게 title 변경 사항 알림)
  const handleTitleInputChange = (e) => {
    setTitle(e.target.value);
    onTitleChange?.(e.target.value); // 부모에게 변경된 title 전달
  };

 // onContentChange 콜백 (부모에게 html 변경 사항 알림)
  // onInput 이벤트 시 호출되며, 에디터의 현재 HTML 내용을 부모에게 전달
  const handleContentInput = () => {
    onContentChange?.(editorRef.current?.innerHTML || ""); // 부모에게 변경된 html 전달
  };

  // 텍스트 포맷팅을 위한 execCommand 래퍼
  const execCommand = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus(); 
    updateEditorContent(); 
    updateToolbarState(); 
  }, [updateEditorContent, updateToolbarState]);

  // 굵게 버튼 핸들러
  const execBold = () => {
    execCommand("bold");
  };

  // 폰트 크기 적용 핸들러 (선택된 텍스트/요소에 폰트 크기 스타일 적용)
  const applyFontSizePx = useCallback((px) => { 
    restoreSelection(); 
    const sel = window.getSelection?.();
    if (!sel || sel.rangeCount === 0 || !isSelectionInsideEditor()) return; // 추가된 isSelectionInsideEditor 체크
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
  }, [updateEditorContent, updateToolbarState, isSelectionInsideEditor, restoreSelection]);


  // 스타일 정의
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
  
  const commonBtnStyle = { 
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
    fontSize: 14,
  };

  // 툴바 아이콘 컴포넌트들 (SVG 아이콘은 postEditor.js 파트4에서 가져왔습니다.)
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

      {/* 툴바 섹션 */}
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

      {/* 에디터 래퍼(핸들 기준) */}
      <div style={{ position: "relative" }}>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentInput}
          onKeyUp={() => { saveSelection(); updateToolbarState(); }}
          onMouseUp={() => { saveSelection(); if (selectedImg) updateOverlayFromImg(); updateToolbarState(); }}
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

      {/* 버튼: 취소 + 등록 (스타일 분리) */}
      {/* 이 섹션은 UpdateEditor 컴포넌트 외부에서 렌더링되도록 수정되었으므로, 여기서 제거합니다. */}
      {/* 
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button type="button" onClick={handleCancel} style={cancelBtnStyle}>취소</button>
        <button type="submit" style={submitBtnStyle}>등록</button>
      </div>
      */}

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
        /* 폰트 크기 조절을 위한 스타일 */
        /* applyFontSizePx는 style.fontSize로 직접 설정하므로, 여기서는 해당 스타일이
           인라인으로 적용되도록 하는 CSS만 있으면 됩니다. (혹은 !important 사용)
           예시: [contenteditable] *[style*="font-size: 12px"] { font-size: 12px !important; }
        */
        /* 폰트 크기 강제 (contentEditable에서 execCommand('fontSize')는 <font size="X"> 태그를 삽입하므로, 이를 CSS로 재정의하는 것) */
        /* 그러나 applyFontSizePx 함수가 직접 span.style.fontSize를 설정하므로, 여기서는 직접적인 매핑이 필요 없을 수 있습니다.
           단, 복사-붙여넣기 등으로 외부 콘텐츠가 유입될 경우를 대비해 일반적으로 정의하는 것이 좋습니다. */
        [contenteditable] *[style*="font-size"] { font-size: inherit; } /* 이 줄은 제거하고 아래 명시적 정의만 사용 */
        [contenteditable] *[style*="font-size: 12px"] { font-size: 12px !important; }
        [contenteditable] *[style*="font-size: 14px"] { font-size: 14px !important; }
        [contenteditable] *[style*="font-size: 16px"] { font-size: 16px !important; }
        [contenteditable] *[style*="font-size: 18px"] { font-size: 18px !important; }
        [contenteditable] *[style*="font-size: 20px"] { font-size: 20px !important; }
        [contenteditable] *[style*="font-size: 24px"] { font-size: 24px !important; }
        [contenteditable] *[style*="font-size: 28px"] { font-size: 28px !important; }
        [contenteditable] *[style*="font-size: 32px"] { font-size: 32px !important; }
        [contenteditable] b, [contenteditable] strong { font-weight: 800; } /* 굵게 스타일 */
      `}</style>
    </div>
  );
}