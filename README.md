# POC: Custom Cache Handler com Redis

Esta prova de conceito demonstra como configurar um **custom cache handler** no Next.js para armazenar o cache do servidor em Redis, em vez de depender apenas do armazenamento local da aplicação.

A aplicação de exemplo consulta posts e comentários da [JSONPlaceholder](https://jsonplaceholder.typicode.com/). As requisições usam tags e revalidação temporal; a implementação do handler grava as entradas no Redis, aplica TTL e mantém índices de tags para permitir a invalidação.

> Esta é uma POC para exploração. Não representa, por si só, uma configuração pronta para produção ou um deployment Kubernetes.

## Pré-requisitos

- Node.js compatível com a versão do Next.js do projeto
- [pnpm](https://pnpm.io/)
- [Docker Compose](https://docs.docker.com/compose/)

## Executar localmente

Na raiz do projeto, instale as dependências, inicie o Redis e suba o servidor Next.js:

```bash
pnpm install
docker compose up -d redis
pnpm dev
```

Abra [http://localhost:3000/posts](http://localhost:3000/posts) para acessar a demonstração. O serviço Redis local é definido em `docker-compose.yml` e, por padrão, exige a senha `admin`.

Para encerrar o Redis iniciado pelo Compose:

```bash
docker compose down
```

## O que testar

1. Acesse a lista de posts em `/posts` e navegue entre as páginas.
2. Abra um post para consultar seus detalhes e comentários.
3. Use **Delete cache example** na lista. O botão chama uma Server Action que revalida a tag da consulta da página atual.
4. Faça a consulta novamente e observe o comportamento após a revalidação.

Os dados vêm de uma API externa; portanto, o exemplo demonstra o ciclo de cache e invalidação, não a edição de conteúdo persistido.

## Como o handler funciona

O `next.config.ts` registra `cache-handler.js` pela opção singular `cacheHandler` do Next.js. O handler usa `ioredis` para:

- ler e gravar entradas no Redis;
- definir o TTL com base no tempo de revalidação ou no TTL padrão;
- associar entradas às tags informadas pelo Next.js;
- remover do Redis as entradas associadas a uma tag invalidada.

As chamadas `fetch` do exemplo definem tags e revalidação temporal. A opção `cacheHandler` singular usada aqui atende o cache do servidor do Next.js; ela não configura os handlers das diretivas `'use cache'`, que usam a configuração plural `cacheHandlers`.

## Configuração do Redis

O handler aceita estas variáveis de ambiente:

| Variável              | Padrão                   | Descrição                                                          |
| --------------------- | ------------------------ | ------------------------------------------------------------------ |
| `REDIS_URL`           | `redis://localhost:6379` | URL ou endereço do Redis.                                          |
| `REDIS_PASSWORD`      | `admin`                  | Senha usada na conexão.                                            |
| `KEY_PREFIX`          | `next:cache:`            | Prefixo das chaves de cache e dos índices de tags.                 |
| `DEFAULT_TTL_SECONDS` | `86400`                  | TTL padrão, em segundos, quando a entrada não informa outro valor. |

Os valores padrão correspondem ao Redis local do `docker-compose.yml` e são apenas para desenvolvimento.

## Intenção para múltiplas réplicas

A motivação para usar um armazenamento externo é permitir que várias réplicas da aplicação — por exemplo, pods em Kubernetes — consultem o mesmo cache e compartilhem as invalidações. Para isso, todas precisam apontar para o **mesmo serviço Redis acessível pela rede**, usando configurações compatíveis de conexão e prefixo de chaves.

O Compose deste repositório serve somente para execução local; ele não provisiona Redis de produção nem configura pods. Além disso, a documentação da versão instalada do Next.js recomenda configurar `cacheMaxMemorySize: 0` quando se deseja evitar uma cópia local do cache por instância. Essa opção não está habilitada nesta POC e deve ser avaliada ao preparar um deployment realmente compartilhado. Consulte a [documentação do custom cache handler do Next.js](https://nextjs.org/docs/app/api-reference/config/next-config-js/incrementalCacheHandlerPath).
