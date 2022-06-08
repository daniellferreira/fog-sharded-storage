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
mongosh mongodb://127.0.0.1:43011 --eval 'rs.initiate({
  _id: "cfgrs301",
  configsvr: true,
  members: [
    {_id: 0, host: "301-cfg-svr1:27017"},
    {_id: 1, host: "301-cfg-svr2:27017"}
  ]
})'
```

```sh
echo "setting up fog node config server..."
mongosh mongodb://127.0.0.1:43021 --eval 'rs.initiate({
  _id: "cfgrs302",
  configsvr: true,
  members: [
    {_id: 0, host: "302-cfg-svr1:27017"},
    {_id: 1, host: "302-cfg-svr2:27017"}
  ]
})'
```

### Shard

```sh
echo "setting up fog node shard server..."
mongosh mongodb://127.0.0.1:53011 --eval 'rs.initiate({
  _id: "shardrs301",
  members: [
    {_id: 0, host: "301-shard-svr1:27017"},
    {_id: 1, host: "301-shard-svr2:27017"}
  ]
})'
```

```sh
mongosh mongodb://127.0.0.1:53021 --eval 'rs.initiate({
  _id: "shardrs302",
  members: [
    {_id: 0, host: "302-shard-svr1:27017"},
    {_id: 1, host: "302-shard-svr2:27017"}
  ]
})'
```

### Mongos

```sh
echo "setting up fog node router (mongos)..."
mongosh mongodb://127.0.0.1:63011 --eval '
  sh.addShard("shardrs301/301-shard-svr1:27017,301-shard-svr2:27017");
  sh.addShard("shardrs302/302-shard-svr1:27017,302-shard-svr2:27017");
'
```

```sh
echo "setting up fog node router (mongos)..."
mongosh mongodb://127.0.0.1:63021 --eval '
  sh.addShard("shardrs301/301-shard-svr1:27017,301-shard-svr2:27017");
  sh.addShard("shardrs302/302-shard-svr1:27017,302-shard-svr2:27017");
'
```

# Dentro do mongos

Habilitar sharding no database e collection

```sh
mongosh mongodb://127.0.0.1:63011/shard_data --eval '
  sh.enableSharding("shard_data");
  sh.shardCollection("shard_data.user_movements", { shard_server: 1 });
'
mongosh mongodb://127.0.0.1:63021/shard_data --eval '
  sh.enableSharding("shard_data");
  sh.shardCollection("shard_data.user_movements", { shard_server: 1 });
'
```

Configurando as zonas de dados

```sh
mongosh mongodb://127.0.0.1:63011/shard301_data --eval '
  while (sh.isBalancerRunning().inBalancerRound) sh.disableBalancing("shard301_data");

  sh.addShardTag("shardrs301", "ZONE_S301");
  sh.addTagRange(
    "shard301_data.user_movements",
    { shard_server: 301 },
    { shard_server: 301 + 1 },
    "ZONE_S301"
  );

    while (!sh.isBalancerRunning().inBalancerRound) sh.enableBalancing("shard301_data");
'
mongosh mongodb://127.0.0.1:63021/shard302_data --eval '
  while (sh.isBalancerRunning().inBalancerRound) sh.disableBalancing("shard302_data");

  sh.addShardTag("shardrs302", "ZONE_S302");
  sh.addTagRange(
    "shard302_data.user_movements",
    { shard_server: 302 },
    { shard_server: 302 + 1 },
    "ZONE_S302"
  );

    while (!sh.isBalancerRunning().inBalancerRound) sh.enableBalancing("shard302_data");
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
