#!/bin/bash

echo "setting up fog node config server..."
mongosh mongodb://127.0.0.1:40001 --eval 'rs.initiate({
  _id: "cfgrs1", 
  configsvr: true, 
  members: [
    {_id: 0, host: "cfg-svr1:27017"}, 
    {_id: 1, host: "cfg-svr2:27017"}
  ]
})'

echo "setting up fog node shard server..."
mongosh mongodb://127.0.0.1:50001 --eval 'rs.initiate({
  _id: "shardrs1", 
  members: [
    {_id: 0, host: "shard-svr1:27017"}, 
    {_id: 1, host: "shard-svr2:27017"}
  ]
})'

echo "setting up fog node router (mongos)..."
mongosh mongodb://127.0.0.1:60000 --eval 'sh.addShard(
  "shardrs1/shard-svr1:27017,shard-svr2:27017"
)'