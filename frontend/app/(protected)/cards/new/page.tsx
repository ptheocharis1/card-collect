import { redirect } from "next/navigation";
import { getAccessToken } from "@/lib/auth";
import NewCardForm from "./new-card-form";

export default async function NewCardPage() {
  const token = await getAccessToken();

  if (!token) {
    redirect("/login");
  }

  return <NewCardForm />;
}