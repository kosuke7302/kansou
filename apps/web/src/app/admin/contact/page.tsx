import { db } from "@/lib/db";
import { contactMessages } from "@kansou/db";
import { desc } from "drizzle-orm";
import { DeleteContactButton } from "./_delete-contact-button";

export default async function AdminContactPage() {
  const rows = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">お問い合わせ</h1>
        <p className="text-sm text-gray-500 mt-1">計{rows.length}件</p>
      </div>

      {rows.length === 0 ? (
        <p className="text-gray-400 text-sm py-12 text-center">お問い合わせはありません</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {rows.map((r) => (
            <div key={r.id} className="px-4 py-3 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-medium">{r.name}</span>
                  {r.email && (
                    <a href={`mailto:${r.email}`} className="text-xs text-indigo-500 hover:underline">
                      {r.email}
                    </a>
                  )}
                  <span className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleString("ja-JP")}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{r.body}</p>
              </div>
              <DeleteContactButton id={r.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
