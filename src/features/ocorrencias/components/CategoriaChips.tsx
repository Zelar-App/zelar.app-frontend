import type { Categoria } from '../../../domain/types'
import { CATEGORIAS, rotuloCategoria } from '../../../domain/constantes'
import { Chip } from '../../../shared/ui'
import { ICONE_CATEGORIA } from '../icones'

export interface CategoriaChipsProps {
  valor: Categoria | null
  aoMudar: (c: Categoria) => void
  erro?: string | null
}

export function CategoriaChips({ valor, aoMudar, erro }: CategoriaChipsProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium text-text-muted">Categoria</legend>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Categoria">
        {CATEGORIAS.map((c) => {
          const Icone = ICONE_CATEGORIA[c]
          return (
            <Chip key={c} selecionado={valor === c} onClick={() => aoMudar(c)} icone={<Icone className="size-4" aria-hidden="true" />}>
              {rotuloCategoria(c)}
            </Chip>
          )
        })}
      </div>
      {erro && (
        <p role="alert" className="text-sm text-danger">
          {erro}
        </p>
      )}
    </fieldset>
  )
}
