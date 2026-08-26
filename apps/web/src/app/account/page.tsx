import type { Metadata } from "next";
import { auth } from "@/auth";
import { LoginPrompt } from "@/app/_components/login-prompt";
import { NicknameForm } from "./_nickname-form";

export const metadata: Metadata = {
  title: "アカウント設定",
  robots: { index: false },
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) {
    return <LoginPrompt message="アカウント設定を見るにはログインが必要です" />;
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">アカウント設定</h1>
      <div className="flex items-center gap-3">
        {session.user.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={session.user.image} alt="" className="w-12 h-12 rounded-full" referrerPolicy="no-referrer" />
        )}
        <p className="text-sm text-gray-500">{session.user.email}</p>
      </div>
      <NicknameForm currentName={session.user.name ?? ""} />
    </div>
  );
}
