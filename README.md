# EAC4 Garatge compremelteucotxe.cat 

Benvinguts al garatge de compremelteucotxe.cat, afegeix la matrícula del teu cotxe i el kilometratge per a obtenir un preu de venda fascinant.

*Utilitzem comunicació asíncrona (AJAX) amb servidor Node.js i SQLite.*

## Instruccions d'execució
1. Instal·lar dependències: `npm install express sqlite3 cors`
2. Executar el servidor: `node server.js`
3. Obrir `index.html` al navegador.

## Característiques base de l'applicació
* Possibilitat d'incorporar un vehicle nou.
* Verificació de vehicle ja existent mitjançant matrícula.
* Modificació del kilometratge del vehicle.
* Eliminació d'un vehicle.

## Característiques extres
* S'ha inclós un sistema de detecció i avís de la connexió al servidor per a saber, de manera totalment visual, si es disposa o no de connexió.
* S'ha inclós un sistema de validació de matrícules mitjançant comprovació caràcter per caràcter, per a saber si s'està introduïnt una matrícula espanyola vàlida.
* S'ha ordenat el llistat de vehicles automàticament de manera que l'últim afegit et surt just a sota.
* S'ha inclós un sistema de valoració de vehicles totalment fiable en funció del kilometratge.