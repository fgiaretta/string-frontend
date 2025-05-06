# Associação de Máquinas de Estados a Businesses

Este documento descreve a implementação da funcionalidade de associação de máquinas de estados a businesses no sistema.

## Arquivos Implementados

1. `src/services/businessService.ts` - Serviço para gerenciar operações relacionadas a businesses
2. `src/pages/BusinessStateMachineAssociation.tsx` - Página para associar máquinas de estados a businesses
3. `src/pages/StateMachinesUpdated.tsx` - Página de listagem de máquinas de estados atualizada para mostrar associações

## Funcionalidades Implementadas

### 1. Serviço de Business

O serviço `businessService.ts` implementa as seguintes funcionalidades:

- `getBusinesses()`: Obter todos os businesses
- `getBusiness(id)`: Obter um business específico
- `associateStateMachine(businessId, stateMachineConfigId)`: Associar uma máquina de estados a um business
- `removeStateMachineAssociation(businessId)`: Remover a associação de uma máquina de estados de um business

### 2. Página de Associação

A página `BusinessStateMachineAssociation.tsx` permite:

- Selecionar um business e uma máquina de estados para associá-los
- Visualizar todas as associações existentes em uma tabela
- Remover associações existentes

### 3. Página de Listagem de Máquinas de Estados

A página `StateMachinesUpdated.tsx` foi atualizada para:

- Mostrar quais businesses estão associados a cada máquina de estados
- Impedir a exclusão de máquinas de estados que estão associadas a businesses
- Adicionar um botão para navegar para a página de associação

## Rotas Adicionadas

Foi adicionada a seguinte rota ao sistema:

- `/state-machines/associate`: Página para gerenciar associações entre máquinas de estados e businesses

## Menu de Navegação

O menu de navegação foi atualizado para incluir:

- Submenu "State Machines" com as opções:
  - "All State Machines": Lista todas as máquinas de estados
  - "Business Associations": Gerencia associações com businesses

## Como Usar

### Associar uma Máquina de Estados a um Business

1. Navegue para "State Machines" > "Business Associations"
2. Selecione um business no dropdown
3. Selecione uma máquina de estados no dropdown
4. Clique em "Associate"

### Remover uma Associação

1. Navegue para "State Machines" > "Business Associations"
2. Na tabela de associações, clique no ícone de lixeira ao lado da associação que deseja remover

### Visualizar Businesses Associados a uma Máquina de Estados

1. Navegue para "State Machines" > "All State Machines"
2. Na coluna "Associated Businesses" você verá chips com os nomes dos businesses associados a cada máquina de estados

## Validações Implementadas

- Não é possível excluir uma máquina de estados que está associada a um ou mais businesses
- Não é possível associar uma máquina de estados a um business que já possui uma associação (é necessário remover a associação existente primeiro)
- Validações de formulário para garantir que todos os campos obrigatórios sejam preenchidos

## Próximos Passos

- Implementar filtros para buscar máquinas de estados por business
- Adicionar visualização detalhada das associações
- Implementar validações adicionais para garantir a integridade dos dados
