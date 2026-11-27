import { describe, expect, it } from 'vitest'
import { semErros, validarCadastro, validarLogin } from './validacao'

const cadastro = { nome: 'Pessoa', email: 'pessoa@example.com', senha: 'Senha123', telefone: '' }

describe('validação de autenticação e limites', () => {
  it('aceita login válido e identifica cada campo obrigatório', () => {
    expect(validarLogin({ email: ' pessoa@example.com ', senha: 'Senha123' })).toEqual({})
    expect(validarLogin({ email: ' ', senha: '' })).toHaveProperty('email')
    expect(validarLogin({ email: 'invalido', senha: 'Senha123' })).toHaveProperty('email')
    expect(validarLogin({ email: cadastro.email, senha: '' })).toHaveProperty('senha')
    expect(semErros({})).toBe(true)
    expect(semErros({ email: 'Inválido' })).toBe(false)
  })

  it('aceita limites válidos e telefone opcional', () => {
    expect(validarCadastro(cadastro)).toEqual({})
    expect(validarCadastro({ ...cadastro, nome: 'a'.repeat(100), email: 'a'.repeat(138) + '@example.com', senha: 's'.repeat(72), telefone: '1'.repeat(20) })).toEqual({})
    expect(validarCadastro({ ...cadastro, nome: ' Pessoa ', telefone: undefined })).toEqual({})
  })

  it.each([
    ['nome', ' '], ['nome', 'a'.repeat(101)], ['email', ' '], ['email', 'inválido'],
    ['email', 'a'.repeat(139) + '@example.com'], ['senha', ''], ['senha', 's'.repeat(7)],
    ['senha', 's'.repeat(73)], ['telefone', '1'.repeat(21)],
  ])('recusa %s fora do contrato', (campo, valor) => {
    expect(validarCadastro({ ...cadastro, [campo]: valor })).toHaveProperty(campo)
  })
})
