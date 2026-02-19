# Como Funciona a Pesquisa de Cidades

## Estrutura Criada

### 1. **Base de Dados Mockada** (`src/data/cities.ts`)
Este arquivo contém:
- Interface `CityData`: define a estrutura dos dados de cada cidade
- Interface `Listing`: define a estrutura de cada alojamento
- Objeto `citiesData`: contém dados de várias cidades (Londres, Lisboa, Porto, Paris)
- Funções auxiliares para buscar dados

**Como adicionar uma nova cidade:**
```typescript
'nome-cidade': {
  name: 'Nome Cidade',
  country: 'País',
  averagePrice: 100,
  averageNights: 30,
  rating: 4.5,
  mapImage: '/maps/cidade.png',
  listings: [
    {
      id: 1,
      title: 'Título do alojamento',
      type: 'Apartamento',
      image: '/listings/foto.jpg',
      city: 'Nome Cidade'
    }
  ]
}
```

### 2. **Nova View CityView.vue** (`src/views/CityView.vue`)
Esta página mostra:
- **Sidebar esquerda**: Filtros e grid de alojamentos
- **Card direito**: Mapa da cidade, estatísticas e botões

**Funcionalidades:**
- Filtros por tipo de habitação e preço
- Grid responsivo de alojamentos
- Informações da cidade (preço médio, noites, avaliação)
- Tratamento de erro se cidade não existe

### 3. **Rota Dinâmica** (`src/router/index.ts`)
```typescript
{
  path: '/city/:city',
  name: 'city',
  component: CityView
}
```
O `:city` é um parâmetro dinâmico que captura o nome da cidade.

### 4. **Funcionalidade de Pesquisa** (`HomeView.vue`)
Adicionado:
- `v-model="searchQuery"` no input
- `@keyup.enter="handleSearch"` para pesquisar ao pressionar Enter
- `@click="handleSearch"` no botão da lupa
- Função `handleSearch()` que redireciona para `/city/nome-da-cidade`

## Como Usar

### Para testar:
1. Na home page, digite uma cidade: **londres**, **lisboa**, **porto** ou **paris**
2. Pressione Enter ou clique na lupa 🔍
3. Você será redirecionado para `/city/londres` (por exemplo)

### Para adicionar mais cidades:
1. Abra `src/data/cities.ts`
2. Adicione nova entrada no objeto `citiesData`
3. Coloque imagens em:
   - `/public/maps/` para mapas da cidade
   - `/public/listings/` para fotos de alojamentos

### Para adicionar mais alojamentos:
Dentro do array `listings` de cada cidade, adicione:
```typescript
{
  id: (número único),
  title: 'Nome do alojamento',
  type: 'Apartamento' | 'Casa' | 'Quarto' | 'Alojamento',
  image: '/listings/foto.jpg',
  city: 'Nome da Cidade'
}
```

## Melhorias Futuras Possíveis

1. **Autocomplete**: Sugerir cidades enquanto digita
2. **Busca fuzzy**: Encontrar cidades mesmo com typos
3. **Integração com API real**: Substituir dados mockados por API
4. **Filtros avançados**: Mais opções de filtro (preço específico, avaliação, etc)
5. **Detalhes do alojamento**: Clicar em um alojamento abre página de detalhes
6. **Favoritos**: Salvar alojamentos favoritos
7. **Comparação**: Comparar múltiplas cidades

## Estrutura de Arquivos

```
src/
├── data/
│   └── cities.ts          # Base de dados mockada
├── views/
│   ├── HomeView.vue       # Página inicial com pesquisa
│   └── CityView.vue       # Página de detalhes da cidade
├── router/
│   └── index.ts           # Rotas (incluindo rota dinâmica)
└── components/
    └── NavBar.vue         # Barra de navegação

public/
├── maps/                  # Imagens de mapas das cidades
└── listings/              # Fotos dos alojamentos
```

## Fluxo de Dados

1. Usuário digita cidade → `searchQuery` atualizado
2. Usuário pressiona Enter/Lupa → `handleSearch()` executado
3. Router navega para `/city/nome-cidade`
4. `CityView.vue` monta → pega parâmetro `city` da URL
5. Busca dados em `cities.ts` → `getCityData(cityName)`
6. Renderiza dados ou mostra erro se cidade não existe
7. Filtros aplicados → `filteredListings` atualizado
