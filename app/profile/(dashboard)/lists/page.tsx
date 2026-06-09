import type { Metadata } from "next";

import { ListsManager } from "@/components/profile/ListsManager";
import { requireAuth } from "@/lib/auth-guard";
import {
  getSavedListItems,
  getUserSavedLists,
  searchApprovedProducts,
} from "@/lib/db/lists";

export const metadata: Metadata = {
  title: "My lists",
  description: "Manage your saved product lists on Stier.",
};

export const dynamic = "force-dynamic";

export default async function ProfileListsPage() {
  await requireAuth("/profile/lists");

  const lists = await getUserSavedLists();
  const itemsEntries = await Promise.all(
    lists.map(async (list) => [list.id, await getSavedListItems(list.id)] as const),
  );
  const initialItemsByList = Object.fromEntries(itemsEntries);
  const initialProducts = await searchApprovedProducts("");

  return (
    <ListsManager
      initialLists={lists}
      initialItemsByList={initialItemsByList}
      initialProducts={initialProducts}
    />
  );
}
