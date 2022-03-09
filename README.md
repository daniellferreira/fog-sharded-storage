# Sharded Fog Node

Este repositório define cada fog node com seus serviços básicos.

# TODO
- Criar doc de configuração do sharding no banco
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
    {_id: 0, host: "cfg-svr1:27017"}, 
    {_id: 1, host: "cfg-svr2:27017"}
  ]
})'
```
### Shard
```sh
echo "setting up fog node shard server..."
mongosh mongodb://127.0.0.1:50001 --eval 'rs.initiate({
  _id: "shardrs<FOG_NODE_ID>", 
  members: [
    {_id: 0, host: "shard-svr1:27017"}, 
    {_id: 1, host: "shard-svr2:27017"}
  ]
})'
```

### Mongos
```sh
echo "setting up fog node router (mongos)..."
mongosh mongodb://127.0.0.1:60000 --eval 'sh.addShard(
  "shardrs<FOG_NODE_ID>/shard-svr1:27017,shard-svr2:27017"
)'
```

# Enabling Sharding in a database and collection
```sh
mongosh mongodb://127.0.0.1:60000/<FOG_NODE_ID>_data --eval '
  sh.enableSharding("<FOG_NODE_ID>_data");
  sh.shardCollection("<FOG_NODE_ID>_data.user_movements", { shard_server: 1 });
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
sh.status()
```


