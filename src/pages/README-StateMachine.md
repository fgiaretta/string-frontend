# Atualização da Máquina de Estados

Este documento descreve as alterações realizadas na implementação da máquina de estados para se adequar à nova API.

## Arquivos Atualizados

1. `src/services/stateMachineServiceUpdated.ts` - Serviço atualizado para a nova API
2. `src/pages/StateMachineFormUpdated.tsx` - Formulário atualizado para a nova API
3. `src/pages/StateMachinesUpdated.tsx` - Lista de máquinas de estado atualizada

## Principais Alterações

### 1. Alteração de Campos

- O campo `description` foi renomeado para `instructions` em todos os estados
- Os endpoints da API foram atualizados para usar `/state-machine-config` em vez de `/state-machine/configurations`
- Adicionados campos `createdAt` e `updatedAt` para exibição na interface

### 2. Novos Endpoints

Implementados os seguintes endpoints adicionais:

- `POST /state-machine-config/{configId}/state` - Adicionar um estado
- `PUT /state-machine-config/{configId}/state/{stateName}` - Atualizar um estado específico
- `DELETE /state-machine-config/{configId}/state/{stateName}` - Remover um estado
- `POST /state-machine-config/{configId}/transition` - Adicionar uma transição
- `DELETE /state-machine-config/{configId}/transition` - Remover uma transição

### 3. Alterações na Interface

- Campo de texto para instruções agora tem mais linhas para acomodar instruções detalhadas
- Texto de ajuda atualizado para refletir o propósito do campo de instruções
- Adaptação do Grid para Material UI v7 usando `sx={{ width: { xs: '100%', md: '50%' } }}` em vez de `xs={12} md={6}`

## Como Usar os Novos Arquivos

Para implementar as alterações:

1. Substitua o arquivo `src/services/stateMachineService.ts` pelo novo `stateMachineServiceUpdated.ts`
2. Substitua o arquivo `src/pages/StateMachineForm.tsx` pelo novo `StateMachineFormUpdated.tsx`
3. Substitua o arquivo `src/pages/StateMachines.tsx` pelo novo `StateMachinesUpdated.tsx`
4. Atualize quaisquer importações nos outros arquivos para refletir as alterações

## Exemplo de Uso

```typescript
// Exemplo de criação de uma máquina de estados
const createStateMachine = async () => {
  const stateMachineData = {
    name: "Atendimento ao Cliente",
    initialState: "saudacao",
    states: [
      {
        name: "saudacao",
        instructions: "Cumprimente o cliente de forma cordial e pergunte como pode ajudar. Use um tom amigável e profissional.",
        actions: ["enviarMensagem", "registrarInteracao"],
        criticality: "medium"
      },
      {
        name: "identificacao",
        instructions: "Solicite informações para identificar o cliente, como nome completo e e-mail. Explique que essas informações são necessárias para um melhor atendimento.",
        actions: ["solicitarDados", "validarDados"],
        criticality: "high"
      }
    ],
    transitions: [
      {
        fromState: "saudacao",
        toState: "identificacao",
        condition: "clienteRespondeu"
      }
    ]
  };

  try {
    const response = await stateMachineService.createConfiguration(stateMachineData);
    console.log('Máquina de estados criada:', response);
    return response;
  } catch (error) {
    console.error('Erro ao criar máquina de estados:', error);
    throw error;
  }
};
```
