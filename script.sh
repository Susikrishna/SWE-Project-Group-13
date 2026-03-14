#!/bin/bash

(cd ./backend/services/role-service/src && npm run dev) &
(cd ./backend/services/registry-service/src && npm run dev) &
(cd ./frontend/Admin-Role-Creation/src && npm run dev) &
(cd ./frontend/Admin-Registry-Management/src && npm run dev) &

wait