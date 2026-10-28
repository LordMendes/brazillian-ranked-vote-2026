# Enquete de voto ranqueado — Presidência 2026

Enquete cívica **não oficial**. Não é a urna do TSE, não apura a eleição oficial e não substitui o voto depositado na urna eletrônica.

O 1º turno oficial de 2026 teve 13 candidaturas. O 2º turno oficial foi entre Lula (13) e Flávio Bolsonaro (22). Quem não votou em um desses dois precisou escolher de novo, ou o voto do 1º turno não seguiu para a decisão final.

Aqui o campo é o mesmo do 1º turno, mas uma única ordem substitui os turnos. A apuração elimina e transfere até alguém ter maioria. O método é o segundo turno instantâneo (instant-runoff voting, IRV).

## Como a conta funciona

Cada cédula é uma ordem de preferência. Não é obrigatório ordenar os 13 nomes: entra só quem a pessoa incluir.

1. O voto conta para a primeira preferência que ainda está na disputa.
2. Se alguém passa de metade das cédulas ainda ativas, essa pessoa vence. A maioria é metade mais um, não o primeiro lugar simples.
3. Sem maioria, sai quem tem menos votos na rodada.
4. A cédula de quem saiu passa para a próxima preferência que ainda disputa. Quem ficou de fora da ordem nunca recebe esse voto.
5. Se a lista acaba antes do fim, a cédula se esgota e deixa de entrar no cálculo da maioria.

Empate na eliminação: menos votos na rodada, depois menos primeiras preferências no total, depois o número de urna maior.

## O que a cédula pede

- **Ordem ranqueada** — define o vencedor da enquete.
- **Voto oficial do 1º turno** e **do 2º turno** — opcionais e autodeclarados. Não entram na conta IRV. Servem só para o agregado de migração: cruzar o voto declarado na eleição oficial com a 1ª preferência desta enquete.

Respostas aceitas no voto oficial: candidato do campo correspondente, `branco`, `nulo` ou `nao-votei`. No 2º turno, os candidatos são só Lula e Flávio Bolsonaro. Deixar em branco significa que a pessoa não respondeu.

## Quem participa

O acesso à cédula exige um link enviado por e-mail. O link vale 15 minutos e é de uso único. A sessão depois do link dura 30 minutos. Se a sessão acabar antes do envio, o mesmo e-mail pode pedir outro link. O endereço só fica impedido de votar de novo depois que o voto é gravado.

A unicidade é por endereço, não por título de eleitor. O sistema não confirma que a pessoa votou na eleição oficial nem que o e-mail pertence a um eleitor. Aliases com `+` são ignorados; no Gmail, pontos no nome e o domínio `googlemail.com` contam como o mesmo endereço.

Em produção, a página só abre para acessos cujo país o navegador classifica como Brasil (lookup do IP público da conexão do visitante, não do servidor). O IP não é gravado com o voto. Há limite de tentativas por IP e por e-mail para reduzir abuso; esse controle fica em memória do processo e expira.

## O que fica gravado

Três tabelas, sem chave estrangeira entre participação e cédula.

| Tabela | O que guarda | Por quanto tempo |
| --- | --- | --- |
| `acessos_pendentes` | Hash do link e o e-mail criptografado (AES-256-GCM), só para entregar a sessão | Até o link ser usado ou expirar (15 min); a linha é apagada |
| `participantes_verificados` | HMAC-SHA256 do e-mail canônico e o instante da participação | Enquanto a enquete existir |
| `votos_computados` | Ranking, voto oficial opcional do 1º e do 2º turno, UUID aleatório e horário truncado à hora (UTC) | Enquanto a enquete existir |

O texto do e-mail não entra na cédula. Durante a sessão ele fica só no cookie `enquete_sessao` (httpOnly, criptografado, 30 minutos). O cookie `enquete_consentimento` registra que a pessoa aceitou este aviso; não identifica o voto.

O resultado público (`/resultado`) mostra totais: cédulas, rodadas do IRV e a migração agregada. Nenhuma cédula individual é exibida.

## Limites deste sigilo

O aplicativo não grava um vínculo entre o hash do e-mail e a cédula. Isso não é anonimato contra quem administra o banco.

- Quem tem o segredo do servidor pode recalcular o HMAC de um e-mail conhecido e saber se aquele endereço já votou. Não há, no esquema, uma coluna que diga qual foi o ranking.
- As duas linhas (participação e cédula) são escritas na mesma transação. O horário da participação é o instante exato; o da cédula é truncado à hora. Quem lê o banco ou os logs do banco pode tentar associar inserções próximas. O desenho reduz o vínculo no aplicativo; não o torna impossível para o operador.
- O voto oficial é declaração da própria pessoa. Não há checagem com o TSE.
- Provedor de e-mail, hospedagem e quem opera o servidor enxergam metadados de entrega e de acesso fora destas tabelas. O código não pede para registrar corpo de requisição, e-mail, token ou IP nos logs da aplicação.

Nada disso é vendido ou compartilhado pelo aplicativo. O código-fonte está em [github.com/LordMendes/brazillian-ranked-vote-2026](https://github.com/LordMendes/brazillian-ranked-vote-2026).

Fotos de urna: TSE (CC BY). O logotipo identifica a legenda e não é endosso.
