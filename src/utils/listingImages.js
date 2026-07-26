/* Listing photo uploads → Firebase Storage.

   Files go to partnerListings/{uid}/{timestamp}_{name} — storage.rules only
   lets a partner write inside their own uid folder (images < 5 MB each).
   Upload happens at SUBMIT time, not on file-select, so abandoned forms leave
   no orphans. Local drafts still only remember file names (a File object
   can't live in localStorage) — re-attach photos when finishing a draft. */

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, storage } from "./firebaseClient";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/* Uploads File objects, returns their download URLs (order preserved).
   Throws with a readable message on the first failure. */
export async function uploadListingImages(files) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("You must be signed in to upload images.");

  const urls = [];
  for (const file of files) {
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error(`"${file.name}" is over 5 MB — please use a smaller image.`);
    }
    const safeName = file.name.replace(/[^\w.-]+/g, "_").slice(-80);
    const fileRef = ref(storage, `partnerListings/${uid}/${Date.now()}_${safeName}`);
    const snap = await uploadBytes(fileRef, file, { contentType: file.type });
    urls.push(await getDownloadURL(snap.ref));
  }
  return urls;
}
