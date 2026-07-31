import { DropZone } from "@/components/upload/DropZone";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            Personal Finance Dashboard
          </h1>
          <p className="text-lg text-slate-600">
            Не начинай бюджет заново. Загрузи свою таблицу и получи современную аналитику.
          </p>
        </div>
        
        <DropZone />
        
        <div className="text-center mt-8">
          <button className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors">
            Или попробуй с демо-данными →
          </button>
        </div>
      </div>
    </main>
  );
}