#!/bin/bash
echo '1 count'
a=$(find . -regex '[^_]*.md' -exec cat {} \;|sed -r 's/|[+]|[@]|[~]|[*]|[//(]|[//)]|[|]|[`]|[#]|[:]|[;]|[=]|[-]|[___]|["]|[¥]|[.]|[?]|[!]|[&]|[^[\u4E00-\u9FA5A-Za-z0-9_]+$]|[<]|[>]|[/]|[0-9]|[a-z]|[A-Z]|[%]//g' | sed -r 's/[[:space:]]//g' | sed '/^$/d' | wc -m)
echo '2 update'
sed -i "s|本站总字数.*字|本站总字数：$a字|g" ./_coverpage.md
echo '3 done'
