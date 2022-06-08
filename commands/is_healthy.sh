#!/bin/bash

OK=$(mongosh mongodb://localhost:60000 --eval 'db.runCommand("ping").ok' --quiet)

if [ $OK = 1 ]; then
    echo "Ta no ar"
else
    echo "Ainda não"
fi