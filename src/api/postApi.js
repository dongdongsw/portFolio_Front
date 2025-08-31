// src/api/postApi.js
import http from "./http";

// 목록
export async function fetchPosts() {
  const { data } = await http.get("/api/posts");
  return data;
}

// 상세
export async function fetchPost(id) {
  const { data } = await http.get(`/api/posts/detail/${id}`);
  return data;
}

// 작성: FormData/객체 모두 지원 (가장 단단한 방식)
export async function createPost(payload) {
  let fd;

  if (payload instanceof FormData) {
    // ✅ 이미 FormData면 그대로 사용
    fd = payload;
  } else {
    // ✅ 일반 객체면 여기서 안전하게 FormData로 변환
    const { loginid, nickname, title, content, files } = payload || {};
    fd = new FormData();
    fd.append("loginid",  loginid  ?? "");
    fd.append("nickname", nickname ?? "");
    fd.append("title",    title    ?? "");
    fd.append("content",  content  ?? "");
    (files ?? []).forEach(f => fd.append("files", f));
  }

  // ❗️중요: headers에 Content-Type 절대 지정하지 말 것 (axios가 자동으로 multipart boundary 셋업)
  const { data } = await http.post("/api/posts", fd);
  return data;
}

// 수정: FormData/객체 모두 지원
export async function updatePost(payload) {
  let fd;

  if (payload instanceof FormData) {
    fd = payload;
  } else {
    const { id, title, content, files } = payload || {};
    fd = new FormData();
    fd.append("title",   title   ?? "");
    fd.append("content", content ?? "");
    (files ?? []).forEach(f => fd.append("files", f));
    payload = { id }; // 아래 URL에서 사용할 id 보존
  }

  const id = payload instanceof FormData ? undefined : payload.id;
  if (!id) throw new Error("updatePost: id가 필요합니다.");

  const { data } = await http.put(`/api/posts/modify/${id}`, fd);
  return data;
}

// 삭제
export async function deletePost(id) {
  const { data } = await http.delete(`/api/posts/delete/${id}`);
  return data;
}
