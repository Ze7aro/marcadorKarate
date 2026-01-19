import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface Competidor {
  id: number;
  Nombre: string;
  Edad: number;
  Categoria?: string;
  TituloCategoria?: string;
  PuntajeFinal?: number | null;
  PuntajesJueces?: (string | null)[];
  Kiken?: boolean;
}

export interface CompetidorKataDB {
  nombre: string;
  edad: number;
  puntajeFinal: number | null;
  puntajesJueces: number[];
  descalificado: boolean;
}

export interface CompetenciaKata {
  id?: number;
  nombre: string;
  fecha: string;
  area: string;
  categoria: string;
  competidores: CompetidorKataDB[];
}

export interface Match {
  pair: (Competidor | string)[];
  winner?: Competidor | string | null;
}

export type Oponente = "aka" | "shiro";
