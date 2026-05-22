import React from "react";
import EditorContent from "@/components/editor/editor-content";
import { fetchUserProjects } from "@/lib/project-helpers";

export default async function EditorPage() {
  const { owned, shared } = await fetchUserProjects();

  return <EditorContent ownedProjects={owned} sharedProjects={shared} />;
}
