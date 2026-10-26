#!/bin/bash
# Doppelklick startet die Tombola über einen lokalen Server (damit localStorage zuverlässig bleibt)
cd "$(dirname "$0")"
(sleep 1 && open "http://localhost:8000") &
exec python3 -m http.server 8000
