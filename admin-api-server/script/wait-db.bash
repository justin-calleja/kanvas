#!/usr/bin/env bash

while ! psql -c 'select 1' >/dev/null 2>&1 ; do
    echo not up yet..
    sleep 1
done