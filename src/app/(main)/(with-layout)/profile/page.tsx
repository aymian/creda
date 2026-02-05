import React from "react";
import { GetStaticProps, GetStaticPaths } from "next";
import { db } from "../src/firebase/initFirestore"; // adjust path to your initFirestore
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

type Props = {
  user: { id: string; username: string; displayName?: string } | null;
};

// Defensive username validator — allow letters, numbers, underscores, dashes, dots
function isValidUsername(username: string) {
  return /^[A-Za-z0-9_.-]+$/.test(username);
}

export default function ProfilePage({ user }: Props) {
  if (!user) {
    // This should not happen if we return notFound() in getStaticProps,
    // but keep a client-side guard.
    return <div>User not found</div>;
  }

  return (
    <div>
      <h1>{user.displayName ?? user.username}</h1>
      <p>@{user.username}</p>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Keep this empty (or return a small set of popular users).
  // Use fallback: 'blocking' so pages are generated on demand instead of 404.
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const raw = context.params?.username;
  if (!raw || Array.isArray(raw)) {
    return { notFound: true, revalidate: 60 };
  }

  const username = decodeURIComponent(raw as string);

  if (!isValidUsername(username)) {
    // don't strip underscores — if you intentionally sanitize usernames elsewhere,
    // update that validation instead of rejecting here
    return { notFound: true, revalidate: 60 };
  }

  // Two common patterns — try both so either doc-id or username-field works.

  // 1) Try doc by id (if you store users with username as doc ID)
  try {
    const docRef = doc(db, "users", username);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        props: { user: { id: docSnap.id, username: data.username ?? username, displayName: data.displayName ?? "" } },
        revalidate: 60,
      };
    }
  } catch (err) {
    // fall through to field query
  }

  // 2) Query by username field (if username is a field on user documents)
  const usersCol = collection(db, "users");
  const q = query(usersCol, where("username", "==", username));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const docSnap = snap.docs[0];
    const data = docSnap.data();
    return {
      props: { user: { id: docSnap.id, username: data.username, displayName: data.displayName ?? "" } },
      revalidate: 60,
    };
  }

  // Not found
  return { notFound: true, revalidate: 60 };
};
