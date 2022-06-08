# Sharded Fog Node

Este repositório define cada fog node com seus serviços básicos.

# TODO

- Fazer um segundo cluster
- Conectar dois clusters
- Adicionar dados nos dois clusters

# Setup

### Config Server

```sh
echo "setting up fog node config server..."
mongosh mongodb://127.0.0.1:40001 --eval 'rs.initiate({
  _id: "cfgrs<FOG_NODE_ID>",
  configsvr: true,
  members: [
    {_id: 0, host: "<FOG_NODE_ID>-cfg-svr1:27017"},
    {_id: 1, host: "<FOG_NODE_ID>-cfg-svr2:27017"}
  ]
})'
```

### Shard

```sh
echo "setting up fog node shard server..."
mongosh mongodb://127.0.0.1:50001 --eval 'rs.initiate({
  _id: "shardrs<FOG_NODE_ID>",
  members: [
    {_id: 0, host: "<FOG_NODE_ID>-shard-svr1:27017"},
    {_id: 1, host: "<FOG_NODE_ID>-shard-svr2:27017"}
  ]
})'
```

### Mongos

```sh
echo "setting up fog node router (mongos)..."
mongosh mongodb://127.0.0.1:60000 --eval 'sh.addShard(
  "shardrs<FOG_NODE_ID>/<FOG_NODE_ID>-shard-svr1:27017,<FOG_NODE_ID>-shard-svr2:27017"
)'
```

# Dentro do mongos

Habilitar sharding no database e collection

```sh
mongosh mongodb://127.0.0.1:60000/shard<FOG_NODE_ID>_data --eval '
  sh.enableSharding("shard<FOG_NODE_ID>_data");
  sh.shardCollection("shard<FOG_NODE_ID>_data.user_movements", { shard_server: 1 });
'
```

Configurando as zonas de dados

```sh
mongosh mongodb://127.0.0.1:60000/shard<FOG_NODE_ID>_data --eval '
  while (sh.isBalancerRunning().inBalancerRound) sh.disableBalancing("shard<FOG_NODE_ID>_data");

  sh.addShardTag("shardrs<FOG_NODE_ID>", "ZONE_S<FOG_NODE_ID>");
  sh.addTagRange(
    "shard<FOG_NODE_ID>_data.user_movements",
    { shard_server: <FOG_NODE_ID> },
    { shard_server: <FOG_NODE_ID> + 1 },
    "ZONE_S<FOG_NODE_ID>"
  );

    while (!sh.isBalancerRunning().inBalancerRound) sh.enableBalancing("shard<FOG_NODE_ID>_data");
'
```

## Comandos Úteis

### Docker

Para subir o cluster

```sh
docker-compose up -d
```

Para remover e remover os containers, redes, volumes e imagens criados pelo comando 'up' (flag -v para remover os volumes declarados)

```sh
docker-compose down -v
```

### Mongo Shell

Para verificar o sharding funcionando

```js
sh.status();
```
