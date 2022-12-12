import { DEFAULT_EXPIRES } from "./constants";
import db, { File } from "./db";

async function fetchJson(url: string) {
  const res = await fetch(url);
  const json = await res.json();
  if (res.status >= 300) {
    throw new Error(JSON.stringify(json));
  }
  return json;
}

async function updateCache(url: string) {
  const content = await fetchJson(url);
  const id = await db.files.add({
    content: JSON.stringify(content),
    updatedAt: Date.now(),
    url,
  });
  return db.files.get(id);
}

async function getCacheOrFetch(url: string, expires: number) {
  try {
    const file = await db.files.get({ url });
    if (file) {
      if (file.updatedAt + expires < Date.now()) {
        updateCache(url);
      }
      return file;
    }
  } catch (err) {
    // ignore
  }
  return await updateCache(url);
}

export const getJson = async (
  url: string,
  expires: number = DEFAULT_EXPIRES
) => {
  const file = await getCacheOrFetch(url, expires);
  if (file) {
    return JSON.parse(file.content);
  }
  return null;
};
