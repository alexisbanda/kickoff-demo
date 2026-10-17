import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 px-6 py-16 text-center dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col items-center gap-6">
        <h1 className="text-5xl font-bold leading-tight text-zinc-900 sm:text-6xl dark:text-zinc-50">
          Turnos
        </h1>
        <p className="text-3xl font-semibold text-zinc-800 sm:text-4xl dark:text-zinc-200">
          Club Deportivo La Ribera
        </p>
        <p className="max-w-xl text-2xl leading-relaxed text-zinc-700 sm:text-3xl dark:text-zinc-300">
          Reserva tu pista de pádel desde el móvil, sin WhatsApp ni libreta.
        </p>
        <Link
          href="/disponibilidad"
          className="w-full max-w-sm rounded-xl bg-blue-700 px-8 py-5 text-2xl font-bold text-white shadow-md sm:text-3xl"
        >
          Ver pistas libres
        </Link>
        <p className="text-xl text-zinc-500 dark:text-zinc-400">
          Próximamente podrás reservar tu pista aquí.
        </p>
      </main>
    </div>
  );
}
