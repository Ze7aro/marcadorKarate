import { Accordion, AccordionItem, Card, CardBody } from "@heroui/react";
import { Round } from "@/context/KataContext";

export default function KataRoundHistory({ rounds }: { rounds: Round[] }) {
  if (rounds.length === 0) return null;

  return (
    <div className="mb-6 space-y-4">
      <h2 className="app-section-title">Historial de Rondas</h2>
      {rounds.map((round) => (
        <Card key={round.id} className="app-panel rounded-[1.5rem]">
          <CardBody className="p-0">
            <div className="flex justify-between items-center p-4">
              <div>
                <h3 className="text-lg font-bold text-white">{round.nombre}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(round.fecha).toLocaleTimeString()}<br />
                  {round.competidores.length} Competidores
                </p>
              </div>
              <Accordion>
                <AccordionItem
                  key="details"
                  aria-label={`Ver detalles de ${round.nombre}`}
                  classNames={{ indicator: "text-sky-400 text-xl mr-3" }}
                  title={<span className="px-3 text-primary text-sm font-semibold">Ver Detalles / Descomprimir</span>}
                >
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr><th className="px-4 py-3">#</th><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Puntajes</th><th className="px-4 py-3 text-right">Total</th></tr>
                      </thead>
                      <tbody>
                        {round.competidores.map((competitor, index) => (
                          <tr key={competitor.id} className="border-b dark:border-gray-700">
                            <td className="px-4 py-3 font-medium text-white">{index + 1}</td>
                            <td className="px-4 py-3 font-medium text-white">{competitor.Nombre}</td>
                            <td className="px-4 py-3"><div className="flex gap-1">{competitor.PuntajesJueces?.map((score, scoreIndex) => <span key={scoreIndex} className="px-2 py-0.5 bg-gray-200 text-black rounded text-xs">{score}</span>)}</div></td>
                            <td className="px-4 py-3 text-right font-bold text-green-600 dark:text-green-400">{competitor.PuntajeFinal?.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </AccordionItem>
              </Accordion>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
