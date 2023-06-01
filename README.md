1. Выполнить ```npm install```
2. Выполнить ```npm run build```
3. Выполнить ```echo "DB_URI={сюда подставить адрес MongoDB с указанием базы и replica set}" > ./dist/.env```
4. Выполнить ```node ./dist/app``` - для запуска app
5. Выполнить ```node ./dist/sync``` - для запуска sync в режиме реалтайм синхронизации
6. Выполнить ```node ./dist/sync --full-reindex``` - для запуска sync в режиме полной синхронизации